"use client"

import { useState } from "react"
import { UserPlus, Trash2, Mail, Clock, Check, X, ChevronDown } from "lucide-react"
import { toast, Toaster } from "sonner"

type Role = "Admin" | "Member" | "Viewer"
type MemberStatus = "Active" | "Pending"

interface TeamMember {
  id: string
  name: string
  email: string
  role: Role
  status: MemberStatus
  avatarColor: string
}

interface PendingInvite {
  id: string
  email: string
  role: Role
  sentAt: string
}

const ROLE_COLORS: Record<Role, { bg: string; text: string }> = {
  Admin:  { bg: "rgba(124,58,237,0.15)",  text: "#a855f7" },
  Member: { bg: "rgba(59,130,246,0.15)",  text: "#60a5fa" },
  Viewer: { bg: "rgba(113,113,122,0.15)", text: "#a1a1aa" },
}

const INIT_MEMBERS: TeamMember[] = [
  { id: "1", name: "Rahul Saini",   email: "rahul@trackhive.io",  role: "Admin",  status: "Active",  avatarColor: "#7C3AED" },
  { id: "2", name: "Sarah Chen",    email: "sarah@luminary.co",   role: "Member", status: "Active",  avatarColor: "#3b82f6" },
  { id: "3", name: "Marcus Webb",   email: "marcus@fivex.io",     role: "Viewer", status: "Active",  avatarColor: "#10b981" },
]

const INIT_INVITES: PendingInvite[] = [
  { id: "i1", email: "priya@novareach.com", role: "Member", sentAt: "2 hours ago" },
]

function RoleBadge({ role }: { role: Role }) {
  const c = ROLE_COLORS[role]
  return (
    <span style={{ fontSize: "11px", fontWeight: 600, backgroundColor: c.bg, color: c.text, padding: "2px 8px", borderRadius: "5px" }}>
      {role}
    </span>
  )
}

function Avatar({ name, color }: { name: string; color: string }) {
  return (
    <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: `${color}22`, border: `1px solid ${color}44`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ fontSize: "12px", fontWeight: 700, color }}>{name[0].toUpperCase()}</span>
    </div>
  )
}

