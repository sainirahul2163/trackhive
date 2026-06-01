"use client"

import { useState, useMemo } from "react"
import {
  Bell, Check, CheckCheck, Trash2, Filter,
  TrendingUp, DollarSign, Users, Zap,
  Eye, Megaphone, Star,
} from "lucide-react"

/* ─── Types ─────────────────────────────────────────── */
type NType = "campaign" | "payment" | "creator" | "competitor" | "system"

interface Notification {
  id: string
  type: NType
  title: string
  body: string
  time: string
  unread: boolean
  link?: string
}

/* ─── Mock data ─────────────────────────────────────── */
const INIT: Notification[] = [
  {
    id: "n1", type: "campaign", unread: true,
    title: "Campaign milestone reached",
    body: "\"Summer Drop 2025\" just hit 5M total views. Milestone bonus of $500 is now queued.",
    time: "2 minutes ago",
  },
  {
    id: "n2", type: "creator", unread: true,
    title: "New content submitted",
    body: "@jake_creates posted a new video in the Back to School campaign. Views are tracking above target.",
    time: "1 hour ago",
  },
  {
    id: "n3", type: "payment", unread: true,
    title: "Payout processed",
    body: "$2,400 payment to @maya.creates was processed successfully via PayPal.",
    time: "3 hours ago",
  },
  {
    id: "n4", type: "competitor", unread: false,
    title: "Competitor spike detected",
    body: "GlowBrand posted 4 videos in the last 48 hours — 2 are trending above 500K views.",
    time: "5 hours ago",
  },
  {
    id: "n5", type: "campaign", unread: false,
    title: "Creator falling behind",
    body: "@techbyleo is behind schedule on Collab Series Q3. Expected 3 videos, posted 1.",
    time: "Yesterday",
  },
  {
    id: "n6", type: "payment", unread: false,
    title: "Invoice generated",
    body: "Invoice #INV-0047 for $1,850 has been generated for @reels_anna.",
    time: "Yesterday",
  },
  {
    id: "n7", type: "creator", unread: false,
    title: "Creator accepted invite",
    body: "@lifewithkim accepted their creator invite and completed onboarding.",
    time: "2 days ago",
  },
  {
    id: "n8", type: "system", unread: false,
    title: "Weekly digest ready",
    body: "Your AI-powered competitor digest for the week of May 26 is ready to view.",
    time: "2 days ago",
  },
  {
    id: "n9", type: "campaign", unread: false,
    title: "Campaign ended",
    body: "\"Spring Collection\" campaign reached its end date. Final report is available.",
    time: "3 days ago",
  },
  {
    id: "n10", type: "payment", unread: false,
    title: "Payout on hold",
    body: "@creator_pro's payout of $980 is on hold — KYC verification required.",
    time: "4 days ago",
  },
  {
    id: "n11", type: "competitor", unread: false,
    title: "New competitor creator flagged",
    body: "@fitnessguru is now working with a competitor. Added to your watch list.",
    time: "5 days ago",
  },
  {
    id: "n12", type: "system", unread: false,
    title: "Sync completed",
    body: "All 24 tracked accounts have been successfully synced. Data is up to date.",
    time: "1 week ago",
  },
]

const TYPE_FILTERS: { value: NType | "all"; label: string }[] = [
  { value: "all",        label: "All" },
  { value: "campaign",   label: "Campaigns" },
  { value: "payment",    label: "Payments" },
  { value: "creator",    label: "Creators" },
  { value: "competitor", label: "Competitors" },
  { value: "system",     label: "System" },
]

/* ─── Icon + colour per type ─────────────────────────── */
const TYPE_META: Record<NType, { icon: React.ElementType; color: string; bg: string }> = {
  campaign:   { icon: Megaphone,     color: "text-purple-400",  bg: "bg-purple-500/10" },
  payment:    { icon: DollarSign,    color: "text-emerald-400", bg: "bg-emerald-500/10" },
  creator:    { icon: Users,         color: "text-blue-400",    bg: "bg-blue-500/10" },
  competitor: { icon: Eye,           color: "text-amber-400",   bg: "bg-amber-500/10" },
  system:     { icon: Zap,           color: "text-zinc-400",    bg: "bg-zinc-500/10" },
}

