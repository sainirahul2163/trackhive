"use client"

import { BarChart3 } from "lucide-react"

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-[22px] font-semibold text-white tracking-tight">Analytics</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          Deep insights into your campaign performance.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[420px] rounded-xl border border-white/[0.06] bg-[#111111]">
        <div className="w-14 h-14 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center mb-5">
          <BarChart3 className="w-7 h-7 text-purple-400" />
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">Analytics coming soon</h2>
        <p className="text-sm text-zinc-500 text-center max-w-sm">
          Advanced analytics with cohort analysis, funnel tracking, and custom reports are on the way.
        </p>
        <button className="mt-6 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors">
          Get notified
        </button>
      </div>
    </div>
  )
}
