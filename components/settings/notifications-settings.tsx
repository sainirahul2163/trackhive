"use client"

import { useState } from "react"
import { Check, Mail, Bell, MessageSquare } from "lucide-react"
import { toast, Toaster } from "sonner"

type DeliveryChannel = "email" | "slack" | "inapp"

interface AlertPref {
  id: string
  label: string
  description: string
  email: boolean
  slack: boolean
  inapp: boolean
}

interface AlertGroup {
  id: string
  heading: string
  alerts: AlertPref[]
}

const INIT_GROUPS: AlertGroup[] = [
  {
    id: "campaign",
    heading: "Campaign Alerts",
    alerts: [
      { id: "c1", label: "Video hits 100K views",         description: "Triggered when a tracked video crosses 100,000 views",   email: true,  slack: false, inapp: true  },
      { id: "c2", label: "Video hits 1M views",           description: "Triggered when a tracked video crosses 1,000,000 views",  email: true,  slack: true,  inapp: true  },
      { id: "c3", label: "Creator hasn't posted in 3 days", description: "Alert if a campaign creator goes quiet",               email: false, slack: false, inapp: true  },
      { id: "c4", label: "Campaign end date in 3 days",   description: "Reminder before a campaign expires",                     email: true,  slack: false, inapp: true  },
    ],
  },
  {
    id: "competitor",
    heading: "Competitor Alerts",
    alerts: [
      { id: "cp1", label: "Competitor video goes viral",   description: "A competitor's video crosses your viral threshold",      email: true,  slack: false, inapp: true  },
      { id: "cp2", label: "Weekly AI digest ready",         description: "Every Monday morning competitor report",                email: true,  slack: true,  inapp: false },
      { id: "cp3", label: "New competitor creator detected", description: "A competitor onboards a creator in your niche",       email: false, slack: false, inapp: true  },
    ],
  },
  {
    id: "payment",
    heading: "Payment Alerts",
    alerts: [
      { id: "p1", label: "Payout approved",     description: "A queued payout has been approved",            email: true,  slack: false, inapp: true  },
      { id: "p2", label: "Payment sent",        description: "A payment has been successfully sent to a creator", email: true,  slack: false, inapp: true  },
      { id: "p3", label: "Payment failed",      description: "A payment attempt failed — action required",    email: true,  slack: true,  inapp: true  },
    ],
  },
]

const SLACK_CONNECTED = false // swap to true when Slack is connected

function ChannelIcon({ channel }: { channel: DeliveryChannel }) {
  if (channel === "email")  return <Mail       style={{ width: "13px", height: "13px" }} />
  if (channel === "slack")  return <MessageSquare style={{ width: "13px", height: "13px" }} />
  return                           <Bell       style={{ width: "13px", height: "13px" }} />
}

const CHANNEL_LABELS: Record<DeliveryChannel, string> = {
  email: "Email",
  slack: "Slack",
  inapp: "In-app",
}

function ChannelToggle({
  checked,
  onChange,
  disabled,
  channel,
}: {
  checked: boolean
  onChange: () => void
  disabled?: boolean
  channel: DeliveryChannel
}) {
  const active = checked && !disabled
  return (
    <button
      onClick={disabled ? undefined : onChange}
      title={disabled ? "Connect Slack first" : CHANNEL_LABELS[channel]}
      style={{
        display: "inline-flex", alignItems: "center", gap: "5px",
        padding: "4px 9px", borderRadius: "6px", cursor: disabled ? "not-allowed" : "pointer",
        border: active ? "1px solid rgba(124,58,237,0.4)" : "1px solid rgba(255,255,255,0.07)",
        backgroundColor: active ? "rgba(124,58,237,0.12)" : "rgba(255,255,255,0.03)",
        color: active ? "#c084fc" : disabled ? "#3f3f46" : "#71717a",
        opacity: disabled ? 0.5 : 1,
        transition: "all 0.15s",
        fontSize: "11px", fontWeight: 500,
      }}
    >
      <ChannelIcon channel={channel} />
      {CHANNEL_LABELS[channel]}
    </button>
  )
}

