"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Eye, Megaphone, DollarSign, Clock,
  TrendingUp,
  CheckCircle2, Flame, Bell, Zap, ChevronRight,
  ExternalLink,
} from "lucide-react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"
import { createBrowserClient } from "@supabase/ssr"

// ── Types ──────────────────────────────────────────────────────
type CampaignStatus = "active" | "pending" | "completed"

interface CreatorCampaign {
  id: string
  brand: string
  brandInitials: string
  brandColor: string
  name: string
  brief: string
  deadline: string
  daysLeft: number
  status: CampaignStatus
  videosRequired: number
  videosPosted: number
  earnings: string
  potential: string
}

interface ViewsDataPoint {
  date: string
  views: number
}

const VIEWS_DATA: ViewsDataPoint[] = []
const CAMPAIGNS: CreatorCampaign[] = []

type ActivityType = "payment" | "viral" | "campaign" | "payout_sent" | "milestone"

interface Activity {
  id: number
  type: ActivityType
  message: string
  time: string
  amount?: string
}

const ACTIVITY: Activity[] = []

const ACTIVITY_ICON: Record<ActivityType, { icon: typeof CheckCircle2; color: string; bg: string }> = {
  payment:     { icon: DollarSign,  color: "#34d399", bg: "rgba(16,185,129,0.1)"  },
  viral:       { icon: Flame,       color: "#f87171", bg: "rgba(239,68,68,0.1)"   },
  campaign:    { icon: Megaphone,   color: "#a78bfa", bg: "rgba(124,58,237,0.1)"  },
  payout_sent: { icon: DollarSign,  color: "#60a5fa", bg: "rgba(59,130,246,0.1)"  },
  milestone:   { icon: Zap,        color: "#fbbf24", bg: "rgba(245,158,11,0.1)"  },
}

const STATUS_CFG = {
  active:    { label: "Active",    color: "#34d399", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.25)"  },
  pending:   { label: "Pending",   color: "#fbbf24", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)"  },
  completed: { label: "Completed", color: "#60a5fa", bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.25)"  },
}

interface TTProps { active?: boolean; payload?: Array<{ value: number }>; label?: string }
function ChartTip({ active, payload, label }: TTProps) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "8px 12px" }}>
      <p style={{ fontSize: "11px", color: "#71717a", marginBottom: "2px" }}>{label}</p>
      <p style={{ fontSize: "13px", fontWeight: 700, color: "#a78bfa" }}>
        {(payload[0].value / 1000).toFixed(0)}K views
      </p>
    </div>
  )
}

