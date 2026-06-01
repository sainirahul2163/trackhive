import Link from "next/link"
import { Zap, ArrowLeft, Target, Heart, Rocket, Globe, ArrowRight } from "lucide-react"

const TEAM = [
  { name: "Rahul Saini",    role: "CEO & Co-Founder",     avatar: "RS", color: "#7C3AED", bio: "Ex-growth lead at a top DTC agency. Built TrackHive after spending 3 years tracking creators in spreadsheets." },
  { name: "Priya Mehta",    role: "CTO & Co-Founder",     avatar: "PM", color: "#3b82f6", bio: "Former staff engineer at Stripe. Obsessed with data pipelines and making complex analytics feel simple." },
  { name: "Alex Turner",    role: "Head of Product",       avatar: "AT", color: "#10b981", bio: "Led product at two Y Combinator-backed startups. Joined TrackHive to build the UGC tool he always wished existed." },
  { name: "Sofia Chen",     role: "Head of Growth",        avatar: "SC", color: "#f59e0b", bio: "Previously at HubSpot and Notion. Drives creator partnerships and helps brands get the most out of TrackHive." },
  { name: "James Okafor",   role: "Lead Engineer",         avatar: "JO", color: "#ef4444", bio: "Full-stack engineer who previously built analytics infrastructure for a FAANG company." },
  { name: "Mia Rodriguez",  role: "Customer Success",      avatar: "MR", color: "#a855f7", bio: "Spent 5 years helping agencies scale their operations. Now ensures every TrackHive customer actually wins." },
]

const VALUES = [
  { icon: Target, title: "Clarity over complexity",  desc: "UGC analytics is messy. We do the hard work of making it simple — one clear number, one clear action." },
  { icon: Heart,  title: "Built for operators",       desc: "We're not building for analysts. We're building for the person running 50 creator campaigns at once." },
  { icon: Rocket, title: "Speed first",               desc: "Insights you see tomorrow are insights you can't act on. Everything in TrackHive is designed to be fast." },
  { icon: Globe,  title: "Transparent by default",    desc: "No black boxes. You always know where your data comes from, how fresh it is, and what it means." },
]

const MILESTONES = [
  { year: "Apr 2025", event: "Founded in Bangalore, India" },
  { year: "May 2025", event: "First 10 paying customers" },
  { year: "Jun 2025", event: "Launched public beta with full dashboard" },
  { year: "Q3 2025", event: "Series Seed — targeting $1.5M" },
  { year: "Q4 2025", event: "White-label launch for agencies" },
]

function NavBar() {
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid rgba(255,255,255,0.06)", backgroundColor: "rgba(10,10,10,0.9)", backdropFilter: "blur(12px)", padding: "0 24px", display: "flex", alignItems: "center", height: "60px" }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
        <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: "linear-gradient(135deg,#7C3AED,#6D28D9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Zap style={{ width: "15px", height: "15px", color: "white" }} />
        </div>
        <span style={{ fontSize: "16px", fontWeight: 700, color: "#fafafa" }}>TrackHive</span>
      </Link>
      <nav style={{ display: "flex", gap: "20px", marginLeft: "32px" }}>
        {[{ label: "Blog", href: "/blog" }, { label: "Careers", href: "/careers" }, { label: "Pricing", href: "/pricing" }].map(l => (
          <Link key={l.label} href={l.href} style={{ fontSize: "13px", color: "#71717a", textDecoration: "none" }}>{l.label}</Link>
        ))}
      </nav>
      <Link href="/" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#71717a", textDecoration: "none" }}>
        <ArrowLeft style={{ width: "13px", height: "13px" }} /> Back
      </Link>
    </header>
  )
}

