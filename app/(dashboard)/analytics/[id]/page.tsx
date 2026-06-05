"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"
import {
  ArrowLeft, RefreshCw, ExternalLink,
  Eye, BarChart3, Video, ArrowUpRight,
  AlertCircle, DollarSign, Heart, MessageCircle, Share2,
  Plus, Users, Zap, ChevronDown,
  PlayCircle, BarChart2, Activity, Info,
} from "lucide-react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
} from "recharts"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { PlatformIcon, PLATFORM_CONFIG, formatNumber, viralityLabel } from "@/lib/platform"
import { VideoDetailDrawer } from "@/components/analytics/video-detail-drawer"
import {
  fetchTrackedAccount,
  fetchTrackedVideos,
  fetchDailyStats,
  fetchAccountVideoAggregates,
  fetchFollowerSnapshots,
  filterStatsByDays,
  type DailyViewsPoint,
  type AccountVideoAggregates,
  type FollowerSnapshotPoint,
} from "@/lib/analytics-data"
import { fetchCampaigns } from "@/lib/campaigns-data"
import { useUser } from "@/lib/use-user"
import type { TrackedAccount, TrackedVideo, Campaign, Platform } from "@/types"

function VideoThumbnailPlaceholder({
  platform,
  size,
}: {
  platform: Platform
  size:     "table" | "spotlight"
}) {
  const cfg = PLATFORM_CONFIG[platform]
  const dim = size === "spotlight" ? "w-[100px] h-16" : "w-[72px] h-12"

  return (
    <div
      className={`${dim} rounded-lg flex-shrink-0 border border-white/[0.06] flex items-center justify-center`}
      style={{ backgroundColor: "#1a1a1a" }}
    >
      {platform in PLATFORM_CONFIG ? (
        <span style={{ color: cfg.fgColor }}>
          <PlatformIcon platform={platform} className={size === "spotlight" ? "w-6 h-6" : "w-5 h-5"} />
        </span>
      ) : (
        <Video className={`${size === "spotlight" ? "w-6 h-6" : "w-5 h-5"} text-zinc-500`} />
      )}
    </div>
  )
}

function VideoThumbnail({
  url,
  platform,
  size = "table",
}: {
  url:      string | null | undefined
  platform: Platform
  size?:    "table" | "spotlight"
}) {
  const [imgFailed, setImgFailed] = useState(false)
  const thumbnailUrl = url?.trim() ?? ""
  const dim = size === "spotlight" ? "w-[100px] h-16" : "w-[72px] h-12"

  useEffect(() => {
    setImgFailed(false)
  }, [thumbnailUrl])

  if (!thumbnailUrl || imgFailed) {
    return <VideoThumbnailPlaceholder platform={platform} size={size} />
  }

  if (platform === "instagram") {
    return (
      <div className={`${dim} relative rounded-lg overflow-hidden flex-shrink-0 border border-white/[0.06]`}>
        <Image
          src={thumbnailUrl}
          alt="video thumbnail"
          fill
          sizes={size === "spotlight" ? "100px" : "72px"}
          className="object-cover"
          onError={() => setImgFailed(true)}
        />
      </div>
    )
  }

  return (
    <div className={`${dim} rounded-lg overflow-hidden flex-shrink-0 border border-white/[0.06]`}>
      <img
        src={thumbnailUrl}
        alt="video thumbnail"
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        onError={() => setImgFailed(true)}
      />
    </div>
  )
}

const PLATFORM_CPM_RATES: Record<Platform, number> = {
  tiktok: 0.03,
  instagram: 0.02,
  youtube: 2.5,
  facebook: 0.02,
}

function formatStatNumber(n: number): string {
  if (n < 1000) return String(n)
  if (n < 1_000_000) return `${(n / 1000).toFixed(1)}K`
  return `${(n / 1_000_000).toFixed(1)}M`
}

function calcEstCpmValue(platform: Platform, totalViews: number): string {
  const rate = PLATFORM_CPM_RATES[platform]
  const value = (totalViews / 1000) * rate
  return `$${value.toFixed(2)}`
}

function buildEngagementData(videos: TrackedVideo[], includeShares: boolean) {
  const totals = videos.reduce(
    (acc, v) => ({
      likes:    acc.likes    + Number(v.likes    ?? 0),
      comments: acc.comments + Number(v.comments ?? 0),
      shares:   acc.shares   + Number(v.shares   ?? 0),
    }),
    { likes: 0, comments: 0, shares: 0 },
  )

  const segments = [
    { name: "Likes",    value: totals.likes,    color: "#a855f7" },
    { name: "Comments", value: totals.comments, color: "#3b82f6" },
  ]

  if (includeShares) {
    segments.push({ name: "Shares", value: totals.shares, color: "#10b981" })
  }

  return segments
}