interface BriefModalProps { campaign: CreatorCampaign; onClose: () => void }
function BriefModal({ campaign, onClose }: BriefModalProps) {
  const s = STATUS_CFG[campaign.status]
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", zIndex: 50 }} />
      <div style={{ position: "fixed", left: "50%", top: "50%", transform: "translate(-50%,-50%)", zIndex: 51, width: "100%", maxWidth: "540px", maxHeight: "90vh", overflowY: "auto", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.1)", backgroundColor: "#111111", padding: "28px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: `${campaign.brandColor}20`, border: `1px solid ${campaign.brandColor}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: "13px", fontWeight: 800, color: campaign.brandColor }}>{campaign.brandInitials}</span>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "16px", fontWeight: 700, color: "#fafafa" }}>{campaign.name}</p>
            <p style={{ fontSize: "12px", color: "#71717a" }}>{campaign.brand}</p>
          </div>
          <span style={{ padding: "3px 10px", borderRadius: "99px", backgroundColor: s.bg, border: `1px solid ${s.border}`, fontSize: "11px", fontWeight: 700, color: s.color }}>{s.label}</span>
        </div>

        {/* Brief */}
        <div style={{ marginBottom: "20px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px" }}>Campaign Brief</p>
          <p style={{ fontSize: "14px", color: "#a1a1aa", lineHeight: 1.7 }}>{campaign.brief}</p>
        </div>

        {/* Requirements */}
        <div style={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.07)", backgroundColor: "rgba(255,255,255,0.02)", padding: "16px", marginBottom: "20px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "12px" }}>Requirements</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {[
              { label: "Videos needed",   value: `${campaign.videosRequired} videos` },
              { label: "Deadline",         value: campaign.deadline                   },
              { label: "Days remaining",   value: `${campaign.daysLeft} days`         },
              { label: "Your progress",    value: `${campaign.videosPosted} / ${campaign.videosRequired}` },
            ].map(r => (
              <div key={r.label}>
                <p style={{ fontSize: "11px", color: "#52525b", marginBottom: "2px" }}>{r.label}</p>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "#e4e4e7" }}>{r.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Payout rules */}
        <div style={{ borderRadius: "12px", border: "1px solid rgba(124,58,237,0.2)", backgroundColor: "rgba(124,58,237,0.05)", padding: "16px", marginBottom: "24px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "10px" }}>Payout Summary</p>
          <p style={{ fontSize: "14px", color: "#a78bfa", fontWeight: 600 }}>$150 base + $5 CPM per video</p>
          <p style={{ fontSize: "12px", color: "#71717a", marginTop: "4px" }}>Potential: up to {campaign.potential} total</p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onClose} style={{ flex: 1, padding: "11px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "transparent", color: "#a1a1aa", fontSize: "13px", cursor: "pointer" }}>
            Close
          </button>
          <Link href="/creator/campaigns" onClick={onClose} style={{ flex: 2, padding: "11px", borderRadius: "10px", backgroundColor: "#7C3AED", color: "white", fontSize: "13px", fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            I understand, let&apos;s go! <ChevronRight style={{ width: "14px", height: "14px" }} />
          </Link>
        </div>
      </div>
    </>
  )
}

export default function CreatorHomePage() {
  const [creatorName, setCreatorName] = useState("there")
  const [activeBrief, setActiveBrief] = useState<CreatorCampaign | null>(null)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    supabase.auth.getUser().then(({ data }) => {
      const meta = data?.user?.user_metadata
      const name = meta?.full_name ?? meta?.name ?? data?.user?.email?.split("@")[0] ?? "there"
      setCreatorName((name as string).split(" ")[0])
    }).catch(() => {})
  }, [])

  const totalViews = VIEWS_DATA.reduce((s, d) => s + d.views, 0)
  const activeCampaignCount = CAMPAIGNS.filter(c => c.status === "active").length

  return (
    <div style={{ maxWidth: "960px", display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Welcome header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "clamp(20px,3vw,26px)", fontWeight: 800, color: "#fafafa", lineHeight: 1.2 }}>
            Welcome back, {creatorName} 👋
          </h1>
          <p style={{ fontSize: "13px", color: "#71717a", marginTop: "4px" }}>
            Here&apos;s a snapshot of your creator performance.
          </p>
        </div>
        <Link href="/creator/videos" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 16px", borderRadius: "9px", backgroundColor: "#7C3AED", color: "white", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}>
          + Add Video
        </Link>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
        {[
          { title: "Total Views",      value: totalViews > 0 ? totalViews.toLocaleString() : "0", icon: Eye,       fgColor: "#60a5fa", bgColor: "rgba(59,130,246,0.1)"  },
          { title: "Active Campaigns", value: String(activeCampaignCount),                         icon: Megaphone,  fgColor: "#a78bfa", bgColor: "rgba(124,58,237,0.1)" },
          { title: "Total Earnings",   value: "$0",                                                  icon: DollarSign, fgColor: "#34d399", bgColor: "rgba(16,185,129,0.1)" },
          { title: "Pending Payout",   value: "$0",                                                  icon: Clock,     fgColor: "#fbbf24", bgColor: "rgba(245,158,11,0.1)" },
        ].map(m => {
          const Icon = m.icon
          return (
            <div key={m.title} style={{ borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)", backgroundColor: "#111111", padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                <p style={{ fontSize: "11px", fontWeight: 600, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.07em" }}>{m.title}</p>
                <div style={{ width: "28px", height: "28px", borderRadius: "8px", backgroundColor: m.bgColor, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon style={{ width: "13px", height: "13px", color: m.fgColor }} />
                </div>
              </div>
              <p style={{ fontSize: "26px", fontWeight: 800, color: "#fafafa", lineHeight: 1 }}>{m.value}</p>
            </div>
          )
        })}
      </div>

      {/* Chart + Activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
        {/* Views chart */}
        <div style={{ borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)", backgroundColor: "#111111", padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
            <div>
              <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#fafafa" }}>Views — last 30 days</h2>
              <p style={{ fontSize: "12px", color: "#52525b", marginTop: "2px" }}>
                {totalViews > 0 ? `${totalViews.toLocaleString()} total` : "No view data yet"}
              </p>
            </div>
            {totalViews > 0 && <TrendingUp style={{ width: "16px", height: "16px", color: "#34d399" }} />}
          </div>
          {VIEWS_DATA.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 24px" }}>
              <Eye style={{ width: "28px", height: "28px", color: "#52525b", margin: "0 auto 12px" }} />
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#a1a1aa", marginBottom: "4px" }}>No views tracked yet</p>
              <p style={{ fontSize: "12px", color: "#52525b" }}>Add videos to start seeing your performance chart.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={VIEWS_DATA} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="creatorGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "#52525b", fontSize: 10 }} tickLine={false} axisLine={false} interval={4} />
                <YAxis tick={{ fill: "#52525b", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${(v/1000).toFixed(0)}K`} />
                <Tooltip content={<ChartTip />} />
                <Area type="monotone" dataKey="views" stroke="#7C3AED" strokeWidth={2} fill="url(#creatorGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Active campaigns + Activity */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>

        {/* Active campaigns */}
        <div style={{ borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)", backgroundColor: "#111111", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#fafafa" }}>Active Campaigns</h2>
            <Link href="/creator/campaigns" style={{ fontSize: "12px", color: "#a78bfa", textDecoration: "none" }}>View all →</Link>
          </div>

          {CAMPAIGNS.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 16px" }}>
              <Megaphone style={{ width: "24px", height: "24px", color: "#52525b", margin: "0 auto 10px" }} />
              <p style={{ fontSize: "13px", fontWeight: 600, color: "#a1a1aa", marginBottom: "4px" }}>No active campaigns</p>
              <p style={{ fontSize: "12px", color: "#52525b" }}>Campaign invites from brands will appear here.</p>
            </div>
          ) : CAMPAIGNS.map(c => {
            const s = STATUS_CFG[c.status]
            const pct = c.videosRequired > 0 ? Math.round((c.videosPosted / c.videosRequired) * 100) : 0
            return (
              <div key={c.id} style={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.07)", backgroundColor: "rgba(255,255,255,0.02)", padding: "14px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "10px" }}>
                  <div style={{ width: "34px", height: "34px", borderRadius: "9px", backgroundColor: `${c.brandColor}18`, border: `1px solid ${c.brandColor}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: "11px", fontWeight: 800, color: c.brandColor }}>{c.brandInitials}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px", marginBottom: "2px" }}>
                      <p style={{ fontSize: "13px", fontWeight: 700, color: "#fafafa", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</p>
                      <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "99px", backgroundColor: s.bg, border: `1px solid ${s.border}`, color: s.color, flexShrink: 0 }}>{s.label}</span>
                    </div>
                    <p style={{ fontSize: "11px", color: "#71717a" }}>{c.brand} · Due {c.deadline}</p>
                  </div>
                </div>

                {/* Brief preview */}
                <p style={{ fontSize: "12px", color: "#71717a", lineHeight: 1.5, marginBottom: "10px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {c.brief}
                </p>

                {/* Progress */}
                <div style={{ marginBottom: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#52525b", marginBottom: "4px" }}>
                    <span>{c.videosPosted} / {c.videosRequired} videos posted</span>
                    <span>{pct}%</span>
                  </div>
                  <div style={{ height: "4px", borderRadius: "2px", backgroundColor: "rgba(255,255,255,0.06)" }}>
                    <div style={{ height: "100%", width: `${pct}%`, borderRadius: "2px", backgroundColor: pct === 100 ? "#10b981" : "#7C3AED", transition: "width 600ms" }} />
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "12px", color: "#34d399", fontWeight: 600 }}>{c.earnings} earned · up to {c.potential}</span>
                  <button onClick={() => setActiveBrief(c)} style={{ display: "flex", alignItems: "center", gap: "4px", padding: "5px 10px", borderRadius: "7px", border: "1px solid rgba(124,58,237,0.3)", backgroundColor: "rgba(124,58,237,0.08)", color: "#a78bfa", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}>
                    View Brief <ExternalLink style={{ width: "10px", height: "10px" }} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Right column: Activity + Earnings mini */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Earnings summary */}
          <div style={{ borderRadius: "14px", border: "1px solid rgba(16,185,129,0.2)", backgroundColor: "#111111", padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#fafafa" }}>Earnings Summary</h2>
              <Link href="/creator/earnings" style={{ fontSize: "12px", color: "#34d399", textDecoration: "none" }}>Full breakdown →</Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
              {[
                { label: "This month", value: "$0", highlight: true  },
                { label: "Last month", value: "$0", highlight: false },
                { label: "All time",   value: "$0", highlight: false },
              ].map(e => (
                <div key={e.label} style={{ padding: "12px 10px", borderRadius: "10px", border: `1px solid ${e.highlight ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.06)"}`, backgroundColor: e.highlight ? "rgba(16,185,129,0.06)" : "rgba(255,255,255,0.02)", textAlign: "center" }}>
                  <p style={{ fontSize: "16px", fontWeight: 800, color: e.highlight ? "#34d399" : "#fafafa", lineHeight: 1 }}>{e.value}</p>
                  <p style={{ fontSize: "10px", color: "#52525b", marginTop: "4px" }}>{e.label}</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "14px", padding: "12px 14px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)", backgroundColor: "rgba(255,255,255,0.02)", textAlign: "center" }}>
              <p style={{ fontSize: "12px", color: "#52525b" }}>No pending payouts</p>
            </div>
          </div>

          {/* Activity feed */}
          <div style={{ borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)", backgroundColor: "#111111", padding: "20px", flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Bell style={{ width: "14px", height: "14px", color: "#7C3AED" }} />
                <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#fafafa" }}>Recent Activity</h2>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {ACTIVITY.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 12px" }}>
                  <Bell style={{ width: "20px", height: "20px", color: "#52525b", margin: "0 auto 8px" }} />
                  <p style={{ fontSize: "12px", fontWeight: 600, color: "#a1a1aa", marginBottom: "2px" }}>No recent activity</p>
                  <p style={{ fontSize: "11px", color: "#52525b" }}>Payouts, milestones, and invites will show up here.</p>
                </div>
              ) : ACTIVITY.map(a => {
                const cfg = ACTIVITY_ICON[a.type]
                const Icon = cfg.icon
                return (
                  <div key={a.id} style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "10px 8px", borderRadius: "9px" }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.02)")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <div style={{ width: "28px", height: "28px", borderRadius: "8px", backgroundColor: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon style={{ width: "13px", height: "13px", color: cfg.color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "12px", color: "#d4d4d8", lineHeight: 1.4 }}>
                        {a.message}
                        {a.amount && <span style={{ fontWeight: 700, color: "#34d399", marginLeft: "4px" }}>{a.amount}</span>}
                      </p>
                      <p style={{ fontSize: "10px", color: "#52525b", marginTop: "2px" }}>{a.time}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Brief modal */}
      {activeBrief && <BriefModal campaign={activeBrief} onClose={() => setActiveBrief(null)} />}
    </div>
  )
}
