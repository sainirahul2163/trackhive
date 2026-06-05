"use client"

import { useState } from "react"
import {
  X, DollarSign, Clock, CheckCircle2, AlertCircle,
  CreditCard, Wallet, Building2, ChevronDown, ArrowUpRight,
  Download, Info,
} from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts"

// ── Types ──────────────────────────────────────────────────────
type PayoutStatus = "paid" | "pending" | "processing" | "failed"

interface Payout {
  id: string
  campaign: string
  brand: string
  amount: number
  status: PayoutStatus
  date: string
  method: string
  ref: string
}

interface PaymentMethod {
  id: string
  type: "bank" | "paypal" | "card"
  label: string
  last4: string
  isPrimary: boolean
}

const MONTHLY: { month: string; earnings: number }[] = []
const PAYOUTS: Payout[] = []
const PAYMENT_METHODS: PaymentMethod[] = []

const STATUS_CFG: Record<PayoutStatus, { label: string; color: string; bg: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }> = {
  paid:       { label: "Paid",       color: "#34d399", bg: "rgba(52,211,153,0.1)",  icon: CheckCircle2 },
  pending:    { label: "Pending",    color: "#fbbf24", bg: "rgba(251,191,36,0.1)",  icon: Clock },
  processing: { label: "Processing", color: "#60a5fa", bg: "rgba(96,165,250,0.1)",  icon: ArrowUpRight },
  failed:     { label: "Failed",     color: "#f87171", bg: "rgba(248,113,113,0.1)", icon: AlertCircle },
}

function fmt(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 0 })
}

interface BarTTProps { active?: boolean; payload?: Array<{ value: number }>; label?: string }
function BarTT({ active, payload, label }: BarTTProps) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "8px 12px" }}>
      <p style={{ fontSize: "12px", color: "#71717a", marginBottom: "2px" }}>{label}</p>
      <p style={{ fontSize: "14px", fontWeight: 800, color: "#34d399" }}>${fmt(payload[0].value)}</p>
    </div>
  )
}

