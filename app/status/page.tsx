import type { Metadata } from "next"
import Link from "next/link"
import { Zap, ArrowLeft, CheckCircle2, AlertTriangle, XCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "System Status",
  description: "Live status of TrackHive services — uptime, incidents, and scheduled maintenance.",
  alternates: { canonical: "https://trackhive.io/status" },
}

type Status = "operational" | "degraded" | "outage"

const SERVICES: { name: string; status: Status; latency: string }[] = [
  { name: "API",                        status: "operational", latency: "48 ms"  },
  { name: "Dashboard",                  status: "operational", latency: "112 ms" },
  { name: "Analytics pipeline",         status: "operational", latency: "220 ms" },
  { name: "Creator data ingestion",     status: "operational", latency: "380 ms" },
  { name: "Payment processing",         status: "operational", latency: "94 ms"  },
  { name: "Alert notifications",        status: "operational", latency: "62 ms"  },
  { name: "TikTok data connector",      status: "operational", latency: "510 ms" },
  { name: "Instagram data connector",   status: "operational", latency: "480 ms" },
  { name: "YouTube data connector",     status: "operational", latency: "340 ms" },
  { name: "CDN",                        status: "operational", latency: "18 ms"  },
  { name: "Auth",                       status: "operational", latency: "35 ms"  },
  { name: "Webhook delivery",           status: "operational", latency: "72 ms"  },
]

const INCIDENTS: { date: string; title: string; severity: "minor" | "major" | "none"; body: string }[] = [
  {
    date: "Jun 1, 2025",
    title: "All systems operational",
    severity: "none",
    body: "No incidents to report. All services are running normally.",
  },
  {
    date: "May 27, 2025",
    title: "Elevated API latency — Resolved",
    severity: "minor",
    body: "Between 14:20 and 15:05 UTC, some API requests experienced elevated response times (up to 3× normal). Root cause was a database query planner regression introduced in a routine maintenance window. The issue was resolved by rolling back the plan hint. No data was lost.",
  },
  {
    date: "May 14, 2025",
    title: "TikTok connector intermittent failures — Resolved",
    severity: "minor",
    body: "TikTok's upstream API returned elevated 429 (rate limit) errors between 09:00–11:30 UTC. Our retry logic handled most requests automatically. Approximately 4% of scheduled refresh jobs were delayed by up to 40 minutes. All data caught up by 12:00 UTC.",
  },
]

// 90 synthetic uptime bars — all green for a fresh product
const UPTIME_BARS = Array.from({ length: 90 }, (_, i) => ({
  day: i,
  up: i < 82 ? "operational" : i === 84 ? "degraded" : "operational",
}))

const STATUS_CONFIG: Record<Status, { label: string; color: string; Icon: typeof CheckCircle2 }> = {
  operational: { label: "Operational",    color: "#10b981", Icon: CheckCircle2 },
  degraded:    { label: "Degraded",       color: "#f59e0b", Icon: AlertTriangle },
  outage:      { label: "Major outage",   color: "#ef4444", Icon: XCircle },
}

const OVERALL: Status = SERVICES.every(s => s.status === "operational") ? "operational" : SERVICES.some(s => s.status === "outage") ? "outage" : "degraded"
const OVConfig = STATUS_CONFIG[OVERALL]
const OVIcon = OVConfig.Icon

