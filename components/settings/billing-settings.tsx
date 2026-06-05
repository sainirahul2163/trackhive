"use client"

import { useState } from "react"
import { CreditCard, Download, ArrowUpRight, Check, AlertTriangle, Zap } from "lucide-react"
import { toast, Toaster } from "sonner"
import Link from "next/link"

interface Invoice {
  id: string
  date: string
  amount: string
  status: "Paid" | "Failed"
}

const INVOICES: Invoice[] = []

const PLANS = [
  {
    name: "Starter",
    price: "$49",
    features: ["1,000 videos", "10 creators", "1 seat", "Daily refresh"],
    current: false,
  },
  {
    name: "Pro",
    price: "$149",
    features: ["5,000 videos", "100 creators", "5 seats", "Hourly refresh", "API access"],
    current: true,
  },
  {
    name: "Agency",
    price: "$299",
    features: ["20,000 videos", "500 creators", "20 seats", "Real-time", "White-label"],
    current: false,
  },
]

const USAGE = [
  { label: "Videos Tracked", used: 0, max: 5000, color: "#7C3AED" },
  { label: "Creators",        used: 0, max: 100,  color: "#3b82f6" },
  { label: "Seats Used",      used: 0, max: 5,    color: "#10b981" },
]

function ProgressBar({ used, max, color }: { used: number; max: number; color: string }) {
  const pct = Math.min(100, (used / max) * 100)
  const danger = pct >= 90
  return (
    <div>
      <div style={{ height: "6px", borderRadius: "3px", backgroundColor: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, borderRadius: "3px", backgroundColor: danger ? "#ef4444" : color, transition: "width 0.4s" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
        <span style={{ fontSize: "11px", color: danger ? "#f87171" : "#52525b" }}>
          {used.toLocaleString()} / {max.toLocaleString()}
        </span>
        <span style={{ fontSize: "11px", color: danger ? "#f87171" : "#52525b", fontWeight: 600 }}>
          {Math.round(pct)}%
        </span>
      </div>
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: "#111111", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", padding: "24px", marginBottom: "16px" }}>
      <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#fafafa", marginBottom: "18px" }}>{title}</h3>
      {children}
    </div>
  )
}

export function BillingSettings() {
  const [showCancelModal, setShowCancelModal] = useState(false)

  function handleUpdatePayment() {
    toast.info("Redirecting to payment portal…")
  }

  function handleCancelConfirm() {
    setShowCancelModal(false)
    toast.success("Subscription cancelled", { description: "You have access until Jul 1, 2026." })
  }

  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", color: "#fafafa" } }} />

      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#fafafa", marginBottom: "4px" }}>Billing</h2>
        <p style={{ fontSize: "13px", color: "#71717a" }}>Manage your plan, usage and payment details.</p>
      </div>

      {/* Current plan */}
      <SectionCard title="Current Plan">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <Zap style={{ width: "16px", height: "16px", color: "#a855f7" }} />
              <span style={{ fontSize: "18px", fontWeight: 700, color: "#fafafa" }}>Pro Plan</span>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#7C3AED", backgroundColor: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)", padding: "2px 8px", borderRadius: "4px" }}>Current</span>
            </div>
            <p style={{ fontSize: "13px", color: "#71717a" }}>$149/month · Renews Jul 1, 2026</p>
          </div>
          <Link
            href="#pricing"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "8px", backgroundColor: "#7C3AED", color: "#fff", fontSize: "13px", fontWeight: 600, textDecoration: "none", boxShadow: "0 0 16px rgba(124,58,237,0.25)" }}
          >
            Upgrade Plan <ArrowUpRight style={{ width: "14px", height: "14px" }} />
          </Link>
        </div>

        {/* Usage meters */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {USAGE.map(u => (
            <div key={u.label}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "12px", fontWeight: 500, color: "#a1a1aa" }}>{u.label}</span>
              </div>
              <ProgressBar used={u.used} max={u.max} color={u.color} />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Plan comparison */}
      <SectionCard title="Plan Comparison">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
          {PLANS.map(plan => (
            <div
              key={plan.name}
              style={{
                padding: "16px", borderRadius: "10px",
                backgroundColor: plan.current ? "rgba(124,58,237,0.08)" : "rgba(255,255,255,0.02)",
                border: plan.current ? "1px solid rgba(124,58,237,0.3)" : "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div style={{ fontSize: "13px", fontWeight: 700, color: plan.current ? "#c084fc" : "#a1a1aa", marginBottom: "2px" }}>{plan.name}</div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "#fafafa", marginBottom: "12px" }}>{plan.price}<span style={{ fontSize: "11px", color: "#52525b" }}>/mo</span></div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Check style={{ width: "11px", height: "11px", color: plan.current ? "#a855f7" : "#52525b", flexShrink: 0 }} />
                    <span style={{ fontSize: "11px", color: "#71717a" }}>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Payment method */}
      <SectionCard title="Payment Method">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "28px", borderRadius: "5px", backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CreditCard style={{ width: "18px", height: "18px", color: "#52525b" }} />
            </div>
            <div>
              <p style={{ fontSize: "13px", fontWeight: 500, color: "#fafafa" }}>Visa ending in 4242</p>
              <p style={{ fontSize: "11px", color: "#52525b" }}>Expires 08/2028</p>
            </div>
          </div>
          <button
            onClick={handleUpdatePayment}
            style={{ padding: "7px 14px", borderRadius: "7px", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#a1a1aa", fontSize: "12px", fontWeight: 500, cursor: "pointer", transition: "all 0.15s" }}
            className="hover:text-white hover:border-white/20"
          >
            Update
          </button>
        </div>
      </SectionCard>

      {/* Invoice history */}
      <SectionCard title="Invoice History">
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 80px 48px", gap: "12px", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", marginBottom: "4px" }}>
            {["Date", "Amount", "Status", ""].map(h => (
              <span key={h} style={{ fontSize: "11px", fontWeight: 600, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</span>
            ))}
          </div>
          {INVOICES.length === 0 ? (
            <p style={{ fontSize: "13px", color: "#71717a", padding: "16px 0", textAlign: "center" }}>No invoices yet</p>
          ) : INVOICES.map((inv, i) => (
            <div key={inv.id} style={{ display: "grid", gridTemplateColumns: "1fr 100px 80px 48px", gap: "12px", padding: "11px 0", alignItems: "center", borderBottom: i < INVOICES.length - 1 ? "1px solid rgba(255,255,255,0.04)" : undefined }}>
              <span style={{ fontSize: "13px", color: "#a1a1aa" }}>{inv.date}</span>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#fafafa" }}>{inv.amount}</span>
              <span style={{ fontSize: "11px", fontWeight: 600, color: inv.status === "Paid" ? "#34d399" : "#f87171", backgroundColor: inv.status === "Paid" ? "rgba(52,211,153,0.1)" : "rgba(239,68,68,0.1)", padding: "2px 8px", borderRadius: "4px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                {inv.status === "Paid" ? <Check style={{ width: "9px", height: "9px" }} /> : <AlertTriangle style={{ width: "9px", height: "9px" }} />}
                {inv.status}
              </span>
              <button
                onClick={() => toast.success(`Downloading ${inv.id}…`)}
                style={{ width: "28px", height: "28px", borderRadius: "6px", backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                className="hover:border-white/20"
              >
                <Download style={{ width: "12px", height: "12px", color: "#71717a" }} />
              </button>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Cancel */}
      <div style={{ textAlign: "center", paddingTop: "8px" }}>
        <button
          onClick={() => setShowCancelModal(true)}
          style={{ fontSize: "12px", color: "#ef4444", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", opacity: 0.7 }}
          className="hover:opacity-100"
        >
          Cancel Subscription
        </button>
      </div>

      {/* Cancel modal */}
      {showCancelModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "24px" }}>
          <div style={{ backgroundColor: "#111111", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", padding: "32px", maxWidth: "400px", width: "100%", boxShadow: "0 24px 80px rgba(0,0,0,0.6)" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "10px", backgroundColor: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
              <AlertTriangle style={{ width: "20px", height: "20px", color: "#f87171" }} />
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fafafa", marginBottom: "8px" }}>Cancel Subscription?</h3>
            <p style={{ fontSize: "13px", color: "#71717a", lineHeight: 1.6, marginBottom: "24px" }}>
              You&apos;ll lose access to Pro features at the end of your current billing period (Jul 1, 2026). Your data will be preserved.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setShowCancelModal(false)}
                style={{ flex: 1, padding: "9px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "#a1a1aa", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
              >
                Keep Plan
              </button>
              <button
                onClick={handleCancelConfirm}
                style={{ flex: 1, padding: "9px", borderRadius: "8px", backgroundColor: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
