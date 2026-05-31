"use client"

import { useState, useCallback, useEffect } from "react"
import {
  Plus, Globe, Eye, Users, TrendingUp, BarChart2,
  Star, StarOff, ChevronRight, AlertCircle,
  Sparkles, ArrowUpRight, ArrowDownRight,
  Clock, X, Check, ExternalLink,
} from "lucide-react"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { PlatformIcon, PLATFORM_CONFIG, formatNumber } from "@/lib/platform"
import { fetchCompetitors } from "@/lib/competitors-data"
import { AddCompetitorDrawer } from "@/components/competitors/add-competitor-drawer"
import type {
  Competitor, CompetitorVideo,
  CompetitorCreator, AiReport, Platform,
} from "@/types"
import { cn } from "@/lib/utils"

// ── Mock data ─────────────────────────────────────────────────
const MOCK_COMPETITORS: Competitor[] = [
  {
    id: "comp1", workspace_id: null, name: "GrowthBrands Co",  website: "growthbrands.co",  logo_url: null, created_at: "",
    accounts: [
      { id: "ca1", competitor_id: "comp1", platform: "tiktok",    username: "@growthbrands_tt", avatar_url: null, follower_count: 890000,  total_views: 42000000, avg_views: 680000, posting_frequency: 4.2, created_at: "" },
      { id: "ca2", competitor_id: "comp1", platform: "instagram", username: "@growthbrands",    avatar_url: null, follower_count: 640000,  total_views: 18000000, avg_views: 290000, posting_frequency: 2.8, created_at: "" },
    ],
  },
  {
    id: "comp2", workspace_id: null, name: "ViralPush Inc",    website: "viralpush.com",    logo_url: null, created_at: "",
    accounts: [
      { id: "ca3", competitor_id: "comp2", platform: "tiktok",    username: "@viralpush",       avatar_url: null, follower_count: 1200000, total_views: 78000000, avg_views: 920000, posting_frequency: 6.1, created_at: "" },
      { id: "ca4", competitor_id: "comp2", platform: "youtube",   username: "@viralpush_yt",    avatar_url: null, follower_count: 380000,  total_views: 24000000, avg_views: 410000, posting_frequency: 1.5, created_at: "" },
    ],
  },
  {
    id: "comp3", workspace_id: null, name: "NexGen Creator",   website: "nexgencreator.io", logo_url: null, created_at: "",
    accounts: [
      { id: "ca5", competitor_id: "comp3", platform: "instagram", username: "@nexgencreator",   avatar_url: null, follower_count: 520000,  total_views: 14000000, avg_views: 220000, posting_frequency: 3.4, created_at: "" },
      { id: "ca6", competitor_id: "comp3", platform: "tiktok",    username: "@nexgen_tt",       avatar_url: null, follower_count: 310000,  total_views: 9000000,  avg_views: 180000, posting_frequency: 2.9, created_at: "" },
    ],
  },
]

function makeThumbs(seeds: string[]) {
  return seeds.map(s => `https://picsum.photos/seed/${s}/200/120`)
}
const THUMBS = makeThumbs(["comp1","comp2","comp3","comp4","comp5","comp6","comp7","comp8"])

function buildVideos(competitorAccountId: string, platform: Platform): CompetitorVideo[] {
  return Array.from({ length: 6 }, (_, i) => ({
    id: `${competitorAccountId}-v${i}`,
    competitor_account_id: competitorAccountId,
    platform,
    video_url: null,
    thumbnail_url: THUMBS[i % THUMBS.length],
    caption: [
      "Why our customers are switching to us in droves 🚀",
      "The formula no one is talking about (until now)",
      "I tested 10 brands — here's the honest winner",
      "Watch this if you're tired of mediocre results",
      "Behind the scenes of our biggest campaign yet",
      "This format drove 2M views in 48 hours — here's why",
    ][i],
    views: [2100000, 880000, 1540000, 670000, 3200000, 950000][i],
    likes: [180000, 72000, 120000, 54000, 290000, 78000][i],
    engagement_rate: [8.6, 8.2, 7.8, 8.1, 9.1, 8.2][i],
    content_format: (["hook_first","testimonial","before_after","lifestyle","storytime","product_demo"] as const)[i],
    posted_at: new Date(Date.now() - i * 86400000 * 3).toISOString(),
    created_at: "",
  }))
}

