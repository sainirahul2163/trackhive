"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Plus, Search, RefreshCw, Trash2, Eye,
  Users, TrendingUp, Globe, ChevronDown, AlertCircle, X, Lock,
  BarChart3,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { AddAccountDrawer } from "@/components/analytics/add-account-drawer"
import { PlatformIcon, PLATFORM_CONFIG, formatNumber } from "@/lib/platform"
import { CmdKSearch } from "@/components/ui/cmd-search"
import { fetchTrackedAccounts } from "@/lib/analytics-data"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/lib/use-user"
import type { TrackedAccount, Platform } from "@/types"

const IG_BANNER_KEY = "trackhive_ig_banner_dismissed"

function engagementBadge(rate: number) {
  if (rate >= 5) return { label: "Excellent", style: { backgroundColor: "rgba(16,185,129,0.12)", color: "#34d399", borderColor: "rgba(16,185,129,0.25)" } }
  if (rate >= 2) return { label: "Good",      style: { backgroundColor: "rgba(59,130,246,0.12)", color: "#60a5fa", borderColor: "rgba(59,130,246,0.25)" } }
  return            { label: "Average",    style: { backgroundColor: "rgba(113,113,122,0.12)", color: "#a1a1aa", borderColor: "rgba(113,113,122,0.25)" } }
}

const PLATFORMS: { value: Platform | "all"; label: string }[] = [
  { value: "all", label: "All Platforms" },
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "facebook", label: "Facebook" },
]

const SORT_OPTIONS = [
  { value: "total_views", label: "Total Views" },
  { value: "followers", label: "Followers" },
  { value: "engagement", label: "Engagement Rate" },
  { value: "avg_views", label: "Avg Views" },
]

