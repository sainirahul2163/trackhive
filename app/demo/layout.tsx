"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, BarChart3, Megaphone, CreditCard,
  TrendingUp, Swords, Settings, ChevronLeft, ChevronRight, Zap,
} from "lucide-react"
import { DemoBanner } from "@/components/demo/demo-banner"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/demo",            label: "Dashboard",   icon: LayoutDashboard },
  { href: "/demo/analytics",  label: "Analytics",   icon: BarChart3       },
  { href: "/demo/campaigns",  label: "Campaigns",   icon: Megaphone       },
  { href: "/demo/payments",   label: "Payments",    icon: CreditCard      },
  { href: "/demo/trends",     label: "Trends",      icon: TrendingUp      },
  { href: "/demo/competitors",label: "Competitors", icon: Swords          },
]

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

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
        <header style={{ height: "56px", flexShrink: 0, backgroundColor: "#0a0a0a", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px" }}>
          <span className="text-sm text-zinc-500">Demo workspace</span>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">Sign in</Link>
            <Link href="/signup" className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-all">
              Sign Up Free
            </Link>
          </div>
        </header>

        {/* Demo banner */}
        <DemoBanner />

        {/* Content */}
        <main style={{ flex: "1 1 0%", overflowY: "auto", padding: "24px", color: "#fafafa" }}>
          {children}
        </main>
      </div>
    </div>
  )
}