function formatSharesValue(platform: Platform, shares: number): string {
  return platform === "instagram" ? "N/A" : formatNumber(shares)
}

function formatChartViews(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`
  return String(v)
}

function buildWeeklyData(videos: TrackedVideo[]) {
  const totals = new Map<number, number>()
  for (const v of videos) {
    if (!v.posted_at) continue
    const d = new Date(v.posted_at).getDay()
    totals.set(d, (totals.get(d) ?? 0) + (v.views ?? 0))
  }
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
    const dayIndex = (i + 1) % 7
    return { day, views: totals.get(dayIndex) ?? 0 }
  })
}

/* ─── Shared types ───────────────────────────────────── */
type ChartTab = "views" | "followers"

interface PerformanceChartPoint {
  date:      string
  views:     number
  followers: number
}

/* ─── Tooltip ────────────────────────────────────────── */
interface TooltipProps { active?: boolean; payload?: Array<{ value: number; name?: string }>; label?: string }
function ChartTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-[11px] text-zinc-500 mb-1">{label}</p>
      <p className="text-sm font-semibold text-purple-400">{Number(payload[0]?.value).toLocaleString()}</p>
    </div>
  )
}

/* ─── Skeletons ──────────────────────────────────────── */
function DetailSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Skeleton className="w-14 h-14 rounded-full" />
        <div className="space-y-2"><Skeleton className="h-5 w-40" /><Skeleton className="h-3.5 w-28" /></div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-xl border border-white/[0.06] bg-[#111111] p-4">
            <Skeleton className="h-3 w-20 mb-3" /><Skeleton className="h-6 w-16 mb-2" /><Skeleton className="h-3 w-14" />
          </div>
        ))}
      </div>
      <Skeleton className="h-[260px] rounded-xl" />
    </div>
  )
}

/* ─── Add to Campaign modal ──────────────────────────── */
function AddToCampaignModal({ onClose, creatorName, userId }: { onClose: () => void; creatorName: string; userId?: string }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState("")
  const [done, setDone] = useState(false)

  useEffect(() => {
    fetchCampaigns(userId)
      .then(data => setCampaigns(data.filter(c => c.status === "active" || c.status === "draft")))
      .catch(() => setCampaigns([]))
      .finally(() => setLoading(false))
  }, [userId])

  function handleAdd() {
    if (!selected) return
    setDone(true)
    setTimeout(onClose, 1200)
  }

  const statusLabel = (s: Campaign["status"]) =>
    s.charAt(0).toUpperCase() + s.slice(1)

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "24px" }}>
      <div className="bg-[#111111] rounded-2xl border border-white/[0.08] p-6 w-full max-w-sm shadow-2xl">
        {done ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6 text-emerald-400" />
            </div>
            <p className="text-white font-semibold">Added to campaign!</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold text-white">Add to Campaign</h3>
              <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors text-lg leading-none">×</button>
            </div>
            <p className="text-xs text-zinc-500 mb-4">Add <span className="text-zinc-300 font-medium">{creatorName}</span> to a campaign.</p>
            {loading ? (
              <p className="text-sm text-zinc-500 py-4 text-center">Loading campaigns…</p>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-6 mb-4">
                <p className="text-sm text-zinc-400 mb-3">No campaigns yet</p>
                <Link href="/campaigns/new" className="text-xs text-purple-400 hover:text-purple-300">Create a campaign →</Link>
              </div>
            ) : (
              <div className="space-y-2 mb-5">
                {campaigns.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelected(c.id)}
                    className="w-full text-left px-3 py-2.5 rounded-lg border transition-all"
                    style={{
                      backgroundColor: selected === c.id ? "rgba(124,58,237,0.1)" : "rgba(255,255,255,0.03)",
                      borderColor: selected === c.id ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.07)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-200 font-medium">{c.name}</span>
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">{statusLabel(c.status)}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={handleAdd}
              disabled={!selected}
              className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-sm font-semibold transition-all"
            >
              Add to Campaign
            </button>
          </>
        )}
      </div>
    </div>
  )
}

/* ─── Stat card ──────────────────────────────────────── */
function StatCard({ label, value, icon: Icon, color, bg, tooltip }: {
  label: string; value: string; icon: React.ElementType
  color: string; bg: string; tooltip?: string
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#111111] p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1 min-w-0">
          <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">{label}</span>
          {tooltip && (
            <span className="relative group flex-shrink-0">
              <Info className="w-3 h-3 text-zinc-600 cursor-help" aria-label={tooltip} />
              <span
                role="tooltip"
                className="pointer-events-none absolute left-0 top-full z-20 mt-1.5 hidden w-52 rounded-lg border border-white/10 bg-[#1a1a1a] px-2.5 py-2 text-[10px] leading-relaxed text-zinc-400 shadow-xl group-hover:block"
              >
                {tooltip}
              </span>
            </span>
          )}
        </div>
        <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-3.5 h-3.5 ${color}`} />
        </div>
      </div>
      <p className="text-xl font-bold text-white">{value}</p>
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────── */
const DATE_TABS = [{ label: "7D", days: 7 }, { label: "30D", days: 30 }, { label: "90D", days: 90 }]

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

