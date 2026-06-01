"use client"

import { motion } from "framer-motion"
import { BarChart2, Target, DollarSign, Flame, Eye, Check } from "lucide-react"

const FEATURES = [
  {
    id: "analytics",
    icon: BarChart2,
    accentColor: "#a855f7",
    accentBg: "rgba(168,85,247,0.1)",
    heading: "Track any creator. No login needed.",
    subheading: "Analytics",
    bullets: [
      "Pull live stats from TikTok, Instagram, YouTube & Facebook",
      "Views, engagement rate, CPM, virality score — all in one row",
      "Historical data going back 12 months, updated daily",
    ],
    mockup: <AnalyticsMock />,
    flip: false,
  },
  {
    id: "campaigns",
    icon: Target,
    accentColor: "#3b82f6",
    accentBg: "rgba(59,130,246,0.1)",
    heading: "Manage 500 creators like you manage 5.",
    subheading: "Campaigns",
    bullets: [
      "Brief creators, set deadlines and approval workflows in minutes",
      "Bulk-assign content briefs with one click",
      "Real-time campaign dashboard — live vs. target at a glance",
    ],
    mockup: <CampaignsMock />,
    flip: true,
  },
  {
    id: "payments",
    icon: DollarSign,
    accentColor: "#10b981",
    accentBg: "rgba(16,185,129,0.1)",
    heading: "CPM, CPA, milestones. Automated.",
    subheading: "Payments",
    bullets: [
      "Set CPM rules that fire automatically when videos hit targets",
      "CPA, flat-fee and milestone payments — all in one place",
      "Invoices generated and sent automatically, zero manual work",
    ],
    mockup: <PaymentsMock />,
    flip: false,
  },
  {
    id: "trends",
    icon: Flame,
    accentColor: "#f59e0b",
    accentBg: "rgba(245,158,11,0.1)",
    heading: "Know what's going viral before your competitor does.",
    subheading: "Trends",
    bullets: [
      "Viral video library updated every 6 hours across all platforms",
      "Filter by niche, format, engagement rate and virality score",
      "One-click content brief generator from any trending video",
    ],
    mockup: <TrendsMock />,
    flip: true,
  },
  {
    id: "competitors",
    icon: Eye,
    accentColor: "#ec4899",
    accentBg: "rgba(236,72,153,0.1)",
    heading: "AI-powered weekly digest of competitor moves.",
    subheading: "Competitor Intel",
    bullets: [
      "Track any brand's creator roster, spend and content strategy",
      "AI generates a plain-English weekly report every Monday",
      "Get alerted when a competitor onboards creators in your niche",
    ],
    mockup: <CompetitorsMock />,
    flip: false,
  },
]

/* ─── Mini Mockups ──────────────────────────────────── */

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ backgroundColor: "#111111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "16px", ...style }}>
      {children}
    </div>
  )
}

function MiniLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: "9px", fontWeight: 600, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>{children}</div>
}

function SparkBar({ pct, color = "#7C3AED" }: { pct: number; color?: string }) {
  return (
    <div style={{ flex: 1, height: "100%", borderRadius: "2px 2px 0 0", backgroundColor: `${color}33` }}>
      <div style={{ height: `${pct}%`, borderRadius: "2px 2px 0 0", backgroundColor: color, marginTop: "auto" }} />
    </div>
  )
}

function AnalyticsMock() {
  const rows = [
    { handle: "@maya.creates", platform: "TikTok", views: "4.2M", cpm: "$18.40", virality: 9.2, color: "#a855f7" },
    { handle: "@jakebreaks", platform: "Instagram", views: "1.8M", cpm: "$11.20", virality: 7.6, color: "#f472b6" },
    { handle: "@techbyleo", platform: "YouTube", views: "980K", cpm: "$22.10", virality: 6.1, color: "#f87171" },
    { handle: "@reels_anna", platform: "Instagram", views: "640K", cpm: "$9.80", virality: 5.4, color: "#f472b6" },
  ]
  return (
    <Card>
      <MiniLabel>Creator Analytics</MiniLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {rows.map((r, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 10px", borderRadius: "7px", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: `${r.color}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: "8px", fontWeight: 700, color: r.color }}>{r.handle[1].toUpperCase()}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "10px", fontWeight: 600, color: "#e4e4e7", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.handle}</div>
              <div style={{ fontSize: "8px", color: "#52525b" }}>{r.platform}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#fafafa" }}>{r.views}</div>
              <div style={{ fontSize: "8px", color: "#52525b" }}>{r.cpm} CPM</div>
            </div>
            <div style={{ width: "28px", height: "16px", borderRadius: "4px", backgroundColor: r.virality > 8 ? "rgba(239,68,68,0.15)" : r.virality > 6 ? "rgba(245,158,11,0.15)" : "rgba(113,113,122,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "8px", fontWeight: 700, color: r.virality > 8 ? "#f87171" : r.virality > 6 ? "#fbbf24" : "#71717a" }}>{r.virality}</span>
            </div>
          </div>
        ))}
      </div>
      {/* Mini chart */}
      <div style={{ marginTop: "10px", display: "flex", alignItems: "flex-end", gap: "3px", height: "36px" }}>
        {[40, 55, 48, 72, 68, 85, 91, 78, 95, 88].map((h, i) => (
          <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: "2px 2px 0 0", backgroundColor: i === 9 ? "rgba(168,85,247,0.8)" : "rgba(168,85,247,0.25)" }} />
        ))}
      </div>
    </Card>
  )
}

