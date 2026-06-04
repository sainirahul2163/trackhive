"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Zap, ArrowLeft, Search, BookOpen, MessageCircle,
  BarChart3, Megaphone, CreditCard, TrendingUp, Eye,
  Settings, ChevronDown, ExternalLink, Mail, X as XIcon,
} from "lucide-react"

/* ─── Category cards ────────────────────────────────── */
const CATEGORIES = [
  {
    icon: BarChart3, label: "Analytics", color: "text-blue-400", bg: "bg-blue-500/10",
    articles: ["How to add a creator account", "What platforms are supported?", "Understanding virality score", "Syncing creator data manually"],
  },
  {
    icon: Megaphone, label: "Campaigns", color: "text-purple-400", bg: "bg-purple-500/10",
    articles: ["Creating your first campaign", "Adding creators to a campaign", "Setting CPM & payout rules", "Campaign status definitions"],
  },
  {
    icon: CreditCard, label: "Payments", color: "text-emerald-400", bg: "bg-emerald-500/10",
    articles: ["How to invite a creator to get paid", "Approving and releasing payouts", "Setting up payout rules", "Invoice generation explained"],
  },
  {
    icon: TrendingUp, label: "Trends", color: "text-amber-400", bg: "bg-amber-500/10",
    articles: ["Filtering the trends library", "Saving videos to inspiration boards", "Using the brief generator", "Understanding the weekly digest"],
  },
  {
    icon: Eye, label: "Competitors", color: "text-rose-400", bg: "bg-rose-500/10",
    articles: ["Adding a competitor brand", "How the AI report works", "Flagging creators for outreach", "Posting frequency metrics"],
  },
  {
    icon: Settings, label: "Account & Billing", color: "text-zinc-400", bg: "bg-zinc-500/10",
    articles: ["Changing your plan", "Managing team members", "Setting up white-label (Agency)", "Cancelling your subscription"],
  },
]

/* ─── FAQ items ─────────────────────────────────────── */
const FAQS = [
  {
    q: "How do I add a creator without them logging in?",
    a: "TrackHive tracks creators using their public profile URLs — no creator login or API access required. Just paste a TikTok, Instagram, YouTube, or Facebook profile URL and we'll start tracking automatically.",
  },
  {
    q: "How accurate is the analytics data?",
    a: "TrackHive pulls from public data sources. View counts, follower numbers, and engagement metrics are accurate within the last sync window (typically every 6–24 hours depending on your plan). Real-time data is not available.",
  },
  {
    q: "Can I connect my own Slack for notifications?",
    a: "Yes. Go to Settings → Integrations → Slack and click 'Connect Slack'. You can configure which event types trigger Slack notifications (campaign milestones, payment events, competitor spikes, etc.).",
  },
  {
    q: "How do creator payouts work?",
    a: "You define payout rules (base fee + CPM rate + milestone bonus) per campaign. When a creator hits a threshold, TrackHive queues a payout for your approval. Once approved, payment is sent via the creator's chosen method (PayPal, Wise, bank transfer).",
  },
  {
    q: "Can I white-label TrackHive for my clients?",
    a: "Yes — white-labelling is available on the Agency plan. You can set a custom subdomain, upload your logo, use your brand colours, and customise the email sender name. Your clients will see your branding, not TrackHive.",
  },
  {
    q: "What's the difference between the plans?",
    a: "Starter ($49/mo) covers 1,000 videos and 10 creators. Pro ($149/mo) covers 5,000 videos, 100 creators, and unlocks API access. Agency ($299/mo) covers 20,000 videos, 500 creators, and includes white-labelling. All plans include a 7-day free trial.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. You can cancel your subscription from Settings → Billing at any time. You'll retain access until the end of your current billing period — no partial refunds are issued for unused time.",
  },
  {
    q: "How do I export data?",
    a: "CSV export is available on Pro and Agency plans. Click the Export button on any analytics, campaign, or payout table. You can also access raw data via the API (Pro and above).",
  },
]

