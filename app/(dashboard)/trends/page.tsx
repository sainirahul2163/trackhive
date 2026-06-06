"use client"

import { useState, useMemo, useEffect } from "react"
import {
  Search, Bookmark, BookmarkCheck, Play, TrendingUp,
  Sparkles, Copy, Download, ArrowRight, Plus,
  ChevronDown, Flame, BarChart2,
  Send, Check,
} from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts"
import { PlatformIcon, PLATFORM_CONFIG, formatNumber } from "@/lib/platform"
import { supabase } from "@/lib/supabase"
import { fetchTrendVideos, fetchBoards, createBoard } from "@/lib/trends-data"
import { useUser } from "@/lib/use-user"
import type { TrendVideo, InspirationBoard, Platform, TrendNiche, ContentFormat } from "@/types"
import { cn } from "@/lib/utils"

// ── Config ────────────────────────────────────────────────────
const FORMAT_LABELS: Record<ContentFormat, string> = {
  product_demo: "Product Demo", testimonial: "Testimonial", lifestyle: "Lifestyle",
  hook_first: "Hook-First", before_after: "Before/After", storytime: "Storytime", other: "Other",
}

function viralityBadge(score: number) {
  if (score >= 9) return { label: "🔥 Viral",   className: "bg-red-500/10 text-red-400 border-red-500/20" }
  if (score >= 7) return { label: "📈 Rising",  className: "bg-amber-500/10 text-amber-400 border-amber-500/20" }
  return             { label: "✓ Normal",        className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" }
}

// ── Tab definitions ───────────────────────────────────────────
const TABS = ["Library", "Weekly Digest", "Brief Generator"] as const
type Tab = typeof TABS[number]

// ── Filter select ─────────────────────────────────────────────
function FilterSelect({ value, onChange, options }: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="pl-3 pr-7 py-2 rounded-lg bg-[#111111] border border-white/[0.06] text-sm text-zinc-300 outline-none cursor-pointer appearance-none hover:border-white/10 transition-colors"
      >
        {options.map(o => <option key={o.value} value={o.value} className="bg-[#1a1a1a]">{o.label}</option>)}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" />
    </div>
  )
}

