"use client"

import { useState, useEffect } from "react"
import {
  Eye, Megaphone, DollarSign, AlertTriangle,
  ArrowUpRight, ArrowDownRight, TrendingUp, Play, MoreHorizontal,
  Users, Zap, Activity, Radio,
} from "lucide-react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts"
import { SignupGateModal } from "@/components/demo/signup-gate-modal"

// ── Chart data ─────────────────────────────────────────────────
const VIEWS_DATA = [
  { month: "Jan", value: 3200000 }, { month: "Feb", value: 4100000 },
  { month: "Mar", value: 3800000 }, { month: "Apr", value: 5200000 },
  { month: "May", value: 6100000 }, { month: "Jun", value: 5700000 },
  { month: "Jul", value: 7800000 }, { month: "Aug", value: 8200000 },
  { month: "Sep", value: 7100000 }, { month: "Oct", value: 9400000 },
  { month: "Nov", value: 11200000 }, { month: "Dec", value: 24800000 },
]

const ENGAGEMENT_DATA = [
  { month: "Jan", value: 4.2 }, { month: "Feb", value: 5.1 },
  { month: "Mar", value: 4.7 }, { month: "Apr", value: 6.3 },
  { month: "May", value: 7.1 }, { month: "Jun", value: 6.8 },
  { month: "Jul", value: 7.4 }, { month: "Aug", value: 8.0 },
  { month: "Sep", value: 7.2 }, { month: "Oct", value: 8.9 },
  { month: "Nov", value: 9.1 }, { month: "Dec", value: 10.4 },
]

const PAYOUT_DATA = [
  { month: "Jan", value: 8200 }, { month: "Feb", value: 11500 },
  { month: "Mar", value: 9800 }, { month: "Apr", value: 21400 },
  { month: "May", value: 14700 }, { month: "Jun", value: 16800 },
  { month: "Jul", value: 22100 }, { month: "Aug", value: 18900 },
  { month: "Sep", value: 25400 }, { month: "Oct", value: 31200 },
  { month: "Nov", value: 28700 }, { month: "Dec", value: 48200 },
]

const CHART_TABS = [
  { id: "views",      label: "Views",       color: "#7C3AED", data: VIEWS_DATA,      fmt: (v: number) => `${(v/1000000).toFixed(1)}M`         },
  { id: "engagement", label: "Engagement",  color: "#10b981", data: ENGAGEMENT_DATA, fmt: (v: number) => `${v.toFixed(1)}%`                   },
  { id: "payouts",    label: "Payouts",     color: "#f59e0b", data: PAYOUT_DATA,     fmt: (v: number) => `$${(v/1000).toFixed(0)}K`           },
] as const

// ── Stat cards ─────────────────────────────────────────────────
const METRICS = [
  { title: "Total Views",      value: "24.8M",   change: "+18.2%", up: true,  icon: Eye,          fgColor: "#60a5fa", bgColor: "rgba(59,130,246,0.1)"   },
  { title: "Active Campaigns", value: "12",      change: "+3",     up: true,  icon: Megaphone,    fgColor: "#c084fc", bgColor: "rgba(124,58,237,0.1)"   },
  { title: "Creator Payouts",  value: "$48,230", change: "-$2,100",up: false, icon: DollarSign,   fgColor: "#34d399", bgColor: "rgba(16,185,129,0.1)"   },
  { title: "Creator Alerts",   value: "7",       change: "+4",     up: false, icon: AlertTriangle, fgColor: "#fbbf24", bgColor: "rgba(245,158,11,0.1)"  },
]

// ── Platform breakdown ─────────────────────────────────────────
const PLATFORMS = [
  { name: "TikTok",    pct: 62, views: "15.4M", barColor: "#fafafa" },
  { name: "Instagram", pct: 28, views: "6.9M",  barColor: "#f472b6" },
  { name: "YouTube",   pct: 10, views: "2.5M",  barColor: "#f87171" },
]

