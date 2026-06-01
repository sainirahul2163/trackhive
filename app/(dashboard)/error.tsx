"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        padding: "40px 24px",
        textAlign: "center",
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "16px",
          backgroundColor: "rgba(239,68,68,0.1)",
          border: "1px solid rgba(239,68,68,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "20px",
        }}
      >
        <AlertTriangle style={{ width: "26px", height: "26px", color: "#f87171" }} />
      </div>

      <h2
        style={{
          fontSize: "20px",
          fontWeight: 700,
          color: "#fafafa",
          marginBottom: "10px",
        }}
      >
        Something went wrong
      </h2>

      <p
        style={{
          fontSize: "14px",
          color: "#71717a",
          maxWidth: "360px",
          lineHeight: 1.65,
          marginBottom: "8px",
        }}
      >
        An unexpected error occurred while loading this page. This has been logged automatically.
      </p>

      {error.digest && (
        <p style={{ fontSize: "12px", color: "#52525b", marginBottom: "28px" }}>
          Error ID: <code style={{ fontFamily: "monospace", color: "#71717a" }}>{error.digest}</code>
        </p>
      )}
      {!error.digest && <div style={{ marginBottom: "28px" }} />}

      {/* Actions */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={reset}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            padding: "10px 20px",
            borderRadius: "10px",
            backgroundColor: "#7C3AED",
            color: "white",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            border: "none",
          }}
        >
          <RefreshCw style={{ width: "14px", height: "14px" }} />
          Try again
        </button>
        <a
          href="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            padding: "10px 20px",
            borderRadius: "10px",
            backgroundColor: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#a1a1aa",
            fontSize: "14px",
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          <ArrowLeft style={{ width: "14px", height: "14px" }} />
          Dashboard
        </a>
      </div>
    </div>
  )
}
