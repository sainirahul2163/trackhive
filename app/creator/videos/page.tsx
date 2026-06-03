"use client"

import { useState, useMemo } from "react"
import {
  Play, X, Eye, Heart, MessageCircle, Share2, Bookmark,
  ExternalLink, TrendingUp, ArrowUpRight, ChevronDown, Search,
} from "lucide-react"
import {
  AreaChart, Area, Tooltip, ResponsiveContainer,
} from "recharts"

// ── Types ──────────────────────────────────────────────────────
type Platform = "tiktok" | "instagram" | "youtube"

interface CreatorVideo {
  id: string
  title: string
  platform: Platform
  views: number
  likes: number
  comments: number
  shares: number
  saves: number
  engagement: number
  virality: number
  campaign?: string
  campaignBrand?: string
  postedAt: string
  payout?: number
  dailyViews: number[]
}

// ── Mock data ──────────────────────────────────────────────────
function makeDailyViews(peak: number): number[] {
  return Array.from({ length: 14 }, (_, i) => {
    const decay = Math.max(0.05, 1 - i * 0.08)
    return Math.round(peak * decay * (0.7 + Math.random() * 0.6))
  })
}

const MOCK_VIDEOS: CreatorVideo[] = [
  { id: "v1",  title: "Honest product review — it actually works 🔥",        platform: "tiktok",    views: 3200000, likes: 241000, comments: 18400, shares: 92000, saves: 61000, engagement: 7.4, virality: 9.1, campaign: "Summer Drop 2025",       campaignBrand: "AuraBrand", postedAt: "2025-06-01", payout: 520,  dailyViews: makeDailyViews(380000) },
  { id: "v2",  title: "Day in my life as a fitness creator 💪",               platform: "tiktok",    views: 1800000, likes: 142000, comments: 9800,  shares: 44000, saves: 38000, engagement: 6.8, virality: 8.4, campaign: "Summer Drop 2025",       campaignBrand: "AuraBrand", postedAt: "2025-05-28", payout: 280,  dailyViews: makeDailyViews(210000) },
  { id: "v3",  title: "POV: you finally found skincare that works ✨",        platform: "instagram", views: 880000,  likes: 74000,  comments: 4200,  shares: 18000, saves: 29000, engagement: 7.1, virality: 7.8, campaign: "Back to School Fitness",  campaignBrand: "FitEdge",   postedAt: "2025-05-24", payout: 140,  dailyViews: makeDailyViews(110000) },
  { id: "v4",  title: "Full NexGear headphones unboxing + sound test 🎧",    platform: "youtube",   views: 1500000, likes: 98000,  comments: 12100, shares: 31000, saves: 14000, engagement: 6.0, virality: 8.0, campaign: "Tech Unboxing Series",    campaignBrand: "NexGear",   postedAt: "2025-05-20", payout: 210,  dailyViews: makeDailyViews(180000) },
  { id: "v5",  title: "Get ready with me feat. this summer collection",       platform: "instagram", views: 670000,  likes: 51000,  comments: 3100,  shares: 12000, saves: 22000, engagement: 6.6, virality: 7.4, postedAt: "2025-05-15",             dailyViews: makeDailyViews(85000)  },
  { id: "v6",  title: "My morning routine changed everything (storytime)",     platform: "tiktok",    views: 2400000, likes: 189000, comments: 14200, shares: 67000, saves: 48000, engagement: 7.0, virality: 8.8, postedAt: "2025-05-10",             dailyViews: makeDailyViews(290000) },
  { id: "v7",  title: "Testing viral gym hacks so you don't have to 😤",     platform: "tiktok",    views: 4100000, likes: 321000, comments: 24800, shares: 118000, saves: 79000, engagement: 7.9, virality: 9.6, postedAt: "2025-05-05",             dailyViews: makeDailyViews(480000) },
  { id: "v8",  title: "Aesthetic meal prep for the week 🥑",                  platform: "instagram", views: 490000,  likes: 41000,  comments: 2800,  shares: 9800,  saves: 19000, engagement: 5.9, virality: 6.9, postedAt: "2025-04-29",             dailyViews: makeDailyViews(62000)  },
  { id: "v9",  title: "Rating every sunscreen from drugstore 🌞",             platform: "youtube",   views: 720000,  likes: 58000,  comments: 6200,  shares: 14000, saves: 11000, engagement: 5.7, virality: 7.1, postedAt: "2025-04-22",             dailyViews: makeDailyViews(88000)  },
]

