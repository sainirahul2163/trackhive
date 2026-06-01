import Link from "next/link"
import { Zap, ArrowLeft, Mail, BookOpen, Rss } from "lucide-react"

const UPCOMING = [
  { tag: "Product", title: "How TrackHive tracks any creator without API access", eta: "Coming soon" },
  { tag: "Guide",   title: "CPM vs CPA: which payout model is right for your UGC campaign?", eta: "Coming soon" },
  { tag: "Case Study", title: "How a DTC brand scaled to 200 UGC creators in 60 days", eta: "Coming soon" },
  { tag: "Product", title: "Introducing AI Competitor Digests — weekly intelligence, automated", eta: "Coming soon" },
]

export default function BlogPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0a0a", fontFamily: "inherit" }}>

      {/* Navbar */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        backgroundColor: "rgba(10,10,10,0.85)",
        backdropFilter: "blur(12px)",
        padding: "0 24px",
        display: "flex", alignItems: "center", height: "60px",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: "linear-gradient(135deg,#7C3AED,#6D28D9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap style={{ width: "15px", height: "15px", color: "white" }} />
          </div>
          <span style={{ fontSize: "16px", fontWeight: 700, color: "#fafafa" }}>TrackHive</span>
          <span style={{ fontSize: "13px", color: "#52525b", marginLeft: "4px" }}>/ Blog</span>
        </Link>
        <Link href="/" style={{
          marginLeft: "auto",
          display: "flex", alignItems: "center", gap: "6px",
          fontSize: "13px", color: "#71717a", textDecoration: "none",
        }}>
          <ArrowLeft style={{ width: "13px", height: "13px" }} />
          Back to site
        </Link>
      </header>

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "72px 24px 48px" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          padding: "4px 12px", borderRadius: "100px",
          border: "1px solid rgba(124,58,237,0.3)",
          backgroundColor: "rgba(124,58,237,0.1)",
          marginBottom: "20px",
        }}>
          <Rss style={{ width: "12px", height: "12px", color: "#a78bfa" }} />
          <span style={{ fontSize: "12px", color: "#a78bfa", fontWeight: 600 }}>Coming soon</span>
        </div>
        <h1 style={{
          fontSize: "clamp(32px,5vw,52px)", fontWeight: 800,
          color: "#fafafa", lineHeight: 1.15, marginBottom: "20px",
        }}>
          The TrackHive Blog
        </h1>
        <p style={{ fontSize: "17px", color: "#71717a", maxWidth: "520px", margin: "0 auto 36px", lineHeight: 1.65 }}>
          Playbooks, product updates, and data-backed strategies for growth teams running UGC at scale.
        </p>

        {/* Email subscribe */}
        <div style={{
          display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap",
          maxWidth: "440px", margin: "0 auto",
        }}>
          <div style={{
            flex: 1, minWidth: "220px",
            display: "flex", alignItems: "center", gap: "10px",
            padding: "0 14px", borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.08)",
            backgroundColor: "#111111",
          }}>
            <Mail style={{ width: "15px", height: "15px", color: "#52525b", flexShrink: 0 }} />
            <input
              type="email"
              placeholder="your@email.com"
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                fontSize: "14px", color: "#fafafa", padding: "12px 0",
              }}
            />
          </div>
          <button style={{
            padding: "12px 20px", borderRadius: "10px",
            backgroundColor: "#7C3AED", color: "white",
            fontSize: "14px", fontWeight: 600, cursor: "pointer",
            border: "none", whiteSpace: "nowrap",
          }}>
            Notify me
          </button>
        </div>
        <p style={{ fontSize: "12px", color: "#52525b", marginTop: "10px" }}>
          We&apos;ll email you when the first post goes live. No spam.
        </p>
      </section>

      {/* Upcoming posts */}
      <section style={{ maxWidth: "720px", margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
          <BookOpen style={{ width: "16px", height: "16px", color: "#71717a" }} />
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            What&apos;s coming
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {UPCOMING.map((post, i) => (
            <div
              key={i}
              style={{
                display: "flex", alignItems: "center", gap: "16px",
                padding: "18px 20px", borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.06)",
                backgroundColor: "#111111",
              }}
            >
              <span style={{
                fontSize: "10px", fontWeight: 700,
                padding: "3px 8px", borderRadius: "100px",
                backgroundColor: "rgba(124,58,237,0.12)",
                color: "#a78bfa", whiteSpace: "nowrap",
                border: "1px solid rgba(124,58,237,0.2)",
              }}>
                {post.tag}
              </span>
              <p style={{ flex: 1, fontSize: "14px", color: "#d4d4d8", fontWeight: 500, lineHeight: 1.4 }}>
                {post.title}
              </p>
              <span style={{ fontSize: "12px", color: "#52525b", whiteSpace: "nowrap" }}>{post.eta}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "24px",
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: "24px", flexWrap: "wrap",
      }}>
        <span style={{ fontSize: "13px", color: "#52525b" }}>© 2025 TrackHive</span>
        <Link href="/dashboard" style={{ fontSize: "13px", color: "#71717a", textDecoration: "none" }}>App</Link>
        <Link href="/demo" style={{ fontSize: "13px", color: "#71717a", textDecoration: "none" }}>Demo</Link>
      </footer>
    </div>
  )
}