/* ─── Notification row ───────────────────────────────── */
function NotifRow({
  notif,
  onMarkRead,
  onDelete,
}: {
  notif: Notification
  onMarkRead: (id: string) => void
  onDelete: (id: string) => void
}) {
  const meta = TYPE_META[notif.type]
  const Icon = meta.icon

  return (
    <div
      className="flex items-start gap-4 px-5 py-4 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group"
      style={{ backgroundColor: notif.unread ? "rgba(124,58,237,0.03)" : undefined }}
    >
      {/* Icon */}
      <div className={`w-9 h-9 rounded-xl ${meta.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
        <Icon className={`w-4 h-4 ${meta.color}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className={`text-[13px] font-semibold leading-snug ${notif.unread ? "text-white" : "text-zinc-300"}`}>
            {notif.title}
          </p>
          {notif.unread && (
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
          )}
        </div>
        <p className="text-sm text-zinc-500 leading-relaxed">{notif.body}</p>
        <p className="text-xs text-zinc-600 mt-1.5">{notif.time}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        {notif.unread && (
          <button
            onClick={() => onMarkRead(notif.id)}
            title="Mark as read"
            className="p-1.5 rounded-md hover:bg-white/[0.06] text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={() => onDelete(notif.id)}
          title="Dismiss"
          className="p-1.5 rounded-md hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

/* ─── Empty state ───────────────────────────────────── */
function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="w-14 h-14 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center mb-4">
        {filtered ? <Filter className="w-6 h-6 text-purple-400" /> : <Bell className="w-6 h-6 text-purple-400" />}
      </div>
      <p className="text-base font-semibold text-white mb-1">
        {filtered ? "No notifications match" : "You're all caught up"}
      </p>
      <p className="text-sm text-zinc-500 text-center max-w-xs">
        {filtered
          ? "Try a different filter to see more notifications."
          : "New alerts for campaigns, payments, and creators will appear here."}
      </p>
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────── */
export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(INIT)
  const [filter, setFilter]  = useState<NType | "all">("all")
  const [showUnread, setShowUnread] = useState(false)

  const unreadCount = notifications.filter(n => n.unread).length

  const filtered = useMemo(() =>
    notifications
      .filter(n => filter === "all" || n.type === filter)
      .filter(n => !showUnread || n.unread),
    [notifications, filter, showUnread]
  )

  function markRead(id: string) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n))
  }

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
  }

  function dismiss(id: string) {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  function clearAll() {
    setNotifications([])
  }

  /* Group by relative time */
  const today     = filtered.filter(n => n.time.includes("minute") || n.time.includes("hour"))
  const yesterday = filtered.filter(n => n.time === "Yesterday")
  const older     = filtered.filter(n => !n.time.includes("minute") && !n.time.includes("hour") && n.time !== "Yesterday")

  const groups = [
    { label: "Today",     items: today     },
    { label: "Yesterday", items: yesterday },
    { label: "Earlier",   items: older     },
  ].filter(g => g.items.length > 0)

  return (
    <div className="max-w-3xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[22px] font-semibold text-white tracking-tight flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <span className="text-xs font-bold bg-purple-600 text-white px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">Campaign alerts, payment events, and system updates.</p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-600/15 border border-purple-500/25 text-purple-300 text-sm font-medium hover:bg-purple-600/25 transition-all"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.07] text-zinc-400 text-sm hover:text-zinc-200 hover:border-white/10 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Stats strip */}
      {notifications.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total",      value: notifications.length,                                   icon: Bell,          color: "text-zinc-400",    bg: "bg-zinc-500/10" },
            { label: "Unread",     value: unreadCount,                                            icon: Star,          color: "text-purple-400",  bg: "bg-purple-500/10" },
            { label: "Payments",   value: notifications.filter(n => n.type === "payment").length,  icon: DollarSign,   color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { label: "Campaigns",  value: notifications.filter(n => n.type === "campaign").length, icon: TrendingUp,   color: "text-blue-400",    bg: "bg-blue-500/10" },
          ].map(s => {
            const Icon = s.icon
            return (
              <div key={s.label} className="rounded-xl border border-white/[0.06] bg-[#111111] px-4 py-3 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <div>
                  <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider">{s.label}</p>
                  <p className="text-lg font-bold text-white leading-tight">{s.value}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex gap-1.5 flex-wrap">
          {TYPE_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === f.value
                  ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                  : "bg-[#111111] text-zinc-400 border border-white/[0.06] hover:text-zinc-200 hover:border-white/10"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowUnread(!showUnread)}
          className={`ml-auto px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
            showUnread
              ? "bg-purple-600/20 text-purple-300 border-purple-500/30"
              : "bg-[#111111] text-zinc-400 border-white/[0.06] hover:text-zinc-200"
          }`}
        >
          {showUnread ? "Showing unread" : "All notifications"}
        </button>
      </div>

      {/* Feed */}
      <div className="rounded-xl border border-white/[0.06] bg-[#111111] overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState filtered={filter !== "all" || showUnread} />
        ) : (
          groups.map(group => (
            <div key={group.label}>
              <div className="px-5 py-2.5 border-b border-white/[0.04] bg-white/[0.01]">
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{group.label}</span>
              </div>
              {group.items.map(notif => (
                <NotifRow
                  key={notif.id}
                  notif={notif}
                  onMarkRead={markRead}
                  onDelete={dismiss}
                />
              ))}
            </div>
          ))
        )}

        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-white/[0.04] flex items-center justify-between">
            <p className="text-xs text-zinc-600">{filtered.length} notification{filtered.length !== 1 ? "s" : ""}</p>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                Mark all as read
              </button>
            )}
          </div>
        )}
      </div>

      {/* Alert types legend */}
      <div className="rounded-xl border border-white/[0.06] bg-[#111111] p-4">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Alert types</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(Object.entries(TYPE_META) as [NType, typeof TYPE_META[NType]][]).map(([type, meta]) => {
            const Icon = meta.icon
            return (
              <div key={type} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg ${meta.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                </div>
                <span className="text-xs text-zinc-400 capitalize">{type === "system" ? "System" : type + "s"}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
