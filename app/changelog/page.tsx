import Link from "next/link"
import {
  Zap, Sparkles, Wrench, AlertTriangle, ArrowLeft,
} from "lucide-react"

type EntryType = "feature" | "improvement" | "fix" | "breaking"

interface ChangelogEntry {
  version: string
  date: string
  title: string
  summary: string
  items: { type: EntryType; text: string }[]
}

const RELEASES: ChangelogEntry[] = [
  {
    version: "v0.9.0",
    date: "Jun 1, 2025",
    title: "Creator detail pages, notifications & search",
    summary: "Major UX improvements — every creator row is now clickable, global ⌘K search is live, and a full notifications center has been added.",
    items: [
      { type: "feature",     text: "Creator detail page (/analytics/[id]) — CPM estimates, engagement donut chart, weekly views pattern, top video spotlight" },
      { type: "feature",     text: "Global ⌘K search — jump to any page, creator, or campaign instantly" },
      { type: "feature",     text: "Notifications center (/notifications) — filterable feed with mark-as-read and dismiss" },
      { type: "improvement", text: "Analytics table rows are now fully clickable (not just the eye icon)" },
      { type: "improvement", text: "Custom branded 404 page" },
      { type: "feature",     text: "Creator invite flow (/invite/[token]) — 3-step onboarding for invited creators" },
    ],
  },
  {
    version: "v0.8.0",
    date: "May 28, 2025",
    title: "Settings page — all 6 tabs",
    summary: "Full settings section shipped: workspace config, team management, white-label controls, billing overview, integrations, and notification preferences.",
    items: [
      { type: "feature",     text: "Workspace settings — name, website, industry, timezone, logo upload" },
      { type: "feature",     text: "Team members — invite by email, role assignment, pending invites" },
      { type: "feature",     text: "White-label — subdomain, color pickers, client portal toggles (Agency plan)" },
      { type: "feature",     text: "Billing — plan cards, usage meters, invoice history, cancel flow" },
      { type: "feature",     text: "Integrations — Slack OAuth, Discord webhook, API key management" },
      { type: "feature",     text: "Notifications — per-channel toggles for Email, Slack, In-app" },
    ],
  },
  {
    version: "v0.7.0",
    date: "May 24, 2025",
    title: "Public landing page",
    summary: "TrackHive now has a full marketing site. 9 sections, Framer Motion animations, and complete pricing/FAQ.",
    items: [
      { type: "feature",     text: "Navbar with mobile hamburger menu and scroll-triggered border" },
      { type: "feature",     text: "Hero with platform icons and animated dashboard mockup" },
      { type: "feature",     text: "Social proof bar — scrolling marquee + 3 key stats" },
      { type: "feature",     text: "5-module feature showcase with alternating layout" },
      { type: "feature",     text: "Pricing page — monthly/annual toggle, 3 plans" },
      { type: "feature",     text: "Testimonials grid + accordion FAQ" },
      { type: "feature",     text: "CTA banner and full footer" },
    ],
  },
  {
    version: "v0.6.0",
    date: "May 20, 2025",
    title: "Onboarding flow",
    summary: "New users are now guided through a 3-step onboarding: profile, first creator, and alert setup.",
    items: [
      { type: "feature",     text: "Step 1 — tell us about yourself (company, team size, main goal)" },
      { type: "feature",     text: "Step 2 — add your first creator URL with platform auto-detection" },
      { type: "feature",     text: "Step 3 — alert setup (Slack / Discord / Email) with confetti on finish" },
      { type: "improvement", text: "Progress indicator with purple dot steps across all 3 screens" },
    ],
  },
  {
    version: "v0.5.0",
    date: "May 15, 2025",
    title: "Demo dashboard — all 6 pages",
    summary: "Public demo at /demo — no login required. Full mock data, signup gate on all actions.",
    items: [
      { type: "feature",     text: "Demo layout with yellow banner and signup gate modal" },
      { type: "feature",     text: "/demo — overview metrics and charts" },
      { type: "feature",     text: "/demo/analytics — mock creator accounts table" },
      { type: "feature",     text: "/demo/campaigns — mock campaign list with tabs" },
      { type: "feature",     text: "/demo/payments — mock payout queue" },
      { type: "feature",     text: "/demo/trends — mock viral video library" },
      { type: "feature",     text: "/demo/competitors — split-panel competitor view" },
    ],
  },
  {
    version: "v0.4.0",
    date: "May 10, 2025",
    title: "Competitor Intelligence module",
    summary: "Track competitor brands and their UGC creators. AI-generated weekly digests.",
    items: [
      { type: "feature",     text: "Competitor list with logo, platform accounts, and follower count" },
      { type: "feature",     text: "Creator tab — flag creators for outreach" },
      { type: "feature",     text: "AI Report tab — weekly digest with top videos and recommendations" },
      { type: "improvement", text: "Split-panel layout for fast switching between competitors" },
    ],
  },
  {
    version: "v0.3.0",
    date: "May 5, 2025",
    title: "Payments module",
    summary: "End-to-end creator payment flow — CPM rules, payout queue, invoice generation.",
    items: [
      { type: "feature",     text: "Creator directory with KYC status and payment method" },
      { type: "feature",     text: "Payout queue — approve, hold, and release payments" },
      { type: "feature",     text: "Payout rules — CPM, base fee, milestone bonus configuration" },
      { type: "feature",     text: "Invoice history with PDF download links" },
      { type: "improvement", text: "Invite creator flow with token-based link generation" },
    ],
  },
  {
    version: "v0.2.0",
    date: "Apr 28, 2025",
    title: "Campaigns & Trends modules",
    summary: "Full campaign management plus viral trend discovery.",
    items: [
      { type: "feature",     text: "Campaign list with status, budget progress, and creator count" },
      { type: "feature",     text: "Campaign detail — creator roster, performance chart, brief editor" },
      { type: "feature",     text: "Trends library — filter by platform, niche, content format" },
      { type: "feature",     text: "Brief generator — AI-powered brief from trending videos" },
      { type: "feature",     text: "Inspiration boards — save and organise viral content" },
    ],
  },
  {
    version: "v0.1.0",
    date: "Apr 20, 2025",
    title: "Initial release — Auth + Analytics",
    summary: "TrackHive is born. Core auth and the Analytics module are live.",
    items: [
      { type: "feature",     text: "Login, signup, and forgot-password pages" },
      { type: "feature",     text: "Dashboard home with metric cards and area chart" },
      { type: "feature",     text: "Analytics — add any creator by URL, no login required from the creator" },
      { type: "feature",     text: "Tracked accounts table with platform filter and sort" },
      { type: "feature",     text: "Sidebar + topbar layout with workspace switcher" },
    ],
  },
]