const PLATFORM_CFG: Record<Platform, { label: string; color: string; bg: string }> = {
  tiktok:    { label: "TikTok",    color: "#fafafa", bg: "rgba(255,255,255,0.1)" },
  instagram: { label: "Instagram", color: "#f472b6", bg: "rgba(244,114,182,0.12)" },
  youtube:   { label: "YouTube",   color: "#f87171", bg: "rgba(248,113,113,0.12)" },
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

function ViralityBadge({ score }: { score: number }) {
  const c = score >= 9 ? { label: "🔥 Viral", color: "#f87171", bg: "rgba(239,68,68,0.1)" }
          : score >= 7 ? { label: "📈 Rising", color: "#fbbf24", bg: "rgba(245,158,11,0.1)" }
          :               { label: "— Normal",  color: "#71717a", bg: "rgba(255,255,255,0.05)" }
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", padding: "2px 7px", borderRadius: "99px", backgroundColor: c.bg, fontSize: "10px", fontWeight: 700, color: c.color }}>
      {c.label}
    </span>
  )
}

interface SparkTTProps { active?: boolean; payload?: Array<{ value: number }> }
function SparkTT({ active, payload }: SparkTTProps) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "4px 8px", fontSize: "11px", color: "#a78bfa", fontWeight: 700 }}>
      {fmt(payload[0].value)} views
    </div>
  )
}

