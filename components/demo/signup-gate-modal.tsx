"use client"

import Link from "next/link"
import { X, BarChart2, Megaphone, CreditCard, TrendingUp, Search, Bell, Settings, Sparkles, Zap, Users, FileText, Shield } from "lucide-react"

interface SignupGateModalProps {
  open: boolean
  onClose: () => void
  feature?: string
}

interface FeatureCfg {
  icon: React.ComponentType<{ style?: React.CSSProperties }>
  iconBg: string
  iconColor: string
  headline: string
  desc: string
}

const FEATURE_MAP: Record<string, FeatureCfg> = {
  "creator detail view": {
    icon: BarChart2, iconBg: "rgba(59,130,246,0.12)", iconColor: "#60a5fa",
    headline: "See the full creator breakdown",
    desc: "30-day trend charts, engagement rate, weekly posting patterns, top videos, and estimated revenue — for every creator you track.",
  },
  "full creator analytics": {
    icon: BarChart2, iconBg: "rgba(59,130,246,0.12)", iconColor: "#60a5fa",
    headline: "Unlock full creator analytics",
    desc: "Virality scores, engagement breakdowns, follower growth, and 90-day trends for any creator you add to your workspace.",
  },
  "account tracking": {
    icon: Users, iconBg: "rgba(124,58,237,0.12)", iconColor: "#a78bfa",
    headline: "Track unlimited creators",
    desc: "Add TikTok, Instagram, YouTube, and Pinterest accounts and get daily refreshed stats — no platform login required.",
  },
  "campaign creation": {
    icon: Megaphone, iconBg: "rgba(124,58,237,0.12)", iconColor: "#a78bfa",
    headline: "Launch your first campaign",
    desc: "Create a campaign brief, invite creators, set milestones, and track views and ROI — all in one place.",
  },
  "campaign management": {
    icon: Megaphone, iconBg: "rgba(124,58,237,0.12)", iconColor: "#a78bfa",
    headline: "Manage campaigns at scale",
    desc: "Track progress against targets, manage creator deliverables, and automate payouts when milestones are hit.",
  },
  "payout processing": {
    icon: CreditCard, iconBg: "rgba(16,185,129,0.12)", iconColor: "#34d399",
    headline: "Process creator payouts",
    desc: "One-click payouts via PayPal, bank transfer, or Wise. Automatic invoices, KYC tracking, and payout history.",
  },
  "payout rule management": {
    icon: CreditCard, iconBg: "rgba(16,185,129,0.12)", iconColor: "#34d399",
    headline: "Create custom payout rules",
    desc: "Set base fees, CPM rates, milestone bonuses, and performance caps. Apply rules to any campaign automatically.",
  },
  "alert management": {
    icon: Bell, iconBg: "rgba(239,68,68,0.12)", iconColor: "#f87171",
    headline: "Get real-time creator alerts",
    desc: "Viral spike alerts, follower drop warnings, posting streak breaks, and weekly engagement summaries — all delivered to Slack or email.",
  },
  "notifications": {
    icon: Bell, iconBg: "rgba(239,68,68,0.12)", iconColor: "#f87171",
    headline: "Never miss a viral moment",
    desc: "Instant notifications when a creator goes viral, posts late, or hits a campaign milestone.",
  },
  "global search": {
    icon: Search, iconBg: "rgba(245,158,11,0.12)", iconColor: "#fbbf24",
    headline: "Search across everything",
    desc: "Find any creator, campaign, payout, or alert in seconds with CMD+K global search.",
  },
  "save to inspiration board": {
    icon: Sparkles, iconBg: "rgba(124,58,237,0.12)", iconColor: "#a78bfa",
    headline: "Save videos to your board",
    desc: "Collect viral formats, hook templates, and competitor content in custom inspiration boards — and generate briefs from them.",
  },
  "AI brief generation": {
    icon: Sparkles, iconBg: "rgba(124,58,237,0.12)", iconColor: "#a78bfa",
    headline: "Generate AI campaign briefs",
    desc: "Pick reference videos, add campaign context, and get a full brief with hook options, dos & don'ts, captions, and hashtags.",
  },
  "export analytics": {
    icon: FileText, iconBg: "rgba(59,130,246,0.12)", iconColor: "#60a5fa",
    headline: "Export your analytics data",
    desc: "Download creator stats, campaign performance, and payout history as CSV for reporting and client decks.",
  },
  "CSV export": {
    icon: FileText, iconBg: "rgba(59,130,246,0.12)", iconColor: "#60a5fa",
    headline: "Export payment history",
    desc: "Download full payout history, invoices, and creator earnings as CSV for accounting and reporting.",
  },
  "account settings": {
    icon: Settings, iconBg: "rgba(255,255,255,0.06)", iconColor: "#a1a1aa",
    headline: "Manage your account",
    desc: "Update your profile, change notification preferences, manage team members, and configure your workspace.",
  },
  "detailed video analytics": {
    icon: TrendingUp, iconBg: "rgba(16,185,129,0.12)", iconColor: "#34d399",
    headline: "See every video's performance",
    desc: "Views over time, engagement rate, comments, shares, and virality score for every tracked video.",
  },
}

