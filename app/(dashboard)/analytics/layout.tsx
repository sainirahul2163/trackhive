"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const TABS = [
  { label: "Overview",          href: "/analytics/overview" },
  { label: "Accounts",          href: "/analytics" },
  { label: "Videos",            href: "/analytics/videos" },
  { label: "Tracking Options",  href: "/analytics/tracking-options" },
] as const

const TAB_PATHS = new Set([
  "/analytics",
  "/analytics/overview",
  "/analytics/videos",
  "/analytics/tracking-options",
])

function isTabActive(pathname: string, href: string): boolean {
  if (href === "/analytics") return pathname === "/analytics"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showSubNav = TAB_PATHS.has(pathname)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {showSubNav && (
        <nav
          aria-label="Analytics sections"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            paddingBottom: "0",
          }}
        >
          {TABS.map((tab) => {
            const active = isTabActive(pathname, tab.href)
            return (
              <Link
                key={tab.href}
                href={tab.href}
                style={{
                  position: "relative",
                  padding: "10px 16px",
                  fontSize: "14px",
                  fontWeight: 500,
                  textDecoration: "none",
                  color: active ? "#fafafa" : "#71717a",
                  transition: "color 150ms ease",
                  borderBottom: active ? "2px solid #7C3AED" : "2px solid transparent",
                  marginBottom: "-1px",
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.color = "#fafafa"
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.color = "#71717a"
                }}
              >
                {tab.label}
              </Link>
            )
          })}
        </nav>
      )}
      {children}
    </div>
  )
}