function buildCreators(competitorId: string): CompetitorCreator[] {
  return [
    { id: `${competitorId}-cr1`, competitor_id: competitorId, account_id: null, creator_handle: "@mikecreates",  platform: "tiktok",    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike",   follower_count: 890000,  avg_views: 680000, videos_posted: 8,  status: "active",   flagged_outreach: false, first_seen_at: "", last_seen_at: new Date(Date.now()-86400000).toISOString() },
    { id: `${competitorId}-cr2`, competitor_id: competitorId, account_id: null, creator_handle: "@sarahlifts",   platform: "instagram", avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",  follower_count: 540000,  avg_views: 310000, videos_posted: 5,  status: "active",   flagged_outreach: true,  first_seen_at: "", last_seen_at: new Date(Date.now()-172800000).toISOString() },
    { id: `${competitorId}-cr3`, competitor_id: competitorId, account_id: null, creator_handle: "@techwithtom",  platform: "youtube",   avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=tom",   follower_count: 280000,  avg_views: 190000, videos_posted: 3,  status: "inactive", flagged_outreach: false, first_seen_at: "", last_seen_at: new Date(Date.now()-2592000000).toISOString() },
    { id: `${competitorId}-cr4`, competitor_id: competitorId, account_id: null, creator_handle: "@fitnessfiona", platform: "tiktok",    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=fiona", follower_count: 1100000, avg_views: 940000, videos_posted: 12, status: "active",   flagged_outreach: false, first_seen_at: "", last_seen_at: new Date(Date.now()-3600000).toISOString() },
  ]
}

function buildReports(competitorId: string): AiReport[] {
  return [
    {
      id: `${competitorId}-r1`, workspace_id: null, competitor_id: competitorId,
      week_of: new Date(Date.now()-604800000).toISOString().slice(0,10),
      summary: "This week the competitor ramped up TikTok output by 40%, focusing heavily on hook-first formats that open with a surprising stat. Their top video hit 3.2M views in 48 hours — driven by a relatable pain-point hook, tight 38-second runtime, and trending audio. Creator strategy shifted toward micro-influencers (100K–500K) suggesting a CPM optimization play. Instagram lagged behind with lower engagement on product-demo formats.",
      top_videos: [
        { url: "#", views: 3200000, caption: "This format drove 2M views in 48 hours — here's why" },
        { url: "#", views: 2100000, caption: "Why our customers are switching to us in droves 🚀" },
      ],
      recommendations: [
        "Adopt hook-first format immediately — competitor is winning 40% more watch time with this structure",
        "Target their inactive creators (@techwithtom) for outreach before competitor re-engages them",
        "Increase TikTok posting frequency to 4+ videos/week to match their volume",
        "Test 35–45s video length; competitor data suggests it outperforms 60s+ by 2× in completion rate",
      ],
      created_at: "",
    },
    {
      id: `${competitorId}-r2`, workspace_id: null, competitor_id: competitorId,
      week_of: new Date(Date.now()-1209600000).toISOString().slice(0,10),
      summary: "Competitor launched a coordinated multi-platform push with consistent messaging across TikTok and Instagram. Their testimonial-style content on Instagram outperformed industry benchmarks by 2.3×. Notable: they onboarded 3 new creators with 500K–1M follower range — likely ahead of a product launch.",
      top_videos: [
        { url: "#", views: 1540000, caption: "I tested 10 brands — here's the honest winner" },
      ],
      recommendations: [
        "Monitor their creator onboarding pattern — a product launch is likely in the next 2–3 weeks",
        "Counter with your own testimonial push on Instagram to compete in that format",
        "Engage your existing creators for exclusivity agreements before competitor poaches them",
      ],
      created_at: "",
    },
  ]
}

function buildWeeklyData() {
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (11 - i) * 7)
    return {
      week: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      competitor: Math.floor(Math.random() * 4000000 + 1000000),
      yours: Math.floor(Math.random() * 3000000 + 800000),
    }
  })
}

const FORMAT_PIE = [
  { name: "Hook-First",   value: 38, color: "#7C3AED" },
  { name: "Testimonial",  value: 24, color: "#3b82f6" },
  { name: "Before/After", value: 18, color: "#10b981" },
  { name: "Lifestyle",    value: 12, color: "#f59e0b" },
  { name: "Other",        value: 8,  color: "#6b7280" },
]

// ── Helpers ───────────────────────────────────────────────────
const TABS = ["Overview", "Videos", "Creators", "vs. You", "AI Reports"] as const
type Tab = typeof TABS[number]

function timeAgo(iso: string | null) {
  if (!iso) return "—"
  const diff = Date.now() - new Date(iso).getTime()
  const hrs = Math.floor(diff / 3600000)
  if (hrs < 1) return "Just now"
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
}

interface ChartTTProps { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }
function ChartTooltip({ active, payload, label }: ChartTTProps) {
  if (active && payload?.length) return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 shadow-xl space-y-1">
      <p className="text-[11px] text-zinc-500 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="text-xs font-semibold" style={{ color: p.color }}>{p.name}: {formatNumber(p.value)}</p>
      ))}
    </div>
  )
  return null
}

