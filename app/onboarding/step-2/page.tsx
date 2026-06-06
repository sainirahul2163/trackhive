"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { Zap, ArrowRight, ArrowLeft, Link as LinkIcon, Loader2 } from "lucide-react"
import { PlatformIcon, PLATFORM_CONFIG } from "@/lib/platform"
import { supabase } from "@/lib/supabase"
import type { AccountPreview } from "@/app/api/account/preview/route"
import type { Platform, TrackedAccount } from "@/types"

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

interface DetectedPlatform {
  platform: Platform
  username: string
  url:      string
}

function detectPlatform(url: string): DetectedPlatform | null {
  try {
    const u    = new URL(url.trim())
    const host = u.hostname.replace("www.", "")

    if (host.includes("tiktok.com")) {
      const username = u.pathname.replace(/\/@?/, "").split("/")[0]
      return { platform: "tiktok", username: username || "unknown", url: url.trim() }
    }
    if (host.includes("instagram.com")) {
      const username = u.pathname.replace(/\//, "").split("/")[0]
      return { platform: "instagram", username: username || "unknown", url: url.trim() }
    }
    if (host.includes("youtube.com") || host.includes("youtu.be")) {
      const username =
        u.pathname.replace(/\/@?/, "").split("/")[0] ||
        u.searchParams.get("channel") ||
        "channel"
      return { platform: "youtube", username: username || "unknown", url: url.trim() }
    }
    if (host.includes("facebook.com")) {
      const username = u.pathname.replace(/\//, "").split("/")[0]
      return { platform: "facebook", username: username || "unknown", url: url.trim() }
    }
    return null
  } catch {
    return null
  }
}

export default function OnboardingStep2() {
  const router = useRouter()
  const [url, setUrl] = useState("")
  const [detected, setDetected] = useState<DetectedPlatform | null>(null)
  const [preview, setPreview] = useState<AccountPreview | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (url.length < 15) {
      setDetected(null)
      setPreview(null)
      setLoading(false)
      return
    }

    const result = detectPlatform(url)
    if (!result) {
      setDetected(null)
      setPreview(null)
      setLoading(false)
      return
    }

    setDetected(result)
    setPreview(null)
    setError(null)

    if (result.platform === "facebook") {
      setLoading(false)
      return
    }

    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/account/preview?platform=${result.platform}&username=${encodeURIComponent(result.username)}`,
        )
        const body = await res.json() as AccountPreview & { error?: string }
        if (!res.ok) {
          setError(body.error ?? "Account not found.")
          setPreview(null)
        } else {
          setPreview(body)
        }
      } catch {
        setError("Could not reach the server. Please try again.")
        setPreview(null)
      } finally {
        setLoading(false)
      }
    }, 600)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [url])

  async function handleStartTracking() {
    if (!detected) return
    setSaving(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError("You must be logged in to add an account.")
        return
      }

      const newAccount: Omit<TrackedAccount, "id" | "created_at"> = {
        workspace_id:    user.id,
        platform:        detected.platform,
        username:        preview?.username       ?? detected.username,
        display_name:    preview?.display_name   ?? detected.username,
        avatar_url:      preview?.avatar_url     ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${detected.username}`,
        profile_url:     detected.url,
        follower_count:  preview?.follower_count ?? 0,
        total_views:     0,
        avg_views:       0,
        engagement_rate: 0,
        last_synced_at:  null,
      }

      const { data, error: insertError } = await supabase
        .from("tracked_accounts")
        .insert(newAccount)
        .select()
        .single()

      if (insertError) throw insertError

      if (data?.id && detected.platform !== "facebook") {
        await fetch("/api/sync", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ accountId: data.id }),
        })
      }

      router.push("/onboarding/step-3")
    } catch {
      setError("Failed to save account. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const canTrack = detected && (detected.platform === "facebook" || preview)

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

          <div className="space-y-3">
            <div className="relative">
              <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://tiktok.com/@creatorname"
                style={{ width: "100%", padding: "12px 14px 12px 40px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.05)", border: detected ? "1px solid rgba(124,58,237,0.4)" : "1px solid rgba(255,255,255,0.08)", color: "#e4e4e7", fontSize: "14px", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
                className="placeholder:text-zinc-600"
              />
              {detected && (
                <div
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: "4px", padding: "3px 8px", borderRadius: "6px", backgroundColor: PLATFORM_CONFIG[detected.platform].bgColor, color: PLATFORM_CONFIG[detected.platform].fgColor, fontSize: "11px", fontWeight: 600 }}
                >
                  <PlatformIcon platform={detected.platform} className="w-3 h-3" />
                  {PLATFORM_CONFIG[detected.platform].label}
                </div>
              )}
            </div>

            {loading && (
              <div className="flex items-center gap-2 text-xs text-zinc-500 px-1">
                <div className="w-3.5 h-3.5 border-2 border-zinc-600 border-t-purple-400 rounded-full animate-spin" />
                Looking up creator...
              </div>
            )}

            {(preview || (detected && detected.platform === "facebook")) && !loading && (
              <div style={{ borderRadius: "12px", border: "1px solid rgba(124,58,237,0.2)", backgroundColor: "rgba(124,58,237,0.06)", padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "rgba(124,58,237,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                  {preview?.avatar_url ? (
                    <img src={preview.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <PlatformIcon platform={detected!.platform} className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {preview?.display_name ?? `@${detected!.username}`}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span style={{ fontSize: "11px", fontWeight: 500, color: PLATFORM_CONFIG[detected!.platform].fgColor }}>
                      {PLATFORM_CONFIG[detected!.platform].label}
                    </span>
                    {preview && (
                      <span className="text-xs text-zinc-500">
                        · {preview.follower_count.toLocaleString()} followers
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
            )}
          </div>

          <div className="mt-6 space-y-2.5">
            <button
              onClick={handleStartTracking}
              disabled={!canTrack || saving}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all shadow-lg shadow-purple-500/20"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Start Tracking <ArrowRight className="w-4 h-4" /></>}
            </button>
            <button
              onClick={() => router.push("/onboarding/step-3")}
              disabled={saving}
              className="w-full py-2.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Skip for now
            </button>
            <button
              onClick={() => router.push("/onboarding/step-1")}
              disabled={saving}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" /> Back
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-zinc-600 mt-4">Step 2 of 3</p>
      </div>
    </div>
  )
}