// ── Video card ────────────────────────────────────────────────
function VideoCard({
  video, saved, onSave, selectable, selected, onSelect,
}: {
  video: TrendVideo
  saved?: boolean
  onSave?: (video: TrendVideo) => void
  selectable?: boolean
  selected?: boolean
  onSelect?: (video: TrendVideo) => void
}) {
  const [hovering, setHovering] = useState(false)
  const platCfg = PLATFORM_CONFIG[video.platform]
  const badge = viralityBadge(video.virality_score)

  return (
    <div
      className={cn(
        "relative rounded-xl border overflow-hidden cursor-pointer transition-all duration-200 group",
        "bg-[#111111] hover:scale-[1.015]",
        selected
          ? "border-purple-500/60 ring-2 ring-purple-500/20"
          : "border-white/[0.06] hover:border-white/10"
      )}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onClick={() => selectable && onSelect?.(video)}
    >
      {/* Thumbnail */}
      <div className="aspect-video relative overflow-hidden bg-white/[0.04]">
        {video.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={video.thumbnail_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="w-8 h-8 text-zinc-700" />
          </div>
        )}

        {/* Hover overlay */}
        {hovering && !selectable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <button className="px-3 py-1.5 rounded-lg bg-white text-black text-xs font-semibold hover:bg-zinc-100 transition-colors">
              View Details
            </button>
          </div>
        )}

        {/* Selection check */}
        {selectable && selected && (
          <div className="absolute inset-0 bg-purple-600/20 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          </div>
        )}

        {/* Platform badge */}
        <div className={`absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${platCfg.bg} ${platCfg.textColor}`}>
          <PlatformIcon platform={video.platform} className="w-2.5 h-2.5" />
          {platCfg.label}
        </div>

        {/* Views overlay */}
        <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between">
          <span className="text-white font-bold text-sm drop-shadow-lg">{formatNumber(video.views)}</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold border ${badge.className}`}>{badge.label}</span>
        </div>
      </div>

      {/* Card body */}
      <div className="p-3 space-y-2">
        <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">{video.caption}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-500 font-medium">{video.creator_handle}</span>
            {video.content_format && (
              <span className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[10px] text-zinc-500">
                {FORMAT_LABELS[video.content_format]}
              </span>
            )}
          </div>
          {!selectable && onSave && (
            <button
              onClick={e => { e.stopPropagation(); onSave(video) }}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                saved
                  ? "text-purple-400 bg-purple-600/10"
                  : "text-zinc-600 hover:text-purple-400 hover:bg-purple-600/10"
              )}
              title={saved ? "Saved" : "Save to Board"}
            >
              {saved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Save to board dropdown ────────────────────────────────────
function SaveToBoardDropdown({
  video, boards, onSave, onNewBoard, onClose,
}: {
  video: TrendVideo
  boards: InspirationBoard[]
  onSave: (boardId: string, videoId: string) => void
  onNewBoard: () => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-32" onClick={onClose}>
      <div
        className="w-64 rounded-xl border border-white/[0.08] shadow-2xl overflow-hidden"
        style={{ backgroundColor: "#1a1a1a" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-white/[0.06]">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Save to Board</p>
          <p className="text-[11px] text-zinc-600 mt-0.5 truncate">{video.caption?.slice(0, 40)}...</p>
        </div>
        <div className="py-1 max-h-48 overflow-y-auto">
          {boards.map(board => (
            <button
              key={board.id}
              onClick={() => { onSave(board.id, video.id); onClose() }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-white/[0.04] transition-colors text-left"
            >
              <Bookmark className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
              {board.name}
            </button>
          ))}
        </div>
        <div className="border-t border-white/[0.06]">
          <button
            onClick={() => { onNewBoard(); onClose() }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-purple-400 hover:bg-purple-600/10 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Board
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────
export default function TrendsPage() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState<Tab>("Library")

  // Library state — videos are global discovery content; boards are user-scoped
  const [videos, setVideos] = useState<TrendVideo[]>([])
  const [videosLoading, setVideosLoading] = useState(true)
  const [boards, setBoards] = useState<InspirationBoard[]>([])
  const [savedVideoIds, setSavedVideoIds] = useState<Set<string>>(new Set())
  const [savingVideo, setSavingVideo] = useState<TrendVideo | null>(null)
  const [search, setSearch] = useState("")
  const [platFilter, setPlatFilter] = useState<Platform | "all">("all")
  const [nicheFilter, setNicheFilter] = useState<TrendNiche | "all">("all")
  const [formatFilter, setFormatFilter] = useState<ContentFormat | "all">("all")
  const [sortBy, setSortBy] = useState("views")
  const [newBoardName, setNewBoardName] = useState("")
  const [showNewBoard, setShowNewBoard] = useState(false)
  const [creatingBoard, setCreatingBoard] = useState(false)

  useEffect(() => {
    setVideosLoading(true)
    fetchTrendVideos()
      .then(setVideos)
      .catch(() => setVideos([]))
      .finally(() => setVideosLoading(false))
  }, [])

  useEffect(() => {
    if (!user) return
    fetchBoards(user.id).then(setBoards).catch(() => setBoards([]))
  }, [user])

  // Brief generator state
  const [briefStep, setBriefStep] = useState<1 | 2 | 3>(1)
  const [selectedForBrief, setSelectedForBrief] = useState<Set<string>>(new Set())
  const [briefForm, setBriefForm] = useState({ brand: "", product: "", goal: "", audience: "", tone: "", platform: "" })
  const [generating, setGenerating] = useState(false)
  const [briefGenerated, setBriefGenerated] = useState(false)
  const [copiedBrief, setCopiedBrief] = useState(false)

  // Filtered + sorted videos
  const filtered = useMemo(() => {
    let list = videos.filter(v => {
      if (search && !v.caption?.toLowerCase().includes(search.toLowerCase()) && !v.creator_handle.toLowerCase().includes(search.toLowerCase())) return false
      if (platFilter !== "all" && v.platform !== platFilter) return false
      if (nicheFilter !== "all" && v.niche !== nicheFilter) return false
      if (formatFilter !== "all" && v.content_format !== formatFilter) return false
      return true
    })
    if (sortBy === "views") list = [...list].sort((a, b) => b.views - a.views)
    else if (sortBy === "virality") list = [...list].sort((a, b) => b.virality_score - a.virality_score)
    else if (sortBy === "newest") list = [...list].sort((a, b) => new Date(b.posted_at ?? "").getTime() - new Date(a.posted_at ?? "").getTime())
    return list
  }, [videos, search, platFilter, nicheFilter, formatFilter, sortBy])

  async function handleSaveToBoard(boardId: string, videoId: string) {
    setSavedVideoIds(prev => new Set(Array.from(prev).concat(videoId)))
    try {
      await supabase.from("board_videos").insert({ board_id: boardId, video_id: videoId })
    } catch { /* optimistic */ }
  }

  async function handleCreateBoard() {
    if (!newBoardName.trim() || !user) return
    setCreatingBoard(true)
    try {
      const board = await createBoard(newBoardName.trim(), user.id)
      setBoards(prev => [...prev, board])
    } catch { /* show error via empty boards */ }
    setNewBoardName(""); setShowNewBoard(false); setCreatingBoard(false)
  }

  function toggleBriefVideo(video: TrendVideo) {
    setSelectedForBrief(prev => {
      const next = new Set(prev)
      if (next.has(video.id)) { next.delete(video.id) } else if (next.size < 5) { next.add(video.id) }
      return next
    })
  }

  function handleGenerate() {
    setGenerating(true)
    setTimeout(() => { setGenerating(false); setBriefGenerated(true) }, 2000)
  }

  const nicheBarData = useMemo(() => {
    const byFormat = new Map<string, number>()
    for (const v of videos) {
      const key = v.content_format ?? "other"
      byFormat.set(key, (byFormat.get(key) ?? 0) + v.virality_score)
    }
    return Array.from(byFormat.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([niche, growth]) => ({ niche: niche.replace(/_/g, " "), growth: Math.round(growth * 10) }))
  }, [videos])

  const topFormats = useMemo(() => {
    const byFormat = new Map<string, { count: number; avgVirality: number }>()
    for (const v of videos) {
      const key = v.content_format ?? "other"
      const cur = byFormat.get(key) ?? { count: 0, avgVirality: 0 }
      byFormat.set(key, { count: cur.count + 1, avgVirality: cur.avgVirality + v.virality_score })
    }
    return Array.from(byFormat.entries())
      .map(([format, stats]) => ({
        rank: 0,
        format: format.replace(/_/g, " "),
        desc: `${stats.count} trending video${stats.count !== 1 ? "s" : ""} in your library`,
        avgVirality: stats.avgVirality / stats.count,
        change: `avg ${(stats.avgVirality / stats.count).toFixed(1)}`,
        thumbnail: null as string | null,
      }))
      .sort((a, b) => b.avgVirality - a.avgVirality)
      .slice(0, 5)
      .map((f, i) => ({ ...f, rank: i + 1, thumbnail: videos.find(v => (v.content_format ?? "other").replace(/_/g, " ") === f.format)?.thumbnail_url ?? null }))
  }, [videos])

  interface ChartTTProps { active?: boolean; payload?: Array<{ value: number }>; label?: string }
  const ChartTT = ({ active, payload, label }: ChartTTProps) => {
    if (active && payload?.length) return (
      <div className="bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-[11px] text-zinc-500">{label}</p>
        <p className="text-sm font-semibold text-purple-400">{payload[0]?.value}% engagement lift</p>
      </div>
    )
    return null
  }

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-white tracking-tight">Trends</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Discover viral formats, save inspiration, and generate briefs.</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-white/[0.03] border border-white/[0.06] rounded-lg p-1 w-fit">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab ? "bg-[#1a1a1a] text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >{tab}</button>
        ))}
      </div>

      {/* ══ LIBRARY TAB ══════════════════════════════════════════ */}
      {activeTab === "Library" && (
        <div className="flex gap-5">
          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Filters row */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search videos..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#111111] border border-white/[0.06] text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-purple-500/40 transition-colors"
                />
              </div>
              <FilterSelect value={platFilter} onChange={v => setPlatFilter(v as Platform | "all")} options={[
                { value: "all", label: "All Platforms" },
                { value: "tiktok", label: "TikTok" }, { value: "instagram", label: "Instagram" },
                { value: "youtube", label: "YouTube" }, { value: "facebook", label: "Facebook" },
              ]} />
              <FilterSelect value={nicheFilter} onChange={v => setNicheFilter(v as TrendNiche | "all")} options={[
                { value: "all", label: "All Niches" },
                { value: "beauty", label: "Beauty" }, { value: "tech", label: "Tech" },
                { value: "finance", label: "Finance" }, { value: "fitness", label: "Fitness" },
                { value: "food", label: "Food" }, { value: "gaming", label: "Gaming" },
                { value: "lifestyle", label: "Lifestyle" },
              ]} />
              <FilterSelect value={formatFilter} onChange={v => setFormatFilter(v as ContentFormat | "all")} options={[
                { value: "all", label: "All Formats" },
                { value: "product_demo", label: "Product Demo" }, { value: "testimonial", label: "Testimonial" },
                { value: "lifestyle", label: "Lifestyle" }, { value: "hook_first", label: "Hook-First" },
                { value: "before_after", label: "Before/After" }, { value: "storytime", label: "Storytime" },
              ]} />
              <FilterSelect value={sortBy} onChange={setSortBy} options={[
                { value: "views", label: "Most Views" },
                { value: "virality", label: "Fastest Growing" },
                { value: "newest", label: "Newest" },
              ]} />
              <span className="text-xs text-zinc-600 ml-auto">{filtered.length} videos</span>
            </div>

            {/* Video grid */}
            {videosLoading ? (
              <div className="flex items-center justify-center py-24 rounded-xl border border-white/[0.06] bg-[#111111]">
                <p className="text-sm text-zinc-500">Loading trend videos…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 rounded-xl border border-white/[0.06] bg-[#111111]">
                <TrendingUp className="w-8 h-8 text-zinc-600 mb-3" />
                <p className="text-sm font-medium text-zinc-400">{videos.length === 0 ? "No trend videos yet" : "No videos match your filters"}</p>
                <p className="text-xs text-zinc-600 mt-1">{videos.length === 0 ? "Trending content will appear here once synced." : "Try adjusting the platform, niche, or format filter."}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map(v => (
                  <VideoCard
                    key={v.id}
                    video={v}
                    saved={savedVideoIds.has(v.id)}
                    onSave={setSavingVideo}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Inspiration Boards sidebar */}
          <div className="w-56 flex-shrink-0 space-y-3">
            <div className="rounded-xl border border-white/[0.06] bg-[#111111] overflow-hidden">
              <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Boards</h3>
                <button onClick={() => setShowNewBoard(true)} className="p-1 rounded text-zinc-500 hover:text-purple-400 hover:bg-purple-600/10 transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="py-1">
                {boards.map(board => (
                  <button key={board.id} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left hover:bg-white/[0.03] transition-colors group">
                    <Bookmark className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                    <span className="text-sm text-zinc-300 group-hover:text-white transition-colors truncate">{board.name}</span>
                  </button>
                ))}
              </div>
              {showNewBoard && (
                <div className="px-3 py-3 border-t border-white/[0.06]">
                  <input
                    value={newBoardName} onChange={e => setNewBoardName(e.target.value)}
                    placeholder="Board name..." autoFocus
                    onKeyDown={e => { if (e.key === "Enter") handleCreateBoard(); if (e.key === "Escape") setShowNewBoard(false) }}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-xs text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-purple-500/40 transition-colors"
                  />
                  <div className="flex gap-1.5 mt-2">
                    <button onClick={() => setShowNewBoard(false)} className="flex-1 py-1 rounded-md text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Cancel</button>
                    <button onClick={handleCreateBoard} disabled={!newBoardName.trim() || creatingBoard} className="flex-1 py-1 rounded-md bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium transition-all disabled:opacity-50">
                      {creatingBoard ? "..." : "Create"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick stats */}
            <div className="rounded-xl border border-white/[0.06] bg-[#111111] p-4 space-y-3">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">This Week</p>
              {[
                { label: "Videos tracked", value: String(videos.length) },
                { label: "Avg viral score", value: videos.length ? (videos.reduce((s, v) => s + v.virality_score, 0) / videos.length).toFixed(1) : "—" },
                { label: "Top platform", value: videos.length ? PLATFORM_CONFIG[[...videos].sort((a, b) => b.views - a.views)[0].platform].label : "—" },
                { label: "Top format", value: topFormats[0]?.format ?? "—" },
              ].map(s => (
                <div key={s.label} className="flex justify-between text-xs">
                  <span className="text-zinc-500">{s.label}</span>
                  <span className="font-medium text-zinc-200">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ WEEKLY DIGEST TAB ════════════════════════════════════ */}
      {activeTab === "Weekly Digest" && (
        <div className="space-y-5 max-w-4xl">
          {videos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 rounded-xl border border-white/[0.06] bg-[#111111]">
              <Flame className="w-8 h-8 text-zinc-600 mb-3" />
              <p className="text-sm font-medium text-zinc-400">No weekly digest yet</p>
              <p className="text-xs text-zinc-600 mt-1">Trend videos will power your weekly insights once synced.</p>
            </div>
          ) : (
          <>
          <div className="rounded-xl border border-white/[0.06] bg-gradient-to-br from-purple-600/10 to-blue-600/5 p-6">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-5 h-5 text-orange-400" />
              <h2 className="text-lg font-bold text-white">This Week in UGC</h2>
            </div>
            <p className="text-sm text-zinc-400">
              Week of {new Date(Date.now() - 604800000).toLocaleDateString("en-US", { month: "long", day: "numeric" })} – {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
            <p className="text-xs text-zinc-500 mt-2">Based on {videos.length} trend video{videos.length !== 1 ? "s" : ""} in your library.</p>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-[#111111] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-4 h-4 text-orange-400" />
              <h3 className="text-[15px] font-semibold text-white">Top Formats</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {topFormats.map(f => (
                <div key={f.rank} className="flex gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-colors">
                  <div className="w-16 h-10 rounded overflow-hidden flex-shrink-0 bg-white/[0.04] flex items-center justify-center">
                    {f.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={f.thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Play className="w-4 h-4 text-zinc-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-zinc-500">#{f.rank}</span>
                      <span className="text-sm font-semibold text-white truncate">{f.format}</span>
                      <span className="ml-auto text-[11px] font-semibold text-emerald-400 flex-shrink-0">{f.change}</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-2">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {nicheBarData.length > 0 && (
          <div className="rounded-xl border border-white/[0.06] bg-[#111111] p-5">
            <div className="flex items-center gap-2 mb-5">
              <BarChart2 className="w-4 h-4 text-blue-400" />
              <h3 className="text-[15px] font-semibold text-white">Format Performance</h3>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={nicheBarData} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#52525b", fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="niche" tick={{ fill: "#a1a1aa", fontSize: 12 }} tickLine={false} axisLine={false} width={90} />
                <Tooltip content={<ChartTT />} />
                <Bar dataKey="growth" fill="#7C3AED" radius={[0, 4, 4, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          )}
          <div className="flex justify-center pt-2">
            <button
              onClick={() => setActiveTab("Brief Generator")}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-all active:scale-[0.98] shadow-lg shadow-purple-600/20"
            >
              <Sparkles className="w-4 h-4" />
              Generate Campaign Brief from This Week&apos;s Trends
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          </>
          )}
        </div>
      )}

      {/* ══ BRIEF GENERATOR TAB ══════════════════════════════════ */}
      {activeTab === "Brief Generator" && (
        <div className="max-w-3xl space-y-5">
          {/* Step indicator */}
          <div className="flex items-center gap-0">
            {(["Select Videos", "Context", "Generate"] as const).map((label, i) => {
              const s = i + 1; const done = s < briefStep; const active = s === briefStep
              return (
                <div key={label} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all",
                      done  ? "bg-purple-600 border-purple-600 text-white" :
                      active? "bg-purple-600/10 border-purple-500 text-purple-400" :
                              "bg-white/[0.04] border-white/10 text-zinc-600"
                    )}>
                      {done ? <Check className="w-4 h-4" /> : s}
                    </div>
                    <span className={`text-[10px] font-medium hidden sm:block ${active ? "text-purple-400" : done ? "text-zinc-400" : "text-zinc-600"}`}>{label}</span>
                  </div>
                  {i < 2 && <div className={`flex-1 h-0.5 mx-2 mb-5 rounded-full transition-all ${done ? "bg-purple-600" : "bg-white/[0.06]"}`} />}
                </div>
              )
            })}
          </div>

          {/* STEP 1: Select reference videos */}
          {briefStep === 1 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-white/[0.06] bg-[#111111] p-5">
                <h2 className="text-base font-semibold text-white mb-1">Select Reference Videos</h2>
                <p className="text-xs text-zinc-500 mb-4">Pick 3–5 videos to use as inspiration for your brief. Selected: <span className="text-purple-400 font-medium">{selectedForBrief.size}/5</span></p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {videos.map(v => (
                    <VideoCard
                      key={v.id} video={v}
                      selectable selected={selectedForBrief.has(v.id)}
                      onSelect={toggleBriefVideo}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setBriefStep(2)}
                  disabled={selectedForBrief.size < 1}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-medium transition-all"
                >
                  Continue <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Context form */}
          {briefStep === 2 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-white/[0.06] bg-[#111111] p-5 space-y-4">
                <h2 className="text-base font-semibold text-white mb-1">Campaign Context</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: "brand",    label: "Brand / Company",  placeholder: "e.g. ProteinPro"           },
                    { key: "product",  label: "Product / Service", placeholder: "e.g. Whey Isolate"         },
                    { key: "goal",     label: "Campaign Goal",     placeholder: "e.g. Drive app downloads"  },
                    { key: "audience", label: "Target Audience",   placeholder: "e.g. Fitness enthusiasts 18-35" },
                    { key: "tone",     label: "Tone",              placeholder: "e.g. Energetic & authentic" },
                    { key: "platform", label: "Platform Focus",    placeholder: "e.g. TikTok + Instagram"   },
                  ].map(f => (
                    <div key={f.key} className="space-y-1.5">
                      <label className="text-xs font-medium text-zinc-400">{f.label}</label>
                      <input
                        value={briefForm[f.key as keyof typeof briefForm]}
                        onChange={e => setBriefForm(p => ({ ...p, [f.key]: e.target.value }))}
                        placeholder={f.placeholder}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-purple-500/40 transition-all"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <button onClick={() => setBriefStep(1)} className="px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-zinc-300 text-sm font-medium hover:text-white transition-all">
                  Back
                </button>
                <button onClick={() => setBriefStep(3)} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-all">
                  Continue <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Generate */}
          {briefStep === 3 && (
            <div className="space-y-4">
              {!briefGenerated ? (
                <div className="rounded-xl border border-white/[0.06] bg-[#111111] p-8 flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center mb-4">
                    <Sparkles className="w-7 h-7 text-purple-400" />
                  </div>
                  <h2 className="text-base font-semibold text-white mb-1">Ready to Generate</h2>
                  <p className="text-sm text-zinc-500 mb-2">
                    Based on <span className="text-purple-400 font-medium">{selectedForBrief.size} reference videos</span>
                    {briefForm.brand && <> for <span className="text-zinc-300 font-medium">{briefForm.brand}</span></>}.
                  </p>
                  <p className="text-xs text-zinc-600 mb-6">The brief will include hook options, video structure, dos &amp; don&apos;ts, captions, and hashtags.</p>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setBriefStep(2)} className="px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-zinc-300 text-sm font-medium hover:text-white transition-all">
                      Back
                    </button>
                    <button
                      onClick={handleGenerate}
                      disabled={generating}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-70 text-white text-sm font-semibold transition-all active:scale-[0.98] shadow-lg shadow-purple-600/20"
                    >
                      {generating ? (
                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</>
                      ) : (
                        <><Sparkles className="w-4 h-4" /> Generate Brief</>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                /* Generated brief output */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-sm font-medium text-zinc-300">Brief generated for <span className="text-white">{briefForm.brand || "your campaign"}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setCopiedBrief(true); setTimeout(() => setCopiedBrief(false), 2000) }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-zinc-300 hover:text-white text-xs font-medium transition-all">
                        {copiedBrief ? <><Check className="w-3 h-3 text-emerald-400" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-zinc-300 hover:text-white text-xs font-medium transition-all">
                        <Send className="w-3 h-3" /> Send to Campaign
                      </button>
                      <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-zinc-300 hover:text-white text-xs font-medium transition-all">
                        <Download className="w-3 h-3" /> PDF
                      </button>
                    </div>
                  </div>

                  {[
                    {
                      icon: "🪝", title: "Hook Options (3 Variations)",
                      content: [
                        `"I tested every ${briefForm.product || "supplement"} on the market so you don't have to — here's what actually works"`,
                        `"POV: You've been wasting money on ${briefForm.product || "supplements"} that don't work (watch til the end)"`,
                        `"The ${briefForm.product || "product"} hack that 99% of ${briefForm.audience || "fitness people"} don't know about"`,
                      ]
                    },
                    {
                      icon: "🎬", title: "Video Structure",
                      content: [
                        "Opening (0–3s): Deliver hook directly to camera, no intro",
                        "Middle (3–35s): Demonstrate product, show before/after, build credibility with stats",
                        "CTA (35–45s): Clear call-to-action — link in bio, discount code, or swipe up",
                      ]
                    },
                    {
                      icon: "✅", title: "Do's & Don'ts",
                      content: [
                        "✅ Show authentic reactions and real usage",
                        "✅ Use trending audio from the past 7 days",
                        "✅ Include your discount code clearly on screen",
                        "❌ No scripted or robotic delivery",
                        "❌ Avoid mentioning competitors by name",
                        "❌ Don't use stock footage or studio lighting",
                      ]
                    },
                    {
                      icon: "⏱️", title: "Recommended Duration",
                      content: ["TikTok: 30–45 seconds (sweet spot for this format)", "Instagram Reel: 25–35 seconds", "YouTube Short: 45–60 seconds"]
                    },
                    {
                      icon: "📝", title: "Caption Suggestions",
                      content: [
                        `Finally found a ${briefForm.product || "product"} worth talking about 👀`,
                        `This changed my ${briefForm.goal?.toLowerCase() || "routine"} forever (not sponsored vibes, just real talk)`,
                        `Replying to everyone who asked — here's my honest ${briefForm.product || "product"} review`,
                      ]
                    },
                    {
                      icon: "🏷️", title: "Hashtag Suggestions",
                      content: [
                        niche_to_tags(briefForm.product)
                      ]
                    },
                  ].map(section => (
                    <div key={section.title} className="rounded-xl border border-white/[0.06] bg-[#111111] p-5">
                      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        <span>{section.icon}</span> {section.title}
                      </h3>
                      <div className="space-y-2">
                        {section.content.map((line, i) => (
                          <p key={i} className="text-sm text-zinc-400 leading-relaxed pl-2 border-l-2 border-purple-600/30">
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Save to board dropdown */}
      {savingVideo && (
        <SaveToBoardDropdown
          video={savingVideo}
          boards={boards}
          onSave={handleSaveToBoard}
          onNewBoard={() => { setSavingVideo(null); setShowNewBoard(true); setActiveTab("Library") }}
          onClose={() => setSavingVideo(null)}
        />
      )}
    </div>
  )
}

function niche_to_tags(product: string): string {
  const base = "#ugc #creatorsofinstagram #contentcreator #ugccommunity"
  if (!product) return base
  const p = product.toLowerCase()
  if (p.includes("protein") || p.includes("supplement") || p.includes("gym")) return `${base} #fitness #proteinsupplements #gymtok #fitnessmotivation`
  if (p.includes("skin") || p.includes("beauty") || p.includes("makeup")) return `${base} #beauty #skincareroutine #beautytok #glowup`
  if (p.includes("app") || p.includes("software") || p.includes("tech")) return `${base} #tech #techtok #productivity #softwaredemo`
  return `${base} #viral #trending #fyp #foryoupage`
}
