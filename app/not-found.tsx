import type { Metadata } from "next"
import Link from "next/link"
import { Zap, LayoutDashboard, BarChart3, Megaphone } from "lucide-react"
import { BackButton } from "@/components/ui/back-button"

export const metadata: Metadata = {
  title: "404 — Page Not Found",
  robots: { index: false, follow: false },
}

const QUICK_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/analytics", label: "Analytics",  icon: BarChart3       },
  { href: "/campaigns", label: "Campaigns",  icon: Megaphone       },
]

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "inherit",
      }}
    >
      {/* Logo */}
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "48px", textDecoration: "none" }}>
        <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg,#7C3AED,#6D28D9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Zap style={{ width: "18px", height: "18px", color: "white" }} />
        </div>
        <span style={{ fontSize: "18px", fontWeight: 700, color: "#fafafa" }}>TrackHive</span>
      </Link>

      {/* 404 glow number */}
      <div style={{ position: "relative", marginBottom: "32px" }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at center, rgba(124,58,237,0.25) 0%, transparent 70%)",
          filter: "blur(40px)",
          transform: "scale(1.5)",
        }} />
        <p style={{
          position: "relative",
          fontSize: "clamp(80px,15vw,140px)",
          fontWeight: 900,
          lineHeight: 1,
          background: "linear-gradient(135deg,#7C3AED 0%,#a78bfa 50%,#7C3AED 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: "-4px",
          userSelect: "none",
        }}>
          404
        </p>
      </div>

      {/* Text */}
      <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#fafafa", marginBottom: "12px", textAlign: "center" }}>
        Page not found
      </h1>
      <p style={{ fontSize: "15px", color: "#71717a", marginBottom: "40px", textAlign: "center", maxWidth: "360px", lineHeight: "1.6" }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      {/* Actions */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center", marginBottom: "48px" }}>
        <Link
          href="/dashboard"
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "10px 20px", borderRadius: "10px",
            backgroundColor: "#7C3AED", color: "white",
            fontSize: "14px", fontWeight: 600, textDecoration: "none",
          }}
        >
          <LayoutDashboard style={{ width: "16px", height: "16px" }} />
          Go to Dashboard
        </Link>
        <BackButton />
      </div>

      {/* Quick links */}
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: "12px", color: "#52525b", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
          Quick links
        </p>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
          {QUICK_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "8px 14px", borderRadius: "8px",
                backgroundColor: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                color: "#71717a", fontSize: "13px", textDecoration: "none",
              }}
            >
              <Icon style={{ width: "13px", height: "13px" }} />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
