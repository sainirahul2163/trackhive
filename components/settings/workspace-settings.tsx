"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Image from "next/image"
import { Upload, Globe, Building2, Clock, X, Check } from "lucide-react"
import { toast, Toaster } from "sonner"
import { supabase } from "@/lib/supabase"

const INDUSTRIES = [
  "Beauty", "Tech", "Finance", "Fitness",
  "Food", "Gaming", "Lifestyle", "Other",
]

const TIMEZONES = [
  "UTC", "America/New_York", "America/Chicago",
  "America/Denver", "America/Los_Angeles",
  "Europe/London", "Europe/Paris", "Europe/Berlin",
  "Asia/Dubai", "Asia/Kolkata", "Asia/Singapore",
  "Asia/Tokyo", "Australia/Sydney",
]

interface WorkspaceData {
  name: string
  website: string
  industry: string
  timezone: string
  logo_url: string
}

/* ── Shared input styles ─────────────────────────────── */
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: "8px",
  backgroundColor: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#e4e4e7",
  fontSize: "13px",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
}

function FieldLabel({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#a1a1aa", marginBottom: "6px" }}>
      {children}
      {optional && <span style={{ color: "#52525b", fontWeight: 400, marginLeft: "4px" }}>(optional)</span>}
    </label>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: "#111111", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", padding: "24px", marginBottom: "16px" }}>
      <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#fafafa", marginBottom: "20px" }}>{title}</h3>
      {children}
    </div>
  )
}

/* ── Logo uploader ───────────────────────────────────── */
function LogoUploader({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return
    const reader = new FileReader()
    reader.onload = e => { if (e.target?.result) onChange(e.target.result as string) }
    reader.readAsDataURL(file)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
      {/* Preview */}
      <div style={{ width: "64px", height: "64px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        {value
          ? <Image src={value} alt="Logo" width={64} height={64} style={{ width: "100%", height: "100%", objectFit: "cover" }} unoptimized />
          : <Building2 style={{ width: "24px", height: "24px", color: "#52525b" }} />
        }
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          flex: 1, padding: "20px", borderRadius: "8px", cursor: "pointer",
          border: `1px dashed ${dragging ? "rgba(124,58,237,0.6)" : "rgba(255,255,255,0.1)"}`,
          backgroundColor: dragging ? "rgba(124,58,237,0.05)" : "rgba(255,255,255,0.02)",
          textAlign: "center", transition: "all 0.15s",
        }}
      >
        <Upload style={{ width: "18px", height: "18px", color: "#52525b", margin: "0 auto 6px" }} />
        <p style={{ fontSize: "12px", color: "#71717a" }}>
          <span style={{ color: "#a855f7", fontWeight: 600 }}>Click to upload</span> or drag and drop
        </p>
        <p style={{ fontSize: "11px", color: "#52525b", marginTop: "2px" }}>PNG, JPG or SVG — max 2MB</p>
        <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
      </div>

      {value && (
        <button
          onClick={() => onChange("")}
          style={{ width: "28px", height: "28px", borderRadius: "6px", backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
        >
          <X style={{ width: "12px", height: "12px", color: "#f87171" }} />
        </button>
      )}
    </div>
  )
}

/* ── Main component ──────────────────────────────────── */
export function WorkspaceSettings() {
  const [data, setData] = useState<WorkspaceData>({
    name: "", website: "", industry: "Beauty", timezone: "UTC", logo_url: "",
  })
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const loadWorkspace = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: ws } = await supabase
      .from("workspaces")
      .select("*")
      .eq("owner_id", user.id)
      .maybeSingle()
    if (ws) {
      setData({
        name: ws.name ?? "",
        website: ws.website ?? "",
        industry: ws.industry ?? "Beauty",
        timezone: ws.timezone ?? "UTC",
        logo_url: ws.logo_url ?? "",
      })
    }
    setLoaded(true)
  }, [])

  useEffect(() => { loadWorkspace() }, [loadWorkspace])

  async function handleSave() {
    if (!data.name.trim()) { toast.error("Workspace name is required"); return }
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const payload = {
        owner_id: user.id,
        name: data.name.trim(),
        website: data.website.trim(),
        industry: data.industry,
        timezone: data.timezone,
        logo_url: data.logo_url,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from("workspaces")
        .upsert(payload, { onConflict: "owner_id" })

      if (error) throw error
      toast.success("Workspace saved", { description: "Your settings have been updated." })
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong"
      toast.error("Failed to save", { description: msg })
    } finally {
      setSaving(false)
    }
  }

  function set(key: keyof WorkspaceData, value: string) {
    setData(prev => ({ ...prev, [key]: value }))
  }

  if (!loaded) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px" }}>
        <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.1)", borderTop: "2px solid #7C3AED", animation: "spin 0.7s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", color: "#fafafa" } }} />

      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#fafafa", marginBottom: "4px" }}>Workspace Settings</h2>
        <p style={{ fontSize: "13px", color: "#71717a" }}>Configure your workspace name, branding and regional settings.</p>
      </div>

      {/* General info */}
      <SectionCard title="General Information">
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <FieldLabel>Workspace Name *</FieldLabel>
            <input
              style={inputStyle}
              className="focus:border-purple-500/40"
              placeholder="My Agency"
              value={data.name}
              onChange={e => set("name", e.target.value)}
            />
          </div>

          <div>
            <FieldLabel optional>Company Website</FieldLabel>
            <div style={{ position: "relative" }}>
              <Globe style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: "#52525b" }} />
              <input
                style={{ ...inputStyle, paddingLeft: "32px" }}
                className="focus:border-purple-500/40"
                placeholder="https://yourcompany.com"
                type="url"
                value={data.website}
                onChange={e => set("website", e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <FieldLabel>Industry / Niche</FieldLabel>
              <select
                style={{ ...inputStyle, cursor: "pointer" }}
                className="focus:border-purple-500/40"
                value={data.industry}
                onChange={e => set("industry", e.target.value)}
              >
                {INDUSTRIES.map(i => <option key={i} value={i} style={{ backgroundColor: "#1a1a1a" }}>{i}</option>)}
              </select>
            </div>
            <div>
              <FieldLabel>Default Timezone</FieldLabel>
              <div style={{ position: "relative" }}>
                <Clock style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", width: "13px", height: "13px", color: "#52525b" }} />
                <select
                  style={{ ...inputStyle, paddingLeft: "30px", cursor: "pointer" }}
                  className="focus:border-purple-500/40"
                  value={data.timezone}
                  onChange={e => set("timezone", e.target.value)}
                >
                  {TIMEZONES.map(tz => <option key={tz} value={tz} style={{ backgroundColor: "#1a1a1a" }}>{tz}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Logo */}
      <SectionCard title="Workspace Logo">
        <LogoUploader value={data.logo_url} onChange={url => set("logo_url", url)} />
      </SectionCard>

      {/* Save */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display: "inline-flex", alignItems: "center", gap: "7px",
            padding: "9px 20px", borderRadius: "8px",
            backgroundColor: saving ? "rgba(124,58,237,0.5)" : "#7C3AED",
            color: "#fff", fontSize: "13px", fontWeight: 600,
            cursor: saving ? "not-allowed" : "pointer", border: "none",
            transition: "background-color 0.15s",
            boxShadow: "0 0 20px rgba(124,58,237,0.25)",
          }}
        >
          {saving
            ? <><div style={{ width: "13px", height: "13px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", animation: "spin 0.7s linear infinite" }} /> Saving...</>
            : <><Check style={{ width: "13px", height: "13px" }} /> Save Changes</>
          }
        </button>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  )
}
