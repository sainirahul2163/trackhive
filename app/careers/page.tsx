"use client"
import Link from "next/link"
import { useState } from "react"
import { Zap, ArrowLeft, MapPin, Clock, ArrowRight, Search, Briefcase } from "lucide-react"

const ROLES = [
  { id: 1, title: "Senior Full-Stack Engineer", dept: "Engineering", location: "Remote (India/EU)", type: "Full-time", status: "open", desc: "Build and scale TrackHive's core analytics pipeline and React frontend. You'll own entire product surfaces end-to-end.", tags: ["Next.js", "TypeScript", "Postgres", "Python"] },
  { id: 2, title: "Product Designer", dept: "Design", location: "Remote (Worldwide)", type: "Full-time", status: "open", desc: "Own the end-to-end design of new product features — from discovery and wireframes to polished Figma mocks and design systems.", tags: ["Figma", "User Research", "Motion Design"] },
  { id: 3, title: "Growth Marketer", dept: "Marketing", location: "Remote (India)", type: "Full-time", status: "open", desc: "Drive acquisition, activation, and expansion through content, paid, and partnerships. Own our creator-facing GTM strategy.", tags: ["SEO", "Paid Ads", "Creator Economy"] },
  { id: 4, title: "Backend Engineer — Data", dept: "Engineering", location: "Remote (Worldwide)", type: "Full-time", status: "soon", desc: "Own our data ingestion and processing infrastructure. Work on platform API integrations and creator data normalization at scale.", tags: ["Python", "Kafka", "BigQuery", "dbt"] },
  { id: 5, title: "Account Executive", dept: "Sales", location: "Remote (US)", type: "Full-time", status: "soon", desc: "Close deals with mid-market agencies and enterprise brands. Run the full sales cycle from outbound through to close.", tags: ["SaaS Sales", "Agency Experience", "HubSpot"] },
  { id: 6, title: "Developer Advocate", dept: "Engineering", location: "Remote (Worldwide)", type: "Full-time", status: "soon", desc: "Help developers build on top of TrackHive's API. Create guides, demos, and community content.", tags: ["Developer Relations", "APIs", "Content"] },
]

const PERKS = [
  { emoji: "🌍", title: "Fully remote",      desc: "Work from anywhere. We're async-first by design." },
  { emoji: "💰", title: "Competitive pay",   desc: "Market-rate salaries with meaningful equity from day one." },
  { emoji: "🏖️", title: "Unlimited PTO",    desc: "We trust you to manage your own time and recharge." },
  { emoji: "🧠", title: "$1,000 learning",   desc: "Annual budget for courses, books, and conferences." },
  { emoji: "💻", title: "Home office budget", desc: "$500 setup budget to build your perfect workspace." },
  { emoji: "🚀", title: "Early equity",      desc: "Be an owner. Every full-time hire gets meaningful stock options." },
]

const DEPTS = ["All", "Engineering", "Design", "Marketing", "Sales"]

