"use client"

import { useState, useMemo } from "react"
import {
  X, DollarSign, Calendar, CheckCircle2, Clock, AlertCircle,
  ChevronDown, FileText, Video, Link, Info, TrendingUp,
  Bell, ThumbsUp, ThumbsDown, MessageSquare,
} from "lucide-react"

// ── Invite types ───────────────────────────────────────────────
interface CampaignInvite {
  id: string
  brand: string
  brandInitials: string
  brandColor: string
  campaignName: string
  niche: string
  budget: number
  deadline: string
  message: string
  sentAt: string
}

// ── Types ──────────────────────────────────────────────────────
type CampaignStatus = "active" | "pending" | "completed" | "paused"

interface CampaignRequirement {
  label: string
  done: boolean
}

interface CampaignDeliverable {
  type: "video" | "link" | "post"
  description: string
}

interface Campaign {
  id: string
  name: string
  brand: string
  brandInitials: string
  brandColor: string
  status: CampaignStatus
  deadline: string
  startDate: string
  brief: string
  earnings: number
  potential: number
  videosRequired: number
  videosPosted: number
  platforms: string[]
  requirements: CampaignRequirement[]
  deliverables: CampaignDeliverable[]
  contentGuidelines: string[]
  paymentTerms: string
  tag?: string
}

const CAMPAIGNS: Campaign[] = []

const STATUS_CFG: Record<CampaignStatus, { label: string; color: string; bg: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }> = {
  active:    { label: "Active",    color: "#34d399", bg: "rgba(52,211,153,0.1)",  icon: TrendingUp },
  pending:   { label: "Pending",   color: "#fbbf24", bg: "rgba(251,191,36,0.1)",  icon: Clock },
  completed: { label: "Completed", color: "#60a5fa", bg: "rgba(96,165,250,0.1)",  icon: CheckCircle2 },
  paused:    { label: "Paused",    color: "#f87171", bg: "rgba(248,113,113,0.1)", icon: AlertCircle },
}

function daysUntil(dateStr: string): number {
  return Math.max(0, Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000))
}

