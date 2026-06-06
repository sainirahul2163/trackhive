"use client"

import { useState, useEffect } from "react"
import { Copy, RefreshCw, ExternalLink, Check, Eye, EyeOff, AlertTriangle, X, Mail, Zap } from "lucide-react"
import { toast, Toaster } from "sonner"
import { supabase } from "@/lib/supabase"

/* ── Integration card types ──────────────────────────── */
type ConnectStatus = "connected" | "disconnected" | "coming_soon"

/* ── Toggle component ────────────────────────────────── */
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: "40px", height: "22px", borderRadius: "11px", cursor: "pointer", border: "none",
        backgroundColor: checked ? "#7C3AED" : "rgba(255,255,255,0.1)",
        position: "relative", transition: "background-color 0.2s", flexShrink: 0,
      }}
    >
      <div style={{ position: "absolute", top: "3px", left: checked ? "20px" : "3px", width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.4)" }} />
    </button>
  )
}

/* ── Icon helpers ────────────────────────────────────── */
function SlackIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52z" fill="#E01E5A"/>
      <path d="M6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#E01E5A"/>
      <path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834z" fill="#36C5F0"/>
      <path d="M8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#36C5F0"/>
      <path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834z" fill="#2EB67D"/>
      <path d="M17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" fill="#2EB67D"/>
      <path d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52z" fill="#ECB22E"/>
      <path d="M15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#ECB22E"/>
    </svg>
  )
}

function DiscordIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#5865F2">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.032.054a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
    </svg>
  )
}

function ZapierIcon() {
  return (
    <div style={{ width: "24px", height: "24px", borderRadius: "6px", backgroundColor: "#FF4A00", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Zap style={{ width: "14px", height: "14px", color: "#fff", fill: "#fff" }} />
    </div>
  )
}

function ShopifyIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#95BF47">
      <path d="M15.337.903c-.01-.065-.065-.103-.12-.103-.054 0-1.258-.021-1.258-.021S12.67.493 12.54.364c-.13-.13-.381-.085-.478-.054-.01.005-.205.065-.52.16-.287-.829-.79-1.591-1.683-1.591h-.075C9.49-1.393 9.139-1.765 8.736-1.79c-2.64-.064-3.896 3.297-4.29 4.967C3.43 3.49 2.525 3.77 2.525 3.77l-.011.005c-.658.205-.68.226-.736.851C1.746 5.195.097 19.068.097 19.068L12.16 21.2l6.558-1.415S15.347.97 15.337.903zM11.4 1.344l-.844.262a7.79 7.79 0 0 0-.842-2.063c.833.167 1.42.981 1.686 1.801zM9.78.738c.189.624.29 1.51.235 2.37l-2.44.756C7.944 2.405 8.87.93 9.78.738zm-.958-.194c.108 0 .222.043.33.124C8.022.97 7.232 2.57 6.888 4.18L4.846 4.81c.437-1.505 1.464-4.266 3.976-4.266z"/>
    </svg>
  )
}

