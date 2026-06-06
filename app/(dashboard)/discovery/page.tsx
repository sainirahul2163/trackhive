"use client"

import { useState, useMemo, useEffect } from "react"
import { toast, Toaster } from "sonner"
import { fetchCampaigns } from "@/lib/campaigns-data"
import { useUser } from "@/lib/use-user"
import {
  Search, X, Send, ChevronDown, Star, Eye, TrendingUp,
  ExternalLink, CheckCircle2, Filter, Users, DollarSign,
  Zap, MessageSquare,
} from "lucide-react"

// ── Types ──────────────────────────────────────────────────────
type Platform = "tiktok" | "instagram" | "youtube"
type Niche = "Fitness" | "Beauty" | "Fashion" | "Tech" | "Food" | "Travel" | "Gaming" | "Finance" | "Education"

interface CreatorProfile {
  id: string
  name: string
  handle: string
  niche: Niche
  location: string
  bio: string
  platforms: { platform: Platform; handle: string; followers: number }[]
  avgViews: number
  engagementRate: number
  viralityScore: number
  totalEarned: number
  pastBrands: string[]
  topContent: string[]
  responseTime: string
  rating: number
  inviteSent?: boolean
}

interface Campaign {
  id: string
  name: string
  budget: number
  deadline: string
}

const CREATORS: CreatorProfile[] = []

// ── Helpers ────────────────────────────────────────────────────
const PLATFORM_CFG: Record<Platform, { label: string; color: string; bg: string }> = {
  tiktok:    { label: "TikTok",    color: "#fafafa", bg: "rgba(255,255,255,0.08)" },
  instagram: { label: "Instagram", color: "#f472b6", bg: "rgba(244,114,182,0.1)"  },
  youtube:   { label: "YouTube",   color: "#f87171", bg: "rgba(248,113,113,0.1)"  },
}

const NICHES: Niche[] = ["Fitness", "Beauty", "Fashion", "Tech", "Food", "Travel", "Gaming", "Finance", "Education"]

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

function totalFollowers(c: CreatorProfile): number {
  return c.platforms.reduce((s, p) => s + p.followers, 0)
}

function platformProfileUrl(platform: Platform, handle: string): string {
  const h = handle.replace(/^@/, "")
  switch (platform) {
    case "tiktok":    return `https://www.tiktok.com/@${h}`
    case "instagram": return `https://www.instagram.com/${h}`
    case "youtube":   return `https://www.youtube.com/@${h}`
  }
}

function primaryPlatform(c: CreatorProfile): { platform: Platform; handle: string } {
  const sorted = [...c.platforms].sort((a, b) => b.followers - a.followers)
  return sorted[0] ?? { platform: "tiktok", handle: c.handle }
}

function ViralBadge({ score }: { score: number }) {
  const c = score >= 9.5 ? { label: "🔥 Viral",      color: "#f87171", bg: "rgba(239,68,68,0.1)" }
          : score >= 8.5 ? { label: "📈 Rising",     color: "#fbbf24", bg: "rgba(245,158,11,0.1)" }
          :                 { label: "⚡ Established", color: "#a78bfa", bg: "rgba(124,58,237,0.1)" }
  return (
    <span style={{ padding: "2px 7px", borderRadius: "99px", backgroundColor: c.bg, fontSize: "10px", fontWeight: 700, color: c.color }}>
      {c.label}
    </span>
  )
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "11px", fontWeight: 700, color: "#fbbf24" }}>
      <Star style={{ width: "11px", height: "11px" }} fill="currentColor" />
      {rating.toFixed(1)}
    </span>
  )
}

