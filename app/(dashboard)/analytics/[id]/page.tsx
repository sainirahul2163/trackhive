"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeft, RefreshCw, ExternalLink, TrendingUp,
  Eye, BarChart3, Video, ArrowUpRight, ArrowDownRight,
  AlertCircle, DollarSign, Heart, MessageCircle, Share2,
  Bookmark, Plus, Users, Zap, ChevronDown,
} from "lucide-react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
} from "recharts"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { PlatformIcon, PLATFORM_CONFIG, formatNumber, viralityLabel } from "@/lib/platform"
import { VideoDetailDrawer } from "@/components/analytics/video-detail-drawer"
import { fetchTrackedAccount, fetchTrackedVideos } from "@/lib/analytics-data"
import type { TrackedAccount, TrackedVideo, Platform } from "@/types"

/* ─── Deterministic mock helpers ────────────────────── */
function seededRand(seed: number, min: number, max: number) {
  const x = Math.sin(seed) * 10000
  return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min
}

function buildMockAccount(id: string): TrackedAccount {
  const s = id.charCodeAt(0) + id.charCodeAt(id.length - 1)
  const platforms: Platform[] = ["tiktok", "instagram", "youtube", "facebook"]
  const names = ["maya.creates", "jakebreaks", "techbyleo", "reels_anna", "lifewithkim", "creator_pro"]
  const username = names[seededRand(s, 0, names.length - 1)]
  return {
    id,
    workspace_id: null,
    platform: platforms[seededRand(s + 1, 0, 3)],
    username,
    display_name: username.replace(/[._]/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    profile_url: `https://tiktok.com/@${username}`,
    follower_count: seededRand(s + 2, 80000, 2500000),
    total_views: seededRand(s + 3, 5000000, 120000000),
    avg_views: seededRand(s + 4, 180000, 4200000),
    engagement_rate: (seededRand(s + 5, 30, 95) / 10),
    last_synced_at: new Date(Date.now() - seededRand(s + 6, 60000, 3600000)).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
  }
}

function buildMockVideos(accountId: string, count = 12): TrackedVideo[] {
  const captions = [
    "POV: morning routine that changed my life ✨",
    "This product literally broke the internet 🔥",
    "Day in my life NYC — real talk",
    "How I gained 100K in 30 days (no bs)",
    "The hack nobody talks about 👀",
    "Before vs after — you won't believe this",
    "Storytime: what happened at the brand event",
    "Rating every trendy product so you don't have to",
    "The viral filter everyone is using rn",
    "I tried being aesthetic for a week",
    "Honest review after 60 days of using it",
    "The collab that almost didn't happen",
  ]
  const s = accountId.charCodeAt(0)
  return Array.from({ length: count }, (_, i) => ({
    id: `${accountId}-v${i}`,
    account_id: accountId,
    platform: "tiktok" as Platform,
    video_url: "#",
    thumbnail_url: null,
    caption: captions[i % captions.length],
    views: seededRand(s + i * 7, 50000, 12000000),
    likes: seededRand(s + i * 3, 2000, 800000),
    comments: seededRand(s + i * 5, 100, 30000),
    shares: seededRand(s + i * 11, 50, 80000),
    saves: seededRand(s + i * 13, 100, 200000),
    engagement_rate: seededRand(s + i * 2, 30, 120) / 10,
    virality_score: seededRand(s + i * 4, 10, 98) / 10,
    tags: [["ugc", "beauty", "review", "viral", "fyp", "tech"][i % 6]],
    posted_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * (i * 3 + 1)).toISOString(),
    created_at: new Date().toISOString(),
  }))
}

function buildChartData(days: number, seed: number) {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (days - 1 - i))
    const base = seededRand(seed + i, 200000, 1800000)
    return {
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      views: base,
      followers: seededRand(seed + i + 1, 500, 8000),
    }
  })
}

function buildEngagementData(videos: TrackedVideo[]) {
  const totals = videos.reduce((acc, v) => ({
    likes: acc.likes + v.likes,
    comments: acc.comments + v.comments,
    shares: acc.shares + v.shares,
    saves: acc.saves + (v.saves ?? 0),
  }), { likes: 0, comments: 0, shares: 0, saves: 0 })

  return [
    { name: "Likes",    value: totals.likes,    color: "#a855f7" },
    { name: "Comments", value: totals.comments, color: "#3b82f6" },
    { name: "Shares",   value: totals.shares,   color: "#10b981" },
    { name: "Saves",    value: totals.saves,    color: "#f59e0b" },
  ]
}

