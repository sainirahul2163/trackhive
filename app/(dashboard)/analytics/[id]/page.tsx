"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeft, RefreshCw, ExternalLink, TrendingUp,
  Eye, BarChart3, Video, ArrowUpRight, ArrowDownRight, AlertCircle,
} from "lucide-react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { PlatformIcon, PLATFORM_CONFIG, formatNumber, viralityLabel } from "@/lib/platform"
import { VideoDetailDrawer } from "@/components/analytics/video-detail-drawer"
import { fetchTrackedAccount, fetchTrackedVideos } from "@/lib/analytics-data"
import type { TrackedAccount, TrackedVideo } from "@/types"

function generateChartData(days: number) {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (days - 1 - i))
    return {
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      views: Math.floor(Math.random() * 1200000 + 300000),
    }
  })
}

const DATE_TABS = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
]

function formatDate(iso: string | null): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}
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

function DetailSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3.5 w-28" />
        </div>
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-white/[0.06] bg-[#111111] p-4">
            <Skeleton className="h-3 w-20 mb-3" />
            <Skeleton className="h-6 w-16 mb-2" />
            <Skeleton className="h-3 w-14" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-white/[0.06] bg-[#111111] p-5">
        <Skeleton className="h-[220px] w-full" />
      </div>
    </div>
  )
}

