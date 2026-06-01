"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Zap, X } from "lucide-react"

function GithubIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

function LinkedinIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

const FOOTER_LINKS = {
  Product: [
    { label: "Analytics",      href: "/#features" },
    { label: "Campaigns",      href: "/#features" },
    { label: "Payments",       href: "/#features" },
    { label: "Trends",         href: "/#features" },
    { label: "Competitor Intel", href: "/#features" },
    { label: "Pricing",        href: "/pricing" },
  ],
  Company: [
    { label: "About",    href: "/about" },
    { label: "Blog",     href: "/blog" },
    { label: "Careers",  href: "/careers" },
    { label: "Press",    href: "/press" },
    { label: "Contact",  href: "mailto:hello@trackhive.io" },
  ],
  Resources: [
    { label: "Documentation",  href: "/docs" },
    { label: "API Reference",  href: "/api-reference" },
    { label: "Changelog",      href: "/changelog" },
    { label: "Status",         href: "/status" },
    { label: "Demo Dashboard", href: "/demo" },
  ],
  Legal: [
    { label: "Privacy Policy",  href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy",   href: "/cookies" },
    { label: "GDPR",            href: "/gdpr" },
  ],
}

const SOCIAL = [
  { icon: X, label: "X / Twitter", href: "#" },
  { icon: GithubIcon, label: "GitHub", href: "https://github.com/sainirahul2163/trackhive" },
  { icon: LinkedinIcon, label: "LinkedIn", href: "#" },
]

/* ─── CTA Banner ───────────────────────────────────── */
function CTABanner() {
  return (
    <section style={{ padding: "0 24px 96px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "relative",
            borderRadius: "24px",
            overflow: "hidden",
            padding: "72px 48px",
            textAlign: "center",
            background: "linear-gradient(135deg, #3b0764 0%, #4c1d95 30%, #6d28d9 60%, #7C3AED 100%)",
            border: "1px solid rgba(124,58,237,0.4)",
          }}
        >
          {/* Grid texture overlay */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            pointerEvents: "none",
          }} />

          {/* Glow orbs */}
          <div style={{ position: "absolute", top: "-40%", left: "-10%", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(rgba(167,139,250,0.3), transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "-40%", right: "-10%", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(rgba(109,40,217,0.4), transparent 70%)", pointerEvents: "none" }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 14px", borderRadius: "100px", backgroundColor: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", marginBottom: "20px" }}>
              <Zap style={{ width: "12px", height: "12px", color: "#fde68a", fill: "#fde68a" }} />
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#fde68a" }}>14-day free trial · No card required</span>
            </div>

            <h2 style={{ fontSize: "clamp(28px, 4.5vw, 52px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: "16px" }}>
              Ready to run UGC like a<br />top-tier growth team?
            </h2>

            <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.65)", marginBottom: "36px", maxWidth: "480px", margin: "0 auto 36px", lineHeight: 1.6 }}>
              Join 500+ brands that track more creators, launch faster campaigns and pay automatically — all without a spreadsheet in sight.
            </p>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
              <Link
                href="/signup"
                style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  padding: "13px 32px", borderRadius: "10px",
                  backgroundColor: "#fff", color: "#3b0764",
                  fontSize: "15px", fontWeight: 700, textDecoration: "none",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
                  transition: "all 0.2s",
                }}
                className="hover:scale-[1.03] hover:shadow-xl"
              >
                Start Free Trial <ArrowRight style={{ width: "16px", height: "16px" }} />
              </Link>
              <Link
                href="/demo"
                style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  padding: "13px 28px", borderRadius: "10px",
                  backgroundColor: "rgba(255,255,255,0.1)", color: "#fff",
                  fontSize: "15px", fontWeight: 600, textDecoration: "none",
                  border: "1px solid rgba(255,255,255,0.25)",
                  transition: "all 0.2s",
                }}
                className="hover:bg-white/20"
              >
                Try Demo Dashboard
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Footer ───────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "64px 24px 32px", backgroundColor: "#050505" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* Top: logo + columns */}
        <div style={{ display: "grid", gridTemplateColumns: "1.8fr repeat(4, 1fr)", gap: "40px", marginBottom: "56px" }} className="max-md:grid-cols-2 max-sm:grid-cols-1">

          {/* Brand column */}
          <div>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "9px", textDecoration: "none", marginBottom: "14px" }}>
              <div style={{ width: "30px", height: "30px", borderRadius: "7px", backgroundColor: "#7C3AED", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Zap style={{ width: "15px", height: "15px", color: "#fff", fill: "#fff" }} />
              </div>
              <span style={{ fontSize: "17px", fontWeight: 700, color: "#fafafa", letterSpacing: "-0.02em" }}>TrackHive</span>
            </Link>
            <p style={{ fontSize: "13px", color: "#52525b", lineHeight: 1.7, maxWidth: "220px", marginBottom: "20px" }}>
              The UGC analytics platform for brands and agencies that play to win.
            </p>
            {/* Social icons */}
            <div style={{ display: "flex", gap: "8px" }}>
              {SOCIAL.map(s => {
                const Icon = s.icon
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      width: "32px", height: "32px", borderRadius: "7px",
                      backgroundColor: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.15s",
                    }}
                    className="hover:border-white/20 hover:bg-white/10"
                  >
                    <Icon style={{ width: "14px", height: "14px", color: "#71717a" }} />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Link columns */}
          {(Object.entries(FOOTER_LINKS) as [string, { label: string; href: string }[]][]).map(([col, links]) => (
            <div key={col}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#fafafa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px" }}>
                {col}
              </div>
              <ul style={{ display: "flex", flexDirection: "column", gap: "10px", listStyle: "none", padding: 0, margin: 0 }}>
                {links.map(link => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      style={{ fontSize: "13px", color: "#52525b", textDecoration: "none", transition: "color 0.15s" }}
                      className="hover:text-zinc-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <span style={{ fontSize: "12px", color: "#3f3f46" }}>
            © {new Date().getFullYear()} TrackHive, Inc. All rights reserved.
          </span>
          <div style={{ display: "flex", gap: "20px" }}>
            {[
              { label: "Privacy", href: "/privacy" },
              { label: "Terms",   href: "/terms" },
              { label: "Changelog", href: "/changelog" },
            ].map(item => (
              <Link key={item.label} href={item.href} style={{ fontSize: "12px", color: "#3f3f46", textDecoration: "none", transition: "color 0.15s" }} className="hover:text-zinc-500">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ─── Combined export ──────────────────────────────── */
export function CTAAndFooter() {
  return (
    <>
      <CTABanner />
      <Footer />
    </>
  )
}
