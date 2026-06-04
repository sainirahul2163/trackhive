"use client"

import { ArrowLeft } from "lucide-react"

export function BackButton() {
  return (
    <button
      onClick={() => window.history.back()}
      style={{
        display: "flex", alignItems: "center", gap: "8px",
        padding: "10px 20px", borderRadius: "10px",
        backgroundColor: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
        color: "#a1a1aa", fontSize: "14px", fontWeight: 500,
        cursor: "pointer",
      }}
    >
      <ArrowLeft style={{ width: "16px", height: "16px" }} />
      Go back
    </button>
  )
}
