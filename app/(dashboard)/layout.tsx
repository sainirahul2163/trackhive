// ============================================================
// DO NOT MODIFY THIS FILE - CRITICAL LAYOUT
// All layout properties use inline styles intentionally.
// Tailwind classes for structural/color properties are NOT
// used here because they can be purged in production builds.
// ============================================================
"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100%",
        overflow: "hidden",
        backgroundColor: "#0a0a0a",
        position: "relative",
      }}
    >
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: "1 1 0%",
          minWidth: 0,
          overflow: "hidden",
          backgroundColor: "#0a0a0a",
        }}
      >
        <Topbar />
        <main
          style={{
            flex: "1 1 0%",
            overflowY: "auto",
            padding: "24px",
            color: "#fafafa",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
