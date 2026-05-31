"use client"

import { TrendingUp } from "lucide-react"

export default function TrendsPage() {
  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-[22px] font-semibold text-white tracking-tight">Trends</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          Discover what&apos;s trending across creator niches and platforms.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[420px] rounded-xl border border-white/[0.06] bg-[#111111]">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5">
          <TrendingUp className="w-7 h-7 text-blue-400" />
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">Trend intelligence coming soon</h2>
        <p className="text-sm text-zinc-500 text-center max-w-sm">
          Real-time trending topics, hashtags, and content formats across YouTube, TikTok, and Instagram.
        </p>
        <button className="mt-6 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors">
          Get notified
        </button>
      </div>
    </div>
  )
}
