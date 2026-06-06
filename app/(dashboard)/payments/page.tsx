"use client"

import { useState, useEffect, useCallback } from "react"
import {
  DollarSign, Clock, Calendar, Users, TrendingUp,
  Download, Search, ChevronDown, CheckCircle2,
  XCircle, AlertCircle, Plus, Trash2, Edit2,
  Filter, Send, MoreHorizontal,
} from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatNumber } from "@/lib/platform"
import { InviteCreatorDrawer } from "@/components/payments/invite-creator-drawer"
import { ProcessPayoutModal } from "@/components/payments/process-payout-modal"
import { CreateRuleDrawer } from "@/components/payments/create-rule-drawer"
import { toast, Toaster } from "sonner"
import {
  fetchCreators,
  fetchPayouts,
  fetchPayoutRules,
  updatePayoutStatus,
  approveAllPendingPayouts,
  deletePayoutRule,
} from "@/lib/payments-data"
import { useUser } from "@/lib/use-user"
import type {
  Creator, Payout, PayoutRule,
  PaymentMethod, KycStatus, PayoutStatusType,
} from "@/types"

// ── Config maps ───────────────────────────────────────────────
const PAYOUT_STATUS_CFG: Record<PayoutStatusType, { label: string; className: string }> = {
  pending:    { label: "Pending",    className: "bg-amber-500/10 text-amber-400 border-amber-500/20"    },
  approved:   { label: "Approved",   className: "bg-blue-500/10 text-blue-400 border-blue-500/20"       },
  processing: { label: "Processing", className: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  paid:       { label: "Paid",       className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  on_hold:    { label: "On Hold",    className: "bg-red-500/10 text-red-400 border-red-500/20"          },
  failed:     { label: "Failed",     className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"       },
}

const KYC_CFG: Record<KycStatus, { label: string; className: string; icon: React.ElementType }> = {
  verified:    { label: "Verified",    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: CheckCircle2 },
  pending:     { label: "Pending",     className: "bg-amber-500/10 text-amber-400 border-amber-500/20",       icon: Clock       },
  not_started: { label: "Not Started", className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",          icon: AlertCircle },
  rejected:    { label: "Rejected",    className: "bg-red-500/10 text-red-400 border-red-500/20",              icon: XCircle    },
}

const METHOD_CFG: Record<PaymentMethod, { label: string; className: string }> = {
  paypal: { label: "PayPal", className: "bg-blue-500/10 text-blue-400"     },
  bank:   { label: "Bank",   className: "bg-zinc-500/10 text-zinc-400"     },
  wise:   { label: "Wise",   className: "bg-green-500/10 text-green-400"   },
  crypto: { label: "Crypto", className: "bg-orange-500/10 text-orange-400" },
  check:  { label: "Check",  className: "bg-purple-500/10 text-purple-400" },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

// ── Shared table components ───────────────────────────────────
function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th className={`px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider ${right ? "text-right" : "text-left"}`}>
      {children}
    </th>
  )
}

interface ChartTooltipProps { active?: boolean; payload?: Array<{ value: number }>; label?: string }
function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (active && payload?.length) {
    return (
      <div className="bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-[11px] text-zinc-500 mb-1">{label}</p>
        <p className="text-sm font-semibold text-purple-400">${Number(payload[0]?.value).toLocaleString()}</p>
      </div>
    )
  }
  return null
}

// ── Tab definitions ───────────────────────────────────────────
const TABS = ["Overview", "Payout Queue", "History", "Creators", "Rules"] as const
type Tab = typeof TABS[number]

// ── Main component ────────────────────────────────────────────
export default function PaymentsPage() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState<Tab>("Overview")
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [rules, setRules] = useState<PayoutRule[]>([])
  const [creators, setCreators] = useState<Creator[]>([])
  const [historySearch, setHistorySearch] = useState("")
  const [showInviteDrawer, setShowInviteDrawer] = useState(false)
  const [showProcessModal, setShowProcessModal] = useState(false)
  const [showRuleDrawer, setShowRuleDrawer] = useState(false)
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null)

  const load = useCallback(async (userId?: string) => {
    try {
      const [p, r, c] = await Promise.all([
        fetchPayouts(undefined, userId),
        fetchPayoutRules(userId),
        fetchCreators(userId),
      ])
      setPayouts(p)
      setRules(r)
      setCreators(c)
    } catch { /* tables may not exist yet; stay empty */ }
  }, [])

  useEffect(() => { load(user?.id) }, [load, user?.id])

  const pendingPayouts = payouts.filter(p => p.status === "pending" || p.status === "approved")
  const historyPayouts = payouts.filter(p => p.status === "paid" || p.status === "failed")
  const filteredHistory = historyPayouts.filter(p =>
    !historySearch || p.creator?.name.toLowerCase().includes(historySearch.toLowerCase()) ||
    p.campaign?.name.toLowerCase().includes(historySearch.toLowerCase())
  )

  const stats = {
    totalPaid:     payouts.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0),
    pendingCount:  pendingPayouts.length,
    thisMonth:     payouts.filter(p => {
      const d = new Date(p.created_at); const now = new Date()
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).reduce((s, p) => s + p.amount, 0),
    creatorsBalance: creators.filter(c => c.total_earned > c.total_paid).length,
  }

  // Build last-6-months chart from real paid payouts
  const monthlyData = (() => {
    const now = new Date()
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      return {
        month: d.toLocaleDateString("en-US", { month: "short" }),
        year:  d.getFullYear(),
        mIdx:  d.getMonth(),
        amount: 0,
      }
    })
    for (const p of payouts.filter(x => x.status === "paid" && x.paid_at)) {
      const d = new Date(p.paid_at!)
      const bucket = months.find(m => m.mIdx === d.getMonth() && m.year === d.getFullYear())
      if (bucket) bucket.amount += p.amount
    }
    return months
  })()

  function handlePayNow(payout: Payout) {
    setSelectedPayout(payout)
    setShowProcessModal(true)
  }

  async function handleHold(id: string) {
    try {
      await updatePayoutStatus(id, "on_hold")
      setPayouts(prev => prev.map(p => p.id === id ? { ...p, status: "on_hold" } : p))
      toast.success("Payout placed on hold")
    } catch {
      toast.error("Failed to place payout on hold")
    }
  }

  async function handleApproveAll() {
    if (!user?.id) return
    try {
      await approveAllPendingPayouts(user.id)
      setPayouts(prev => prev.map(p =>
        p.status === "pending" ? { ...p, status: "approved" } : p
      ))
      toast.success("All pending payouts approved")
    } catch {
      toast.error("Failed to approve payouts")
    }
  }

  async function handleDeleteRule(id: string) {
    try {
      await deletePayoutRule(id)
      setRules(prev => prev.filter(r => r.id !== id))
      toast.success("Rule deleted")
    } catch {
      toast.error("Failed to delete rule")
    }
  }

  function handleExportCsv() {
    const rows = filteredHistory.length > 0 ? filteredHistory : payouts
    if (rows.length === 0) {
      toast.info("No payment data to export")
      return
    }
    const headers = ["Date", "Creator", "Email", "Campaign", "Amount", "Method", "Status", "Invoice"]
    const csvRows = [
      headers.join(","),
      ...rows.map(p => [
        formatDate(p.paid_at ?? p.created_at),
        `"${(p.creator?.name ?? "").replace(/"/g, '""')}"`,
        `"${(p.creator?.email ?? "").replace(/"/g, '""')}"`,
        `"${(p.campaign?.name ?? "").replace(/"/g, '""')}"`,
        p.amount.toString(),
        p.payment_method,
        p.status,
        `"${(p.invoice_number ?? "").replace(/"/g, '""')}"`,
      ].join(",")),
    ]
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `trackhive-payments-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success("CSV exported")
  }

  return (
    <>
    <Toaster position="top-right" toastOptions={{ style: { backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", color: "#fafafa" } }} />
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-white tracking-tight">Payments</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Manage creator payouts, invoices, and payout rules.</p>
        </div>
        <button
          onClick={() => setShowInviteDrawer(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Invite Creator
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-white/[0.03] border border-white/[0.06] rounded-lg p-1 w-fit overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab ? "bg-[#1a1a1a] text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab}
            {tab === "Payout Queue" && pendingPayouts.length > 0 && (
              <span className="ml-1.5 text-[11px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                {pendingPayouts.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ──────────────────────────────────────────── */}
      {activeTab === "Overview" && (
        <div className="space-y-4">
          {/* Stat cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            {[
              { label: "Total Paid Out",         value: `$${formatNumber(stats.totalPaid)}`,   icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10" },
              { label: "Pending Approvals",       value: stats.pendingCount,                    icon: Clock,      color: "text-amber-400",   bg: "bg-amber-500/10"   },
              { label: "This Month",              value: `$${formatNumber(stats.thisMonth)}`,   icon: Calendar,   color: "text-blue-400",    bg: "bg-blue-500/10"    },
              { label: "Creators with Balance",   value: stats.creatorsBalance,                 icon: Users,      color: "text-purple-400",  bg: "bg-purple-500/10"  },
            ].map(s => {
              const Icon = s.icon
              return (
                <div key={s.label} className="rounded-xl border border-white/[0.06] bg-[#111111] px-4 py-3.5 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                  <div>
                    <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider">{s.label}</p>
                    <p className="text-lg font-bold text-white leading-tight">{s.value}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Chart */}
          <div className="rounded-xl border border-white/[0.06] bg-[#111111] p-5">
            <div className="mb-5">
              <h2 className="text-[15px] font-semibold text-white">Monthly Payout Volume</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Last 6 months</p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#52525b", fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "#52525b", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="amount" fill="#7C3AED" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent payouts table */}
          <div className="rounded-xl border border-white/[0.06] bg-[#111111] overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06]">
              <h2 className="text-[15px] font-semibold text-white">Recent Payouts</h2>
            </div>
            <table className="w-full">
              <thead><tr className="border-b border-white/[0.04]">
                <Th>Creator</Th><Th>Campaign</Th><Th right>Amount</Th><Th>Method</Th><Th>Date</Th><Th>Status</Th>
              </tr></thead>
              <tbody className="divide-y divide-white/[0.03]">
                {payouts.slice(0, 6).map(p => {
                  const sc = PAYOUT_STATUS_CFG[p.status]
                  return (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="w-7 h-7"><AvatarImage src={p.creator?.avatar_url ?? ""} /><AvatarFallback className="bg-purple-600/20 text-purple-400 text-xs">{p.creator?.name.slice(0,2).toUpperCase()}</AvatarFallback></Avatar>
                          <span className="text-sm font-medium text-zinc-200">{p.creator?.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5"><span className="text-sm text-zinc-400">{p.campaign?.name ?? "—"}</span></td>
                      <td className="px-4 py-3.5 text-right"><span className="text-sm font-semibold text-emerald-400">${p.amount.toLocaleString()}</span></td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${METHOD_CFG[p.payment_method].className}`}>
                          {METHOD_CFG[p.payment_method].label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5"><span className="text-xs text-zinc-500">{formatDate(p.created_at)}</span></td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${sc.className}`}>{sc.label}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── PAYOUT QUEUE TAB ─────────────────────────────────────── */}
      {activeTab === "Payout Queue" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                <select className="pl-8 pr-8 py-2 rounded-lg bg-[#111111] border border-white/[0.06] text-sm text-zinc-300 outline-none cursor-pointer appearance-none">
                  <option className="bg-[#1a1a1a]">All Campaigns</option>
                  <option className="bg-[#1a1a1a]">Summer Drop 2024</option>
                  <option className="bg-[#1a1a1a]">GadgetHive Q2</option>
                  <option className="bg-[#1a1a1a]">Creator Life Series</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
              </div>
              <span className="text-sm text-zinc-500">{pendingPayouts.length} pending</span>
            </div>
            <button onClick={handleApproveAll} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-sm font-medium transition-all border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Approve All
            </button>
          </div>

          {pendingPayouts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-white/[0.06] bg-[#111111]">
              <DollarSign className="w-8 h-8 text-zinc-600 mb-3" />
              <p className="text-sm font-medium text-zinc-400">No pending payouts</p>
              <p className="text-xs text-zinc-600 mt-1">All payouts have been processed.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-white/[0.06] bg-[#111111] overflow-hidden">
              <table className="w-full">
                <thead><tr className="border-b border-white/[0.04]">
                  <Th>Creator</Th><Th>Campaign</Th><Th right>Views</Th><Th right>Amount</Th><Th>Method</Th><Th>Status</Th><Th>Action</Th>
                </tr></thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {pendingPayouts.map(p => {
                    const sc = PAYOUT_STATUS_CFG[p.status]
                    return (
                      <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <Avatar className="w-8 h-8"><AvatarImage src={p.creator?.avatar_url ?? ""} /><AvatarFallback className="bg-purple-600/20 text-purple-400 text-xs font-bold">{p.creator?.name.slice(0,2).toUpperCase()}</AvatarFallback></Avatar>
                            <div>
                              <p className="text-sm font-medium text-zinc-200">{p.creator?.name}</p>
                              <p className="text-[11px] text-zinc-500">{p.creator?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5"><span className="text-sm text-zinc-400">{p.campaign?.name ?? "—"}</span></td>
                        <td className="px-4 py-3.5 text-right"><span className="text-sm text-zinc-300">{formatNumber(p.views_count)}</span></td>
                        <td className="px-4 py-3.5 text-right"><span className="text-sm font-bold text-emerald-400">${p.amount.toLocaleString()}</span></td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${METHOD_CFG[p.payment_method].className}`}>
                            {METHOD_CFG[p.payment_method].label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${sc.className}`}>{sc.label}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => handlePayNow(p)} className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-all">Pay Now</button>
                            <button onClick={() => handleHold(p.id)} className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.09] text-zinc-400 hover:text-zinc-200 text-xs font-medium transition-all">Hold</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t border-white/[0.06] bg-white/[0.02]">
                    <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-zinc-400">Total Pending</td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-emerald-400">
                      ${pendingPayouts.reduce((s, p) => s + p.amount, 0).toLocaleString()}
                    </td>
                    <td colSpan={3} />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── HISTORY TAB ───────────────────────────────────────────── */}
      {activeTab === "History" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
              <input
                value={historySearch}
                onChange={e => setHistorySearch(e.target.value)}
                placeholder="Search creator or campaign..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#111111] border border-white/[0.06] text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-purple-500/40 transition-colors"
              />
            </div>
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-zinc-400 hover:text-zinc-200 text-sm font-medium transition-all"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-[#111111] overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b border-white/[0.04]">
                <Th>Date</Th><Th>Creator</Th><Th>Campaign</Th><Th right>Amount</Th><Th>Method</Th><Th>Status</Th><Th>Invoice</Th>
              </tr></thead>
              <tbody className="divide-y divide-white/[0.03]">
                {filteredHistory.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-zinc-600">No payment history found.</td></tr>
                ) : filteredHistory.map(p => {
                  const sc = PAYOUT_STATUS_CFG[p.status]
                  return (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3.5"><span className="text-xs text-zinc-500">{formatDate(p.paid_at ?? p.created_at)}</span></td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6"><AvatarImage src={p.creator?.avatar_url ?? ""} /><AvatarFallback className="text-[9px] bg-purple-600/20 text-purple-400">{p.creator?.name.slice(0,2).toUpperCase()}</AvatarFallback></Avatar>
                          <span className="text-sm text-zinc-300">{p.creator?.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5"><span className="text-sm text-zinc-400">{p.campaign?.name ?? "—"}</span></td>
                      <td className="px-4 py-3.5 text-right"><span className="text-sm font-semibold text-emerald-400">${p.amount.toLocaleString()}</span></td>
                      <td className="px-4 py-3.5"><span className={`px-2 py-0.5 rounded text-[11px] font-medium ${METHOD_CFG[p.payment_method].className}`}>{METHOD_CFG[p.payment_method].label}</span></td>
                      <td className="px-4 py-3.5"><span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${sc.className}`}>{sc.label}</span></td>
                      <td className="px-4 py-3.5">
                        {p.invoice_url ? (
                          <a href={p.invoice_url} className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors">
                            <Download className="w-3 h-3" />
                            {p.invoice_number}
                          </a>
                        ) : (
                          <span className="text-xs text-zinc-600">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── CREATORS TAB ─────────────────────────────────────────── */}
      {activeTab === "Creators" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500">{creators.length} creators</p>
            <button onClick={() => setShowInviteDrawer(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 text-sm font-medium transition-all border border-purple-500/20">
              <Plus className="w-3.5 h-3.5" />
              Invite Creator
            </button>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-[#111111] overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b border-white/[0.04]">
                <Th>Creator</Th><Th>Payment Method</Th><Th right>Total Earned</Th><Th right>Outstanding</Th><Th>KYC</Th><Th>Actions</Th>
              </tr></thead>
              <tbody className="divide-y divide-white/[0.03]">
                {creators.map(c => {
                  const kyc = KYC_CFG[c.kyc_status]
                  const KycIcon = kyc.icon
                  const outstanding = c.total_earned - c.total_paid
                  return (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8"><AvatarImage src={c.avatar_url ?? ""} /><AvatarFallback className="bg-purple-600/20 text-purple-400 text-xs font-bold">{c.name.slice(0,2).toUpperCase()}</AvatarFallback></Avatar>
                          <div>
                            <p className="text-sm font-medium text-zinc-200">{c.name}</p>
                            <p className="text-[11px] text-zinc-500">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${METHOD_CFG[c.payment_method].className}`}>
                          {METHOD_CFG[c.payment_method].label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right"><span className="text-sm font-semibold text-zinc-200">${c.total_earned.toLocaleString()}</span></td>
                      <td className="px-4 py-3.5 text-right">
                        <span className={`text-sm font-semibold ${outstanding > 0 ? "text-amber-400" : "text-zinc-500"}`}>
                          {outstanding > 0 ? `$${outstanding.toLocaleString()}` : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`flex items-center gap-1 w-fit px-2 py-0.5 rounded-full text-[11px] font-medium border ${kyc.className}`}>
                          <KycIcon className="w-3 h-3" />
                          {kyc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors" title="Edit">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {!c.invite_accepted && (
                            <button
                              onClick={() => toast.success("Invite resent", { description: "Email delivery is launching soon." })}
                              className="p-1.5 rounded-md text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                              title="Resend Invite"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => toast.info("Coming soon", { description: "More creator actions are launching soon." })}
                            className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors"
                            title="More"
                          >
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── RULES TAB ────────────────────────────────────────────── */}
      {activeTab === "Rules" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500">{rules.length} rule template{rules.length !== 1 ? "s" : ""}</p>
            <button onClick={() => setShowRuleDrawer(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 text-sm font-medium transition-all border border-purple-500/20">
              <Plus className="w-3.5 h-3.5" />
              Create Rule
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {rules.map(rule => (
              <div key={rule.id} className="rounded-xl border border-white/[0.06] bg-[#111111] p-5 hover:border-white/10 transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-[15px] font-semibold text-white">{rule.name}</h3>
                      {rule.is_default && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-600/20 text-purple-400 border border-purple-500/20">Default</span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">{rule.payout_window_days}d window</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDeleteRule(rule.id)} className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { label: "Base Fee",   value: rule.base_fee > 0 ? `$${rule.base_fee}/video` : "—" },
                    { label: "CPM Rate",   value: rule.cpm_rate > 0 ? `$${rule.cpm_rate}/1K` : "—" },
                    { label: "Milestone",  value: rule.milestone_bonus > 0 ? `$${rule.milestone_bonus}` : "—" },
                    { label: "Cap",        value: rule.performance_cap > 0 ? `$${rule.performance_cap}` : "—" },
                  ].map(f => (
                    <div key={f.label}>
                      <p className="text-[10px] text-zinc-600 uppercase tracking-wider">{f.label}</p>
                      <p className="text-sm font-medium text-zinc-300 mt-0.5">{f.value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-white/[0.04]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Est. per 100K views, 5 videos</span>
                    <span className="font-semibold text-purple-400">
                      ${(rule.base_fee * 5 + (100000 / 1000) * rule.cpm_rate).toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drawers / Modals */}
      <InviteCreatorDrawer
        open={showInviteDrawer}
        onClose={() => setShowInviteDrawer(false)}
        rules={rules}
      />
      <ProcessPayoutModal
        open={showProcessModal}
        payout={selectedPayout}
        onClose={() => { setShowProcessModal(false); setSelectedPayout(null) }}
        onSuccess={(id: string) => {
          setPayouts(prev => prev.map(p => p.id === id ? { ...p, status: "paid", paid_at: new Date().toISOString() } : p))
          setShowProcessModal(false)
          setSelectedPayout(null)
        }}
      />
      <CreateRuleDrawer
        open={showRuleDrawer}
        onClose={() => setShowRuleDrawer(false)}
        onSave={(rule: PayoutRule) => setRules(prev => [rule, ...prev])}
      />
    </div>
    </>
  )
}
