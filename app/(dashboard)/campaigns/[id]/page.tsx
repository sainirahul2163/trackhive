"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  ArrowLeft, Edit2, Download, Eye,
  Users, DollarSign, ArrowUpRight, Video,
  CheckCircle2, AlertTriangle, Clock, UserPlus,
  Check, Pause, ChevronDown, RefreshCw, AlertCircle,
} from "lucide-react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PlatformIcon, PLATFORM_CONFIG, formatNumber } from "@/lib/platform"
import { fetchCampaign, fetchCampaignCreators } from "@/lib/campaigns-data"
import { Skeleton } from "@/components/ui/skeleton"
import type { Campaign, CampaignCreator, CampaignStatus, CreatorStatus, PayoutStatus } from "@/types"

// ── Helpers ───────────────────────────────────────────────────
const STATUS_CONFIG: Record<CampaignStatus, { label: string; className: string }> = {
  active:    { label: "Active",    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  draft:     { label: "Draft",     className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"         },
  paused:    { label: "Paused",    className: "bg-amber-500/10 text-amber-400 border-amber-500/20"      },
  completed: { label: "Completed", className: "bg-blue-500/10 text-blue-400 border-blue-500/20"         },
}

const CREATOR_STATUS_CONFIG: Record<CreatorStatus, { label: string; className: string; icon: React.ElementType }> = {
  active:          { label: "Active",          className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: CheckCircle2   },
  behind_schedule: { label: "Behind Schedule", className: "bg-red-500/10 text-red-400 border-red-500/20",             icon: AlertTriangle  },
  completed:       { label: "Completed",       className: "bg-blue-500/10 text-blue-400 border-blue-500/20",          icon: Check          },
  removed:         { label: "Removed",         className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",          icon: Clock          },
}

const PAYOUT_STATUS: Record<PayoutStatus, { label: string; className: string }> = {
  pending:  { label: "Pending",  className: "bg-amber-500/10 text-amber-400 border-amber-500/20"  },
  approved: { label: "Approved", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  on_hold:  { label: "On Hold",  className: "bg-red-500/10 text-red-400 border-red-500/20"        },
  paid:     { label: "Paid",     className: "bg-blue-500/10 text-blue-400 border-blue-500/20"     },
}

function formatDate(d: string | null) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function timeAgo(iso: string | null) {
  if (!iso) return "—"
  const diff = Date.now() - new Date(iso).getTime()
  const hrs = Math.floor(diff / 3600000)
  if (hrs < 1) return "Just now"
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

interface ChartTooltipProps { active?: boolean; payload?: Array<{ value: number }>; label?: string }
const ChartTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-[11px] text-zinc-500 mb-1">{label}</p>
        <p className="text-sm font-semibold text-purple-400">{Number(payload[0]?.value).toLocaleString()} views</p>
      </div>
    )
  }
  return null
}

const TABS = ["Overview", "Creators", "Content", "Payouts", "Settings"] as const
type Tab = typeof TABS[number]

export default function CampaignDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [creators, setCreators] = useState<CampaignCreator[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>("Overview")
  const chartData: { date: string; views: number }[] = []

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [camp, crts] = await Promise.all([
        fetchCampaign(id),
        fetchCampaignCreators(id),
      ])
      setCampaign(camp)
      setCreators(crts)
    } catch {
      setError("Failed to load campaign")
      setCampaign(null)
      setCreators([])
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  if (loading) {
    return (
      <div className="space-y-5 max-w-7xl">
        <Skeleton className="h-4 w-32" />
        <div className="space-y-2"><Skeleton className="h-7 w-64" /><Skeleton className="h-4 w-48" /></div>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (error && !campaign) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <AlertCircle className="w-10 h-10 text-red-400 mb-4" />
        <p className="text-base font-semibold text-white mb-1">Failed to load campaign</p>
        <p className="text-sm text-zinc-500 mb-5">{error}</p>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.06] text-zinc-200 text-sm font-medium transition-all hover:bg-white/[0.09]">
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      </div>
    )
  }

  if (!campaign) return null

  const cfg = STATUS_CONFIG[campaign.status]
  const totalCreators = creators.length
  const totalPayout = creators.reduce((s, c) => s + c.payout_earned, 0)

  function updatePayoutStatus(creatorId: string, status: PayoutStatus) {
    setCreators(prev => prev.map(c => c.id === creatorId ? { ...c, payout_status: status } : c))
  }

  const statCards = [
    { label: "Total Views",     value: formatNumber(campaign.total_views),   icon: Eye,         color: "text-blue-400",   bg: "bg-blue-500/10"   },
    { label: "Videos Posted",   value: campaign.total_videos,                icon: Video,       color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Active Creators", value: totalCreators,                        icon: Users,       color: "text-emerald-400",bg: "bg-emerald-500/10"},
    { label: "Total Payout",    value: `$${totalPayout.toLocaleString()}`,   icon: DollarSign,  color: "text-amber-400",  bg: "bg-amber-500/10"  },
  ]

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Back */}
      <Link href="/campaigns" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Campaigns
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-semibold text-white tracking-tight">{campaign.name}</h1>
            <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${cfg.className}`}>
              {cfg.label}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            {campaign.brand && <span className="font-medium text-zinc-400">{campaign.brand}</span>}
            {campaign.brand && <span>·</span>}
            <span>{formatDate(campaign.start_date)} → {formatDate(campaign.end_date)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-400 hover:text-zinc-200 hover:border-white/10 transition-all">
            <Download className="w-3.5 h-3.5" />
            Export Report
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-all">
            <Edit2 className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {statCards.map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="rounded-xl border border-white/[0.06] bg-[#111111] p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">{s.label}</span>
                <div className={`w-7 h-7 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <Icon className={`w-3.5 h-3.5 ${s.color}`} />
                </div>
              </div>
              <p className="text-xl font-bold text-white">{s.value}</p>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                <span className="text-xs text-emerald-400 font-medium">On track</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-white/[0.03] border border-white/[0.06] rounded-lg p-1 w-fit overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab ? "bg-[#1a1a1a] text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ──────────────────────────────────────────── */}
      {activeTab === "Overview" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Chart */}
          <div className="xl:col-span-2 rounded-xl border border-white/[0.06] bg-[#111111] p-5">
            <div className="mb-5">
              <h2 className="text-[15px] font-semibold text-white">Daily Views</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Combined views across all creators</p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="campGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "#52525b", fontSize: 11 }} tickLine={false} axisLine={false} interval={6} />
                <YAxis tick={{ fill: "#52525b", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="views" stroke="#7C3AED" strokeWidth={2} fill="url(#campGrad)" dot={false} activeDot={{ r: 4, fill: "#7C3AED", stroke: "#0a0a0a", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Activity feed */}
          <div className="rounded-xl border border-white/[0.06] bg-[#111111] p-5">
            <h2 className="text-[15px] font-semibold text-white mb-4">Recent Activity</h2>
            <p className="text-sm text-zinc-500 py-4 text-center">Activity will appear as creators post content</p>
          </div>

          {/* Creator leaderboard */}
          <div className="xl:col-span-3 rounded-xl border border-white/[0.06] bg-[#111111] overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06]">
              <h2 className="text-[15px] font-semibold text-white">Creator Leaderboard</h2>
            </div>
            <table className="w-full">
              <thead><tr className="border-b border-white/[0.04]">
                <th className="text-left px-5 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Rank</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Creator</th>
                <th className="text-right px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Videos</th>
                <th className="text-right px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Views</th>
                <th className="text-right px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Payout</th>
              </tr></thead>
              <tbody className="divide-y divide-white/[0.03]">
                {[...creators].sort((a, b) => b.views_delivered - a.views_delivered).map((c, i) => {
                  const acc = c.account!
                  const cfg2 = PLATFORM_CONFIG[acc.platform]
                  return (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-amber-500/20 text-amber-400" : i === 1 ? "bg-zinc-400/20 text-zinc-400" : i === 2 ? "bg-orange-500/20 text-orange-400" : "bg-white/[0.04] text-zinc-600"}`}>{i + 1}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="w-7 h-7"><AvatarImage src={acc.avatar_url ?? ""} /><AvatarFallback className="bg-purple-600/20 text-purple-400 text-xs">{acc.username.slice(0,2).toUpperCase()}</AvatarFallback></Avatar>
                          <div>
                            <p className="text-sm font-medium text-zinc-200">{acc.display_name}</p>
                            <span className={`text-[10px] ${cfg2.textColor}`}>{cfg2.label}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right"><span className="text-sm text-zinc-300">{c.videos_posted}</span></td>
                      <td className="px-4 py-3.5 text-right"><span className="text-sm font-medium text-zinc-200">{formatNumber(c.views_delivered)}</span></td>
                      <td className="px-4 py-3.5 text-right"><span className="text-sm text-emerald-400 font-medium">${c.payout_earned.toLocaleString()}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── CREATORS TAB ─────────────────────────────────────────── */}
      {activeTab === "Creators" && (
        <div className="rounded-xl border border-white/[0.06] bg-[#111111] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
            <h2 className="text-[15px] font-semibold text-white">Creators ({creators.length})</h2>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 text-sm font-medium transition-all">
              <UserPlus className="w-3.5 h-3.5" />
              Add Creator
            </button>
          </div>
          <table className="w-full">
            <thead><tr className="border-b border-white/[0.04]">
              <th className="text-left px-5 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Creator</th>
              <th className="text-right px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Videos</th>
              <th className="text-right px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Views</th>
              <th className="text-right px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Payout</th>
              <th className="text-center px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Last Posted</th>
            </tr></thead>
            <tbody className="divide-y divide-white/[0.03]">
              {creators.map(c => {
                const acc = c.account!
                const platCfg = PLATFORM_CONFIG[acc.platform]
                const statCfg = CREATOR_STATUS_CONFIG[c.status]
                const StatIcon = statCfg.icon
                return (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8"><AvatarImage src={acc.avatar_url ?? ""} /><AvatarFallback className="bg-purple-600/20 text-purple-400 text-xs font-bold">{acc.username.slice(0,2).toUpperCase()}</AvatarFallback></Avatar>
                        <div>
                          <p className="text-sm font-medium text-zinc-200">{acc.display_name}</p>
                          <span className={`text-[10px] font-medium ${platCfg.textColor}`}>{platCfg.label} · @{acc.username}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right"><span className="text-sm text-zinc-300">{c.videos_posted}</span></td>
                    <td className="px-4 py-3.5 text-right"><span className="text-sm font-medium text-zinc-200">{formatNumber(c.views_delivered)}</span></td>
                    <td className="px-4 py-3.5 text-right"><span className="text-sm text-emerald-400 font-medium">${c.payout_earned.toLocaleString()}</span></td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${statCfg.className}`}>
                        <StatIcon className="w-3 h-3" />
                        {statCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5"><span className="text-xs text-zinc-500">{timeAgo(c.last_posted_at)}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── CONTENT TAB ──────────────────────────────────────────── */}
      {activeTab === "Content" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500">{campaign?.total_videos ?? 0} videos posted</p>
            <div className="relative">
              <select className="appearance-none pl-3 pr-8 py-2 rounded-lg bg-[#111111] border border-white/[0.06] text-sm text-zinc-300 outline-none cursor-pointer">
                <option className="bg-[#1a1a1a]">All Creators</option>
                {creators.map(c => <option key={c.id} className="bg-[#1a1a1a]">{c.account?.display_name}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
            </div>
          </div>
          {(campaign?.total_videos ?? 0) === 0 ? (
            <div className="rounded-xl border border-dashed border-white/[0.1] bg-white/[0.02] p-12 text-center">
              <Video className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
              <p className="text-sm text-zinc-400">No campaign content yet</p>
              <p className="text-xs text-zinc-600 mt-1">Videos will appear when creators post for this campaign</p>
            </div>
          ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {/* Campaign videos load from tracked content when available */}
            {creators.length > 0 && creators.map(c => {
              const acc = c.account
              if (!acc) return null
              const platCfg = PLATFORM_CONFIG[acc.platform]
              return (
                <div key={c.id} className="rounded-xl border border-white/[0.06] bg-[#111111] overflow-hidden hover:border-white/10 transition-all group">
                  <div className="aspect-video bg-white/[0.03] relative overflow-hidden flex items-center justify-center">
                    <Video className="w-8 h-8 text-zinc-600" />
                  </div>
                  <div className="p-3 space-y-2">
                    <p className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors line-clamp-2">{c.videos_posted} video{c.videos_posted !== 1 ? "s" : ""} posted</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-5 h-5"><AvatarImage src={acc.avatar_url ?? ""} /><AvatarFallback className="text-[8px]">C</AvatarFallback></Avatar>
                        <span className="text-xs text-zinc-500">{acc.display_name}</span>
                        <span className={`flex items-center gap-0.5 text-[10px] ${platCfg.textColor}`}>
                          <PlatformIcon platform={acc.platform} className="w-2.5 h-2.5" />
                        </span>
                      </div>
                      <span className="text-xs font-medium text-zinc-300">{formatNumber(c.views_delivered)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          )}
        </div>
      )}

      {/* ── PAYOUTS TAB ──────────────────────────────────────────── */}
      {activeTab === "Payouts" && (
        <div className="space-y-4">
          {/* Rules summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Base Fee", value: `$${campaign.base_fee}/video` },
              { label: "CPM Rate", value: `$${campaign.cpm_rate}/1K` },
              { label: "Milestone", value: campaign.milestone_bonus > 0 ? `$${campaign.milestone_bonus}` : "—" },
              { label: "Window", value: `${campaign.payout_window}d` },
            ].map(r => (
              <div key={r.label} className="rounded-lg border border-white/[0.06] bg-[#111111] px-4 py-3 text-center">
                <p className="text-[11px] text-zinc-500 uppercase tracking-wider">{r.label}</p>
                <p className="text-sm font-semibold text-zinc-200 mt-0.5">{r.value}</p>
              </div>
            ))}
          </div>

          {/* Payout table */}
          <div className="rounded-xl border border-white/[0.06] bg-[#111111] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <h2 className="text-[15px] font-semibold text-white">Creator Payouts</h2>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-sm font-medium transition-all">
                <Check className="w-3.5 h-3.5" />
                Approve All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-white/[0.04]">
                  <th className="text-left px-5 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Creator</th>
                  <th className="text-right px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Videos</th>
                  <th className="text-right px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Views</th>
                  <th className="text-right px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Base</th>
                  <th className="text-right px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">CPM</th>
                  <th className="text-right px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Total</th>
                  <th className="text-center px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Action</th>
                </tr></thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {creators.map(c => {
                    const acc = c.account!
                    const base = campaign.base_fee * c.videos_posted
                    const cpmAmt = (c.views_delivered / 1000) * campaign.cpm_rate
                    const psCfg = PAYOUT_STATUS[c.payout_status]
                    return (
                      <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <Avatar className="w-7 h-7"><AvatarImage src={acc.avatar_url ?? ""} /><AvatarFallback className="bg-purple-600/20 text-purple-400 text-xs">{acc.username.slice(0,2).toUpperCase()}</AvatarFallback></Avatar>
                            <span className="text-sm font-medium text-zinc-200">{acc.display_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right"><span className="text-sm text-zinc-400">{c.videos_posted}</span></td>
                        <td className="px-4 py-3.5 text-right"><span className="text-sm text-zinc-400">{formatNumber(c.views_delivered)}</span></td>
                        <td className="px-4 py-3.5 text-right"><span className="text-sm text-zinc-300">${base.toFixed(0)}</span></td>
                        <td className="px-4 py-3.5 text-right"><span className="text-sm text-zinc-300">${cpmAmt.toFixed(0)}</span></td>
                        <td className="px-4 py-3.5 text-right"><span className="text-sm font-semibold text-emerald-400">${c.payout_earned.toLocaleString()}</span></td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium border ${psCfg.className}`}>{psCfg.label}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1">
                            {c.payout_status !== "approved" && c.payout_status !== "paid" && (
                              <button onClick={() => updatePayoutStatus(c.id, "approved")} className="p-1.5 rounded-md text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors" title="Approve">
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {c.payout_status !== "on_hold" && c.payout_status !== "paid" && (
                              <button onClick={() => updatePayoutStatus(c.id, "on_hold")} className="p-1.5 rounded-md text-zinc-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors" title="Hold">
                                <Pause className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t border-white/[0.06] bg-white/[0.02]">
                    <td colSpan={5} className="px-5 py-3 text-sm font-semibold text-zinc-400">Total</td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-emerald-400">${totalPayout.toLocaleString()}</td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── SETTINGS TAB ─────────────────────────────────────────── */}
      {activeTab === "Settings" && (
        <div className="max-w-xl space-y-4">
          <div className="rounded-xl border border-white/[0.06] bg-[#111111] p-5 space-y-4">
            <h2 className="text-[15px] font-semibold text-white">Campaign Settings</h2>
            {[
              { label: "Campaign Name",   value: campaign.name },
              { label: "Brand / Client",  value: campaign.brand ?? "" },
              { label: "Start Date",      value: campaign.start_date ?? "" },
              { label: "End Date",        value: campaign.end_date ?? "" },
              { label: "Target Views",    value: campaign.target_views.toString() },
              { label: "Target Videos",  value: campaign.target_videos.toString() },
            ].map(f => (
              <div key={f.label} className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">{f.label}</label>
                <input
                  defaultValue={f.value}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-zinc-200 outline-none focus:border-purple-500/40 transition-colors"
                />
              </div>
            ))}
            <button className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-all">
              Save Changes
            </button>
          </div>

          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-red-400">Danger Zone</h3>
            <p className="text-xs text-zinc-500">Permanently delete this campaign and all associated data. This cannot be undone.</p>
            <button className="px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm font-medium transition-all border border-red-500/20">
              Delete Campaign
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