export default function AccountDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [account, setAccount] = useState<TrackedAccount | null>(null)
  const [videos, setVideos] = useState<TrackedVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeDays, setActiveDays] = useState(30)
  const [chartData] = useState(() => generateChartData(90))
  const [selectedVideo, setSelectedVideo] = useState<TrackedVideo | null>(null)
  const [videoDrawerOpen, setVideoDrawerOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [acct, vids] = await Promise.all([
        fetchTrackedAccount(id),
        fetchTrackedVideos(id),
      ])
      setAccount(acct)
      setVideos(vids)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load account.")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  if (loading) {
    return (
      <div className="max-w-7xl space-y-4">
        <Skeleton className="h-4 w-28" />
        <DetailSkeleton />
      </div>
    )
  }

  if (error || !account) {
    return (
      <div className="max-w-7xl space-y-4">
        <Link href="/analytics" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Analytics
        </Link>
        <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-red-500/10 bg-red-500/5">
          <AlertCircle className="w-8 h-8 text-red-400 mb-3" />
          <p className="text-sm font-medium text-white mb-1">Failed to load account</p>
          <p className="text-xs text-zinc-500 mb-4 text-center max-w-xs">{error}</p>
          <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.09] text-zinc-200 text-sm font-medium transition-all">
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  const cfg = PLATFORM_CONFIG[account.platform]
  const displayData = chartData.slice(-activeDays)

  const statCards = [
    { label: "Total Views", value: formatNumber(account.total_views), icon: Eye, color: "text-blue-400", bg: "bg-blue-500/10", change: "+18.2%", up: true },
    { label: "Avg Views / Video", value: formatNumber(account.avg_views), icon: BarChart3, color: "text-purple-400", bg: "bg-purple-500/10", change: "+5.4%", up: true },
    { label: "Engagement Rate", value: `${account.engagement_rate.toFixed(1)}%`, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10", change: "-0.3%", up: false },
    { label: "Videos Tracked", value: videos.length.toString(), icon: Video, color: "text-amber-400", bg: "bg-amber-500/10", change: `+${videos.length}`, up: true },
  ]

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Back */}
      <Link href="/analytics" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Analytics
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12">
            <AvatarFallback className="bg-purple-600/20 text-purple-400 text-base font-bold">
              {account.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-semibold text-white tracking-tight">
                {account.display_name ?? account.username}
              </h1>
              <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${cfg.bg} ${cfg.textColor}`}>
                <PlatformIcon platform={account.platform} className="w-3 h-3" />
                {cfg.label}
              </span>
            </div>
            <p className="text-sm text-zinc-500">@{account.username} · {formatNumber(account.follower_count)} followers</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:ml-auto">
          {account.profile_url && (
            <a href={account.profile_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-400 hover:text-zinc-200 hover:border-white/10 transition-all">
              <ExternalLink className="w-3.5 h-3.5" />
              Profile
            </a>
          )}
          <button onClick={load} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-all active:scale-[0.98]">
            <RefreshCw className="w-3.5 h-3.5" />
            Sync Now
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {statCards.map((s) => {
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
                {s.up ? <ArrowUpRight className="w-3 h-3 text-emerald-400" /> : <ArrowDownRight className="w-3 h-3 text-red-400" />}
                <span className={`text-xs font-medium ${s.up ? "text-emerald-400" : "text-red-400"}`}>{s.change}</span>
                <span className="text-xs text-zinc-600">vs last period</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-white/[0.06] bg-[#111111] p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-[15px] font-semibold text-white">Daily Views</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Performance over time</p>
          </div>
          <div className="flex items-center gap-1 bg-white/[0.04] rounded-lg p-0.5">
            {DATE_TABS.map((tab) => (
              <button
                key={tab.label}
                onClick={() => setActiveDays(tab.days)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeDays === tab.days ? "bg-purple-600 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={displayData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="detailGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: "#52525b", fontSize: 11 }} tickLine={false} axisLine={false} interval={Math.floor(activeDays / 6)} />
            <YAxis tick={{ fill: "#52525b", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${(v / 1000000).toFixed(1)}M`} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="views" stroke="#7C3AED" strokeWidth={2} fill="url(#detailGradient)" dot={false} activeDot={{ r: 4, fill: "#7C3AED", stroke: "#0a0a0a", strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Videos table */}
      <div className="rounded-xl border border-white/[0.06] bg-[#111111] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-[15px] font-semibold text-white">Tracked Videos</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Click any row for full details</p>
          </div>
          <span className="text-xs text-zinc-500">{videos.length} videos</span>
        </div>

        {videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Video className="w-8 h-8 text-zinc-600 mb-3" />
            <p className="text-sm font-medium text-zinc-400 mb-1">No videos tracked yet</p>
            <p className="text-xs text-zinc-600">Videos will appear here after the first sync.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  <th className="text-left px-5 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Video</th>
                  <th className="text-left px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Posted</th>
                  <th className="text-right px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Views</th>
                  <th className="text-right px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Likes</th>
                  <th className="text-right px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Comments</th>
                  <th className="text-center px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Virality</th>
                  <th className="text-left px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Tags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {videos.map((video) => {
                  const vl = viralityLabel(video.virality_score)
                  return (
                    <tr key={video.id} onClick={() => { setSelectedVideo(video); setVideoDrawerOpen(true) }} className="hover:bg-white/[0.02] transition-colors cursor-pointer group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-[72px] h-12 rounded-lg bg-white/[0.04] border border-white/[0.06] overflow-hidden flex-shrink-0">
                            {video.thumbnail_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={video.thumbnail_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Video className="w-4 h-4 text-zinc-600" />
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-zinc-200 group-hover:text-white transition-colors line-clamp-2 max-w-xs">{video.caption}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4"><span className="text-xs text-zinc-500 whitespace-nowrap">{formatDate(video.posted_at)}</span></td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <ArrowUpRight className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                          <span className="text-sm font-medium text-zinc-200">{formatNumber(video.views)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right"><span className="text-sm text-zinc-400">{formatNumber(video.likes)}</span></td>
                      <td className="px-4 py-4 text-right"><span className="text-sm text-zinc-400">{formatNumber(video.comments)}</span></td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${vl.className}`}>{vl.label}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-1 flex-wrap">
                          {(video.tags ?? []).slice(0, 2).map((tag) => (
                            <span key={tag} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-white/[0.05] text-zinc-400 border border-white/[0.06]">{tag}</span>
                          ))}
                          {(video.tags ?? []).length > 2 && (
                            <span className="text-[10px] text-zinc-600">+{video.tags.length - 2}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <VideoDetailDrawer video={selectedVideo} open={videoDrawerOpen} onOpenChange={setVideoDrawerOpen} />
    </div>
  )
}
