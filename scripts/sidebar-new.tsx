// ============================================================
// DO NOT MODIFY THIS FILE - CRITICAL LAYOUT
// Background, width, and height are set via inline styles
// so they are never purged by Tailwind in production builds.
// ============================================================
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  BarChart3,
  Megaphone,
  CreditCard,
  TrendingUp,
  Swords,
  Users2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  Radio,
  FolderOpen,
  Sparkles,
  HelpCircle,
  Gift,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useUser } from "@/lib/use-user"
import { fetchTrackedVideoCount } from "@/lib/analytics-queries"

const navItems: { href: string; label: string; icon: React.ElementType; indent?: boolean }[] = [
  { href: "/dashboard",   label: "Dashboard",   icon: LayoutDashboard },
  { href: "/analytics",   label: "Analytics",   icon: BarChart3       },
  { href: "/analytics/tracking-options", label: "Tracking Options", icon: Radio, indent: true },
  { href: "/projects",    label: "Projects",    icon: FolderOpen      },
  { href: "/campaigns",   label: "Campaigns",   icon: Megaphone       },
  { href: "/payments",    label: "Payments",    icon: CreditCard      },
  { href: "/trends",      label: "Trends",      icon: TrendingUp      },
  { href: "/competitors", label: "Competitors", icon: Swords          },
  { href: "/discovery",   label: "Discovery",   icon: Users2          },
]

const moreItems = [
  { href: "/changelog", label: "What's new?", icon: Sparkles },
  { href: "/help",      label: "Support",     icon: HelpCircle },
  { href: "/affiliate", label: "Affiliate Portal", icon: Gift },
]

const bottomItems = [
  { href: "/settings", label: "Settings", icon: Settings },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

function UsageBar({ label, current, max, color, href }: {
  label: string; current: number; max: number; color: string; href?: string
}) {
  const pct = Math.min(100, Math.round((current / max) * 100))
  const inner = (
    <div style={{ marginBottom: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
        <span style={{ fontSize: "10px", color: "#71717a" }}>{label}</span>
        <span style={{ fontSize: "10px", color: "#a1a1aa" }}>{current} / {max}</span>
      </div>
      <div style={{ height: "4px", borderRadius: "2px", backgroundColor: "rgba(255,255,255,0.06)" }}>
        <div style={{ height: "4px", borderRadius: "2px", width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
  if (href) return <Link href={href} style={{ textDecoration: "none" }}>{inner}</Link>
  return inner
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useUser()
  const [videoCount, setVideoCount] = useState(0)

  useEffect(() => {
    if (!user) return
    fetchTrackedVideoCount(user.id).then(setVideoCount).catch(() => setVideoCount(0))
  }, [user])

  return (
    <aside
      style={{
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        width: collapsed ? "60px" : "220px",
        height: "100vh",
        backgroundColor: "#111111",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        position: "relative",
        transition: "width 300ms ease-in-out",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: "56px",
          padding: collapsed ? "0 16px" : "0 16px",
          justifyContent: collapsed ? "center" : "flex-start",
          gap: collapsed ? 0 : "10px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            flexShrink: 0,
            width: "28px",
            height: "28px",
            borderRadius: "8px",
            backgroundColor: "#7C3AED",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Zap className="w-4 h-4 text-white" fill="white" />
        </div>
        {!collapsed && (
          <span style={{ fontWeight: 600, fontSize: "15px", color: "#fff", letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>
            TrackHive
          </span>
        )}
      </div>

      <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {navItems.map((item) => {
            const Icon = item.icon
            const isTracking = item.href === "/analytics/tracking-options"
            const trackingActive = pathname.startsWith("/analytics/tracking-options")
            const isActive = isTracking
              ? trackingActive
              : item.href === "/analytics"
                ? pathname.startsWith("/analytics") && !trackingActive
                : pathname === item.href || pathname.startsWith(item.href + "/")

            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "8px 10px",
                  paddingLeft: item.indent && !collapsed ? "22px" : "10px",
                  borderRadius: "6px",
                  fontSize: item.indent ? "13px" : "14px",
                  fontWeight: 500,
                  textDecoration: "none",
                  justifyContent: collapsed ? "center" : "flex-start",
                  transition: "background-color 150ms, color 150ms",
                  backgroundColor: isActive ? "rgba(124,58,237,0.15)" : "transparent",
                  color: isActive ? "#a78bfa" : "#a1a1aa",
                  whiteSpace: "nowrap",
                }}
                className={cn(
                  "hover:bg-white/[0.05] hover:text-zinc-100",
                  isActive && "!text-purple-400"
                )}
              >
                <Icon
                  style={{ flexShrink: 0, width: "16px", height: "16px", color: isActive ? "#a78bfa" : "#71717a" }}
                />
                {!collapsed && <span>{item.label}</span>}
                {isActive && !collapsed && !item.indent && (
                  <div style={{ marginLeft: "auto", width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#a78bfa" }} />
                )}
              </Link>
            )
          })}
        </div>

        {!collapsed && (
          <div style={{ marginTop: "16px" }}>
            <p style={{ fontSize: "10px", fontWeight: 600, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em", padding: "0 10px", marginBottom: "6px" }}>More</p>
            {moreItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: 500,
                    textDecoration: "none",
                    color: isActive ? "#a78bfa" : "#a1a1aa",
                  }}
                  className="hover:bg-white/[0.05] hover:text-zinc-100"
                >
                  <Icon style={{ width: "16px", height: "16px", color: "#71717a" }} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        )}
      </nav>

      {!collapsed && (
        <div style={{ padding: "12px 14px", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
          <UsageBar label="Tracked Videos" current={videoCount} max={1000} color="#7C3AED" />
          <UsageBar label="Free Trial" current={1} max={7} color="#f97316" href="/settings/billing" />
        </div>
      )}

      <div
        style={{
          padding: "12px 8px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          gap: "2px",
        }}
      >
        {bottomItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "8px 10px",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: 500,
                textDecoration: "none",
                justifyContent: collapsed ? "center" : "flex-start",
                transition: "background-color 150ms, color 150ms",
                backgroundColor: isActive ? "rgba(124,58,237,0.15)" : "transparent",
                color: isActive ? "#a78bfa" : "#a1a1aa",
                whiteSpace: "nowrap",
              }}
              className="hover:bg-white/[0.05] hover:text-zinc-100"
            >
              <Icon
                style={{ flexShrink: 0, width: "16px", height: "16px", color: isActive ? "#a78bfa" : "#71717a" }}
              />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </div>

      <button
        onClick={onToggle}
        style={{
          position: "absolute",
          right: "-12px",
          top: "52px",
          width: "24px",
          height: "24px",
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.10)",
          backgroundColor: "#1a1a1a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#71717a",
          cursor: "pointer",
          zIndex: 10,
          transition: "color 150ms, border-color 150ms",
        }}
        className="hover:text-zinc-200 hover:border-white/20"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  )
}