function buildWeeklyData(seed: number) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  return days.map((day, i) => ({
    day,
    views: seededRand(seed + i * 3, 80000, 1200000),
  }))
}

/* ─── Shared types ───────────────────────────────────── */
type ChartTab = "views" | "followers"

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
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
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
const MOCK_CAMPAIGNS = [
  { id: "c1", name: "Summer Drop 2025", status: "Active" },
  { id: "c2", name: "Back to School", status: "Active" },
  { id: "c3", name: "Collab Series Q3", status: "Draft" },
]

function AddToCampaignModal({ onClose, creatorName }: { onClose: () => void; creatorName: string }) {
  const [selected, setSelected] = useState("")
  const [done, setDone] = useState(false)

  function handleAdd() {
    if (!selected) return
    setDone(true)
    setTimeout(onClose, 1200)
  }

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
            <p className="text-xs text-zinc-500 mb-4">Add <span className="text-zinc-300 font-medium">{creatorName}</span> to an active campaign.</p>
            <div className="space-y-2 mb-5">
              {MOCK_CAMPAIGNS.map(c => (
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
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">{c.status}</span>
                  </div>
                </button>
              ))}
            </div>
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
function StatCard({ label, value, icon: Icon, color, bg, change, up }: {
  label: string; value: string; icon: React.ElementType
  color: string; bg: string; change: string; up: boolean
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#111111] p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">{label}</span>
        <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center`}>
          <Icon className={`w-3.5 h-3.5 ${color}`} />
        </div>
      </div>
      <p className="text-xl font-bold text-white">{value}</p>
      <div className="flex items-center gap-1 mt-1">
        {up ? <ArrowUpRight className="w-3 h-3 text-emerald-400" /> : <ArrowDownRight className="w-3 h-3 text-red-400" />}
        <span className={`text-xs font-medium ${up ? "text-emerald-400" : "text-red-400"}`}>{change}</span>
        <span className="text-xs text-zinc-600">vs last period</span>
      </div>
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────── */
const DATE_TABS = [{ label: "7D", days: 7 }, { label: "30D", days: 30 }, { label: "90D", days: 90 }]

function formatDate(iso: string | null) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export default function AccountDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [account, setAccount] = useState<TrackedAccount | null>(null)
  const [videos, setVideos] = useState<TrackedVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeDays, setActiveDays] = useState(30)
  const [chartTab, setChartTab] = useState<ChartTab>("views")
  const [selectedVideo, setSelectedVideo] = useState<TrackedVideo | null>(null)
  const [videoDrawerOpen, setVideoDrawerOpen] = useState(false)
  const [campaignModalOpen, setCampaignModalOpen] = useState(false)
  const [videoSort, setVideoSort] = useState<"views" | "virality" | "date">("views")

  const chartData = useMemo(() => buildChartData(90, id.charCodeAt(0)), [id])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [acct, vids] = await Promise.all([
        fetchTrackedAccount(id),
        fetchTrackedVideos(id),
      ])
      setAccount(acct)
      setVideos(vids.length > 0 ? vids : buildMockVideos(id))
    } catch {
      // Supabase not set up yet — fall back to rich mock data
      setAccount(buildMockAccount(id))
      setVideos(buildMockVideos(id))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  const displayData = chartData.slice(-activeDays)
  const engagementData = useMemo(() => buildEngagementData(videos), [videos])
  const weeklyData = useMemo(() => buildWeeklyData(id.charCodeAt(0)), [id])

  const sortedVideos = useMemo(() => [...videos].sort((a, b) => {
    if (videoSort === "views") return b.views - a.views
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

  // Estimated CPM & revenue
  const estCpm = ((account.engagement_rate / 10) * 8 + 6).toFixed(2)
  const estMonthly = (account.avg_views * 4 * parseFloat(estCpm) / 1000).toFixed(0)

  const statCards = [
    { label: "Total Views",      value: formatNumber(account.total_views),            icon: Eye,         color: "text-blue-400",    bg: "bg-blue-500/10",    change: "+18.2%", up: true  },
    { label: "Avg Views / Video", value: formatNumber(account.avg_views),             icon: BarChart3,   color: "text-purple-400",  bg: "bg-purple-500/10",  change: "+5.4%",  up: true  },
    { label: "Engagement Rate",  value: `${account.engagement_rate.toFixed(1)}%`,     icon: TrendingUp,  color: "text-emerald-400", bg: "bg-emerald-500/10", change: "-0.3%",  up: false },
    { label: "Est. CPM",         value: `$${estCpm}`,                                 icon: DollarSign,  color: "text-amber-400",   bg: "bg-amber-500/10",   change: "+$1.20", up: true  },
  ]

  const PIE_COLORS = ["#a855f7", "#3b82f6", "#10b981", "#f59e0b"]

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
              <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${cfg.bg} ${cfg.textColor}`}>
                <PlatformIcon platform={account.platform} className="w-3 h-3" />
                {cfg.label}
              </span>
            </div>
            <p className="text-sm text-zinc-500">@{account.username} · {formatNumber(account.follower_count)} followers</p>
            <p className="text-xs text-zinc-600 mt-0.5">Est. monthly revenue: <span className="text-emerald-400 font-semibold">${parseInt(estMonthly).toLocaleString()}</span></p>
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
          <button onClick={load} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-all">
            <RefreshCw className="w-3.5 h-3.5" /> Sync
          </button>
        </div>
      </div>

      {/* ── Stat cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
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
                tickFormatter={(v: number) => chartTab === "views" ? `${(v / 1000000).toFixed(1)}M` : formatNumber(v)} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey={chartTab === "views" ? "views" : "followers"}
                stroke="#7C3AED" strokeWidth={2} fill="url(#areaGrad)" dot={false}
                activeDot={{ r: 4, fill: "#7C3AED", stroke: "#0a0a0a", strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
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
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={weeklyData} margin={{ top: 0, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: "#52525b", fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: "#52525b", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="views" fill="#7C3AED" radius={[3, 3, 0, 0]} opacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
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
            <div className="w-[100px] h-16 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
              <Video className="w-5 h-5 text-zinc-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-200 mb-3 line-clamp-2">{topVideo.caption}</p>
              <div className="flex flex-wrap gap-4">
                {[
                  { icon: Eye,           value: formatNumber(topVideo.views),    label: "views",    color: "text-blue-400" },
                  { icon: Heart,         value: formatNumber(topVideo.likes),    label: "likes",    color: "text-pink-400" },
                  { icon: MessageCircle, value: formatNumber(topVideo.comments), label: "comments", color: "text-emerald-400" },
                  { icon: Share2,        value: formatNumber(topVideo.shares),   label: "shares",   color: "text-amber-400" },
                  { icon: Bookmark,      value: formatNumber(topVideo.saves ?? 0), label: "saves",  color: "text-purple-400" },
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
              {sortedVideos.map((video) => {
                const vl = viralityLabel(video.virality_score)
                return (
                  <tr key={video.id} onClick={() => { setSelectedVideo(video); setVideoDrawerOpen(true) }}
                    className="hover:bg-white/[0.02] transition-colors cursor-pointer group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-[72px] h-12 rounded-lg bg-white/[0.04] border border-white/[0.06] overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {video.thumbnail_url
                            ? <img src={video.thumbnail_url} alt="" className="w-full h-full object-cover" />
                            : <Video className="w-4 h-4 text-zinc-600" />
                          }
                        </div>
                        <p className="text-sm text-zinc-200 group-hover:text-white transition-colors line-clamp-2 max-w-[200px]">{video.caption}</p>
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
                    <td className="px-4 py-4 text-right"><span className="text-sm text-zinc-400">{formatNumber(video.shares)}</span></td>
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
              <div className="flex items-center gap-1"><Eye className="w-3 h-3 text-zinc-500" /><span className="text-xs text-zinc-500">{formatNumber(videos.reduce((s, v) => s + v.views, 0))} total views</span></div>
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
        />
      )}
    </div>
  )
}
