"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"

const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "Head of Growth",
    company: "Luminary Co.",
    avatar: "S",
    avatarColor: "#7C3AED",
    stars: 5,
    quote: "We went from managing 20 creators in spreadsheets to 200 in TrackHive. The CPM automation alone saves us 10+ hours every single week.",
  },
  {
    name: "Marcus Webb",
    role: "Founder",
    company: "Fivex Agency",
    avatar: "M",
    avatarColor: "#3b82f6",
    stars: 5,
    quote: "The competitor intel feature is genuinely unfair advantage. I can see exactly which creators our rivals are working with before they even announce a campaign.",
  },
  {
    name: "Priya Nair",
    role: "UGC Lead",
    company: "Novareach",
    avatar: "P",
    avatarColor: "#10b981",
    stars: 5,
    quote: "Switched from viral.app in one afternoon. TrackHive's data is fresher and the payments module is on another level — no more chasing invoices.",
  },
  {
    name: "James O'Brien",
    role: "Performance Director",
    company: "GrowthOS",
    avatar: "J",
    avatarColor: "#f59e0b",
    stars: 5,
    quote: "Our team runs 12 concurrent campaigns across 300+ creators. TrackHive is the only tool that hasn't broken under that load. Absolute workhorse.",
  },
  {
    name: "Anika Sharma",
    role: "Brand Partnerships",
    company: "Creatify",
    avatar: "A",
    avatarColor: "#ec4899",
    stars: 5,
    quote: "The trends library is where I start every Monday. By the time competitors spot a viral format, we've already briefed 15 creators on it. That's the edge.",
  },
  {
    name: "Tyler Brooks",
    role: "Ops Manager",
    company: "Scaleworks",
    avatar: "T",
    avatarColor: "#06b6d4",
    stars: 5,
    quote: "White-label on the Agency plan is a game-changer. We resell TrackHive under our brand and clients love it. Pays for itself in the first client contract.",
  },
]

function StarRow({ count }: { count: number }) {
  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} style={{ width: "13px", height: "13px", color: "#fbbf24", fill: "#fbbf24" }} />
      ))}
    </div>
  )
}

function TestimonialCard({ t, delay = 0 }: { t: typeof TESTIMONIALS[number]; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      style={{
        backgroundColor: "#111111",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "14px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        transition: "border-color 0.2s",
      }}
      className="hover:border-white/[0.12]"
    >
      {/* Stars */}
      <StarRow count={t.stars} />

      {/* Quote */}
      <p style={{ fontSize: "14px", color: "#a1a1aa", lineHeight: 1.7, flex: 1 }}>
        &ldquo;{t.quote}&rdquo;
      </p>

      {/* Author */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{
          width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0,
          backgroundColor: `${t.avatarColor}22`,
          border: `1px solid ${t.avatarColor}44`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: "13px", fontWeight: 700, color: t.avatarColor }}>{t.avatar}</span>
        </div>
        <div>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "#fafafa" }}>{t.name}</div>
          <div style={{ fontSize: "12px", color: "#52525b" }}>{t.role} · {t.company}</div>
        </div>
      </div>
    </motion.div>
  )
}

/* Mobile marquee row */
function MarqueeRow({ items, reverse = false }: { items: typeof TESTIMONIALS; reverse?: boolean }) {
  const doubled = [...items, ...items]
  return (
    <div style={{ overflow: "hidden", position: "relative" }}>
      <div style={{ display: "flex", gap: "16px", animation: `${reverse ? "marqueeRev" : "marquee"} 32s linear infinite`, width: "max-content" }}>
        {doubled.map((t, i) => (
          <div key={i} style={{ width: "300px", flexShrink: 0 }}>
            <TestimonialCard t={t} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function Testimonials() {
  const row1 = TESTIMONIALS.slice(0, 3)
  const row2 = TESTIMONIALS.slice(3, 6)

  return (
    <section style={{ padding: "96px 0", borderTop: "1px solid rgba(255,255,255,0.05)", overflow: "hidden" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: "center", marginBottom: "56px" }}
        >
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#7C3AED", textTransform: "uppercase", letterSpacing: "0.08em" }}>Testimonials</span>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, color: "#fafafa", letterSpacing: "-0.04em", marginTop: "10px", lineHeight: 1.1 }}>
            Loved by growth teams worldwide
          </h2>
          <p style={{ fontSize: "16px", color: "#71717a", marginTop: "12px" }}>
            Join 500+ brands and agencies already running UGC at scale.
          </p>
        </motion.div>

        {/* Desktop grid: 3×2 */}
        <div className="hidden md:grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
          {TESTIMONIALS.map((t, i) => (
            <TestimonialCard key={t.name} t={t} delay={i * 0.08} />
          ))}
        </div>

        {/* Mobile: two marquee rows */}
        <div className="md:hidden" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <MarqueeRow items={row1} />
          <MarqueeRow items={row2} reverse />
        </div>
      </div>

      <style>{`
        @keyframes marquee    { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes marqueeRev { from{transform:translateX(-50%)} to{transform:translateX(0)} }
      `}</style>
    </section>
  )
}