// ── Top creators ───────────────────────────────────────────────
const TOP_CREATORS = [
  { rank: 1, handle: "@fitnessfiona",  platform: "TikTok",    followers: "1.1M", avgViews: "940K", growth: "+22%", score: 9.1, avatar: "FF" },
  { rank: 2, handle: "@mikecreates",   platform: "TikTok",    followers: "890K", avgViews: "680K", growth: "+18%", score: 8.6, avatar: "MC" },
  { rank: 3, handle: "@lifestylekai",  platform: "Instagram", followers: "420K", avgViews: "250K", growth: "+14%", score: 7.8, avatar: "LK" },
  { rank: 4, handle: "@sarahlifts",    platform: "Instagram", followers: "540K", avgViews: "310K", growth: "+9%",  score: 7.4, avatar: "SL" },
  { rank: 5, handle: "@techwithtom",   platform: "YouTube",   followers: "280K", avgViews: "190K", growth: "-3%",  score: 6.2, avatar: "TT" },
]

// ── Top videos ─────────────────────────────────────────────────
const TOP_VIDEOS = [
  { id: 1, title: "Honest product review — it actually works 🔥", creator: "@fitnessfiona", platform: "TikTok",    views: "3.2M",  virality: 9.1 },
  { id: 2, title: "Why I switched to this brand after 6 months",  creator: "@mikecreates",  platform: "Instagram", views: "2.1M",  virality: 8.6 },
  { id: 3, title: "Full unboxing + first impressions",            creator: "@techwithtom",  platform: "YouTube",   views: "1.5M",  virality: 8.0 },
  { id: 4, title: "Get ready with me ft. this product",           creator: "@sarahlifts",   platform: "TikTok",    views: "880K",  virality: 7.8 },
  { id: 5, title: "Day in my life using it every morning",        creator: "@lifestylekai", platform: "Instagram", views: "670K",  virality: 7.4 },
]

// ── Alerts ─────────────────────────────────────────────────────
const ALERTS = [
  { id: 1, type: "success", message: "@fitnessfiona posted — 3.2M views in 48h 🔥" },
  { id: 2, type: "warning", message: "\"Summer Drop\" is 14% behind target views" },
  { id: 3, type: "info",    message: "Payout of $4,800 pending for @mikecreates" },
  { id: 4, type: "error",   message: "@techwithtom hasn't posted in 21 days" },
]

const ALERT_STYLE: Record<string, { border: string; bg: string; color: string }> = {
  warning: { border: "rgba(245,158,11,0.25)", bg: "rgba(245,158,11,0.06)", color: "#fbbf24" },
  success: { border: "rgba(16,185,129,0.25)", bg: "rgba(16,185,129,0.06)", color: "#34d399" },
  info:    { border: "rgba(59,130,246,0.25)",  bg: "rgba(59,130,246,0.06)",  color: "#60a5fa" },
  error:   { border: "rgba(239,68,68,0.25)",   bg: "rgba(239,68,68,0.06)",   color: "#f87171" },
}

// ── Live ticker ────────────────────────────────────────────────
const TICKER = [
  { icon: "🔥", text: "@fitnessfiona just posted — 2.3M views in 6h" },
  { icon: "💰", text: "Payout of $7,100 approved for @jakefit" },
  { icon: "📈", text: "@mikecreates hit viral spike — 890K views in 4h" },
  { icon: "🚨", text: "Alert: @techwithtom engagement dropped 18% this week" },
  { icon: "✅", text: "Campaign \"Summer Drop\" reached 74% of target views" },
  { icon: "⚡", text: "@lifestylekai added to 3 active campaigns" },
  { icon: "💸", text: "$22,800 in payouts processed this month" },
]

interface TTProps { active?: boolean; payload?: Array<{ value: number }>; label?: string; fmt?: (v: number) => string }
function ChartTip({ active, payload, label, fmt }: TTProps) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "8px 12px" }}>
      <p style={{ fontSize: "11px", color: "#71717a", marginBottom: "2px" }}>{label}</p>
      <p style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>{fmt ? fmt(payload[0].value) : payload[0].value}</p>
    </div>
  )
}