/* ─── Accordion ─────────────────────────────────────── */
function Accordion({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-white/[0.06] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left"
      >
        <span className="text-sm font-medium text-zinc-200">{q}</span>
        <ChevronDown className={`w-4 h-4 text-zinc-500 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="pb-4">
          <p className="text-sm text-zinc-400 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────── */
export default function HelpPage() {
  const [search, setSearch] = useState("")

  const filteredFAQs = FAQS.filter(f =>
    f.q.toLowerCase().includes(search.toLowerCase()) ||
    f.a.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0a0a" }}>
      {/* Navbar */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        backgroundColor: "rgba(10,10,10,0.9)",
        backdropFilter: "blur(12px)",
        padding: "0 24px",
        display: "flex", alignItems: "center", height: "60px",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: "linear-gradient(135deg,#7C3AED,#6D28D9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap style={{ width: "15px", height: "15px", color: "white" }} />
          </div>
          <span style={{ fontSize: "16px", fontWeight: 700, color: "#fafafa" }}>TrackHive</span>
          <span style={{ fontSize: "13px", color: "#52525b", marginLeft: "4px" }}>/ Help</span>
        </Link>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/dashboard" style={{ fontSize: "13px", color: "#71717a", textDecoration: "none" }}>Dashboard</Link>
          <Link href="/"          style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "#71717a", textDecoration: "none" }}>
            <ArrowLeft style={{ width: "13px", height: "13px" }} /> Back
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "64px 24px 48px" }}>
        <h1 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, color: "#fafafa", marginBottom: "14px" }}>
          How can we help?
        </h1>
        <p style={{ fontSize: "16px", color: "#71717a", marginBottom: "32px" }}>
          Guides, FAQs, and quick answers for every feature.
        </p>

        {/* Search */}
        <div style={{ maxWidth: "480px", margin: "0 auto", position: "relative" }}>
          <Search style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#52525b" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search help articles…"
            style={{
              width: "100%", padding: "13px 14px 13px 42px",
              borderRadius: "12px", backgroundColor: "#111111",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#fafafa", fontSize: "15px", outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      </section>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px 80px" }}>
        {/* Browse by category */}
        {!search && (
          <section style={{ marginBottom: "56px" }}>
            <div className="flex items-center gap-2 mb-5">
              <BookOpen className="w-4 h-4 text-zinc-500" />
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Browse by topic</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CATEGORIES.map(cat => {
                const Icon = cat.icon
                return (
                  <div key={cat.label} className="rounded-xl border border-white/[0.06] bg-[#111111] p-5 hover:border-white/10 transition-colors">
                    <div className={`w-9 h-9 rounded-xl ${cat.bg} flex items-center justify-center mb-3`}>
                      <Icon className={`w-4.5 h-4.5 ${cat.color}`} />
                    </div>
                    <p className="text-sm font-semibold text-white mb-3">{cat.label}</p>
                    <ul className="space-y-1.5">
                      {cat.articles.map(a => (
                        <li key={a}>
                          <button
                            onClick={() => {}}
                            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors text-left flex items-center gap-1"
                          >
                            <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                            {a}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* FAQ */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <MessageCircle className="w-4 h-4 text-zinc-500" />
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              {search ? `Results for "${search}"` : "Frequently asked questions"}
            </span>
          </div>

          {filteredFAQs.length === 0 ? (
            <div className="rounded-xl border border-white/[0.06] bg-[#111111] p-10 text-center">
              <p className="text-sm text-zinc-500">No results found for &ldquo;{search}&rdquo;</p>
              <p className="text-xs text-zinc-600 mt-1">Try a different search or browse the categories above.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-white/[0.06] bg-[#111111] px-6">
              {filteredFAQs.map(faq => (
                <Accordion key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          )}
        </section>

        {/* Still need help */}
        <div className="mt-10 rounded-xl border border-white/[0.06] bg-[#111111] p-6 flex flex-col sm:flex-row items-center gap-5">
          <div className="flex-1 text-center sm:text-left">
            <p className="text-base font-semibold text-white mb-1">Still need help?</p>
            <p className="text-sm text-zinc-500">Our support team typically responds within 4 business hours.</p>
          </div>
          <div className="flex gap-3 flex-wrap justify-center">
            <a
              href="mailto:support@trackhive.io"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-all"
            >
              <Mail className="w-3.5 h-3.5" />
              Email support
            </a>
            <a
              href="https://twitter.com/trackhive"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-zinc-300 text-sm font-medium hover:text-white hover:border-white/12 transition-all"
            >
              <XIcon className="w-3.5 h-3.5" />
              DM on X
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
