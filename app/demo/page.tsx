"use client"

import { useState } from "react"
import {
  Eye, Megaphone, DollarSign, AlertTriangle,
  ArrowUpRight, ArrowDownRight, TrendingUp, Play, MoreHorizontal,
} from "lucide-react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"
import { SignupGateModal } from "@/components/demo/signup-gate-modal"

const metrics = [
  { title: "Total Views",       value: "24.8M",  change: "+18.2%", up: true,  icon: Eye,           color: "text-blue-400",    bg: "bg-blue-500/10"    },
  { title: "Active Campaigns",  value: "12",     change: "+3",     up: true,  icon: Megaphone,      color: "text-purple-400",  bg: "bg-purple-500/10"  },
  { title: "Pending Payouts",   value: "$48,230",change: "-$2,100",up: false, icon: DollarSign,     color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { title: "Creator Alerts",    value: "7",      change: "+4",     up: false, icon: AlertTriangle,  color: "text-amber-400",   bg: "bg-amber-500/10"   },
]

const chartData = [
  { month: "Jan", views: 3200000 }, { month: "Feb", views: 4100000 },
  { month: "Mar", views: 3800000 }, { month: "Apr", views: 5200000 },
  { month: "May", views: 6100000 }, { month: "Jun", views: 5700000 },
  { month: "Jul", views: 7800000 }, { month: "Aug", views: 8200000 },
  { month: "Sep", views: 7100000 }, { month: "Oct", views: 9400000 },
  { month: "Nov", views: 11200000},{ month: "Dec", views: 24800000 },
]

const topVideos = [
  { id: 1, title: "Honest product review — it actually works 🔥", creator: "@fitnessfiona", platform: "TikTok",    views: "3.2M",  virality: 9.1 },
  { id: 2, title: "Why I switched to this brand after 6 months",  creator: "@mikecreates",  platform: "Instagram", views: "2.1M",  virality: 8.6 },
  { id: 3, title: "Full unboxing + first impressions",             creator: "@techwithtom",  platform: "YouTube",   views: "1.5M",  virality: 8.0 },
  { id: 4, title: "Get ready with me ft. this product",           creator: "@sarahlifts",   platform: "TikTok",    views: "880K",  virality: 7.8 },
  { id: 5, title: "Day in my life using it every morning",        creator: "@lifestylekai", platform: "Instagram", views: "670K",  virality: 7.4 },
]

const alerts = [
  { id: 1, type: "warning", message: "Campaign \"Summer Drop\" is 14% behind target views" },
  { id: 2, type: "success", message: "@fitnessfiona posted — 3.2M views in 48 hours" },
  { id: 3, type: "info",    message: "Payout of $4,800 pending approval for @mikecreates" },
  { id: 4, type: "error",   message: "@techwithtom hasn&apos;t posted in 21 days" },
]

const alertStyles: Record<string, string> = {
  warning: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  info:    "bg-blue-500/10 border-blue-500/20 text-blue-400",
  error:   "bg-red-500/10 border-red-500/20 text-red-400",
}

interface TTProps { active?: boolean; payload?: Array<{ value: number }>; label?: string }
function ChartTip({ active, payload, label }: TTProps) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "8px 12px" }}>
      <p style={{ fontSize: "11px", color: "#71717a", marginBottom: "2px" }}>{label}</p>
      <p style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>
        {(payload[0].value / 1000000).toFixed(1)}M views
      </p>
    </div>
  )
}

export default function DemoDashboard() {
  const [gateOpen, setGateOpen] = useState(false)
  const [gateFeature, setGateFeature] = useState("this feature")

  function openGate(feature: string) {
    setGateFeature(feature)
    setGateOpen(true)
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Demo workspace — simulated data</p>
        </div>
        <button
          onClick={() => openGate("campaign creation")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-all"
        >
          + New Campaign
        </button>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map(m => {
          const Icon = m.icon
          return (
            <div key={m.title} style={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", backgroundColor: "#111111", padding: "16px 20px" }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{m.title}</p>
                <div className={`w-7 h-7 rounded-lg ${m.bg} flex items-center justify-center`}>
                  <Icon className={`w-3.5 h-3.5 ${m.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-white mb-1">{m.value}</p>
              <div className="flex items-center gap-1">
                {m.up ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" /> : <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />}
                <span className={`text-xs font-medium ${m.up ? "text-emerald-400" : "text-red-400"}`}>{m.change}</span>
                <span className="text-xs text-zinc-600 ml-0.5">vs last month</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Chart */}
        <div style={{ gridColumn: "span 2", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", backgroundColor: "#111111", padding: "20px" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[15px] font-semibold text-white">Total Views</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Jan – Dec 2024</p>
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#52525b", fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "#52525b", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${(v/1000000).toFixed(0)}M`} />
              <Tooltip content={<ChartTip />} />
              <Area type="monotone" dataKey="views" stroke="#7C3AED" strokeWidth={2} fill="url(#grad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Alerts */}
        <div style={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", backgroundColor: "#111111", padding: "20px" }}>
          <h2 className="text-[15px] font-semibold text-white mb-4">Recent Alerts</h2>
          <div className="space-y-2.5">
            {alerts.map(a => (
              <div key={a.id} className={`flex items-start gap-2.5 p-3 rounded-lg border text-xs leading-relaxed ${alertStyles[a.type]}`}>
                {a.message}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top videos */}
      <div style={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", backgroundColor: "#111111", overflow: "hidden" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <h2 className="text-[15px] font-semibold text-white">Top Performing Videos</h2>
          <button onClick={() => openGate("detailed video analytics")} className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
            View all →
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.04]">
              <th className="text-left px-5 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Video</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Creator</th>
              <th className="text-right px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Views</th>
              <th className="text-center px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Virality</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {topVideos.map(v => (
              <tr key={v.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "rgba(124,58,237,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Play className="w-3.5 h-3.5 text-purple-400" fill="currentColor" />
                    </div>
                    <span className="text-sm text-zinc-300 line-clamp-1">{v.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <div>
                    <p className="text-sm text-zinc-300">{v.creator}</p>
                    <p className="text-[11px] text-zinc-600">{v.platform}</p>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-right"><span className="text-sm font-semibold text-zinc-200">{v.views}</span></td>
                <td className="px-4 py-3.5 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${v.virality >= 8.5 ? "bg-red-500/15 text-red-400" : v.virality >= 7 ? "bg-amber-500/15 text-amber-400" : "bg-zinc-500/15 text-zinc-400"}`}>
                    {v.virality}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <button onClick={() => openGate("video details")} className="p-1 rounded text-zinc-600 hover:text-zinc-300 transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SignupGateModal open={gateOpen} onClose={() => setGateOpen(false)} feature={gateFeature} />
    </div>
  )
}