interface PayMethodDrawerProps {
  methods: PaymentMethod[]
  onClose: () => void
}
function PayMethodDrawer({ methods, onClose }: PayMethodDrawerProps) {
  const [editMethods, setEditMethods] = useState(methods)

  function setPrimary(id: string) {
    setEditMethods(m => m.map(pm => ({ ...pm, isPrimary: pm.id === id })))
  }

  const TypeIcon = (type: PaymentMethod["type"]) => {
    if (type === "bank")   return Building2
    if (type === "paypal") return Wallet
    return CreditCard
  }

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 40 }} />
      <div style={{ position: "fixed", right: 0, top: 0, bottom: 0, width: "min(400px,100vw)", backgroundColor: "#111111", borderLeft: "1px solid rgba(255,255,255,0.08)", zIndex: 50, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px 22px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: "15px", fontWeight: 800, color: "#fafafa" }}>Payment Methods</p>
            <p style={{ fontSize: "12px", color: "#71717a", marginTop: "2px" }}>Manage where your payouts are sent</p>
          </div>
          <button onClick={onClose} style={{ padding: "6px", borderRadius: "8px", border: "none", backgroundColor: "rgba(255,255,255,0.06)", cursor: "pointer" }}>
            <X style={{ width: "14px", height: "14px", color: "#71717a" }} />
          </button>
        </div>

        <div style={{ padding: "20px 22px", flex: 1, display: "flex", flexDirection: "column", gap: "14px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.07em" }}>Saved methods</p>
          {editMethods.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", backgroundColor: "rgba(255,255,255,0.02)" }}>
              <CreditCard style={{ width: "24px", height: "24px", color: "#52525b", margin: "0 auto 10px" }} />
              <p style={{ fontSize: "13px", fontWeight: 600, color: "#a1a1aa", marginBottom: "4px" }}>No payment methods</p>
              <p style={{ fontSize: "11px", color: "#52525b" }}>Add a method to receive campaign payouts.</p>
            </div>
          ) : editMethods.map(pm => {
            const Icon = TypeIcon(pm.type)
            return (
              <div key={pm.id} style={{ borderRadius: "12px", border: pm.isPrimary ? "1px solid rgba(124,58,237,0.3)" : "1px solid rgba(255,255,255,0.07)", backgroundColor: pm.isPrimary ? "rgba(124,58,237,0.04)" : "#0d0d0d", padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "10px", backgroundColor: pm.isPrimary ? "rgba(124,58,237,0.12)" : "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon style={{ width: "16px", height: "16px", color: pm.isPrimary ? "#a78bfa" : "#71717a" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "#fafafa" }}>{pm.label}</p>
                  <p style={{ fontSize: "11px", color: "#71717a", marginTop: "1px" }}>••• {pm.last4}</p>
                </div>
                {pm.isPrimary
                  ? <span style={{ padding: "2px 8px", borderRadius: "4px", backgroundColor: "rgba(124,58,237,0.12)", fontSize: "10px", fontWeight: 700, color: "#a78bfa" }}>Primary</span>
                  : <button onClick={() => setPrimary(pm.id)} style={{ padding: "5px 10px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "transparent", color: "#71717a", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}>
                      Set primary
                    </button>
                }
              </div>
            )
          })}

          <button style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "11px", borderRadius: "10px", border: "1px dashed rgba(255,255,255,0.1)", backgroundColor: "transparent", color: "#71717a", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
            + Add payment method
          </button>

          <div style={{ padding: "12px 14px", borderRadius: "10px", border: "1px solid rgba(251,191,36,0.15)", backgroundColor: "rgba(251,191,36,0.04)", display: "flex", gap: "8px" }}>
            <Info style={{ width: "13px", height: "13px", color: "#fbbf24", flexShrink: 0, marginTop: "1px" }} />
            <p style={{ fontSize: "11px", color: "#a1a1aa", lineHeight: 1.6 }}>Payouts are processed within 5–7 business days after a campaign closes. Bank transfers may take an additional 1–2 days.</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default function CreatorEarningsPage() {
  const [statusFilter, setStatusFilter] = useState<PayoutStatus | "all">("all")
  const [showPayMethod, setShowPayMethod] = useState(false)

  const totalEarned  = PAYOUTS.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0)
  const pending      = PAYOUTS.filter(p => p.status === "pending").reduce((s, p) => s + p.amount, 0)
  const thisMonth    = 0
  const allTimeTotal = MONTHLY.reduce((s, m) => s + m.earnings, 0)

  const filtered = statusFilter === "all" ? PAYOUTS : PAYOUTS.filter(p => p.status === statusFilter)

  const STATUS_TABS: { id: PayoutStatus | "all"; label: string }[] = [
    { id: "all",       label: "All" },
    { id: "paid",      label: "Paid" },
    { id: "pending",   label: "Pending" },
    { id: "processing",label: "Processing" },
  ]

  const maxEarnings = MONTHLY.length > 0 ? Math.max(...MONTHLY.map(m => m.earnings)) : 0

  return (
    <div style={{ maxWidth: "900px", display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#fafafa" }}>Earnings</h1>
          <p style={{ fontSize: "13px", color: "#71717a", marginTop: "3px" }}>Track payouts and manage payment methods</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => setShowPayMethod(true)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 14px", borderRadius: "9px", border: "1px solid rgba(255,255,255,0.09)", backgroundColor: "#111111", color: "#e4e4e7", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
            <CreditCard style={{ width: "13px", height: "13px" }} />
            Payment Methods
          </button>
          <button style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 14px", borderRadius: "9px", backgroundColor: "#7C3AED", color: "white", fontSize: "12px", fontWeight: 600, border: "none", cursor: "pointer" }}>
            <Download style={{ width: "13px", height: "13px" }} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: "10px" }}>
        {[
          { label: "All-time earned", value: `$${fmt(allTimeTotal)}`, color: "#34d399",  icon: DollarSign },
          { label: "This month",      value: `$${fmt(thisMonth)}`,    color: "#a78bfa",  icon: ArrowUpRight },
          { label: "Pending payout",  value: `$${fmt(pending)}`,      color: "#fbbf24",  icon: Clock },
          { label: "Paid out",        value: `$${fmt(totalEarned)}`,  color: "#60a5fa",  icon: CheckCircle2 },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} style={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", backgroundColor: "#111111", padding: "14px 16px", display: "flex", alignItems: "center", gap: "10px" }}>
              <Icon style={{ width: "15px", height: "15px", color: s.color, flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: "17px", fontWeight: 800, color: "#fafafa", lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: "10px", color: "#52525b", marginTop: "3px" }}>{s.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Monthly chart */}
      <div style={{ borderRadius: "14px", border: "1px solid rgba(255,255,255,0.07)", backgroundColor: "#111111", padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "#fafafa" }}>Monthly Earnings</p>
            <p style={{ fontSize: "11px", color: "#52525b", marginTop: "2px" }}>
              {MONTHLY.length > 0 ? "Earnings overview" : "No earnings data yet"}
            </p>
          </div>
        </div>
        {MONTHLY.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 24px" }}>
            <DollarSign style={{ width: "28px", height: "28px", color: "#52525b", margin: "0 auto 12px" }} />
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#a1a1aa", marginBottom: "4px" }}>No earnings yet</p>
            <p style={{ fontSize: "12px", color: "#52525b" }}>Complete campaigns to start earning payouts.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={MONTHLY} barSize={28} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#52525b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#52525b" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip content={<BarTT />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="earnings" radius={[5, 5, 0, 0]}>
                {MONTHLY.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.earnings === maxEarnings ? "#7C3AED" : "rgba(124,58,237,0.3)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Payout table */}
      <div style={{ borderRadius: "14px", border: "1px solid rgba(255,255,255,0.07)", backgroundColor: "#111111", overflow: "hidden" }}>
        {/* Table header */}
        <div style={{ padding: "16px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
          <p style={{ fontSize: "14px", fontWeight: 700, color: "#fafafa" }}>Payout History</p>
          <div style={{ display: "flex", gap: "4px", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "2px" }}>
            {STATUS_TABS.map(t => (
              <button key={t.id} onClick={() => setStatusFilter(t.id)}
                style={{ padding: "5px 10px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "11px", fontWeight: 600, backgroundColor: statusFilter === t.id ? "#1a1a1a" : "transparent", color: statusFilter === t.id ? "#fafafa" : "#71717a" }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <Clock style={{ width: "24px", height: "24px", color: "#52525b", margin: "0 auto 10px" }} />
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#a1a1aa", marginBottom: "4px" }}>
              {PAYOUTS.length === 0 ? "No payouts yet" : "No payouts match this filter"}
            </p>
            <p style={{ fontSize: "12px", color: "#52525b" }}>
              {PAYOUTS.length === 0 ? "Payouts from completed campaigns will appear here." : "Try a different status filter."}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  {["Campaign", "Brand", "Amount", "Status", "Date", "Method", "Ref"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "10px", fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => {
                  const st = STATUS_CFG[p.status]
                  const StIcon = st.icon
                  return (
                    <tr key={p.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                      <td style={{ padding: "12px 16px", fontSize: "13px", color: "#e4e4e7", fontWeight: 600, whiteSpace: "nowrap" }}>{p.campaign}</td>
                      <td style={{ padding: "12px 16px", fontSize: "12px", color: "#71717a", whiteSpace: "nowrap" }}>{p.brand}</td>
                      <td style={{ padding: "12px 16px", fontSize: "14px", fontWeight: 800, color: p.amount > 0 ? "#34d399" : "#52525b", whiteSpace: "nowrap" }}>
                        {p.amount > 0 ? `$${fmt(p.amount)}` : "—"}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 8px", borderRadius: "5px", backgroundColor: st.bg, fontSize: "10px", fontWeight: 700, color: st.color, whiteSpace: "nowrap" }}>
                          <StIcon style={{ width: "9px", height: "9px" }} />
                          {st.label}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: "11px", color: "#71717a", whiteSpace: "nowrap" }}>
                        {new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: "11px", color: "#71717a", whiteSpace: "nowrap" }}>{p.method}</td>
                      <td style={{ padding: "12px 16px", fontSize: "10px", color: "#3f3f46", fontFamily: "monospace", whiteSpace: "nowrap" }}>{p.ref}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tax documents */}
      <div style={{ borderRadius: "14px", border: "1px solid rgba(255,255,255,0.07)", backgroundColor: "#111111", padding: "18px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "#fafafa" }}>Tax Documents</p>
            <p style={{ fontSize: "11px", color: "#71717a", marginTop: "2px" }}>Annual 1099 forms and payment summaries</p>
          </div>
          <ChevronDown style={{ width: "14px", height: "14px", color: "#52525b" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {[
            { label: "1099-NEC 2025 (YTD)", ready: false },
            { label: "1099-NEC 2024",       ready: true  },
          ].map(doc => (
            <div key={doc.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", backgroundColor: "rgba(255,255,255,0.02)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Download style={{ width: "13px", height: "13px", color: "#52525b" }} />
                <span style={{ fontSize: "12px", color: "#e4e4e7" }}>{doc.label}</span>
              </div>
              {doc.ready
                ? <button style={{ padding: "5px 10px", borderRadius: "6px", border: "1px solid rgba(124,58,237,0.3)", backgroundColor: "rgba(124,58,237,0.06)", color: "#a78bfa", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}>Download PDF</button>
                : <span style={{ fontSize: "11px", color: "#52525b" }}>Available Jan 2026</span>
              }
            </div>
          ))}
        </div>
      </div>

      {showPayMethod && <PayMethodDrawer methods={PAYMENT_METHODS} onClose={() => setShowPayMethod(false)} />}
    </div>
  )
}
