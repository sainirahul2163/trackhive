"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { CmdKSearch } from "@/components/ui/cmd-search"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Eye, Megaphone, DollarSign, AlertTriangle,
  TrendingUp, Play, Plus, RefreshCw,
  Users, ArrowUpRight,
} from "lucide-react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts"
import { createBrowserClient } from "@supabase/ssr"
import { useUser } from "@/lib/use-user"

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardMetrics {
  totalViews:      number
  activeCampaigns: number
  pendingPayouts:  number
  creatorAlerts:   number   // accounts not synced in > 7 days
}

interface TopVideo {
  id:       string
  caption:  string
  creator:  string
  views:    number
  platform: string
}

interface DailyPoint {
  date:  string
  views: number
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────

interface TooltipProps { active?: boolean; payload?: Array<{ value: number }>; label?: string }
function ChartTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 shadow-xl">
      <p className="text-xs text-zinc-500 mb-2">{label}</p>
      <p className="text-sm font-semibold text-purple-400">{Number(payload[0]?.value).toLocaleString()} views</p>
    </div>
  )
}

// ─── Empty card ───────────────────────────────────────────────────────────────

function EmptyCard({ icon: Icon, title, desc, href, cta }: {
  icon: React.ElementType; title: string; desc: string; href: string; cta: string
}) {
  return (
    <div className="rounded-xl border border-dashed border-white/[0.1] bg-white/[0.02] p-8 flex flex-col items-center text-center gap-3">
      <div className="w-12 h-12 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center">
        <Icon className="w-5 h-5 text-purple-400" />
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-xs text-zinc-500 mt-0.5 max-w-xs">{desc}</p>
      </div>
      <Link href={href} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium transition-all">
        <Plus className="w-3.5 h-3.5" /> {cta}
      </Link>
    </div>
  )
}

// ─── Metric skeleton ──────────────────────────────────────────────────────────

