"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, BarChart3, Megaphone, CreditCard,
  TrendingUp, Swords, Settings, ChevronLeft, ChevronRight, Zap,
  Search, Bell,
} from "lucide-react"
import { DemoBanner } from "@/components/demo/demo-banner"
import { SignupGateModal } from "@/components/demo/signup-gate-modal"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/demo",             label: "Dashboard",   icon: LayoutDashboard },
  { href: "/demo/analytics",   label: "Analytics",   icon: BarChart3       },
  { href: "/demo/campaigns",   label: "Campaigns",   icon: Megaphone       },
  { href: "/demo/payments",    label: "Payments",    icon: CreditCard      },
  { href: "/demo/trends",      label: "Trends",      icon: TrendingUp      },
  { href: "/demo/competitors", label: "Competitors", icon: Swords          },
]

export function DemoShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const [gateOpen, setGateOpen] = useState(false)
  const [gateFeature, setGateFeature] = useState("this feature")

  function openGate(f: string) { setGateFeature(f); setGateOpen(true) }

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%", overflow: "hidden", backgroundColor: "#0a0a0a" }}>
      {/* Sidebar */}
      <aside
        style={{
          display: "flex", flexDirection: "column", flexShrink: 0,
          width: collapsed ? "60px" : "220px", height: "100vh",
          backgroundColor: "#111111", borderRight: "1px solid rgba(255,255,255,0.06)",
          position: "relative", transition: "width 300ms ease-in-out", overflow: "hidden",
        }}
      >
        {/* Logo */}
        <div style={{ height: "56px", display: "flex", alignItems: "center", padding: "0 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30">
              <Zap className="w-3.5 h-3.5 text-white" fill="white" />
            </div>
            {!collapsed && <span className="text-sm font-bold text-white tracking-tight whitespace-nowrap">TrackHive</span>}
          </div>
        </div>

        {/* Demo pill */}
        {!collapsed && (
          <div style={{ padding: "8px 12px 4px" }}>
            <div style={{ backgroundColor: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "6px", padding: "4px 8px", textAlign: "center" }}>
              <span style={{ fontSize: "10px", fontWeight: 600, color: "#fbbf24" }}>DEMO MODE</span>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/demo" && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-2 rounded-lg mb-0.5 transition-all text-sm font-medium whitespace-nowrap",
                  isActive ? "bg-purple-600/15 text-purple-300" : "text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04]"
                )}
              >
                <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-purple-400" : "text-zinc-500")} />
                {!collapsed && label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: "8px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <Link href="/settings" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04] transition-all text-sm font-medium whitespace-nowrap">
            <Settings className="w-4 h-4 flex-shrink-0" />
            {!collapsed && "Settings"}
          </Link>
        </div>

        {/* Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{ position: "absolute", right: "-12px", top: "72px", width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10 }}
          className="text-zinc-400 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* Main */}
      <div style={{ display: "flex", flexDirection: "column", flex: "1 1 0%", minWidth: 0, overflow: "hidden", backgroundColor: "#0a0a0a" }}>
        {/* Topbar */}
        <header style={{ height: "56px", flexShrink: 0, backgroundColor: "#0a0a0a", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", gap: "12px" }}>
          <button
            onClick={() => openGate("global search")}
            style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, maxWidth: "320px", height: "34px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.03)", padding: "0 12px", cursor: "pointer" }}
          >
            <Search style={{ width: "13px", height: "13px", color: "#52525b", flexShrink: 0 }} />
            <span style={{ fontSize: "13px", color: "#52525b", flex: 1, textAlign: "left" }}>Search creators, campaigns…</span>
            <kbd style={{ fontSize: "10px", padding: "1px 5px", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.1)", color: "#52525b", backgroundColor: "rgba(255,255,255,0.04)" }}>⌘K</kbd>
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "auto" }}>
            <button
              onClick={() => openGate("notifications")}
              style={{ position: "relative", width: "34px", height: "34px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
              <Bell style={{ width: "15px", height: "15px", color: "#71717a" }} />
              <span style={{ position: "absolute", top: "6px", right: "6px", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#ef4444", border: "1.5px solid #0a0a0a" }} />
            </button>

            <div style={{ width: "1px", height: "20px", backgroundColor: "rgba(255,255,255,0.08)" }} />

            <button
              onClick={() => openGate("account settings")}
              style={{ width: "30px", height: "30px", borderRadius: "50%", backgroundColor: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              title="Demo user"
            >
              <span style={{ fontSize: "10px", fontWeight: 700, color: "#a78bfa" }}>DM</span>
            </button>

            <div style={{ width: "1px", height: "20px", backgroundColor: "rgba(255,255,255,0.08)" }} />

            <Link href="/login" style={{ fontSize: "13px", color: "#71717a", textDecoration: "none", whiteSpace: "nowrap" }}>Sign in</Link>
            <Link href="/signup" style={{ padding: "7px 14px", borderRadius: "8px", backgroundColor: "#7C3AED", color: "white", fontSize: "12px", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>
              Sign Up Free
            </Link>
          </div>
        </header>

        <DemoBanner />

        <main style={{ flex: "1 1 0%", overflowY: "auto", padding: "24px", color: "#fafafa" }}>
          {children}
        </main>
      </div>

      <SignupGateModal open={gateOpen} onClose={() => setGateOpen(false)} feature={gateFeature} />
    </div>
  )
}