function AlertRow({ alert, onChange }: { alert: AlertPref; onChange: (updated: AlertPref) => void }) {
  function toggle(ch: DeliveryChannel) {
    onChange({ ...alert, [ch]: !alert[ch] })
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: "13px", fontWeight: 500, color: "#e4e4e7" }}>{alert.label}</p>
        <p style={{ fontSize: "11px", color: "#52525b", marginTop: "2px" }}>{alert.description}</p>
      </div>
      <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
        <ChannelToggle channel="email"  checked={alert.email}  onChange={() => toggle("email")} />
        <ChannelToggle channel="slack"  checked={alert.slack}  onChange={() => toggle("slack")} disabled={!SLACK_CONNECTED} />
        <ChannelToggle channel="inapp"  checked={alert.inapp}  onChange={() => toggle("inapp")} />
      </div>
    </div>
  )
}

function AlertGroup({ group, onGroupChange }: { group: AlertGroup; onGroupChange: (g: AlertGroup) => void }) {
  function updateAlert(updated: AlertPref) {
    onGroupChange({ ...group, alerts: group.alerts.map(a => a.id === updated.id ? updated : a) })
  }

  const allEmail = group.alerts.every(a => a.email)
  const allInapp = group.alerts.every(a => a.inapp)

  function toggleAll(ch: DeliveryChannel, val: boolean) {
    if (ch === "slack" && !SLACK_CONNECTED) return
    onGroupChange({ ...group, alerts: group.alerts.map(a => ({ ...a, [ch]: val })) })
  }

  return (
    <div style={{ backgroundColor: "#111111", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden", marginBottom: "16px" }}>
      {/* Group header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", backgroundColor: "rgba(255,255,255,0.01)" }}>
        <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#fafafa" }}>{group.heading}</h4>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <span style={{ fontSize: "10px", color: "#52525b", marginRight: "4px" }}>All:</span>
          <ChannelToggle channel="email" checked={allEmail} onChange={() => toggleAll("email", !allEmail)} />
          <ChannelToggle channel="slack" checked={false} onChange={() => {}} disabled={!SLACK_CONNECTED} />
          <ChannelToggle channel="inapp" checked={allInapp} onChange={() => toggleAll("inapp", !allInapp)} />
        </div>
      </div>

      {/* Alert rows */}
      {group.alerts.map(alert => (
        <AlertRow key={alert.id} alert={alert} onChange={updateAlert} />
      ))}
    </div>
  )
}

export function NotificationsSettings() {
  const [groups, setGroups] = useState<AlertGroup[]>(INIT_GROUPS)
  const [saving, setSaving] = useState(false)

  function updateGroup(updated: AlertGroup) {
    setGroups(prev => prev.map(g => g.id === updated.id ? updated : g))
  }

  async function handleSave() {
    setSaving(true)
    await new Promise(r => setTimeout(r, 700))
    setSaving(false)
    toast.success("Notification preferences saved")
  }

  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", color: "#fafafa" } }} />

      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#fafafa", marginBottom: "4px" }}>Notifications</h2>
        <p style={{ fontSize: "13px", color: "#71717a" }}>Choose which events alert you and how they&apos;re delivered.</p>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "12px 16px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", marginBottom: "20px" }}>
        <span style={{ fontSize: "11px", color: "#52525b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Channels:</span>
        {(["email", "slack", "inapp"] as DeliveryChannel[]).map(ch => (
          <div key={ch} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#7C3AED" }} />
            <span style={{ fontSize: "11px", color: "#71717a" }}>{CHANNEL_LABELS[ch]}</span>
            {ch === "slack" && !SLACK_CONNECTED && (
              <span style={{ fontSize: "9px", color: "#52525b", backgroundColor: "rgba(255,255,255,0.04)", padding: "1px 5px", borderRadius: "3px" }}>not connected</span>
            )}
          </div>
        ))}
      </div>

      {/* Groups */}
      {groups.map(group => (
        <AlertGroup key={group.id} group={group} onGroupChange={updateGroup} />
      ))}

      {/* Save */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display: "inline-flex", alignItems: "center", gap: "7px",
            padding: "9px 20px", borderRadius: "8px",
            backgroundColor: saving ? "rgba(124,58,237,0.5)" : "#7C3AED",
            color: "#fff", fontSize: "13px", fontWeight: 600,
            cursor: saving ? "not-allowed" : "pointer", border: "none",
            boxShadow: "0 0 20px rgba(124,58,237,0.25)",
          }}
        >
          {saving
            ? <><div style={{ width: "13px", height: "13px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", animation: "spin 0.7s linear infinite" }} />Saving...</>
            : <><Check style={{ width: "13px", height: "13px" }} />Save Preferences</>
          }
        </button>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  )
}
