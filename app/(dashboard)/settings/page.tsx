"use client"

import { useState } from "react"
import {
  Building2, Users, Paintbrush, CreditCard, Plug, Bell,
} from "lucide-react"

/* ── Tab definitions ─────────────────────────────────── */
type TabId = "workspace" | "team" | "whitelabel" | "billing" | "integrations" | "notifications"

interface Tab {
  id: TabId
  label: string
  icon: React.ElementType
  badge?: string
}

const TABS: Tab[] = [
  { id: "workspace",      label: "Workspace",      icon: Building2 },
  { id: "team",           label: "Team Members",   icon: Users },
  { id: "whitelabel",     label: "White-label",    icon: Paintbrush, badge: "Agency" },
  { id: "billing",        label: "Billing",        icon: CreditCard },
  { id: "integrations",   label: "Integrations",   icon: Plug },
  { id: "notifications",  label: "Notifications",  icon: Bell },
]

/* ── Lazy-loaded tab content ─────────────────────────── */
import dynamic from "next/dynamic"

const TAB_COMPONENTS: Record<TabId, React.ComponentType> = {
  workspace:     dynamic(() => import("@/components/settings/workspace-settings").then(m => m.WorkspaceSettings)),
  team:          dynamic(() => import("@/components/settings/team-settings").then(m => m.TeamSettings)),
  whitelabel:    dynamic(() => import("@/components/settings/whitelabel-settings").then(m => m.WhitelabelSettings)),
  billing:       dynamic(() => import("@/components/settings/billing-settings").then(m => m.BillingSettings)),
  integrations:  dynamic(() => import("@/components/settings/integrations-settings").then(m => m.IntegrationsSettings)),
  notifications: dynamic(() => import("@/components/settings/notifications-settings").then(m => m.NotificationsSettings)),
}

/* ── Sidebar tab item ────────────────────────────────── */
function SidebarItem({
  tab,
  active,
  onClick,
}: {
  tab: Tab
  active: boolean
  onClick: () => void
}) {
  const Icon = tab.icon
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "9px 12px",
        borderRadius: "8px",
        cursor: "pointer",
        border: "none",
        textAlign: "left",
        backgroundColor: active ? "rgba(124,58,237,0.12)" : "transparent",
        transition: "background-color 0.15s",
      }}
      className={active ? "" : "hover:bg-white/[0.04]"}
    >
      <Icon
        style={{
          width: "16px",
          height: "16px",
          flexShrink: 0,
          color: active ? "#a855f7" : "#71717a",
          transition: "color 0.15s",
        }}
      />
      <span
        style={{
          fontSize: "13px",
          fontWeight: active ? 600 : 500,
          color: active ? "#fafafa" : "#a1a1aa",
          flex: 1,
          transition: "color 0.15s",
        }}
      >
        {tab.label}
      </span>
      {tab.badge && (
        <span
          style={{
            fontSize: "9px",
            fontWeight: 700,
            color: "#7C3AED",
            backgroundColor: "rgba(124,58,237,0.15)",
            border: "1px solid rgba(124,58,237,0.25)",
            padding: "1px 6px",
            borderRadius: "4px",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          {tab.badge}
        </span>
      )}
    </button>
  )
}

/* ── Mobile tab pill ─────────────────────────────────── */
function MobilePill({
  tab,
  active,
  onClick,
}: {
  tab: Tab
  active: boolean
  onClick: () => void
}) {
  const Icon = tab.icon
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "7px 14px",
        borderRadius: "20px",
        cursor: "pointer",
        border: "none",
        whiteSpace: "nowrap",
        flexShrink: 0,
        backgroundColor: active ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.04)",
        border: active ? "1px solid rgba(124,58,237,0.35)" : "1px solid rgba(255,255,255,0.07)",
        transition: "all 0.15s",
      }}
    >
      <Icon style={{ width: "13px", height: "13px", color: active ? "#a855f7" : "#71717a" }} />
      <span style={{ fontSize: "12px", fontWeight: active ? 600 : 500, color: active ? "#fafafa" : "#a1a1aa" }}>
        {tab.label}
      </span>
      {tab.badge && (
        <span style={{ fontSize: "8px", fontWeight: 700, color: "#7C3AED", backgroundColor: "rgba(124,58,237,0.2)", padding: "1px 5px", borderRadius: "3px" }}>
          {tab.badge}
        </span>
      )}
    </button>
  )
}

/* ── Page ────────────────────────────────────────────── */
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("workspace")
  const ActiveComponent = TAB_COMPONENTS[activeTab]

  return (
    <div style={{ maxWidth: "1100px" }}>
      {/* Page heading */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#fafafa", letterSpacing: "-0.02em", marginBottom: "4px" }}>
          Settings
        </h1>
        <p style={{ fontSize: "13px", color: "#71717a" }}>
          Manage your workspace, team, billing and integrations.
        </p>
      </div>

      {/* Mobile: horizontal scroll tabs */}
      <div
        className="md:hidden"
        style={{
          display: "flex",
          gap: "8px",
          overflowX: "auto",
          paddingBottom: "16px",
          marginBottom: "16px",
          scrollbarWidth: "none",
        }}
      >
        {TABS.map(tab => (
          <MobilePill key={tab.id} tab={tab} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} />
        ))}
      </div>

      {/* Desktop: sidebar + content */}
      <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>

        {/* Left sidebar */}
        <aside
          className="hidden md:block"
          style={{
            width: "200px",
            flexShrink: 0,
            backgroundColor: "#111111",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.06)",
            padding: "8px",
            position: "sticky",
            top: "24px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {TABS.map(tab => (
              <SidebarItem
                key={tab.id}
                tab={tab}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              />
            ))}
          </div>
        </aside>

        {/* Right content area */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <ActiveComponent />
        </div>
      </div>
    </div>
  )
}