function timeAgo(iso: string | null): string {
  if (!iso) return "Never"
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function TableSkeleton() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#111111] overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.04] flex gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16 ml-auto" />
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-white/[0.03]">
          <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-3.5 w-14" />
          <Skeleton className="h-3.5 w-14" />
          <Skeleton className="h-3.5 w-14" />
          <Skeleton className="h-3.5 w-10" />
          <Skeleton className="h-3.5 w-16" />
        </div>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const router = useRouter()
  const { user } = useUser()
  const [accounts, setAccounts] = useState<TrackedAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [platform, setPlatform] = useState<Platform | "all">("all")
  const [sort, setSort] = useState("total_views")
  const [drawerOpen, setDrawerOpen] = useState(false)

  const load = useCallback(async (userId?: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchTrackedAccounts(userId)
      setAccounts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load accounts.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(user?.id) }, [load, user?.id])

  const [igBannerDismissed, setIgBannerDismissed] = useState(true)

  useEffect(() => {
    setIgBannerDismissed(localStorage.getItem(IG_BANNER_KEY) === "1")
  }, [])

  function dismissIgBanner() {
    localStorage.setItem(IG_BANNER_KEY, "1")
    setIgBannerDismissed(true)
  }

  const hasInstagramAccounts = accounts.some((a) => a.platform === "instagram")

  const filtered = accounts
    .filter((a) => {
      const matchSearch =
        a.username.toLowerCase().includes(search.toLowerCase()) ||
        (a.display_name ?? "").toLowerCase().includes(search.toLowerCase())
      const matchPlatform = platform === "all" || a.platform === platform
      return matchSearch && matchPlatform
    })
    .sort((a, b) => {
      if (sort === "total_views") return (b.total_views ?? 0) - (a.total_views ?? 0)
      if (sort === "followers") return b.follower_count - a.follower_count
      if (sort === "engagement") return b.engagement_rate - a.engagement_rate
      if (sort === "avg_views") return (b.avg_views ?? 0) - (a.avg_views ?? 0)
      return 0
    })

  const stats = {
    totalAccounts: accounts.length,
    totalViews: accounts.reduce((s, a) => s + (a.total_views ?? 0), 0),
    avgEngagement:
      accounts.reduce((s, a) => s + a.engagement_rate, 0) / (accounts.length || 1),
    activePlatforms: new Set(accounts.map((a) => a.platform)).size,
  }

  const [syncingId, setSyncingId] = useState<string | null>(null)

  async function handleSync(id: string) {
    setSyncingId(id)
    try {
      await fetch("/api/sync", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ accountId: id }),
      })
      await load(user?.id)
    } finally {
      setSyncingId(null)
    }
  }

  async function handleRemove(id: string) {
    setAccounts((prev) => prev.filter((a) => a.id !== id))
    await supabase.from("tracked_accounts").delete().eq("id", id)
  }

  function handleAccountAdded(account: TrackedAccount) {
    setAccounts((prev) => [account, ...prev])
  }

  const statCards = [
    { label: "Total Accounts", value: stats.totalAccounts, icon: Users, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Total Views", value: formatNumber(stats.totalViews), icon: Eye, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Avg Engagement", value: `${stats.avgEngagement.toFixed(1)}%`, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Active Platforms", value: stats.activePlatforms, icon: Globe, color: "text-amber-400", bg: "bg-amber-500/10" },
  ]

  return (
    <div className="space-y-5 max-w-7xl">
      <CmdKSearch />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-white tracking-tight">Analytics</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Track performance across all your creator accounts.</p>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Add Account
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {statCards.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="rounded-xl border border-white/[0.06] bg-[#111111] px-4 py-3.5 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div>
                <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider">{s.label}</p>
                {loading ? (
                  <Skeleton className="h-5 w-16 mt-1" />
                ) : (
                  <p className="text-lg font-bold text-white leading-tight">{s.value}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search accounts..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#111111] border border-white/[0.06] text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-purple-500/40 transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {PLATFORMS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPlatform(p.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                platform === p.value
                  ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                  : "bg-[#111111] text-zinc-400 border border-white/[0.06] hover:text-zinc-200 hover:border-white/10"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 rounded-lg bg-[#111111] border border-white/[0.06] text-sm text-zinc-300 outline-none focus:border-purple-500/40 transition-colors cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-[#1a1a1a]">Sort: {o.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
        </div>
      </div>

      {/* Instagram data-limitation banner */}
      {!loading && hasInstagramAccounts && !igBannerDismissed && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
          <BarChart3 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-300 leading-relaxed flex-1">
            <span className="font-semibold">Instagram view counts are restricted by Meta.</span>{" "}
            Engagement rate (likes + comments ÷ followers) is shown instead.
          </p>
          <button onClick={dismissIgBanner} className="text-amber-500 hover:text-amber-300 transition-colors flex-shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && <TableSkeleton />}

      {/* Error state */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-red-500/10 bg-red-500/5">
          <AlertCircle className="w-8 h-8 text-red-400 mb-3" />
          <p className="text-sm font-medium text-white mb-1">Failed to load accounts</p>
          <p className="text-xs text-zinc-500 mb-4 text-center max-w-xs">{error}</p>
          <button
            onClick={() => load(user?.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.09] text-zinc-200 text-sm font-medium transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 rounded-xl border border-white/[0.06] bg-[#111111]">
          <div className="w-12 h-12 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-purple-400" />
          </div>
          <p className="text-base font-semibold text-white mb-1">
            {search || platform !== "all" ? "No accounts match your filters" : "No accounts tracked yet"}
          </p>
          <p className="text-sm text-zinc-500 mb-5 text-center max-w-xs">
            {search || platform !== "all"
              ? "Try adjusting your search or platform filter."
              : "Add a TikTok, Instagram, YouTube or Facebook account to start tracking."}
          </p>
          {!search && platform === "all" && (
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Account
            </button>
          )}
        </div>
      )}

      {/* Table */}
      {!loading && !error && filtered.length > 0 && (
        <div className="rounded-xl border border-white/[0.06] bg-[#111111] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  <th className="text-left px-5 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Account</th>
                  <th className="text-right px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Followers</th>
                  <th className="text-right px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Total Views</th>
                  <th className="text-right px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Avg Views</th>
                  <th className="text-right px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Engagement</th>
                  <th className="text-left px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Last Synced</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {filtered.map((account) => {
                  const cfg      = PLATFORM_CONFIG[account.platform]
                  const isIg     = account.platform === "instagram"
                  const badge    = engagementBadge(account.engagement_rate)
                  return (
                    <tr
                      key={account.id}
                      onClick={() => router.push(`/analytics/${account.id}`)}
                      className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative flex-shrink-0">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={account.avatar_url ?? ""} />
                              <AvatarFallback className="bg-purple-600/20 text-purple-400 text-xs font-bold">
                                {account.username.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {isIg && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#111111] flex items-center justify-center">
                                <Lock className="w-2 h-2 text-amber-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
                                {account.display_name ?? account.username}
                              </span>
                              <span
                                className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium"
                                style={{ backgroundColor: cfg.bgColor, color: cfg.fgColor }}
                              >
                                <PlatformIcon platform={account.platform} className="w-2.5 h-2.5" />
                                {cfg.label}
                              </span>
                            </div>
                            <span className="text-xs text-zinc-500">@{account.username}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="text-sm text-zinc-300">{formatNumber(account.follower_count)}</span>
                      </td>
                      {/* Total Views — "—" for Instagram with tooltip */}
                      <td className="px-4 py-3.5 text-right">
                        {isIg ? (
                          <span
                            className="text-sm font-medium text-zinc-600 cursor-help"
                            title="Instagram restricts view data to account owners"
                          >
                            —
                          </span>
                        ) : (
                          <span className="text-sm font-medium text-zinc-200">
                            {formatNumber(account.total_views ?? 0)}
                          </span>
                        )}
                      </td>
                      {/* Avg Views — "—" for Instagram */}
                      <td className="px-4 py-3.5 text-right">
                        {isIg ? (
                          <span
                            className="text-sm text-zinc-600 cursor-help"
                            title="Instagram restricts view data to account owners"
                          >
                            —
                          </span>
                        ) : (
                          <span className="text-sm text-zinc-300">
                            {formatNumber(account.avg_views ?? 0)}
                          </span>
                        )}
                      </td>
                      {/* Engagement badge */}
                      <td className="px-4 py-3.5 text-right">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border"
                          style={badge.style}
                        >
                          {account.engagement_rate.toFixed(1)}% · {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${account.last_synced_at ? "bg-emerald-400" : "bg-zinc-600"}`} />
                          <span className="text-xs text-zinc-500">{timeAgo(account.last_synced_at)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/analytics/${account.id}`}
                            className="p-1.5 rounded-md hover:bg-white/[0.06] text-zinc-500 hover:text-zinc-200 transition-colors"
                            title="View"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleSync(account.id)}
                            disabled={syncingId === account.id}
                            className="p-1.5 rounded-md hover:bg-white/[0.06] text-zinc-500 hover:text-zinc-200 transition-colors disabled:opacity-50"
                            title="Sync now"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${syncingId === account.id ? "animate-spin" : ""}`} />
                          </button>
                          <button
                            onClick={() => handleRemove(account.id)}
                            className="p-1.5 rounded-md hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-white/[0.04] flex items-center justify-between">
            <p className="text-xs text-zinc-600">{filtered.length} account{filtered.length !== 1 ? "s" : ""}</p>
            <button onClick={() => load(user?.id)} className="flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
              <RefreshCw className="w-3 h-3" />
              Refresh
            </button>
          </div>
        </div>
      )}

      <AddAccountDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onAccountAdded={handleAccountAdded}
      />
    </div>
  )
}
