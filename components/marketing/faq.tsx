"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus } from "lucide-react"

const FAQS = [
  {
    q: "How is TrackHive different from viral.app?",
    a: "TrackHive is built specifically for brands and agencies running UGC at scale — not just discovery. Where viral.app stops at finding creators, TrackHive gives you the full workflow: tracking, campaigns, automated payments and competitor intelligence, all in one place. We also refresh data significantly faster and support CPM-based payment automation that viral.app doesn't offer.",
  },
  {
    q: "Do creators need to connect their accounts?",
    a: "No. TrackHive pulls public data directly from TikTok, Instagram, YouTube and Facebook using platform APIs — creators don't need to log in, grant access or even know they're being tracked. Just paste a profile URL and you're live within seconds.",
  },
  {
    q: "What platforms do you support?",
    a: "We currently support TikTok, Instagram, YouTube and Facebook. Pinterest and X (Twitter) are on the roadmap for Q3 2026. Each platform surfaces views, engagement rate, follower growth, estimated CPM and a virality score unique to TrackHive.",
  },
  {
    q: "How does creator payment work?",
    a: "You set a payment rule — CPM (e.g. $18 per 1,000 views), CPA, flat fee or milestone-based. When a creator's video hits your threshold, TrackHive automatically calculates the payout, generates an invoice and queues the payment. You approve in bulk or set auto-approve for trusted creators. Payouts go out via bank transfer or Stripe.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes — every plan comes with a 7-day free trial, no credit card required. You get full access to all features in your chosen plan. After 7 days you can subscribe or downgrade to keep your data. We don't delete anything if you don't convert.",
  },
  {
    q: "Can agencies white-label the platform?",
    a: "Yes, on the Agency plan. You can replace the TrackHive logo and branding with your own, use a custom subdomain (e.g. analytics.youragency.com) and give clients access under your brand. It takes about 10 minutes to set up from the settings panel.",
  },
  {
    q: "How accurate is the data?",
    a: "Very. We pull directly from official platform APIs where available, and supplement with high-frequency scraping for data points not exposed via API. Starter plans refresh daily, Pro plans hourly, and Agency plans in near real-time. We display data confidence scores on every metric so you always know the source.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. Cancel from your account settings in one click — no calls, no cancellation forms, no guilt trips. If you cancel mid-cycle you keep access until the end of your billing period. Annual subscribers get a pro-rated refund for unused months.",
  },
]

function FAQItem({ item, index }: { item: typeof FAQS[number]; index: number }) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={{
        borderRadius: "12px",
        backgroundColor: open ? "#111111" : "transparent",
        border: open ? "1px solid rgba(124,58,237,0.25)" : "1px solid rgba(255,255,255,0.07)",
        overflow: "hidden",
        transition: "background-color 0.2s, border-color 0.2s",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: "16px", padding: "20px 24px", cursor: "pointer", textAlign: "left",
          background: "none", border: "none",
        }}
      >
        <span style={{ fontSize: "15px", fontWeight: 600, color: open ? "#fafafa" : "#e4e4e7", lineHeight: 1.4, transition: "color 0.15s" }}>
          {item.q}
        </span>
        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.22 }}
          style={{
            width: "28px", height: "28px", borderRadius: "7px", flexShrink: 0,
            backgroundColor: open ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.05)",
            border: open ? "1px solid rgba(124,58,237,0.3)" : "1px solid rgba(255,255,255,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background-color 0.2s, border-color 0.2s",
          }}
        >
          <Plus style={{ width: "14px", height: "14px", color: open ? "#a855f7" : "#71717a" }} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <p style={{ padding: "0 24px 20px", fontSize: "14px", color: "#71717a", lineHeight: 1.75 }}>
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function FAQ() {
  return (
    <section style={{ padding: "96px 0", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "0 24px" }}>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: "center", marginBottom: "52px" }}
        >
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#7C3AED", textTransform: "uppercase", letterSpacing: "0.08em" }}>FAQ</span>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: "#fafafa", letterSpacing: "-0.04em", marginTop: "10px", lineHeight: 1.1 }}>
            Frequently asked questions
          </h2>
          <p style={{ fontSize: "15px", color: "#71717a", marginTop: "12px" }}>
            Can&apos;t find what you&apos;re looking for?{" "}
            <a href="mailto:hello@trackhive.io" style={{ color: "#a855f7", textDecoration: "none" }} className="hover:underline">
              Email us
            </a>
            .
          </p>
        </motion.div>

        {/* Accordion */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {FAQS.map((item, i) => (
            <FAQItem key={i} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
