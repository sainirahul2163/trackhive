"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Zap, Globe, Upload, Building2, Check, Eye, EyeOff } from "lucide-react"
import { toast, Toaster } from "sonner"

/* For demo purposes, treat the user as Agency plan */
const IS_AGENCY = true

type SubdomainStatus = "connected" | "pending" | "unconfigured"

interface WLState {
  subdomain: string
  subdomainStatus: SubdomainStatus
  logo_url: string
  primaryColor: string
  secondaryColor: string
  senderName: string
  senderEmail: string
  showCompetitors: boolean
  showTrends: boolean
  showPayments: boolean
  removeWatermark: boolean
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
      {label && <span style={{ fontSize: "13px", color: checked ? "#fafafa" : "#71717a" }}>{label}</span>}
    </div>
  )
}

function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: "#111111", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", padding: "24px", marginBottom: "16px" }}>
      <div style={{ marginBottom: "18px" }}>
        <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#fafafa" }}>{title}</h3>
        {description && <p style={{ fontSize: "12px", color: "#71717a", marginTop: "3px" }}>{description}</p>}
      </div>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: "8px",
  backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
  color: "#e4e4e7", fontSize: "13px", outline: "none", boxSizing: "border-box",
}

/* ── Upgrade gate ────────────────────────────────────── */
function UpgradeGate() {
  return (
    <div style={{ backgroundColor: "#111111", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.06)", padding: "48px 32px", textAlign: "center" }}>
      <div style={{ width: "56px", height: "56px", borderRadius: "14px", backgroundColor: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
        <Zap style={{ width: "24px", height: "24px", color: "#a855f7" }} />
      </div>
      <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#fafafa", marginBottom: "8px" }}>Agency Plan Required</h3>
      <p style={{ fontSize: "14px", color: "#71717a", maxWidth: "360px", margin: "0 auto 24px", lineHeight: 1.6 }}>
        White-label branding, custom subdomains and client portals are available on the Agency plan.
      </p>
      <button
        onClick={() => toast.info("Coming soon", { description: "White-label launching soon." })}
        style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 24px", borderRadius: "9px", backgroundColor: "#7C3AED", color: "#fff", fontSize: "14px", fontWeight: 600, border: "none", cursor: "pointer", boxShadow: "0 0 20px rgba(124,58,237,0.3)" }}
      >
        Upgrade to Agency <Zap style={{ width: "14px", height: "14px", fill: "#fff" }} />
      </button>
    </div>
  )
}

/* ── Live preview panel ──────────────────────────────── */
function LivePreview({ state }: { state: WLState }) {
  return (
    <div style={{ backgroundColor: "#0d0d0d", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden" }}>
      {/* Mini topbar */}
      <div style={{ height: "36px", backgroundColor: "#111111", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", padding: "0 12px", gap: "8px" }}>
        <div style={{ width: "20px", height: "20px", borderRadius: "5px", backgroundColor: state.primaryColor, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {state.logo_url
            ? <Image src={state.logo_url} alt="" width={20} height={20} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "4px" }} unoptimized />
            : <Zap style={{ width: "10px", height: "10px", color: "#fff", fill: "#fff" }} />
          }
        </div>
        <span style={{ fontSize: "11px", fontWeight: 700, color: "#fafafa" }}>
          {state.senderName || "Your Brand"}
        </span>
        <div style={{ flex: 1 }} />
        <div style={{ width: "20px", height: "20px", borderRadius: "50%", backgroundColor: state.primaryColor + "33" }} />
      </div>

      {/* Mini sidebar + content */}
      <div style={{ display: "flex", height: "140px" }}>
        <div style={{ width: "32px", backgroundColor: "#0a0a0a", borderRight: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "10px", gap: "8px" }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ width: "18px", height: "18px", borderRadius: "4px", backgroundColor: i === 0 ? state.primaryColor + "33" : "rgba(255,255,255,0.04)" }} />
          ))}
        </div>
        <div style={{ flex: 1, padding: "10px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
            {[state.primaryColor, state.secondaryColor, "#1a1a1a", "#1a1a1a"].map((bg, i) => (
              <div key={i} style={{ height: "28px", borderRadius: "6px", backgroundColor: i < 2 ? bg + "22" : bg, border: `1px solid ${i < 2 ? bg + "44" : "rgba(255,255,255,0.05)"}` }} />
            ))}
          </div>
          <div style={{ marginTop: "8px", height: "48px", borderRadius: "6px", backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.05)" }} />
        </div>
      </div>

      {/* Subdomain chip */}
      {state.subdomain && (
        <div style={{ padding: "8px 12px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "6px" }}>
          <Globe style={{ width: "11px", height: "11px", color: "#52525b" }} />
          <span style={{ fontSize: "10px", color: "#52525b" }}>{state.subdomain}.trackhive.io</span>
        </div>
      )}
    </div>
  )
}

/* ── Main component ──────────────────────────────────── */
export function WhitelabelSettings() {
  const [state, setState] = useState<WLState>({
    subdomain: "",
    subdomainStatus: "unconfigured",
    logo_url: "",
    primaryColor: "#7C3AED",
    secondaryColor: "#3b82f6",
    senderName: "",
    senderEmail: "",
    showCompetitors: true,
    showTrends: true,
    showPayments: false,
    removeWatermark: false,
  })
  const [saving] = useState(false)
  const logoRef = useRef<HTMLInputElement>(null)

  function set<K extends keyof WLState>(k: K, v: WLState[K]) {
    setState(prev => ({ ...prev, [k]: v }))
  }

  function handleLogoFile(file: File) {
    if (!file.type.startsWith("image/")) return
    const reader = new FileReader()
    reader.onload = e => { if (e.target?.result) set("logo_url", e.target.result as string) }
    reader.readAsDataURL(file)
  }

  function handleComingSoon() {
    toast.info("Coming soon", { description: "White-label launching soon." })
  }

  async function handleSave() {
    handleComingSoon()
  }

  function handleSubdomainSave() {
    handleComingSoon()
  }

  if (!IS_AGENCY) return <UpgradeGate />

  const statusConfig: Record<SubdomainStatus, { label: string; color: string; bg: string }> = {
    connected:    { label: "Connected",     color: "#34d399", bg: "rgba(52,211,153,0.12)" },
    pending:      { label: "Pending DNS",   color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
    unconfigured: { label: "Not Configured", color: "#71717a", bg: "rgba(113,113,122,0.12)" },
  }
  const statusCfg = statusConfig[state.subdomainStatus]

  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", color: "#fafafa" } }} />

      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#fafafa", marginBottom: "4px" }}>White-label</h2>
        <p style={{ fontSize: "13px", color: "#71717a" }}>Brand TrackHive as your own and customise the client experience.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "16px" }} className="max-lg:grid-cols-1">

        <div>
          {/* Subdomain */}
          <SectionCard title="Custom Subdomain" description="Your clients will access TrackHive at this URL.">
            <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "#a1a1aa", display: "block", marginBottom: "5px" }}>Subdomain</label>
                <div style={{ display: "flex", alignItems: "center", borderRadius: "8px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.04)" }}>
                  <input
                    type="text"
                    placeholder="yourbrand"
                    value={state.subdomain}
                    onChange={e => set("subdomain", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    style={{ flex: 1, padding: "9px 12px", backgroundColor: "transparent", border: "none", color: "#e4e4e7", fontSize: "13px", outline: "none" }}
                  />
                  <span style={{ padding: "0 12px", fontSize: "12px", color: "#52525b", backgroundColor: "rgba(255,255,255,0.02)", borderLeft: "1px solid rgba(255,255,255,0.06)", whiteSpace: "nowrap", height: "100%", display: "flex", alignItems: "center" }}>
                    .trackhive.io
                  </span>
                </div>
              </div>
              <button
                onClick={handleSubdomainSave}
                style={{ padding: "9px 16px", borderRadius: "8px", backgroundColor: "#7C3AED", color: "#fff", fontSize: "12px", fontWeight: 600, border: "none", cursor: "pointer", flexShrink: 0 }}
              >
                Save Subdomain
              </button>
            </div>
            <div style={{ marginTop: "10px", display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "6px", backgroundColor: statusCfg.bg }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: statusCfg.color }} />
              <span style={{ fontSize: "11px", fontWeight: 600, color: statusCfg.color }}>{statusCfg.label}</span>
            </div>
          </SectionCard>

          {/* Branding */}
          <SectionCard title="Branding" description="Upload your logo and set your brand colours.">
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Logo */}
              <div>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "#a1a1aa", display: "block", marginBottom: "8px" }}>Brand Logo</label>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    {state.logo_url ? <Image src={state.logo_url} alt="" width={48} height={48} style={{ width: "100%", height: "100%", objectFit: "cover" }} unoptimized /> : <Building2 style={{ width: "20px", height: "20px", color: "#52525b" }} />}
                  </div>
                  <button onClick={handleComingSoon} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "7px 14px", borderRadius: "7px", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#a1a1aa", fontSize: "12px", fontWeight: 500, cursor: "pointer" }}>
                    <Upload style={{ width: "13px", height: "13px" }} /> Upload Logo
                  </button>
                  <input ref={logoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) handleLogoFile(f) }} />
                </div>
              </div>

              {/* Colors */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 600, color: "#a1a1aa", display: "block", marginBottom: "5px" }}>Primary Colour</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <input type="color" value={state.primaryColor} onChange={e => set("primaryColor", e.target.value)} style={{ width: "24px", height: "24px", borderRadius: "4px", border: "none", cursor: "pointer", backgroundColor: "transparent" }} />
                    <span style={{ fontSize: "12px", color: "#a1a1aa", fontFamily: "monospace" }}>{state.primaryColor}</span>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 600, color: "#a1a1aa", display: "block", marginBottom: "5px" }}>Secondary Colour</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <input type="color" value={state.secondaryColor} onChange={e => set("secondaryColor", e.target.value)} style={{ width: "24px", height: "24px", borderRadius: "4px", border: "none", cursor: "pointer", backgroundColor: "transparent" }} />
                    <span style={{ fontSize: "12px", color: "#a1a1aa", fontFamily: "monospace" }}>{state.secondaryColor}</span>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Email customisation */}
          <SectionCard title="Email Customisation" description="Customise how automated emails appear to your clients.">
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "#a1a1aa", display: "block", marginBottom: "5px" }}>Sender Name</label>
                <input style={inputStyle} className="focus:border-purple-500/40" placeholder="Your Agency" value={state.senderName} onChange={e => set("senderName", e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "#a1a1aa", display: "block", marginBottom: "5px" }}>Sender Email</label>
                <input style={inputStyle} className="focus:border-purple-500/40" type="email" placeholder="reports@youragency.com" value={state.senderEmail} onChange={e => set("senderEmail", e.target.value)} />
              </div>
            </div>
          </SectionCard>

          {/* Client portal toggles */}
          <SectionCard title="Client Portal Visibility" description="Choose which modules your clients can see.">
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { key: "showCompetitors" as const, label: "Show Competitor Intelligence module" },
                { key: "showTrends"      as const, label: "Show Trends module" },
                { key: "showPayments"   as const, label: "Show Payment details to clients" },
              ].map(({ key, label }) => (
                <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {state[key] ? <Eye style={{ width: "14px", height: "14px", color: "#a855f7" }} /> : <EyeOff style={{ width: "14px", height: "14px", color: "#52525b" }} />}
                    <span style={{ fontSize: "13px", color: "#a1a1aa" }}>{label}</span>
                  </div>
                  <Toggle checked={state[key] as boolean} onChange={v => set(key, v)} />
                </div>
              ))}
            </div>
          </SectionCard>

          {/* PDF reports */}
          <SectionCard title="PDF Reports">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div>
                <p style={{ fontSize: "13px", color: "#fafafa", fontWeight: 500 }}>Remove TrackHive watermark</p>
                <p style={{ fontSize: "11px", color: "#71717a", marginTop: "2px" }}>Your agency branding will appear on exported PDFs instead.</p>
              </div>
              <Toggle checked={state.removeWatermark} onChange={v => set("removeWatermark", v)} />
            </div>
          </SectionCard>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "9px 20px", borderRadius: "8px", backgroundColor: saving ? "rgba(124,58,237,0.5)" : "#7C3AED", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", border: "none", boxShadow: "0 0 20px rgba(124,58,237,0.25)" }}
            >
              {saving
                ? <><div style={{ width: "13px", height: "13px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", animation: "spin 0.7s linear infinite" }} />Saving...</>
                : <><Check style={{ width: "13px", height: "13px" }} />Save Settings</>
              }
            </button>
          </div>
        </div>

        {/* Live preview */}
        <div style={{ position: "sticky", top: "24px" }}>
          <div style={{ marginBottom: "10px" }}>
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Live Preview</span>
          </div>
          <LivePreview state={state} />
          <p style={{ fontSize: "11px", color: "#3f3f46", marginTop: "8px", textAlign: "center" }}>Updates reflect your saved settings</p>
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  )
}
