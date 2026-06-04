"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  Plus, Eye, Edit2, Copy, Megaphone, Users, DollarSign, TrendingUp,
  Calendar, MoreHorizontal, CheckCircle2, Clock, PauseCircle, FileText,
  RefreshCw, AlertCircle,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchCampaigns } from "@/lib/campaigns-data"
import { formatNumber } from "@/lib/platform"
import { useUser } from "@/lib/use-user"
import type { Campaign, CampaignStatus } from "@/types"

const STATUS_CONFIG: Record<CampaignStatus, {
  label: string; icon: React.ElementType; className: string
}> = {
  active:    { label: "Active",    icon: CheckCircle2, className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  draft:     { label: "Draft",     icon: FileText,     className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"         },
  paused:    { label: "Paused",    icon: PauseCircle,  className: "bg-amber-500/10 text-amber-400 border-amber-500/20"      },
  completed: { label: "Completed", icon: Clock,        className: "bg-blue-500/10 text-blue-400 border-blue-500/20"         },
}

const FILTER_TABS: { value: CampaignStatus | "all"; label: string }[] = [
  { value: "all",       label: "All"       },
  { value: "active",    label: "Active"    },
  { value: "draft",     label: "Draft"     },
  { value: "completed", label: "Completed" },
  { value: "paused",    label: "Paused"    },
]

function formatDate(d: string | null) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
      <div className="h-full rounded-full bg-purple-500 transition-all" style={{ width: `${pct}%` }} />
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#111111] p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3 w-48" />
      <div className="space-y-2">
        <Skeleton className="h-1.5 w-full rounded-full" />
        <Skeleton className="h-1.5 w-full rounded-full" />
      </div>
      <div className="flex justify-between pt-1 border-t border-white/[0.04]">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  )
}

