"use client"

import { useState } from "react"
import { X, Check, Globe, AlertCircle } from "lucide-react"
import { PlatformIcon, PLATFORM_CONFIG } from "@/lib/platform"
import { addCompetitor } from "@/lib/competitors-data"
import type { Competitor, Platform } from "@/types"

interface AddCompetitorDrawerProps {
  open: boolean
  onClose: () => void
  onAdd: (competitor: Competitor) => void
}

interface SocialHandles {
  tiktok: string
  instagram: string
  youtube: string
  facebook: string
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-zinc-400">{label}</label>
      {children}
    </div>
  )
}

function TextInput({ value, onChange, placeholder, prefix }: {
  value: string; onChange: (v: string) => void; placeholder?: string; prefix?: string
}) {
  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">{prefix}</span>
      )}
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all ${prefix ? "pl-8 pr-3" : "px-3.5"}`}
      />
    </div>
  )
}

const PLATFORMS: Array<{ key: keyof SocialHandles; platform: Platform; placeholder: string; prefix: string }> = [
  { key: "tiktok",    platform: "tiktok",    placeholder: "e.g. @brandname",          prefix: "@" },
  { key: "instagram", platform: "instagram", placeholder: "e.g. @brandname",          prefix: "@" },
  { key: "youtube",   platform: "youtube",   placeholder: "e.g. @brandname or URL",   prefix: ""  },
  { key: "facebook",  platform: "facebook",  placeholder: "e.g. facebook.com/brand",  prefix: ""  },
]

export function AddCompetitorDrawer({ open, onClose, onAdd }: AddCompetitorDrawerProps) {
  const [name, setName] = useState("")
  const [website, setWebsite] = useState("")
  const [handles, setHandles] = useState<SocialHandles>({ tiktok: "", instagram: "", youtube: "", facebook: "" })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  function setHandle(key: keyof SocialHandles, val: string) {
    setHandles(prev => ({ ...prev, [key]: val }))
  }

  const hasAnyAccount = Object.values(handles).some(v => v.trim().length > 0)
  const canSubmit = name.trim().length > 0

  async function handleSubmit() {
    if (!canSubmit) return
    setSaving(true); setError(null)
    try {
      const comp = await addCompetitor({
        name: name.trim(),
        website: website.trim() || null,
        handles: {
          tiktok:    handles.tiktok.trim()    || null,
          instagram: handles.instagram.trim() || null,
          youtube:   handles.youtube.trim()   || null,
          facebook:  handles.facebook.trim()  || null,
        },
      })
      onAdd(comp)
      setSaved(true)
      setTimeout(() => { setSaved(false); handleClose() }, 1200)
    } catch {
      // Optimistic: build mock competitor and add it
      const mockComp: Competitor = {
        id: `comp-${Date.now()}`,
        workspace_id: null,
        name: name.trim(),
        website: website.trim() || null,
        logo_url: null,
        created_at: new Date().toISOString(),
        accounts: Object.entries(handles)
          .filter(([, v]) => v.trim())
          .map(([platform, username], i) => ({
            id: `ca-new-${i}`,
            competitor_id: `comp-${Date.now()}`,
            platform: platform as Platform,
            username: username.trim().startsWith("@") ? username.trim() : `@${username.trim()}`,
            avatar_url: null,
            follower_count: 0,
            total_views: 0,
            avg_views: 0,
            posting_frequency: 0,
            created_at: new Date().toISOString(),
          })),
      }
      onAdd(mockComp)
      setSaved(true)
      setTimeout(() => { setSaved(false); handleClose() }, 1200)
    } finally {
      setSaving(false)
    }
  }

  function handleClose() {
    setName(""); setWebsite("")
    setHandles({ tiktok: "", instagram: "", youtube: "", facebook: "" })
    setError(null); setSaved(false)
    onClose()
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={handleClose} />
      <div
        className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 flex flex-col"
        style={{ backgroundColor: "#111111", borderLeft: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-white">Add Competitor</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Start tracking a competitor brand&apos;s creator activity.</p>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Brand info */}
          <div className="space-y-4">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Brand Info</p>
            <Field label="Competitor Brand Name *">
              <TextInput value={name} onChange={setName} placeholder="e.g. ViralPush Inc" />
            </Field>
            <Field label="Website URL">
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                <input
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                  placeholder="e.g. viralpush.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all"
                />
              </div>
            </Field>
          </div>

          {/* Social accounts */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Add Their Social Accounts</p>
            <p className="text-xs text-zinc-600">Add at least one account to start tracking their creator activity.</p>
            {PLATFORMS.map(({ key, platform, placeholder, prefix }) => {
              const cfg = PLATFORM_CONFIG[platform]
              const hasValue = handles[key].trim().length > 0
              return (
                <div key={key} className={`rounded-lg border p-3.5 transition-all ${hasValue ? "border-purple-500/30 bg-purple-600/5" : "border-white/[0.06] bg-white/[0.02]"}`}>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className={`w-6 h-6 rounded ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                      <PlatformIcon platform={platform} className={`w-3.5 h-3.5 ${cfg.textColor}`} />
                    </div>
                    <span className="text-sm font-medium text-zinc-300">{cfg.label}</span>
                    {hasValue && <Check className="w-3.5 h-3.5 text-emerald-400 ml-auto" />}
                  </div>
                  {prefix ? (
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">{prefix}</span>
                      <input
                        value={handles[key]}
                        onChange={e => setHandle(key, e.target.value)}
                        placeholder={placeholder.replace(/^@/, "")}
                        className="w-full pl-7 pr-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-purple-500/40 transition-all"
                      />
                    </div>
                  ) : (
                    <input
                      value={handles[key]}
                      onChange={e => setHandle(key, e.target.value)}
                      placeholder={placeholder}
                      className="w-full px-3.5 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-purple-500/40 transition-all"
                    />
                  )}
                </div>
              )
            })}
          </div>

          {/* Preview */}
          {name.trim() && (
            <div className="rounded-lg border border-purple-500/20 bg-purple-600/5 p-4">
              <p className="text-xs font-medium text-purple-400 mb-2">Preview</p>
              <p className="text-sm font-semibold text-white">{name}</p>
              {website && <p className="text-xs text-zinc-500 mt-0.5">{website}</p>}
              {hasAnyAccount && (
                <div className="flex items-center gap-2 mt-2">
                  {PLATFORMS.filter(p => handles[p.key].trim()).map(({ platform }) => {
                    const cfg = PLATFORM_CONFIG[platform]
                    return (
                      <span key={platform} className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${cfg.bg} ${cfg.textColor}`}>
                        <PlatformIcon platform={platform} className="w-2.5 h-2.5" />
                        {cfg.label}
                      </span>
                    )
                  })}
                </div>
              )}
              {!hasAnyAccount && (
                <p className="text-xs text-zinc-600 mt-1.5">Add at least one social account to track their creator activity.</p>
              )}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-white/[0.06] flex-shrink-0">
          <button onClick={handleClose} className="flex-1 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-zinc-300 hover:text-white font-medium transition-all">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !canSubmit || saved}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all"
          >
            {saved ? (
              <><Check className="w-4 h-4" /> Added!</>
            ) : saving ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Tracking...</>
            ) : (
              "Start Tracking"
            )}
          </button>
        </div>
      </div>
    </>
  )
}