/* ── API key section ─────────────────────────────────── */
function APIKeySection() {
  const [revealed, setRevealed] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const apiKey: string | null = null
  const maskedKey = "No API key generated"

  function copyKey() {
    if (!apiKey) {
      toast.error("Generate an API key first")
      return
    }
    navigator.clipboard.writeText(apiKey).then(() => toast.success("API key copied"))
  }

  function handleRegenerate() {
    setShowConfirm(false)
    toast.info("Coming soon", { description: "API key management is launching soon." })
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: "10px" }}>
        <code style={{ flex: 1, fontSize: "12px", color: "#a1a1aa", fontFamily: "monospace", letterSpacing: "0.04em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {apiKey ? (revealed ? apiKey : "th_live_sk_" + "•".repeat(16)) : maskedKey}
        </code>
        <button onClick={() => setRevealed(!revealed)} style={{ width: "28px", height: "28px", borderRadius: "6px", backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {revealed ? <EyeOff style={{ width: "13px", height: "13px", color: "#71717a" }} /> : <Eye style={{ width: "13px", height: "13px", color: "#71717a" }} />}
        </button>
        <button onClick={copyKey} style={{ width: "28px", height: "28px", borderRadius: "6px", backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Copy style={{ width: "13px", height: "13px", color: "#71717a" }} />
        </button>
        <button onClick={() => setShowConfirm(true)} style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "6px 12px", borderRadius: "6px", backgroundColor: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#fbbf24", fontSize: "11px", fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>
          <RefreshCw style={{ width: "11px", height: "11px" }} /> Regenerate
        </button>
      </div>

      <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#a855f7", textDecoration: "none" }}>
        <ExternalLink style={{ width: "12px", height: "12px" }} /> View API Documentation
      </a>

      {showConfirm && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "24px" }}>
          <div style={{ backgroundColor: "#111111", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", padding: "28px", maxWidth: "380px", width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <AlertTriangle style={{ width: "18px", height: "18px", color: "#fbbf24" }} />
              <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#fafafa" }}>Regenerate API Key?</h4>
            </div>
            <p style={{ fontSize: "13px", color: "#71717a", lineHeight: 1.6, marginBottom: "20px" }}>
              This will immediately invalidate your current key. Any integrations using it will stop working.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setShowConfirm(false)} style={{ flex: 1, padding: "8px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "#a1a1aa", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button onClick={handleRegenerate} style={{ flex: 1, padding: "8px", borderRadius: "8px", backgroundColor: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)", color: "#fbbf24", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Yes, Regenerate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Discord webhook section ─────────────────────────── */
function DiscordSection() {
  const [webhook, setWebhook] = useState("")
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase
        .from("profiles")
        .select("discord_webhook")
        .eq("id", user.id)
        .single()
      if (data?.discord_webhook) {
        setWebhook(data.discord_webhook)
        setSaved(true)
      }
    })
  }, [])

  async function save() {
    if (!webhook.startsWith("https://discord.com/api/webhooks/")) { toast.error("Enter a valid Discord webhook URL"); return }
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("You must be logged in to save")
        return
      }
      const { error } = await supabase
        .from("profiles")
        .update({ discord_webhook: webhook.trim() })
        .eq("id", user.id)
      if (error) throw error
      setSaved(true)
      toast.success("Discord webhook saved")
    } catch {
      toast.error("Failed to save Discord webhook")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ display: "flex", gap: "8px" }}>
      <input
        type="url"
        placeholder="https://discord.com/api/webhooks/..."
        value={webhook}
        onChange={e => { setWebhook(e.target.value); setSaved(false) }}
        style={{ flex: 1, padding: "8px 12px", borderRadius: "7px", backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#e4e4e7", fontSize: "12px", outline: "none", boxSizing: "border-box" }}
        className="focus:border-purple-500/40"
      />
      <button onClick={save} disabled={saving} style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "8px 14px", borderRadius: "7px", backgroundColor: saved ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.05)", border: saved ? "1px solid rgba(52,211,153,0.25)" : "1px solid rgba(255,255,255,0.08)", color: saved ? "#34d399" : "#a1a1aa", fontSize: "12px", fontWeight: 600, cursor: saving ? "wait" : "pointer", flexShrink: 0, opacity: saving ? 0.6 : 1 }}>
        {saving ? "Saving…" : saved ? <><Check style={{ width: "12px", height: "12px" }} /> Saved</> : "Save"}
      </button>
    </div>
  )
}

/* ── Email alert toggles ─────────────────────────────── */
function EmailAlerts() {
  const [alerts, setAlerts] = useState({
    viral:     true,
    milestone: true,
    weekly:    false,
    payment:   true,
  })

  const items: { key: keyof typeof alerts; label: string }[] = [
    { key: "viral",     label: "Video goes viral (>1M views)" },
    { key: "milestone", label: "Campaign milestone reached" },
    { key: "weekly",    label: "Weekly AI digest" },
    { key: "payment",   label: "Payment sent or failed" },
  ]

  function toggle(k: keyof typeof alerts) {
    setAlerts(prev => ({ ...prev, [k]: !prev[k] }))
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {items.map(({ key, label }) => (
        <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: "7px", backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Mail style={{ width: "13px", height: "13px", color: alerts[key] ? "#a855f7" : "#52525b" }} />
            <span style={{ fontSize: "13px", color: "#a1a1aa" }}>{label}</span>
          </div>
          <Toggle checked={alerts[key]} onChange={() => toggle(key)} />
        </div>
      ))}
    </div>
  )
}

/* ── Integration card ────────────────────────────────── */
function IntegrationCard({
  icon, name, description, status, children, isPro = false,
}: {
  icon: React.ReactNode
  name: string
  description: string
  status: ConnectStatus
  children?: React.ReactNode
  isPro?: boolean
}) {
  const [expanded, setExpanded] = useState(false)

  const statusConfig = {
    connected:    { label: "Connected",   color: "#34d399", bg: "rgba(52,211,153,0.1)" },
    disconnected: { label: "Not connected", color: "#71717a", bg: "rgba(113,113,122,0.1)" },
    coming_soon:  { label: "Coming soon",  color: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
  }
  const sc = statusConfig[status]

  return (
    <div style={{ backgroundColor: "#111111", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden", marginBottom: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "18px 20px" }}>
        <div style={{ width: "44px", height: "44px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#fafafa" }}>{name}</span>
            {isPro && (
              <span style={{ fontSize: "9px", fontWeight: 700, color: "#7C3AED", backgroundColor: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)", padding: "1px 6px", borderRadius: "3px" }}>PRO+</span>
            )}
          </div>
          <p style={{ fontSize: "12px", color: "#71717a" }}>{description}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          <span style={{ fontSize: "11px", fontWeight: 600, color: sc.color, backgroundColor: sc.bg, padding: "2px 8px", borderRadius: "5px" }}>
            {sc.label}
          </span>
          {status !== "coming_soon" && (
            <button
              onClick={() => setExpanded(!expanded)}
              style={{ padding: "6px 14px", borderRadius: "7px", backgroundColor: status === "connected" ? "rgba(239,68,68,0.08)" : "rgba(124,58,237,0.12)", border: status === "connected" ? "1px solid rgba(239,68,68,0.2)" : "1px solid rgba(124,58,237,0.25)", color: status === "connected" ? "#f87171" : "#a855f7", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
            >
              {status === "connected" ? (expanded ? "Done" : "Disconnect") : (expanded ? <X style={{ width: "12px", height: "12px" }} /> : "Connect")}
            </button>
          )}
        </div>
      </div>

      {expanded && children && (
        <div style={{ padding: "0 20px 18px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "16px" }}>
          {children}
        </div>
      )}
    </div>
  )
}

/* ── Main component ──────────────────────────────────── */
export function IntegrationsSettings() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", color: "#fafafa" } }} />

      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#fafafa", marginBottom: "4px" }}>Integrations</h2>
        <p style={{ fontSize: "13px", color: "#71717a" }}>Connect TrackHive with your existing tools and workflows.</p>
      </div>

      {/* Slack */}
      <IntegrationCard icon={<SlackIcon />} name="Slack" description="Get alerts in your Slack channel when creators go viral." status="disconnected">
        <p style={{ fontSize: "12px", color: "#71717a", marginBottom: "12px" }}>Click below to begin the OAuth flow and choose which Slack channel to post to.</p>
        <button onClick={() => toast.info("Coming soon", { description: "Slack integration is launching soon." })} style={{ padding: "8px 16px", borderRadius: "7px", backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fafafa", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
          Connect Slack
        </button>
      </IntegrationCard>

      {/* Discord */}
      <IntegrationCard icon={<DiscordIcon />} name="Discord" description="Post alerts to a Discord server via webhook." status="disconnected">
        <p style={{ fontSize: "12px", color: "#71717a", marginBottom: "10px" }}>Paste your Discord webhook URL to start receiving notifications.</p>
        <DiscordSection />
      </IntegrationCard>

      {/* Email */}
      <IntegrationCard icon={<Mail style={{ width: "22px", height: "22px", color: "#a855f7" }} />} name="Email Alerts" description="Configure which events trigger email notifications." status="connected">
        <EmailAlerts />
      </IntegrationCard>

      {/* API */}
      <IntegrationCard icon={<div style={{ fontSize: "16px", fontWeight: 800, color: "#7C3AED", fontFamily: "monospace" }}>{"{}"}</div>} name="API Access" description="Use the TrackHive API to build custom integrations and automations." status="connected" isPro>
        <p style={{ fontSize: "12px", color: "#71717a", marginBottom: "12px" }}>Your secret API key. Never share this publicly.</p>
        <APIKeySection />
      </IntegrationCard>

      {/* Coming soon */}
      <IntegrationCard icon={<ZapierIcon />} name="Zapier" description="Trigger Zaps when creators hit milestones." status="coming_soon" />
      <IntegrationCard icon={<ShopifyIcon />} name="Shopify" description="Tag creators who drive Shopify conversions." status="coming_soon" />
    </>
  )
}
