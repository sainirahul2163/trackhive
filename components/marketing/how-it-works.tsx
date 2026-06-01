"use client"

import { motion } from "framer-motion"
import { Link2, TrendingUp, Zap } from "lucide-react"

const STEPS = [
  {
    number: "01",
    icon: Link2,
    title: "Add any creator URL",
    description: "Paste a TikTok, Instagram or YouTube profile URL. TrackHive auto-detects the platform and pulls their stats instantly — no creator login or permissions needed.",
    detail: <StepOneMock />,
    color: "#7C3AED",
    colorBg: "rgba(124,58,237,0.12)",
  },
  {
    number: "02",
    icon: TrendingUp,
    title: "Track performance",
    description: "Get real-time views, engagement rate, CPM and virality score — refreshed daily. Set alerts so you're notified the moment a creator goes viral.",
    detail: <StepTwoMock />,
    color: "#3b82f6",
    colorBg: "rgba(59,130,246,0.12)",
  },
  {
    number: "03",
    icon: Zap,
    title: "Pay automatically",
    description: "Set CPM rules once. When a video hits your target view count, an invoice is generated and payment is queued automatically — zero manual work.",
    detail: <StepThreeMock />,
    color: "#10b981",
    colorBg: "rgba(16,185,129,0.12)",
  },
]

/* ─── Step Mockups ─────────────────────────────────── */

