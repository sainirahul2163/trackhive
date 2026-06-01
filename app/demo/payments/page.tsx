"use client"

import { useState } from "react"
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
import { SignupGateModal } from "@/components/demo/signup-gate-modal"

// ── Inline types ──────────────────────────────────────────────
interface MockCreator {
  id: string
  name: string
  email: string
  avatar_url: string | null
  payment_method: "paypal" | "bank" | "wise" | "crypto" | "check"
  kyc_status: "verified" | "pending" | "not_started" | "rejected"
  total_earned: number
  total_paid: number
  invite_accepted: boolean
}
interface MockPayout {
  id: string
  creator_id: string
  campaign_name: string
  amount: number
  status: "pending" | "approved" | "processing" | "paid" | "on_hold" | "failed"
  payment_method: "paypal" | "bank" | "wise" | "crypto" | "check"
  views: number
  videos: number
  date: string
  paid_at: string | null
  invoice_number: string | null
}
interface MockRule {
  id: string
  name: string
  is_default: boolean
  base_fee: number
  cpm_rate: number
  milestone_bonus: number
  milestone_views: number
  performance_cap: number
  payout_window_days: number
}

// ── Mock data ─────────────────────────────────────────────────
const MOCK_CREATORS: MockCreator[] = [
  { id: "c1", name: "Jake Fitness",  email: "jake@jakefit.com",    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=jake",  payment_method: "paypal", kyc_status: "verified",    total_earned: 24800, total_paid: 21000, invite_accepted: true  },
  { id: "c2", name: "Glow Up Daily", email: "hello@glowup.co",     avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=glow",  payment_method: "bank",   kyc_status: "verified",    total_earned: 12400, total_paid: 10500, invite_accepted: true  },
  { id: "c3", name: "Tech Reviewer", email: "contact@techrev.io",  avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=tech",  payment_method: "wise",   kyc_status: "pending",     total_earned: 8600,  total_paid: 7200,  invite_accepted: true  },
  { id: "c4", name: "Free Life NYC", email: "mel@freelifenyc.com", avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=free",  payment_method: "paypal", kyc_status: "verified",    total_earned: 6200,  total_paid: 5800,  invite_accepted: true  },
  { id: "c5", name: "Money Moves",   email: "info@moneymoves.co",  avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=money", payment_method: "bank",   kyc_status: "not_started", total_earned: 3100,  total_paid: 0,     invite_accepted: false },
]

const INIT_PAYOUTS: MockPayout[] = [
  { id: "p1", creator_id: "c1", campaign_name: "Summer Drop 2024",     amount: 7100,  status: "pending",  payment_method: "paypal", views: 1400000, videos: 4, date: new Date(Date.now()-86400000).toISOString(),   paid_at: null, invoice_number: null    },
  { id: "p2", creator_id: "c2", campaign_name: "Summer Drop 2024",     amount: 4740,  status: "approved", payment_method: "bank",   views: 920000,  videos: 3, date: new Date(Date.now()-172800000).toISOString(), paid_at: null, invoice_number: null    },
  { id: "p3", creator_id: "c3", campaign_name: "GadgetHive Q2",        amount: 2540,  status: "on_hold",  payment_method: "wise",   views: 520000,  videos: 1, date: new Date(Date.now()-259200000).toISOString(), paid_at: null, invoice_number: null    },
  { id: "p4", creator_id: "c1", campaign_name: "Glow Summer Campaign", amount: 12500, status: "paid",     payment_method: "paypal", views: 4200000, videos: 8, date: new Date(Date.now()-864000000).toISOString(), paid_at: new Date(Date.now()-604800000).toISOString(), invoice_number: "INV-001" },
  { id: "p5", creator_id: "c2", campaign_name: "Glow Summer Campaign", amount: 8900,  status: "paid",     payment_method: "bank",   views: 2800000, videos: 6, date: new Date(Date.now()-777600000).toISOString(), paid_at: new Date(Date.now()-518400000).toISOString(), invoice_number: "INV-002" },
  { id: "p6", creator_id: "c4", campaign_name: "Creator Life Series",  amount: 2420,  status: "pending",  payment_method: "paypal", views: 400000,  videos: 4, date: new Date(Date.now()-3600000).toISOString(),   paid_at: null, invoice_number: null    },
]

const INIT_RULES: MockRule[] = [
  { id: "r1", name: "Standard Creator", is_default: true,  base_fee: 150, cpm_rate: 3.0, milestone_bonus: 0,    milestone_views: 0,       performance_cap: 1500, payout_window_days: 30 },
  { id: "r2", name: "Premium Creator",  is_default: false, base_fee: 300, cpm_rate: 5.5, milestone_bonus: 1000, milestone_views: 1000000, performance_cap: 5000, payout_window_days: 14 },
  { id: "r3", name: "Budget Campaign",  is_default: false, base_fee: 75,  cpm_rate: 1.5, milestone_bonus: 0,    milestone_views: 0,       performance_cap: 500,  payout_window_days: 30 },
]

const MONTHLY_DATA = [
  { month: "Jan", amount: 8200  }, { month: "Feb", amount: 11500 },
  { month: "Mar", amount: 9800  }, { month: "Apr", amount: 21400 },
  { month: "May", amount: 14700 }, { month: "Jun", amount: 16800 },
]

// ── Config maps ───────────────────────────────────────────────
const PAYOUT_STATUS_CFG: Record<MockPayout["status"], { label: string; className: string }> = {
  pending:    { label: "Pending",    className: "bg-amber-500/10 text-amber-400 border-amber-500/20"       },
  approved:   { label: "Approved",   className: "bg-blue-500/10 text-blue-400 border-blue-500/20"          },
  processing: { label: "Processing", className: "bg-purple-500/10 text-purple-400 border-purple-500/20"    },
  paid:       { label: "Paid",       className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  on_hold:    { label: "On Hold",    className: "bg-red-500/10 text-red-400 border-red-500/20"             },
  failed:     { label: "Failed",     className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"          },
}

const KYC_CFG: Record<MockCreator["kyc_status"], { label: string; className: string; icon: React.ElementType }> = {
  verified:    { label: "Verified",    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: CheckCircle2 },
  pending:     { label: "Pending",     className: "bg-amber-500/10 text-amber-400 border-amber-500/20",       icon: Clock        },
  not_started: { label: "Not Started", className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",          icon: AlertCircle  },
  rejected:    { label: "Rejected",    className: "bg-red-500/10 text-red-400 border-red-500/20",             icon: XCircle      },
}

const METHOD_CFG: Record<MockCreator["payment_method"], { label: string; className: string }> = {
  paypal: { label: "PayPal", className: "bg-blue-500/10 text-blue-400"     },
  bank:   { label: "Bank",   className: "bg-zinc-500/10 text-zinc-400"     },
  wise:   { label: "Wise",   className: "bg-green-500/10 text-green-400"   },
  crypto: { label: "Crypto", className: "bg-orange-500/10 text-orange-400" },
  check:  { label: "Check",  className: "bg-purple-500/10 text-purple-400" },
}

function getCreator(id: string) {
  return MOCK_CREATORS.find(c => c.id === id)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th className={`px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider ${right ? "text-right" : "text-left"}`}>
      {children}
    </th>
  )
}

interface ChartTTProps { active?: boolean; payload?: Array<{ value: number }>; label?: string }
function ChartTooltip({ active, payload, label }: ChartTTProps) {
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

const TABS = ["Overview", "Payout Queue", "History", "Creators", "Rules"] as const
type Tab = typeof TABS[number]

// ── Main component ────────────────────────────────────────────
export default function DemoPaymentsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Overview")
  const [payouts, setPayouts] = useState<MockPayout[]>(INIT_PAYOUTS)
  const [rules] = useState<MockRule[]>(INIT_RULES)
  const [historySearch, setHistorySearch] = useState("")
  const [gateOpen, setGateOpen] = useState(false)
  const [gateFeature, setGateFeature] = useState("this feature")

  function openGate(feature: string) {
    setGateFeature(feature)
    setGateOpen(true)
  }

  const pendingPayouts = payouts.filter(p => p.status === "pending" || p.status === "approved")
  const historyPayouts = payouts.filter(p => p.status === "paid" || p.status === "failed")
  const filteredHistory = historyPayouts.filter(p =>
    !historySearch ||
    (getCreator(p.creator_id)?.name ?? "").toLowerCase().includes(historySearch.toLowerCase()) ||
    p.campaign_name.toLowerCase().includes(historySearch.toLowerCase())
  )

  const stats = {
    totalPaid:       payouts.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0),
    pendingCount:    pendingPayouts.length,
    thisMonth:       payouts.filter(p => {
      const d = new Date(p.date); const now = new Date()
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).reduce((s, p) => s + p.amount, 0),
    creatorsBalance: MOCK_CREATORS.filter(c => c.total_earned > c.total_paid).length,
  }

  function handleApproveAll() {
    setPayouts(prev => prev.map(p => p.status === "pending" ? { ...p, status: "approved" as const } : p))
  }

  function handleHold(id: string) {
    setPayouts(prev => prev.map(p => p.id === id ? { ...p, status: "on_hold" as const } : p))
  }

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-white tracking-tight">Payments</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Manage creator payouts, invoices, and payout rules.</p>
        </div>
        <button
          onClick={() => openGate("creator invitations")}
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
              { label: "Total Paid Out",        value: `$${formatNumber(stats.totalPaid)}`,   icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10" },
              { label: "Pending Approvals",      value: stats.pendingCount,                    icon: Clock,      color: "text-amber-400",   bg: "bg-amber-500/10"   },
              { label: "This Month",             value: `$${formatNumber(stats.thisMonth)}`,   icon: Calendar,   color: "text-blue-400",    bg: "bg-blue-500/10"    },
              { label: "Creators with Balance",  value: stats.creatorsBalance,                 icon: Users,      color: "text-purple-400",  bg: "bg-purple-500/10"  },
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

          {/* Bar chart */}
          <div className="rounded-xl border border-white/[0.06] bg-[#111111] p-5">
            <div className="mb-5">
              <h2 className="text-[15px] font-semibold text-white">Monthly Payout Volume</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Last 6 months</p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={MONTHLY_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
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
              <thead>
                <tr className="border-b border-white/[0.04]">
                  <Th>Creator</Th><Th>Campaign</Th><Th right>Amount</Th><Th>Method</Th><Th>Date</Th><Th>Status</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {payouts.slice(0, 6).map(p => {
                  const sc = PAYOUT_STATUS_CFG[p.status]
                  const creator = getCreator(p.creator_id)
                  return (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="w-7 h-7">
                            <AvatarImage src={creator?.avatar_url ?? ""} />
                            <AvatarFallback className="bg-purple-600/20 text-purple-400 text-xs">
                              {creator?.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-zinc-200">{creator?.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5"><span className="text-sm text-zinc-400">{p.campaign_name}</span></td>
                      <td className="px-4 py-3.5 text-right"><span className="text-sm font-semibold text-emerald-400">${p.amount.toLocaleString()}</span></td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${METHOD_CFG[p.payment_method].className}`}>
                          {METHOD_CFG[p.payment_method].label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5"><span className="text-xs text-zinc-500">{formatDate(p.date)}</span></td>
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
            <button
              onClick={handleApproveAll}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-sm font-medium transition-all border border-emerald-500/20"
            >
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
                <thead>
                  <tr className="border-b border-white/[0.04]">
                    <Th>Creator</Th><Th>Campaign</Th><Th right>Views</Th><Th right>Amount</Th><Th>Method</Th><Th>Status</Th><Th>Action</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {pendingPayouts.map(p => {
                    const sc = PAYOUT_STATUS_CFG[p.status]
                    const creator = getCreator(p.creator_id)
                    return (
                      <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={creator?.avatar_url ?? ""} />
                              <AvatarFallback className="bg-purple-600/20 text-purple-400 text-xs font-bold">
                                {creator?.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-zinc-200">{creator?.name}</p>
                              <p className="text-[11px] text-zinc-500">{creator?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5"><span className="text-sm text-zinc-400">{p.campaign_name}</span></td>
                        <td className="px-4 py-3.5 text-right"><span className="text-sm text-zinc-300">{formatNumber(p.views)}</span></td>
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
                            <button
                              onClick={() => openGate("payout processing")}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-all"
                            >
                              Pay Now
                            </button>
                            <button
                              onClick={() => handleHold(p.id)}
                              className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.09] text-zinc-400 hover:text-zinc-200 text-xs font-medium transition-all"
                            >
                              Hold
                            </button>
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
              onClick={() => openGate("CSV export")}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-zinc-400 hover:text-zinc-200 text-sm font-medium transition-all"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-[#111111] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  <Th>Date</Th><Th>Creator</Th><Th>Campaign</Th><Th right>Amount</Th><Th>Method</Th><Th>Status</Th><Th>Invoice</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {filteredHistory.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-zinc-600">No payment history found.</td></tr>
                ) : filteredHistory.map(p => {
                  const sc = PAYOUT_STATUS_CFG[p.status]
                  const creator = getCreator(p.creator_id)
                  return (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3.5"><span className="text-xs text-zinc-500">{formatDate(p.paid_at ?? p.date)}</span></td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={creator?.avatar_url ?? ""} />
                            <AvatarFallback className="text-[9px] bg-purple-600/20 text-purple-400">{creator?.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-zinc-300">{creator?.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5"><span className="text-sm text-zinc-400">{p.campaign_name}</span></td>
                      <td className="px-4 py-3.5 text-right"><span className="text-sm font-semibold text-emerald-400">${p.amount.toLocaleString()}</span></td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${METHOD_CFG[p.payment_method].className}`}>
                          {METHOD_CFG[p.payment_method].label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${sc.className}`}>{sc.label}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        {p.invoice_number ? (
                          <button
                            onClick={() => openGate("invoice download")}
                            className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                          >
                            <Download className="w-3 h-3" />
                            {p.invoice_number}
                          </button>
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
            <p className="text-sm text-zinc-500">{MOCK_CREATORS.length} creators</p>
            <button
              onClick={() => openGate("creator invitations")}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 text-sm font-medium transition-all border border-purple-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              Invite Creator
            </button>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-[#111111] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  <Th>Creator</Th><Th>Payment Method</Th><Th right>Total Earned</Th><Th right>Outstanding</Th><Th>KYC</Th><Th>Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {MOCK_CREATORS.map(c => {
                  const kyc = KYC_CFG[c.kyc_status]
                  const KycIcon = kyc.icon
                  const outstanding = c.total_earned - c.total_paid
                  return (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={c.avatar_url ?? ""} />
                            <AvatarFallback className="bg-purple-600/20 text-purple-400 text-xs font-bold">{c.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
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
                      <td className="px-4 py-3.5 text-right">
                        <span className="text-sm font-semibold text-zinc-200">${c.total_earned.toLocaleString()}</span>
                      </td>
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
                          <button
                            onClick={() => openGate("creator editing")}
                            className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {!c.invite_accepted && (
                            <button
                              onClick={() => openGate("creator invitations")}
                              className="p-1.5 rounded-md text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                              title="Resend Invite"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => openGate("creator management")}
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
            <button
              onClick={() => openGate("custom payout rules")}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 text-sm font-medium transition-all border border-purple-500/20"
            >
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
                    <button
                      onClick={() => openGate("payout rule editing")}
                      className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openGate("payout rule management")}
                      className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { label: "Base Fee",  value: rule.base_fee > 0 ? `$${rule.base_fee}/video` : "—" },
                    { label: "CPM Rate",  value: rule.cpm_rate > 0 ? `$${rule.cpm_rate}/1K` : "—"    },
                    { label: "Milestone", value: rule.milestone_bonus > 0 ? `$${rule.milestone_bonus}` : "—" },
                    { label: "Cap",       value: rule.performance_cap > 0 ? `$${rule.performance_cap}` : "—" },
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

      <SignupGateModal open={gateOpen} onClose={() => setGateOpen(false)} feature={gateFeature} />
    </div>
  )
}