// ── Main component ────────────────────────────────────────────
export default function CompetitorsPage() {
  const [competitors, setCompetitors] = useState<Competitor[]>(MOCK_COMPETITORS)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>("Overview")
  const [showAddDrawer, setShowAddDrawer] = useState(false)
  const [weeklyData] = useState(buildWeeklyData)
  const [expandedReport, setExpandedReport] = useState<string | null>(null)
  const [generatingReport, setGeneratingReport] = useState(false)

  const selected = competitors.find(c => c.id === selectedId) ?? null
  const [creators, setCreators] = useState<Record<string, CompetitorCreator[]>>({})
  const [videos, setVideos] = useState<Record<string, CompetitorVideo[]>>({})
  const [reports, setReports] = useState<Record<string, AiReport[]>>({})

  // Load from Supabase on mount (with mock fallback)
  const loadCompetitors = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const data = await fetchCompetitors()
      if (data.length > 0) setCompetitors(data)
    } catch { /* use mock */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadCompetitors() }, [loadCompetitors])

  // Lazy-build detail data when competitor selected
  useEffect(() => {
    if (!selectedId) return
    if (!creators[selectedId]) setCreators(p => ({ ...p, [selectedId]: buildCreators(selectedId) }))
    if (!reports[selectedId]) setReports(p => ({ ...p, [selectedId]: buildReports(selectedId) }))
    if (!videos[selectedId]) {
      const comp = competitors.find(c => c.id === selectedId)
      const allVideos = (comp?.accounts ?? []).flatMap(acc => buildVideos(acc.id, acc.platform))
      setVideos(p => ({ ...p, [selectedId]: allVideos }))
    }
  }, [selectedId]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleSelect(id: string) {
    setSelectedId(id); setActiveTab("Overview")
  }

  function toggleFlag(creatorId: string) {
    if (!selectedId) return
    setCreators(prev => ({
      ...prev,
      [selectedId]: prev[selectedId].map(c =>
        c.id === creatorId ? { ...c, flagged_outreach: !c.flagged_outreach } : c
      ),
    }))
  }

  function handleGenerateReport() {
    if (!selectedId) return
    setGeneratingReport(true)
    setTimeout(() => {
      const newReport: AiReport = {
        id: `${selectedId}-fresh-${Date.now()}`,
        workspace_id: null, competitor_id: selectedId,
        week_of: new Date().toISOString().slice(0, 10),
        summary: "Fresh analysis: Competitor significantly increased posting cadence this week — up 55% vs. their 4-week average. Three new creators in the 200K–800K range were spotted. Hook-first formats continue to dominate their top-performing content. Engagement rate is trending down slightly (9.1% → 8.4%), suggesting audience fatigue with current creative approach — a potential opening for you to capture share.",
        top_videos: [{ url: "#", views: 4100000, caption: "This is why 2024 creators are leaving [competitor product] behind" }],
        recommendations: [
          "Their engagement dip signals creator burnout — now is the time to accelerate your own output",
          "Newly spotted creators are likely in early contract negotiation — reach out immediately",
          "Their hook formats are saturating their audience — differentiate with a storytime or behind-the-scenes approach",
        ],
        created_at: new Date().toISOString(),
      }
      setReports(prev => ({ ...prev, [selectedId]: [newReport, ...(prev[selectedId] ?? [])] }))
      setGeneratingReport(false)
    }, 2500)
  }

  const compCreators = selectedId ? (creators[selectedId] ?? []) : []
  const compVideos   = selectedId ? (videos[selectedId]   ?? []) : []
  const compReports  = selectedId ? (reports[selectedId]  ?? []) : []

  const totalViews = selected?.accounts?.reduce((s, a) => s + a.total_views, 0) ?? 0
  const avgViews   = selected?.accounts?.length
    ? Math.round((selected.accounts.reduce((s, a) => s + a.avg_views, 0)) / selected.accounts.length)
    : 0
  const topPlatform = selected?.accounts?.sort((a, b) => b.total_views - a.total_views)[0]?.platform

  return (
    <div style={{ display: "flex", gap: "0", height: "calc(100vh - 104px)", overflow: "hidden" }}>

      {/* ── LEFT SIDEBAR ─────────────────────────────────────── */}
      <div
        style={{
          width: "280px", flexShrink: 0, display: "flex", flexDirection: "column",
          borderRight: "1px solid rgba(255,255,255,0.06)", overflowY: "auto",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/[0.06] flex-shrink-0">
          <h1 className="text-[15px] font-semibold text-white">Competitors</h1>
          <button
            onClick={() => setShowAddDrawer(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium transition-all"
          >
            <Plus className="w-3 h-3" />
            Add
          </button>
        </div>

        {/* Competitor list */}
        <div className="flex-1 py-2">
          {loading && (
            <div className="px-3 space-y-2">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
            </div>
          )}

          {!loading && error && (
            <div className="px-4 py-6 text-center">
              <AlertCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
              <p className="text-xs text-zinc-500">{error}</p>
              <button onClick={loadCompetitors} className="mt-2 text-xs text-purple-400 hover:text-purple-300">Retry</button>
            </div>
          )}

          {!loading && competitors.length === 0 && (
            <div className="px-4 py-10 text-center">
              <Globe className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
              <p className="text-xs font-medium text-zinc-500">No competitors tracked yet</p>
              <p className="text-[11px] text-zinc-600 mt-1">Add a competitor to start intelligence gathering.</p>
            </div>
          )}

          {!loading && competitors.map(comp => {
            const isSelected = selectedId === comp.id
            const platforms = comp.accounts?.map(a => a.platform) ?? []
            return (
              <button
                key={comp.id}
                onClick={() => handleSelect(comp.id)}
                className={cn(
                  "w-full text-left px-3 py-3 mx-1 rounded-lg transition-all mb-1 group",
                  isSelected
                    ? "bg-purple-600/10 border border-purple-500/30"
                    : "hover:bg-white/[0.03] border border-transparent"
                )}
                style={{ width: "calc(100% - 8px)" }}
              >
                <div className="flex items-start gap-2.5">
                  {/* Logo placeholder */}
                  <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center flex-shrink-0 text-xs font-bold text-zinc-400">
                    {comp.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={cn("text-sm font-semibold truncate", isSelected ? "text-purple-300" : "text-zinc-200 group-hover:text-white")}>{comp.name}</p>
                      <ChevronRight className={cn("w-3 h-3 flex-shrink-0 transition-transform", isSelected ? "text-purple-400 rotate-90" : "text-zinc-600")} />
                    </div>
                    {comp.website && <p className="text-[11px] text-zinc-600 truncate mt-0.5">{comp.website}</p>}
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {platforms.map(p => {
                        const cfg = PLATFORM_CONFIG[p]
                        return (
                          <span key={p} className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium ${cfg.bg} ${cfg.textColor}`}>
                            <PlatformIcon platform={p} className="w-2 h-2" />
                          </span>
                        )
                      })}
                      <span className="text-[10px] text-zinc-600 ml-auto">
                        <Clock className="w-2.5 h-2.5 inline mr-0.5" />2h ago
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── RIGHT ZONE ───────────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflowY: "auto", padding: "20px 24px" }}>

        {/* No competitor selected */}
        {!selected && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center mb-4">
              <BarChart2 className="w-8 h-8 text-purple-400" />
            </div>
            <h2 className="text-base font-semibold text-white mb-1">Select a Competitor</h2>
            <p className="text-sm text-zinc-500 max-w-xs">
              Choose a competitor from the left panel to view their intelligence data.
            </p>
          </div>
        )}

        {/* Competitor selected */}
        {selected && (
          <div className="space-y-4">
            {/* Competitor header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-sm font-bold text-zinc-400">
                  {selected.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">{selected.name}</h2>
                  {selected.website && (
                    <a href={`https://${selected.website}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-zinc-500 hover:text-purple-400 transition-colors mt-0.5">
                      <ExternalLink className="w-3 h-3" />{selected.website}
                    </a>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selected.accounts?.map(acc => {
                  const cfg = PLATFORM_CONFIG[acc.platform]
                  return (
                    <span key={acc.id} className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${cfg.bg} ${cfg.textColor}`}>
                      <PlatformIcon platform={acc.platform} className="w-3 h-3" />
                      {acc.username}
                    </span>
                  )
                })}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-white/[0.03] border border-white/[0.06] rounded-lg p-1 w-fit">
              {TABS.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-all ${
                    activeTab === tab ? "bg-[#1a1a1a] text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >{tab}</button>
              ))}
            </div>

            {/* ── OVERVIEW ────────────────────────────────────── */}
            {activeTab === "Overview" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                  {[
                    { label: "Est. Creators",       value: compCreators.length || "~12", icon: Users,      color: "text-purple-400",  bg: "bg-purple-500/10" },
                    { label: "Total Views / Month",  value: formatNumber(totalViews),     icon: Eye,        color: "text-blue-400",    bg: "bg-blue-500/10"   },
                    { label: "Avg Views / Video",    value: formatNumber(avgViews),        icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10"},
                    { label: "Top Platform",         value: topPlatform ? PLATFORM_CONFIG[topPlatform].label : "—", icon: BarChart2, color: "text-amber-400", bg: "bg-amber-500/10" },
                  ].map(s => {
                    const Icon = s.icon
                    return (
                      <div key={s.label} className="rounded-xl border border-white/[0.06] bg-[#111111] px-4 py-3.5 flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-4 h-4 ${s.color}`} />
                        </div>
                        <div>
                          <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">{s.label}</p>
                          <p className="text-base font-bold text-white leading-tight">{s.value}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                  {/* Weekly trend */}
                  <div className="xl:col-span-2 rounded-xl border border-white/[0.06] bg-[#111111] p-5">
                    <h3 className="text-[15px] font-semibold text-white mb-4">Weekly Views Trend</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={weeklyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                        <XAxis dataKey="week" tick={{ fill: "#52525b", fontSize: 10 }} tickLine={false} axisLine={false} interval={3} />
                        <YAxis tick={{ fill: "#52525b", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${(v/1000000).toFixed(1)}M`} />
                        <Tooltip content={<ChartTooltip />} />
                        <Line type="monotone" dataKey="competitor" stroke="#7C3AED" strokeWidth={2} dot={false} name={selected.name} />
                        <Line type="monotone" dataKey="yours" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="5 3" name="Your workspace" />
                      </LineChart>
                    </ResponsiveContainer>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-purple-500 rounded" /><span className="text-[11px] text-zinc-500">{selected.name}</span></div>
                      <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-emerald-500 rounded border-dashed" /><span className="text-[11px] text-zinc-500">Your workspace</span></div>
                    </div>
                  </div>

                  {/* Format pie */}
                  <div className="rounded-xl border border-white/[0.06] bg-[#111111] p-5">
                    <h3 className="text-[15px] font-semibold text-white mb-4">Content Format Mix</h3>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie data={FORMAT_PIE} cx="50%" cy="50%" innerRadius={40} outerRadius={68} paddingAngle={2} dataKey="value">
                          {FORMAT_PIE.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip formatter={(val) => [`${val}%`, "Share"]} contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-1.5">
                      {FORMAT_PIE.map(f => (
                        <div key={f.name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: f.color }} />
                            <span className="text-zinc-400">{f.name}</span>
                          </div>
                          <span className="font-medium text-zinc-300">{f.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Top 5 videos */}
                <div className="rounded-xl border border-white/[0.06] bg-[#111111] overflow-hidden">
                  <div className="px-5 py-4 border-b border-white/[0.06]">
                    <h3 className="text-[15px] font-semibold text-white">Top Videos This Month</h3>
                  </div>
                  <div className="divide-y divide-white/[0.03]">
                    {compVideos.slice(0, 5).map((v, i) => {
                      const platCfg = PLATFORM_CONFIG[v.platform]
                      return (
                        <div key={v.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                          <span className="text-xs font-bold text-zinc-600 w-4">#{i + 1}</span>
                          <div className="w-14 h-8 rounded overflow-hidden flex-shrink-0 bg-white/[0.04]">
                            {v.thumbnail_url && <img src={v.thumbnail_url} alt="" className="w-full h-full object-cover" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-zinc-300 truncate">{v.caption}</p>
                            <span className={`text-[10px] font-medium ${platCfg.textColor}`}>{platCfg.label}</span>
                          </div>
                          <span className="text-sm font-semibold text-zinc-200 flex-shrink-0">{formatNumber(v.views)}</span>
                          <span className={`text-xs flex-shrink-0 ${v.engagement_rate > 8 ? "text-emerald-400" : "text-zinc-500"}`}>{v.engagement_rate}%</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── VIDEOS ──────────────────────────────────────── */}
            {activeTab === "Videos" && (
              <div className="rounded-xl border border-white/[0.06] bg-[#111111] overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                  <h3 className="text-[15px] font-semibold text-white">Videos ({compVideos.length})</h3>
                  <div className="flex gap-2">
                    {(["tiktok","instagram","youtube","facebook"] as Platform[]).filter(p => selected.accounts?.some(a => a.platform === p)).map(p => {
                      const cfg = PLATFORM_CONFIG[p]
                      return (
                        <span key={p} className={`px-2 py-1 rounded text-[11px] font-medium ${cfg.bg} ${cfg.textColor} cursor-pointer`}>
                          {cfg.label}
                        </span>
                      )
                    })}
                  </div>
                </div>
                <table className="w-full">
                  <thead><tr className="border-b border-white/[0.04]">
                    <th className="text-left px-5 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Video</th>
                    <th className="text-left px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Platform</th>
                    <th className="text-right px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Views</th>
                    <th className="text-right px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Eng %</th>
                    <th className="text-left px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Format</th>
                    <th className="text-left px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Date</th>
                  </tr></thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {compVideos.map(v => {
                      const platCfg = PLATFORM_CONFIG[v.platform]
                      return (
                        <tr key={v.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-14 h-8 rounded overflow-hidden flex-shrink-0 bg-white/[0.04]">
                                {v.thumbnail_url && <img src={v.thumbnail_url} alt="" className="w-full h-full object-cover" />}
                              </div>
                              <p className="text-sm text-zinc-300 line-clamp-1">{v.caption}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`flex items-center gap-1 w-fit px-1.5 py-0.5 rounded text-[10px] font-medium ${platCfg.bg} ${platCfg.textColor}`}>
                              <PlatformIcon platform={v.platform} className="w-2.5 h-2.5" />
                              {platCfg.label}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right"><span className="text-sm font-semibold text-zinc-200">{formatNumber(v.views)}</span></td>
                          <td className="px-4 py-3.5 text-right"><span className={`text-sm font-medium ${v.engagement_rate > 8 ? "text-emerald-400" : "text-zinc-400"}`}>{v.engagement_rate}%</span></td>
                          <td className="px-4 py-3.5"><span className="text-xs text-zinc-400">{v.content_format?.replace("_", " ") ?? "—"}</span></td>
                          <td className="px-4 py-3.5"><span className="text-xs text-zinc-500">{timeAgo(v.posted_at)}</span></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── CREATORS ────────────────────────────────────── */}
            {activeTab === "Creators" && (
              <div className="rounded-xl border border-white/[0.06] bg-[#111111] overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                  <h3 className="text-[15px] font-semibold text-white">Detected Creators ({compCreators.length})</h3>
                  <p className="text-xs text-zinc-500">Creators spotted working with {selected.name}</p>
                </div>
                <table className="w-full">
                  <thead><tr className="border-b border-white/[0.04]">
                    <th className="text-left px-5 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Creator</th>
                    <th className="text-right px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Videos</th>
                    <th className="text-right px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Avg Views</th>
                    <th className="text-left px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Last Post</th>
                    <th className="text-center px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Action</th>
                  </tr></thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {compCreators.map(c => {
                      const platCfg = PLATFORM_CONFIG[c.platform]
                      const isInactive = c.status === "inactive"
                      return (
                        <tr key={c.id} className={cn("hover:bg-white/[0.02] transition-colors", c.flagged_outreach && "bg-amber-500/5")}>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <Avatar className="w-8 h-8"><AvatarImage src={c.avatar_url ?? ""} /><AvatarFallback className="bg-purple-600/20 text-purple-400 text-xs font-bold">{c.creator_handle.slice(1,3).toUpperCase()}</AvatarFallback></Avatar>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <p className="text-sm font-medium text-zinc-200">{c.creator_handle}</p>
                                  {c.flagged_outreach && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                                </div>
                                <span className={`text-[10px] font-medium ${platCfg.textColor}`}>{platCfg.label}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-right"><span className="text-sm text-zinc-300">{c.videos_posted}</span></td>
                          <td className="px-4 py-3.5 text-right"><span className="text-sm font-medium text-zinc-200">{formatNumber(c.avg_views)}</span></td>
                          <td className="px-4 py-3.5"><span className="text-xs text-zinc-500">{timeAgo(c.last_seen_at)}</span></td>
                          <td className="px-4 py-3.5 text-center">
                            <span className={cn("px-2 py-0.5 rounded-full text-[11px] font-medium border", isInactive ? "bg-zinc-500/10 text-zinc-500 border-zinc-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20")}>
                              {isInactive ? "Inactive" : "Active"}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <button
                              onClick={() => toggleFlag(c.id)}
                              title={c.flagged_outreach ? "Remove flag" : "Flag for Outreach"}
                              className={cn("p-1.5 rounded-md transition-colors", c.flagged_outreach ? "text-amber-400 bg-amber-500/10 hover:bg-amber-500/20" : "text-zinc-600 hover:text-amber-400 hover:bg-amber-500/10")}
                            >
                              {c.flagged_outreach ? <StarOff className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5" />}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── VS. YOU ─────────────────────────────────────── */}
            {activeTab === "vs. You" && (
              <div className="space-y-4">
                {/* Comparison grid */}
                <div className="rounded-xl border border-white/[0.06] bg-[#111111] overflow-hidden">
                  <div className="grid grid-cols-3 border-b border-white/[0.06]">
                    <div className="px-5 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Metric</div>
                    <div className="px-5 py-3 text-center text-[11px] font-medium text-purple-400 uppercase tracking-wider">{selected.name}</div>
                    <div className="px-5 py-3 text-center text-[11px] font-medium text-emerald-400 uppercase tracking-wider">Your Workspace</div>
                  </div>
                  {[
                    { label: "Total Views",      comp: formatNumber(totalViews),    yours: formatNumber(3240000), compWin: totalViews > 3240000 },
                    { label: "Creator Count",    comp: compCreators.length || 12,   yours: 5,                     compWin: (compCreators.length || 12) > 5 },
                    { label: "Avg Views/Video",  comp: formatNumber(avgViews),       yours: formatNumber(680000),  compWin: avgViews > 680000 },
                    { label: "Videos / Month",   comp: 38,                          yours: 20,                    compWin: true },
                    { label: "Top Format",       comp: "Hook-First",                 yours: "Testimonial",         compWin: null },
                  ].map(row => (
                    <div key={row.label} className="grid grid-cols-3 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                      <div className="px-5 py-3.5 text-sm text-zinc-400">{row.label}</div>
                      <div className="px-5 py-3.5 text-center">
                        <span className={cn("text-sm font-semibold", row.compWin === true ? "text-red-400" : row.compWin === false ? "text-emerald-400" : "text-zinc-300")}>
                          {String(row.comp)}
                          {row.compWin === true && <ArrowUpRight className="w-3 h-3 inline ml-0.5" />}
                        </span>
                      </div>
                      <div className="px-5 py-3.5 text-center">
                        <span className={cn("text-sm font-semibold", row.compWin === false ? "text-red-400" : row.compWin === true ? "text-emerald-400" : "text-zinc-300")}>
                          {String(row.yours)}
                          {row.compWin === false && <ArrowDownRight className="w-3 h-3 inline ml-0.5" />}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Overlaid chart */}
                <div className="rounded-xl border border-white/[0.06] bg-[#111111] p-5">
                  <h3 className="text-[15px] font-semibold text-white mb-4">Monthly View Trends — Head to Head</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={weeklyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="week" tick={{ fill: "#52525b", fontSize: 10 }} tickLine={false} axisLine={false} interval={3} />
                      <YAxis tick={{ fill: "#52525b", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${(v/1000000).toFixed(1)}M`} />
                      <Tooltip content={<ChartTooltip />} />
                      <Line type="monotone" dataKey="competitor" stroke="#7C3AED" strokeWidth={2.5} dot={false} name={selected.name} />
                      <Line type="monotone" dataKey="yours" stroke="#10b981" strokeWidth={2.5} dot={false} strokeDasharray="5 3" name="Your workspace" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* ── AI REPORTS ──────────────────────────────────── */}
            {activeTab === "AI Reports" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-zinc-500">{compReports.length} report{compReports.length !== 1 ? "s" : ""} generated</p>
                  <button
                    onClick={handleGenerateReport}
                    disabled={generatingReport}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-70 text-white text-sm font-medium transition-all"
                  >
                    {generatingReport ? (
                      <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</>
                    ) : (
                      <><Sparkles className="w-3.5 h-3.5" /> Generate Fresh Report</>
                    )}
                  </button>
                </div>

                {compReports.map(report => (
                  <div key={report.id} className="rounded-xl border border-white/[0.06] bg-[#111111] overflow-hidden">
                    <div className="px-5 py-4 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-400" />
                          <h3 className="text-[15px] font-semibold text-white">Week of {formatDate(report.week_of)}</h3>
                          {report.id.includes("fresh") && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-600/20 text-purple-400 border border-purple-500/20">New</span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-2 max-w-lg">{report.summary?.slice(0, 120)}...</p>
                      </div>
                      <button
                        onClick={() => setExpandedReport(expandedReport === report.id ? null : report.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 text-sm font-medium transition-all border border-purple-500/20 flex-shrink-0"
                      >
                        {expandedReport === report.id ? <><X className="w-3.5 h-3.5" /> Close</> : <>Read Full Report</>}
                      </button>
                    </div>

                    {expandedReport === report.id && (
                      <div className="border-t border-white/[0.06] px-5 py-4 space-y-4">
                        <div>
                          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Summary</p>
                          <p className="text-sm text-zinc-300 leading-relaxed">{report.summary}</p>
                        </div>
                        {report.recommendations && report.recommendations.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Recommendations</p>
                            <div className="space-y-2">
                              {report.recommendations.map((rec, i) => (
                                <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-purple-600/5 border border-purple-500/10">
                                  <Check className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
                                  <p className="text-sm text-zinc-300">{rec}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Competitor Drawer */}
      <AddCompetitorDrawer
        open={showAddDrawer}
        onClose={() => setShowAddDrawer(false)}
        onAdd={(comp: Competitor) => {
          setCompetitors(prev => [comp, ...prev])
          setSelectedId(comp.id)
        }}
      />
    </div>
  )
}