function formatDate(iso: string | null) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export default function AccountDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { user } = useUser()

  const [account,       setAccount]       = useState<TrackedAccount | null>(null)
  const [videos,        setVideos]        = useState<TrackedVideo[]>([])
  const [dailyStats,       setDailyStats]       = useState<DailyViewsPoint[]>([])
  const [followerSnapshots, setFollowerSnapshots] = useState<FollowerSnapshotPoint[]>([])
  const [videoAggregates, setVideoAggregates] = useState<AccountVideoAggregates>({
    total_views: 0, total_likes: 0, total_comments: 0,
  })
  const [loading,    setLoading]    = useState(true)
  const [syncing,    setSyncing]    = useState(false)
  const [error,      setError]      = useState<string | null>(null)
  const [activeDays, setActiveDays] = useState(30)
  const [chartTab,   setChartTab]   = useState<ChartTab>("views")
  const [selectedVideo,    setSelectedVideo]    = useState<TrackedVideo | null>(null)
  const [videoDrawerOpen,  setVideoDrawerOpen]  = useState(false)
  const [campaignModalOpen, setCampaignModalOpen] = useState(false)
  const [videoSort,  setVideoSort]  = useState<"views" | "virality" | "date">("views")

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [acct, vids, daily, aggregates, followers] = await Promise.all([
        fetchTrackedAccount(id),
        fetchTrackedVideos(id),
        fetchDailyStats(id, 90),
        fetchAccountVideoAggregates(id),
        fetchFollowerSnapshots(id, 90).catch(() => [] as FollowerSnapshotPoint[]),
      ])

      console.log("[account detail] accountId:", id)
      console.log("[account detail] account total_views:", acct.total_views, "avg_views:", acct.avg_views)
      console.log("[account detail] video aggregates:", JSON.stringify(aggregates))
      console.log("[account detail] videos loaded:", vids.length)

      // Fallback per field: sum from loaded videos if aggregate query returned 0
      const sumFromVideos = vids.reduce<AccountVideoAggregates>(
        (acc, v) => ({
          total_views:    acc.total_views    + Number(v.views    ?? 0),
          total_likes:    acc.total_likes    + Number(v.likes    ?? 0),
          total_comments: acc.total_comments + Number(v.comments ?? 0),
        }),
        { total_views: 0, total_likes: 0, total_comments: 0 },
      )
      const resolvedAggregates: AccountVideoAggregates = {
        total_views:    aggregates.total_views    || sumFromVideos.total_views,
        total_likes:    aggregates.total_likes    || sumFromVideos.total_likes,
        total_comments: aggregates.total_comments || sumFromVideos.total_comments,
      }

      console.log("[account detail] resolved sums — views:", resolvedAggregates.total_views,
        "likes:", resolvedAggregates.total_likes, "comments:", resolvedAggregates.total_comments)

      setAccount(acct)
      setVideos(vids)
      setDailyStats(daily)
      setFollowerSnapshots(followers)
      setVideoAggregates(resolvedAggregates)
    } catch {
      setError("Failed to load account")
      setAccount(null)
      setVideos([])
      setDailyStats([])
      setFollowerSnapshots([])
      setVideoAggregates({ total_views: 0, total_likes: 0, total_comments: 0 })
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  async function handleSyncNow() {
    setSyncing(true)
    try {
      await fetch("/api/sync", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ accountId: id }),
      })
      await load()
    } finally {
      setSyncing(false)
    }
  }

  const viewsChartData = useMemo(
    (): PerformanceChartPoint[] =>
      filterStatsByDays(dailyStats, activeDays).map((d) => ({
        date:      new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        views:     d.views,
        followers: 0,
      })),
    [dailyStats, activeDays],
  )

  const followerChartData = useMemo(
    (): PerformanceChartPoint[] =>
      filterStatsByDays(followerSnapshots, activeDays).map((d) => ({
        date:      new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        views:     0,
        followers: d.follower_count,
      })),
    [followerSnapshots, activeDays],
  )

  const displayData: PerformanceChartPoint[] =
    chartTab === "views" ? viewsChartData : followerChartData
  const isInstagram = account?.platform === "instagram"
  const engagementData = useMemo(
    () => buildEngagementData(videos, !isInstagram),
    [videos, isInstagram],
  )
  const weeklyData = useMemo(() => buildWeeklyData(videos), [videos])

  const sortedVideos = useMemo(() => [...videos].sort((a, b) => {
    if (videoSort === "views")    return (b.views ?? 0) - (a.views ?? 0)
    if (videoSort === "virality") return b.virality_score - a.virality_score
    return new Date(b.posted_at ?? 0).getTime() - new Date(a.posted_at ?? 0).getTime()
  }), [videos, videoSort])

  const topVideo = sortedVideos[0]

  if (loading) {
    return <div className="max-w-7xl space-y-4"><Skeleton className="h-4 w-28" /><DetailSkeleton /></div>
  }

  if (error && !account) {
    return (
      <div className="max-w-7xl space-y-4">
        <Link href="/analytics" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Analytics
        </Link>
        <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-red-500/10 bg-red-500/5">
          <AlertCircle className="w-8 h-8 text-red-400 mb-3" />
          <p className="text-sm font-medium text-white mb-1">Failed to load account</p>
          <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.06] text-zinc-200 text-sm font-medium mt-3">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      </div>
    )
  }

  if (!account) return null
  const cfg = PLATFORM_CONFIG[account.platform]

  const accountTotalViews = Number(account.total_views ?? 0)
  const displayTotalViews = accountTotalViews > 0 ? accountTotalViews : videoAggregates.total_views

  const statCards = [
    { label: "Total Views",       value: formatStatNumber(displayTotalViews),              icon: PlayCircle,    color: "text-blue-400",    bg: "bg-blue-500/10"    },
    { label: "Avg Views / Video", value: formatStatNumber(Number(account.avg_views ?? 0)), icon: BarChart2,     color: "text-purple-400",  bg: "bg-purple-500/10"  },
    { label: "Engagement Rate",   value: `${Number(account.engagement_rate ?? 0).toFixed(1)}%`, icon: Activity, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Total Likes",       value: formatStatNumber(videoAggregates.total_likes),    icon: Heart,         color: "text-pink-400",    bg: "bg-pink-500/10"    },
    { label: "Total Comments",    value: formatStatNumber(videoAggregates.total_comments), icon: MessageCircle, color: "text-blue-400",    bg: "bg-blue-500/10"    },
    {
      label: "Est. CPM",
      value: calcEstCpmValue(account.platform, displayTotalViews),
      icon: DollarSign,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      tooltip: "Estimated based on average platform CPM rates. Actual rates may vary.",
    },
  ]

  const PIE_COLORS = ["#a855f7", "#3b82f6", "#10b981"]

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Back */}
      <Link href="/analytics" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Analytics
      </Link>

      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="w-14 h-14 ring-2 ring-purple-500/20">
            <AvatarImage src={account.avatar_url ?? ""} />
            <AvatarFallback className="bg-purple-600/20 text-purple-400 text-lg font-bold">
              {account.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-semibold text-white tracking-tight">
                {account.display_name ?? account.username}
              </h1>
              <span
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium"
                style={{ backgroundColor: cfg.bgColor, color: cfg.fgColor }}
              >
                <PlatformIcon platform={account.platform} className="w-3 h-3" />
                {cfg.label}
              </span>
            </div>
            <p className="text-sm text-zinc-500">@{account.username} · {formatNumber(account.follower_count)} followers</p>
            {account.last_synced_at && (
              <p className="text-xs text-zinc-600 mt-0.5">Last synced: <span className="text-zinc-500">{timeAgo(account.last_synced_at)}</span></p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:ml-auto flex-wrap">
          <button
            onClick={() => setCampaignModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-600/15 border border-purple-500/25 text-purple-300 text-sm font-medium hover:bg-purple-600/25 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add to Campaign
          </button>
          {account.profile_url && (
            <a href={account.profile_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-400 hover:text-zinc-200 transition-all">
              <ExternalLink className="w-3.5 h-3.5" /> Profile
            </a>
          )}
          <button
            onClick={handleSyncNow}
            disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-sm font-medium transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing…" : "Sync Now"}
          </button>
        </div>
      </div>

      {/* ── Stat cards ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {statCards.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* ── Charts row ─────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Main performance chart */}
        <div className="xl:col-span-2 rounded-xl border border-white/[0.06] bg-[#111111] p-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              {(["views", "followers"] as ChartTab[]).map(t => (
                <button
                  key={t}
                  onClick={() => setChartTab(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${chartTab === t ? "bg-purple-600 text-white" : "text-zinc-500 hover:text-zinc-300 bg-white/[0.03]"}`}
                >
                  {t === "views" ? "Daily Views" : "Follower Growth"}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 bg-white/[0.04] rounded-lg p-0.5">
              {DATE_TABS.map(tab => (
                <button key={tab.label} onClick={() => setActiveDays(tab.days)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeDays === tab.days ? "bg-purple-600 text-white" : "text-zinc-500 hover:text-zinc-300"}`}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          {displayData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[220px] text-center">
              <BarChart3 className="w-8 h-8 text-zinc-700 mb-2" />
              <p className="text-sm text-zinc-500">
                {chartTab === "views" ? "No view history yet" : "No follower history yet"}
              </p>
              <p className="text-xs text-zinc-600 mt-1">
                {chartTab === "views"
                  ? "Sync this account daily to build view history"
                  : "Sync this account to record follower snapshots"}
              </p>
            </div>
          ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={displayData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "#52525b", fontSize: 11 }} tickLine={false} axisLine={false} interval={Math.floor(activeDays / 6)} />
              <YAxis tick={{ fill: "#52525b", fontSize: 11 }} tickLine={false} axisLine={false}
                tickFormatter={(v: number) => chartTab === "views" ? formatChartViews(v) : formatNumber(v)} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey={chartTab === "views" ? "views" : "followers"}
                stroke="#7C3AED" strokeWidth={2} fill="url(#areaGrad)" dot={false}
                activeDot={{ r: 4, fill: "#7C3AED", stroke: "#0a0a0a", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
          )}
        </div>

        {/* Engagement breakdown donut */}
        <div className="rounded-xl border border-white/[0.06] bg-[#111111] p-5">
          <h3 className="text-[14px] font-semibold text-white mb-1">Engagement Mix</h3>
          <p className="text-xs text-zinc-500 mb-4">Distribution across all videos</p>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <PieChart width={160} height={160}>
              <Pie data={engagementData} cx={75} cy={75} innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                {engagementData.map((entry, i) => (
                  <Cell key={entry.name} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
            </PieChart>
          </div>
          <div className="mt-3 space-y-2">
            {engagementData.map((e, i) => (
              <div key={e.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div style={{ width: "8px", height: "8px", borderRadius: "2px", backgroundColor: PIE_COLORS[i] }} />
                  <span className="text-xs text-zinc-400">{e.name}</span>
                </div>
                <span className="text-xs font-semibold text-zinc-200">{formatNumber(e.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Weekly posting pattern ──────────────────────── */}
      <div className="rounded-xl border border-white/[0.06] bg-[#111111] p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[14px] font-semibold text-white">Weekly Views Pattern</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Which days drive the most performance</p>
          </div>
        </div>
        {videos.length === 0 ? (
          <p className="text-sm text-zinc-500 text-center py-8">Post videos to see weekly patterns</p>
        ) : (
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={weeklyData} margin={{ top: 0, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: "#52525b", fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: "#52525b", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="views" fill="#7C3AED" radius={[3, 3, 0, 0]} opacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
        )}
      </div>

      {/* ── Top video spotlight ─────────────────────────── */}
      {topVideo && (
        <div className="rounded-xl border border-purple-500/15 bg-purple-600/5 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-[13px] font-semibold text-white">Top Performing Video</span>
            <span className="ml-auto text-xs text-zinc-500">{formatDate(topVideo.posted_at)}</span>
          </div>
          <div className="flex items-start gap-4 flex-wrap">
            <VideoThumbnail url={topVideo.thumbnail_url} platform={topVideo.platform} size="spotlight" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-200 mb-3 line-clamp-2">{topVideo.caption}</p>
              <div className="flex flex-wrap gap-4">
                {[
                  { icon: Eye,           value: formatNumber(topVideo.views ?? 0), label: "views",    color: "text-blue-400" },
                  { icon: Heart,         value: formatNumber(topVideo.likes),        label: "likes",    color: "text-pink-400" },
                  { icon: MessageCircle, value: formatNumber(topVideo.comments),      label: "comments", color: "text-emerald-400" },
                  { icon: Share2,        value: formatSharesValue(account.platform, topVideo.shares), label: "shares", color: "text-amber-400" },
                ].map(m => {
                  const Icon = m.icon
                  return (
                    <div key={m.label} className="flex items-center gap-1.5">
                      <Icon className={`w-3.5 h-3.5 ${m.color}`} />
                      <span className="text-sm font-semibold text-zinc-200">{m.value}</span>
                      <span className="text-xs text-zinc-500">{m.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${viralityLabel(topVideo.virality_score).className}`}>
                {viralityLabel(topVideo.virality_score).label}
              </span>
              <span className="text-xs text-zinc-500">Virality {topVideo.virality_score.toFixed(1)}/10</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Videos table ───────────────────────────────── */}
      <div className="rounded-xl border border-white/[0.06] bg-[#111111] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] flex-wrap gap-2">
          <div>
            <h2 className="text-[15px] font-semibold text-white">All Videos</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Click any row for full details</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">{videos.length} videos</span>
            <div className="relative">
              <select
                value={videoSort}
                onChange={e => setVideoSort(e.target.value as typeof videoSort)}
                className="appearance-none pl-3 pr-7 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-xs text-zinc-300 outline-none cursor-pointer"
              >
                <option value="views">Sort: Views</option>
                <option value="virality">Sort: Virality</option>
                <option value="date">Sort: Date</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.04]">
                <th className="text-left px-5 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Video</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Posted</th>
                <th className="text-right px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Views</th>
                <th className="text-right px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Likes</th>
                <th className="text-right px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Comments</th>
                <th className="text-right px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Shares</th>
                <th className="text-center px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Virality</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {sortedVideos.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <Video className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                    <p className="text-sm text-zinc-400">No videos tracked yet</p>
                    <p className="text-xs text-zinc-600 mt-1">Sync this account to pull in content</p>
                  </td>
                </tr>
              )}
              {sortedVideos.map((video) => {
                const vl = viralityLabel(video.virality_score)
                return (
                  <tr key={video.id} onClick={() => { setSelectedVideo(video); setVideoDrawerOpen(true) }}
                    className="hover:bg-white/[0.02] transition-colors cursor-pointer group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <VideoThumbnail url={video.thumbnail_url} platform={video.platform} />
                        <p className="text-sm text-zinc-200 group-hover:text-white transition-colors line-clamp-2 max-w-[200px]">{video.caption}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4"><span className="text-xs text-zinc-500 whitespace-nowrap">{formatDate(video.posted_at)}</span></td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <ArrowUpRight className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-zinc-200">{formatNumber(video.views ?? 0)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right"><span className="text-sm text-zinc-400">{formatNumber(video.likes)}</span></td>
                    <td className="px-4 py-4 text-right"><span className="text-sm text-zinc-400">{formatNumber(video.comments)}</span></td>
                    <td className="px-4 py-4 text-right"><span className="text-sm text-zinc-400">{formatSharesValue(account.platform, video.shares)}</span></td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${vl.className}`}>{vl.label}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-white/[0.04] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="text-xs text-zinc-600">{videos.length} video{videos.length !== 1 ? "s" : ""} tracked</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3 text-zinc-500" />
                <span className="text-xs text-zinc-500">{formatNumber(videos.reduce((s, v) => s + (v.views ?? 0), 0))} total views</span>
              </div>
              <div className="flex items-center gap-1"><Users className="w-3 h-3 text-zinc-500" /><span className="text-xs text-zinc-500">{formatNumber(account.follower_count)} followers</span></div>
            </div>
          </div>
          <button onClick={load} className="flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
      </div>

      <VideoDetailDrawer video={selectedVideo} open={videoDrawerOpen} onOpenChange={setVideoDrawerOpen} />
      {campaignModalOpen && (
        <AddToCampaignModal
          onClose={() => setCampaignModalOpen(false)}
          creatorName={account.display_name ?? account.username}
          userId={user?.id}
        />
      )}
    </div>
  )
}
