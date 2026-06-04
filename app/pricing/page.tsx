"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, X, Zap, ChevronDown } from "lucide-react"

/* ─── Plans ─────────────────────────────────────────── */
const PLANS = [
  {
    name: "Starter",
    desc: "Perfect for solo operators and small teams just getting started.",
    monthlyPrice: 49,
    annualPrice: 39,
    highlight: false,
    cta: "Start free trial",
    color: "#71717a",
    features: [
      { text: "1,000 videos tracked",          included: true  },
      { text: "10 creators",                    included: true  },
      { text: "1 seat",                         included: true  },
      { text: "Daily data refresh",             included: true  },
      { text: "TikTok, Instagram, YouTube",     included: true  },
      { text: "Basic analytics dashboard",      included: true  },
      { text: "Email alerts",                   included: true  },
      { text: "CSV export",                     included: true  },
      { text: "API access",                     included: false },
      { text: "White-label",                    included: false },
      { text: "Dedicated support",              included: false },
    ],
  },
  {
    name: "Pro",
    desc: "For growing agencies managing dozens of creators and campaigns.",
    monthlyPrice: 149,
    annualPrice: 119,
    highlight: true,
    badge: "Most Popular",
    cta: "Start free trial",
    color: "#7C3AED",
    features: [
      { text: "5,000 videos tracked",           included: true  },
      { text: "100 creators",                   included: true  },
      { text: "5 seats",                        included: true  },
      { text: "Hourly data refresh",            included: true  },
      { text: "All platforms incl. Facebook",   included: true  },
      { text: "Full analytics + trends",        included: true  },
      { text: "Slack & Discord alerts",         included: true  },
      { text: "CSV + API export",               included: true  },
      { text: "API access",                     included: true  },
      { text: "White-label",                    included: false },
      { text: "Priority support",               included: true  },
    ],
  },
  {
    name: "Agency",
    desc: "For large agencies running UGC at scale across multiple brands.",
    monthlyPrice: 299,
    annualPrice: 239,
    highlight: false,
    cta: "Start free trial",
    color: "#10b981",
    features: [
      { text: "20,000 videos tracked",          included: true  },
      { text: "500 creators",                   included: true  },
      { text: "20 seats",                       included: true  },
      { text: "Real-time data refresh",         included: true  },
      { text: "All platforms incl. Facebook",   included: true  },
      { text: "Full analytics + trends",        included: true  },
      { text: "Slack, Discord & webhooks",      included: true  },
      { text: "CSV + API export",               included: true  },
      { text: "API access",                     included: true  },
      { text: "White-label client portal",      included: true  },
      { text: "Dedicated account manager",      included: true  },
    ],
  },
]

/* ─── Comparison table rows ─────────────────────────── */
const COMPARE = [
  { feature: "Videos tracked",       starter: "1,000",      pro: "5,000",     agency: "20,000"    },
  { feature: "Creators",             starter: "10",         pro: "100",        agency: "500"       },
  { feature: "Team seats",           starter: "1",          pro: "5",          agency: "20"        },
  { feature: "Data refresh",         starter: "Daily",      pro: "Hourly",     agency: "Real-time" },
  { feature: "Platforms",            starter: "3",          pro: "4",          agency: "4"         },
  { feature: "API access",           starter: false,        pro: true,         agency: true        },
  { feature: "White-label portal",   starter: false,        pro: false,        agency: true        },
  { feature: "CSV export",           starter: true,         pro: true,         agency: true        },
  { feature: "Slack / Discord",      starter: false,        pro: true,         agency: true        },
  { feature: "Dedicated support",    starter: false,        pro: false,        agency: true        },
]

