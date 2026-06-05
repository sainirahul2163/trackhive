"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useUser } from "@/lib/use-user"
import { fetchTrackedVideoCount } from "@/lib/analytics-queries"

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

/** Usage meters — import into sidebar when editable */
export function SidebarUsageMeters({ collapsed }: { collapsed: boolean }) {
  const { user } = useUser()
  const [videoCount, setVideoCount] = useState(0)

  useEffect(() => {
    if (!user) return
    fetchTrackedVideoCount(user.id).then(setVideoCount).catch(() => setVideoCount(0))
  }, [user])

  if (collapsed) return null

  return (
    <div style={{ padding: "12px 14px", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
      <UsageBar label="Tracked Videos" current={videoCount} max={1000} color="#7C3AED" />
      <UsageBar label="Free Trial" current={1} max={7} color="#f97316" href="/settings/billing" />
    </div>
  )
}
