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
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/trends", label: "Trends", icon: TrendingUp },
  { href: "/competitors", label: "Competitors", icon: Swords },
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
      className={cn(
        "relative flex flex-col h-full border-r transition-all duration-300 ease-in-out",
        "bg-[#111111] border-white/[0.06]",
        collapsed ? "w-[60px]" : "w-[220px]"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center h-14 px-4 border-b border-white/[0.06]",
        collapsed ? "justify-center" : "gap-2.5"
      )}>
        <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" fill="white" />
        </div>
        {!collapsed && (
          <span className="font-semibold text-[15px] text-white tracking-tight">
            TrackHive
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-2.5 py-2 rounded-md text-sm font-medium transition-all duration-150",
                collapsed ? "justify-center" : "",
                isActive
                  ? "bg-purple-600/15 text-purple-400"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.05]"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={cn(
                  "flex-shrink-0 w-4 h-4",
                  isActive ? "text-purple-400" : "text-zinc-500"
                )}
              />
              {!collapsed && <span>{item.label}</span>}
              {isActive && !collapsed && (
                <div className="ml-auto w-1 h-1 rounded-full bg-purple-400" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom items */}
      <div className="px-2 py-3 border-t border-white/[0.06] space-y-0.5">
        {bottomItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-2.5 py-2 rounded-md text-sm font-medium transition-all duration-150",
                collapsed ? "justify-center" : "",
                isActive
                  ? "bg-purple-600/15 text-purple-400"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.05]"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={cn(
                  "flex-shrink-0 w-4 h-4",
                  isActive ? "text-purple-400" : "text-zinc-500"
                )}
              />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className={cn(
          "absolute -right-3 top-[52px] w-6 h-6 rounded-full border border-white/10 bg-[#1a1a1a]",
          "flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:border-white/20 transition-all z-10"
        )}
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>
    </aside>
  )
}
