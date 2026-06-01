"use client"
import Link from "next/link"
import { useState } from "react"
import { Zap, ArrowLeft, Copy, Check, ChevronRight } from "lucide-react"

const BASE = "https://api.trackhive.io/v1"

interface RouteParam { name: string; type: string; req: boolean; desc: string }
interface Route {
  method: string
  path: string
  title: string
  desc: string
  params?: RouteParam[]
  body?: RouteParam[]
  response?: string
}

const ENDPOINTS = [
  {
    group: "Creators",
    color: "#7C3AED",
    routes: [
      {
        method: "GET", path: "/creators", title: "List tracked creators",
        desc: "Returns a paginated list of all creators currently tracked in your workspace.",
        params: [{ name: "limit", type: "integer", req: false, desc: "Number of results per page (default 50, max 200)" }, { name: "offset", type: "integer", req: false, desc: "Pagination offset" }, { name: "platform", type: "string", req: false, desc: "Filter by platform: tiktok | instagram | youtube" }],
        response: `{\n  "data": [\n    {\n      "id": "crt_01j9z...",\n      "username": "@sophiatheclip",\n      "platform": "tiktok",\n      "followers": 1240000,\n      "avg_views": 84200,\n      "virality_score": 8.2,\n      "tracked_at": "2025-06-01T09:00:00Z"\n    }\n  ],\n  "meta": { "total": 142, "limit": 50, "offset": 0 }\n}`,
      },
      {
        method: "POST", path: "/creators", title: "Add a creator",
        desc: "Start tracking a new creator by handle and platform.",
        body: [{ name: "username", type: "string", req: true, desc: "Creator's @handle (without @)" }, { name: "platform", type: "string", req: true, desc: "Platform: tiktok | instagram | youtube | pinterest" }],
        response: `{\n  "data": {\n    "id": "crt_01j9z...",\n    "username": "@newcreator",\n    "platform": "instagram",\n    "followers": 320000,\n    "tracked_at": "2025-06-02T10:00:00Z"\n  }\n}`,
      },
      {
        method: "DELETE", path: "/creators/:id", title: "Remove a creator",
        desc: "Stop tracking a creator and remove their data from your workspace.",
        params: [{ name: "id", type: "string", req: true, desc: "Creator ID from the list endpoint" }],
        response: `{ "deleted": true, "id": "crt_01j9z..." }`,
      },
    ],
  },
  {
    group: "Analytics",
    color: "#3b82f6",
    routes: [
      {
        method: "GET", path: "/creators/:id/analytics", title: "Get creator analytics",
        desc: "Detailed time-series analytics for a tracked creator.",
        params: [{ name: "id", type: "string", req: true, desc: "Creator ID" }, { name: "range", type: "string", req: false, desc: "Time range: 7d | 30d | 90d (default 30d)" }],
        response: `{\n  "data": {\n    "views": [{ "date": "2025-06-01", "value": 84200 }],\n    "followers": [{ "date": "2025-06-01", "value": 1240000 }],\n    "engagement_rate": 4.3\n  }\n}`,
      },
      {
        method: "GET", path: "/creators/:id/videos", title: "List creator videos",
        desc: "Returns tracked videos for a creator, sorted by views descending.",
        params: [{ name: "id", type: "string", req: true, desc: "Creator ID" }, { name: "limit", type: "integer", req: false, desc: "Max results (default 20)" }],
        response: `{\n  "data": [\n    {\n      "id": "vid_abc...",\n      "title": "Day in my life...",\n      "views": 2400000,\n      "likes": 184000,\n      "posted_at": "2025-05-28T14:30:00Z"\n    }\n  ]\n}`,
      },
    ],
  },
  {
    group: "Campaigns",
    color: "#10b981",
    routes: [
      {
        method: "GET", path: "/campaigns", title: "List campaigns",
        desc: "Returns all campaigns in your workspace.",
        response: `{\n  "data": [\n    {\n      "id": "cmp_abc...",\n      "name": "Summer Drop 2025",\n      "status": "active",\n      "creator_count": 24,\n      "budget": 50000,\n      "spent": 32500\n    }\n  ]\n}`,
      },
      {
        method: "POST", path: "/campaigns", title: "Create a campaign",
        desc: "Create a new campaign brief.",
        body: [{ name: "name", type: "string", req: true, desc: "Campaign name" }, { name: "budget", type: "number", req: true, desc: "Total budget in USD" }, { name: "start_date", type: "string", req: false, desc: "ISO 8601 date string" }],
        response: `{\n  "data": {\n    "id": "cmp_new...",\n    "name": "Fall Campaign",\n    "status": "draft",\n    "created_at": "2025-06-01T12:00:00Z"\n  }\n}`,
      },
    ],
  },
  {
    group: "Payouts",
    color: "#f59e0b",
    routes: [
      {
        method: "GET", path: "/payouts", title: "List payouts",
        desc: "Returns payout history for your workspace.",
        params: [{ name: "status", type: "string", req: false, desc: "Filter: pending | processing | completed | failed" }],
        response: `{\n  "data": [\n    {\n      "id": "pay_abc...",\n      "creator": "@sophiatheclip",\n      "amount": 2500,\n      "currency": "USD",\n      "status": "completed",\n      "paid_at": "2025-06-01T15:00:00Z"\n    }\n  ]\n}`,
      },
      {
        method: "POST", path: "/payouts", title: "Trigger a payout",
        desc: "Manually initiate a payout to a creator.",
        body: [{ name: "creator_id", type: "string", req: true, desc: "Creator ID" }, { name: "amount", type: "number", req: true, desc: "Amount in USD" }, { name: "note", type: "string", req: false, desc: "Optional memo" }],
        response: `{\n  "data": {\n    "id": "pay_new...",\n    "status": "pending",\n    "estimated_arrival": "2025-06-03"\n  }\n}`,
      },
    ],
  },
]

