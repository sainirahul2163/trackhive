"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Search, LayoutDashboard, BarChart3, Megaphone,
  CreditCard, TrendingUp, Swords, Settings, Bell,
  ArrowRight, Clock, Hash, X,
} from "lucide-react"

/* ─── Static navigation items ──────────────────────── */
const NAV_ITEMS = [
  { id: "nav-dashboard",    label: "Dashboard",     href: "/dashboard",    icon: LayoutDashboard, group: "Pages" },
  { id: "nav-analytics",   label: "Analytics",     href: "/analytics",    icon: BarChart3,       group: "Pages" },
  { id: "nav-campaigns",   label: "Campaigns",     href: "/campaigns",    icon: Megaphone,       group: "Pages" },
  { id: "nav-payments",    label: "Payments",       href: "/payments",     icon: CreditCard,      group: "Pages" },
  { id: "nav-trends",      label: "Trends",         href: "/trends",       icon: TrendingUp,      group: "Pages" },
  { id: "nav-competitors", label: "Competitors",    href: "/competitors",  icon: Swords,          group: "Pages" },
  { id: "nav-settings",    label: "Settings",       href: "/settings",     icon: Settings,        group: "Pages" },
  { id: "nav-notifs",      label: "Notifications",  href: "/notifications",icon: Bell,            group: "Pages" },
]

const ALL_ITEMS = [...NAV_ITEMS]

type SearchItem = (typeof ALL_ITEMS)[number] & { sub?: string }

/* ─── Recent searches (in-memory) ──────────────────── */
const recentIds: string[] = []

function addRecent(id: string) {
  const idx = recentIds.indexOf(id)
  if (idx !== -1) recentIds.splice(idx, 1)
  recentIds.unshift(id)
  if (recentIds.length > 4) recentIds.pop()
}

/* ─── Component ─────────────────────────────────────── */
export function CmdKSearch() {
  const router = useRouter()
  const [open, setOpen]     = useState(false)
  const [query, setQuery]   = useState("")
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  /* Global shortcut listener */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen(prev => !prev)
      }
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  /* Focus input when opened */
  useEffect(() => {
    if (open) {
      setQuery("")
      setCursor(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const q = query.trim().toLowerCase()
  const results: SearchItem[] = q
    ? ALL_ITEMS.filter(item => {
        const sub = (item as { sub?: string }).sub ?? ""
        return (
          item.label.toLowerCase().includes(q) ||
          item.group.toLowerCase().includes(q) ||
          sub.toLowerCase().includes(q)
        )
      })
    : ALL_ITEMS.filter(item => recentIds.includes(item.id)).slice(0, 5)

  const grouped = results.reduce<Record<string, SearchItem[]>>((acc, item) => {
    acc[item.group] = acc[item.group] ?? []
    acc[item.group].push(item)
    return acc
  }, {})

  const flat = Object.values(grouped).flat()

  const navigate = useCallback((item: SearchItem) => {
    addRecent(item.id)
    setOpen(false)
    router.push(item.href)
  }, [router])

  /* Keyboard nav */
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setCursor(c => Math.min(c + 1, flat.length - 1)) }
    if (e.key === "ArrowUp")   { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)) }
    if (e.key === "Enter" && flat[cursor]) navigate(flat[cursor])
  }

  if (!open) return null

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        backgroundColor: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        paddingTop: "15vh",
        paddingLeft: "16px", paddingRight: "16px",
      }}
      onClick={() => setOpen(false)}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: "560px",
          backgroundColor: "#111111",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: "16px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          overflow: "hidden",
        }}
      >
        {/* Input */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <Search style={{ width: "18px", height: "18px", color: "#71717a", flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setCursor(0) }}
            onKeyDown={onKeyDown}
            placeholder="Search pages, creators, campaigns…"
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              fontSize: "15px", color: "#fafafa",
            }}
          />
          {query && (
            <button onClick={() => setQuery("")} style={{ color: "#52525b", cursor: "pointer" }}>
              <X style={{ width: "16px", height: "16px" }} />
            </button>
          )}
          <kbd style={{ fontSize: "11px", color: "#52525b", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "5px", padding: "2px 6px" }}>
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight: "380px", overflowY: "auto" }}>
          {flat.length === 0 && query && (
            <div style={{ padding: "32px 16px", textAlign: "center", color: "#52525b" }}>
              <Hash style={{ width: "24px", height: "24px", margin: "0 auto 8px" }} />
              <p style={{ fontSize: "14px" }}>No results for &ldquo;{query}&rdquo;</p>
            </div>
          )}

          {flat.length === 0 && !query && (
            <div style={{ padding: "32px 16px", textAlign: "center", color: "#52525b" }}>
              <Clock style={{ width: "20px", height: "20px", margin: "0 auto 8px" }} />
              <p style={{ fontSize: "13px" }}>Start typing to search…</p>
            </div>
          )}

          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <div style={{ padding: "8px 16px 4px", fontSize: "11px", fontWeight: 600, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {group}
              </div>
              {items.map(item => {
                const globalIdx = flat.indexOf(item)
                const isActive = globalIdx === cursor
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item)}
                    onMouseEnter={() => setCursor(globalIdx)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: "12px",
                      padding: "9px 16px", textAlign: "left", cursor: "pointer",
                      backgroundColor: isActive ? "rgba(124,58,237,0.12)" : "transparent",
                      border: "none",
                      transition: "background-color 120ms",
                    }}
                  >
                    <div style={{
                      width: "30px", height: "30px", borderRadius: "8px",
                      backgroundColor: isActive ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.04)",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <Icon style={{ width: "14px", height: "14px", color: isActive ? "#a78bfa" : "#71717a" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "13px", fontWeight: 500, color: isActive ? "#fafafa" : "#d4d4d8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.label}
                      </p>
                      {"sub" in item && item.sub && (
                        <p style={{ fontSize: "11px", color: "#71717a", marginTop: "1px" }}>{item.sub}</p>
                      )}
                    </div>
                    {isActive && <ArrowRight style={{ width: "14px", height: "14px", color: "#7C3AED", flexShrink: 0 }} />}
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: "10px 16px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "16px" }}>
          {[
            { keys: ["↑", "↓"], label: "navigate" },
            { keys: ["↵"],      label: "open" },
            { keys: ["ESC"],    label: "close" },
          ].map(hint => (
            <div key={hint.label} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              {hint.keys.map(k => (
                <kbd key={k} style={{ fontSize: "10px", color: "#52525b", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "4px", padding: "1px 5px" }}>{k}</kbd>
              ))}
              <span style={{ fontSize: "11px", color: "#52525b" }}>{hint.label}</span>
            </div>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "4px" }}>
            <kbd style={{ fontSize: "10px", color: "#52525b", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "4px", padding: "1px 5px" }}>⌘K</kbd>
            <span style={{ fontSize: "11px", color: "#52525b" }}>to toggle</span>
          </div>
        </div>
      </div>
    </div>
  )
}