const TYPE_CONFIG: Record<EntryType, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  feature:     { label: "New",         color: "#a78bfa", bg: "rgba(124,58,237,0.12)",  icon: Sparkles    },
  improvement: { label: "Improved",    color: "#60a5fa", bg: "rgba(59,130,246,0.12)",  icon: Wrench      },
  fix:         { label: "Fixed",       color: "#34d399", bg: "rgba(16,185,129,0.12)",  icon: Wrench      },
  breaking:    { label: "Breaking",    color: "#f87171", bg: "rgba(239,68,68,0.12)",   icon: AlertTriangle },
}

function Badge({ type }: { type: EntryType }) {
  const cfg = TYPE_CONFIG[type]
  const Icon = cfg.icon
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "4px",
      padding: "2px 8px", borderRadius: "100px", fontSize: "10px", fontWeight: 700,
      color: cfg.color, backgroundColor: cfg.bg,
      border: `1px solid ${cfg.color}30`, whiteSpace: "nowrap",
    }}>
      <Icon style={{ width: "10px", height: "10px" }} />
      {cfg.label}
    </span>
  )
}

export default function ChangelogPage() {
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
          <span style={{ fontSize: "13px", color: "#52525b", marginLeft: "4px" }}>/ Changelog</span>
        </Link>
        <Link href="/" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#71717a", textDecoration: "none" }}>
          <ArrowLeft style={{ width: "13px", height: "13px" }} /> Back to site
        </Link>
      </header>

      {/* Header */}
      <section style={{ textAlign: "center", padding: "64px 24px 48px" }}>
        <h1 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, color: "#fafafa", marginBottom: "14px" }}>
          What&apos;s new in TrackHive
        </h1>
        <p style={{ fontSize: "16px", color: "#71717a", maxWidth: "480px", margin: "0 auto", lineHeight: 1.65 }}>
          Every release, improvement, and fix — in one place.
        </p>
      </section>

      {/* Timeline */}
      <section style={{ maxWidth: "720px", margin: "0 auto", padding: "0 24px 80px" }}>
        {RELEASES.map((release, i) => (
          <div key={release.version} style={{ display: "flex", flexDirection: "column", marginBottom: "32px" }}>
            {/* Version + date header */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <span style={{
                padding: "3px 10px", borderRadius: "6px",
                fontSize: "11px", fontWeight: 700,
                backgroundColor: i === 0 ? "#7C3AED" : "rgba(255,255,255,0.05)",
                color: i === 0 ? "white" : "#71717a",
                border: i === 0 ? "none" : "1px solid rgba(255,255,255,0.08)",
                flexShrink: 0,
              }}>
                {release.version}
              </span>
              <span style={{ fontSize: "12px", color: "#52525b" }}>{release.date}</span>
              {i === 0 && (
                <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "100px", backgroundColor: "rgba(16,185,129,0.15)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)" }}>
                  Latest
                </span>
              )}
            </div>

            {/* Content card */}
            <div style={{
              backgroundColor: "#111111",
              border: `1px solid ${i === 0 ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.06)"}`,
              borderRadius: "14px",
              overflow: "hidden",
            }}>
              <div style={{ padding: "18px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#fafafa", marginBottom: "6px" }}>
                  {release.title}
                </h2>
                <p style={{ fontSize: "13px", color: "#71717a", lineHeight: 1.55 }}>{release.summary}</p>
              </div>
              <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                {release.items.map((item, j) => (
                  <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                    <Badge type={item.type} />
                    <p style={{ fontSize: "13px", color: "#a1a1aa", lineHeight: 1.5, flex: 1 }}>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "24px", display: "flex", alignItems: "center", justifyContent: "center", gap: "24px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "13px", color: "#52525b" }}>© 2025 TrackHive</span>
        <Link href="/dashboard" style={{ fontSize: "13px", color: "#71717a", textDecoration: "none" }}>App</Link>
        <Link href="/blog"      style={{ fontSize: "13px", color: "#71717a", textDecoration: "none" }}>Blog</Link>
      </footer>
    </div>
  )
}
