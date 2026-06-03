"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home, Video, Megaphone, DollarSign, User,
  Zap, Bell, Menu, X, ChevronLeft, ChevronRight, LogOut,
} from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"

const NAV_ITEMS = [
  { href: "/creator",            label: "Home",          icon: Home       },
  { href: "/creator/videos",     label: "My Videos",     icon: Video      },
  { href: "/creator/campaigns",  label: "My Campaigns",  icon: Megaphone  },
  { href: "/creator/earnings",   label: "Earnings",      icon: DollarSign },
  { href: "/creator/profile",    label: "Profile",       icon: User       },
]

async function handleSignOut() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  await supabase.auth.signOut()
  window.location.href = "/login"
}

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [creatorName, setCreatorName] = useState("Creator")

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile) setMobileOpen(false)
    }
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  // Try to get the creator's name from Supabase
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    supabase.auth.getUser().then(({ data }) => {
      const meta = data?.user?.user_metadata
      const name = meta?.full_name ?? meta?.name ?? data?.user?.email?.split("@")[0] ?? "Creator"
      setCreatorName(name as string)
    }).catch(() => {})
  }, [])

  // Close mobile menu on navigation
  useEffect(() => { setMobileOpen(false) }, [pathname])

  const sidebarWidth = collapsed ? "60px" : "220px"
  const showSidebar = isMobile ? mobileOpen : true

  const sidebarStyle: React.CSSProperties = isMobile
    ? {
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        width: "220px",
        zIndex: 50,
        transform: showSidebar ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 280ms ease-in-out",
      }
    : {
        position: "relative",
        width: sidebarWidth,
        transition: "width 300ms ease-in-out",
        flexShrink: 0,
      }

  // Onboarding is a full-screen standalone experience — skip the shell
  if (pathname === "/creator/onboarding") {
    return <>{children}</>
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#0a0a0a" }}>

      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 40, backdropFilter: "blur(2px)" }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        ...sidebarStyle,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        backgroundColor: "#111111",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        overflow: "hidden",
      }}>
        {/* Logo area */}
        <div style={{ height: "56px", display: "flex", alignItems: "center", padding: "0 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0, gap: "10px" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "linear-gradient(135deg,#7C3AED,#6D28D9)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 0 12px rgba(124,58,237,0.4)" }}>
            <Zap style={{ width: "14px", height: "14px", color: "white" }} fill="white" />
          </div>
          {(!collapsed || isMobile) && (
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#fafafa", letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>
              TrackHive
            </span>
          )}
          {/* Creator pill */}
          {(!collapsed || isMobile) && (
            <span style={{ marginLeft: "auto", fontSize: "9px", fontWeight: 700, color: "#a78bfa", backgroundColor: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)", padding: "2px 6px", borderRadius: "4px", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
              Creator
            </span>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "8px 8px" }}>
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = href === "/creator" ? pathname === "/creator" : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: collapsed && !isMobile ? "10px" : "9px 10px",
                  borderRadius: "9px",
                  marginBottom: "2px",
                  textDecoration: "none",
                  transition: "background-color 150ms",
                  backgroundColor: isActive ? "rgba(124,58,237,0.12)" : "transparent",
                  justifyContent: collapsed && !isMobile ? "center" : "flex-start",
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)" }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent" }}
              >
                <Icon style={{ width: "16px", height: "16px", color: isActive ? "#a78bfa" : "#71717a", flexShrink: 0 }} />
                {(!collapsed || isMobile) && (
                  <span style={{ fontSize: "13px", fontWeight: isActive ? 600 : 400, color: isActive ? "#e4e4e7" : "#71717a", whiteSpace: "nowrap" }}>
                    {label}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom: sign out */}
        <div style={{ padding: "8px", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
          <button
            onClick={handleSignOut}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: collapsed && !isMobile ? "10px" : "9px 10px",
              borderRadius: "9px",
              width: "100%",
              border: "none",
              backgroundColor: "transparent",
              cursor: "pointer",
              justifyContent: collapsed && !isMobile ? "center" : "flex-start",
              transition: "background-color 150ms",
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <LogOut style={{ width: "15px", height: "15px", color: "#52525b", flexShrink: 0 }} />
            {(!collapsed || isMobile) && (
              <span style={{ fontSize: "13px", color: "#52525b", whiteSpace: "nowrap" }}>Sign out</span>
            )}
          </button>
        </div>

        {/* Desktop collapse toggle */}
        {!isMobile && (
          <button
            onClick={() => setCollapsed(c => !c)}
            style={{ position: "absolute", right: "-12px", top: "68px", width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10, color: "#71717a" }}
          >
            {collapsed
              ? <ChevronRight style={{ width: "12px", height: "12px" }} />
              : <ChevronLeft style={{ width: "12px", height: "12px" }} />}
          </button>
        )}

        {/* Mobile close button */}
        {isMobile && (
          <button
            onClick={() => setMobileOpen(false)}
            style={{ position: "absolute", top: "14px", right: "14px", padding: "6px", borderRadius: "8px", border: "none", backgroundColor: "rgba(255,255,255,0.06)", cursor: "pointer", display: "flex" }}
          >
            <X style={{ width: "14px", height: "14px", color: "#71717a" }} />
          </button>
        )}
      </aside>

      {/* Main column */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        {/* Topbar */}
        <header style={{ height: "56px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", backgroundColor: "#0a0a0a", gap: "12px" }}>
          {/* Left side: hamburger (mobile) or breadcrumb hint */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {isMobile && (
              <button
                onClick={() => setMobileOpen(true)}
                style={{ padding: "7px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "transparent", cursor: "pointer", display: "flex" }}
              >
                <Menu style={{ width: "16px", height: "16px", color: "#a1a1aa" }} />
              </button>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "26px", height: "26px", borderRadius: "8px", background: "linear-gradient(135deg,#7C3AED,#6D28D9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "white" }}>
                  {creatorName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#fafafa", lineHeight: 1 }}>{creatorName}</p>
                <p style={{ fontSize: "10px", color: "#52525b", marginTop: "2px" }}>Creator account</p>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {/* Notification bell */}
            <button
              style={{ position: "relative", width: "34px", height: "34px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
              <Bell style={{ width: "15px", height: "15px", color: "#71717a" }} />
              <span style={{ position: "absolute", top: "7px", right: "7px", width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#7C3AED", border: "1.5px solid #0a0a0a" }} />
            </button>

            {/* Switch to brand view link */}
            <Link
              href="/dashboard"
              style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "transparent", color: "#71717a", fontSize: "12px", textDecoration: "none", whiteSpace: "nowrap" }}
            >
              Brand view ↗
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {children}
        </main>
      </div>
    </div>
  )
}
