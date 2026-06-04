"use client"

import { useState } from "react"
import { Plus, Eye, TrendingUp, Users, BarChart2, ArrowUpRight, ArrowDownRight, X, Play, Zap, Lock, Bell, Mail } from "lucide-react"
import { SignupGateModal } from "@/components/demo/signup-gate-modal"

interface Creator {
  id: number
  handle: string
  platform: string
  platformColor: string
  followers: string
  /** "—" for Instagram */
  views: string
  /** "—" for Instagram */
  avg: string
  growth: string
  engagement: string
  virality: number
  lastPost: string
  videos: number
  avatar: string
}

const MOCK_ACCOUNTS: Creator[] = [
  { id: 1, handle: "@fitnessfiona",  platform: "TikTok",    platformColor: "#fafafa", followers: "1.1M", views: "38.2M", avg: "940K", growth: "+22%", engagement: "7.4%", virality: 9.1, lastPost: "2d ago",  videos: 42, avatar: "FF" },
  { id: 2, handle: "@mikecreates",   platform: "TikTok",    platformColor: "#fafafa", followers: "890K", views: "24.1M", avg: "680K", growth: "+18%", engagement: "6.8%", virality: 8.6, lastPost: "5h ago",  videos: 38, avatar: "MC" },
  { id: 3, handle: "@sarahlifts",    platform: "Instagram", platformColor: "#f472b6", followers: "540K", views: "—",     avg: "—",    growth: "+9%",  engagement: "5.9%", virality: 7.8, lastPost: "3d ago",  videos: 61, avatar: "SL" },
  { id: 4, handle: "@techwithtom",   platform: "YouTube",   platformColor: "#f87171", followers: "280K", views: "8.4M",  avg: "190K", growth: "-3%",  engagement: "4.2%", virality: 6.2, lastPost: "21d ago", videos: 24, avatar: "TT" },
  { id: 5, handle: "@lifestylekai",  platform: "Instagram", platformColor: "#f472b6", followers: "420K", views: "—",     avg: "—",    growth: "+14%", engagement: "6.1%", virality: 7.4, lastPost: "1d ago",  videos: 29, avatar: "LK" },
]

function engagementBadgeStyle(engStr: string): { label: string; backgroundColor: string; color: string; border: string } {
  const val = parseFloat(engStr)
  if (val >= 5) return { label: "Excellent", backgroundColor: "rgba(16,185,129,0.12)", color: "#34d399", border: "1px solid rgba(16,185,129,0.25)" }
  if (val >= 2) return { label: "Good",      backgroundColor: "rgba(59,130,246,0.12)",  color: "#60a5fa", border: "1px solid rgba(59,130,246,0.25)" }
  return            { label: "Average",    backgroundColor: "rgba(113,113,122,0.12)", color: "#a1a1aa", border: "1px solid rgba(113,113,122,0.25)" }
}

const MOCK_VIDEOS: Record<number, { title: string; views: string; virality: number }[]> = {
  1: [
    { title: "Honest product review — it actually works 🔥", views: "3.2M", virality: 9.6 },
    { title: "Day in my life as a fitness creator",          views: "1.8M", virality: 8.4 },
    { title: "Testing viral gym hacks so you don't have to", views: "940K", virality: 7.9 },
  ],
  2: [
    { title: "Why I switched to this brand after 6 months",  views: "2.1M", virality: 8.6 },
    { title: "Behind the scenes of my TikTok setup 🎥",     views: "1.2M", virality: 7.8 },
  ],
  3: [
    { title: "Get ready with me ft. this product",            views: "880K", virality: 7.8 },
    { title: "My morning routine changed everything",          views: "620K", virality: 7.1 },
  ],
  4: [
    { title: "Full MacBook Pro M4 review — 3 months later",  views: "1.5M", virality: 8.0 },
    { title: "Is this the best budget laptop of 2024?",       views: "720K", virality: 6.8 },
  ],
  5: [
    { title: "Day in my life using it every morning",          views: "670K", virality: 7.4 },
    { title: "Aesthetic meal prep for the whole week 🥑",     views: "490K", virality: 6.9 },
  ],
}

