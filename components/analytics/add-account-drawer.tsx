"use client"

import { useState, useRef } from "react"
import { X, Link2, CheckCircle2, Loader2, AlertCircle, Users, Video, Eye } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { PlatformIcon, PLATFORM_CONFIG } from "@/lib/platform"
import { supabase } from "@/lib/supabase"
import type { TrackedAccount, Platform } from "@/types"
import type { AccountPreview } from "@/app/api/account/preview/route"

interface AddAccountDrawerProps {
  open:           boolean
  onOpenChange:   (open: boolean) => void
  onAccountAdded: (account: TrackedAccount) => void
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
      return { platform: "tiktok", username: username || "unknown", url }
    }
    if (host.includes("instagram.com")) {
      const username = u.pathname.replace(/\//, "").split("/")[0]
      return { platform: "instagram", username: username || "unknown", url }
    }
    if (host.includes("youtube.com") || host.includes("youtu.be")) {
      const username =
        u.pathname.replace(/\/@?/, "").split("/")[0] ||
        u.searchParams.get("channel") ||
        "channel"
      return { platform: "youtube", username: username || "unknown", url }
    }
    if (host.includes("facebook.com")) {
      const username = u.pathname.replace(/\//, "").split("/")[0]
      return { platform: "facebook", username: username || "unknown", url }
    }
    return null
  } catch {
    return null
  }
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

type Status = "idle" | "detected" | "fetching" | "preview" | "saving" | "success" | "error"

export function AddAccountDrawer({ open, onOpenChange, onAccountAdded }: AddAccountDrawerProps) {
  const [urlInput, setUrlInput]   = useState("")
  const [detected, setDetected]   = useState<DetectedPlatform | null>(null)
  const [preview,  setPreview]    = useState<AccountPreview | null>(null)
  const [status,   setStatus]     = useState<Status>("idle")
  const [errorMsg, setErrorMsg]   = useState("")
  const debounceRef               = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleUrlChange(val: string) {
    setUrlInput(val)
    setErrorMsg("")

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (val.length < 10) {
      setDetected(null)
      setPreview(null)
      setStatus("idle")
      return
    }

    const result = detectPlatform(val)
    if (!result) {
      setDetected(null)
      setPreview(null)
      setStatus("idle")
      return
    }

    setDetected(result)
    setPreview(null)
    setStatus("fetching")

    // Debounce: wait 600ms after user stops typing, then fetch
    debounceRef.current = setTimeout(() => fetchPreview(result), 600)
  }

  async function fetchPreview(d: DetectedPlatform) {
    if (d.platform === "facebook") {
      // Facebook not supported by EnsembleData tier — fallback to detected only
      setStatus("detected")
      return
    }

    try {
      const res = await fetch(
        `/api/account/preview?platform=${d.platform}&username=${encodeURIComponent(d.username)}`
      )
      const body = await res.json() as AccountPreview & { error?: string }

      if (!res.ok) {
        setErrorMsg(body.error ?? "Account not found.")
        setStatus("error")
        return
      }

      setPreview(body)
      setStatus("preview")
    } catch {
      setErrorMsg("Could not reach the server. Please try again.")
      setStatus("error")
    }
  }

  async function handleStartTracking() {
    if (!detected) return
    setStatus("saving")

    try {
      const newAccount: Omit<TrackedAccount, "id" | "created_at"> = {
        workspace_id:   null,
        platform:       detected.platform,
        username:       preview?.username       ?? detected.username,
        display_name:   preview?.display_name   ?? detected.username,
        avatar_url:     preview?.avatar_url     ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${detected.username}`,
        profile_url:    detected.url,
        follower_count: preview?.follower_count ?? 0,
        total_views:    0,
        avg_views:      0,
        engagement_rate: 0,
        last_synced_at: null,
      }

      const { data, error } = await supabase
        .from("tracked_accounts")
        .insert(newAccount)
        .select()
        .single()

      if (error) throw error

      setStatus("success")
      onAccountAdded(data as TrackedAccount)

      setTimeout(() => {
        onOpenChange(false)
        reset()
      }, 1800)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to add account."
      setErrorMsg(msg)
      setStatus("error")
    }
  }

  function reset() {
    setUrlInput("")
    setDetected(null)
    setPreview(null)
    setStatus("idle")
    setErrorMsg("")
  }

  function handleClose() {
    onOpenChange(false)
    setTimeout(reset, 300)
  }

  const cfg = detected ? PLATFORM_CONFIG[detected.platform] : null

  const isBusy = status === "fetching" || status === "saving"

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) handleClose() }}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full sm:max-w-[440px] bg-[#111111] border-l border-white/[0.08] p-0 flex flex-col gap-0"
      >
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base font-semibold text-white">Add Account</SheetTitle>
            <button
              onClick={handleClose}
              className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <SheetDescription className="text-zinc-500 text-sm">
            Paste a TikTok, Instagram, or YouTube profile URL to start tracking.
          </SheetDescription>
        </SheetHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* URL Input */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400">Profile URL</label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
              <input
                value={urlInput}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://www.tiktok.com/@username"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all"
                autoFocus
              />
            </div>
          </div>

          {/* Platform tiles — only shown when idle */}
          {status === "idle" && (
            <div className="grid grid-cols-4 gap-2">
              {(["tiktok", "instagram", "youtube", "facebook"] as Platform[]).map((p) => {
                const c = PLATFORM_CONFIG[p]
                return (
                  <div
                    key={p}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border border-white/[0.06] ${c.bg}`}
                  >
                    <PlatformIcon platform={p} className={`w-5 h-5 ${c.textColor}`} />
                    <span className={`text-[10px] font-medium ${c.textColor}`}>{c.label}</span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Fetching skeleton */}
          {status === "fetching" && detected && cfg && (
            <div className="rounded-xl border border-purple-500/20 bg-purple-600/5 p-4 space-y-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full ${cfg.bg} flex items-center justify-center`}>
                  <PlatformIcon platform={detected.platform} className={`w-6 h-6 ${cfg.textColor}`} />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/10 rounded w-28" />
                  <div className="h-2 bg-white/[0.06] rounded w-20" />
                </div>
                <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-12 bg-white/[0.04] rounded-lg" />
                <div className="h-12 bg-white/[0.04] rounded-lg" />
              </div>
              <p className="text-xs text-zinc-500 text-center">Fetching real account data…</p>
            </div>
          )}

          {/* Real preview card */}
          {status === "preview" && preview && cfg && (
            <div className="rounded-xl border border-purple-500/20 bg-purple-600/5 p-4 space-y-4">
              {/* Avatar + name */}
              <div className="flex items-center gap-3">
                {preview.avatar_url ? (
                  <img
                    src={preview.avatar_url}
                    alt={preview.display_name}
                    className="w-12 h-12 rounded-full object-cover border border-white/10"
                    onError={(e) => {
                      e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${preview.username}`
                    }}
                  />
                ) : (
                  <div className={`w-12 h-12 rounded-full ${cfg.bg} flex items-center justify-center`}>
                    <PlatformIcon platform={detected!.platform} className={`w-6 h-6 ${cfg.textColor}`} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{preview.display_name}</p>
                  <p className={`text-xs font-medium ${cfg.textColor}`}>@{preview.username}</p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-0.5 bg-white/[0.04] rounded-lg px-3 py-2.5">
                  <div className="flex items-center gap-1.5 text-zinc-500">
                    <Users className="w-3 h-3" />
                    <span className="text-[10px] font-medium uppercase tracking-wide">Followers</span>
                  </div>
                  <span className="text-sm font-bold text-white">{fmt(preview.follower_count)}</span>
                </div>
                <div className="flex flex-col gap-0.5 bg-white/[0.04] rounded-lg px-3 py-2.5">
                  <div className="flex items-center gap-1.5 text-zinc-500">
                    {preview.platform === "instagram" && preview.top_reel_views != null ? (
                      <Eye className="w-3 h-3" />
                    ) : (
                      <Video className="w-3 h-3" />
                    )}
                    <span className="text-[10px] font-medium uppercase tracking-wide">
                      {preview.platform === "instagram" && preview.top_reel_views != null
                        ? "Top Reel Views"
                        : "Videos"}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-white">
                    {preview.platform === "instagram" && preview.top_reel_views != null
                      ? fmt(preview.top_reel_views)
                      : fmt(preview.video_count)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleStartTracking}
                disabled={isBusy}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium transition-all active:scale-[0.98]"
              >
                {isBusy ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Saving…</>
                ) : (
                  "Start Tracking"
                )}
              </button>
            </div>
          )}

          {/* Detected-only fallback (Facebook or API unsupported) */}
          {status === "detected" && detected && cfg && (
            <div className="rounded-xl border border-purple-500/20 bg-purple-600/5 p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center`}>
                  <PlatformIcon platform={detected.platform} className={`w-5 h-5 ${cfg.textColor}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">@{detected.username}</p>
                  <p className={`text-xs font-medium ${cfg.textColor}`}>{cfg.label} account detected</p>
                </div>
                <div className="ml-auto">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <div className="text-xs text-zinc-500 bg-white/[0.03] rounded-lg px-3 py-2 font-mono truncate">
                {detected.url}
              </div>
              <button
                onClick={handleStartTracking}
                disabled={isBusy}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium transition-all active:scale-[0.98]"
              >
                {isBusy ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Saving…</>
                ) : (
                  "Start Tracking"
                )}
              </button>
            </div>
          )}

          {/* Error state */}
          {status === "error" && detected && cfg && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center`}>
                  <PlatformIcon platform={detected.platform} className={`w-5 h-5 ${cfg.textColor}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">@{detected.username}</p>
                  <p className={`text-xs font-medium ${cfg.textColor}`}>{cfg.label}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-xs text-red-400">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span>{errorMsg || "Account not found or API unavailable."}</span>
              </div>
              <button
                onClick={() => detected && fetchPreview(detected)}
                className="w-full py-2 rounded-lg border border-white/[0.08] text-zinc-400 text-sm hover:bg-white/[0.04] transition-colors"
              >
                Try again
              </button>
            </div>
          )}

          {/* Success state */}
          {status === "success" && detected && cfg && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Account added!</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  @{preview?.username ?? detected.username} — First sync in progress.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.06]">
          <p className="text-xs text-zinc-600 text-center">
            Real follower &amp; video counts fetched live via EnsembleData.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
