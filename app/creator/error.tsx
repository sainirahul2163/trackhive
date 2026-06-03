"use client"

import { useEffect } from "react"
import { AlertTriangle } from "lucide-react"

export default function CreatorError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[creator] error:", error)
  }, [error])

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", textAlign: "center", padding: "24px" }}>
      <div style={{ width: "52px", height: "52px", borderRadius: "14px", backgroundColor: "rgba(248,113,113,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
        <AlertTriangle style={{ width: "24px", height: "24px", color: "#f87171" }} />
      </div>
      <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#fafafa", marginBottom: "6px" }}>Something went wrong</h2>
      <p style={{ fontSize: "13px", color: "#71717a", maxWidth: "320px", lineHeight: 1.6, marginBottom: "20px" }}>
        We hit an unexpected error loading this page. Your data is safe — please try again.
      </p>
      <button onClick={reset}
        style={{ padding: "9px 20px", borderRadius: "9px", backgroundColor: "#7C3AED", color: "white", fontSize: "13px", fontWeight: 600, border: "none", cursor: "pointer" }}>
        Try again
      </button>
    </div>
  )
}
