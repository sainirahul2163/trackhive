"use client"
import Link from "next/link"
import { useState } from "react"
import { Zap, ArrowLeft, Search, BookOpen, Rocket, Settings, CreditCard, BarChart2, Users, ChevronRight, ArrowRight, Bell, Globe } from "lucide-react"

const GUIDES = [
  {
    section: "Getting started",
    icon: Rocket,
    color: "#7C3AED",
    items: [
      { title: "Quick-start: Track your first creator",     time: "5 min",  slug: "quickstart" },
      { title: "Connect your TikTok / Instagram account",   time: "3 min",  slug: "connect-platform" },
      { title: "Invite your team",                          time: "2 min",  slug: "invite-team" },
      { title: "Your first campaign walkthrough",           time: "8 min",  slug: "first-campaign" },
    ],
  },
  {
    section: "Analytics",
    icon: BarChart2,
    color: "#3b82f6",
    items: [
      { title: "Understanding creator metrics",             time: "6 min",  slug: "creator-metrics" },
      { title: "Virality score explained",                  time: "4 min",  slug: "virality-score" },
      { title: "Filtering and sorting the creator list",    time: "3 min",  slug: "filter-sort" },
      { title: "Exporting analytics data to CSV",          time: "2 min",  slug: "export-csv" },
    ],
  },
  {
    section: "Campaigns",
    icon: Users,
    color: "#10b981",
    items: [
      { title: "Creating a campaign brief",                 time: "5 min",  slug: "create-campaign" },
      { title: "Sending creator invites",                   time: "3 min",  slug: "send-invites" },
      { title: "Tracking campaign performance",             time: "4 min",  slug: "campaign-performance" },
      { title: "Managing milestones and deliverables",     time: "5 min",  slug: "milestones" },
    ],
  },
  {
    section: "Payments",
    icon: CreditCard,
    color: "#f59e0b",
    items: [
      { title: "Setting up payouts (PayPal / Bank)",        time: "4 min",  slug: "setup-payouts" },
      { title: "Creating payout rules",                     time: "3 min",  slug: "payout-rules" },
      { title: "Payment history and invoices",              time: "2 min",  slug: "payment-history" },
      { title: "Processing international payouts",          time: "5 min",  slug: "international-payouts" },
    ],
  },
  {
    section: "Alerts & notifications",
    icon: Bell,
    color: "#ef4444",
    items: [
      { title: "Setting up viral spike alerts",             time: "3 min",  slug: "spike-alerts" },
      { title: "Follower drop notifications",               time: "2 min",  slug: "follower-drops" },
      { title: "Weekly digest email setup",                 time: "2 min",  slug: "weekly-digest" },
    ],
  },
  {
    section: "Account & settings",
    icon: Settings,
    color: "#a855f7",
    items: [
      { title: "Managing your workspace",                   time: "3 min",  slug: "workspace" },
      { title: "Billing and plan upgrades",                 time: "4 min",  slug: "billing" },
      { title: "SSO / SAML setup (Enterprise)",            time: "8 min",  slug: "sso" },
      { title: "API access and tokens",                     time: "5 min",  slug: "api-tokens" },
    ],
  },
  {
    section: "Integrations",
    icon: Globe,
    color: "#06b6d4",
    items: [
      { title: "Slack notifications integration",           time: "4 min",  slug: "slack" },
      { title: "Zapier / Make integration",                 time: "5 min",  slug: "zapier" },
      { title: "Google Sheets sync",                        time: "3 min",  slug: "sheets" },
      { title: "HubSpot CRM integration",                  time: "6 min",  slug: "hubspot" },
    ],
  },
]

const POPULAR = [
  "quickstart", "virality-score", "create-campaign", "setup-payouts", "spike-alerts",
]