export default function CampaignsPage() {
  const { user } = useUser()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<CampaignStatus | "all">("all")

  const load = useCallback(async (userId?: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchCampaigns(userId)
      setCampaigns(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load campaigns.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(user?.id) }, [load, user?.id])

  const filtered = filter === "all" ? campaigns : campaigns.filter(c => c.status === filter)

  const stats = {
    active:     campaigns.filter(c => c.status === "active").length,
    totalViews: campaigns.reduce((s, c) => s + c.total_views, 0),
    creators:   campaigns.reduce((s, c) => s + c.total_videos, 0), // proxy until join
    paidOut:    campaigns.reduce((s, c) => s + c.total_payout, 0),
  }

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-white tracking-tight">Campaigns</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Manage your UGC creator campaigns.</p>
        </div>
        <Link
          href="/campaigns/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </Link>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {[
          { label: "Active Campaigns",      value: stats.active,                     icon: Megaphone,  color: "text-purple-400", bg: "bg-purple-500/10" },
          { label: "Total Views Delivered", value: formatNumber(stats.totalViews),   icon: TrendingUp, color: "text-blue-400",   bg: "bg-blue-500/10"   },
          { label: "Total Videos Posted",   value: stats.creators,                   icon: Users,      color: "text-emerald-400",bg: "bg-emerald-500/10"},
          { label: "Total Paid Out",        value: `$${formatNumber(stats.paidOut)}`,icon: DollarSign, color: "text-amber-400",  bg: "bg-amber-500/10"  },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="rounded-xl border border-white/[0.06] bg-[#111111] px-4 py-3.5 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div>
                <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider">{s.label}</p>
                {loading ? <Skeleton className="h-5 w-16 mt-1" /> : <p className="text-lg font-bold text-white leading-tight">{s.value}</p>}
              </div>
            </div>
          )
        })}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-white/[0.03] border border-white/[0.06] rounded-lg p-1 w-fit">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-all ${
              filter === tab.value ? "bg-[#1a1a1a] text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab.label}
            {tab.value !== "all" && !loading && (
              <span className={`ml-1.5 text-[11px] px-1.5 py-0.5 rounded-full ${filter === tab.value ? "bg-white/10 text-zinc-300" : "bg-white/[0.04] text-zinc-600"}`}>
                {campaigns.filter(c => c.status === tab.value).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-red-500/10 bg-red-500/5">
          <AlertCircle className="w-8 h-8 text-red-400 mb-3" />
          <p className="text-sm font-medium text-white mb-1">Failed to load campaigns</p>
          <p className="text-xs text-zinc-500 mb-4 text-center max-w-xs">{error}</p>
          <button onClick={() => load(user?.id)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.09] text-zinc-200 text-sm font-medium transition-all">
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 rounded-xl border border-white/[0.06] bg-[#111111]">
          <div className="w-12 h-12 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center mb-4">
            <Megaphone className="w-6 h-6 text-purple-400" />
          </div>
          <p className="text-base font-semibold text-white mb-1">
            {filter !== "all" ? `No ${filter} campaigns` : "No campaigns yet"}
          </p>
          <p className="text-sm text-zinc-500 mb-5 text-center max-w-xs">
            {filter !== "all"
              ? `Switch the filter to see other campaigns.`
              : "Create your first campaign to start tracking creator content and payouts."}
          </p>
          {filter === "all" && (
            <Link href="/campaigns/new" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-all">
              <Plus className="w-4 h-4" />
              New Campaign
            </Link>
          )}
        </div>
      )}

      {/* Cards grid */}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(campaign => {
            const cfg = STATUS_CONFIG[campaign.status]
            const StatusIcon = cfg.icon
            const viewsPct  = campaign.target_views  > 0 ? Math.min((campaign.total_views  / campaign.target_views)  * 100, 100) : 0
            const videosPct = campaign.target_videos > 0 ? Math.min((campaign.total_videos / campaign.target_videos) * 100, 100) : 0

            return (
              <div key={campaign.id} className="rounded-xl border border-white/[0.06] bg-[#111111] p-5 hover:border-white/10 transition-all group flex flex-col gap-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <Link href={`/campaigns/${campaign.id}`}>
                      <h3 className="text-[15px] font-semibold text-white group-hover:text-purple-300 transition-colors truncate">{campaign.name}</h3>
                    </Link>
                    {campaign.brand && <p className="text-xs text-zinc-500 mt-0.5">{campaign.brand}</p>}
                  </div>
                  <span className={`flex-shrink-0 flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${cfg.className}`}>
                    <StatusIcon className="w-3 h-3" />
                    {cfg.label}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{formatDate(campaign.start_date)} → {formatDate(campaign.end_date)}</span>
                </div>

                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-500">Views</span>
                      <span className="text-zinc-400">{formatNumber(campaign.total_views)} / {formatNumber(campaign.target_views)} <span className="text-zinc-600">({viewsPct.toFixed(0)}%)</span></span>
                    </div>
                    <ProgressBar value={campaign.total_views} max={campaign.target_views} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-500">Videos</span>
                      <span className="text-zinc-400">{campaign.total_videos} / {campaign.target_videos} <span className="text-zinc-600">({videosPct.toFixed(0)}%)</span></span>
                    </div>
                    <ProgressBar value={campaign.total_videos} max={campaign.target_videos} />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-[10px] text-zinc-600 uppercase tracking-wider">Payout</p>
                      <p className="text-sm font-semibold text-emerald-400">${campaign.total_payout.toLocaleString()}</p>
                    </div>
                    <div className="w-px h-6 bg-white/[0.06]" />
                    <div>
                      <p className="text-[10px] text-zinc-600 uppercase tracking-wider">Videos</p>
                      <p className="text-sm font-semibold text-zinc-300">{campaign.total_videos}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/campaigns/${campaign.id}`} className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors" title="View">
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                    <button className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors" title="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors" title="Duplicate"><Copy className="w-3.5 h-3.5" /></button>
                    <button className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors" title="More"><MoreHorizontal className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