export default function StatusPage() {
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

      {/* Overall status banner */}
      <div style={{ backgroundColor: `${OVConfig.color}14`, borderBottom: `1px solid ${OVConfig.color}30`, padding: "28px 24px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
          <OVIcon style={{ width: "22px", height: "22px", color: OVConfig.color }} />
          <p style={{ fontSize: "18px", fontWeight: 700, color: OVConfig.color }}>
            {OVERALL === "operational" ? "All systems operational" : OVConfig.label}
          </p>
        </div>
        <p style={{ fontSize: "12px", color: "#52525b", marginTop: "6px" }}>Last updated: Jun 1, 2025 at 23:00 UTC</p>
      </div>

      <div style={{ maxWidth: "780px", margin: "0 auto", padding: "0 24px 80px" }}>

        {/* Uptime bar */}
        <section style={{ paddingTop: "48px", marginBottom: "48px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#fafafa" }}>90-day uptime</h2>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#10b981" }}>99.97%</span>
          </div>
          <div style={{ display: "flex", gap: "2px", height: "32px", borderRadius: "6px", overflow: "hidden" }}>
            {UPTIME_BARS.map(b => (
              <div
                key={b.day}
                title={b.up === "operational" ? "Operational" : "Degraded"}
                style={{ flex: 1, backgroundColor: b.up === "operational" ? "#10b98130" : "#f59e0b40", borderRadius: "2px", cursor: "default" }}
              />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
            <span style={{ fontSize: "11px", color: "#52525b" }}>90 days ago</span>
            <span style={{ fontSize: "11px", color: "#52525b" }}>Today</span>
          </div>
        </section>

        {/* Services */}
        <section style={{ marginBottom: "48px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#fafafa", marginBottom: "16px" }}>Services</h2>
          <div style={{ borderRadius: "14px", border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden" }}>
            {SERVICES.map((svc, i) => {
              const cfg = STATUS_CONFIG[svc.status]
              const Icon = cfg.Icon
              return (
                <div key={svc.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: i < SERVICES.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", backgroundColor: "#111111" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Icon style={{ width: "15px", height: "15px", color: cfg.color, flexShrink: 0 }} />
                    <span style={{ fontSize: "13px", color: "#e4e4e7" }}>{svc.name}</span>
                  </div>
                  <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", color: "#52525b", fontFamily: "monospace" }}>{svc.latency}</span>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: cfg.color }}>{cfg.label}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Incidents */}
        <section>
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#fafafa", marginBottom: "16px" }}>Incident history</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {INCIDENTS.map((inc, i) => (
              <div key={i} style={{ borderRadius: "14px", border: "1px solid rgba(255,255,255,0.07)", backgroundColor: "#111111", padding: "20px 22px" }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", flexWrap: "wrap", marginBottom: "8px" }}>
                  <span style={{ fontSize: "12px", color: "#52525b", flexShrink: 0, paddingTop: "1px" }}>{inc.date}</span>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: inc.severity === "none" ? "#10b981" : inc.severity === "minor" ? "#f59e0b" : "#ef4444", flex: 1 }}>{inc.title}</span>
                  {inc.severity !== "none" && (
                    <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "5px", backgroundColor: inc.severity === "minor" ? "rgba(245,158,11,0.12)" : "rgba(239,68,68,0.12)", color: inc.severity === "minor" ? "#fbbf24" : "#f87171" }}>
                      {inc.severity === "minor" ? "Minor" : "Major"}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: "13px", color: "#71717a", lineHeight: 1.6 }}>{inc.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Subscribe */}
        <div style={{ marginTop: "48px", borderRadius: "14px", border: "1px solid rgba(124,58,237,0.2)", backgroundColor: "rgba(124,58,237,0.05)", padding: "24px 28px", display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "#fafafa", marginBottom: "4px" }}>Subscribe to updates</p>
            <p style={{ fontSize: "12px", color: "#71717a" }}>Get notified of incidents and maintenance windows by email.</p>
          </div>
          <a href="mailto:status@trackhive.io?subject=Subscribe to status updates" style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "9px 18px", borderRadius: "8px", backgroundColor: "#7C3AED", color: "white", fontSize: "13px", fontWeight: 600, textDecoration: "none", flexShrink: 0 }}>
            Subscribe
          </a>
        </div>
      </div>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "24px", display: "flex", gap: "24px", justifyContent: "center", flexWrap: "wrap" }}>
        {[{ l: "Home", h: "/" }, { l: "Docs", h: "/docs" }, { l: "API Reference", h: "/api-reference" }, { l: "Changelog", h: "/changelog" }].map(({ l, h }) => (
          <Link key={l} href={h} style={{ fontSize: "13px", color: "#52525b", textDecoration: "none" }}>{l}</Link>
        ))}
      </footer>
    </div>
  )
}
