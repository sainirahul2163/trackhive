import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"

export const runtime = "edge"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const title       = searchParams.get("title")       ?? "TrackHive"
  const description = searchParams.get("description") ?? "UGC Analytics Platform"

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          backgroundColor: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          fontFamily: "system-ui, -apple-system, sans-serif",
          overflow: "hidden",
        }}
      >
        {/* Purple glow — top right */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "-120px",
            width: "480px",
            height: "480px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(124,58,237,0.35) 0%, rgba(124,58,237,0.1) 50%, transparent 75%)",
          }}
        />

        {/* Secondary glow — bottom left */}
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            left: "-80px",
            width: "320px",
            height: "320px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
          }}
        />

        {/* Subtle grid overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* ── Top bar: logo ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "40px 56px 0",
            position: "relative",
          }}
        >
          {/* Lightning bolt icon */}
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 24px rgba(124,58,237,0.5)",
            }}
          >
            <span style={{ fontSize: "24px", lineHeight: 1 }}>⚡</span>
          </div>
          <span
            style={{
              fontSize: "28px",
              fontWeight: 700,
              color: "#fafafa",
              letterSpacing: "-0.02em",
            }}
          >
            TrackHive
          </span>
        </div>

        {/* ── Main content ── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 56px",
            position: "relative",
          }}
        >
          {/* Purple accent pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                padding: "6px 14px",
                borderRadius: "99px",
                backgroundColor: "rgba(124,58,237,0.15)",
                border: "1px solid rgba(124,58,237,0.3)",
                fontSize: "14px",
                fontWeight: 700,
                color: "#a78bfa",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              UGC Analytics
            </div>
          </div>

          {/* Headline */}
          <div
            style={{
              fontSize: title.length > 40 ? "52px" : "64px",
              fontWeight: 800,
              color: "#fafafa",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              marginBottom: "20px",
              maxWidth: "900px",
            }}
          >
            {title}
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: "24px",
              color: "#71717a",
              lineHeight: 1.5,
              maxWidth: "760px",
              fontWeight: 400,
            }}
          >
            {description}
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 56px 36px",
            position: "relative",
          }}
        >
          {/* Domain */}
          <div
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "#52525b",
            }}
          >
            trackhive.io
          </div>

          {/* Stats */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "15px",
              color: "#52525b",
              fontWeight: 500,
            }}
          >
            <span style={{ color: "#a78bfa", fontWeight: 700 }}>1M+</span>
            <span>accounts</span>
            <span style={{ color: "#3f3f46", margin: "0 4px" }}>·</span>
            <span style={{ color: "#a78bfa", fontWeight: 700 }}>100B+</span>
            <span>views</span>
            <span style={{ color: "#3f3f46", margin: "0 4px" }}>·</span>
            <span style={{ color: "#a78bfa", fontWeight: 700 }}>$5M+</span>
            <span>payouts</span>
          </div>
        </div>

        {/* Purple accent line at bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, transparent, #7C3AED 30%, #a78bfa 60%, transparent)",
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  )
}
