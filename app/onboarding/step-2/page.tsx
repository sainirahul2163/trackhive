"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Zap, ArrowRight, Link as LinkIcon } from "lucide-react"
import { PlatformIcon, PLATFORM_CONFIG } from "@/lib/platform"
import type { Platform } from "@/types"

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-8">
      {[1, 2, 3].map(n => (
        <div key={n} className="flex items-center gap-2">
          <div style={{
            width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700,
            backgroundColor: n < current ? "#7C3AED" : n === current ? "#7C3AED" : "rgba(255,255,255,0.06)",
            color: n <= current ? "#fff" : "#52525b",
            border: n === current ? "2px solid rgba(124,58,237,0.4)" : "none",
            boxShadow: n === current ? "0 0 0 4px rgba(124,58,237,0.15)" : "none",
          }}>{n}</div>
          {n < 3 && <div style={{ width: "32px", height: "2px", borderRadius: "1px", backgroundColor: n < current ? "#7C3AED" : "rgba(255,255,255,0.08)" }} />}
        </div>
      ))}
    </div>
  )
}

function detectPlatform(url: string): Platform | null {
  const u = url.toLowerCase()
  if (u.includes("tiktok.com"))    return "tiktok"
  if (u.includes("instagram.com")) return "instagram"
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube"
  if (u.includes("facebook.com"))  return "facebook"
  return null
}

function extractHandle(url: string): string {
  try {
    const u = new URL(url)
    const parts = u.pathname.split("/").filter(Boolean)
    return parts[0] ? `@${parts[0].replace("@", "")}` : url
  } catch { return url }
}

interface MockPreview {
  handle: string
  platform: Platform
  followers: string
  avatar: string
}

export default function OnboardingStep2() {
  const router = useRouter()
  const [url, setUrl] = useState("")
  const [platform, setPlatform] = useState<Platform | null>(null)
  const [preview, setPreview] = useState<MockPreview | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const p = detectPlatform(url)
    setPlatform(p)
    if (p && url.length > 15) {
      setLoading(true)
      const t = setTimeout(() => {
        const handle = extractHandle(url)
        const followers: Record<Platform, string> = { tiktok: "892K", instagram: "541K", youtube: "284K", facebook: "198K" }
        setPreview({ handle, platform: p, followers: followers[p], avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${handle}` })
        setLoading(false)
      }, 900)
      return () => clearTimeout(t)
    } else {
      setPreview(null)
      setLoading(false)
    }
  }, [url])

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse at top left, rgba(124,58,237,0.15) 0%, transparent 60%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: "480px", position: "relative", zIndex: 10 }}>
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Zap className="w-4 h-4 text-white" fill="white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">TrackHive</span>
        </div>

        <StepIndicator current={2} />

        <div style={{ borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "#111111", padding: "32px" }}>
          <div className="text-center mb-6">
            <h1 className="text-[22px] font-semibold text-white mb-1.5">Add your first creator</h1>
            <p className="text-sm text-zinc-500">Paste any TikTok, Instagram or YouTube URL to start tracking.</p>
          </div>

          {/* URL input */}
          <div className="space-y-3">
            <div className="relative">
              <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://tiktok.com/@creatorname"
                style={{ width: "100%", padding: "12px 14px 12px 40px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.05)", border: platform ? "1px solid rgba(124,58,237,0.4)" : "1px solid rgba(255,255,255,0.08)", color: "#e4e4e7", fontSize: "14px", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
                className="placeholder:text-zinc-600"
              />
              {platform && (
                <div
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: "4px", padding: "3px 8px", borderRadius: "6px", backgroundColor: PLATFORM_CONFIG[platform].bgColor, color: PLATFORM_CONFIG[platform].fgColor, fontSize: "11px", fontWeight: 600 }}
                >
                  <PlatformIcon platform={platform} className="w-3 h-3" />
                  {PLATFORM_CONFIG[platform].label}
                </div>
              )}
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-zinc-500 px-1">
                <div className="w-3.5 h-3.5 border-2 border-zinc-600 border-t-purple-400 rounded-full animate-spin" />
                Looking up creator...
              </div>
            )}

            {/* Preview card */}
            {preview && !loading && (
              <div style={{ borderRadius: "12px", border: "1px solid rgba(124,58,237,0.2)", backgroundColor: "rgba(124,58,237,0.06)", padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
                <img src={preview.avatar} alt={preview.handle} className="w-12 h-12 rounded-full bg-purple-600/20 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{preview.handle}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span style={{ fontSize: "11px", fontWeight: 500, color: PLATFORM_CONFIG[preview.platform].fgColor }}>{PLATFORM_CONFIG[preview.platform].label}</span>
                    <span className="text-xs text-zinc-500">· {preview.followers} followers</span>
                  </div>
                </div>
                <span className="text-[11px] text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex-shrink-0">Ready</span>
              </div>
            )}
          </div>

          <div className="mt-6 space-y-2.5">
            <button
              onClick={() => router.push("/onboarding/step-3")}
              disabled={!preview}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all shadow-lg shadow-purple-500/20"
            >
              Start Tracking <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push("/onboarding/step-3")}
              className="w-full py-2.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Skip for now
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-zinc-600 mt-4">Step 2 of 3</p>
      </div>
    </div>
  )
}
