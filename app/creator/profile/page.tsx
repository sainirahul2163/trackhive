"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import {
  User, Mail, MapPin, Link as LinkIcon,
  Check, Edit3, Plus, Trash2, Bell, Shield, Eye, EyeOff, Save,
} from "lucide-react"

function InstagramIcon({ style }: { style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

function YoutubeIcon({ style }: { style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" style={style}>
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" /><polygon fill="white" points="9.75,15.02 15.5,12 9.75,8.98 9.75,15.02" />
    </svg>
  )
}

// TikTok icon as SVG component
function TikTokIcon({ style }: { style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" style={style}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.27 8.27 0 0 0 4.84 1.55V6.78a4.85 4.85 0 0 1-1.07-.09z" />
    </svg>
  )
}

// ── Types ──────────────────────────────────────────────────────
interface SocialAccount {
  id: string
  platform: "tiktok" | "instagram" | "youtube"
  handle: string
  followers: number
  verified: boolean
}

interface ProfileForm {
  displayName: string
  email: string
  bio: string
  location: string
  website: string
  niche: string
}

interface NotifPrefs {
  newCampaign: boolean
  payoutSent: boolean
  videoMilestone: boolean
  weeklyDigest: boolean
}

const EMPTY_FORM: ProfileForm = {
  displayName: "",
  email: "",
  bio: "",
  location: "",
  website: "",
  niche: "",
}

const INITIAL_NOTIF: NotifPrefs = {
  newCampaign:    true,
  payoutSent:     true,
  videoMilestone: true,
  weeklyDigest:   false,
}

const NICHES = ["Fitness & Lifestyle", "Beauty & Skincare", "Fashion", "Tech & Gadgets", "Food & Cooking", "Travel", "Gaming", "Finance", "Education", "Parenting"]

function fmtFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

const PLAT_CFG = {
  tiktok:    { label: "TikTok",    color: "#fafafa", bg: "rgba(255,255,255,0.08)", Icon: TikTokIcon    },
  instagram: { label: "Instagram", color: "#f472b6", bg: "rgba(244,114,182,0.1)",  Icon: InstagramIcon },
  youtube:   { label: "YouTube",   color: "#f87171", bg: "rgba(248,113,113,0.1)",  Icon: YoutubeIcon   },
}

// ── Sub-components ─────────────────────────────────────────────
interface ToggleProps { value: boolean; onChange: (v: boolean) => void }
function Toggle({ value, onChange }: ToggleProps) {
  return (
    <button onClick={() => onChange(!value)}
      style={{ width: "38px", height: "22px", borderRadius: "99px", border: "none", cursor: "pointer", position: "relative", backgroundColor: value ? "#7C3AED" : "rgba(255,255,255,0.1)", transition: "background 200ms", flexShrink: 0 }}>
      <span style={{ position: "absolute", top: "3px", left: value ? "19px" : "3px", width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "white", transition: "left 200ms", display: "block" }} />
    </button>
  )
}

interface InputProps {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
  type?: string
  multiline?: boolean
}
function Field({ label, value, onChange, placeholder, icon: Icon, type = "text", multiline }: InputProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "11px", fontWeight: 700, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</label>
      <div style={{ position: "relative" }}>
        {Icon && <Icon style={{ position: "absolute", left: "11px", top: multiline ? "12px" : "50%", transform: multiline ? "none" : "translateY(-50%)", width: "13px", height: "13px", color: "#52525b" }} />}
        {multiline ? (
          <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3}
            style={{ width: "100%", padding: Icon ? "10px 12px 10px 32px" : "10px 12px", borderRadius: "9px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "#0d0d0d", color: "#fafafa", fontSize: "13px", outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} />
        ) : (
          <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
            style={{ width: "100%", padding: Icon ? "10px 12px 10px 32px" : "10px 12px", borderRadius: "9px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "#0d0d0d", color: "#fafafa", fontSize: "13px", outline: "none", height: "40px", boxSizing: "border-box" }} />
        )}
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────
export default function CreatorProfilePage() {
  const [form, setForm]         = useState<ProfileForm>(EMPTY_FORM)
  const [notif, setNotif]       = useState<NotifPrefs>(INITIAL_NOTIF)
  const [saved, setSaved]       = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [activeTab, setActiveTab] = useState<"profile" | "socials" | "notifications" | "security">("profile")
  const [socials]               = useState<SocialAccount[]>([])
  const [currentPwd, setCurrentPwd] = useState("")
  const [newPwd, setNewPwd]         = useState("")

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    supabase.auth.getUser().then(({ data }) => {
      const user = data?.user
      if (!user) return
      const meta = user.user_metadata
      const name = (meta?.full_name ?? meta?.name ?? "") as string
      setForm(f => ({
        ...f,
        displayName: name || f.displayName,
        email: user.email ?? f.email,
      }))
    }).catch(() => {})
  }, [])

  function set(key: keyof ProfileForm) {
    return (v: string) => setForm(f => ({ ...f, [key]: v }))
  }

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const initials = form.displayName
    ? form.displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "?"

  const TABS: { id: typeof activeTab; label: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }[] = [
    { id: "profile",       label: "Profile",       icon: User   },
    { id: "socials",       label: "Social Accounts", icon: LinkIcon },
    { id: "notifications", label: "Notifications", icon: Bell   },
    { id: "security",      label: "Security",      icon: Shield },
  ]

  return (
    <div style={{ maxWidth: "800px", display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#fafafa" }}>My Profile</h1>
          <p style={{ fontSize: "13px", color: "#71717a", marginTop: "3px" }}>Manage your creator identity and preferences</p>
        </div>
        {activeTab === "profile" && (
          <button onClick={handleSave}
            style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 16px", borderRadius: "9px", backgroundColor: saved ? "#052e16" : "#7C3AED", border: saved ? "1px solid rgba(52,211,153,0.3)" : "none", color: saved ? "#34d399" : "white", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 200ms" }}>
            {saved ? <Check style={{ width: "13px", height: "13px" }} /> : <Save style={{ width: "13px", height: "13px" }} />}
            {saved ? "Saved!" : "Save Changes"}
          </button>
        )}
      </div>

      {/* Avatar card */}
      <div style={{ borderRadius: "14px", border: "1px solid rgba(255,255,255,0.07)", backgroundColor: "#111111", padding: "20px 22px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <div style={{ position: "relative" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "linear-gradient(135deg, #7C3AED, #a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: 800, color: "white" }}>
            {initials}
          </div>
          <button style={{ position: "absolute", bottom: 0, right: 0, width: "22px", height: "22px", borderRadius: "50%", backgroundColor: "#7C3AED", border: "2px solid #111111", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Edit3 style={{ width: "9px", height: "9px", color: "white" }} />
          </button>
        </div>
        <div>
          <p style={{ fontSize: "16px", fontWeight: 800, color: "#fafafa" }}>{form.displayName || "Your name"}</p>
          <p style={{ fontSize: "12px", color: "#71717a", marginTop: "2px" }}>
            {[form.niche, form.location].filter(Boolean).join(" · ") || "Complete your profile"}
          </p>
        </div>
        {socials.length > 0 && (
        <div style={{ marginLeft: "auto", display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {socials.map(s => {
            const cfg = PLAT_CFG[s.platform]
            return (
              <div key={s.id} style={{ display: "flex", flex: "column", alignItems: "center", gap: "2px", textAlign: "center" }}>
                <p style={{ fontSize: "14px", fontWeight: 800, color: cfg.color }}>{fmtFollowers(s.followers)}</p>
                <p style={{ fontSize: "10px", color: "#52525b" }}>{cfg.label}</p>
              </div>
            )
          })}
        </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "3px", flexWrap: "wrap" }}>
        {TABS.map(t => {
          const Icon = t.icon
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 600, backgroundColor: activeTab === t.id ? "#1a1a1a" : "transparent", color: activeTab === t.id ? "#fafafa" : "#71717a", transition: "all 150ms", whiteSpace: "nowrap" }}>
              <Icon style={{ width: "12px", height: "12px" }} />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* ── Tab: Profile ─────────────────────────────────────── */}
      {activeTab === "profile" && (
        <div style={{ borderRadius: "14px", border: "1px solid rgba(255,255,255,0.07)", backgroundColor: "#111111", padding: "22px" }}>
          <p style={{ fontSize: "13px", fontWeight: 700, color: "#fafafa", marginBottom: "18px" }}>Basic Information</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <Field label="Display Name" value={form.displayName} onChange={set("displayName")} placeholder="Your name" icon={User} />
            <Field label="Email" value={form.email} onChange={set("email")} placeholder="you@email.com" icon={Mail} type="email" />
            <Field label="Location" value={form.location} onChange={set("location")} placeholder="City, Country" icon={MapPin} />
            <Field label="Website" value={form.website} onChange={set("website")} placeholder="yourwebsite.com" icon={LinkIcon} />
          </div>
          <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <Field label="Bio" value={form.bio} onChange={set("bio")} placeholder="Tell brands about yourself…" multiline />
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.07em" }}>Niche / Category</label>
              <div style={{ position: "relative" }}>
                <select value={form.niche} onChange={e => set("niche")(e.target.value)}
                  style={{ width: "100%", padding: "10px 32px 10px 12px", borderRadius: "9px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "#0d0d0d", color: form.niche ? "#fafafa" : "#52525b", fontSize: "13px", outline: "none", appearance: "none", cursor: "pointer", height: "40px", boxSizing: "border-box" }}>
                  <option value="">Select a niche</option>
                  {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <Edit3 style={{ position: "absolute", right: "11px", top: "50%", transform: "translateY(-50%)", width: "12px", height: "12px", color: "#52525b", pointerEvents: "none" }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Social Accounts ─────────────────────────────── */}
      {activeTab === "socials" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {socials.length === 0 ? (
            <div style={{ textAlign: "center", padding: "72px 24px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)", backgroundColor: "#111111" }}>
              <LinkIcon style={{ width: "24px", height: "24px", color: "#52525b", margin: "0 auto 12px" }} />
              <p style={{ fontSize: "15px", fontWeight: 700, color: "#fafafa", marginBottom: "6px" }}>No social accounts connected</p>
              <p style={{ fontSize: "13px", color: "#71717a" }}>Connect your TikTok, Instagram, or YouTube to get started.</p>
            </div>
          ) : socials.map(s => {
            const cfg = PLAT_CFG[s.platform]
            const Icon = cfg.Icon
            return (
              <div key={s.id} style={{ borderRadius: "13px", border: "1px solid rgba(255,255,255,0.07)", backgroundColor: "#111111", padding: "16px 18px", display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "11px", backgroundColor: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon style={{ width: "18px", height: "18px", color: cfg.color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <p style={{ fontSize: "14px", fontWeight: 700, color: "#fafafa" }}>{s.handle}</p>
                    {s.verified && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", padding: "1px 6px", borderRadius: "4px", backgroundColor: "rgba(52,211,153,0.1)", fontSize: "9px", fontWeight: 700, color: "#34d399" }}>
                        <Check style={{ width: "8px", height: "8px" }} />
                        Verified
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: "11px", color: "#52525b", marginTop: "2px" }}>{fmtFollowers(s.followers)} followers · {cfg.label}</p>
                </div>
                <button style={{ padding: "6px", borderRadius: "7px", border: "none", backgroundColor: "rgba(248,113,113,0.08)", cursor: "pointer" }}>
                  <Trash2 style={{ width: "13px", height: "13px", color: "#f87171" }} />
                </button>
              </div>
            )
          })}

          <button style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "13px", borderRadius: "12px", border: "1px dashed rgba(255,255,255,0.1)", backgroundColor: "transparent", color: "#71717a", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
            <Plus style={{ width: "14px", height: "14px" }} />
            Connect another account
          </button>
        </div>
      )}

      {/* ── Tab: Notifications ───────────────────────────────── */}
      {activeTab === "notifications" && (
        <div style={{ borderRadius: "14px", border: "1px solid rgba(255,255,255,0.07)", backgroundColor: "#111111", overflow: "hidden" }}>
          {([
            { key: "newCampaign",    label: "New Campaign Invite",   desc: "Get notified when a brand invites you to a campaign" },
            { key: "payoutSent",     label: "Payout Sent",           desc: "Alert when a payment is processed or sent" },
            { key: "videoMilestone", label: "Video Milestones",      desc: "Celebrate when a video hits 100K, 500K, 1M+ views" },
            { key: "weeklyDigest",   label: "Weekly Digest",         desc: "Summary of your performance sent every Monday" },
          ] as { key: keyof NotifPrefs; label: string; desc: string }[]).map((item, i, arr) => (
            <div key={item.key} style={{ padding: "16px 18px", borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", display: "flex", alignItems: "center", gap: "14px" }}>
              <Bell style={{ width: "14px", height: "14px", color: "#52525b", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#fafafa" }}>{item.label}</p>
                <p style={{ fontSize: "11px", color: "#71717a", marginTop: "2px" }}>{item.desc}</p>
              </div>
              <Toggle value={notif[item.key]} onChange={v => setNotif(n => ({ ...n, [item.key]: v }))} />
            </div>
          ))}
        </div>
      )}

      {/* ── Tab: Security ────────────────────────────────────── */}
      {activeTab === "security" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ borderRadius: "14px", border: "1px solid rgba(255,255,255,0.07)", backgroundColor: "#111111", padding: "22px" }}>
            <p style={{ fontSize: "13px", fontWeight: 700, color: "#fafafa", marginBottom: "16px" }}>Change Password</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.07em" }}>Current Password</label>
                <div style={{ position: "relative" }}>
                  <input type={showPass ? "text" : "password"} value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} placeholder="••••••••"
                    style={{ width: "100%", padding: "10px 36px 10px 12px", borderRadius: "9px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "#0d0d0d", color: "#fafafa", fontSize: "13px", outline: "none", height: "40px", boxSizing: "border-box" }} />
                  <button onClick={() => setShowPass(v => !v)} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    {showPass
                      ? <EyeOff style={{ width: "14px", height: "14px", color: "#52525b" }} />
                      : <Eye    style={{ width: "14px", height: "14px", color: "#52525b" }} />
                    }
                  </button>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.07em" }}>New Password</label>
                <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="Min. 8 characters"
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "9px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "#0d0d0d", color: "#fafafa", fontSize: "13px", outline: "none", height: "40px", boxSizing: "border-box" }} />
              </div>
              <button style={{ alignSelf: "flex-start", padding: "9px 18px", borderRadius: "9px", backgroundColor: "#7C3AED", color: "white", fontSize: "13px", fontWeight: 600, border: "none", cursor: "pointer" }}>
                Update Password
              </button>
            </div>
          </div>

          <div style={{ borderRadius: "14px", border: "1px solid rgba(255,255,255,0.07)", backgroundColor: "#111111", padding: "22px" }}>
            <p style={{ fontSize: "13px", fontWeight: 700, color: "#fafafa", marginBottom: "6px" }}>Active Sessions</p>
            <p style={{ fontSize: "12px", color: "#71717a", marginBottom: "14px" }}>You are currently signed in on 1 device.</p>
            <button style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid rgba(248,113,113,0.2)", backgroundColor: "rgba(248,113,113,0.05)", color: "#f87171", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
              Sign out all other sessions
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
