"use client"

import { motion } from "framer-motion"

const LOGOS = [
  { name: "Luminary Co.", accent: "#a855f7" },
  { name: "Stackr Labs", accent: "#3b82f6" },
  { name: "Fivex Agency", accent: "#10b981" },
  { name: "Novareach", accent: "#f59e0b" },
  { name: "GrowthOS", accent: "#ec4899" },
  { name: "Creatify", accent: "#06b6d4" },
  { name: "Viralbrand", accent: "#f97316" },
  { name: "Scaleworks", accent: "#8b5cf6" },
]

const STATS = [
  { value: "1M+", label: "Accounts Tracked" },
  { value: "100B+", label: "Views Monitored" },
  { value: "$5M+", label: "Creator Payouts" },
]

function LogoItem({ name, accent }: { name: string; accent: string }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 20px",
        borderRadius: "8px",
        backgroundColor: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        marginRight: "16px",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      <div style={{ width: "8px", height: "8px", borderRadius: "2px", backgroundColor: accent, flexShrink: 0 }} />
      <span style={{ fontSize: "14px", fontWeight: 600, color: "#71717a", letterSpacing: "-0.01em" }}>{name}</span>
    </div>
  )
}

export function SocialProof() {
  const doubled = [...LOGOS, ...LOGOS]

  return (
    <section style={{ padding: "64px 0 80px", borderTop: "1px solid rgba(255,255,255,0.05)", position: "relative", overflow: "hidden" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
        {/* Label */}
        <p style={{ textAlign: "center", fontSize: "13px", fontWeight: 500, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "28px" }}>
          Trusted by fast-growing brands
        </p>
      </div>

      {/* Marquee */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        {/* Fade edges */}
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "120px", background: "linear-gradient(to right, #0a0a0a, transparent)", zIndex: 2, pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "120px", background: "linear-gradient(to left, #0a0a0a, transparent)", zIndex: 2, pointerEvents: "none" }} />

        <div
          style={{
            display: "flex",
            animation: "marquee 28s linear infinite",
            width: "max-content",
          }}
        >
          {doubled.map((logo, i) => (
            <LogoItem key={i} name={logo.name} accent={logo.accent} />
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1px",
            marginTop: "64px",
            backgroundColor: "rgba(255,255,255,0.06)",
            borderRadius: "16px",
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                backgroundColor: "#0a0a0a",
                padding: "36px 24px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "clamp(36px, 5vw, 52px)",
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                  marginBottom: "8px",
                  background: "linear-gradient(135deg, #fafafa 30%, #71717a 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: "14px", color: "#52525b", fontWeight: 500 }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  )
}
