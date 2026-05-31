// ============================================================
// DO NOT MODIFY THIS FILE - CRITICAL LAYOUT
// Background, width, and height are set via inline styles
// so they are never purged by Tailwind in production builds.
// ============================================================
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  BarChart3,
  Megaphone,
  CreditCard,
  TrendingUp,
  Swords,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard",   label: "Dashboard",   icon: LayoutDashboard },
  { href: "/analytics",   label: "Analytics",   icon: BarChart3       },
  { href: "/campaigns",   label: "Campaigns",   icon: Megaphone       },
  { href: "/payments",    label: "Payments",    icon: CreditCard      },
  { href: "/trends",      label: "Trends",      icon: TrendingUp      },
  { href: "/competitors", label: "Competitors", icon: Swords          },
]

const bottomItems = [
  { href: "/settings", label: "Settings", icon: Settings },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      style={{
        /* ── Critical structural styles — inline so they're never purged ── */
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
      {/* Logo */}
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

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {navItems.map((item) => {
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
                className={cn(
                  "hover:bg-white/[0.05] hover:text-zinc-100",
                  isActive && "!text-purple-400"
                )}
              >
                <Icon
                  style={{ flexShrink: 0, width: "16px", height: "16px", color: isActive ? "#a78bfa" : "#71717a" }}
                />
                {!collapsed && <span>{item.label}</span>}
                {isActive && !collapsed && (
                  <div style={{ marginLeft: "auto", width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#a78bfa" }} />
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom items */}
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
          const isActive = pathname === item.href

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

      {/* Collapse toggle */}
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
