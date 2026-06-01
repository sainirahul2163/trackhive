"use client"

import { useState, useMemo } from "react"
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
import { SignupGateModal } from "@/components/demo/signup-gate-modal"
import { cn } from "@/lib/utils"
import type { Platform } from "@/types"

// ── Mock data ─────────────────────────────────────────────────
const THUMBNAILS = [
  "https://picsum.photos/seed/t1/400/225", "https://picsum.photos/seed/t2/400/225",
  "https://picsum.photos/seed/t3/400/225", "https://picsum.photos/seed/t4/400/225",
  "https://picsum.photos/seed/t5/400/225", "https://picsum.photos/seed/t6/400/225",
  "https://picsum.photos/seed/t7/400/225", "https://picsum.photos/seed/t8/400/225",
  "https://picsum.photos/seed/t9/400/225", "https://picsum.photos/seed/t10/400/225",
  "https://picsum.photos/seed/t11/400/225","https://picsum.photos/seed/t12/400/225",
]

type ContentFormat = "product_demo" | "testimonial" | "lifestyle" | "hook_first" | "before_after" | "storytime" | "other"
type TrendNiche = "beauty" | "tech" | "finance" | "fitness" | "food" | "gaming" | "lifestyle"

interface TrendVideo {
  id: string; platform: Platform; thumbnail_url: string | null; caption: string
  creator_handle: string; views: number; engagement_rate: number
  virality_score: number; niche: TrendNiche; content_format: ContentFormat
  posted_at: string
}

interface Board { id: string; name: string }

const MOCK_VIDEOS: TrendVideo[] = [
  { id: "tv1",  platform: "tiktok",    thumbnail_url: THUMBNAILS[0],  caption: "I tried every protein powder for 30 days 💪 results shocked me", creator_handle: "@jakefit",       views: 8400000, engagement_rate: 7.4, virality_score: 9.6, niche: "fitness",   content_format: "before_after", posted_at: new Date(Date.now()-172800000).toISOString() },
  { id: "tv2",  platform: "instagram", thumbnail_url: THUMBNAILS[1],  caption: "POV: You finally found a skincare routine that works ✨",          creator_handle: "@glowup",        views: 5200000, engagement_rate: 7.9, virality_score: 9.1, niche: "beauty",    content_format: "testimonial",  posted_at: new Date(Date.now()-259200000).toISOString() },
  { id: "tv3",  platform: "tiktok",    thumbnail_url: THUMBNAILS[2],  caption: "The $0 budget hack that made me $10K this month 💰",              creator_handle: "@moneymoves",    views: 9800000, engagement_rate: 8.0, virality_score: 9.8, niche: "finance",   content_format: "hook_first",   posted_at: new Date(Date.now()-86400000).toISOString()  },
  { id: "tv4",  platform: "youtube",   thumbnail_url: THUMBNAILS[3],  caption: "Full MacBook Pro M4 review — 3 months later",                     creator_handle: "@techreviewer",  views: 3100000, engagement_rate: 6.8, virality_score: 7.2, niche: "tech",      content_format: "product_demo", posted_at: new Date(Date.now()-432000000).toISOString() },
  { id: "tv5",  platform: "tiktok",    thumbnail_url: THUMBNAILS[4],  caption: "What I eat in a day as a professional chef 🍳",                   creator_handle: "@chefsana",      views: 4700000, engagement_rate: 8.1, virality_score: 8.4, niche: "food",      content_format: "lifestyle",    posted_at: new Date(Date.now()-345600000).toISOString() },
  { id: "tv6",  platform: "instagram", thumbnail_url: THUMBNAILS[5],  caption: "My morning routine changed everything (storytime)",                creator_handle: "@lifewithalex",  views: 2800000, engagement_rate: 6.8, virality_score: 6.9, niche: "lifestyle", content_format: "storytime",    posted_at: new Date(Date.now()-518400000).toISOString() },
  { id: "tv7",  platform: "tiktok",    thumbnail_url: THUMBNAILS[6],  caption: "Testing viral gym hacks so you don't have to 😤",                 creator_handle: "@fitfails",      views: 6600000, engagement_rate: 7.9, virality_score: 9.0, niche: "fitness",   content_format: "before_after", posted_at: new Date(Date.now()-172800000).toISOString() },
  { id: "tv8",  platform: "youtube",   thumbnail_url: THUMBNAILS[7],  caption: "I built a $500K Shopify store in 60 days — full breakdown",       creator_handle: "@ecomking",      views: 2200000, engagement_rate: 7.3, virality_score: 7.8, niche: "finance",   content_format: "storytime",    posted_at: new Date(Date.now()-604800000).toISOString() },
  { id: "tv9",  platform: "instagram", thumbnail_url: THUMBNAILS[8],  caption: "Rating every foundation shade from lightest to darkest 💄",       creator_handle: "@beautytruth",   views: 3900000, engagement_rate: 7.9, virality_score: 8.7, niche: "beauty",    content_format: "product_demo", posted_at: new Date(Date.now()-259200000).toISOString() },
  { id: "tv10", platform: "tiktok",    thumbnail_url: THUMBNAILS[9],  caption: "Day in the life of a NYC software engineer 👩‍💻",                  creator_handle: "@techlife",      views: 5800000, engagement_rate: 7.8, virality_score: 8.9, niche: "tech",      content_format: "lifestyle",    posted_at: new Date(Date.now()-86400000).toISOString()  },
  { id: "tv11", platform: "facebook",  thumbnail_url: THUMBNAILS[10], caption: "How I paid off $80K debt in 2 years (real numbers)",              creator_handle: "@debtfree",      views: 1800000, engagement_rate: 7.8, virality_score: 7.1, niche: "finance",   content_format: "testimonial",  posted_at: new Date(Date.now()-691200000).toISOString() },
  { id: "tv12", platform: "tiktok",    thumbnail_url: THUMBNAILS[11], caption: "Aesthetic meal prep for the whole week 🥑",                       creator_handle: "@mealqueen",     views: 7200000, engagement_rate: 8.1, virality_score: 9.3, niche: "food",      content_format: "hook_first",   posted_at: new Date(Date.now()-172800000).toISOString() },
]