// ── Invite Modal ───────────────────────────────────────────────
interface InviteModalProps {
  creator: CreatorProfile
  campaigns: Campaign[]
  onClose: () => void
  onSend: (creatorId: string, campaignId: string, message: string) => void
}
function InviteModal({ creator, campaigns, onClose }: InviteModalProps) {
  const [selectedCampaign, setSelectedCampaign] = useState("")
  const [message, setMessage] = useState(
    `Hi ${creator.name.split(" ")[0]},\n\nWe love your content and think you'd be a perfect fit for our upcoming campaign. Would you be interested in collaborating?\n\nLooking forward to hearing from you!`
  )
  const [sending, setSending] = useState(false)

  function handleSend() {
    if (!selectedCampaign) return
    setSending(true)
    toast.info("Coming soon", { description: "Invites via email are launching soon." })
    setSending(false)
    onClose()
  }

  const camp = campaigns.find(c => c.id === selectedCampaign)

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.65)", zIndex: 60 }} />
      <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", zIndex: 70 }}>
        <div style={{ width: "100%", maxWidth: "500px", backgroundColor: "#111111", borderRadius: "18px", border: "1px solid rgba(255,255,255,0.09)", overflow: "hidden" }}>
          {/* Header */}
          <div style={{ padding: "20px 22px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: "15px", fontWeight: 800, color: "#fafafa" }}>Invite to Campaign</p>
              <p style={{ fontSize: "12px", color: "#71717a", marginTop: "2px" }}>Sending to {creator.name} · {creator.handle}</p>
            </div>
            <button onClick={onClose} style={{ padding: "6px", borderRadius: "8px", border: "none", backgroundColor: "rgba(255,255,255,0.06)", cursor: "pointer" }}>
              <X style={{ width: "14px", height: "14px", color: "#71717a" }} />
            </button>
          </div>

          <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Campaign picker */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.07em" }}>Select Campaign *</label>
              <div style={{ position: "relative" }}>
                <select value={selectedCampaign} onChange={e => setSelectedCampaign(e.target.value)}
                  style={{ width: "100%", padding: "10px 32px 10px 12px", borderRadius: "9px", border: `1px solid ${selectedCampaign ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.08)"}`, backgroundColor: "#0d0d0d", color: selectedCampaign ? "#fafafa" : "#52525b", fontSize: "13px", outline: "none", appearance: "none", cursor: "pointer", boxSizing: "border-box" }}>
                  <option value="">Choose a campaign…</option>
                  {campaigns.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <ChevronDown style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", width: "13px", height: "13px", color: "#52525b", pointerEvents: "none" }} />
              </div>
            </div>

            {/* Campaign preview */}
            {camp && (
              <div style={{ display: "flex", gap: "16px", padding: "10px 12px", borderRadius: "9px", border: "1px solid rgba(124,58,237,0.15)", backgroundColor: "rgba(124,58,237,0.04)" }}>
                <div>
                  <p style={{ fontSize: "11px", color: "#52525b" }}>Budget</p>
                  <p style={{ fontSize: "14px", fontWeight: 800, color: "#34d399" }}>${camp.budget.toLocaleString()}</p>
                </div>
                <div>
                  <p style={{ fontSize: "11px", color: "#52525b" }}>Deadline</p>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "#fafafa" }}>{new Date(camp.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                </div>
              </div>
            )}

            {/* Message */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.07em" }}>Personal Message</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={6}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "9px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "#0d0d0d", color: "#e4e4e7", fontSize: "13px", outline: "none", resize: "vertical", fontFamily: "inherit", lineHeight: 1.6, boxSizing: "border-box" }} />
            </div>

            {/* CTA */}
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={onClose}
                style={{ flex: 1, padding: "10px", borderRadius: "9px", border: "1px solid rgba(255,255,255,0.09)", backgroundColor: "transparent", color: "#a1a1aa", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={handleSend} disabled={!selectedCampaign || sending}
                style={{ flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", padding: "10px", borderRadius: "9px", backgroundColor: selectedCampaign && !sending ? "#7C3AED" : "rgba(124,58,237,0.3)", color: "white", fontSize: "13px", fontWeight: 700, border: "none", cursor: selectedCampaign && !sending ? "pointer" : "not-allowed", transition: "background 150ms" }}>
                <Send style={{ width: "13px", height: "13px" }} />
                {sending ? "Sending…" : "Send Invite"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Creator Profile Drawer ─────────────────────────────────────
interface ProfileDrawerProps {
  creator: CreatorProfile
  onClose: () => void
  onInvite: (creator: CreatorProfile) => void
  inviteSent: boolean
}
function ProfileDrawer({ creator, onClose, onInvite, inviteSent }: ProfileDrawerProps) {
  const total = totalFollowers(creator)
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 40 }} />
      <div style={{ position: "fixed", right: 0, top: 0, bottom: 0, width: "min(460px,100vw)", backgroundColor: "#111111", borderLeft: "1px solid rgba(255,255,255,0.08)", zIndex: 50, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ padding: "20px 22px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "14px" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "linear-gradient(135deg, #7C3AED, #a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: 900, color: "white", flexShrink: 0 }}>
              {creator.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <p style={{ fontSize: "16px", fontWeight: 800, color: "#fafafa" }}>{creator.name}</p>
                <StarRating rating={creator.rating} />
              </div>
              <p style={{ fontSize: "12px", color: "#71717a", marginTop: "2px" }}>{creator.handle} · {creator.location}</p>
              <div style={{ display: "flex", gap: "5px", marginTop: "6px", flexWrap: "wrap" }}>
                <span style={{ padding: "2px 7px", borderRadius: "5px", backgroundColor: "rgba(124,58,237,0.1)", fontSize: "10px", fontWeight: 700, color: "#a78bfa" }}>{creator.niche}</span>
                <ViralBadge score={creator.viralityScore} />
                <span style={{ padding: "2px 7px", borderRadius: "5px", backgroundColor: "rgba(255,255,255,0.04)", fontSize: "10px", color: "#71717a" }}>⚡ {creator.responseTime}</span>
              </div>
            </div>
            <button onClick={onClose} style={{ padding: "6px", borderRadius: "8px", border: "none", backgroundColor: "rgba(255,255,255,0.06)", cursor: "pointer", flexShrink: 0 }}>
              <X style={{ width: "14px", height: "14px", color: "#71717a" }} />
            </button>
          </div>
          <p style={{ fontSize: "13px", color: "#a1a1aa", lineHeight: 1.7 }}>{creator.bio}</p>
        </div>

        <div style={{ padding: "18px 22px", flex: 1, display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Total reach */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
            {[
              { label: "Total Reach",  value: fmt(total),                       color: "#60a5fa", icon: Users       },
              { label: "Avg Views",    value: fmt(creator.avgViews),            color: "#a78bfa", icon: Eye         },
              { label: "Eng. Rate",    value: `${creator.engagementRate}%`,     color: "#34d399", icon: TrendingUp  },
            ].map(s => {
              const Icon = s.icon
              return (
                <div key={s.label} style={{ padding: "10px 12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)", backgroundColor: "rgba(255,255,255,0.02)", textAlign: "center" }}>
                  <Icon style={{ width: "13px", height: "13px", color: s.color, margin: "0 auto 4px" }} />
                  <p style={{ fontSize: "15px", fontWeight: 800, color: "#fafafa", lineHeight: 1 }}>{s.value}</p>
                  <p style={{ fontSize: "9px", color: "#52525b", marginTop: "3px" }}>{s.label}</p>
                </div>
              )
            })}
          </div>

          {/* Platforms */}
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px" }}>Platforms</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {creator.platforms.map(p => {
                const cfg = PLATFORM_CFG[p.platform]
                return (
                  <div key={p.platform} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", borderRadius: "9px", border: "1px solid rgba(255,255,255,0.05)", backgroundColor: "rgba(255,255,255,0.02)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ padding: "2px 7px", borderRadius: "4px", backgroundColor: cfg.bg, fontSize: "10px", fontWeight: 700, color: cfg.color }}>{cfg.label}</span>
                      <span style={{ fontSize: "12px", color: "#71717a" }}>{p.handle}</span>
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: 800, color: "#fafafa" }}>{fmt(p.followers)}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Top content */}
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px" }}>Top Content Types</p>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {creator.topContent.map(t => (
                <span key={t} style={{ padding: "4px 10px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.07)", backgroundColor: "rgba(255,255,255,0.03)", fontSize: "11px", color: "#a1a1aa" }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Past brands */}
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px" }}>Past Brand Partnerships</p>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {creator.pastBrands.map(b => (
                <span key={b} style={{ padding: "4px 10px", borderRadius: "6px", border: "1px solid rgba(124,58,237,0.15)", backgroundColor: "rgba(124,58,237,0.06)", fontSize: "11px", fontWeight: 600, color: "#a78bfa" }}>{b}</span>
              ))}
            </div>
          </div>

          {/* Earned */}
          <div style={{ padding: "12px 14px", borderRadius: "10px", border: "1px solid rgba(52,211,153,0.15)", backgroundColor: "rgba(52,211,153,0.04)", display: "flex", alignItems: "center", gap: "10px" }}>
            <DollarSign style={{ width: "15px", height: "15px", color: "#34d399", flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: "14px", fontWeight: 800, color: "#34d399" }}>${creator.totalEarned.toLocaleString()} earned</p>
              <p style={{ fontSize: "11px", color: "#52525b" }}>from brand campaigns on TrackHive</p>
            </div>
          </div>
        </div>

        {/* Fixed footer */}
        <div style={{ padding: "14px 22px", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", gap: "8px" }}>
          <a href={platformProfileUrl(primaryPlatform(creator).platform, primaryPlatform(creator).handle)} target="_blank" rel="noreferrer"
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 14px", borderRadius: "9px", border: "1px solid rgba(255,255,255,0.09)", color: "#a1a1aa", fontSize: "12px", fontWeight: 600, textDecoration: "none" }}>
            <ExternalLink style={{ width: "13px", height: "13px" }} />
            View profile
          </a>
          <button onClick={() => inviteSent ? null : onInvite(creator)}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", padding: "10px", borderRadius: "9px", backgroundColor: inviteSent ? "rgba(52,211,153,0.1)" : "#7C3AED", border: inviteSent ? "1px solid rgba(52,211,153,0.2)" : "none", color: inviteSent ? "#34d399" : "white", fontSize: "13px", fontWeight: 700, cursor: inviteSent ? "default" : "pointer" }}>
            {inviteSent
              ? <><CheckCircle2 style={{ width: "14px", height: "14px" }} /> Invite Sent</>
              : <><Send style={{ width: "13px", height: "13px" }} /> Invite to Campaign</>
            }
          </button>
        </div>
      </div>
    </>
  )
}

// ── Main Page ─────────────────────────────────────────────────
export default function DiscoveryPage() {
  const { user } = useUser()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [search, setSearch]               = useState("")
  const [selectedNiche, setSelectedNiche] = useState<Niche | "All">("All")
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | "all">("all")
  const [minFollowers, setMinFollowers]   = useState<number>(0)
  const [minEng, setMinEng]               = useState<number>(0)
  const [sortBy, setSortBy]               = useState<"followers" | "engagement" | "virality" | "rating">("virality")
  const [viewingCreator, setViewingCreator] = useState<CreatorProfile | null>(null)
  const [invitingCreator, setInvitingCreator] = useState<CreatorProfile | null>(null)
  const [invitedIds, setInvitedIds]       = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters]     = useState(false)

  useEffect(() => {
    fetchCampaigns(user?.id).then(data =>
      setCampaigns(data.map(c => ({
        id: c.id,
        name: c.name,
        budget: c.total_payout ?? 0,
        deadline: c.end_date ?? "",
      })))
    ).catch(() => setCampaigns([]))
  }, [user?.id])

  const filtered = useMemo(() => {
    let list = CREATORS.filter(c => {
      if (selectedNiche !== "All" && c.niche !== selectedNiche) return false
      if (selectedPlatform !== "all" && !c.platforms.some(p => p.platform === selectedPlatform)) return false
      if (totalFollowers(c) < minFollowers * 1_000) return false
      if (c.engagementRate < minEng) return false
      if (search && !c.name.toLowerCase().includes(search.toLowerCase()) &&
          !c.handle.toLowerCase().includes(search.toLowerCase()) &&
          !c.niche.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
    if (sortBy === "followers")   list = [...list].sort((a, b) => totalFollowers(b) - totalFollowers(a))
    if (sortBy === "engagement")  list = [...list].sort((a, b) => b.engagementRate - a.engagementRate)
    if (sortBy === "virality")    list = [...list].sort((a, b) => b.viralityScore - a.viralityScore)
    if (sortBy === "rating")      list = [...list].sort((a, b) => b.rating - a.rating)
    return list
  }, [search, selectedNiche, selectedPlatform, minFollowers, minEng, sortBy])

  function handleInviteSend(creatorId: string) {
    setInvitedIds(prev => new Set([...Array.from(prev), creatorId]))
  }

  const FOLLOWER_OPTIONS = [
    { label: "Any",   value: 0       },
    { label: "100K+", value: 100     },
    { label: "500K+", value: 500     },
    { label: "1M+",   value: 1000    },
  ]

  const ENG_OPTIONS = [
    { label: "Any",  value: 0 },
    { label: "5%+",  value: 5 },
    { label: "7%+",  value: 7 },
    { label: "10%+", value: 10 },
  ]

  const totalReach = filtered.reduce((s, c) => s + totalFollowers(c), 0)

  return (
    <>
    <Toaster position="top-right" toastOptions={{ style: { backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", color: "#fafafa" } }} />
    <div style={{ maxWidth: "1100px", display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#fafafa" }}>Creator Discovery</h1>
          <p style={{ fontSize: "13px", color: "#71717a", marginTop: "3px" }}>
            Find the right creators for your campaigns · {CREATORS.length} creators available
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {invitedIds.size > 0 && (
            <span style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "9px", backgroundColor: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.15)", fontSize: "12px", fontWeight: 700, color: "#34d399" }}>
              <CheckCircle2 style={{ width: "13px", height: "13px" }} />
              {invitedIds.size} invite{invitedIds.size > 1 ? "s" : ""} sent
            </span>
          )}
        </div>
      </div>

      {/* Summary strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: "10px" }}>
        {[
          { label: "Creators shown",   value: String(filtered.length),               icon: Users,       color: "#60a5fa" },
          { label: "Combined reach",   value: fmt(totalReach),                        icon: Eye,         color: "#a78bfa" },
          { label: "Invites sent",     value: String(invitedIds.size),                icon: Send,        color: "#34d399" },
          { label: "Avg virality",     value: filtered.length ? (filtered.reduce((s, c) => s + c.viralityScore, 0) / filtered.length).toFixed(1) : "—", icon: Zap, color: "#fbbf24" },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} style={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", backgroundColor: "#111111", padding: "12px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
              <Icon style={{ width: "14px", height: "14px", color: s.color, flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: "16px", fontWeight: 800, color: "#fafafa", lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: "10px", color: "#52525b", marginTop: "2px" }}>{s.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Search + Filter bar */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: "200px", maxWidth: "320px" }}>
          <Search style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", width: "13px", height: "13px", color: "#52525b" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, handle, niche…"
            style={{ width: "100%", paddingLeft: "32px", paddingRight: "10px", height: "36px", borderRadius: "9px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "#111111", color: "#fafafa", fontSize: "12px", outline: "none", boxSizing: "border-box" }} />
        </div>

        {/* Niche filter */}
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
          {(["All", ...NICHES] as (Niche | "All")[]).slice(0, 6).map(n => (
            <button key={n} onClick={() => setSelectedNiche(n)}
              style={{ padding: "5px 10px", borderRadius: "7px", border: "none", cursor: "pointer", fontSize: "11px", fontWeight: 600, backgroundColor: selectedNiche === n ? "#7C3AED" : "rgba(255,255,255,0.04)", color: selectedNiche === n ? "white" : "#71717a", transition: "all 150ms", whiteSpace: "nowrap" }}>
              {n}
            </button>
          ))}
        </div>

        {/* Advanced filters toggle */}
        <button onClick={() => setShowFilters(v => !v)}
          style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 11px", borderRadius: "7px", border: `1px solid ${showFilters ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.08)"}`, backgroundColor: showFilters ? "rgba(124,58,237,0.08)" : "transparent", color: showFilters ? "#a78bfa" : "#71717a", fontSize: "11px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
          <Filter style={{ width: "11px", height: "11px" }} />
          Filters
        </button>

        {/* Sort */}
        <div style={{ position: "relative", marginLeft: "auto" }}>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
            style={{ paddingLeft: "10px", paddingRight: "26px", height: "34px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "#111111", color: "#a1a1aa", fontSize: "12px", outline: "none", appearance: "none", cursor: "pointer" }}>
            <option value="virality">Sort: Virality</option>
            <option value="followers">Sort: Followers</option>
            <option value="engagement">Sort: Engagement</option>
            <option value="rating">Sort: Rating</option>
          </select>
          <ChevronDown style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", width: "11px", height: "11px", color: "#52525b", pointerEvents: "none" }} />
        </div>
      </div>

      {/* Advanced filters panel */}
      {showFilters && (
        <div style={{ padding: "14px 16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.07)", backgroundColor: "#111111", display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "flex-start" }}>
          {/* Platform */}
          <div>
            <p style={{ fontSize: "10px", fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "7px" }}>Platform</p>
            <div style={{ display: "flex", gap: "5px" }}>
              {([{ id: "all", label: "Any" }, { id: "tiktok", label: "TikTok" }, { id: "instagram", label: "Instagram" }, { id: "youtube", label: "YouTube" }] as { id: Platform | "all"; label: string }[]).map(p => (
                <button key={p.id} onClick={() => setSelectedPlatform(p.id)}
                  style={{ padding: "4px 9px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "11px", fontWeight: 600, backgroundColor: selectedPlatform === p.id ? "#1a1a1a" : "transparent", color: selectedPlatform === p.id ? "#fafafa" : "#52525b" }}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          {/* Followers */}
          <div>
            <p style={{ fontSize: "10px", fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "7px" }}>Min. Followers</p>
            <div style={{ display: "flex", gap: "5px" }}>
              {FOLLOWER_OPTIONS.map(o => (
                <button key={o.value} onClick={() => setMinFollowers(o.value)}
                  style={{ padding: "4px 9px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "11px", fontWeight: 600, backgroundColor: minFollowers === o.value ? "#1a1a1a" : "transparent", color: minFollowers === o.value ? "#fafafa" : "#52525b" }}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          {/* Engagement */}
          <div>
            <p style={{ fontSize: "10px", fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "7px" }}>Min. Engagement</p>
            <div style={{ display: "flex", gap: "5px" }}>
              {ENG_OPTIONS.map(o => (
                <button key={o.value} onClick={() => setMinEng(o.value)}
                  style={{ padding: "4px 9px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "11px", fontWeight: 600, backgroundColor: minEng === o.value ? "#1a1a1a" : "transparent", color: minEng === o.value ? "#fafafa" : "#52525b" }}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => { setSelectedPlatform("all"); setMinFollowers(0); setMinEng(0); setSelectedNiche("All") }}
            style={{ alignSelf: "flex-end", padding: "5px 12px", borderRadius: "6px", border: "1px solid rgba(248,113,113,0.2)", backgroundColor: "rgba(248,113,113,0.05)", color: "#f87171", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}>
            Clear all
          </button>
        </div>
      )}

      {/* Creator grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "72px 24px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)", backgroundColor: "#111111" }}>
          <MessageSquare style={{ width: "28px", height: "28px", color: "#52525b", margin: "0 auto 12px" }} />
          <p style={{ fontSize: "15px", fontWeight: 700, color: "#fafafa", marginBottom: "6px" }}>
            {CREATORS.length === 0 ? "No creators in discovery yet" : "No creators match these filters"}
          </p>
          <p style={{ fontSize: "13px", color: "#71717a" }}>
            {CREATORS.length === 0
              ? "Creator profiles will appear here once you build your network."
              : "Try widening your search or adjusting the filters above."}
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px,1fr))", gap: "12px" }}>
          {filtered.map(creator => {
            const total = totalFollowers(creator)
            const sent = invitedIds.has(creator.id)
            return (
              <div key={creator.id}
                style={{ borderRadius: "14px", border: sent ? "1px solid rgba(52,211,153,0.2)" : "1px solid rgba(255,255,255,0.07)", backgroundColor: sent ? "rgba(52,211,153,0.02)" : "#111111", padding: "16px", display: "flex", flexDirection: "column", gap: "12px", cursor: "pointer", transition: "border-color 150ms, transform 150ms" }}
                onMouseEnter={e => { if (!sent) { e.currentTarget.style.borderColor = "rgba(124,58,237,0.3)"; e.currentTarget.style.transform = "translateY(-2px)" } }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = sent ? "rgba(52,211,153,0.2)" : "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "none" }}
                onClick={() => setViewingCreator(creator)}
              >
                {/* Top row */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "13px", background: "linear-gradient(135deg, #7C3AED, #a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: 900, color: "white", flexShrink: 0 }}>
                    {creator.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                      <p style={{ fontSize: "14px", fontWeight: 700, color: "#fafafa" }}>{creator.name}</p>
                      <StarRating rating={creator.rating} />
                    </div>
                    <p style={{ fontSize: "11px", color: "#71717a", marginTop: "1px" }}>{creator.handle} · {creator.niche}</p>
                  </div>
                  <ViralBadge score={creator.viralityScore} />
                </div>

                {/* Stats row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                  {[
                    { label: "Reach",    value: fmt(total),                    color: "#60a5fa" },
                    { label: "Avg views", value: fmt(creator.avgViews),        color: "#a78bfa" },
                    { label: "Eng. rate", value: `${creator.engagementRate}%`, color: "#34d399" },
                  ].map(s => (
                    <div key={s.label} style={{ borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.03)", padding: "7px 8px" }}>
                      <p style={{ fontSize: "12px", fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
                      <p style={{ fontSize: "9px", color: "#52525b", marginTop: "2px" }}>{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Platform badges */}
                <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                  {creator.platforms.map(p => {
                    const cfg = PLATFORM_CFG[p.platform]
                    return (
                      <span key={p.platform} style={{ padding: "2px 7px", borderRadius: "4px", backgroundColor: cfg.bg, fontSize: "9px", fontWeight: 700, color: cfg.color }}>
                        {cfg.label} {fmt(p.followers)}
                      </span>
                    )
                  })}
                  <span style={{ padding: "2px 7px", borderRadius: "4px", backgroundColor: "rgba(255,255,255,0.04)", fontSize: "9px", color: "#52525b" }}>⚡ {creator.responseTime}</span>
                </div>

                {/* CTA */}
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    onClick={e => { e.stopPropagation(); setViewingCreator(creator) }}
                    style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "transparent", color: "#a1a1aa", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                    View Profile
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); if (!sent) setInvitingCreator(creator) }}
                    style={{ flex: 1, padding: "8px", borderRadius: "8px", border: sent ? "1px solid rgba(52,211,153,0.2)" : "none", backgroundColor: sent ? "rgba(52,211,153,0.06)" : "#7C3AED", color: sent ? "#34d399" : "white", fontSize: "12px", fontWeight: 700, cursor: sent ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
                    {sent
                      ? <><CheckCircle2 style={{ width: "12px", height: "12px" }} /> Sent</>
                      : <><Send style={{ width: "11px", height: "11px" }} /> Invite</>
                    }
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Creator profile drawer */}
      {viewingCreator && (
        <ProfileDrawer
          creator={viewingCreator}
          onClose={() => setViewingCreator(null)}
          onInvite={c => { setViewingCreator(null); setInvitingCreator(c) }}
          inviteSent={invitedIds.has(viewingCreator.id)}
        />
      )}

      {/* Invite modal */}
      {invitingCreator && (
        <InviteModal
          creator={invitingCreator}
          campaigns={campaigns}
          onClose={() => setInvitingCreator(null)}
          onSend={creatorId => { handleInviteSend(creatorId); setInvitingCreator(null) }}
        />
      )}
    </div>
    </>
  )
}
