"use client"

import Link from "next/link"
import { useState } from "react"
import { X } from "lucide-react"

export function DemoBanner() {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null
  return (
    <div
      style={{
        backgroundColor: "rgba(245,158,11,0.12)",
        borderBottom: "1px solid rgba(245,158,11,0.25)",
        padding: "10px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        flexShrink: 0,
      }}
    >
      <p className="text-sm text-amber-300 font-medium">
        👋 You&apos;re viewing a demo. Data is simulated.{" "}
        <span className="text-amber-400/70 font-normal">Sign up free to use real data.</span>
      </p>
      <div className="flex items-center gap-3 flex-shrink-0">
        <Link
          href="/signup"
          className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-all whitespace-nowrap"
        >
          Sign Up Free
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-500/60 hover:text-amber-400 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
