"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { SignupGateModal } from "@/components/demo/signup-gate-modal"

const MOCK_CAMPAIGNS = [
  { id: 1, name: "Summer Drop 2024",     status: "active",    brand: "AuraBrand",   views: "18.4M", target: "25M",   pct: 74, creators: 8,  payout: "$12,400" },
  { id: 2, name: "Back to School",       status: "active",    brand: "FitEdge",     views: "7.1M",  target: "10M",   pct: 71, creators: 5,  payout: "$8,200"  },
  { id: 3, name: "Product Launch Q3",   status: "paused",    brand: "NexGear",     views: "4.8M",  target: "15M",   pct: 32, creators: 3,  payout: "$3,600"  },
  { id: 4, name: "Holiday Campaign",     status: "draft",     brand: "LuxHome",     views: "0",     target: "20M",   pct: 0,  creators: 0,  payout: "$0"      },
  { id: 5, name: "Spring Fitness Push",  status: "completed", brand: "FitEdge",     views: "31.2M", target: "30M",   pct: 100,creators: 12, payout: "$22,800" },
]

const statusStyle: Record<string, string> = {
  active:    "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  paused:    "bg-amber-500/15 text-amber-400 border-amber-500/20",
  draft:     "bg-zinc-500/15 text-zinc-400 border-zinc-500/20",
  completed: "bg-blue-500/15 text-blue-400 border-blue-500/20",
}

export default function DemoCampaignsPage() {
  const [gateOpen, setGateOpen] = useState(false)
  const [filter, setFilter] = useState("All")

  const tabs = ["All", "Active", "Draft", "Completed", "Paused"]
  const filtered = filter === "All" ? MOCK_CAMPAIGNS : MOCK_CAMPAIGNS.filter(c => c.status === filter.toLowerCase())

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Campaigns</h1>
          <p className="text-sm text-zinc-500 mt-0.5">3 active campaigns</p>
        </div>
        <button
          onClick={() => setGateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-all"
        >
          <Plus className="w-4 h-4" /> New Campaign
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-white/[0.03] border border-white/[0.06] rounded-lg p-1 w-fit">
        {tabs.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${filter === t ? "bg-[#1a1a1a] text-white" : "text-zinc-500 hover:text-zinc-300"}`}
          >{t}</button>
        ))}
      </div>

      {/* Campaign cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {filtered.map(c => (
          <div key={c.id} style={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", backgroundColor: "#111111", padding: "20px" }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-[15px] font-semibold text-white">{c.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${statusStyle[c.status]}`}>
                    {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                  </span>
                </div>
                <p className="text-xs text-zinc-500">{c.brand}</p>
              </div>
              <button onClick={() => setGateOpen(true)} className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                View →
              </button>
            </div>

            {/* Progress */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-zinc-500 mb-1.5">
                <span>{c.views} views</span>
                <span>Target: {c.target}</span>
              </div>
              <div style={{ height: "4px", borderRadius: "2px", backgroundColor: "rgba(255,255,255,0.06)" }}>
                <div style={{ height: "100%", width: `${c.pct}%`, borderRadius: "2px", backgroundColor: c.pct >= 100 ? "#10b981" : "#7C3AED", transition: "width 0.3s" }} />
              </div>
              <p className="text-[11px] text-zinc-600 mt-1">{c.pct}% of target</p>
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>{c.creators} creators</span>
              <span className="text-zinc-300 font-medium">{c.payout} paid</span>
            </div>
          </div>
        ))}
      </div>

      <SignupGateModal open={gateOpen} onClose={() => setGateOpen(false)} feature="campaign management" />
    </div>
  )
}