const FAQS = [
  { q: "Is there a free trial?",       a: "Yes — every plan includes a 7-day free trial. No credit card required." },
  { q: "Can I switch plans later?",    a: "Absolutely. You can upgrade or downgrade at any time from Settings → Billing." },
  { q: "What payment methods do you accept?", a: "We accept all major credit cards via Stripe. Annual plans can also be paid by bank transfer on request." },
  { q: "Are there setup fees?",        a: "No. There are no setup fees, onboarding fees, or hidden charges." },
  { q: "What is white-labelling?",     a: "Agency plan users can set a custom subdomain (e.g. analytics.youragency.com), upload their logo, and use their brand colours. Clients see your brand, not TrackHive." },
  { q: "Do you offer discounts?",      a: "Annual plans save 20% vs monthly. We also offer custom pricing for very large deployments — email sales@trackhive.io." },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", padding: "16px 0", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
      >
        <span style={{ fontSize: "14px", fontWeight: 500, color: "#d4d4d8" }}>{q}</span>
        <ChevronDown style={{ width: "16px", height: "16px", color: "#52525b", flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 200ms" }} />
      </button>
      {open && <p style={{ fontSize: "13px", color: "#71717a", lineHeight: 1.7, paddingBottom: "16px" }}>{a}</p>}
    </div>
  )
}

function CheckMark({ included }: { included: boolean | string }) {
  if (typeof included === "string") return <span style={{ fontSize: "13px", color: "#d4d4d8", fontWeight: 500 }}>{included}</span>
  return included
    ? <Check style={{ width: "15px", height: "15px", color: "#10b981" }} />
    : <X     style={{ width: "15px", height: "15px", color: "#3f3f46" }} />
}

export default function PricingPage() {
  const [annual, setAnnual] = useState(false)

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0a0a" }}>
      {/* Navbar */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        backgroundColor: "rgba(10,10,10,0.9)",
        backdropFilter: "blur(12px)",
        padding: "0 24px",
        display: "flex", alignItems: "center", height: "60px", gap: "16px",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: "linear-gradient(135deg,#7C3AED,#6D28D9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap style={{ width: "15px", height: "15px", color: "white" }} />
          </div>
          <span style={{ fontSize: "16px", fontWeight: 700, color: "#fafafa" }}>TrackHive</span>
        </Link>
        <nav style={{ display: "flex", gap: "20px", marginLeft: "24px" }}>
          {[{ href: "/#features", label: "Features" }, { href: "/demo", label: "Demo" }, { href: "/blog", label: "Blog" }].map(l => (
            <Link key={l.label} href={l.href} style={{ fontSize: "14px", color: "#71717a", textDecoration: "none" }}>{l.label}</Link>
          ))}
        </nav>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "10px" }}>
          <Link href="/login"  style={{ fontSize: "14px", color: "#71717a", textDecoration: "none", padding: "6px 14px" }}>Login</Link>
          <Link href="/signup" style={{ fontSize: "14px", fontWeight: 600, color: "white", textDecoration: "none", padding: "7px 16px", borderRadius: "8px", backgroundColor: "#7C3AED" }}>Get started free</Link>
        </div>
      </header>

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "64px 24px 48px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 12px", borderRadius: "100px", border: "1px solid rgba(124,58,237,0.3)", backgroundColor: "rgba(124,58,237,0.08)", marginBottom: "20px" }}>
          <span style={{ fontSize: "12px", color: "#a78bfa", fontWeight: 600 }}>7-day free trial · No credit card required</span>
        </div>
        <h1 style={{ fontSize: "clamp(32px,5vw,52px)", fontWeight: 800, color: "#fafafa", lineHeight: 1.15, marginBottom: "16px" }}>
          Simple, transparent pricing
        </h1>
        <p style={{ fontSize: "17px", color: "#71717a", maxWidth: "440px", margin: "0 auto 36px", lineHeight: 1.65 }}>
          Start free. Scale as you grow. Cancel anytime.
        </p>

        {/* Toggle */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "12px", backgroundColor: "#111111", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "100px", padding: "5px 8px" }}>
          <button
            onClick={() => setAnnual(false)}
            style={{ padding: "6px 16px", borderRadius: "100px", fontSize: "13px", fontWeight: 500, cursor: "pointer", border: "none", backgroundColor: !annual ? "rgba(124,58,237,0.2)" : "transparent", color: !annual ? "#a78bfa" : "#71717a", transition: "all 150ms" }}
          >Monthly</button>
          <button
            onClick={() => setAnnual(true)}
            style={{ padding: "6px 16px", borderRadius: "100px", fontSize: "13px", fontWeight: 500, cursor: "pointer", border: "none", backgroundColor: annual ? "rgba(124,58,237,0.2)" : "transparent", color: annual ? "#a78bfa" : "#71717a", transition: "all 150ms", display: "flex", alignItems: "center", gap: "8px" }}
          >
            Annual
            <span style={{ fontSize: "10px", fontWeight: 700, backgroundColor: "rgba(16,185,129,0.15)", color: "#34d399", padding: "2px 6px", borderRadius: "100px", border: "1px solid rgba(16,185,129,0.2)" }}>Save 20%</span>
          </button>
        </div>
      </section>

      {/* Plan cards */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px 64px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          {PLANS.map(plan => (
            <div
              key={plan.name}
              style={{
                borderRadius: "20px",
                border: plan.highlight ? "2px solid rgba(124,58,237,0.4)" : "1px solid rgba(255,255,255,0.07)",
                backgroundColor: plan.highlight ? "rgba(124,58,237,0.04)" : "#111111",
                padding: "28px",
                position: "relative",
                display: "flex", flexDirection: "column",
              }}
            >
              {plan.badge && (
                <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", backgroundColor: "#7C3AED", color: "white", fontSize: "11px", fontWeight: 700, padding: "3px 12px", borderRadius: "100px", whiteSpace: "nowrap" }}>
                  {plan.badge}
                </div>
              )}

              <div style={{ marginBottom: "24px" }}>
                <p style={{ fontSize: "18px", fontWeight: 700, color: "#fafafa", marginBottom: "6px" }}>{plan.name}</p>
                <p style={{ fontSize: "13px", color: "#71717a", lineHeight: 1.55 }}>{plan.desc}</p>
              </div>

              <div style={{ marginBottom: "28px" }}>
                <span style={{ fontSize: "42px", fontWeight: 800, color: "#fafafa", lineHeight: 1 }}>
                  ${annual ? plan.annualPrice : plan.monthlyPrice}
                </span>
                <span style={{ fontSize: "14px", color: "#71717a" }}>/mo</span>
                {annual && <p style={{ fontSize: "12px", color: "#34d399", marginTop: "4px" }}>Billed annually · Save ${(plan.monthlyPrice - plan.annualPrice) * 12}/yr</p>}
              </div>

              <Link
                href="/signup"
                style={{
                  display: "block", textAlign: "center",
                  padding: "12px", borderRadius: "10px", marginBottom: "24px",
                  backgroundColor: plan.highlight ? "#7C3AED" : "rgba(255,255,255,0.07)",
                  color: "white", fontSize: "14px", fontWeight: 600,
                  textDecoration: "none", transition: "background-color 150ms",
                  border: plan.highlight ? "none" : "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {plan.cta}
              </Link>

              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                {plan.features.map(f => (
                  <div key={f.text} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {f.included
                      ? <Check style={{ width: "14px", height: "14px", color: "#10b981", flexShrink: 0 }} />
                      : <X     style={{ width: "14px", height: "14px", color: "#3f3f46", flexShrink: 0 }} />
                    }
                    <span style={{ fontSize: "13px", color: f.included ? "#d4d4d8" : "#52525b" }}>{f.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p style={{ textAlign: "center", fontSize: "13px", color: "#52525b", marginTop: "24px" }}>
          All plans include a 7-day free trial. No credit card required. Cancel anytime.
        </p>
      </section>

      {/* Comparison table */}
      <section style={{ maxWidth: "860px", margin: "0 auto", padding: "0 24px 80px" }}>
        <h2 style={{ fontSize: "clamp(22px,3vw,30px)", fontWeight: 700, color: "#fafafa", textAlign: "center", marginBottom: "36px" }}>
          Compare plans
        </h2>
        <div style={{ borderRadius: "16px", border: "1px solid rgba(255,255,255,0.07)", backgroundColor: "#111111", overflow: "hidden" }}>
          {/* Table header */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ padding: "16px 20px" }} />
            {PLANS.map(p => (
              <div key={p.name} style={{ padding: "16px 12px", textAlign: "center" }}>
                <p style={{ fontSize: "13px", fontWeight: 700, color: p.highlight ? "#a78bfa" : "#fafafa" }}>{p.name}</p>
                <p style={{ fontSize: "12px", color: "#52525b", marginTop: "2px" }}>${annual ? p.annualPrice : p.monthlyPrice}/mo</p>
              </div>
            ))}
          </div>
          {/* Rows */}
          {COMPARE.map((row, i) => (
            <div
              key={row.feature}
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", borderBottom: i < COMPARE.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", backgroundColor: i % 2 === 1 ? "rgba(255,255,255,0.01)" : "transparent" }}
            >
              <div style={{ padding: "14px 20px" }}><span style={{ fontSize: "13px", color: "#a1a1aa" }}>{row.feature}</span></div>
              {[row.starter, row.pro, row.agency].map((val, j) => (
                <div key={j} style={{ padding: "14px 12px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <CheckMark included={val} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ maxWidth: "640px", margin: "0 auto", padding: "0 24px 80px" }}>
        <h2 style={{ fontSize: "clamp(22px,3vw,30px)", fontWeight: 700, color: "#fafafa", textAlign: "center", marginBottom: "36px" }}>
          Frequently asked questions
        </h2>
        <div style={{ backgroundColor: "#111111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "4px 24px" }}>
          {FAQS.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
        </div>
      </section>

      {/* CTA bottom */}
      <section style={{ textAlign: "center", padding: "0 24px 80px" }}>
        <div style={{ maxWidth: "560px", margin: "0 auto", padding: "48px 32px", borderRadius: "24px", background: "linear-gradient(135deg,rgba(124,58,237,0.15),rgba(109,40,217,0.05))", border: "1px solid rgba(124,58,237,0.2)" }}>
          <h3 style={{ fontSize: "26px", fontWeight: 800, color: "#fafafa", marginBottom: "12px" }}>Ready to get started?</h3>
          <p style={{ fontSize: "15px", color: "#71717a", marginBottom: "28px" }}>Join hundreds of brands tracking creators with TrackHive.</p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/signup" style={{ padding: "13px 28px", borderRadius: "12px", backgroundColor: "#7C3AED", color: "white", fontSize: "15px", fontWeight: 700, textDecoration: "none" }}>
              Start free trial →
            </Link>
            <Link href="/demo" style={{ padding: "13px 28px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.12)", backgroundColor: "transparent", color: "#d4d4d8", fontSize: "15px", fontWeight: 500, textDecoration: "none" }}>
              Try the demo
            </Link>
          </div>
          <p style={{ fontSize: "12px", color: "#52525b", marginTop: "16px" }}>7-day free trial · No credit card · Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "24px", display: "flex", alignItems: "center", justifyContent: "center", gap: "24px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "13px", color: "#52525b" }}>© 2025 TrackHive Inc.</span>
        {[
          { label: "Privacy", href: "/privacy" },
          { label: "Terms",   href: "/terms"   },
          { label: "Help",    href: "/help"    },
          { label: "Blog",    href: "/blog"    },
        ].map(l => (
          <Link key={l.label} href={l.href} style={{ fontSize: "13px", color: "#71717a", textDecoration: "none" }}>{l.label}</Link>
        ))}
      </footer>
    </div>
  )
}
