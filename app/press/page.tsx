import type { Metadata } from "next"
import Link from "next/link"
import { Zap, ArrowLeft, Download, ExternalLink, Mail, FileText, Image as ImageIcon, Palette } from "lucide-react"

export const metadata: Metadata = {
  title: "Press & Media",
  description: "TrackHive press kit, brand assets, media coverage, and press contact information.",
  openGraph: {
    title:       "TrackHive Press Kit",
    description: "Brand assets and media resources.",
    images: [{ url: "/og?title=TrackHive+Press+Kit&description=Brand+assets+and+media+resources", width: 1200, height: 630 }],
  },
  twitter: {
    title:       "TrackHive Press Kit",
    description: "Brand assets and media resources.",
    images:      ["/og?title=TrackHive+Press+Kit&description=Brand+assets+and+media+resources"],
  },
  alternates: { canonical: "https://trackhive.io/press" },
}

const COVERAGE = [
  { outlet: "TechCrunch", title: "TrackHive raises $1.2M to bring enterprise-grade UGC analytics to mid-market brands", date: "May 2025", url: "#", logo: "TC" },
  { outlet: "Product Hunt", title: "#2 Product of the Day — TrackHive: Analytics for creator campaigns", date: "Jun 2025", url: "#", logo: "PH" },
  { outlet: "Morning Brew", title: "The quiet infrastructure play powering the next wave of UGC advertising", date: "May 2025", url: "#", logo: "MB" },
  { outlet: "Creator Economy Report", title: "Why smart agencies are moving to platform-native tracking", date: "Apr 2025", url: "#", logo: "CE" },
]

const ASSETS = [
  { icon: Zap,       title: "Logo pack (SVG + PNG)", desc: "Light, dark, and monochrome variants. All sizes.", tag: "5 files · 2.4 MB" },
  { icon: Palette,   title: "Brand guidelines (PDF)", desc: "Colours, typography, usage do's and don'ts.",     tag: "1 file · 840 KB" },
  { icon: ImageIcon, title: "Product screenshots",    desc: "Dashboard, analytics, and campaigns views.",       tag: "12 files · 18 MB" },
  { icon: FileText,  title: "One-pager (PDF)",        desc: "Company overview, key stats, investor info.",     tag: "1 file · 520 KB" },
]

const BOILERPLATE = `TrackHive is a creator analytics and UGC campaign management platform built for brands and agencies. The company's platform enables marketing teams to track creator performance, manage campaign payments, and identify viral trends across TikTok, Instagram, YouTube, and Pinterest — all from a single dashboard.

Founded in 2025 and headquartered remotely with roots in Bangalore, India, TrackHive is used by 500+ brands and agencies to manage $5M+ in creator payouts.`

const STATS = [
  { n: "500+",  l: "Brands & agencies" },
  { n: "$5M+",  l: "Creator payouts processed" },
  { n: "1M+",   l: "Creator accounts tracked" },
  { n: "Apr 2025", l: "Founded" },
]