function ViralityBadge({ score }: { score: number }) {
  const cfg = score >= 8.5
    ? { label: "🔥 Viral",   bg: "rgba(239,68,68,0.1)",   color: "#f87171"  }
    : score >= 7
    ? { label: "📈 Rising",  bg: "rgba(245,158,11,0.1)",  color: "#fbbf24"  }
    : { label: "— Normal",   bg: "rgba(255,255,255,0.05)", color: "#71717a"  }
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 8px", borderRadius: "99px", backgroundColor: cfg.bg, fontSize: "10px", fontWeight: 700, color: cfg.color }}>
      {cfg.label} <span style={{ fontSize: "11px" }}>{score}</span>
    </span>
  )
}

function PlatformBadge({ name, color }: { name: string; color: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 8px", borderRadius: "6px", backgroundColor: `${color}14`, border: `1px solid ${color}28`, fontSize: "11px", fontWeight: 600, color }}>
      {name}
    </span>
  )
}

export default function DemoAnalyticsPage() {
  const [gateOpen, setGateOpen] = useState(false)
  const [gateFeature, setGateFeature] = useState("this feature")
  const [selected, setSelected] = useState<Creator | null>(null)
  const [igBannerDismissed, setIgBannerDismissed] = useState(false)

  function openGate(feature: string) { setGateFeature(feature); setGateOpen(true) }

  const hasInstagramAccounts = MOCK_ACCOUNTS.some(a => a.platform === "Instagram")

  return (
    <div style={{ position: "relative" }}>
      <div className="space-y-5 max-w-6xl">
        <div className="flex items-center justify-between" style={{ flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 className="text-2xl font-bold text-white">Analytics</h1>
            <p className="text-sm text-zinc-500 mt-0.5">Tracking {MOCK_ACCOUNTS.length} creator accounts</p>
          </div>
          <button
            onClick={() => openGate("account tracking")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-all"
          >
            <Plus className="w-4 h-4" /> Add Account
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {[
            { label: "Tracked Accounts",  value: String(MOCK_ACCOUNTS.length), icon: Users,      fgColor: "#c084fc", bgColor: "rgba(124,58,237,0.1)"  },
            { label: "Total Views",       value: "96.7M",                       icon: Eye,        fgColor: "#60a5fa", bgColor: "rgba(59,130,246,0.1)"  },
            { label: "Avg Virality",      value: "7.8",                          icon: Zap,        fgColor: "#fbbf24", bgColor: "rgba(245,158,11,0.1)"  },
            { label: "Growing",           value: "4 / 5",                        icon: TrendingUp, fgColor: "#34d399", bgColor: "rgba(16,185,129,0.1)"  },
          ].map(s => {
            const Icon = s.icon
            return (
              <div key={s.label} style={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", backgroundColor: "#111111", padding: "16px" }}>
                <div className="flex items-center gap-3">
                  <div style={{ width: "32px", height: "32px", borderRadius: "9px", backgroundColor: s.bgColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon style={{ width: "15px", height: "15px", color: s.fgColor }} />
                  </div>
                  <div>
                    <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider">{s.label}</p>
                    <p className="text-lg font-bold text-white">{s.value}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Instagram data-limitation banner */}
        {hasInstagramAccounts && !igBannerDismissed && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "12px 16px", borderRadius: "10px", border: "1px solid rgba(245,158,11,0.2)", backgroundColor: "rgba(245,158,11,0.05)" }}>
            <BarChart2 style={{ width: "15px", height: "15px", color: "#fbbf24", flexShrink: 0, marginTop: "1px" }} />
            <p style={{ fontSize: "12px", color: "#fde68a", flex: 1, lineHeight: 1.5 }}>
              <span style={{ fontWeight: 700 }}>Instagram view counts are restricted by Meta.</span>{" "}
              Engagement rate (likes + comments ÷ followers) is shown instead.
            </p>
            <button onClick={() => setIgBannerDismissed(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "#f59e0b", flexShrink: 0, padding: 0 }}>
              <X style={{ width: "14px", height: "14px" }} />
            </button>
          </div>
        )}

        {/* Accounts table */}
        <div style={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", backgroundColor: "#111111", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <BarChart2 style={{ width: "15px", height: "15px", color: "#7C3AED" }} />
              <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#fafafa" }}>Tracked Accounts</h2>
            </div>
            <button onClick={() => openGate("export analytics")} style={{ fontSize: "12px", color: "#71717a", background: "none", border: "none", cursor: "pointer" }}>Export CSV</button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  {["Creator", "Platform", "Followers", "Total Views", "Avg / Video", "Engagement", "Virality", "Last Post", ""].map((h, i) => (
                    <th key={i} style={{ padding: "10px 16px", fontSize: "10px", fontWeight: 600, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em", textAlign: i <= 1 ? "left" : "center" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_ACCOUNTS.map(a => {
                  const isPos = a.growth.startsWith("+")
                  const isIg  = a.platform === "Instagram"
                  const badge = engagementBadgeStyle(a.engagement)
                  return (
                    <tr key={a.id}
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", cursor: "pointer", transition: "background-color 150ms" }}
                      onClick={() => setSelected(a)}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.02)")}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ position: "relative", flexShrink: 0 }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <span style={{ fontSize: "10px", fontWeight: 700, color: "#a78bfa" }}>{a.avatar}</span>
                            </div>
                            {isIg && (
                              <div style={{ position: "absolute", bottom: "-2px", right: "-2px", width: "13px", height: "13px", borderRadius: "50%", backgroundColor: "#111111", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Lock style={{ width: "8px", height: "8px", color: "#fbbf24" }} />
                              </div>
                            )}
                          </div>
                          <span style={{ fontSize: "13px", fontWeight: 600, color: "#e4e4e7" }}>{a.handle}</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <PlatformBadge name={a.platform} color={a.platformColor} />
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <span style={{ fontSize: "13px", color: "#a1a1aa" }}>{a.followers}</span>
                      </td>
                      {/* Total Views — "—" for Instagram */}
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        {isIg ? (
                          <span title="Instagram restricts view data to account owners" style={{ fontSize: "13px", fontWeight: 600, color: "#52525b", cursor: "help" }}>—</span>
                        ) : (
                          <span style={{ fontSize: "13px", fontWeight: 600, color: "#e4e4e7" }}>{a.views}</span>
                        )}
                      </td>
                      {/* Avg / Video — "—" for Instagram */}
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        {isIg ? (
                          <span title="Instagram restricts view data to account owners" style={{ fontSize: "13px", color: "#52525b", cursor: "help" }}>—</span>
                        ) : (
                          <span style={{ fontSize: "13px", color: "#a1a1aa" }}>{a.avg}</span>
                        )}
                      </td>
                      {/* Engagement — colored badge */}
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 8px", borderRadius: "99px", fontSize: "11px", fontWeight: 700, ...badge }}>
                          {a.engagement} · {badge.label}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <ViralityBadge score={a.virality} />
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "3px" }}>
                          {isPos
                            ? <ArrowUpRight style={{ width: "12px", height: "12px", color: "#34d399" }} />
                            : <ArrowDownRight style={{ width: "12px", height: "12px", color: "#f87171" }} />}
                          <span style={{ fontSize: "12px", color: "#71717a" }}>{a.lastPost}</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontSize: "12px", color: "#a78bfa", fontWeight: 600 }}>View →</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Creator detail slide-over */}
      {selected && (
        <>
          <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 40 }} onClick={() => setSelected(null)} />
          <div style={{ position: "fixed", right: 0, top: 0, bottom: 0, width: "min(420px, 100vw)", backgroundColor: "#111111", borderLeft: "1px solid rgba(255,255,255,0.08)", zIndex: 50, overflowY: "auto", padding: "24px" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "50%", backgroundColor: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#a78bfa" }}>{selected.avatar}</span>
                </div>
                <div>
                  <p style={{ fontSize: "16px", fontWeight: 700, color: "#fafafa" }}>{selected.handle}</p>
                  <PlatformBadge name={selected.platform} color={selected.platformColor} />
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{ padding: "6px", borderRadius: "8px", border: "none", backgroundColor: "rgba(255,255,255,0.06)", cursor: "pointer" }}>
                <X style={{ width: "14px", height: "14px", color: "#71717a" }} />
              </button>
            </div>

            {/* Key metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "24px" }}>
              {(() => {
                const isIg = selected.platform === "Instagram"
                const metrics = [
                  { label: "Followers",   value: selected.followers },
                  { label: isIg ? "Views (restricted)" : "Total Views", value: isIg ? "—" : selected.views, dim: isIg },
                  { label: isIg ? "Avg / Post (restricted)" : "Avg / Video", value: isIg ? "—" : selected.avg, dim: isIg },
                  { label: "Engagement",  value: selected.engagement },
                  { label: "Virality",    value: String(selected.virality) },
                  { label: isIg ? "Posts" : "Videos", value: String(selected.videos) },
                ]
                return metrics.map(s => (
                  <div key={s.label} style={{ padding: "12px 14px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.07)", backgroundColor: "rgba(255,255,255,0.02)" }}>
                    <p style={{ fontSize: "10px", color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>{s.label}</p>
                    <p style={{ fontSize: "16px", fontWeight: 700, color: s.dim ? "#52525b" : "#fafafa" }}>{s.value}</p>
                  </div>
                ))
              })()}
            </div>

            {/* Growth */}
            <div style={{ padding: "12px 14px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.07)", backgroundColor: "rgba(255,255,255,0.02)", marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px", color: "#71717a" }}>30-day growth</span>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                {selected.growth.startsWith("+")
                  ? <ArrowUpRight style={{ width: "14px", height: "14px", color: "#34d399" }} />
                  : <ArrowDownRight style={{ width: "14px", height: "14px", color: "#f87171" }} />}
                <span style={{ fontSize: "16px", fontWeight: 700, color: selected.growth.startsWith("+") ? "#34d399" : "#f87171" }}>{selected.growth}</span>
              </div>
            </div>

            {/* Top videos */}
            <p style={{ fontSize: "12px", fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "10px" }}>Top Videos</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
              {(MOCK_VIDEOS[selected.id] ?? []).map((v, i) => (
                <div key={i} style={{ padding: "12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.07)", backgroundColor: "rgba(255,255,255,0.02)", display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <div style={{ width: "30px", height: "30px", borderRadius: "8px", backgroundColor: "rgba(124,58,237,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
                    <Play style={{ width: "12px", height: "12px", color: "#a78bfa" }} fill="currentColor" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "12px", color: "#d4d4d8", lineHeight: 1.4, marginBottom: "4px" }}>{v.title}</p>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span style={{ fontSize: "11px", fontWeight: 600, color: "#a1a1aa" }}>{v.views}</span>
                      <ViralityBadge score={v.virality} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Connect Instagram CTA (for Instagram accounts) */}
            {selected.platform === "Instagram" && (
              <div style={{ borderRadius: "12px", border: "1px solid rgba(124,58,237,0.25)", backgroundColor: "rgba(124,58,237,0.05)", padding: "16px", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Eye style={{ width: "14px", height: "14px", color: "white" }} />
                  </div>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 700, color: "#fafafa", marginBottom: "2px" }}>Unlock Instagram View Counts</p>
                    <p style={{ fontSize: "11px", color: "#71717a" }}>Meta restricts view data to account owners only</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ flex: 1, position: "relative" }}>
                    <Mail style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", width: "12px", height: "12px", color: "#52525b" }} />
                    <input
                      type="email"
                      placeholder="your@email.com"
                      style={{ width: "100%", padding: "8px 10px 8px 28px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#e4e4e7", fontSize: "12px", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                  <button
                    onClick={() => openGate("Instagram view counts")}
                    style={{ display: "flex", alignItems: "center", gap: "4px", padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(124,58,237,0.4)", backgroundColor: "rgba(124,58,237,0.1)", color: "#c084fc", fontSize: "12px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
                  >
                    <Bell style={{ width: "12px", height: "12px" }} />
                    Notify me
                  </button>
                </div>
              </div>
            )}

            {/* Gate CTA */}
            <div style={{ borderRadius: "12px", border: "1px solid rgba(124,58,237,0.25)", backgroundColor: "rgba(124,58,237,0.06)", padding: "20px", textAlign: "center" }}>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#fafafa", marginBottom: "6px" }}>See full analytics for {selected.handle}</p>
              <p style={{ fontSize: "12px", color: "#71717a", marginBottom: "16px", lineHeight: 1.5 }}>30-day trend charts, engagement breakdown, weekly posting patterns, and more.</p>
              <button
                onClick={() => openGate("full creator analytics")}
                style={{ width: "100%", padding: "10px", borderRadius: "9px", backgroundColor: "#7C3AED", color: "white", fontSize: "13px", fontWeight: 600, border: "none", cursor: "pointer" }}
              >
                Unlock Full Analytics
              </button>
            </div>
          </div>
        </>
      )}

      <SignupGateModal open={gateOpen} onClose={() => setGateOpen(false)} feature={gateFeature} />
    </div>
  )
}