const DEFAULT_CFG: FeatureCfg = {
  icon: Zap, iconBg: "rgba(124,58,237,0.12)", iconColor: "#a78bfa",
  headline: "Unlock this feature",
  desc: "Create a free account to access full creator analytics, campaign management, and automated payouts.",
}

const SOCIAL_PROOF = [
  { value: "500+",  label: "brands & agencies" },
  { value: "$5M+",  label: "payouts processed" },
  { value: "1M+",   label: "creators tracked" },
]

const TESTIMONIAL = {
  quote: "TrackHive saved us 10 hours a week. We used to track 30 creators in spreadsheets — now we manage 120.",
  author: "Sarah K.",
  role: "Head of Influencer Marketing, AuraBrand",
}

export function SignupGateModal({ open, onClose, feature = "this feature" }: SignupGateModalProps) {
  if (!open) return null

  const cfg = FEATURE_MAP[feature] ?? DEFAULT_CFG
  const Icon = cfg.icon

  return (
    <>
      <div
        style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", zIndex: 50 }}
        onClick={onClose}
      />
      <div
        style={{ position: "fixed", left: "50%", top: "50%", transform: "translate(-50%,-50%)", zIndex: 50, width: "100%", maxWidth: "420px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.1)", backgroundColor: "#111111", overflow: "hidden" }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{ position: "absolute", top: "16px", right: "16px", padding: "6px", borderRadius: "8px", border: "none", backgroundColor: "rgba(255,255,255,0.06)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <X style={{ width: "14px", height: "14px", color: "#71717a" }} />
        </button>

        {/* Header */}
        <div style={{ padding: "32px 28px 24px", textAlign: "center" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "16px", backgroundColor: cfg.iconBg, border: `1px solid ${cfg.iconColor}30`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
            <Icon style={{ width: "26px", height: "26px", color: cfg.iconColor }} />
          </div>
          <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#fafafa", marginBottom: "8px", lineHeight: 1.25 }}>{cfg.headline}</h2>
          <p style={{ fontSize: "13px", color: "#71717a", lineHeight: 1.65 }}>{cfg.desc}</p>
        </div>

        {/* Social proof strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          {SOCIAL_PROOF.map((s, i) => (
            <div key={s.label} style={{ padding: "12px 8px", textAlign: "center", borderRight: i < SOCIAL_PROOF.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
              <p style={{ fontSize: "16px", fontWeight: 800, color: "#fafafa", lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: "10px", color: "#52525b", marginTop: "3px" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div style={{ padding: "20px 28px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
            <Link
              href="/signup"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", borderRadius: "10px", backgroundColor: "#7C3AED", color: "white", fontSize: "14px", fontWeight: 700, textDecoration: "none", boxShadow: "0 0 24px rgba(124,58,237,0.35)" }}
            >
              <Zap style={{ width: "15px", height: "15px" }} fill="currentColor" />
              Start free — no credit card
            </Link>
            <Link
              href="/login"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "11px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)", color: "#a1a1aa", fontSize: "13px", textDecoration: "none" }}
            >
              Already have an account? Sign in
            </Link>
          </div>

          {/* Testimonial */}
          <div style={{ padding: "12px 14px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <p style={{ fontSize: "12px", color: "#a1a1aa", lineHeight: 1.6, marginBottom: "8px", fontStyle: "italic" }}>&ldquo;{TESTIMONIAL.quote}&rdquo;</p>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "rgba(124,58,237,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "9px", fontWeight: 700, color: "#a78bfa" }}>SK</span>
              </div>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#e4e4e7" }}>{TESTIMONIAL.author}</span>
                <span style={{ fontSize: "10px", color: "#52525b", marginLeft: "6px" }}>{TESTIMONIAL.role}</span>
              </div>
            </div>
          </div>

          {/* Trust line */}
          <p style={{ textAlign: "center", fontSize: "11px", color: "#52525b", marginTop: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
            <Shield style={{ width: "11px", height: "11px" }} /> 7-day free trial · No credit card · Cancel anytime
          </p>
        </div>
      </div>
    </>
  )
}
