"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import {
  Video, Users, Play, Heart, MessageCircle, Activity,
  MoreHorizontal, ArrowRight, Flame,
} from "lucide-react"
import {
  ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts"
import { subDays } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { PlatformIcon, formatNumber } from "@/lib/platform"
import {
  AnalyticsBreadcrumb, AccountMultiSelect, ProjectsPlaceholder,
  DateRangePicker, PlatformToggles, ContentTypeToggles,
  InternalAccountsDropdown, InfoTooltip, filtersFromState,
} from "@/components/analytics/analytics-shared"
import {
  fetchUserAccountIds, fetchOverviewMetrics, fetchChartData,
  fetchTopVideos, fetchTopAccounts, fetchHeatmapData,
  calculatePostingStreak, fetchSyncStatus, formatDelta, timeAgoLong,
  type AnalyticsFilters,
} from "@/lib/analytics-queries"
import { fetchTrackedAccounts } from "@/lib/analytics-data"
import { useUser } from "@/lib/use-user"
import type { Platform, TrackedAccount } from "@/types"

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"]

export default function AnalyticsOverviewPage() {
  const { user } = useUser()
  const [accounts, setAccounts] = useState<TrackedAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([])
  const [platforms, setPlatforms] = useState<Platform[]>(["tiktok", "instagram", "youtube", "facebook"])
  const [contentType, setContentType] = useState<AnalyticsFilters["contentType"]>("all")
  const [dateFrom, setDateFrom] = useState(subDays(new Date(), 30))
  const [dateTo, setDateTo] = useState(new Date())
  const [showViews, setShowViews] = useState(true)
  const [showPosted, setShowPosted] = useState(true)
  const [topVideoMetric, setTopVideoMetric] = useState<"views" | "likes" | "comments">("views")
  const [topVideoCount, setTopVideoCount] = useState(5)
  const [topAccountCount, setTopAccountCount] = useState(5)

  const [metrics, setMetrics] = useState<Awaited<ReturnType<typeof fetchOverviewMetrics>> | null>(null)
  const [chartData, setChartData] = useState<Awaited<ReturnType<typeof fetchChartData>>>([])
  const [topVideos, setTopVideos] = useState<Awaited<ReturnType<typeof fetchTopVideos>>>([])
  const [topAccounts, setTopAccounts] = useState<Awaited<ReturnType<typeof fetchTopAccounts>>>([])
  const [heatmap, setHeatmap] = useState<Map<string, number>>(new Map())
  const [streak, setStreak] = useState(0)
  const [syncStatus, setSyncStatus] = useState<{ lastRefresh: string | null; nextRefreshHours: number } | null>(null)

  const filters = useMemo(
    () => filtersFromState(selectedAccounts, platforms, contentType, dateFrom, dateTo),
    [selectedAccounts, platforms, contentType, dateFrom, dateTo],
  )

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const accs = await fetchTrackedAccounts(user?.id)
      setAccounts(accs)
      const ids = await fetchUserAccountIds(user?.id)

      const [m, chart, videos, tops, hm, sync] = await Promise.all([
        fetchOverviewMetrics(filters, ids),
        fetchChartData(filters, ids),
        fetchTopVideos(filters, ids, topVideoMetric, topVideoCount),
        fetchTopAccounts(filters, ids, topAccountCount),
        fetchHeatmapData(user?.id),
        fetchSyncStatus(user?.id),
      ])

      setMetrics(m)
      setChartData(chart.map((d) => ({
        ...d,
        label: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      })))
      setTopVideos(videos)
      setTopAccounts(tops)
      setHeatmap(hm)
      setStreak(calculatePostingStreak(hm))
      setSyncStatus(sync)
    } finally {
      setLoading(false)
    }
  }, [user?.id, filters, topVideoMetric, topVideoCount, topAccountCount])

  useEffect(() => { load() }, [load])

  const kpiCards = metrics ? [
    { label: "Posted Videos", value: metrics.postedVideos, delta: formatDelta(metrics.deltas.postedVideos), icon: Video, href: "/analytics/videos" },
    { label: "Active Accounts", value: metrics.activeAccounts, delta: formatDelta(metrics.deltas.activeAccounts), icon: Users, href: "/analytics" },
    { label: "Views", value: formatNumber(metrics.views), delta: formatDelta(metrics.deltas.views), icon: Play, href: "/analytics/videos" },
    { label: "Likes", value: formatNumber(metrics.likes), delta: formatDelta(metrics.deltas.likes), icon: Heart, href: "/analytics/videos" },
    { label: "Comments", value: formatNumber(metrics.comments), delta: formatDelta(metrics.deltas.comments), icon: MessageCircle, href: "/analytics/videos" },
    { label: "Engagement", value: `${metrics.engagement}%`, delta: formatDelta(metrics.deltas.engagement, true), icon: Activity, href: "/analytics" },
  ] : []

  const heatmapWeeks = useMemo(() => {
    const weeks: number[][] = []
    const start = new Date()
    start.setDate(start.getDate() - 83)
    for (let w = 0; w < 12; w++) {
      const week: number[] = []
      for (let d = 0; d < 7; d++) {
        const cell = new Date(start)
        cell.setDate(start.getDate() + w * 7 + d)
        const key = cell.toISOString().slice(0, 10)
        week.push(heatmap.get(key) ?? 0)
      }
      weeks.push(week)
    }
    return weeks
  }, [heatmap])

  const maxHeat = Math.max(...heatmapWeeks.flat(), 1)

  return (
    <div className="space-y-5 max-w-7xl">
      <AnalyticsBreadcrumb section="Overview" />
      <div>
        <h1 className="text-[22px] font-semibold text-white tracking-tight">Overview</h1>
        <p className="text-sm text-zinc-500 mt-0.5">View performance metrics across your tracked accounts.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <AccountMultiSelect accounts={accounts} selected={selectedAccounts} onChange={setSelectedAccounts} />
        <ProjectsPlaceholder />
        <DateRangePicker from={dateFrom} to={dateTo} onChange={(f, t) => { setDateFrom(f); setDateTo(t) }} />
        <PlatformToggles selected={platforms} onChange={setPlatforms} />
        <ContentTypeToggles contentType={contentType} onChange={setContentType} />
        <div className="ml-auto"><InternalAccountsDropdown /></div>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {kpiCards.map((k) => {
            const Icon = k.icon
            return (
              <div key={k.label} className="rounded-xl border border-white/[0.06] bg-[#111111] p-4 relative">
                <Link href={k.href} className="absolute top-3 right-3 text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-0.5">
                  All <ArrowRight className="w-3 h-3" />
                </Link>
                <div className="flex items-center gap-2 text-zinc-500 mb-2">
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-medium">{k.label}</span>
                  <InfoTooltip text={`Total ${k.label.toLowerCase()} in selected period`} />
                </div>
                <p className="text-2xl font-bold text-white">{k.value}</p>
                <p className="text-xs text-emerald-400 mt-1">{k.delta} vs last period</p>
              </div>
            )
          })}
        </div>
      )}

      <div className="rounded-xl border border-white/[0.06] bg-[#111111] p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-white">Metrics</span>
            {showPosted && (
              <button onClick={() => setShowPosted(false)} className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-orange-500/15 text-orange-400 border border-orange-500/25">
                Posted Videos ×
              </button>
            )}
            {showViews && (
              <button onClick={() => setShowViews(false)} className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-500/15 text-blue-400 border border-blue-500/25">
                Views ×
              </button>
            )}
            <button className="px-2 py-1 rounded-full text-xs text-zinc-500 border border-white/[0.08] hover:text-zinc-300">+ Add</button>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-zinc-400 border border-white/[0.08] hover:text-white">
            Settings
          </button>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="label" tick={{ fill: "#71717a", fontSize: 11 }} />
            {showViews && <YAxis yAxisId="left" tick={{ fill: "#71717a", fontSize: 11 }} />}
            {showPosted && <YAxis yAxisId="right" orientation="right" tick={{ fill: "#71717a", fontSize: 11 }} />}
            <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
            {showViews && <Area yAxisId="left" type="monotone" dataKey="views" fill="#3b82f6" fillOpacity={0.2} stroke="#3b82f6" strokeWidth={2} />}
            {showPosted && <Bar yAxisId="right" dataKey="postedVideos" fill="#f97316" barSize={12} radius={[2, 2, 0, 0]} />}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/[0.06] bg-[#111111] p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">Top Videos</span>
              <InfoTooltip text="Highest performing videos in period" />
            </div>
            <div className="flex gap-2">
              <select value={topVideoMetric} onChange={(e) => setTopVideoMetric(e.target.value as "views" | "likes" | "comments")} className="text-xs bg-white/[0.04] border border-white/[0.08] rounded px-2 py-1 text-zinc-400 outline-none">
                <option value="views">Views</option>
                <option value="likes">Likes</option>
                <option value="comments">Comments</option>
              </select>
              <select value={topVideoCount} onChange={(e) => setTopVideoCount(Number(e.target.value))} className="text-xs bg-white/[0.04] border border-white/[0.08] rounded px-2 py-1 text-zinc-400 outline-none">
                {[5, 10, 20].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            {topVideos.map((v) => (
              <div key={v.id} className="flex items-center gap-3 py-2 border-b border-white/[0.03] last:border-0">
                <div className="w-10 h-10 rounded bg-white/[0.04] flex-shrink-0 overflow-hidden">
                  {v.thumbnail_url && <img src={v.thumbnail_url} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-zinc-300 truncate">{v.caption}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <PlatformIcon platform={v.platform} className="w-3 h-3" />
                    <span className="text-[10px] text-zinc-500">@{v.username}</span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-white">{formatNumber(v.views)}</span>
                <button className="text-zinc-600 hover:text-zinc-400"><MoreHorizontal className="w-4 h-4" /></button>
              </div>
            ))}
            {!topVideos.length && <p className="text-xs text-zinc-600 py-4 text-center">No videos in this period</p>}
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-[#111111] p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">Top Accounts</span>
              <InfoTooltip text="Accounts ranked by total views" />
            </div>
            <select value={topAccountCount} onChange={(e) => setTopAccountCount(Number(e.target.value))} className="text-xs bg-white/[0.04] border border-white/[0.08] rounded px-2 py-1 text-zinc-400 outline-none">
              {[5, 10, 20].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            {topAccounts.map((a) => (
              <Link key={a.id} href={`/analytics/${a.id}`} className="flex items-center gap-3 py-2 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] rounded-lg px-1 -mx-1">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={a.avatar_url ?? undefined} />
                  <AvatarFallback className="text-[10px]">{a.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{a.display_name ?? a.username}</p>
                  <div className="flex items-center gap-1">
                    <PlatformIcon platform={a.platform} className="w-3 h-3" />
                    <span className="text-[10px] text-zinc-500">@{a.username}</span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-white">{formatNumber(a.total_views ?? 0)}</span>
              </Link>
            ))}
            {!topAccounts.length && <p className="text-xs text-zinc-600 py-4 text-center">No accounts yet</p>}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-[#111111] p-4 relative">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-white">Post Activity</span>
          {streak > 0 && (
            <span className="flex items-center gap-1 text-xs font-medium text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-full">
              <Flame className="w-3.5 h-3.5" /> You are on a {streak} day streak
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <div className="inline-flex gap-1">
            {heatmapWeeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((count, di) => {
                  const intensity = count / maxHeat
                  const bg = count === 0
                    ? "rgba(255,255,255,0.04)"
                    : `rgba(249,115,22,${0.2 + intensity * 0.8})`
                  return (
                    <div
                      key={di}
                      title={`${count} posts`}
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: bg }}
                    />
                  )
                })}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex gap-4">{DAY_LABELS.map((l, i) => <span key={i} className="text-[10px] text-zinc-600 w-3 text-center">{l}</span>)}</div>
            <div className="flex items-center gap-2 text-[10px] text-zinc-600">
              <span>Fewer Posts</span>
              {[0.1, 0.3, 0.5, 0.7, 1].map((o) => (
                <div key={o} className="w-3 h-3 rounded-sm" style={{ backgroundColor: `rgba(249,115,22,${0.2 + o * 0.8})` }} />
              ))}
              <span>More Posts</span>
            </div>
          </div>
        </div>
      </div>

      {syncStatus && (
        <p className="text-xs text-zinc-600 text-center pb-2">
          Data refresh started {timeAgoLong(syncStatus.lastRefresh)} · Next refresh starts in about {syncStatus.nextRefreshHours} hours
        </p>
      )}
    </div>
  )
}