export default function DemoDashboard() {
  const [gateOpen, setGateOpen] = useState(false)
  const [gateFeature, setGateFeature] = useState("this feature")
  const [chartTab, setChartTab] = useState<"views" | "engagement" | "payouts">("views")
  const [tickerIdx, setTickerIdx] = useState(0)
  const [tickerVisible, setTickerVisible] = useState(true)

  function openGate(feature: string) { setGateFeature(feature); setGateOpen(true) }

  // Rotate ticker every 3.5s with fade
  useEffect(() => {
    const t = setInterval(() => {
      setTickerVisible(false)
      setTimeout(() => { setTickerIdx(i => (i + 1) % TICKER.length); setTickerVisible(true) }, 350)
    }, 3500)
    return () => clearInterval(t)
  }, [])

  const activeCfg = CHART_TABS.find(t => t.id === chartTab)!

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Demo workspace — simulated data</p>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button onClick={() => openGate("analytics export")} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "transparent", color: "#a1a1aa", fontSize: "13px", cursor: "pointer" }}>
            Export CSV
          </button>
          <button onClick={() => openGate("campaign creation")} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "8px", backgroundColor: "#7C3AED", color: "white", fontSize: "13px", fontWeight: 600, cursor: "pointer", border: "none" }}>
            + New Campaign
          </button>
        </div>
      </div>

      {/* Live ticker */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 16px", borderRadius: "10px", border: "1px solid rgba(16,185,129,0.2)", backgroundColor: "rgba(16,185,129,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
          <Radio style={{ width: "12px", height: "12px", color: "#34d399" }} />
          <span style={{ fontSize: "10px", fontWeight: 700, color: "#34d399", textTransform: "uppercase", letterSpacing: "0.08em" }}>Live</span>
        </div>
        <div style={{ height: "14px", width: "1px", backgroundColor: "rgba(255,255,255,0.08)", flexShrink: 0 }} />
        <p style={{ fontSize: "12px", color: "#a1a1aa", transition: "opacity 350ms", opacity: tickerVisible ? 1 : 0 }}>
          <span style={{ marginRight: "6px" }}>{TICKER[tickerIdx].icon}</span>
          {TICKER[tickerIdx].text}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {METRICS.map(m => {
          const Icon = m.icon
          return (
            <div key={m.title} style={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", backgroundColor: "#111111", padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                <p style={{ fontSize: "11px", fontWeight: 600, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.07em" }}>{m.title}</p>
                <div style={{ width: "28px", height: "28px", borderRadius: "8px", backgroundColor: m.bgColor, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon style={{ width: "14px", height: "14px", color: m.fgColor }} />
                </div>
              </div>
              <p style={{ fontSize: "24px", fontWeight: 800, color: "#fafafa", marginBottom: "6px" }}>{m.value}</p>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                {m.up
                  ? <ArrowUpRight style={{ width: "13px", height: "13px", color: "#34d399" }} />
                  : <ArrowDownRight style={{ width: "13px", height: "13px", color: "#f87171" }} />}
                <span style={{ fontSize: "12px", fontWeight: 600, color: m.up ? "#34d399" : "#f87171" }}>{m.change}</span>
                <span style={{ fontSize: "11px", color: "#52525b", marginLeft: "2px" }}>vs last month</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Chart + Alerts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Main chart */}
        <div style={{ gridColumn: "span 2", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", backgroundColor: "#111111", padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
            <div>
              <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#fafafa" }}>Performance</h2>
              <p style={{ fontSize: "12px", color: "#52525b", marginTop: "2px" }}>Jan – Dec 2024</p>
            </div>
            {/* Tab switcher */}
            <div style={{ display: "flex", gap: "4px", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "3px" }}>
              {CHART_TABS.map(t => (
                <button key={t.id} onClick={() => setChartTab(t.id as typeof chartTab)}
                  style={{ padding: "5px 12px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 600, transition: "all 150ms", backgroundColor: chartTab === t.id ? "#1a1a1a" : "transparent", color: chartTab === t.id ? "#fafafa" : "#71717a" }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={activeCfg.data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${chartTab}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={activeCfg.color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={activeCfg.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#52525b", fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "#52525b", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={activeCfg.fmt} />
              <Tooltip content={<ChartTip fmt={activeCfg.fmt} />} />
              <Area key={chartTab} type="monotone" dataKey="value" stroke={activeCfg.color} strokeWidth={2} fill={`url(#grad-${chartTab})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Alerts */}
        <div style={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", backgroundColor: "#111111", padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#fafafa" }}>Recent Alerts</h2>
            <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "99px", backgroundColor: "rgba(239,68,68,0.1)", color: "#f87171" }}>4 new</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {ALERTS.map(a => {
              const s = ALERT_STYLE[a.type]
              return (
                <div key={a.id} style={{ padding: "10px 12px", borderRadius: "8px", border: `1px solid ${s.border}`, backgroundColor: s.bg, fontSize: "12px", color: s.color, lineHeight: 1.5 }}>
                  {a.message}
                </div>
              )
            })}
          </div>
          <button onClick={() => openGate("alert management")} style={{ marginTop: "12px", width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.07)", backgroundColor: "transparent", color: "#71717a", fontSize: "12px", cursor: "pointer" }}>
            View all alerts →
          </button>
        </div>
      </div>

      {/* Platform breakdown + Top creators */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Platform breakdown */}
        <div style={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", backgroundColor: "#111111", padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
            <Activity style={{ width: "15px", height: "15px", color: "#7C3AED" }} />
            <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#fafafa" }}>Platform Split</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {PLATFORMS.map(p => (
              <div key={p.name}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{ fontSize: "13px", color: "#e4e4e7", fontWeight: 500 }}>{p.name}</span>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", color: "#71717a" }}>{p.views}</span>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#fafafa" }}>{p.pct}%</span>
                  </div>
                </div>
                <div style={{ height: "6px", borderRadius: "3px", backgroundColor: "rgba(255,255,255,0.06)" }}>
                  <div style={{ height: "100%", width: `${p.pct}%`, borderRadius: "3px", backgroundColor: p.name === "TikTok" ? "#7C3AED" : p.name === "Instagram" ? "#f472b6" : "#f87171", transition: "width 600ms" }} />
                </div>
              </div>
            ))}
          </div>
          {/* Mini chart */}
          <div style={{ marginTop: "20px" }}>
            <ResponsiveContainer width="100%" height={80}>
              <BarChart data={PLATFORMS.map(p => ({ name: p.name, value: p.pct }))} barSize={28}>
                <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#7C3AED" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top creators */}
        <div style={{ gridColumn: "span 2", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", backgroundColor: "#111111", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Users style={{ width: "15px", height: "15px", color: "#7C3AED" }} />
              <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#fafafa" }}>Top Creators</h2>
            </div>
            <button onClick={() => openGate("full creator analytics")} style={{ fontSize: "12px", color: "#a78bfa", background: "none", border: "none", cursor: "pointer" }}>
              View all →
            </button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                {["#", "Creator", "Platform", "Followers", "Avg Views", "Growth", "Score"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", fontSize: "10px", fontWeight: 600, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em", textAlign: h === "#" || h === "Score" || h === "Growth" || h === "Followers" || h === "Avg Views" ? "center" : "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TOP_CREATORS.map(c => {
                const isPos = c.growth.startsWith("+")
                const scoreColor = c.score >= 8.5 ? "#f87171" : c.score >= 7 ? "#fbbf24" : "#71717a"
                return (
                  <tr key={c.rank} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", cursor: "pointer" }}
                    onClick={() => openGate("creator detail view")}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.02)")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td style={{ padding: "10px 14px", textAlign: "center" }}>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#52525b" }}>{c.rank}</span>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "30px", height: "30px", borderRadius: "50%", backgroundColor: "rgba(124,58,237,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <span style={{ fontSize: "10px", fontWeight: 700, color: "#a78bfa" }}>{c.avatar}</span>
                        </div>
                        <span style={{ fontSize: "13px", fontWeight: 500, color: "#e4e4e7" }}>{c.handle}</span>
                      </div>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{ fontSize: "11px", color: "#71717a" }}>{c.platform}</span>
                    </td>
                    <td style={{ padding: "10px 14px", textAlign: "center" }}>
                      <span style={{ fontSize: "12px", color: "#a1a1aa" }}>{c.followers}</span>
                    </td>
                    <td style={{ padding: "10px 14px", textAlign: "center" }}>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "#e4e4e7" }}>{c.avgViews}</span>
                    </td>
                    <td style={{ padding: "10px 14px", textAlign: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "3px" }}>
                        {isPos
                          ? <ArrowUpRight style={{ width: "12px", height: "12px", color: "#34d399" }} />
                          : <ArrowDownRight style={{ width: "12px", height: "12px", color: "#f87171" }} />}
                        <span style={{ fontSize: "12px", fontWeight: 600, color: isPos ? "#34d399" : "#f87171" }}>{c.growth}</span>
                      </div>
                    </td>
                    <td style={{ padding: "10px 14px", textAlign: "center" }}>
                      <span style={{ fontSize: "12px", fontWeight: 700, padding: "2px 8px", borderRadius: "6px", backgroundColor: `${scoreColor}18`, color: scoreColor }}>{c.score}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top videos */}
      <div style={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", backgroundColor: "#111111", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Zap style={{ width: "15px", height: "15px", color: "#7C3AED" }} />
            <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#fafafa" }}>Top Performing Videos</h2>
          </div>
          <button onClick={() => openGate("detailed video analytics")} style={{ fontSize: "12px", color: "#a78bfa", background: "none", border: "none", cursor: "pointer" }}>
            View all →
          </button>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              {["Video", "Creator", "Platform", "Views", "Virality"].map((h, i) => (
                <th key={h} style={{ padding: "10px 16px", fontSize: "10px", fontWeight: 600, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em", textAlign: i >= 3 ? "center" : "left" }}>{h}</th>
              ))}
              <th style={{ padding: "10px 16px" }} />
            </tr>
          </thead>
          <tbody>
            {TOP_VIDEOS.map(v => (
              <tr key={v.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", cursor: "pointer" }}
                onClick={() => openGate("video details")}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.02)")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <td style={{ padding: "11px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "30px", height: "30px", borderRadius: "8px", backgroundColor: "rgba(124,58,237,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Play style={{ width: "12px", height: "12px", color: "#a78bfa" }} fill="currentColor" />
                    </div>
                    <span style={{ fontSize: "13px", color: "#d4d4d8", maxWidth: "260px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.title}</span>
                  </div>
                </td>
                <td style={{ padding: "11px 16px" }}>
                  <span style={{ fontSize: "13px", color: "#a1a1aa" }}>{v.creator}</span>
                </td>
                <td style={{ padding: "11px 16px" }}>
                  <span style={{ fontSize: "12px", color: "#71717a" }}>{v.platform}</span>
                </td>
                <td style={{ padding: "11px 16px", textAlign: "center" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#e4e4e7" }}>{v.views}</span>
                </td>
                <td style={{ padding: "11px 16px", textAlign: "center" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "99px", backgroundColor: v.virality >= 8.5 ? "rgba(239,68,68,0.12)" : v.virality >= 7 ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.05)", color: v.virality >= 8.5 ? "#f87171" : v.virality >= 7 ? "#fbbf24" : "#71717a" }}>
                    {v.virality}
                  </span>
                </td>
                <td style={{ padding: "11px 16px" }}>
                  <MoreHorizontal style={{ width: "15px", height: "15px", color: "#52525b" }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quick stats footer strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px" }}>
        {[
          { icon: TrendingUp, label: "Avg virality score", value: "8.2", color: "#7C3AED" },
          { icon: Users,      label: "Creators tracked",   value: "23",  color: "#3b82f6" },
          { icon: DollarSign, label: "Total paid out",      value: "$5.1M", color: "#10b981" },
          { icon: Activity,   label: "Posts this week",    value: "47",  color: "#f59e0b" },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} style={{ borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)", backgroundColor: "#111111", padding: "14px 16px", display: "flex", gap: "10px", alignItems: "center" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "8px", backgroundColor: `${s.color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon style={{ width: "13px", height: "13px", color: s.color }} />
              </div>
              <div>
                <p style={{ fontSize: "16px", fontWeight: 800, color: "#fafafa", lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: "10px", color: "#52525b", marginTop: "3px" }}>{s.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      <SignupGateModal open={gateOpen} onClose={() => setGateOpen(false)} feature={gateFeature} />
    </div>
  )
}