const INIT_BOARDS: Board[] = [
  { id: "b1", name: "Summer Campaign Ideas" },
  { id: "b2", name: "Hook Formulas"         },
  { id: "b3", name: "Competitor Analysis"   },
]

const FORMAT_LABELS: Record<ContentFormat, string> = {
  product_demo: "Product Demo", testimonial: "Testimonial", lifestyle: "Lifestyle",
  hook_first: "Hook-First", before_after: "Before/After", storytime: "Storytime", other: "Other",
}

function viralityBadge(score: number) {
  if (score >= 9) return { label: "🔥 Viral",  className: "bg-red-500/10 text-red-400 border-red-500/20"     }
  if (score >= 7) return { label: "📈 Rising", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" }
  return             { label: "✓ Normal",       className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"   }
}

const TABS = ["Library", "Weekly Digest", "Brief Generator"] as const
type Tab = typeof TABS[number]

// ── Filter select ─────────────────────────────────────────────
function FilterSelect({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[]
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
  video: TrendVideo; saved?: boolean; onSave?: () => void
  selectable?: boolean; selected?: boolean; onSelect?: (video: TrendVideo) => void
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
      <div className="aspect-video relative overflow-hidden bg-white/[0.04]">
        {video.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={video.thumbnail_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="w-8 h-8 text-zinc-700" />
          </div>
        )}

        {hovering && !selectable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="px-3 py-1.5 rounded-lg bg-white text-black text-xs font-semibold">View Details</div>
          </div>
        )}

        {selectable && selected && (
          <div className="absolute inset-0 bg-purple-600/20 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          </div>
        )}

        <div
          className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold"
          style={{ backgroundColor: platCfg.bgColor, color: platCfg.fgColor }}
        >
          <PlatformIcon platform={video.platform} className="w-2.5 h-2.5" />
          {platCfg.label}
        </div>

        <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between">
          <span className="text-white font-bold text-sm drop-shadow-lg">{formatNumber(video.views)}</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold border ${badge.className}`}>{badge.label}</span>
        </div>
      </div>

      <div className="p-3 space-y-2">
        <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">{video.caption}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-500 font-medium">{video.creator_handle}</span>
            <span className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[10px] text-zinc-500">
              {FORMAT_LABELS[video.content_format]}
            </span>
          </div>
          {!selectable && onSave && (
            <button
              onClick={e => { e.stopPropagation(); onSave() }}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                saved ? "text-purple-400 bg-purple-600/10" : "text-zinc-600 hover:text-purple-400 hover:bg-purple-600/10"
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

// ── Niche bar chart tooltip ───────────────────────────────────
interface ChartTTProps { active?: boolean; payload?: Array<{ value: number }>; label?: string }
function ChartTT({ active, payload, label }: ChartTTProps) {
  if (active && payload?.length) return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-[11px] text-zinc-500">{label}</p>
      <p className="text-sm font-semibold text-purple-400">{payload[0]?.value}% engagement lift</p>
    </div>
  )
  return null
}

// ── Main component ────────────────────────────────────────────
export default function DemoTrendsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Library")

  // Gate modal state
  const [gateOpen, setGateOpen] = useState(false)
  const [gateFeature, setGateFeature] = useState("this feature")
  function openGate(feature: string) { setGateFeature(feature); setGateOpen(true) }

  // Library state
  const [savedVideoIds, setSavedVideoIds] = useState<Set<string>>(new Set())
  const [boards, setBoards] = useState<Board[]>(INIT_BOARDS)
  const [showBoardDropdown, setShowBoardDropdown] = useState<string | null>(null)
  const [showNewBoard, setShowNewBoard] = useState(false)
  const [newBoardName, setNewBoardName] = useState("")
  const [search, setSearch] = useState("")
  const [platFilter, setPlatFilter] = useState<Platform | "all">("all")
  const [nicheFilter, setNicheFilter] = useState<TrendNiche | "all">("all")
  const [formatFilter, setFormatFilter] = useState<ContentFormat | "all">("all")
  const [sortBy, setSortBy] = useState("views")

  // Brief generator state
  const [briefStep, setBriefStep] = useState<1 | 2 | 3>(1)
  const [selectedForBrief, setSelectedForBrief] = useState<Set<string>>(new Set())
  const [briefForm, setBriefForm] = useState({ brand: "", product: "", goal: "", audience: "", tone: "", platform: "" })
  const [copiedBrief, setCopiedBrief] = useState(false)

  const filtered = useMemo(() => {
    let list = MOCK_VIDEOS.filter(v => {
      if (search && !v.caption.toLowerCase().includes(search.toLowerCase()) && !v.creator_handle.toLowerCase().includes(search.toLowerCase())) return false
      if (platFilter !== "all" && v.platform !== platFilter) return false
      if (nicheFilter !== "all" && v.niche !== nicheFilter) return false
      if (formatFilter !== "all" && v.content_format !== formatFilter) return false
      return true
    })
    if (sortBy === "views")    list = [...list].sort((a, b) => b.views - a.views)
    if (sortBy === "virality") list = [...list].sort((a, b) => b.virality_score - a.virality_score)
    if (sortBy === "newest")   list = [...list].sort((a, b) => new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime())
    return list
  }, [search, platFilter, nicheFilter, formatFilter, sortBy])

  function toggleBriefVideo(video: TrendVideo) {
    setSelectedForBrief(prev => {
      const next = new Set(prev)
      if (next.has(video.id)) { next.delete(video.id) } else if (next.size < 5) { next.add(video.id) }
      return next
    })
  }

  const nicheBarData = [
    { niche: "Hook-First",   growth: 94 }, { niche: "Before/After", growth: 87 },
    { niche: "Storytime",    growth: 79 }, { niche: "Testimonial",  growth: 71 },
    { niche: "Lifestyle",    growth: 65 },
  ]

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-semibold text-white tracking-tight">Trends</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Discover viral formats, save inspiration, and generate briefs.</p>
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
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search videos..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#111111] border border-white/[0.06] text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-purple-500/40 transition-colors"
                />
              </div>
              <FilterSelect value={platFilter} onChange={v => setPlatFilter(v as Platform | "all")} options={[
                { value: "all", label: "All Platforms" },
                { value: "tiktok", label: "TikTok" }, { value: "instagram", label: "Instagram" },
                { value: "youtube", label: "YouTube" }, { value: "facebook", label: "Facebook" },
              ]} />
              <FilterSelect value={nicheFilter} onChange={v => setNicheFilter(v as TrendNiche | "all")} options={[
                { value: "all", label: "All Niches" }, { value: "beauty", label: "Beauty" },
                { value: "tech", label: "Tech" }, { value: "finance", label: "Finance" },
                { value: "fitness", label: "Fitness" }, { value: "food", label: "Food" },
                { value: "gaming", label: "Gaming" }, { value: "lifestyle", label: "Lifestyle" },
              ]} />
              <FilterSelect value={formatFilter} onChange={v => setFormatFilter(v as ContentFormat | "all")} options={[
                { value: "all", label: "All Formats" }, { value: "product_demo", label: "Product Demo" },
                { value: "testimonial", label: "Testimonial" }, { value: "lifestyle", label: "Lifestyle" },
                { value: "hook_first", label: "Hook-First" }, { value: "before_after", label: "Before/After" },
                { value: "storytime", label: "Storytime" },
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
                    onSave={() => {
                      if (savedVideoIds.has(v.id)) {
                        setSavedVideoIds(prev => { const next = new Set(prev); next.delete(v.id); return next })
                      } else {
                        openGate("save to inspiration board")
                      }
                    }}
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
                <button
                  onClick={() => openGate("inspiration boards")}
                  className="p-1 rounded text-zinc-500 hover:text-purple-400 hover:bg-purple-600/10 transition-colors"
                >
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
            </div>

            {/* Quick stats */}
            <div className="rounded-xl border border-white/[0.06] bg-[#111111] p-4 space-y-3">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">This Week</p>
              {[
                { label: "Avg viral score", value: "8.6"       },
                { label: "Top platform",    value: "TikTok"     },
                { label: "Top format",      value: "Hook-First" },
                { label: "Top niche",       value: "Finance"    },
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
          {/* Header card */}
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
                { rank: 1, format: "Hook-First",   desc: "Shocking stat or controversial opener drives 3× watch time",  change: "+41%", thumbnail: THUMBNAILS[2]  },
                { rank: 2, format: "Before/After", desc: "Transformation content crushes in fitness and beauty",         change: "+38%", thumbnail: THUMBNAILS[0]  },
                { rank: 3, format: "Storytime",    desc: "Relatable personal stories with 90s-ending open loops",        change: "+29%", thumbnail: THUMBNAILS[5]  },
                { rank: 4, format: "Meal Prep",    desc: "Aesthetic food prep with satisfying ASMR audio",               change: "+24%", thumbnail: THUMBNAILS[11] },
                { rank: 5, format: "Day-in-Life",  desc: "Authentic behind-the-scenes converts best for SaaS products", change: "+19%", thumbnail: THUMBNAILS[9]  },
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

          {/* Format performance chart */}
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
                { hook: "Shocking stat opener", example: '"99% of people don\'t know this about [product]…"',       platform: "tiktok"    as Platform, lift: "+87% watch time" },
                { hook: "POV setup",             example: '"POV: you finally found a [product] that actually works"', platform: "instagram" as Platform, lift: "+64% saves"     },
                { hook: "Controversial take",    example: '"Hot take: [common advice] is destroying your [goal]"',   platform: "tiktok"    as Platform, lift: "+51% shares"    },
                { hook: "Relatable frustration", example: '"I was so tired of [pain point] until I tried this"',     platform: "instagram" as Platform, lift: "+44% DMs"       },
              ].map(h => {
                const pc = PLATFORM_CONFIG[h.platform]
                return (
                  <div key={h.hook} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: pc.bgColor, color: pc.fgColor }}>
                      <PlatformIcon platform={h.platform} className="w-3.5 h-3.5" />
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
                { format: "Talking-head product reads",  reason: "Audiences skip past unedited talking-head ads",         drop: "-34%" },
                { format: "Text-only overlay content",   reason: "Platforms deprioritizing static text overlays in feeds", drop: "-28%" },
                { format: "Unboxing without context",    reason: "Unboxing without a hook or narrative losing traction",   drop: "-21%" },
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
                      done   ? "bg-purple-600 border-purple-600 text-white" :
                      active ? "bg-purple-600/10 border-purple-500 text-purple-400" :
                               "bg-white/[0.04] border-white/10 text-zinc-600"
                    )}>
                      {done ? <Check className="w-4 h-4" /> : s}
                    </div>
                    <span className={`text-[10px] font-medium hidden sm:block ${active ? "text-purple-400" : done ? "text-zinc-400" : "text-zinc-600"}`}>
                      {label}
                    </span>
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
                <p className="text-xs text-zinc-500 mb-4">
                  Pick 3–5 videos to use as inspiration for your brief. Selected:{" "}
                  <span className="text-purple-400 font-medium">{selectedForBrief.size}/5</span>
                </p>
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
                    { key: "brand",    label: "Brand / Company",   placeholder: "e.g. ProteinPro"            },
                    { key: "product",  label: "Product / Service",  placeholder: "e.g. Whey Isolate"          },
                    { key: "goal",     label: "Campaign Goal",      placeholder: "e.g. Drive app downloads"   },
                    { key: "audience", label: "Target Audience",    placeholder: "e.g. Fitness enthusiasts 18-35" },
                    { key: "tone",     label: "Tone",               placeholder: "e.g. Energetic & authentic"  },
                    { key: "platform", label: "Platform Focus",     placeholder: "e.g. TikTok + Instagram"    },
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
                <button
                  onClick={() => setBriefStep(1)}
                  className="px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-zinc-300 text-sm font-medium hover:text-white transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => setBriefStep(3)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-all"
                >
                  Continue <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Generate (gated) */}
          {briefStep === 3 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-white/[0.06] bg-[#111111] p-8 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center mb-4">
                  <Sparkles className="w-7 h-7 text-purple-400" />
                </div>
                <h2 className="text-base font-semibold text-white mb-1">Ready to Generate</h2>
                <p className="text-sm text-zinc-500 mb-2">
                  Based on{" "}
                  <span className="text-purple-400 font-medium">{selectedForBrief.size} reference videos</span>
                  {briefForm.brand && <> for <span className="text-zinc-300 font-medium">{briefForm.brand}</span></>}.
                </p>
                <p className="text-xs text-zinc-600 mb-6">
                  The brief will include hook options, video structure, dos &amp; don&apos;ts, captions, and hashtags.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setBriefStep(2)}
                    className="px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-zinc-300 text-sm font-medium hover:text-white transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => openGate("AI brief generation")}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-all active:scale-[0.98] shadow-lg shadow-purple-600/20"
                  >
                    <Sparkles className="w-4 h-4" />
                    Generate Brief
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <SignupGateModal open={gateOpen} onClose={() => setGateOpen(false)} feature={gateFeature} />
    </div>
  )
}