function CampaignsMock() {
  const campaigns = [
    { name: "Summer Drop 2025", creators: 24, status: "Active", pct: 72, color: "#3b82f6" },
    { name: "Back to School", creators: 11, status: "Review", pct: 45, color: "#f59e0b" },
    { name: "Collab Series", creators: 38, status: "Active", pct: 88, color: "#10b981" },
  ]
  return (
    <Card>
      <MiniLabel>Campaign Manager</MiniLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {campaigns.map((c, i) => (
          <div key={i} style={{ padding: "10px 12px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "11px", fontWeight: 600, color: "#e4e4e7" }}>{c.name}</span>
              <span style={{ fontSize: "9px", fontWeight: 600, color: c.status === "Active" ? "#34d399" : "#fbbf24", backgroundColor: c.status === "Active" ? "rgba(52,211,153,0.1)" : "rgba(251,191,36,0.1)", padding: "2px 7px", borderRadius: "10px" }}>{c.status}</span>
            </div>
            <div style={{ height: "4px", borderRadius: "2px", backgroundColor: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${c.pct}%`, borderRadius: "2px", backgroundColor: c.color }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
              <span style={{ fontSize: "9px", color: "#52525b" }}>{c.creators} creators</span>
              <span style={{ fontSize: "9px", color: c.color, fontWeight: 600 }}>{c.pct}%</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function PaymentsMock() {
  const payouts = [
    { creator: "@maya.creates", amount: "$840", type: "CPM", status: "Paid" },
    { creator: "@jakebreaks", amount: "$320", type: "Milestone", status: "Pending" },
    { creator: "@techbyleo", amount: "$1,200", type: "Flat fee", status: "Paid" },
    { creator: "@reels_anna", amount: "$560", type: "CPM", status: "Processing" },
  ]
  const statusColor: Record<string, string> = { Paid: "#34d399", Pending: "#fbbf24", Processing: "#60a5fa" }
  return (
    <Card>
      <MiniLabel>Payout Queue</MiniLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginBottom: "10px" }}>
        {payouts.map((p, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 10px", borderRadius: "7px", backgroundColor: "rgba(255,255,255,0.03)" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "10px", fontWeight: 600, color: "#e4e4e7" }}>{p.creator}</div>
              <div style={{ fontSize: "8px", color: "#52525b" }}>{p.type}</div>
            </div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#fafafa" }}>{p.amount}</div>
            <div style={{ fontSize: "8px", fontWeight: 600, color: statusColor[p.status] }}>{p.status}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <div style={{ flex: 1, padding: "8px", borderRadius: "7px", backgroundColor: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)", textAlign: "center" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#34d399" }}>$2,920</div>
          <div style={{ fontSize: "8px", color: "#52525b" }}>Paid this month</div>
        </div>
        <div style={{ flex: 1, padding: "8px", borderRadius: "7px", backgroundColor: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)", textAlign: "center" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#fbbf24" }}>$880</div>
          <div style={{ fontSize: "8px", color: "#52525b" }}>Pending</div>
        </div>
      </div>
    </Card>
  )
}

function TrendsMock() {
  const videos = [
    { title: "POV: summer routine 🌊", views: "12.4M", platform: "TikTok", hot: true },
    { title: "this product changed everything", views: "8.1M", platform: "Instagram", hot: true },
    { title: "Day in my life NYC", views: "4.9M", platform: "YouTube", hot: false },
    { title: "viral hack you need to know", views: "3.3M", platform: "TikTok", hot: false },
  ]
  return (
    <Card>
      <MiniLabel>Trending Now · Updated 2h ago</MiniLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {videos.map((v, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", borderRadius: "7px", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "6px", backgroundColor: "rgba(245,158,11,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "14px" }}>
              {v.hot ? "🔥" : "📈"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "10px", fontWeight: 600, color: "#e4e4e7", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.title}</div>
              <div style={{ fontSize: "8px", color: "#52525b" }}>{v.platform}</div>
            </div>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#fafafa", flexShrink: 0 }}>{v.views}</div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function CompetitorsMock() {
  return (
    <Card>
      <MiniLabel>AI Weekly Digest · Monday Report</MiniLabel>
      <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "rgba(236,72,153,0.05)", border: "1px solid rgba(236,72,153,0.15)", marginBottom: "10px" }}>
        <div style={{ fontSize: "10px", fontWeight: 700, color: "#f472b6", marginBottom: "6px" }}>🧠 Competitor snapshot — Viral.app</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {["Added 14 new creators this week", "Increased spend on TikTok by ~32%", "Launched 2 collab campaigns in Beauty"].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
              <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#f472b6", marginTop: "5px", flexShrink: 0 }} />
              <span style={{ fontSize: "10px", color: "#a1a1aa", lineHeight: 1.5 }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: "6px" }}>
        {[
          { label: "Their creators", value: "142" },
          { label: "Avg CPM", value: "$14.20" },
          { label: "Top niche", value: "Beauty" },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, padding: "8px", borderRadius: "7px", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#fafafa" }}>{s.value}</div>
            <div style={{ fontSize: "8px", color: "#52525b", marginTop: "2px" }}>{s.label}</div>
          </div>
        ))}
      </div>
    </Card>
  )
}

/* ─── Feature Block ─────────────────────────────────── */
function FeatureBlock({
  feature,
  index,
}: {
  feature: typeof FEATURES[number]
  index: number
}) {
  const Icon = feature.icon
  const isFlipped = feature.flip

  const textCol = (
    <motion.div
      initial={{ opacity: 0, x: isFlipped ? 32 : -32 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}
    >
      {/* Module badge */}
      <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "16px", alignSelf: "flex-start" }}>
        <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: feature.accentBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon style={{ width: "16px", height: "16px", color: feature.accentColor }} />
        </div>
        <span style={{ fontSize: "12px", fontWeight: 600, color: feature.accentColor, textTransform: "uppercase", letterSpacing: "0.06em" }}>{feature.subheading}</span>
      </div>

      <h3 style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 700, color: "#fafafa", letterSpacing: "-0.03em", lineHeight: 1.2, marginBottom: "20px" }}>
        {feature.heading}
      </h3>

      <ul style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {feature.bullets.map((bullet, i) => (
          <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
            <div style={{ width: "18px", height: "18px", borderRadius: "50%", backgroundColor: feature.accentBg, border: `1px solid ${feature.accentColor}44`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px" }}>
              <Check style={{ width: "9px", height: "9px", color: feature.accentColor }} />
            </div>
            <span style={{ fontSize: "14px", color: "#71717a", lineHeight: 1.6 }}>{bullet}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  )

  const mockCol = (
    <motion.div
      initial={{ opacity: 0, x: isFlipped ? -32 : 32 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      style={{ position: "relative" }}
    >
      {/* Glow */}
      <div style={{ position: "absolute", inset: "-24px", background: `radial-gradient(ellipse at center, ${feature.accentColor}18 0%, transparent 70%)`, pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        {feature.mockup}
      </div>
    </motion.div>
  )

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "64px",
        alignItems: "center",
        padding: "64px 0",
        borderTop: index > 0 ? "1px solid rgba(255,255,255,0.05)" : undefined,
      }}
      className="max-md:grid-cols-1 max-md:gap-10"
    >
      {isFlipped ? <>{mockCol}{textCol}</> : <>{textCol}{mockCol}</>}
    </div>
  )
}

/* ─── Section ───────────────────────────────────────── */
export function Features() {
  return (
    <section id="features" style={{ padding: "80px 0" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: "center", marginBottom: "16px" }}
        >
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#7C3AED", textTransform: "uppercase", letterSpacing: "0.08em" }}>Features</span>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, color: "#fafafa", letterSpacing: "-0.04em", marginTop: "10px", lineHeight: 1.1 }}>
            Everything you need to run<br />UGC at scale
          </h2>
          <p style={{ fontSize: "16px", color: "#71717a", marginTop: "16px", maxWidth: "480px", marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
            Five purpose-built modules, one unified platform. No duct tape required.
          </p>
        </motion.div>

        {/* Feature blocks */}
        {FEATURES.map((feature, i) => (
          <FeatureBlock key={feature.id} feature={feature} index={i} />
        ))}
      </div>
    </section>
  )
}