function MetricSkeleton() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#111111] p-5">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="w-8 h-8 rounded-lg" />
      </div>
      <Skeleton className="h-7 w-16 mb-2" />
      <Skeleton className="h-3 w-28" />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useUser()
  const [metrics,    setMetrics]    = useState<DashboardMetrics | null>(null)
  const [topVideos,  setTopVideos]  = useState<TopVideo[]>([])
  const [chartData,  setChartData]  = useState<DailyPoint[]>([])
  const [loading,    setLoading]    = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async (userId: string) => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const accountsRes = await supabase
      .from("tracked_accounts")
      .select("id, total_views, last_synced_at")
      .eq("workspace_id", userId)

    const accountIds = (accountsRes.data ?? []).map((a: { id: string }) => a.id)

    const [campaignsRes, payoutsRes, videosRes, dailyRes] = await Promise.allSettled([
      supabase
        .from("campaigns")
        .select("id, status")
        .eq("workspace_id", userId)
        .eq("status", "active"),

      supabase
        .from("payouts")
        .select("amount")
        .eq("workspace_id", userId)
        .in("status", ["pending", "approved"]),

      accountIds.length > 0
        ? supabase
            .from("tracked_videos")
            .select("id, caption, views, platform, tracked_accounts(username)")
            .in("account_id", accountIds)
            .order("views", { ascending: false })
            .limit(5)
        : Promise.resolve({ data: [], error: null }),

      accountIds.length > 0
        ? supabase
            .from("video_daily_stats")
            .select("date, views")
            .in("account_id", accountIds)
            .gte("date", new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10))
            .order("date", { ascending: true })
        : Promise.resolve({ data: [], error: null }),
    ])

    // ── Metrics ──
    interface AccountRow { id: string; total_views: number; last_synced_at: string | null }
    const accounts = (accountsRes.data ?? []) as AccountRow[]
    const totalViews = accounts.reduce((s, a) => s + (a.total_views ?? 0), 0)

    const activeCampaigns = campaignsRes.status === "fulfilled"
      ? (campaignsRes.value.data ?? []).length : 0

    interface PayoutRow { amount: number }
    const pendingPayouts = payoutsRes.status === "fulfilled"
      ? (payoutsRes.value.data ?? []).reduce((s: number, p: PayoutRow) => s + (p.amount ?? 0), 0) : 0

    const sevenDaysAgo = Date.now() - 7 * 86400000
    const creatorAlerts = accounts.filter(
      (a) => !a.last_synced_at || new Date(a.last_synced_at).getTime() < sevenDaysAgo
    ).length

    setMetrics({ totalViews, activeCampaigns, pendingPayouts, creatorAlerts })

    // ── Top videos ──
    interface VideoRow {
      id: string
      caption: string | null
      views: number
      platform: string
      tracked_accounts: { username: string; workspace_id: string | null } | null
    }
    if (videosRes.status === "fulfilled") {
      const rows = (videosRes.value.data ?? []) as unknown as VideoRow[]
      setTopVideos(rows.map((v) => ({
        id:       v.id,
        caption:  v.caption ?? "Untitled",
        creator:  `@${v.tracked_accounts?.username ?? "unknown"}`,
        views:    v.views ?? 0,
        platform: v.platform,
      })))
    }

    // ── Chart data ──
    if (dailyRes.status === "fulfilled") {
      interface DailyRow { date: string; views: number }
      const rows = (dailyRes.value.data ?? []) as DailyRow[]
      // Group by date
      const byDate = new Map<string, number>()
      for (const r of rows) {
        byDate.set(r.date, (byDate.get(r.date) ?? 0) + r.views)
      }
      setChartData(Array.from(byDate.entries()).map(([date, views]) => ({
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        views,
      })))
    }
  }, [])

  useEffect(() => {
    if (!user) return
    setLoading(true)
    load(user.id).finally(() => setLoading(false))
  }, [user, load])

  async function handleRefresh() {
    if (!user) return
    setRefreshing(true)
    await load(user.id)
    setRefreshing(false)
  }

  function fmt(n: number) {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
    return n.toString()
  }

  const hasAnyData =
    (metrics?.totalViews ?? 0) > 0 ||
    (metrics?.activeCampaigns ?? 0) > 0 ||
    topVideos.length > 0

  return (
    <div className="space-y-6 max-w-7xl">
      <CmdKSearch />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-white tracking-tight">
            {user ? `Welcome back, ${user.displayName.split(" ")[0]}` : "Dashboard"}
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">Here&apos;s what&apos;s happening with your campaigns today.</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading || refreshing}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-zinc-400 text-xs hover:text-zinc-200 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Metric cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <MetricSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { title: "Total Views",       value: fmt(metrics?.totalViews      ?? 0), icon: Eye,           color: "text-blue-400",   bg: "bg-blue-500/10",   href: "/analytics",  empty: !metrics?.totalViews },
            { title: "Active Campaigns",  value: String(metrics?.activeCampaigns ?? 0), icon: Megaphone,  color: "text-purple-400", bg: "bg-purple-500/10", href: "/campaigns",  empty: !metrics?.activeCampaigns },
            { title: "Pending Payouts",   value: `$${fmt(metrics?.pendingPayouts  ?? 0)}`, icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10", href: "/payments", empty: !metrics?.pendingPayouts },
            { title: "Creator Alerts",    value: String(metrics?.creatorAlerts   ?? 0), icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10", href: "/analytics",  empty: false },
          ].map((m) => {
            const Icon = m.icon
            return (
              <Link key={m.title} href={m.href}
                className="rounded-xl border border-white/[0.06] bg-[#111111] p-5 hover:border-white/10 transition-colors group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{m.title}</span>
                  <div className={`w-8 h-8 rounded-lg ${m.bg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${m.color}`} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-2xl font-bold text-white tracking-tight">{m.value}</p>
                  {m.empty ? (
                    <p className="text-xs text-zinc-600">No data yet</p>
                  ) : (
                    <div className="flex items-center gap-1">
                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">View details →</span>
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Empty state — nothing tracked yet */}
      {!loading && !hasAnyData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <EmptyCard icon={Users}    title="No creators tracked yet" desc="Add a TikTok, Instagram, or YouTube account to start collecting analytics." href="/analytics" cta="Add your first creator" />
          <EmptyCard icon={Megaphone} title="No active campaigns"    desc="Create a campaign to assign creators, set budgets, and track performance." href="/campaigns/new" cta="Create your first campaign" />
          <EmptyCard icon={DollarSign} title="No payouts pending"    desc="Set up payout rules and pay creators automatically based on performance." href="/payments" cta="Set up creator payments" />
        </div>
      )}

      {/* Chart + data — only shown when there's real data */}
      {!loading && hasAnyData && (
        <>
          {/* Chart row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 rounded-xl border border-white/[0.06] bg-[#111111] p-5">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-[15px] font-semibold text-white">Views Overview</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">Last 30 days</p>
                </div>
                {chartData.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                    <TrendingUp className="w-3 h-3" />
                    <span>Live data</span>
                  </div>
                )}
              </div>
              {chartData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[240px] text-center gap-2">
                  <TrendingUp className="w-8 h-8 text-zinc-700" />
                  <p className="text-sm text-zinc-600">Chart data will appear after the first sync</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#7C3AED" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: "#52525b", fontSize: 11 }} tickLine={false} axisLine={false} interval={6} />
                    <YAxis tick={{ fill: "#52525b", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="views" stroke="#7C3AED" strokeWidth={2} fill="url(#viewsGradient)" dot={false} activeDot={{ r: 4, fill: "#7C3AED", stroke: "#0a0a0a", strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Quick links when no alerts */}
            <div className="rounded-xl border border-white/[0.06] bg-[#111111] p-5">
              <h2 className="text-[15px] font-semibold text-white mb-5">Quick Actions</h2>
              <div className="space-y-2">
                {[
                  { label: "Add creator account", href: "/analytics",    icon: Users      },
                  { label: "Create campaign",      href: "/campaigns/new", icon: Megaphone  },
                  { label: "View payouts",          href: "/payments",     icon: DollarSign },
                  { label: "Check trends",          href: "/trends",       icon: TrendingUp },
                ].map((a) => {
                  const Icon = a.icon
                  return (
                    <Link key={a.href} href={a.href}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.04] text-zinc-400 hover:text-zinc-200 transition-all group"
                    >
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="text-sm">{a.label}</span>
                      <ArrowUpRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Top performing videos */}
          {topVideos.length > 0 && (
            <div className="rounded-xl border border-white/[0.06] bg-[#111111] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                <div>
                  <h2 className="text-[15px] font-semibold text-white">Top Performing Videos</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">Sorted by total views</p>
                </div>
                <Link href="/analytics" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                  View all →
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.04]">
                      <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Video</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Views</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Platform</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {topVideos.map((video) => (
                      <tr key={video.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-600/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                              <Play className="w-3.5 h-3.5 text-purple-400" fill="currentColor" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-zinc-200 line-clamp-1">{video.caption}</p>
                              <p className="text-xs text-zinc-500">{video.creator}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="text-sm font-medium text-zinc-200">{fmt(video.views)}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-xs text-zinc-500 capitalize">{video.platform}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