function StepOneMock() {
  return (
    <div style={{ padding: "16px", borderRadius: "10px", backgroundColor: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.18)" }}>
      <div style={{ fontSize: "9px", fontWeight: 600, color: "#71717a", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Creator URL</div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "7px", backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(124,58,237,0.3)" }}>
        <Link2 style={{ width: "12px", height: "12px", color: "#7C3AED", flexShrink: 0 }} />
        <span style={{ fontSize: "11px", color: "#a1a1aa", flex: 1 }}>tiktok.com/@maya.creates</span>
        <div style={{ padding: "2px 7px", borderRadius: "4px", backgroundColor: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)" }}>
          <span style={{ fontSize: "9px", fontWeight: 700, color: "#a855f7" }}>TikTok</span>
        </div>
      </div>
      <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
        <div style={{ flex: 1, height: "3px", borderRadius: "2px", overflow: "hidden", backgroundColor: "rgba(255,255,255,0.06)" }}>
          <div style={{ height: "100%", width: "100%", background: "linear-gradient(to right, #7C3AED, #a855f7)", animation: "shimmer 1.4s ease-in-out infinite", backgroundSize: "200% 100%" }} />
        </div>
        <span style={{ fontSize: "9px", color: "#52525b" }}>Fetching data...</span>
      </div>
      <div style={{ marginTop: "10px", display: "flex", gap: "6px" }}>
        {[{ label: "Followers", value: "892K" }, { label: "Avg Views", value: "4.2M" }, { label: "Eng. Rate", value: "8.4%" }].map((s, i) => (
          <div key={i} style={{ flex: 1, padding: "7px", borderRadius: "6px", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#fafafa" }}>{s.value}</div>
            <div style={{ fontSize: "8px", color: "#52525b", marginTop: "2px" }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StepTwoMock() {
  const sparkLine = "M0,50 C30,45 50,20 80,25 C110,30 130,10 160,8 C180,6 200,14 220,10"
  return (
    <div style={{ padding: "16px", borderRadius: "10px", backgroundColor: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.18)" }}>
      <div style={{ fontSize: "9px", fontWeight: 600, color: "#71717a", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Live Performance</div>
      <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
        {[
          { label: "Total Views", value: "12.4M", change: "+18%", up: true },
          { label: "CPM", value: "$18.40", change: "+$2.10", up: true },
          { label: "Virality", value: "9.2", change: "🔥 Hot", up: true },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, padding: "8px", borderRadius: "6px", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#fafafa" }}>{s.value}</div>
            <div style={{ fontSize: "8px", color: "#52525b" }}>{s.label}</div>
            <div style={{ fontSize: "8px", color: "#34d399", marginTop: "2px", fontWeight: 600 }}>{s.change}</div>
          </div>
        ))}
      </div>
      <svg viewBox="0 0 220 60" style={{ width: "100%", height: "52px" }}>
        <defs>
          <linearGradient id="stepGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${sparkLine} L220,65 L0,65 Z`} fill="url(#stepGrad)" />
        <path d={sparkLine} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
        <circle cx="220" cy="10" r="3.5" fill="#3b82f6" />
      </svg>
      <div style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "6px", padding: "6px 10px", borderRadius: "6px", backgroundColor: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}>
        <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#60a5fa", animation: "pulse 2s infinite" }} />
        <span style={{ fontSize: "9px", color: "#60a5fa", fontWeight: 500 }}>Alert: 10M view milestone reached</span>
      </div>
    </div>
  )
}

function StepThreeMock() {
  return (
    <div style={{ padding: "16px", borderRadius: "10px", backgroundColor: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.18)" }}>
      <div style={{ fontSize: "9px", fontWeight: 600, color: "#71717a", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Auto Payout Rule</div>
      <div style={{ padding: "10px 12px", borderRadius: "7px", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: "8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
          <span style={{ fontSize: "10px", color: "#a1a1aa" }}>Rule</span>
          <span style={{ fontSize: "10px", fontWeight: 600, color: "#fafafa" }}>CPM · $18/1K views</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
          <span style={{ fontSize: "10px", color: "#a1a1aa" }}>Trigger</span>
          <span style={{ fontSize: "10px", fontWeight: 600, color: "#fafafa" }}>≥ 1M views</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: "10px", color: "#a1a1aa" }}>Status</span>
          <span style={{ fontSize: "10px", fontWeight: 700, color: "#34d399" }}>✓ Fired — $840 queued</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: "6px" }}>
        {[
          { icon: "📄", label: "Invoice", value: "Auto-sent" },
          { icon: "💸", label: "Payout", value: "$840.00" },
          { icon: "✉️", label: "Creator", value: "Notified" },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, padding: "8px 6px", borderRadius: "6px", backgroundColor: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)", textAlign: "center" }}>
            <div style={{ fontSize: "14px" }}>{s.icon}</div>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#34d399", marginTop: "3px" }}>{s.value}</div>
            <div style={{ fontSize: "8px", color: "#52525b" }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Section ───────────────────────────────────────── */
export function HowItWorks() {
  return (
    <section style={{ padding: "96px 0", borderTop: "1px solid rgba(255,255,255,0.05)", position: "relative", overflow: "hidden" }}>
      {/* Background glow */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "800px", height: "400px", background: "radial-gradient(ellipse, rgba(124,58,237,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: "center", marginBottom: "72px" }}
        >
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#7C3AED", textTransform: "uppercase", letterSpacing: "0.08em" }}>How it works</span>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, color: "#fafafa", letterSpacing: "-0.04em", marginTop: "10px", lineHeight: 1.1 }}>
            Up and running in 3 steps
          </h2>
          <p style={{ fontSize: "16px", color: "#71717a", marginTop: "16px", maxWidth: "400px", marginLeft: "auto", marginRight: "auto" }}>
            From zero to fully automated UGC tracking in under 5 minutes.
          </p>
        </motion.div>

        {/* Connector line (desktop) */}
        <div
          style={{ position: "relative" }}
          className="hidden md:block"
        >
          <div style={{
            position: "absolute",
            top: "28px",
            left: "calc(16.66% + 28px)",
            right: "calc(16.66% + 28px)",
            height: "1px",
            background: "linear-gradient(to right, rgba(124,58,237,0.6), rgba(59,130,246,0.6), rgba(16,185,129,0.6))",
            zIndex: 0,
          }} />
        </div>

        {/* Step cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "32px" }} className="max-md:grid-cols-1">
          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.13, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                style={{ display: "flex", flexDirection: "column", gap: "20px" }}
              >
                {/* Number + icon header */}
                <div style={{ display: "flex", alignItems: "center", gap: "14px", position: "relative", zIndex: 1 }}>
                  {/* Number badge */}
                  <div style={{
                    width: "56px", height: "56px", borderRadius: "50%",
                    backgroundColor: "#111111",
                    border: `2px solid ${step.color}44`,
                    boxShadow: `0 0 0 6px ${step.color}12`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <span style={{ fontSize: "16px", fontWeight: 800, color: step.color }}>{step.number}</span>
                  </div>

                  {/* Icon */}
                  <div style={{ width: "36px", height: "36px", borderRadius: "9px", backgroundColor: step.colorBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon style={{ width: "18px", height: "18px", color: step.color }} />
                  </div>
                </div>

                {/* Title + description */}
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#fafafa", letterSpacing: "-0.02em", marginBottom: "8px" }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: "14px", color: "#71717a", lineHeight: 1.65 }}>
                    {step.description}
                  </p>
                </div>

                {/* Mini mockup */}
                {step.detail}
              </motion.div>
            )
          })}
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} } @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </section>
  )
}