export default function AboutPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0a0a", fontFamily: "inherit" }}>
      <NavBar />

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "72px 24px 56px", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "600px", height: "300px", background: "radial-gradient(ellipse at center, rgba(124,58,237,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#7C3AED", textTransform: "uppercase", letterSpacing: "0.08em" }}>Our story</span>
          <h1 style={{ fontSize: "clamp(32px,5vw,56px)", fontWeight: 800, color: "#fafafa", lineHeight: 1.1, margin: "12px 0 20px" }}>
            We built the tool we<br />desperately needed
          </h1>
          <p style={{ fontSize: "17px", color: "#71717a", maxWidth: "560px", margin: "0 auto 0", lineHeight: 1.7 }}>
            TrackHive started because our founders spent years managing UGC campaigns in Google Sheets — and knew there had to be a better way.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section style={{ maxWidth: "800px", margin: "0 auto", padding: "0 24px 72px" }}>
        <div style={{ borderRadius: "20px", border: "1px solid rgba(124,58,237,0.2)", background: "rgba(124,58,237,0.05)", padding: "40px 48px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "#7C3AED", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px" }}>Our mission</p>
          <p style={{ fontSize: "clamp(20px,2.5vw,26px)", fontWeight: 700, color: "#fafafa", lineHeight: 1.5 }}>
            &ldquo;To give every brand and agency the same creator intelligence that top-tier growth teams have — without the headcount or complexity.&rdquo;
          </p>
        </div>
      </section>

      {/* Story */}
      <section style={{ maxWidth: "760px", margin: "0 auto", padding: "0 24px 80px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#fafafa", marginBottom: "24px" }}>The backstory</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[
            "In 2023, our CEO Rahul was running influencer campaigns for a mid-sized DTC brand. He had 60 creators, 3 active campaigns, and a spreadsheet with 40 columns. Every Monday morning was 3 hours of copy-pasting view counts from TikTok.",
            "He knew the data existed. The platforms had it. But there was no way to pull it all together, compare creators, track campaign ROI, or trigger payments automatically — without either a massive enterprise contract or a team of engineers.",
            "So he called Priya, his engineer friend. Six weeks later, the first version of TrackHive was live. It tracked 10 creators, refreshed data daily, and sent a Slack message when something went viral.",
            "A year later, we're tracking 1M+ accounts, processing $5M+ in creator payouts, and helping over 500 brands run UGC at a scale that would have required a team of 10 just two years ago.",
          ].map((para, i) => (
            <p key={i} style={{ fontSize: "15px", color: "#a1a1aa", lineHeight: 1.8 }}>{para}</p>
          ))}
        </div>
      </section>

      {/* Values */}
      <section style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px 80px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#fafafa", marginBottom: "8px" }}>What we believe</h2>
        <p style={{ fontSize: "14px", color: "#71717a", marginBottom: "32px" }}>Four principles that shape every decision we make.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
          {VALUES.map(v => {
            const Icon = v.icon
            return (
              <div key={v.title} style={{ borderRadius: "16px", border: "1px solid rgba(255,255,255,0.07)", backgroundColor: "#111111", padding: "24px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" }}>
                  <Icon style={{ width: "18px", height: "18px", color: "#a78bfa" }} />
                </div>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "#fafafa", marginBottom: "8px" }}>{v.title}</p>
                <p style={{ fontSize: "13px", color: "#71717a", lineHeight: 1.6 }}>{v.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Timeline */}
      <section style={{ maxWidth: "640px", margin: "0 auto", padding: "0 24px 80px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#fafafa", marginBottom: "32px" }}>Milestones</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {MILESTONES.map((m, i) => (
            <div key={i} style={{ display: "flex", gap: "20px", paddingBottom: "28px", position: "relative" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: i === 0 ? "#7C3AED" : "#3f3f46", border: `2px solid ${i === 0 ? "#a78bfa" : "#27272a"}`, marginTop: "4px" }} />
                {i < MILESTONES.length - 1 && <div style={{ width: "1px", flex: 1, backgroundColor: "rgba(255,255,255,0.06)", marginTop: "6px" }} />}
              </div>
              <div style={{ paddingBottom: "8px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: i === 0 ? "#a78bfa" : "#52525b", textTransform: "uppercase", letterSpacing: "0.06em" }}>{m.year}</span>
                <p style={{ fontSize: "14px", color: i === 0 ? "#fafafa" : "#a1a1aa", marginTop: "4px" }}>{m.event}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section style={{ maxWidth: "960px", margin: "0 auto", padding: "0 24px 80px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#fafafa", marginBottom: "8px" }}>The team</h2>
        <p style={{ fontSize: "14px", color: "#71717a", marginBottom: "32px" }}>Small team, big ambitions.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
          {TEAM.map(member => (
            <div key={member.name} style={{ borderRadius: "16px", border: "1px solid rgba(255,255,255,0.07)", backgroundColor: "#111111", padding: "24px", display: "flex", gap: "16px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: `${member.color}20`, border: `1px solid ${member.color}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: member.color }}>{member.avatar}</span>
              </div>
              <div>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "#fafafa", marginBottom: "2px" }}>{member.name}</p>
                <p style={{ fontSize: "12px", color: "#7C3AED", fontWeight: 600, marginBottom: "8px" }}>{member.role}</p>
                <p style={{ fontSize: "12px", color: "#71717a", lineHeight: 1.6 }}>{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: "600px", margin: "0 auto", padding: "0 24px 80px", textAlign: "center" }}>
        <div style={{ borderRadius: "20px", background: "linear-gradient(135deg,rgba(124,58,237,0.12),rgba(109,40,217,0.05))", border: "1px solid rgba(124,58,237,0.2)", padding: "48px 32px" }}>
          <h3 style={{ fontSize: "24px", fontWeight: 800, color: "#fafafa", marginBottom: "12px" }}>Join us on this mission</h3>
          <p style={{ fontSize: "14px", color: "#71717a", marginBottom: "28px", lineHeight: 1.6 }}>Whether you&apos;re a brand, an agency, or someone who wants to work with us &mdash; we&apos;d love to talk.</p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/signup" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "11px 24px", borderRadius: "10px", backgroundColor: "#7C3AED", color: "white", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>
              Start free trial <ArrowRight style={{ width: "14px", height: "14px" }} />
            </Link>
            <Link href="/careers" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "11px 24px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)", backgroundColor: "transparent", color: "#a1a1aa", fontSize: "14px", textDecoration: "none" }}>
              See open roles
            </Link>
          </div>
        </div>
      </section>

      {/* Footer strip */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "24px", display: "flex", gap: "24px", justifyContent: "center", flexWrap: "wrap" }}>
        {[{ l: "Home", h: "/" }, { l: "Pricing", h: "/pricing" }, { l: "Blog", h: "/blog" }, { l: "Careers", h: "/careers" }, { l: "Press", h: "/press" }].map(({ l, h }) => (
          <Link key={l} href={h} style={{ fontSize: "13px", color: "#52525b", textDecoration: "none" }}>{l}</Link>
        ))}
      </footer>
    </div>
  )
}