export default function CareersPage() {
  const [dept, setDept] = useState("All")
  const [search, setSearch] = useState("")

  const filtered = ROLES.filter(r =>
    (dept === "All" || r.dept === dept) &&
    (search === "" || r.title.toLowerCase().includes(search.toLowerCase()))
  )
  const open = filtered.filter(r => r.status === "open")
  const soon = filtered.filter(r => r.status === "soon")

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
          <Link href="/about" style={{ fontSize: "13px", color: "#71717a", textDecoration: "none" }}>About</Link>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#71717a", textDecoration: "none" }}>
            <ArrowLeft style={{ width: "13px", height: "13px" }} /> Back
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "72px 24px 48px", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "600px", height: "300px", background: "radial-gradient(ellipse at center, rgba(124,58,237,0.13) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 12px", borderRadius: "999px", border: "1px solid rgba(124,58,237,0.3)", backgroundColor: "rgba(124,58,237,0.08)", marginBottom: "16px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.08em" }}>We&apos;re hiring</span>
          </div>
          <h1 style={{ fontSize: "clamp(32px,5vw,56px)", fontWeight: 800, color: "#fafafa", lineHeight: 1.1, margin: "0 0 16px" }}>
            Help us build the<br />future of UGC
          </h1>
          <p style={{ fontSize: "17px", color: "#71717a", maxWidth: "520px", margin: "0 auto 40px", lineHeight: 1.7 }}>
            We&apos;re a small team with big ambitions. We&apos;re looking for sharp, kind, and curious people who want to move fast and have real ownership.
          </p>
          <div style={{ display: "flex", gap: "24px", justifyContent: "center", flexWrap: "wrap" }}>
            {[{ n: `${ROLES.filter(r => r.status === "open").length}`, l: "Open roles" }, { n: "12", l: "Countries represented" }, { n: "100%", l: "Remote team" }].map(s => (
              <div key={s.l} style={{ textAlign: "center" }}>
                <p style={{ fontSize: "28px", fontWeight: 800, color: "#fafafa", lineHeight: 1 }}>{s.n}</p>
                <p style={{ fontSize: "12px", color: "#71717a", marginTop: "4px" }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Perks */}
      <section style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px 72px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#fafafa", marginBottom: "20px" }}>Why TrackHive</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "14px" }}>
          {PERKS.map(p => (
            <div key={p.title} style={{ borderRadius: "14px", border: "1px solid rgba(255,255,255,0.07)", backgroundColor: "#111111", padding: "20px 22px", display: "flex", gap: "14px", alignItems: "flex-start" }}>
              <span style={{ fontSize: "24px", lineHeight: 1, flexShrink: 0 }}>{p.emoji}</span>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#fafafa", marginBottom: "4px" }}>{p.title}</p>
                <p style={{ fontSize: "12px", color: "#71717a", lineHeight: 1.5 }}>{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Job listings */}
      <section style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px 80px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#fafafa", marginBottom: "20px" }}>Open positions</h2>

        {/* Filters */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "20px" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
            <Search style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: "#52525b" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search roles…"
              style={{ width: "100%", paddingLeft: "36px", paddingRight: "12px", height: "38px", borderRadius: "9px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "#111111", color: "#fafafa", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {DEPTS.map(d => (
              <button key={d} onClick={() => setDept(d)} style={{ padding: "6px 14px", borderRadius: "8px", border: `1px solid ${dept === d ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.08)"}`, backgroundColor: dept === d ? "rgba(124,58,237,0.12)" : "transparent", color: dept === d ? "#a78bfa" : "#71717a", fontSize: "12px", fontWeight: dept === d ? 700 : 400, cursor: "pointer" }}>
                {d}
              </button>
            ))}
          </div>
        </div>

        {open.length === 0 && soon.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 24px", color: "#52525b" }}>
            <Briefcase style={{ width: "32px", height: "32px", margin: "0 auto 12px" }} />
            <p style={{ fontSize: "14px" }}>No roles match your search.</p>
          </div>
        )}

        {open.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
            {open.map(role => <RoleCard key={role.id} role={role} />)}
          </div>
        )}

        {soon.length > 0 && (
          <>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>Coming soon</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {soon.map(role => <RoleCard key={role.id} role={role} />)}
            </div>
          </>
        )}

        {/* No match / generic application */}
        <div style={{ marginTop: "40px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.07)", backgroundColor: "#111111", padding: "28px 32px", display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <p style={{ fontSize: "15px", fontWeight: 700, color: "#fafafa", marginBottom: "6px" }}>Don&apos;t see a perfect fit?</p>
            <p style={{ fontSize: "13px", color: "#71717a" }}>We&apos;re always open to exceptional people. Send us a note — we read every application.</p>
          </div>
          <a href="mailto:careers@trackhive.io" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "9px", backgroundColor: "#7C3AED", color: "white", fontSize: "13px", fontWeight: 600, textDecoration: "none", flexShrink: 0 }}>
            Get in touch <ArrowRight style={{ width: "13px", height: "13px" }} />
          </a>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "24px", display: "flex", gap: "24px", justifyContent: "center", flexWrap: "wrap" }}>
        {[{ l: "Home", h: "/" }, { l: "About", h: "/about" }, { l: "Blog", h: "/blog" }, { l: "Press", h: "/press" }].map(({ l, h }) => (
          <Link key={l} href={h} style={{ fontSize: "13px", color: "#52525b", textDecoration: "none" }}>{l}</Link>
        ))}
      </footer>
    </div>
  )
}

function RoleCard({ role }: { role: typeof ROLES[0] }) {
  const dimmed = role.status === "soon"
  return (
    <div style={{ borderRadius: "14px", border: "1px solid rgba(255,255,255,0.07)", backgroundColor: "#111111", padding: "22px 24px", opacity: dimmed ? 0.6 : 1 }}>
      <div style={{ display: "flex", gap: "12px", justifyContent: "space-between", flexWrap: "wrap", marginBottom: "10px" }}>
        <div>
          <p style={{ fontSize: "15px", fontWeight: 700, color: "#fafafa", marginBottom: "4px" }}>{role.title}</p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#71717a" }}>
              <MapPin style={{ width: "12px", height: "12px" }} /> {role.location}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#71717a" }}>
              <Clock style={{ width: "12px", height: "12px" }} /> {role.type}
            </span>
            <span style={{ fontSize: "12px", color: "#7C3AED", fontWeight: 600 }}>{role.dept}</span>
          </div>
        </div>
        {dimmed
          ? <span style={{ padding: "4px 10px", borderRadius: "6px", backgroundColor: "rgba(255,255,255,0.05)", fontSize: "11px", color: "#52525b", fontWeight: 700, height: "fit-content" }}>Soon</span>
          : <a href={`mailto:careers@trackhive.io?subject=Application: ${role.title}`} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "8px", backgroundColor: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.3)", color: "#a78bfa", fontSize: "12px", fontWeight: 600, textDecoration: "none", flexShrink: 0, height: "fit-content" }}>
              Apply <ArrowRight style={{ width: "12px", height: "12px" }} />
            </a>
        }
      </div>
      <p style={{ fontSize: "13px", color: "#a1a1aa", lineHeight: 1.6, marginBottom: "12px" }}>{role.desc}</p>
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {role.tags.map(t => (
          <span key={t} style={{ padding: "3px 8px", borderRadius: "5px", backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", fontSize: "11px", color: "#71717a" }}>{t}</span>
        ))}
      </div>
    </div>
  )
}
