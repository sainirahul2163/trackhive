"use client"

import { useState, useMemo } from "react"
import {
  X, DollarSign, Calendar, CheckCircle2, Clock, AlertCircle,
  ChevronDown, FileText, Video, Link, Info, TrendingUp,
} from "lucide-react"

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

// ── Mock data ──────────────────────────────────────────────────
const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: "c1",
    name: "Summer Drop 2025",
    brand: "AuraBrand",
    brandInitials: "AB",
    brandColor: "#a78bfa",
    status: "active",
    deadline: "2025-07-15",
    startDate: "2025-06-01",
    brief: "Showcase our new Summer collection in your authentic style. We want real, unfiltered moments — try-ons, day-in-the-life content, or honest first impressions. Avoid scripted talking points; your audience trusts you for a reason. Focus on the lifestyle, not the product specs.",
    earnings: 800,
    potential: 1400,
    videosRequired: 4,
    videosPosted: 2,
    platforms: ["TikTok", "Instagram"],
    requirements: [
      { label: "Post 4 videos within campaign window", done: false },
      { label: "Include #AuraVibes and #SummerDrop in caption", done: true },
      { label: "Tag @AuraBrand in at least 2 posts", done: true },
      { label: "Use promo code AURA20 in bio or pinned comment", done: false },
    ],
    deliverables: [
      { type: "video", description: "First impressions / unboxing video (60–90 sec)" },
      { type: "video", description: "GRWM or lifestyle video featuring product (30–60 sec)" },
      { type: "video", description: "Day-in-the-life featuring at least one item" },
      { type: "link", description: "Affiliate link in bio for duration of campaign" },
    ],
    contentGuidelines: [
      "No competitor product logos visible",
      "Do not alter or return items — keep for review purposes",
      "Disclose partnership per FTC guidelines (#ad or #sponsored)",
      "Do not post during blackout window: June 12–15",
    ],
    paymentTerms: "$200 per video upon posting. Bonus $600 if any single video hits 1M views within 30 days.",
    tag: "Fashion",
  },
  {
    id: "c2",
    name: "Back to School Fitness",
    brand: "FitEdge",
    brandInitials: "FE",
    brandColor: "#34d399",
    status: "active",
    deadline: "2025-08-10",
    startDate: "2025-07-01",
    brief: "FitEdge wants creators to demonstrate how their resistance bands and equipment fit into a back-to-school or busy-schedule workout routine. Focus on convenience and effectiveness. Show real workouts, not just product placement.",
    earnings: 420,
    potential: 700,
    videosRequired: 3,
    videosPosted: 1,
    platforms: ["Instagram", "YouTube"],
    requirements: [
      { label: "Post 3 workout videos featuring FitEdge gear", done: false },
      { label: "Link to fitedge.com/creator in bio", done: true },
      { label: "Include before/after or workout progress", done: false },
    ],
    deliverables: [
      { type: "video", description: "Full workout routine with FitEdge bands (YouTube, 8–15 min)" },
      { type: "video", description: "Quick 60-sec workout tip for Instagram Reels" },
      { type: "post", description: "Instagram static post with product tag" },
    ],
    contentGuidelines: [
      "Show real workouts — no lip-sync or dance content",
      "Mention at least one product by name verbally",
      "Disclose partnership with #FitEdgePartner",
    ],
    paymentTerms: "$140 per deliverable upon review and approval. No late posting after deadline.",
    tag: "Fitness",
  },
  {
    id: "c3",
    name: "Tech Unboxing Series",
    brand: "NexGear",
    brandInitials: "NG",
    brandColor: "#60a5fa",
    status: "completed",
    deadline: "2025-05-31",
    startDate: "2025-05-01",
    brief: "Full honest review of the NexGear X1 headphones. We want your real opinion — pros and cons. Our audience respects authenticity more than scripted praise.",
    earnings: 1200,
    potential: 1200,
    videosRequired: 2,
    videosPosted: 2,
    platforms: ["YouTube"],
    requirements: [
      { label: "Unboxing + first impressions video", done: true },
      { label: "Full 7-day review after use", done: true },
      { label: "Include discount code NEXCREATOR", done: true },
    ],
    deliverables: [
      { type: "video", description: "Unboxing + first impressions (YouTube, 8–12 min)" },
      { type: "video", description: "7-day follow-up review" },
    ],
    contentGuidelines: [
      "Be honest — we want real feedback",
      "Show product in daily use",
      "Disclose partnership #NexPartner",
    ],
    paymentTerms: "$600 per video upon upload and review.",
    tag: "Tech",
  },
  {
    id: "c4",
    name: "Glow Routine Challenge",
    brand: "LumaGlow",
    brandInitials: "LG",
    brandColor: "#fbbf24",
    status: "pending",
    deadline: "2025-08-01",
    startDate: "2025-07-15",
    brief: "Document a 7-day morning routine challenge using LumaGlow Vitamin C serum. We want to see the transformation and your genuine reaction to the results.",
    earnings: 0,
    potential: 900,
    videosRequired: 3,
    videosPosted: 0,
    platforms: ["TikTok", "Instagram"],
    requirements: [
      { label: "7-day routine documentation across 3 videos", done: false },
      { label: "Use #GlowChallenge in all posts", done: false },
      { label: "Before/after reveal in final video", done: false },
    ],
    deliverables: [
      { type: "video", description: "Day 1: Start of challenge (intro + baseline)" },
      { type: "video", description: "Day 4: Mid-challenge check-in" },
      { type: "video", description: "Day 7: Final reveal + honest review" },
    ],
    contentGuidelines: [
      "Natural, well-lit shots — no heavy filters on skin",
      "Mention serum by full name in at least one video",
      "Disclose partnership with #ad",
    ],
    paymentTerms: "$300 per video. $300 bonus if before/after video gets 500K+ views.",
    tag: "Beauty",
  },
]

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

export default function CreatorCampaignsPage() {
  const [filter, setFilter] = useState<CampaignStatus | "all">("all")
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)

  const filtered = useMemo(
    () => filter === "all" ? MOCK_CAMPAIGNS : MOCK_CAMPAIGNS.filter(c => c.status === filter),
    [filter]
  )

  const totalEarned    = MOCK_CAMPAIGNS.reduce((s, c) => s + c.earnings, 0)
  const totalPotential = MOCK_CAMPAIGNS.reduce((s, c) => s + c.potential, 0)
  const activeCnt      = MOCK_CAMPAIGNS.filter(c => c.status === "active").length
  const pendingCnt     = MOCK_CAMPAIGNS.filter(c => c.status === "pending").length

  const TABS: { id: CampaignStatus | "all"; label: string }[] = [
    { id: "all",       label: `All (${MOCK_CAMPAIGNS.length})` },
    { id: "active",    label: `Active (${activeCnt})` },
    { id: "pending",   label: `Pending (${pendingCnt})` },
    { id: "completed", label: "Completed" },
  ]

  return (
    <div style={{ maxWidth: "900px", display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#fafafa" }}>My Campaigns</h1>
        <p style={{ fontSize: "13px", color: "#71717a", marginTop: "3px" }}>View briefs, track progress, and manage deliverables</p>
      </div>

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
    </div>
  )
}
