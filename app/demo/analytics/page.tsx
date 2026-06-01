"use client"

import { useState } from "react"
import { Plus, Eye, TrendingUp, Users, BarChart2 } from "lucide-react"
import { SignupGateModal } from "@/components/demo/signup-gate-modal"

const MOCK_ACCOUNTS = [
  { id: 1, handle: "@fitnessfiona",  platform: "TikTok",    followers: "1.1M", views: "38.2M", avg: "940K", growth: "+22%" },
  { id: 2, handle: "@mikecreates",   platform: "TikTok",    followers: "890K", views: "24.1M", avg: "680K", growth: "+18%" },
  { id: 3, handle: "@sarahlifts",    platform: "Instagram", followers: "540K", views: "14.8M", avg: "310K", growth: "+9%"  },
  { id: 4, handle: "@techwithtom",   platform: "YouTube",   followers: "280K", views: "8.4M",  avg: "190K", growth: "-3%"  },
  { id: 5, handle: "@lifestylekai",  platform: "Instagram", followers: "420K", views: "11.2M", avg: "250K", growth: "+14%" },
]

export default function DemoAnalyticsPage() {
  const [gateOpen, setGateOpen] = useState(false)

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Tracking 5 creator accounts</p>
        </div>
        <button
          onClick={() => setGateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-all"
        >
          <Plus className="w-4 h-4" /> Add Account
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {[
          { label: "Tracked Accounts", value: "5",     icon: Users,      color: "text-purple-400", bg: "bg-purple-500/10" },
          { label: "Total Views",      value: "96.7M",  icon: Eye,        color: "text-blue-400",   bg: "bg-blue-500/10"  },
          { label: "Avg per Video",    value: "474K",   icon: BarChart2,  color: "text-amber-400",  bg: "bg-amber-500/10" },
          { label: "Growing",          value: "4 / 5",  icon: TrendingUp, color: "text-emerald-400",bg: "bg-emerald-500/10"},
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} style={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", backgroundColor: "#111111", padding: "16px" }}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <div>
                  <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider">{s.label}</p>
                  <p className="text-lg font-bold text-white">{s.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Accounts table */}
      <div style={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", backgroundColor: "#111111", overflow: "hidden" }}>
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <h2 className="text-[15px] font-semibold text-white">Tracked Accounts</h2>
        </div>
        <table className="w-full">
          <thead><tr className="border-b border-white/[0.04]">
            <th className="text-left px-5 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Creator</th>
            <th className="text-left px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Platform</th>
            <th className="text-right px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Followers</th>
            <th className="text-right px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Total Views</th>
            <th className="text-right px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Avg / Video</th>
            <th className="text-right px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Growth</th>
            <th className="px-4 py-3" />
          </tr></thead>
          <tbody className="divide-y divide-white/[0.03]">
            {MOCK_ACCOUNTS.map(a => {
              const isPos = a.growth.startsWith("+")
              return (
                <tr key={a.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "rgba(124,58,237,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "#c084fc" }}>{a.handle.slice(1, 3).toUpperCase()}</span>
                      </div>
                      <span className="text-sm font-medium text-zinc-200">{a.handle}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5"><span className="text-sm text-zinc-400">{a.platform}</span></td>
                  <td className="px-4 py-3.5 text-right"><span className="text-sm text-zinc-300">{a.followers}</span></td>
                  <td className="px-4 py-3.5 text-right"><span className="text-sm font-semibold text-zinc-200">{a.views}</span></td>
                  <td className="px-4 py-3.5 text-right"><span className="text-sm text-zinc-300">{a.avg}</span></td>
                  <td className="px-4 py-3.5 text-right">
                    <span className={`text-sm font-medium ${isPos ? "text-emerald-400" : "text-red-400"}`}>{a.growth}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <button onClick={() => setGateOpen(true)} className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                      View →
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <SignupGateModal open={gateOpen} onClose={() => setGateOpen(false)} feature="account tracking" />
    </div>
  )
}
