"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Check, Zap } from "lucide-react"

const PLANS = [
  {
    name: "Starter",
    desc: "Perfect for solo operators and small teams just getting started.",
    monthlyPrice: 49,
    annualPrice: 39,
    highlight: false,
    cta: "Start Free Trial",
    features: [
      "1,000 videos tracked",
      "10 creators",
      "1 seat",
      "Daily data refresh",
      "TikTok, Instagram, YouTube",
      "Basic analytics dashboard",
      "Email alerts",
      "CSV export",
    ],
    missing: ["API access", "White-label", "Dedicated support"],
  },
  {
    name: "Pro",
    desc: "For growing agencies managing dozens of creators and campaigns.",
    monthlyPrice: 149,
    annualPrice: 119,
    highlight: true,
    badge: "Most Popular",
    cta: "Start Free Trial",
    features: [
      "5,000 videos tracked",
      "100 creators",
      "5 seats",
      "Hourly data refresh",
      "All 4 platforms",
      "Full analytics + campaigns",
      "Payments & CPM rules",
      "API access",
      "Priority email support",
    ],
    missing: ["White-label", "Dedicated CSM"],
  },
  {
    name: "Agency",
    desc: "For high-volume agencies that need white-label and unlimited scale.",
    monthlyPrice: 299,
    annualPrice: 239,
    highlight: false,
    cta: "Contact Sales",
    features: [
      "20,000 videos tracked",
      "500 creators",
      "20 seats",
      "Real-time data refresh",
      "All 4 platforms",
      "Full analytics + campaigns",
      "Payments & CPM rules",
      "API access",
      "White-label included",
      "Dedicated CSM",
      "Custom integrations",
    ],
    missing: [],
  },
]

export function Pricing() {
  const [annual, setAnnual] = useState(false)

  return (
    <section
      id="pricing"
      style={{ padding: "96px 0", borderTop: "1px solid rgba(255,255,255,0.05)", position: "relative", overflow: "hidden" }}
    >
      {/* Bg glow */}
      <div style={{ position: "absolute", bottom: "-10%", left: "50%", transform: "translateX(-50%)", width: "900px", height: "500px", background: "radial-gradient(ellipse, rgba(124,58,237,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: "center", marginBottom: "40px" }}
        >
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#7C3AED", textTransform: "uppercase", letterSpacing: "0.08em" }}>Pricing</span>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, color: "#fafafa", letterSpacing: "-0.04em", marginTop: "10px", lineHeight: 1.1 }}>
            Simple, transparent pricing
          </h2>
          <p style={{ fontSize: "16px", color: "#71717a", marginTop: "12px" }}>
            Start free. Scale as you grow.
          </p>
        </motion.div>

        {/* Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.45 }}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "48px" }}
        >
          <span style={{ fontSize: "14px", color: annual ? "#52525b" : "#fafafa", fontWeight: 500, transition: "color 0.2s" }}>Monthly</span>

          <button
            onClick={() => setAnnual(!annual)}
            style={{
              position: "relative", width: "48px", height: "26px", borderRadius: "100px",
              backgroundColor: annual ? "#7C3AED" : "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.1)",
              cursor: "pointer", transition: "background-color 0.2s", flexShrink: 0,
            }}
            aria-label="Toggle annual billing"
          >
            <div style={{
              position: "absolute", top: "3px",
              left: annual ? "24px" : "3px",
              width: "18px", height: "18px", borderRadius: "50%",
              backgroundColor: "#fff",
              transition: "left 0.2s",
              boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
            }} />
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "14px", color: annual ? "#fafafa" : "#52525b", fontWeight: 500, transition: "color 0.2s" }}>Annual</span>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#7C3AED", backgroundColor: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)", padding: "2px 8px", borderRadius: "100px" }}>Save 20%</span>
          </div>
        </motion.div>

        {/* Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", alignItems: "start" }} className="max-md:grid-cols-1">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              style={{
                borderRadius: "16px",
                backgroundColor: plan.highlight ? "#111111" : "#0d0d0d",
                border: plan.highlight
                  ? "1px solid rgba(124,58,237,0.45)"
                  : plan.name === "Agency"
                  ? "1px solid rgba(124,58,237,0.28)"
                  : "1px solid rgba(255,255,255,0.07)",
                padding: "28px",
                position: "relative",
                boxShadow: plan.highlight ? "0 0 48px rgba(124,58,237,0.12)" : undefined,
              }}
            >
              {/* Popular badge */}
              {plan.badge && (
                <div style={{ position: "absolute", top: "-13px", left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: "5px", padding: "4px 14px", borderRadius: "100px", backgroundColor: "#7C3AED", boxShadow: "0 0 20px rgba(124,58,237,0.5)" }}>
                  <Zap style={{ width: "10px", height: "10px", color: "#fff", fill: "#fff" }} />
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#fff", whiteSpace: "nowrap" }}>Most Popular</span>
                </div>
              )}

              {/* Plan name */}
              <div style={{ marginBottom: "4px" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#71717a" }}>{plan.name}</span>
              </div>

              {/* Price */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", marginBottom: "8px" }}>
                <span style={{ fontSize: "42px", fontWeight: 800, color: "#fafafa", letterSpacing: "-0.04em", lineHeight: 1 }}>
                  ${annual ? plan.annualPrice : plan.monthlyPrice}
                </span>
                <span style={{ fontSize: "13px", color: "#52525b", marginBottom: "6px" }}>/mo</span>
              </div>
              {annual && (
                <div style={{ fontSize: "11px", color: "#71717a", marginBottom: "4px" }}>
                  Billed annually · <span style={{ color: "#34d399", fontWeight: 600 }}>Save ${(plan.monthlyPrice - plan.annualPrice) * 12}/yr</span>
                </div>
              )}

              <p style={{ fontSize: "13px", color: "#71717a", lineHeight: 1.55, marginBottom: "24px", marginTop: "8px" }}>{plan.desc}</p>

              {/* CTA */}
              <Link
                href={plan.name === "Agency" ? "/login" : "/signup"}
                style={{
                  display: "block", textAlign: "center", padding: "10px 16px", borderRadius: "9px",
                  backgroundColor: plan.highlight ? "#7C3AED" : "rgba(255,255,255,0.06)",
                  border: plan.highlight ? "none" : "1px solid rgba(255,255,255,0.1)",
                  color: "#fff", fontSize: "14px", fontWeight: 600, textDecoration: "none",
                  marginBottom: "24px", transition: "all 0.15s",
                  boxShadow: plan.highlight ? "0 0 24px rgba(124,58,237,0.3)" : undefined,
                }}
                className={plan.highlight ? "hover:bg-purple-700" : "hover:bg-white/10"}
              >
                {plan.cta}
              </Link>

              {/* Divider */}
              <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.06)", marginBottom: "20px" }} />

              {/* Features */}
              <ul style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "9px" }}>
                    <div style={{ width: "16px", height: "16px", borderRadius: "50%", backgroundColor: plan.highlight ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px" }}>
                      <Check style={{ width: "9px", height: "9px", color: plan.highlight ? "#a855f7" : "#52525b" }} />
                    </div>
                    <span style={{ fontSize: "13px", color: "#a1a1aa", lineHeight: 1.5 }}>{f}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35, duration: 0.5 }}
          style={{ textAlign: "center", fontSize: "13px", color: "#52525b", marginTop: "32px" }}
        >
          7-day free trial on all plans. No credit card required.
        </motion.p>
      </div>
    </section>
  )
}