export default function DocsPage() {
  const [search, setSearch] = useState("")

  const allItems = GUIDES.flatMap(g => g.items.map(i => ({ ...i, section: g.section, color: g.color, Icon: g.icon })))
  const filtered = search.trim() === ""
    ? null
    : allItems.filter(i => i.title.toLowerCase().includes(search.toLowerCase()) || i.section.toLowerCase().includes(search.toLowerCase()))

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
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/api-reference" style={{ fontSize: "13px", color: "#71717a", textDecoration: "none" }}>API Reference</Link>
          <Link href="/changelog" style={{ fontSize: "13px", color: "#71717a", textDecoration: "none" }}>Changelog</Link>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#71717a", textDecoration: "none" }}>
            <ArrowLeft style={{ width: "13px", height: "13px" }} /> Back
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section style={{ background: "linear-gradient(180deg, rgba(124,58,237,0.08) 0%, transparent 100%)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "56px 24px 48px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "16px" }}>
          <BookOpen style={{ width: "20px", height: "20px", color: "#7C3AED" }} />
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#7C3AED", textTransform: "uppercase", letterSpacing: "0.08em" }}>Documentation</span>
        </div>
        <h1 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, color: "#fafafa", margin: "0 0 12px", lineHeight: 1.15 }}>TrackHive Docs</h1>
        <p style={{ fontSize: "15px", color: "#71717a", maxWidth: "480px", margin: "0 auto 28px", lineHeight: 1.7 }}>
          Guides, tutorials and reference docs to help you get the most out of TrackHive.
        </p>
        <div style={{ position: "relative", maxWidth: "500px", margin: "0 auto" }}>
          <Search style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#52525b" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search docs…"
            style={{ width: "100%", paddingLeft: "44px", paddingRight: "16px", height: "46px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", backgroundColor: "#111111", color: "#fafafa", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
          />
        </div>
      </section>

      <div style={{ maxWidth: "980px", margin: "0 auto", padding: "0 24px 80px" }}>

        {/* Search results */}
        {filtered !== null && (
          <div style={{ paddingTop: "32px" }}>
            <p style={{ fontSize: "13px", color: "#71717a", marginBottom: "16px" }}>{filtered.length} result{filtered.length !== 1 ? "s" : ""} for &ldquo;{search}&rdquo;</p>
            {filtered.length === 0
              ? <p style={{ color: "#52525b", fontSize: "14px" }}>No guides found. Try a different search.</p>
              : <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {filtered.map(i => (
                    <SearchResult key={i.slug} item={i} />
                  ))}
                </div>
            }
          </div>
        )}

        {filtered === null && (
          <>
            {/* Popular */}
            <div style={{ paddingTop: "40px", marginBottom: "48px" }}>
              <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "16px" }}>Popular guides</h2>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {allItems.filter(i => POPULAR.includes(i.slug)).map(i => (
                  <button key={i.slug} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 14px", borderRadius: "9px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "#111111", color: "#e4e4e7", fontSize: "13px", cursor: "pointer" }}>
                    <i.Icon style={{ width: "13px", height: "13px", color: i.color }} />
                    {i.title}
                    <ChevronRight style={{ width: "12px", height: "12px", color: "#52525b" }} />
                  </button>
                ))}
              </div>
            </div>

            {/* All sections */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
              {GUIDES.map(g => {
                const Icon = g.icon
                return (
                  <div key={g.section} style={{ borderRadius: "16px", border: "1px solid rgba(255,255,255,0.07)", backgroundColor: "#111111", padding: "24px", display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                      <div style={{ width: "34px", height: "34px", borderRadius: "9px", backgroundColor: `${g.color}18`, border: `1px solid ${g.color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon style={{ width: "16px", height: "16px", color: g.color }} />
                      </div>
                      <p style={{ fontSize: "14px", fontWeight: 700, color: "#fafafa" }}>{g.section}</p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      {g.items.map(item => (
                        <button key={item.slug} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 10px", borderRadius: "8px", border: "none", backgroundColor: "transparent", cursor: "pointer", textAlign: "left" }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)") }
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent") }
                        >
                          <ChevronRight style={{ width: "13px", height: "13px", color: "#52525b", flexShrink: 0 }} />
                          <span style={{ fontSize: "13px", color: "#a1a1aa", flex: 1 }}>{item.title}</span>
                          <span style={{ fontSize: "11px", color: "#52525b", flexShrink: 0 }}>{item.time}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* CTA */}
            <div style={{ marginTop: "48px", borderRadius: "16px", border: "1px solid rgba(124,58,237,0.2)", background: "rgba(124,58,237,0.05)", padding: "32px", display: "flex", gap: "24px", alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <p style={{ fontSize: "16px", fontWeight: 700, color: "#fafafa", marginBottom: "6px" }}>Can&apos;t find what you need?</p>
                <p style={{ fontSize: "13px", color: "#71717a" }}>Our support team responds in under 2 hours during business hours.</p>
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <a href="mailto:support@trackhive.io" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 18px", borderRadius: "9px", backgroundColor: "#7C3AED", color: "white", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}>
                  Contact support <ArrowRight style={{ width: "13px", height: "13px" }} />
                </a>
                <Link href="/api-reference" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 18px", borderRadius: "9px", border: "1px solid rgba(255,255,255,0.1)", color: "#a1a1aa", fontSize: "13px", textDecoration: "none" }}>
                  API reference
                </Link>
              </div>
            </div>
          </>
        )}
      </div>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "24px", display: "flex", gap: "24px", justifyContent: "center", flexWrap: "wrap" }}>
        {[{ l: "Home", h: "/" }, { l: "API Reference", h: "/api-reference" }, { l: "Changelog", h: "/changelog" }, { l: "Status", h: "/status" }].map(({ l, h }) => (
          <Link key={l} href={h} style={{ fontSize: "13px", color: "#52525b", textDecoration: "none" }}>{l}</Link>
        ))}
      </footer>
    </div>
  )
}

function SearchResult({ item }: { item: { title: string; section: string; time: string; color: string; Icon: React.ComponentType<{ style?: React.CSSProperties }> } }) {
  const { Icon } = item
  return (
    <button style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.07)", backgroundColor: "#111111", cursor: "pointer", textAlign: "left", width: "100%" }}>
      <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: `${item.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon style={{ width: "15px", height: "15px", color: item.color }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: "13px", fontWeight: 600, color: "#fafafa", marginBottom: "2px" }}>{item.title}</p>
        <p style={{ fontSize: "11px", color: "#52525b" }}>{item.section} · {item.time} read</p>
      </div>
      <ChevronRight style={{ width: "14px", height: "14px", color: "#52525b", flexShrink: 0 }} />
    </button>
  )
}