interface DrawerProps { video: CreatorVideo; onClose: () => void }
function VideoDrawer({ video, onClose }: DrawerProps) {
  const plat = PLATFORM_CFG[video.platform]
  const sparkData = video.dailyViews.map((v, i) => ({ day: `Day ${i + 1}`, views: v }))
  const platformUrl = video.platform === "tiktok"
    ? "https://tiktok.com" : video.platform === "instagram"
    ? "https://instagram.com" : "https://youtube.com"

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 40 }} />
      <div style={{ position: "fixed", right: 0, top: 0, bottom: 0, width: "min(440px,100vw)", backgroundColor: "#111111", borderLeft: "1px solid rgba(255,255,255,0.08)", zIndex: 50, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "flex-start", gap: "12px" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: "15px", fontWeight: 700, color: "#fafafa", lineHeight: 1.4, marginBottom: "6px" }}>{video.title}</p>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              <span style={{ padding: "2px 8px", borderRadius: "5px", backgroundColor: plat.bg, fontSize: "10px", fontWeight: 700, color: plat.color }}>{plat.label}</span>
              <ViralityBadge score={video.virality} />
              {video.campaign && (
                <span style={{ padding: "2px 8px", borderRadius: "5px", backgroundColor: "rgba(124,58,237,0.1)", fontSize: "10px", fontWeight: 600, color: "#a78bfa" }}>{video.campaignBrand}</span>
              )}
            </div>
          </div>
          <button onClick={onClose} style={{ padding: "6px", borderRadius: "8px", border: "none", backgroundColor: "rgba(255,255,255,0.06)", cursor: "pointer", flexShrink: 0 }}>
            <X style={{ width: "14px", height: "14px", color: "#71717a" }} />
          </button>
        </div>

        <div style={{ padding: "20px 24px", flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Thumbnail placeholder */}
          <div style={{ borderRadius: "12px", backgroundColor: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.12)", aspectRatio: "16/9", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "rgba(124,58,237,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Play style={{ width: "18px", height: "18px", color: "#a78bfa" }} fill="currentColor" />
            </div>
            <p style={{ fontSize: "11px", color: "#52525b" }}>Posted {new Date(video.postedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
          </div>

          {/* Stats grid */}
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "10px" }}>Video Stats</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {[
                { icon: Eye,            label: "Views",    value: fmt(video.views),    color: "#60a5fa" },
                { icon: Heart,          label: "Likes",    value: fmt(video.likes),    color: "#f472b6" },
                { icon: MessageCircle,  label: "Comments", value: fmt(video.comments), color: "#fbbf24" },
                { icon: Share2,         label: "Shares",   value: fmt(video.shares),   color: "#34d399" },
                { icon: Bookmark,       label: "Saves",    value: fmt(video.saves),    color: "#a78bfa" },
                { icon: TrendingUp,     label: "Eng. Rate", value: `${video.engagement}%`, color: "#f87171" },
              ].map(s => {
                const Icon = s.icon
                return (
                  <div key={s.label} style={{ padding: "12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)", backgroundColor: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", gap: "10px" }}>
                    <Icon style={{ width: "14px", height: "14px", color: s.color, flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: "15px", fontWeight: 800, color: "#fafafa", lineHeight: 1 }}>{s.value}</p>
                      <p style={{ fontSize: "10px", color: "#52525b", marginTop: "2px" }}>{s.label}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Daily views sparkline */}
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "10px" }}>Daily Views — last 14 days</p>
            <div style={{ borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)", backgroundColor: "#0d0d0d", padding: "12px 8px 4px" }}>
              <ResponsiveContainer width="100%" height={80}>
                <AreaChart data={sparkData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#7C3AED" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip content={<SparkTT />} />
                  <Area type="monotone" dataKey="views" stroke="#7C3AED" strokeWidth={1.5} fill="url(#sparkGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Campaign */}
          {video.campaign && (
            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "10px" }}>Campaign</p>
              <div style={{ padding: "12px 14px", borderRadius: "10px", border: "1px solid rgba(124,58,237,0.2)", backgroundColor: "rgba(124,58,237,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#fafafa" }}>{video.campaign}</p>
                  <p style={{ fontSize: "11px", color: "#71717a", marginTop: "2px" }}>{video.campaignBrand}</p>
                </div>
                {video.payout && (
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: "14px", fontWeight: 800, color: "#34d399" }}>${video.payout}</p>
                    <p style={{ fontSize: "10px", color: "#52525b" }}>attributed</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Open on platform */}
          <a href={platformUrl} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "11px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)", color: "#a1a1aa", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}>
            <ExternalLink style={{ width: "14px", height: "14px" }} />
            Open on {plat.label}
          </a>
        </div>
      </div>
    </>
  )
}

export default function CreatorVideosPage() {
  const [platform, setPlatform] = useState<Platform | "all">("all")
  const [sort, setSort] = useState<"views" | "recent" | "engagement">("views")
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<CreatorVideo | null>(null)

  const filtered = useMemo(() => {
    let list = MOCK_VIDEOS.filter(v => {
      if (platform !== "all" && v.platform !== platform) return false
      if (search && !v.title.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
    if (sort === "views")      list = [...list].sort((a, b) => b.views - a.views)
    if (sort === "recent")     list = [...list].sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())
    if (sort === "engagement") list = [...list].sort((a, b) => b.engagement - a.engagement)
    return list
  }, [platform, sort, search])

  const totalViews = MOCK_VIDEOS.reduce((s, v) => s + v.views, 0)
  const avgViews   = Math.round(totalViews / MOCK_VIDEOS.length)
  const bestPlat   = "TikTok"

  const PLATFORM_TABS: { id: Platform | "all"; label: string }[] = [
    { id: "all",       label: "All" },
    { id: "tiktok",    label: "TikTok" },
    { id: "instagram", label: "Instagram" },
    { id: "youtube",   label: "YouTube" },
  ]

  return (
    <div style={{ maxWidth: "1000px", display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#fafafa" }}>My Videos</h1>
          <p style={{ fontSize: "13px", color: "#71717a", marginTop: "3px" }}>{MOCK_VIDEOS.length} videos tracked across 3 platforms</p>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 16px", borderRadius: "9px", backgroundColor: "#7C3AED", color: "white", fontSize: "13px", fontWeight: 600, border: "none", cursor: "pointer" }}>
          + Add Video URL
        </button>
      </div>

      {/* Stats bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: "10px" }}>
        {[
          { label: "Total Videos",  value: String(MOCK_VIDEOS.length), icon: Play,       color: "#a78bfa" },
          { label: "Total Views",   value: fmt(totalViews),             icon: Eye,        color: "#60a5fa" },
          { label: "Avg Views",     value: fmt(avgViews),               icon: TrendingUp, color: "#34d399" },
          { label: "Best Platform", value: bestPlat,                    icon: ArrowUpRight, color: "#fbbf24" },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} style={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", backgroundColor: "#111111", padding: "14px 16px", display: "flex", alignItems: "center", gap: "10px" }}>
              <Icon style={{ width: "15px", height: "15px", color: s.color, flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: "16px", fontWeight: 800, color: "#fafafa", lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: "10px", color: "#52525b", marginTop: "3px" }}>{s.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filters row */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
        {/* Platform tabs */}
        <div style={{ display: "flex", gap: "4px", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "9px", padding: "3px" }}>
          {PLATFORM_TABS.map(t => (
            <button key={t.id} onClick={() => setPlatform(t.id)}
              style={{ padding: "6px 12px", borderRadius: "7px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 600, backgroundColor: platform === t.id ? "#1a1a1a" : "transparent", color: platform === t.id ? "#fafafa" : "#71717a", transition: "all 150ms" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: "160px", maxWidth: "260px" }}>
          <Search style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", width: "13px", height: "13px", color: "#52525b" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search videos…"
            style={{ width: "100%", paddingLeft: "32px", paddingRight: "10px", height: "34px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "#111111", color: "#fafafa", fontSize: "12px", outline: "none", boxSizing: "border-box" }} />
        </div>

        {/* Sort */}
        <div style={{ position: "relative" }}>
          <select value={sort} onChange={e => setSort(e.target.value as typeof sort)}
            style={{ paddingLeft: "10px", paddingRight: "28px", height: "34px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "#111111", color: "#a1a1aa", fontSize: "12px", outline: "none", appearance: "none", cursor: "pointer" }}>
            <option value="views">Most Views</option>
            <option value="recent">Most Recent</option>
            <option value="engagement">Highest Engagement</option>
          </select>
          <ChevronDown style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", width: "12px", height: "12px", color: "#52525b", pointerEvents: "none" }} />
        </div>

        <span style={{ fontSize: "12px", color: "#52525b", marginLeft: "auto" }}>{filtered.length} video{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Video grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "72px 24px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)", backgroundColor: "#111111" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "14px", backgroundColor: "rgba(124,58,237,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
            <Play style={{ width: "22px", height: "22px", color: "#a78bfa" }} />
          </div>
          <p style={{ fontSize: "15px", fontWeight: 700, color: "#fafafa", marginBottom: "6px" }}>No videos found</p>
          <p style={{ fontSize: "13px", color: "#71717a" }}>Try adjusting your filters, or add your first video URL.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))", gap: "14px" }}>
          {filtered.map(v => {
            const plat = PLATFORM_CFG[v.platform]
            return (
              <div key={v.id}
                onClick={() => setSelected(v)}
                style={{ borderRadius: "14px", border: "1px solid rgba(255,255,255,0.07)", backgroundColor: "#111111", overflow: "hidden", cursor: "pointer", transition: "border-color 150ms, transform 150ms" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(124,58,237,0.35)"; e.currentTarget.style.transform = "translateY(-2px)" }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "none" }}
              >
                {/* Thumbnail */}
                <div style={{ aspectRatio: "16/9", backgroundColor: "rgba(124,58,237,0.08)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "rgba(124,58,237,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Play style={{ width: "16px", height: "16px", color: "#a78bfa" }} fill="currentColor" />
                  </div>
                  {/* Platform badge */}
                  <span style={{ position: "absolute", top: "8px", left: "8px", padding: "2px 7px", borderRadius: "5px", backgroundColor: plat.bg, fontSize: "9px", fontWeight: 800, color: plat.color }}>{plat.label}</span>
                  {/* Virality */}
                  <span style={{ position: "absolute", bottom: "8px", right: "8px" }}><ViralityBadge score={v.virality} /></span>
                  {/* Views overlay */}
                  <span style={{ position: "absolute", bottom: "8px", left: "8px", fontSize: "14px", fontWeight: 800, color: "white" }}>{fmt(v.views)}</span>
                </div>

                {/* Info */}
                <div style={{ padding: "12px" }}>
                  <p style={{ fontSize: "12px", fontWeight: 600, color: "#e4e4e7", lineHeight: 1.4, marginBottom: "8px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{v.title}</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "11px", color: "#60a5fa", fontWeight: 600 }}>Eng. {v.engagement}%</span>
                    {v.campaign && (
                      <span style={{ fontSize: "10px", padding: "1px 7px", borderRadius: "4px", backgroundColor: "rgba(124,58,237,0.1)", color: "#a78bfa", fontWeight: 600 }}>{v.campaignBrand}</span>
                    )}
                    <span style={{ fontSize: "10px", color: "#52525b" }}>{new Date(v.postedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selected && <VideoDrawer video={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
