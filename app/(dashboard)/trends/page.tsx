"use client"

import { useState, useMemo, useEffect } from "react"
import {
  Search, Bookmark, BookmarkCheck, Play, TrendingUp,
  Sparkles, Copy, Download, ArrowRight, Plus,
  ChevronDown, Flame, BarChart2, Lightbulb, AlertTriangle,
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

// ── Mock data ─────────────────────────────────────────────────
const THUMBNAILS = [
  "https://picsum.photos/seed/t1/400/225",
  "https://picsum.photos/seed/t2/400/225",
  "https://picsum.photos/seed/t3/400/225",
  "https://picsum.photos/seed/t4/400/225",
  "https://picsum.photos/seed/t5/400/225",
  "https://picsum.photos/seed/t6/400/225",
  "https://picsum.photos/seed/t7/400/225",
  "https://picsum.photos/seed/t8/400/225",
  "https://picsum.photos/seed/t9/400/225",
  "https://picsum.photos/seed/t10/400/225",
  "https://picsum.photos/seed/t11/400/225",
  "https://picsum.photos/seed/t12/400/225",
]

const MOCK_VIDEOS: TrendVideo[] = [
  { id: "tv1",  workspace_id: null, platform: "tiktok",    video_url: null, thumbnail_url: THUMBNAILS[0],  caption: "I tried every protein powder for 30 days 💪 results shocked me", creator_handle: "@jakefit",       views: 8400000, likes: 620000, engagement_rate: 7.4, virality_score: 9.6, niche: "fitness",   content_format: "before_after", posted_at: new Date(Date.now()-172800000).toISOString(),  created_at: "" },
  { id: "tv2",  workspace_id: null, platform: "instagram", video_url: null, thumbnail_url: THUMBNAILS[1],  caption: "POV: You finally found a skincare routine that works ✨",          creator_handle: "@glowup",        views: 5200000, likes: 410000, engagement_rate: 7.9, virality_score: 9.1, niche: "beauty",    content_format: "testimonial",  posted_at: new Date(Date.now()-259200000).toISOString(),  created_at: "" },
  { id: "tv3",  workspace_id: null, platform: "tiktok",    video_url: null, thumbnail_url: THUMBNAILS[2],  caption: "The $0 budget hack that made me $10K this month 💰",              creator_handle: "@moneymoves",    views: 9800000, likes: 780000, engagement_rate: 8.0, virality_score: 9.8, niche: "finance",   content_format: "hook_first",   posted_at: new Date(Date.now()-86400000).toISOString(),   created_at: "" },
  { id: "tv4",  workspace_id: null, platform: "youtube",   video_url: null, thumbnail_url: THUMBNAILS[3],  caption: "Full MacBook Pro M4 review — 3 months later",                     creator_handle: "@techreviewer",  views: 3100000, likes: 210000, engagement_rate: 6.8, virality_score: 7.2, niche: "tech",      content_format: "product_demo", posted_at: new Date(Date.now()-432000000).toISOString(),   created_at: "" },
  { id: "tv5",  workspace_id: null, platform: "tiktok",    video_url: null, thumbnail_url: THUMBNAILS[4],  caption: "What I eat in a day as a professional chef 🍳",                   creator_handle: "@chefsana",      views: 4700000, likes: 380000, engagement_rate: 8.1, virality_score: 8.4, niche: "food",      content_format: "lifestyle",    posted_at: new Date(Date.now()-345600000).toISOString(),   created_at: "" },
  { id: "tv6",  workspace_id: null, platform: "instagram", video_url: null, thumbnail_url: THUMBNAILS[5],  caption: "My morning routine changed everything (storytime)",                creator_handle: "@lifewithalex",  views: 2800000, likes: 190000, engagement_rate: 6.8, virality_score: 6.9, niche: "lifestyle", content_format: "storytime",    posted_at: new Date(Date.now()-518400000).toISOString(),   created_at: "" },
  { id: "tv7",  workspace_id: null, platform: "tiktok",    video_url: null, thumbnail_url: THUMBNAILS[6],  caption: "Testing viral gym hacks so you don't have to 😤",                 creator_handle: "@fitfails",      views: 6600000, likes: 520000, engagement_rate: 7.9, virality_score: 9.0, niche: "fitness",   content_format: "before_after", posted_at: new Date(Date.now()-172800000).toISOString(),   created_at: "" },
  { id: "tv8",  workspace_id: null, platform: "youtube",   video_url: null, thumbnail_url: THUMBNAILS[7],  caption: "I built a $500K Shopify store in 60 days — full breakdown",       creator_handle: "@ecomking",      views: 2200000, likes: 160000, engagement_rate: 7.3, virality_score: 7.8, niche: "finance",   content_format: "storytime",    posted_at: new Date(Date.now()-604800000).toISOString(),   created_at: "" },
  { id: "tv9",  workspace_id: null, platform: "instagram", video_url: null, thumbnail_url: THUMBNAILS[8],  caption: "Rating every foundation shade from lightest to darkest 💄",       creator_handle: "@beautytruth",   views: 3900000, likes: 310000, engagement_rate: 7.9, virality_score: 8.7, niche: "beauty",    content_format: "product_demo", posted_at: new Date(Date.now()-259200000).toISOString(),   created_at: "" },
  { id: "tv10", workspace_id: null, platform: "tiktok",    video_url: null, thumbnail_url: THUMBNAILS[9],  caption: "Day in the life of a NYC software engineer 👩‍💻",                  creator_handle: "@techlife",      views: 5800000, likes: 450000, engagement_rate: 7.8, virality_score: 8.9, niche: "tech",      content_format: "lifestyle",    posted_at: new Date(Date.now()-86400000).toISOString(),    created_at: "" },
  { id: "tv11", workspace_id: null, platform: "facebook",  video_url: null, thumbnail_url: THUMBNAILS[10], caption: "How I paid off $80K debt in 2 years (real numbers)",              creator_handle: "@debtfree",      views: 1800000, likes: 140000, engagement_rate: 7.8, virality_score: 7.1, niche: "finance",   content_format: "testimonial",  posted_at: new Date(Date.now()-691200000).toISOString(),   created_at: "" },
  { id: "tv12", workspace_id: null, platform: "tiktok",    video_url: null, thumbnail_url: THUMBNAILS[11], caption: "Aesthetic meal prep for the whole week 🥑",                       creator_handle: "@mealqueen",     views: 7200000, likes: 580000, engagement_rate: 8.1, virality_score: 9.3, niche: "food",      content_format: "hook_first",   posted_at: new Date(Date.now()-172800000).toISOString(),   created_at: "" },
]

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
  const [videos, setVideos] = useState<TrendVideo[]>(MOCK_VIDEOS)
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

  // Load real data — fall back to mock videos if DB is empty
  useEffect(() => {
    fetchTrendVideos().then(data => { if (data.length > 0) setVideos(data) }).catch(() => {/* keep mock */})
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
    if (!newBoardName.trim()) return
    setCreatingBoard(true)
    try {
      const board = await createBoard(newBoardName.trim())
      setBoards(prev => [...prev, board])
    } catch {
      setBoards(prev => [...prev, {
        id: Math.random().toString(36).slice(2),
        workspace_id: null, campaign_id: null,
        name: newBoardName.trim(), created_at: new Date().toISOString(),
      }])
    }
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

  const nicheBarData = [
    { niche: "Hook-First",  growth: 94 },
    { niche: "Before/After",growth: 87 },
    { niche: "Storytime",   growth: 79 },
    { niche: "Testimonial", growth: 71 },
    { niche: "Lifestyle",   growth: 65 },
  ]

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
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 rounded-xl border border-white/[0.06] bg-[#111111]">
                <TrendingUp className="w-8 h-8 text-zinc-600 mb-3" />
                <p className="text-sm font-medium text-zinc-400">No videos match your filters</p>
                <p className="text-xs text-zinc-600 mt-1">Try adjusting the platform, niche, or format filter.</p>
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
                { label: "Avg viral score", value: "8.6" },
                { label: "Top platform",    value: "TikTok" },
                { label: "Top format",      value: "Hook-First" },
                { label: "Top niche",       value: "Finance" },
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
          {/* Header */}
          <div className="rounded-xl border border-white/[0.06] bg-gradient-to-br from-purple-600/10 to-blue-600/5 p-6">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-5 h-5 text-orange-400" />
              <h2 className="text-lg font-bold text-white">This Week in UGC</h2>
            </div>
            <p className="text-sm text-zinc-400">
              Week of {new Date(Date.now() - 604800000).toLocaleDateString("en-US", { month: "long", day: "numeric" })} – {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
            <p className="text-xs text-zinc-500 mt-2">AI-curated from 12 tracked trend signals across 4 platforms.</p>
          </div>

          {/* Top formats */}
          <div className="rounded-xl border border-white/[0.06] bg-[#111111] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-4 h-4 text-orange-400" />
              <h3 className="text-[15px] font-semibold text-white">Top 5 Formats Blowing Up</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {[
                { rank: 1, format: "Hook-First",   desc: "Shocking stat or controversial opener drives 3× watch time",  change: "+41%", thumbnail: THUMBNAILS[2] },
                { rank: 2, format: "Before/After", desc: "Transformation content crushes in fitness and beauty",         change: "+38%", thumbnail: THUMBNAILS[0] },
                { rank: 3, format: "Storytime",    desc: "Relatable personal stories with 90s-ending open loops",        change: "+29%", thumbnail: THUMBNAILS[5] },
                { rank: 4, format: "Meal Prep",    desc: "Aesthetic food prep with satisfying ASMR audio",               change: "+24%", thumbnail: THUMBNAILS[11] },
                { rank: 5, format: "Day-in-Life",  desc: "Authentic behind-the-scenes converts best for SaaS products", change: "+19%", thumbnail: THUMBNAILS[9] },
              ].map(f => (
                <div key={f.rank} className="flex gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-colors">
                  <div className="w-16 h-10 rounded overflow-hidden flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={f.thumbnail} alt="" className="w-full h-full object-cover" />
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

          {/* Fastest growing niches chart */}
          <div className="rounded-xl border border-white/[0.06] bg-[#111111] p-5">
            <div className="flex items-center gap-2 mb-5">
              <BarChart2 className="w-4 h-4 text-blue-400" />
              <h3 className="text-[15px] font-semibold text-white">Format Performance This Week</h3>
              <span className="text-xs text-zinc-500 ml-1">vs. avg engagement baseline</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={nicheBarData} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: "#52525b", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${v}%`} />
                <YAxis type="category" dataKey="niche" tick={{ fill: "#a1a1aa", fontSize: 12 }} tickLine={false} axisLine={false} width={90} />
                <Tooltip content={<ChartTT />} />
                <Bar dataKey="growth" fill="#7C3AED" radius={[0, 4, 4, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Hook styles */}
          <div className="rounded-xl border border-white/[0.06] bg-[#111111] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <h3 className="text-[15px] font-semibold text-white">Hook Styles Working Right Now</h3>
            </div>
            <div className="space-y-3">
              {[
                { hook: "Shocking stat opener", example: '"99% of people don\'t know this about [product]…"',  platform: "tiktok" as Platform,    lift: "+87% watch time" },
                { hook: "POV setup",             example: '"POV: you finally found a [product] that actually works"', platform: "instagram" as Platform, lift: "+64% saves" },
                { hook: "Controversial take",    example: '"Hot take: [common advice] is destroying your [goal]"', platform: "tiktok" as Platform,    lift: "+51% shares" },
                { hook: "Relatable frustration", example: '"I was so tired of [pain point] until I tried this"',  platform: "instagram" as Platform, lift: "+44% DMs" },
              ].map(h => {
                const pc = PLATFORM_CONFIG[h.platform]
                return (
                  <div key={h.hook} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <div className={`w-7 h-7 rounded-lg ${pc.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <PlatformIcon platform={h.platform} className={`w-3.5 h-3.5 ${pc.textColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium text-zinc-200">{h.hook}</span>
                        <span className="text-[11px] text-emerald-400 font-medium">{h.lift}</span>
                      </div>
                      <p className="text-xs text-zinc-500 italic">{h.example}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Formats declining */}
          <div className="rounded-xl border border-white/[0.06] bg-[#111111] p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <h3 className="text-[15px] font-semibold text-white">Formats Declining This Week</h3>
            </div>
            <div className="space-y-2">
              {[
                { format: "Talking-head product reads",   reason: "Audiences skip past unedited talking-head ads",          drop: "-34%" },
                { format: "Text-only overlay content",    reason: "Platforms deprioritizing static text overlays in feeds",  drop: "-28%" },
                { format: "Unboxing without context",     reason: "Unboxing without a hook or narrative losing traction",    drop: "-21%" },
              ].map(d => (
                <div key={d.format} className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                  <span className="text-sm font-bold text-red-400 flex-shrink-0">{d.drop}</span>
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{d.format}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{d.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
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
                  {MOCK_VIDEOS.map(v => (
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