export default function PressPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0a0a" }}>
      {/* Nav */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid rgba(255,255,255,0.06)", backgroundColor: "rgba(10,10,10,0.9)", backdropFilter: "blur(12px)", padding: "0 24px", display: "flex", alignItems: "center", height: "60px" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: "linear-gradient(135deg,#7C3AED,#6D28D9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap style={{ width: "15px", height: "15px", color: "white" }} />
          </div>
          <span style={{ fontSize: "16px", fontWeight: 700, color: "#fafafa" }}>TrackHive</span>
        </Link>
        <Link href="/" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#71717a", textDecoration: "none" }}>
          <ArrowLeft style={{ width: "13px", height: "13px" }} /> Back
        </Link>
      </header>

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "72px 24px 56px", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "500px", height: "250px", background: "radial-gradient(ellipse at center, rgba(124,58,237,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#7C3AED", textTransform: "uppercase", letterSpacing: "0.08em" }}>Press</span>
          <h1 style={{ fontSize: "clamp(28px,5vw,52px)", fontWeight: 800, color: "#fafafa", lineHeight: 1.1, margin: "12px 0 16px" }}>Media kit &amp; resources</h1>
          <p style={{ fontSize: "16px", color: "#71717a", maxWidth: "480px", margin: "0 auto 36px", lineHeight: 1.7 }}>
            Everything journalists and creators need to cover TrackHive — downloads, boilerplate copy, and press contacts.
          </p>
          <a href="mailto:press@trackhive.io" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "11px 24px", borderRadius: "10px", backgroundColor: "#7C3AED", color: "white", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>
            <Mail style={{ width: "14px", height: "14px" }} /> Contact press team
          </a>
        </div>
      </section>

      {/* Stats bar */}
      <div style={{ maxWidth: "860px", margin: "0 auto 64px", padding: "0 24px" }}>
        <div style={{ borderRadius: "16px", border: "1px solid rgba(255,255,255,0.07)", backgroundColor: "#111111", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0" }}>
          {STATS.map((s, i) => (
            <div key={s.l} style={{ padding: "28px", textAlign: "center", borderRight: i < STATS.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
              <p style={{ fontSize: "26px", fontWeight: 800, color: "#fafafa", lineHeight: 1 }}>{s.n}</p>
              <p style={{ fontSize: "12px", color: "#71717a", marginTop: "6px" }}>{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Coverage */}
      <section style={{ maxWidth: "860px", margin: "0 auto", padding: "0 24px 72px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#fafafa", marginBottom: "20px" }}>Featured coverage</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {COVERAGE.map(c => (
            <div key={c.title} style={{ borderRadius: "14px", border: "1px solid rgba(255,255,255,0.07)", backgroundColor: "#111111", padding: "20px 24px", display: "flex", gap: "16px", alignItems: "flex-start" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: "10px", fontWeight: 800, color: "#a1a1aa" }}>{c.logo}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", marginBottom: "6px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#7C3AED" }}>{c.outlet}</span>
                  <span style={{ fontSize: "11px", color: "#52525b" }}>{c.date}</span>
                </div>
                <p style={{ fontSize: "14px", color: "#e4e4e7", lineHeight: 1.5 }}>{c.title}</p>
              </div>
              <a href={c.url} target="_blank" rel="noreferrer" style={{ flexShrink: 0, padding: "8px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)", color: "#71717a", display: "flex" }}>
                <ExternalLink style={{ width: "14px", height: "14px" }} />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Assets */}
      <section style={{ maxWidth: "860px", margin: "0 auto", padding: "0 24px 72px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#fafafa", marginBottom: "8px" }}>Brand assets</h2>
        <p style={{ fontSize: "13px", color: "#71717a", marginBottom: "20px" }}>Please do not alter our logo, colours, or typography. See brand guidelines for full usage rules.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
          {ASSETS.map(a => {
            const Icon = a.icon
            return (
              <div key={a.title} style={{ borderRadius: "14px", border: "1px solid rgba(255,255,255,0.07)", backgroundColor: "#111111", padding: "20px 22px", display: "flex", gap: "14px" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "10px", backgroundColor: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon style={{ width: "18px", height: "18px", color: "#a78bfa" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "#fafafa", marginBottom: "4px" }}>{a.title}</p>
                  <p style={{ fontSize: "12px", color: "#71717a", lineHeight: 1.5, marginBottom: "10px" }}>{a.desc}</p>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span style={{ fontSize: "11px", color: "#52525b" }}>{a.tag}</span>
                    <button style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 10px", borderRadius: "6px", border: "1px solid rgba(124,58,237,0.3)", backgroundColor: "rgba(124,58,237,0.08)", color: "#a78bfa", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}>
                      <Download style={{ width: "11px", height: "11px" }} /> Download
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Boilerplate */}
      <section style={{ maxWidth: "860px", margin: "0 auto", padding: "0 24px 80px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#fafafa", marginBottom: "8px" }}>Approved boilerplate</h2>
        <p style={{ fontSize: "13px", color: "#71717a", marginBottom: "16px" }}>Please use this copy when describing TrackHive in articles, press releases, or other publications.</p>
        <div style={{ borderRadius: "14px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "#111111", padding: "24px" }}>
          <p style={{ fontSize: "14px", color: "#a1a1aa", lineHeight: 1.8, whiteSpace: "pre-line" }}>{BOILERPLATE}</p>
        </div>
      </section>

      {/* Press contact */}
      <section style={{ maxWidth: "600px", margin: "0 auto", padding: "0 24px 80px", textAlign: "center" }}>
        <div style={{ borderRadius: "20px", border: "1px solid rgba(255,255,255,0.07)", backgroundColor: "#111111", padding: "40px 32px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Mail style={{ width: "20px", height: "20px", color: "#a78bfa" }} />
          </div>
          <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#fafafa", marginBottom: "8px" }}>Press contact</h3>
          <p style={{ fontSize: "14px", color: "#71717a", marginBottom: "20px", lineHeight: 1.6 }}>For interviews, quotes, or specific assets not listed here, reach out to our press team. We typically respond within 4 hours.</p>
          <a href="mailto:press@trackhive.io" style={{ fontSize: "15px", fontWeight: 700, color: "#a78bfa", textDecoration: "none" }}>press@trackhive.io</a>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "24px", display: "flex", gap: "24px", justifyContent: "center", flexWrap: "wrap" }}>
        {[{ l: "Home", h: "/" }, { l: "About", h: "/about" }, { l: "Careers", h: "/careers" }, { l: "Blog", h: "/blog" }].map(({ l, h }) => (
          <Link key={l} href={h} style={{ fontSize: "13px", color: "#52525b", textDecoration: "none" }}>{l}</Link>
        ))}
      </footer>
    </div>
  )
}
