"use client"

import { useState } from "react"
import { X, Link2, CheckCircle2, Loader2, AlertCircle } from "lucide-react"
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

interface AddAccountDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAccountAdded: (account: TrackedAccount) => void
}

interface DetectedPlatform {
  platform: Platform
  username: string
  url: string
}

function detectPlatform(url: string): DetectedPlatform | null {
  try {
    const u = new URL(url.trim())
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

type Status = "idle" | "detected" | "loading" | "success" | "error"

export function AddAccountDrawer({
  open,
  onOpenChange,
  onAccountAdded,
}: AddAccountDrawerProps) {
  const [urlInput, setUrlInput] = useState("")
  const [detected, setDetected] = useState<DetectedPlatform | null>(null)
  const [status, setStatus] = useState<Status>("idle")
  const [errorMsg, setErrorMsg] = useState("")

  function handleUrlChange(val: string) {
    setUrlInput(val)
    setErrorMsg("")

    if (val.length < 10) {
      setDetected(null)
      setStatus("idle")
      return
    }

    const result = detectPlatform(val)
    if (result) {
      setDetected(result)
      setStatus("detected")
    } else {
      setDetected(null)
      setStatus("idle")
    }
  }

  async function handleStartTracking() {
    if (!detected) return
    setStatus("loading")

    try {
      const newAccount: Omit<TrackedAccount, "id" | "created_at"> = {
        workspace_id: null,
        platform: detected.platform,
        username: detected.username,
        display_name: detected.username,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${detected.username}`,
        profile_url: detected.url,
        follower_count: 0,
        total_views: 0,
        avg_views: 0,
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
    setStatus("idle")
    setErrorMsg("")
  }

  function handleClose() {
    onOpenChange(false)
    setTimeout(reset, 300)
  }

  const cfg = detected ? PLATFORM_CONFIG[detected.platform] : null

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
            <SheetTitle className="text-base font-semibold text-white">
              Add Account
            </SheetTitle>
            <button
              onClick={handleClose}
              className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <SheetDescription className="text-zinc-500 text-sm">
            Paste a TikTok, Instagram, YouTube, or Facebook profile URL to start tracking.
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

          {/* Supported platforms hint */}
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

          {/* Detected preview card */}
          {(status === "detected" || status === "loading" || status === "error") && detected && cfg && (
            <div className={`rounded-xl border p-4 space-y-4 transition-all ${
              status === "error"
                ? "border-red-500/20 bg-red-500/5"
                : "border-purple-500/20 bg-purple-600/5"
            }`}>
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

              {status === "error" && (
                <div className="flex items-start gap-2 text-xs text-red-400">
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span>{errorMsg || "Something went wrong. Try again."}</span>
                </div>
              )}

              <button
                onClick={handleStartTracking}
                disabled={status === "loading"}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium transition-all active:scale-[0.98]"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Starting tracking...
                  </>
                ) : (
                  "Start Tracking"
                )}
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
                  @{detected.username} — First sync in progress.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.06]">
          <p className="text-xs text-zinc-600 text-center">
            TrackHive syncs account data every 6 hours automatically.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