const METHOD_COLOR: Record<string, string> = {
  GET: "#10b981",
  POST: "#3b82f6",
  PUT: "#f59e0b",
  PATCH: "#f59e0b",
  DELETE: "#ef4444",
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button onClick={copy} style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 10px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.03)", color: copied ? "#10b981" : "#71717a", fontSize: "11px", cursor: "pointer" }}>
      {copied ? <Check style={{ width: "11px", height: "11px" }} /> : <Copy style={{ width: "11px", height: "11px" }} />}
      {copied ? "Copied" : "Copy"}
    </button>
  )
}

export default function ApiReferencePage() {
  const [activeGroup, setActiveGroup] = useState("Creators")
  const [openRoute, setOpenRoute] = useState<string | null>("GET /creators")

  const group = ENDPOINTS.find(g => g.group === activeGroup)!

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
          <Link href="/docs" style={{ fontSize: "13px", color: "#71717a", textDecoration: "none" }}>Docs</Link>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#71717a", textDecoration: "none" }}>
            <ArrowLeft style={{ width: "13px", height: "13px" }} /> Back
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "48px 24px 40px", background: "linear-gradient(180deg, rgba(124,58,237,0.06) 0%, transparent 100%)" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#7C3AED", textTransform: "uppercase", letterSpacing: "0.08em" }}>API Reference</span>
          <h1 style={{ fontSize: "clamp(24px,4vw,40px)", fontWeight: 800, color: "#fafafa", margin: "10px 0 12px", lineHeight: 1.15 }}>TrackHive REST API</h1>
          <p style={{ fontSize: "15px", color: "#71717a", lineHeight: 1.7, marginBottom: "24px" }}>
            Base URL: <code style={{ fontFamily: "monospace", backgroundColor: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: "5px", color: "#a78bfa", fontSize: "13px" }}>{BASE}</code>
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <div style={{ borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "#111111", padding: "12px 18px" }}>
              <p style={{ fontSize: "11px", color: "#71717a", marginBottom: "4px" }}>Authentication</p>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "#fafafa" }}>Bearer token via <code style={{ fontFamily: "monospace", fontSize: "12px", color: "#a78bfa" }}>Authorization</code> header</p>
            </div>
            <div style={{ borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "#111111", padding: "12px 18px" }}>
              <p style={{ fontSize: "11px", color: "#71717a", marginBottom: "4px" }}>Rate limit</p>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "#fafafa" }}>1,000 req / minute per workspace</p>
            </div>
            <div style={{ borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "#111111", padding: "12px 18px" }}>
              <p style={{ fontSize: "11px", color: "#71717a", marginBottom: "4px" }}>Format</p>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "#fafafa" }}>JSON (application/json)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px 80px", display: "flex", gap: "32px", alignItems: "flex-start" }}>

        {/* Sidebar */}
        <aside style={{ width: "180px", flexShrink: 0, position: "sticky", top: "80px", paddingTop: "32px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "10px" }}>Resources</p>
          {ENDPOINTS.map(g => (
            <button key={g.group} onClick={() => setActiveGroup(g.group)}
              style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "8px 10px", borderRadius: "8px", border: "none", backgroundColor: activeGroup === g.group ? "rgba(124,58,237,0.1)" : "transparent", cursor: "pointer", marginBottom: "2px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: g.color, flexShrink: 0 }} />
              <span style={{ fontSize: "13px", color: activeGroup === g.group ? "#fafafa" : "#71717a", fontWeight: activeGroup === g.group ? 700 : 400 }}>{g.group}</span>
            </button>
          ))}
        </aside>

        {/* Main */}
        <main style={{ flex: 1, minWidth: 0, paddingTop: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: group.color }} />
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#fafafa" }}>{group.group}</h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {(group.routes as Route[]).map(route => {
              const key = `${route.method} ${route.path}`
              const open = openRoute === key
              return (
                <div key={key} style={{ borderRadius: "14px", border: `1px solid ${open ? "rgba(124,58,237,0.25)" : "rgba(255,255,255,0.07)"}`, backgroundColor: open ? "rgba(124,58,237,0.03)" : "#111111", overflow: "hidden" }}>
                  <button onClick={() => setOpenRoute(open ? null : key)}
                    style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", padding: "16px 20px", backgroundColor: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
                    <span style={{ padding: "3px 8px", borderRadius: "6px", backgroundColor: `${METHOD_COLOR[route.method]}18`, border: `1px solid ${METHOD_COLOR[route.method]}30`, fontSize: "11px", fontWeight: 800, color: METHOD_COLOR[route.method], fontFamily: "monospace", flexShrink: 0 }}>
                      {route.method}
                    </span>
                    <code style={{ fontSize: "13px", color: "#a1a1aa", fontFamily: "monospace", flex: 1 }}>{route.path}</code>
                    <span style={{ fontSize: "13px", color: "#71717a", flex: 2 }}>{route.title}</span>
                    <ChevronRight style={{ width: "14px", height: "14px", color: "#52525b", transform: open ? "rotate(90deg)" : "none", transition: "transform 200ms", flexShrink: 0 }} />
                  </button>

                  {open && (
                    <div style={{ padding: "0 20px 20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                      <p style={{ fontSize: "13px", color: "#a1a1aa", lineHeight: 1.6, marginTop: "16px", marginBottom: "16px" }}>{route.desc}</p>

                      {/* Params / Body */}
                      {(route.params || route.body) && (
                        <div style={{ marginBottom: "16px" }}>
                          <p style={{ fontSize: "12px", fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px" }}>
                            {route.params ? "Parameters" : "Request body"}
                          </p>
                          <div style={{ borderRadius: "10px", border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden" }}>
                            {(route.params ?? route.body ?? []).map((p, i, arr) => (
                              <div key={p.name} style={{ display: "flex", gap: "12px", padding: "10px 14px", borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", flexWrap: "wrap" }}>
                                <code style={{ fontSize: "12px", color: "#a78bfa", fontFamily: "monospace", flexShrink: 0 }}>{p.name}</code>
                                <span style={{ fontSize: "11px", color: "#52525b", fontFamily: "monospace" }}>{p.type}</span>
                                {p.req && <span style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "4px", backgroundColor: "rgba(239,68,68,0.1)", color: "#f87171", fontWeight: 700 }}>required</span>}
                                <span style={{ fontSize: "12px", color: "#71717a", flex: 1, minWidth: "160px" }}>{p.desc}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Response */}
                      {route.response && (
                        <div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                            <p style={{ fontSize: "12px", fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.07em" }}>Response</p>
                            <CopyButton text={route.response} />
                          </div>
                          <pre style={{ backgroundColor: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px", padding: "16px", fontSize: "12px", color: "#a1a1aa", fontFamily: "monospace", overflowX: "auto", margin: 0, lineHeight: 1.6 }}>
                            {route.response}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Auth example */}
          <div style={{ marginTop: "40px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.07)", backgroundColor: "#111111", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
              <p style={{ fontSize: "14px", fontWeight: 700, color: "#fafafa" }}>Authentication example</p>
              <CopyButton text={`curl ${BASE}/creators \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json"`} />
            </div>
            <pre style={{ backgroundColor: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px", padding: "16px", fontSize: "12px", color: "#a1a1aa", fontFamily: "monospace", overflowX: "auto", margin: 0, lineHeight: 1.7 }}>
{`curl ${BASE}/creators \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
            </pre>
            <p style={{ fontSize: "12px", color: "#52525b", marginTop: "10px" }}>
              Get your API key from <Link href="/dashboard/settings" style={{ color: "#a78bfa", textDecoration: "none" }}>Settings → API</Link>
            </p>
          </div>
        </main>
      </div>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "24px", display: "flex", gap: "24px", justifyContent: "center", flexWrap: "wrap" }}>
        {[{ l: "Home", h: "/" }, { l: "Docs", h: "/docs" }, { l: "Changelog", h: "/changelog" }, { l: "Status", h: "/status" }].map(({ l, h }) => (
          <Link key={l} href={h} style={{ fontSize: "13px", color: "#52525b", textDecoration: "none" }}>{l}</Link>
        ))}
      </footer>
    </div>
  )
}
