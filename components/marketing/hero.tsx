"use client"

import Link from "next/link"
import { ArrowRight, Play } from "lucide-react"
import { motion } from "framer-motion"
import { PlatformIcon, PLATFORM_CONFIG } from "@/lib/platform"
import type { Platform } from "@/types"

const PLATFORMS: Platform[] = ["tiktok", "instagram", "youtube", "facebook"]

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

const FADE_UP = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.55, ease: EASE } }),
}

/* ─── Mock Dashboard UI ─────────────────────────────── */
function MockDashboard() {
  const bars = [55, 72, 48, 83, 91, 67, 78, 95, 62, 88, 74, 96]
  const sparkLine = "M0,60 C20,50 40,35 60,40 C80,45 100,20 120,15 C140,10 160,25 180,18 C200,12 220,5 240,8"

  return (
    <div
      style={{
        width: "100%",
        borderRadius: "16px",
        backgroundColor: "#111111",
        border: "1px solid rgba(255,255,255,0.08)",
        overflow: "hidden",
        boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
      }}
    >
      {/* Topbar chrome */}
      <div style={{ height: "40px", backgroundColor: "#0f0f0f", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", padding: "0 16px", gap: "6px" }}>
        <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#ff5f57" }} />
        <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#febc2e" }} />
        <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#28c840" }} />
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <div style={{ height: "20px", width: "200px", borderRadius: "5px", backgroundColor: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "10px", color: "#52525b" }}>app.trackhive.io/dashboard</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", height: "340px" }}>
        {/* Sidebar mock */}
        <div style={{ width: "48px", backgroundColor: "#0d0d0d", borderRight: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 0", gap: "12px" }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ width: "28px", height: "28px", borderRadius: "7px", backgroundColor: i === 0 ? "rgba(124,58,237,0.25)" : "rgba(255,255,255,0.04)" }} />
          ))}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: "20px", overflowY: "hidden" }}>
          {/* Stat cards row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "16px" }}>
            {[
              { label: "Total Views", value: "12.4M", change: "+18%", up: true },
              { label: "Creators", value: "248", change: "+4", up: true },
              { label: "Campaigns", value: "12", change: "Active", up: true },
              { label: "Payouts", value: "$8.2K", change: "This mo.", up: false },
            ].map((stat, i) => (
              <div key={i} style={{ backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)", padding: "10px" }}>
                <div style={{ fontSize: "9px", color: "#52525b", marginBottom: "4px", fontWeight: 500 }}>{stat.label}</div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#fafafa", lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: "9px", marginTop: "4px", color: stat.up ? "#34d399" : "#a78bfa", fontWeight: 500 }}>{stat.change}</div>
              </div>
            ))}
          </div>

          {/* Chart + table row */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "10px" }}>
            {/* Area chart */}
            <div style={{ backgroundColor: "rgba(255,255,255,0.03)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", padding: "12px" }}>
              <div style={{ fontSize: "10px", fontWeight: 600, color: "#a1a1aa", marginBottom: "12px" }}>Views over time</div>
              <svg viewBox="0 0 240 70" style={{ width: "100%", height: "80px" }}>
                <defs>
                  <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={`${sparkLine} L240,80 L0,80 Z`} fill="url(#heroGrad)" />
                <path d={sparkLine} fill="none" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              {/* X-axis labels */}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                {["Jan", "Mar", "May", "Jul", "Sep", "Nov"].map(m => (
                  <span key={m} style={{ fontSize: "8px", color: "#3f3f46" }}>{m}</span>
                ))}
              </div>
            </div>

            {/* Bar chart */}
            <div style={{ backgroundColor: "rgba(255,255,255,0.03)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", padding: "12px" }}>
              <div style={{ fontSize: "10px", fontWeight: 600, color: "#a1a1aa", marginBottom: "8px" }}>Top platforms</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: "80px" }}>
                {bars.map((h, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: `${h}%`,
                      borderRadius: "3px 3px 0 0",
                      backgroundColor: i % 3 === 0 ? "rgba(124,58,237,0.7)" : i % 3 === 1 ? "rgba(124,58,237,0.35)" : "rgba(124,58,237,0.2)",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Creator rows */}
          <div style={{ marginTop: "10px", backgroundColor: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", overflow: "hidden" }}>
            {[
              { name: "@maya.creates", platform: "tiktok" as Platform, views: "4.2M", change: "+22%" },
              { name: "@jakebreaks", platform: "instagram" as Platform, views: "1.8M", change: "+11%" },
              { name: "@techbyleo", platform: "youtube" as Platform, views: "980K", change: "+7%" },
            ].map((row, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.04)" : undefined }}>
                <div style={{ width: "22px", height: "22px", borderRadius: "50%", backgroundColor: PLATFORM_CONFIG[row.platform].bgColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: PLATFORM_CONFIG[row.platform].fgColor }}>
                  <PlatformIcon platform={row.platform} className="w-2.5 h-2.5" />
                </div>
                <span style={{ fontSize: "10px", color: "#a1a1aa", flex: 1 }}>{row.name}</span>
                <span style={{ fontSize: "10px", color: "#fafafa", fontWeight: 600 }}>{row.views}</span>
                <span style={{ fontSize: "9px", color: "#34d399", fontWeight: 500 }}>{row.change}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Hero Section ───────────────────────────────────── */
export function Hero() {
  return (
    <section
      style={{
        position: "relative",
        paddingTop: "120px",
        paddingBottom: "80px",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)", width: "900px", height: "600px", borderRadius: "50%", background: "radial-gradient(ellipse, rgba(124,58,237,0.18) 0%, transparent 70%)", filter: "blur(40px)" }} />
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
        {/* Badge */}
        <motion.div
          custom={0} variants={FADE_UP} initial="hidden" animate="show"
          style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 14px", borderRadius: "100px", backgroundColor: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)", fontSize: "13px", fontWeight: 500, color: "#c084fc" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#a855f7", display: "inline-block", animation: "pulse 2s infinite" }} />
            Now with AI-powered competitor reports
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          custom={1} variants={FADE_UP} initial="hidden" animate="show"
          style={{ textAlign: "center", fontSize: "clamp(36px, 6vw, 72px)", fontWeight: 800, color: "#fafafa", letterSpacing: "-0.04em", lineHeight: 1.08, marginBottom: "24px", maxWidth: "860px", margin: "0 auto 24px" }}
        >
          The UGC Analytics Platform{" "}
          <span style={{ background: "linear-gradient(135deg, #a855f7 0%, #7C3AED 50%, #6d28d9 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Built for Scale
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          custom={2} variants={FADE_UP} initial="hidden" animate="show"
          style={{ textAlign: "center", fontSize: "clamp(16px, 2.5vw, 20px)", color: "#71717a", lineHeight: 1.6, maxWidth: "580px", margin: "0 auto 36px" }}
        >
          Track every creator. Manage campaigns. Pay results. Zero spreadsheets.
        </motion.p>

        {/* CTAs */}
        <motion.div
          custom={3} variants={FADE_UP} initial="hidden" animate="show"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", flexWrap: "wrap", marginBottom: "20px" }}
        >
          <Link
            href="/signup"
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "13px 28px", borderRadius: "10px",
              backgroundColor: "#7C3AED", color: "#fff",
              fontSize: "15px", fontWeight: 700, textDecoration: "none",
              boxShadow: "0 0 32px rgba(124,58,237,0.45), 0 4px 16px rgba(0,0,0,0.4)",
              transition: "all 0.2s",
            }}
            className="hover:bg-purple-700 hover:scale-[1.03]"
          >
            Start Free Trial <ArrowRight style={{ width: "16px", height: "16px" }} />
          </Link>
          <Link
            href="/demo"
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "13px 28px", borderRadius: "10px",
              backgroundColor: "transparent", color: "#fafafa",
              fontSize: "15px", fontWeight: 600, textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.15)",
              transition: "all 0.2s",
            }}
            className="hover:border-white/30 hover:bg-white/5"
          >
            <Play style={{ width: "14px", height: "14px" }} />
            Try Demo Dashboard
          </Link>
        </motion.div>

        {/* Trust line */}
        <motion.p
          custom={4} variants={FADE_UP} initial="hidden" animate="show"
          style={{ textAlign: "center", fontSize: "13px", color: "#52525b", marginBottom: "48px" }}
        >
          7-day free trial · No credit card required · Cancel anytime
        </motion.p>

        {/* Platform icons */}
        <motion.div
          custom={5} variants={FADE_UP} initial="hidden" animate="show"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "56px", flexWrap: "wrap" }}
        >
          <span style={{ fontSize: "12px", color: "#52525b", marginRight: "4px" }}>Works with</span>
          {PLATFORMS.map(p => (
            <div
              key={p}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "5px 12px", borderRadius: "20px",
                backgroundColor: PLATFORM_CONFIG[p].bgColor,
                color: PLATFORM_CONFIG[p].fgColor,
                fontSize: "12px", fontWeight: 600,
                border: `1px solid ${PLATFORM_CONFIG[p].fgColor}22`,
              }}
            >
              <PlatformIcon platform={p} className="w-3.5 h-3.5" />
              {PLATFORM_CONFIG[p].label}
            </div>
          ))}
        </motion.div>

        {/* Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: "relative" }}
        >
          {/* Glow behind mockup */}
          <div style={{ position: "absolute", inset: "-40px", background: "radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.2) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <MockDashboard />
          </div>
          {/* Fade-out at bottom */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "120px", background: "linear-gradient(to top, #0a0a0a, transparent)", borderRadius: "0 0 16px 16px", zIndex: 2 }} />
        </motion.div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </section>
  )
}