function RoleSelect({ value, onChange }: { value: Role; onChange: (r: Role) => void }) {
  const ROLES: Role[] = ["Admin", "Member", "Viewer"]
  return (
    <div style={{ position: "relative" }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value as Role)}
        style={{ padding: "7px 28px 7px 10px", borderRadius: "6px", backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#e4e4e7", fontSize: "12px", outline: "none", cursor: "pointer", appearance: "none", width: "100%" }}
      >
        {ROLES.map(r => <option key={r} value={r} style={{ backgroundColor: "#1a1a1a" }}>{r}</option>)}
      </select>
      <ChevronDown style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", width: "12px", height: "12px", color: "#52525b", pointerEvents: "none" }} />
    </div>
  )
}

export function TeamSettings() {
  const [members, setMembers]   = useState<TeamMember[]>(INIT_MEMBERS)
  const [invites, setInvites]   = useState<PendingInvite[]>(INIT_INVITES)
  const [showForm, setShowForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole]   = useState<Role>("Member")
  const [sending, setSending]   = useState(false)

  function removeMember(id: string) {
    const m = members.find(x => x.id === id)
    if (m?.role === "Admin") { toast.error("Cannot remove the Admin"); return }
    setMembers(prev => prev.filter(x => x.id !== id))
    toast.success("Member removed")
  }

  function revokeInvite(id: string) {
    setInvites(prev => prev.filter(x => x.id !== id))
    toast.success("Invite revoked")
  }

  async function sendInvite() {
    if (!inviteEmail.trim()) { toast.error("Enter an email address"); return }
    if (!/^\S+@\S+\.\S+$/.test(inviteEmail)) { toast.error("Invalid email address"); return }
    if (members.some(m => m.email === inviteEmail) || invites.some(i => i.email === inviteEmail)) {
      toast.error("This email is already in your team"); return
    }
    setSending(true)
    await new Promise(r => setTimeout(r, 800))
    setInvites(prev => [...prev, { id: `i${Date.now()}`, email: inviteEmail.trim(), role: inviteRole, sentAt: "Just now" }])
    setInviteEmail("")
    setInviteRole("Member")
    setShowForm(false)
    setSending(false)
    toast.success("Invite sent", { description: `${inviteEmail} will receive an email shortly.` })
  }

  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", color: "#fafafa" } }} />

      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#fafafa", marginBottom: "4px" }}>Team Members</h2>
          <p style={{ fontSize: "13px", color: "#71717a" }}>{members.length} active member{members.length !== 1 ? "s" : ""} on this workspace.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "8px", backgroundColor: "#7C3AED", color: "#fff", fontSize: "13px", fontWeight: 600, border: "none", cursor: "pointer", boxShadow: "0 0 16px rgba(124,58,237,0.25)", transition: "background-color 0.15s", flexShrink: 0 }}
          className="hover:bg-purple-700"
        >
          <UserPlus style={{ width: "14px", height: "14px" }} />
          Invite Member
        </button>
      </div>

      {/* Invite form */}
      {showForm && (
        <div style={{ backgroundColor: "#111111", borderRadius: "12px", border: "1px solid rgba(124,58,237,0.25)", padding: "20px", marginBottom: "16px" }}>
          <h4 style={{ fontSize: "13px", fontWeight: 600, color: "#fafafa", marginBottom: "14px" }}>Send Invitation</h4>
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#a1a1aa", marginBottom: "5px" }}>Email Address</label>
              <div style={{ position: "relative" }}>
                <Mail style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", width: "13px", height: "13px", color: "#52525b" }} />
                <input
                  type="email"
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendInvite()}
                  style={{ width: "100%", padding: "8px 12px 8px 32px", borderRadius: "7px", backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#e4e4e7", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                  className="focus:border-purple-500/40"
                  autoFocus
                />
              </div>
            </div>
            <div style={{ width: "120px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#a1a1aa", marginBottom: "5px" }}>Role</label>
              <RoleSelect value={inviteRole} onChange={setInviteRole} />
            </div>
            <button
              onClick={sendInvite}
              disabled={sending}
              style={{ padding: "8px 16px", borderRadius: "7px", backgroundColor: "#7C3AED", color: "#fff", fontSize: "13px", fontWeight: 600, border: "none", cursor: sending ? "wait" : "pointer", display: "inline-flex", alignItems: "center", gap: "6px", flexShrink: 0 }}
            >
              {sending
                ? <><div style={{ width: "12px", height: "12px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", animation: "spin 0.7s linear infinite" }} />Sending...</>
                : <><Check style={{ width: "13px", height: "13px" }} />Send Invite</>
              }
            </button>
            <button onClick={() => setShowForm(false)} style={{ width: "34px", height: "34px", borderRadius: "7px", backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <X style={{ width: "14px", height: "14px", color: "#71717a" }} />
            </button>
          </div>
        </div>
      )}

      {/* Members table */}
      <div style={{ backgroundColor: "#111111", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden", marginBottom: "16px" }}>
        {/* Table head */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px 80px 40px", gap: "12px", padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          {["Member", "Email", "Role", "Status", ""].map(h => (
            <div key={h} style={{ fontSize: "11px", fontWeight: 600, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</div>
          ))}
        </div>

        {members.map((m, i) => (
          <div key={m.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px 80px 40px", gap: "12px", padding: "12px 16px", alignItems: "center", borderBottom: i < members.length - 1 ? "1px solid rgba(255,255,255,0.04)" : undefined }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Avatar name={m.name} color={m.avatarColor} />
              <span style={{ fontSize: "13px", fontWeight: 500, color: "#fafafa" }}>{m.name}</span>
            </div>
            <span style={{ fontSize: "12px", color: "#71717a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.email}</span>
            <RoleBadge role={m.role} />
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: m.status === "Active" ? "#34d399" : "#fbbf24" }} />
              <span style={{ fontSize: "12px", color: m.status === "Active" ? "#34d399" : "#fbbf24" }}>{m.status}</span>
            </div>
            <button
              onClick={() => removeMember(m.id)}
              disabled={m.role === "Admin"}
              style={{ width: "28px", height: "28px", borderRadius: "6px", backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", cursor: m.role === "Admin" ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: m.role === "Admin" ? 0.3 : 1, transition: "all 0.15s" }}
              className={m.role !== "Admin" ? "hover:bg-red-500/20" : ""}
            >
              <Trash2 style={{ width: "12px", height: "12px", color: "#f87171" }} />
            </button>
          </div>
        ))}
      </div>

      {/* Pending invites */}
      {invites.length > 0 && (
        <div>
          <h3 style={{ fontSize: "13px", fontWeight: 600, color: "#a1a1aa", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Clock style={{ width: "13px", height: "13px" }} />
            Pending Invites
          </h3>
          <div style={{ backgroundColor: "#111111", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
            {invites.map((inv, i) => (
              <div key={inv.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderBottom: i < invites.length - 1 ? "1px solid rgba(255,255,255,0.04)" : undefined }}>
                <Mail style={{ width: "14px", height: "14px", color: "#52525b", flexShrink: 0 }} />
                <span style={{ fontSize: "13px", color: "#a1a1aa", flex: 1 }}>{inv.email}</span>
                <RoleBadge role={inv.role} />
                <span style={{ fontSize: "11px", color: "#52525b" }}>{inv.sentAt}</span>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#fbbf24", backgroundColor: "rgba(251,191,36,0.1)", padding: "2px 7px", borderRadius: "4px" }}>Pending</span>
                <button
                  onClick={() => revokeInvite(inv.id)}
                  style={{ width: "24px", height: "24px", borderRadius: "5px", backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <X style={{ width: "11px", height: "11px", color: "#71717a" }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  )
}
