"use client"

import { useState, useRef } from "react"
import {
  User, Mail, Lock, Camera, Save, Eye, EyeOff,
  CheckCircle2, Shield, Trash2, AlertTriangle, LogOut,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { createBrowserClient } from "@supabase/ssr"

/* ─── Types ─────────────────────────────────────────── */
interface ProfileForm {
  name: string
  email: string
  jobTitle: string
  timezone: string
}

const TIMEZONES = [
  "UTC", "America/New_York", "America/Chicago", "America/Denver",
  "America/Los_Angeles", "Europe/London", "Europe/Paris", "Asia/Kolkata",
  "Asia/Tokyo", "Australia/Sydney",
]

/* ─── Section wrapper ───────────────────────────────── */
function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#111111] overflow-hidden">
      <div className="px-6 py-5 border-b border-white/[0.05]">
        <h2 className="text-[15px] font-semibold text-white">{title}</h2>
        <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

/* ─── Input field ───────────────────────────────────── */
function Field({
  label, value, onChange, type = "text", placeholder, icon: Icon, disabled,
}: {
  label: string; value: string; onChange?: (v: string) => void
  type?: string; placeholder?: string; icon?: React.ElementType; disabled?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-zinc-400">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600 pointer-events-none" />}
        <input
          type={type}
          value={value}
          onChange={e => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full ${Icon ? "pl-9" : "pl-3"} pr-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-purple-500/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
        />
      </div>
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────── */
export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileForm>({
    name: "Rahul Saini",
    email: "rahul@trackhive.io",
    jobTitle: "Founder",
    timezone: "Asia/Kolkata",
  })
  const [avatarSrc, setAvatarSrc] = useState("https://api.dicebear.com/7.x/avataaars/svg?seed=trackhive")
  const [saving, setSaving] = useState(false)

  const [currentPwd, setCurrentPwd] = useState("")
  const [newPwd, setNewPwd]         = useState("")
  const [confirmPwd, setConfirmPwd] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew]         = useState(false)
  const [savingPwd, setSavingPwd]     = useState(false)

  const [deleteInput, setDeleteInput] = useState("")
  const [showDelete, setShowDelete]   = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setAvatarSrc(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function handleSaveProfile() {
    if (!profile.name.trim()) { toast.error("Name is required"); return }
    setSaving(true)
    await new Promise(r => setTimeout(r, 900))
    setSaving(false)
    toast.success("Profile updated")
  }

  async function handleChangePassword() {
    if (!currentPwd || !newPwd) { toast.error("Fill in all password fields"); return }
    if (newPwd.length < 8) { toast.error("Password must be at least 8 characters"); return }
    if (newPwd !== confirmPwd) { toast.error("Passwords don't match"); return }
    setSavingPwd(true)
    await new Promise(r => setTimeout(r, 1000))
    setSavingPwd(false)
    setCurrentPwd(""); setNewPwd(""); setConfirmPwd("")
    toast.success("Password changed successfully")
  }

  async function handleSignOut() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  const pwdStrength = newPwd.length === 0 ? 0
    : newPwd.length < 6 ? 1
    : newPwd.length < 10 ? 2
    : /[A-Z]/.test(newPwd) && /[0-9]/.test(newPwd) ? 4 : 3

  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"]
  const strengthColors = ["", "#ef4444", "#f59e0b", "#3b82f6", "#10b981"]

  return (
    <div className="max-w-2xl space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-semibold text-white tracking-tight">Profile</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Manage your personal account settings.</p>
      </div>

      {/* ── Avatar + Basic Info ─────────────────────── */}
      <Section title="Personal Information" description="Update your name, avatar, and account details.">
        {/* Avatar picker */}
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-white/[0.05]">
          <div className="relative group">
            <Avatar className="w-16 h-16 ring-2 ring-purple-500/20">
              <AvatarImage src={avatarSrc} />
              <AvatarFallback className="bg-purple-600/20 text-purple-400 text-lg font-bold">
                {profile.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Camera className="w-5 h-5 text-white" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-200">{profile.name}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{profile.email}</p>
            <button
              onClick={() => fileRef.current?.click()}
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors mt-2"
            >
              Change avatar
            </button>
          </div>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <Field label="Full name"   value={profile.name}     onChange={v => setProfile(p => ({ ...p, name: v }))}     icon={User}  placeholder="Your name" />
          <Field label="Email"       value={profile.email}    disabled icon={Mail} />
          <Field label="Job title"   value={profile.jobTitle} onChange={v => setProfile(p => ({ ...p, jobTitle: v }))} placeholder="e.g. Growth Manager" />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-400">Timezone</label>
            <select
              value={profile.timezone}
              onChange={e => setProfile(p => ({ ...p, timezone: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-200 outline-none focus:border-purple-500/40 transition-colors"
            >
              {TIMEZONES.map(tz => (
                <option key={tz} value={tz} className="bg-[#1a1a1a]">{tz}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-zinc-600 mb-4 flex items-center gap-1.5">
          <Mail className="w-3 h-3" />
          Email cannot be changed here. Contact <a href="mailto:support@trackhive.io" className="text-purple-400 hover:underline">support@trackhive.io</a> to update your email.
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-sm font-semibold transition-all"
        >
          {saving ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </Section>

      {/* ── Password ────────────────────────────────── */}
      <Section title="Change Password" description="Use a strong, unique password to keep your account secure.">
        <div className="space-y-4">
          {/* Current password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-400">Current password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600 pointer-events-none" />
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPwd}
                onChange={e => setCurrentPwd(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-200 outline-none focus:border-purple-500/40 transition-colors"
              />
              <button onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
                {showCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-400">New password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600 pointer-events-none" />
              <input
                type={showNew ? "text" : "password"}
                value={newPwd}
                onChange={e => setNewPwd(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-200 outline-none focus:border-purple-500/40 transition-colors"
              />
              <button onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
                {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {/* Strength meter */}
            {newPwd && (
              <div className="flex items-center gap-2 mt-1">
                <div className="flex gap-1 flex-1">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-1 flex-1 rounded-full transition-all" style={{ backgroundColor: i <= pwdStrength ? strengthColors[pwdStrength] : "rgba(255,255,255,0.08)" }} />
                  ))}
                </div>
                <span className="text-[11px] font-medium" style={{ color: strengthColors[pwdStrength] }}>{strengthLabels[pwdStrength]}</span>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-400">Confirm new password</label>
            <div className="relative">
              <input
                type="password"
                value={confirmPwd}
                onChange={e => setConfirmPwd(e.target.value)}
                placeholder="Repeat new password"
                className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-200 outline-none focus:border-purple-500/40 transition-colors"
              />
              {confirmPwd && newPwd && (
                <CheckCircle2 className={`absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${confirmPwd === newPwd ? "text-emerald-400" : "text-red-400"}`} />
              )}
            </div>
          </div>

          <button
            onClick={handleChangePassword}
            disabled={savingPwd || !currentPwd || !newPwd || !confirmPwd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-sm font-semibold transition-all"
          >
            {savingPwd ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Shield className="w-4 h-4" />}
            {savingPwd ? "Updating…" : "Update Password"}
          </button>
        </div>
      </Section>

      {/* ── Sessions ─────────────────────────────────── */}
      <Section title="Active Sessions" description="Devices currently signed in to your account.">
        {[
          { device: "Chrome on macOS", location: "Mumbai, IN", current: true,  time: "Now" },
          { device: "Safari on iPhone", location: "Mumbai, IN", current: false, time: "2 hours ago" },
        ].map((session, i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-zinc-200">{session.device}</p>
                {session.current && <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">Current</span>}
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">{session.location} · {session.time}</p>
            </div>
            {!session.current && (
              <button onClick={() => toast.success("Session revoked")} className="text-xs text-red-400 hover:text-red-300 transition-colors">Revoke</button>
            )}
          </div>
        ))}
        <button onClick={handleSignOut} className="mt-4 flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
          <LogOut className="w-3.5 h-3.5" />
          Sign out of this device
        </button>
      </Section>

      {/* ── Danger Zone ──────────────────────────────── */}
      <div className="rounded-xl border border-red-500/15 bg-red-500/5 overflow-hidden">
        <div className="px-6 py-5 border-b border-red-500/10">
          <h2 className="text-[15px] font-semibold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            Danger Zone
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">Irreversible actions. Proceed with caution.</p>
        </div>
        <div className="p-6">
          {!showDelete ? (
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-sm font-medium text-zinc-200">Delete account</p>
                <p className="text-xs text-zinc-500 mt-0.5">Permanently delete your account and all workspace data. This cannot be undone.</p>
              </div>
              <button
                onClick={() => setShowDelete(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/15 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete account
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-zinc-300">Type <span className="font-mono text-red-400 font-semibold">delete my account</span> to confirm.</p>
              <input
                value={deleteInput}
                onChange={e => setDeleteInput(e.target.value)}
                placeholder="delete my account"
                className="w-full px-3 py-2.5 rounded-lg bg-red-500/5 border border-red-500/20 text-sm text-zinc-200 outline-none focus:border-red-500/40 transition-colors"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { if (deleteInput === "delete my account") toast.error("Account deletion is disabled in demo mode") }}
                  disabled={deleteInput !== "delete my account"}
                  className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white text-sm font-semibold transition-all"
                >
                  Permanently delete
                </button>
                <button onClick={() => { setShowDelete(false); setDeleteInput("") }} className="px-4 py-2 rounded-lg bg-white/[0.05] text-zinc-400 text-sm hover:text-zinc-200 transition-all">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