interface BriefModalProps { campaign: Campaign; onClose: () => void }
function BriefModal({ campaign, onClose }: BriefModalProps) {
  const status = STATUS_CFG[campaign.status]
  const days = daysUntil(campaign.deadline)
  const complete = campaign.requirements.filter(r => r.done).length
  const total = campaign.requirements.length
  const pct = Math.round((campaign.videosPosted / campaign.videosRequired) * 100)

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 40 }} />
      <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", zIndex: 50 }}>
        <div style={{ width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto", backgroundColor: "#111111", borderRadius: "18px", border: "1px solid rgba(255,255,255,0.09)", display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <div style={{ padding: "22px 24px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "flex-start", gap: "14px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: `${campaign.brandColor}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 800, color: campaign.brandColor, flexShrink: 0 }}>
              {campaign.brandInitials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "15px", fontWeight: 800, color: "#fafafa" }}>{campaign.name}</p>
              <p style={{ fontSize: "12px", color: "#71717a", marginTop: "2px" }}>{campaign.brand} · {campaign.tag}</p>
            </div>
            <button onClick={onClose} style={{ padding: "6px", borderRadius: "8px", border: "none", backgroundColor: "rgba(255,255,255,0.06)", cursor: "pointer" }}>
              <X style={{ width: "14px", height: "14px", color: "#71717a" }} />
            </button>
          </div>

          <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "18px" }}>
            {/* Meta row */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ padding: "3px 9px", borderRadius: "6px", backgroundColor: status.bg, fontSize: "11px", fontWeight: 700, color: status.color }}>{status.label}</span>
              <span style={{ padding: "3px 9px", borderRadius: "6px", backgroundColor: "rgba(255,255,255,0.04)", fontSize: "11px", fontWeight: 600, color: "#a1a1aa" }}>
                <Calendar style={{ display: "inline", width: "10px", height: "10px", marginRight: "4px" }} />
                {campaign.status === "completed" ? "Completed" : `${days} days left`}
              </span>
              {campaign.platforms.map(p => (
                <span key={p} style={{ padding: "3px 9px", borderRadius: "6px", backgroundColor: "rgba(255,255,255,0.04)", fontSize: "11px", color: "#a1a1aa" }}>{p}</span>
              ))}
            </div>

            {/* Earnings */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
              {[
                { label: "Earned", value: `$${campaign.earnings}`, color: "#34d399" },
                { label: "Potential", value: `$${campaign.potential}`, color: "#a78bfa" },
                { label: "Progress", value: `${campaign.videosPosted}/${campaign.videosRequired} videos`, color: "#60a5fa" },
              ].map(e => (
                <div key={e.label} style={{ padding: "10px 12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)", backgroundColor: "rgba(255,255,255,0.02)" }}>
                  <p style={{ fontSize: "14px", fontWeight: 800, color: e.color }}>{e.value}</p>
                  <p style={{ fontSize: "10px", color: "#52525b", marginTop: "2px" }}>{e.label}</p>
                </div>
              ))}
            </div>

            {/* Video progress */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Videos posted</p>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#a78bfa" }}>{pct}%</span>
              </div>
              <div style={{ height: "6px", borderRadius: "99px", backgroundColor: "rgba(255,255,255,0.06)" }}>
                <div style={{ width: `${pct}%`, height: "100%", borderRadius: "99px", backgroundColor: "#7C3AED" }} />
              </div>
            </div>

            {/* Brief */}
            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>Campaign Brief</p>
              <p style={{ fontSize: "13px", color: "#a1a1aa", lineHeight: 1.7 }}>{campaign.brief}</p>
            </div>

            {/* Deliverables */}
            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>Deliverables</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {campaign.deliverables.map((d, i) => {
                  const Icon = d.type === "video" ? Video : d.type === "link" ? Link : FileText
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "10px 12px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                      <Icon style={{ width: "13px", height: "13px", color: "#a78bfa", flexShrink: 0, marginTop: "2px" }} />
                      <p style={{ fontSize: "12px", color: "#e4e4e7", lineHeight: 1.5 }}>{d.description}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Requirements checklist */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Requirements</p>
                <span style={{ fontSize: "11px", color: "#71717a" }}>{complete}/{total} done</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                {campaign.requirements.map((r, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    <div style={{ width: "14px", height: "14px", borderRadius: "4px", flexShrink: 0, marginTop: "2px", backgroundColor: r.done ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.04)", border: r.done ? "1px solid rgba(52,211,153,0.3)" : "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {r.done && <CheckCircle2 style={{ width: "10px", height: "10px", color: "#34d399" }} />}
                    </div>
                    <p style={{ fontSize: "12px", color: r.done ? "#71717a" : "#e4e4e7", lineHeight: 1.5, textDecoration: r.done ? "line-through" : "none" }}>{r.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Content guidelines */}
            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>Content Guidelines</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                {campaign.contentGuidelines.map((g, i) => (
                  <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                    <Info style={{ width: "12px", height: "12px", color: "#fbbf24", flexShrink: 0, marginTop: "2px" }} />
                    <p style={{ fontSize: "12px", color: "#a1a1aa", lineHeight: 1.5 }}>{g}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment terms */}
            <div style={{ padding: "12px 14px", borderRadius: "10px", border: "1px solid rgba(52,211,153,0.15)", backgroundColor: "rgba(52,211,153,0.04)" }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                <DollarSign style={{ width: "13px", height: "13px", color: "#34d399", flexShrink: 0, marginTop: "1px" }} />
                <p style={{ fontSize: "12px", color: "#a1a1aa", lineHeight: 1.6 }}>{campaign.paymentTerms}</p>
              </div>
            </div>

            {/* CTA */}
            {campaign.status !== "completed" && (
              <button style={{ padding: "12px", borderRadius: "10px", backgroundColor: "#7C3AED", color: "white", fontSize: "13px", fontWeight: 700, border: "none", cursor: "pointer" }}>
                Got it — start creating →
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

interface DeclineModalProps { invite: CampaignInvite; onConfirm: (reason: string) => void; onCancel: () => void }
function DeclineModal({ invite, onConfirm, onCancel }: DeclineModalProps) {
  const [reason, setReason] = useState("")
  const REASONS = ["Schedule conflict", "Not the right niche fit", "Budget too low", "Already at capacity", "Other"]
  return (
    <>
      <div onClick={onCancel} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 40 }} />
      <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", zIndex: 50 }}>
        <div style={{ width: "100%", maxWidth: "420px", backgroundColor: "#111111", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.09)", padding: "22px" }}>
          <p style={{ fontSize: "15px", fontWeight: 800, color: "#fafafa", marginBottom: "4px" }}>Decline Invite</p>
          <p style={{ fontSize: "12px", color: "#71717a", marginBottom: "16px" }}>Let {invite.brand} know why (optional but appreciated)</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" }}>
            {REASONS.map(r => (
              <button key={r} onClick={() => setReason(r)}
                style={{ padding: "9px 12px", borderRadius: "8px", border: reason === r ? "1px solid rgba(248,113,113,0.3)" : "1px solid rgba(255,255,255,0.07)", backgroundColor: reason === r ? "rgba(248,113,113,0.06)" : "transparent", color: reason === r ? "#f87171" : "#a1a1aa", fontSize: "13px", fontWeight: 600, cursor: "pointer", textAlign: "left" }}>
                {r}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={onCancel} style={{ flex: 1, padding: "9px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.09)", backgroundColor: "transparent", color: "#a1a1aa", fontSize: "13px", cursor: "pointer" }}>Cancel</button>
            <button onClick={() => onConfirm(reason)} style={{ flex: 1, padding: "9px", borderRadius: "8px", backgroundColor: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>Decline</button>
          </div>
        </div>
      </div>
    </>
  )
}

export default function CreatorCampaignsPage() {
  const [filter, setFilter] = useState<CampaignStatus | "all">("all")
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [invites, setInvites] = useState<CampaignInvite[]>([])
  const [expandedInvite, setExpandedInvite] = useState<string | null>(null)
  const [decliningInvite, setDecliningInvite] = useState<CampaignInvite | null>(null)
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set())

  function acceptInvite(invite: CampaignInvite) {
    setAcceptedIds(prev => new Set([...Array.from(prev), invite.id]))
    setTimeout(() => {
      setInvites(prev => prev.filter(i => i.id !== invite.id))
      setAcceptedIds(prev => { const s = new Set(Array.from(prev)); s.delete(invite.id); return s })
    }, 1200)
  }

  function declineInvite(invite: CampaignInvite) {
    setInvites(prev => prev.filter(i => i.id !== invite.id))
    setDecliningInvite(null)
  }

  const filtered = useMemo(
    () => filter === "all" ? CAMPAIGNS : CAMPAIGNS.filter(c => c.status === filter),
    [filter]
  )

  const totalEarned    = CAMPAIGNS.reduce((s, c) => s + c.earnings, 0)
  const totalPotential = CAMPAIGNS.reduce((s, c) => s + c.potential, 0)
  const activeCnt      = CAMPAIGNS.filter(c => c.status === "active").length
  const pendingCnt     = CAMPAIGNS.filter(c => c.status === "pending").length

  const TABS: { id: CampaignStatus | "all"; label: string }[] = [
    { id: "all",       label: `All (${CAMPAIGNS.length})` },
    { id: "active",    label: `Active (${activeCnt})` },
    { id: "pending",   label: `Pending (${pendingCnt})` },
    { id: "completed", label: "Completed" },
  ]

  return (
    <div style={{ maxWidth: "900px", display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#fafafa" }}>My Campaigns</h1>
          <p style={{ fontSize: "13px", color: "#71717a", marginTop: "3px" }}>View briefs, track progress, and manage deliverables</p>
        </div>
        {invites.length > 0 && (
          <span style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "8px", backgroundColor: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.15)", fontSize: "12px", fontWeight: 700, color: "#fbbf24" }}>
            <Bell style={{ width: "12px", height: "12px" }} />
            {invites.length} new invite{invites.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* ── Pending Invites ───────────────────────────────────────── */}
      {invites.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
            <Bell style={{ width: "13px", height: "13px", color: "#fbbf24" }} />
            <p style={{ fontSize: "12px", fontWeight: 700, color: "#fbbf24", textTransform: "uppercase", letterSpacing: "0.07em" }}>New Invites</p>
            <span style={{ padding: "1px 7px", borderRadius: "99px", backgroundColor: "rgba(251,191,36,0.1)", fontSize: "10px", fontWeight: 700, color: "#fbbf24" }}>{invites.length}</span>
          </div>

          {invites.map(inv => {
            const accepted = acceptedIds.has(inv.id)
            const expanded = expandedInvite === inv.id
            return (
              <div key={inv.id}
                style={{ borderRadius: "14px", border: accepted ? "1px solid rgba(52,211,153,0.25)" : "1px solid rgba(251,191,36,0.2)", backgroundColor: accepted ? "rgba(52,211,153,0.03)" : "rgba(251,191,36,0.03)", overflow: "hidden", transition: "all 300ms" }}>
                {/* Invite header */}
                <div style={{ padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "11px", backgroundColor: `${inv.brandColor}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 800, color: inv.brandColor, flexShrink: 0 }}>
                    {inv.brandInitials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px", flexWrap: "wrap" }}>
                      <p style={{ fontSize: "14px", fontWeight: 700, color: "#fafafa" }}>{inv.campaignName}</p>
                      <span style={{ padding: "2px 7px", borderRadius: "5px", backgroundColor: "rgba(251,191,36,0.08)", fontSize: "10px", fontWeight: 700, color: "#fbbf24" }}>New Invite</span>
                    </div>
                    <p style={{ fontSize: "12px", color: "#71717a", marginTop: "2px" }}>
                      {inv.brand} · {inv.niche} · ${inv.budget} budget · Due {new Date(inv.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <button onClick={() => setExpandedInvite(expanded ? null : inv.id)}
                    style={{ padding: "5px", borderRadius: "7px", border: "none", backgroundColor: "rgba(255,255,255,0.05)", cursor: "pointer", flexShrink: 0 }}>
                    <MessageSquare style={{ width: "13px", height: "13px", color: "#71717a" }} />
                  </button>
                </div>

                {/* Expanded message */}
                {expanded && (
                  <div style={{ padding: "0 16px 14px", borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "12px", marginTop: "0" }}>
                    <p style={{ fontSize: "12px", color: "#a1a1aa", lineHeight: 1.7 }}>
                      &ldquo;{inv.message}&rdquo;
                    </p>
                    <p style={{ fontSize: "10px", color: "#3f3f46", marginTop: "6px" }}>
                      Sent {new Date(inv.sentAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div style={{ padding: "10px 16px 14px", display: "flex", gap: "7px" }}>
                  {accepted ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 700, color: "#34d399" }}>
                      <CheckCircle2 style={{ width: "15px", height: "15px" }} />
                      Invite accepted — added to active campaigns
                    </div>
                  ) : (
                    <>
                      <button onClick={() => setDecliningInvite(inv)}
                        style={{ display: "flex", alignItems: "center", gap: "5px", padding: "8px 14px", borderRadius: "8px", border: "1px solid rgba(248,113,113,0.2)", backgroundColor: "rgba(248,113,113,0.05)", color: "#f87171", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                        <ThumbsDown style={{ width: "12px", height: "12px" }} />
                        Decline
                      </button>
                      <button onClick={() => acceptInvite(inv)}
                        style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "8px 14px", borderRadius: "8px", backgroundColor: "#7C3AED", color: "white", fontSize: "12px", fontWeight: 700, border: "none", cursor: "pointer" }}>
                        <ThumbsUp style={{ width: "12px", height: "12px" }} />
                        Accept &amp; View Brief
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Summary row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: "10px" }}>
        {[
          { label: "Total Earned",    value: `$${totalEarned.toLocaleString()}`,    color: "#34d399" },
          { label: "Total Potential", value: `$${totalPotential.toLocaleString()}`, color: "#a78bfa" },
          { label: "Active",          value: String(activeCnt),                     color: "#60a5fa" },
          { label: "Pending Invite",  value: String(pendingCnt),                    color: "#fbbf24" },
        ].map(s => (
          <div key={s.label} style={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", backgroundColor: "#111111", padding: "14px 16px" }}>
            <p style={{ fontSize: "17px", fontWeight: 800, color: s.color }}>{s.value}</p>
            <p style={{ fontSize: "10px", color: "#52525b", marginTop: "3px" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "4px", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "9px", padding: "3px", alignSelf: "flex-start", flexWrap: "wrap" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setFilter(t.id)}
            style={{ padding: "6px 13px", borderRadius: "7px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 600, backgroundColor: filter === t.id ? "#1a1a1a" : "transparent", color: filter === t.id ? "#fafafa" : "#71717a", transition: "all 150ms", whiteSpace: "nowrap" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Campaign cards */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "72px 24px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)", backgroundColor: "#111111" }}>
          <p style={{ fontSize: "15px", fontWeight: 700, color: "#fafafa", marginBottom: "6px" }}>No campaigns here</p>
          <p style={{ fontSize: "13px", color: "#71717a" }}>Campaigns brands invite you to will appear here.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filtered.map(c => {
            const st = STATUS_CFG[c.status]
            const StatusIcon = st.icon
            const pct = Math.round((c.videosPosted / c.videosRequired) * 100)
            const days = daysUntil(c.deadline)
            return (
              <div key={c.id} style={{ borderRadius: "14px", border: "1px solid rgba(255,255,255,0.07)", backgroundColor: "#111111", overflow: "hidden" }}>
                {/* Card header */}
                <div style={{ padding: "16px 18px 14px", display: "flex", alignItems: "flex-start", gap: "14px" }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "11px", backgroundColor: `${c.brandColor}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 800, color: c.brandColor, flexShrink: 0 }}>
                    {c.brandInitials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <p style={{ fontSize: "14px", fontWeight: 700, color: "#fafafa" }}>{c.name}</p>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 7px", borderRadius: "5px", backgroundColor: st.bg, fontSize: "10px", fontWeight: 700, color: st.color }}>
                        <StatusIcon style={{ width: "9px", height: "9px" }} />
                        {st.label}
                      </span>
                    </div>
                    <p style={{ fontSize: "12px", color: "#71717a", marginTop: "2px" }}>
                      {c.brand} · {c.platforms.join(", ")}
                      {c.status !== "completed" && ` · ${days} days left`}
                    </p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                    <p style={{ fontSize: "14px", fontWeight: 800, color: "#34d399" }}>${c.earnings}</p>
                    <p style={{ fontSize: "10px", color: "#52525b" }}>of ${c.potential}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ padding: "0 18px 4px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                    <span style={{ fontSize: "10px", color: "#52525b" }}>Videos: {c.videosPosted}/{c.videosRequired}</span>
                    <span style={{ fontSize: "10px", color: "#a78bfa", fontWeight: 700 }}>{pct}%</span>
                  </div>
                  <div style={{ height: "5px", borderRadius: "99px", backgroundColor: "rgba(255,255,255,0.05)" }}>
                    <div style={{ width: `${pct}%`, height: "100%", borderRadius: "99px", backgroundColor: c.status === "completed" ? "#34d399" : "#7C3AED", transition: "width 600ms ease" }} />
                  </div>
                </div>

                {/* Footer */}
                <div style={{ padding: "12px 18px", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {c.platforms.map(p => (
                      <span key={p} style={{ padding: "2px 7px", borderRadius: "4px", backgroundColor: "rgba(255,255,255,0.04)", fontSize: "10px", color: "#71717a" }}>{p}</span>
                    ))}
                  </div>
                  <button onClick={() => setSelectedCampaign(c)}
                    style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 14px", borderRadius: "8px", border: "1px solid rgba(124,58,237,0.3)", backgroundColor: "rgba(124,58,237,0.06)", color: "#a78bfa", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                    <FileText style={{ width: "12px", height: "12px" }} />
                    View Brief
                    <ChevronDown style={{ width: "10px", height: "10px" }} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selectedCampaign && <BriefModal campaign={selectedCampaign} onClose={() => setSelectedCampaign(null)} />}

      {decliningInvite && (
        <DeclineModal
          invite={decliningInvite}
          onConfirm={() => declineInvite(decliningInvite)}
          onCancel={() => setDecliningInvite(null)}
        />
      )}
    </div>
  )
}
