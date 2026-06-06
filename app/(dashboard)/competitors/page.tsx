"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import Image from "next/image"
import {
  Plus, Globe, Eye, Users, TrendingUp, BarChart2,
  Star, StarOff, ChevronRight, AlertCircle,
  Sparkles, ArrowUpRight, ArrowDownRight,
  Clock, X, Check, ExternalLink,
} from "lucide-react"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { PlatformIcon, PLATFORM_CONFIG, formatNumber } from "@/lib/platform"
import {
  fetchCompetitors, fetchCompetitorVideos, fetchCompetitorCreators, fetchAiReports,
  fetchWeeklyComparison, type WeeklyComparisonPoint,
} from "@/lib/competitors-data"
import { AddCompetitorDrawer } from "@/components/competitors/add-competitor-drawer"
import { useUser } from "@/lib/use-user"
import type {
  Competitor, CompetitorVideo,
  CompetitorCreator, AiReport, Platform,
} from "@/types"
import { cn } from "@/lib/utils"

// ── Helpers ───────────────────────────────────────────────────
const TABS = ["Overview", "Videos", "Creators", "vs. You", "AI Reports"] as const
type Tab = typeof TABS[number]

function timeAgo(iso: string | null) {
  if (!iso) return "—"
  const diff = Date.now() - new Date(iso).getTime()
  const hrs = Math.floor(diff / 3600000)
  if (hrs < 1) return "Just now"
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
}

interface ChartTTProps { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }
function ChartTooltip({ active, payload, label }: ChartTTProps) {
  if (active && payload?.length) return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 shadow-xl space-y-1">
      <p className="text-[11px] text-zinc-500 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="text-xs font-semibold" style={{ color: p.color }}>{p.name}: {formatNumber(p.value)}</p>
      ))}
    </div>
  )
  return null
}

// ── Main component ────────────────────────────────────────────
export default function CompetitorsPage() {
  const { user } = useUser()
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>("Overview")
  const [showAddDrawer, setShowAddDrawer] = useState(false)
  const [weeklyData, setWeeklyData] = useState<WeeklyComparisonPoint[]>([])
  const [expandedReport, setExpandedReport] = useState<string | null>(null)
  const [generatingReport, setGeneratingReport] = useState(false)

  const selected = competitors.find(c => c.id === selectedId) ?? null
  const [creators, setCreators] = useState<Record<string, CompetitorCreator[]>>({})
  const [videos, setVideos] = useState<Record<string, CompetitorVideo[]>>({})
  const [reports, setReports] = useState<Record<string, AiReport[]>>({})

  const loadCompetitors = useCallback(async (userId?: string) => {
    setLoading(true); setError(null)
    try {
      const data = await fetchCompetitors(userId)
      setCompetitors(data)
    } catch { setError("Failed to load competitors") }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadCompetitors(user?.id) }, [loadCompetitors, user?.id])

  useEffect(() => {
    if (!selectedId) {
      setWeeklyData([])
      return
    }
    fetchWeeklyComparison(selectedId, user?.id)
      .then(setWeeklyData)
      .catch(() => setWeeklyData([]))
  }, [selectedId, user?.id])

  useEffect(() => {
    if (!selectedId) return
    if (!creators[selectedId]) {
      fetchCompetitorCreators(selectedId)
        .then(data => setCreators(p => ({ ...p, [selectedId]: data })))
        .catch(() => setCreators(p => ({ ...p, [selectedId]: [] })))
    }
    if (!reports[selectedId]) {
      fetchAiReports(selectedId)
        .then(data => setReports(p => ({ ...p, [selectedId]: data })))
        .catch(() => setReports(p => ({ ...p, [selectedId]: [] })))
    }
    if (!videos[selectedId]) {
      fetchCompetitorVideos(selectedId)
        .then(data => setVideos(p => ({ ...p, [selectedId]: data })))
        .catch(() => setVideos(p => ({ ...p, [selectedId]: [] })))
    }
  }, [selectedId, creators, reports, videos])

  function handleSelect(id: string) {
    setSelectedId(id); setActiveTab("Overview")
  }

  function toggleFlag(creatorId: string) {
    if (!selectedId) return
    setCreators(prev => ({
      ...prev,
      [selectedId]: prev[selectedId].map(c =>
        c.id === creatorId ? { ...c, flagged_outreach: !c.flagged_outreach } : c
      ),
    }))
  }

  function handleGenerateReport() {
    if (!selectedId) return
    setGeneratingReport(true)
    setTimeout(() => setGeneratingReport(false), 800)
  }

  const compCreators = selectedId ? (creators[selectedId] ?? []) : []
  const compVideos   = selectedId ? (videos[selectedId]   ?? []) : []
  const compReports  = selectedId ? (reports[selectedId]  ?? []) : []

  const totalViews = selected?.accounts?.reduce((s, a) => s + a.total_views, 0) ?? 0
  const avgViews   = selected?.accounts?.length
    ? Math.round((selected.accounts.reduce((s, a) => s + a.avg_views, 0)) / selected.accounts.length)
    : 0
  const topPlatform = selected?.accounts?.sort((a, b) => b.total_views - a.total_views)[0]?.platform

  const formatPie = useMemo(() => {
    if (compVideos.length === 0) return []
    const counts = new Map<string, number>()
    for (const v of compVideos) {
      const key = v.content_format ?? "other"
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    const colors = ["#7C3AED", "#3b82f6", "#10b981", "#f59e0b", "#6b7280"]
    return Array.from(counts.entries()).map(([name, count], i) => ({
      name: name.replace(/_/g, " "),
      value: Math.round((count / compVideos.length) * 100),
      color: colors[i % colors.length],
    }))
  }, [compVideos])

  return (
    <div style={{ display: "flex", gap: "0", height: "calc(100vh - 104px)", overflow: "hidden" }}>

      {/* ── LEFT SIDEBAR ─────────────────────────────────────── */}
      <div
        style={{
          width: "280px", flexShrink: 0, display: "flex", flexDirection: "column",
          borderRight: "1px solid rgba(255,255,255,0.06)", overflowY: "auto",
          backgroundColor: "#0a0a0a",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/[0.06] flex-shrink-0">
          <h1 className="text-[15px] font-semibold text-white">Competitors</h1>
          <button
            onClick={() => setShowAddDrawer(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium transition-all"
          >
            <Plus className="w-3 h-3" />
            Add
          </button>
        </div>

        {/* Competitor list */}
        <div className="flex-1 py-2">
          {loading && (
            <div className="px-3 space-y-2">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
            </div>
          )}

          {!loading && error && (
            <div className="px-4 py-6 text-center">
              <AlertCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
              <p className="text-xs text-zinc-500">{error}</p>
              <button onClick={() => loadCompetitors(user?.id)} className="mt-2 text-xs text-purple-400 hover:text-purple-300">Retry</button>
            </div>
          )}

          {!loading && competitors.length === 0 && (
            <div className="px-4 py-10 text-center">
              <Globe className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
              <p className="text-xs font-medium text-zinc-500">No competitors tracked yet</p>
              <p className="text-[11px] text-zinc-600 mt-1">Add a competitor to start intelligence gathering.</p>
            </div>
          )}

          {!loading && competitors.map(comp => {
            const isSelected = selectedId === comp.id
            const platforms = comp.accounts?.map(a => a.platform) ?? []
            return (
              <button
                key={comp.id}
                onClick={() => handleSelect(comp.id)}
                className={cn(
                  "w-full text-left px-3 py-3 mx-1 rounded-lg transition-all mb-1 group",
                  isSelected
                    ? "bg-purple-600/10 border border-purple-500/30"
                    : "hover:bg-white/[0.03] border border-transparent"
                )}
                style={{ width: "calc(100% - 8px)" }}
              >
                <div className="flex items-start gap-2.5">
                  {/* Logo placeholder */}
                  <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center flex-shrink-0 text-xs font-bold text-zinc-400">
                    {comp.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={cn("text-sm font-semibold truncate", isSelected ? "text-purple-300" : "text-zinc-200 group-hover:text-white")}>{comp.name}</p>
                      <ChevronRight className={cn("w-3 h-3 flex-shrink-0 transition-transform", isSelected ? "text-purple-400 rotate-90" : "text-zinc-600")} />
                    </div>
                    {comp.website && <p className="text-[11px] text-zinc-600 truncate mt-0.5">{comp.website}</p>}
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {platforms.map(p => {
                        const cfg = PLATFORM_CONFIG[p]
                        return (
                          <span
                            key={p}
                            style={{ backgroundColor: cfg.bgColor, color: cfg.fgColor, display: "inline-flex", alignItems: "center", padding: "2px 6px", borderRadius: "4px", fontSize: "9px", fontWeight: 500 }}
                          >
                            <PlatformIcon platform={p} className="w-2 h-2" />
                          </span>
                        )
                      })}
                      <span className="text-[10px] text-zinc-600 ml-auto">
                        <Clock className="w-2.5 h-2.5 inline mr-0.5" />2h ago
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── RIGHT ZONE ───────────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflowY: "auto", padding: "20px 24px" }}>

        {/* No competitor selected */}
        {!selected && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center mb-4">
              <BarChart2 className="w-8 h-8 text-purple-400" />
            </div>
            <h2 className="text-base font-semibold text-white mb-1">Select a Competitor</h2>
            <p className="text-sm text-zinc-500 max-w-xs">
              Choose a competitor from the left panel to view their intelligence data.
            </p>
          </div>
        )}

        {/* Competitor selected */}
        {selected && (
          <div className="space-y-4">
            {/* Competitor header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-sm font-bold text-zinc-400">
                  {selected.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">{selected.name}</h2>
                  {selected.website && (
                    <a href={`https://${selected.website}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-zinc-500 hover:text-purple-400 transition-colors mt-0.5">
                      <ExternalLink className="w-3 h-3" />{selected.website}
                    </a>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selected.accounts?.map(acc => {
                  const cfg = PLATFORM_CONFIG[acc.platform]
                  return (
                    <span
                      key={acc.id}
                      style={{ backgroundColor: cfg.bgColor, color: cfg.fgColor, display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 8px", borderRadius: "8px", fontSize: "12px", fontWeight: 500 }}
                    >
                      <PlatformIcon platform={acc.platform} className="w-3 h-3" />
                      {acc.username}
                    </span>
                  )
                })}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-white/[0.03] border border-white/[0.06] rounded-lg p-1 w-fit">
              {TABS.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-all ${
                    activeTab === tab ? "bg-[#1a1a1a] text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >{tab}</button>
              ))}
            </div>

            {/* ── OVERVIEW ────────────────────────────────────── */}
            {activeTab === "Overview" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                  {[
                    { label: "Est. Creators",       value: String(compCreators.length), icon: Users,      color: "text-purple-400",  bg: "bg-purple-500/10" },
                    { label: "Total Views / Month",  value: formatNumber(totalViews),     icon: Eye,        color: "text-blue-400",    bg: "bg-blue-500/10"   },
                    { label: "Avg Views / Video",    value: formatNumber(avgViews),        icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10"},
                    { label: "Top Platform",         value: topPlatform ? PLATFORM_CONFIG[topPlatform].label : "—", icon: BarChart2, color: "text-amber-400", bg: "bg-amber-500/10" },
                  ].map(s => {
                    const Icon = s.icon
                    return (
                      <div key={s.label} className="rounded-xl border border-white/[0.06] bg-[#111111] px-4 py-3.5 flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-4 h-4 ${s.color}`} />
                        </div>
                        <div>
                          <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">{s.label}</p>
                          <p className="text-base font-bold text-white leading-tight">{s.value}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                  {/* Weekly trend */}
                  <div className="xl:col-span-2 rounded-xl border border-white/[0.06] bg-[#111111] p-5">
                    <h3 className="text-[15px] font-semibold text-white mb-4">Weekly Views Trend</h3>
                    {weeklyData.length === 0 ? (
                      <p className="text-sm text-zinc-500 text-center py-16">Add competitor accounts to see comparison</p>
                    ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={weeklyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                        <XAxis dataKey="week" tick={{ fill: "#52525b", fontSize: 10 }} tickLine={false} axisLine={false} interval={3} />
                        <YAxis tick={{ fill: "#52525b", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${(v/1000000).toFixed(1)}M`} />
                        <Tooltip content={<ChartTooltip />} />
                        <Line type="monotone" dataKey="competitor" stroke="#7C3AED" strokeWidth={2} dot={false} name={selected.name} />
                        <Line type="monotone" dataKey="yours" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="5 3" name="Your workspace" />
                      </LineChart>
                    </ResponsiveContainer>
                    )}
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-purple-500 rounded" /><span className="text-[11px] text-zinc-500">{selected.name}</span></div>
                      <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-emerald-500 rounded border-dashed" /><span className="text-[11px] text-zinc-500">Your workspace</span></div>
                    </div>
                  </div>

                  {/* Format pie */}
                  <div className="rounded-xl border border-white/[0.06] bg-[#111111] p-5">
                    <h3 className="text-[15px] font-semibold text-white mb-4">Content Format Mix</h3>
                    {formatPie.length === 0 ? (
                      <p className="text-sm text-zinc-500 text-center py-12">No video format data yet</p>
                    ) : (
                    <>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie data={formatPie} cx="50%" cy="50%" innerRadius={40} outerRadius={68} paddingAngle={2} dataKey="value">
                          {formatPie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip formatter={(val) => [`${val}%`, "Share"]} contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-1.5">
                      {formatPie.map(f => (
                        <div key={f.name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: f.color }} />
                            <span className="text-zinc-400">{f.name}</span>
                          </div>
                          <span className="font-medium text-zinc-300">{f.value}%</span>
                        </div>
                      ))}
                    </div>
                    </>
                    )}
                  </div>
                </div>

                {/* Top 5 videos */}
                <div className="rounded-xl border border-white/[0.06] bg-[#111111] overflow-hidden">
                  <div className="px-5 py-4 border-b border-white/[0.06]">
                    <h3 className="text-[15px] font-semibold text-white">Top Videos This Month</h3>
                  </div>
                  <div className="divide-y divide-white/[0.03]">
                    {compVideos.slice(0, 5).map((v, i) => {
                      const platCfg = PLATFORM_CONFIG[v.platform]
                      return (
                        <div key={v.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                          <span className="text-xs font-bold text-zinc-600 w-4">#{i + 1}</span>
                          <div className="w-14 h-8 rounded overflow-hidden flex-shrink-0 bg-white/[0.04]">
                            {v.thumbnail_url && (
                              <Image src={v.thumbnail_url} alt="" width={40} height={40} className="w-full h-full object-cover" unoptimized />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-zinc-300 truncate">{v.caption}</p>
                            <span style={{ color: platCfg.fgColor, fontSize: "10px", fontWeight: 500 }}>{platCfg.label}</span>
                          </div>
                          <span className="text-sm font-semibold text-zinc-200 flex-shrink-0">{formatNumber(v.views)}</span>
                          <span className={`text-xs flex-shrink-0 ${v.engagement_rate > 8 ? "text-emerald-400" : "text-zinc-500"}`}>{v.engagement_rate}%</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── VIDEOS ──────────────────────────────────────── */}
            {activeTab === "Videos" && (
              <div className="rounded-xl border border-white/[0.06] bg-[#111111] overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                  <h3 className="text-[15px] font-semibold text-white">Videos ({compVideos.length})</h3>
                  <div className="flex gap-2">
                    {(["tiktok","instagram","youtube","facebook"] as Platform[]).filter(p => selected.accounts?.some(a => a.platform === p)).map(p => {
                      const cfg = PLATFORM_CONFIG[p]
                      return (
                        <span
                          key={p}
                          style={{ backgroundColor: cfg.bgColor, color: cfg.fgColor, padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 500, cursor: "pointer" }}
                        >
                          {cfg.label}
                        </span>
                      )
                    })}
                  </div>
                </div>
                <table className="w-full">
                  <thead><tr className="border-b border-white/[0.04]">
                    <th className="text-left px-5 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Video</th>
                    <th className="text-left px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Platform</th>
                    <th className="text-right px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Views</th>
                    <th className="text-right px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Eng %</th>
                    <th className="text-left px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Format</th>
                    <th className="text-left px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Date</th>
                  </tr></thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {compVideos.map(v => {
                      const platCfg = PLATFORM_CONFIG[v.platform]
                      return (
                        <tr key={v.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-14 h-8 rounded overflow-hidden flex-shrink-0 bg-white/[0.04]">
                                {v.thumbnail_url && (
                              <Image src={v.thumbnail_url} alt="" width={40} height={40} className="w-full h-full object-cover" unoptimized />
                            )}
                              </div>
                              <p className="text-sm text-zinc-300 line-clamp-1">{v.caption}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span style={{ backgroundColor: platCfg.bgColor, color: platCfg.fgColor, display: "inline-flex", alignItems: "center", gap: "3px", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: 500 }}>
                              <PlatformIcon platform={v.platform} className="w-2.5 h-2.5" />
                              {platCfg.label}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right"><span className="text-sm font-semibold text-zinc-200">{formatNumber(v.views)}</span></td>
                          <td className="px-4 py-3.5 text-right"><span className={`text-sm font-medium ${v.engagement_rate > 8 ? "text-emerald-400" : "text-zinc-400"}`}>{v.engagement_rate}%</span></td>
                          <td className="px-4 py-3.5"><span className="text-xs text-zinc-400">{v.content_format?.replace("_", " ") ?? "—"}</span></td>
                          <td className="px-4 py-3.5"><span className="text-xs text-zinc-500">{timeAgo(v.posted_at)}</span></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── CREATORS ────────────────────────────────────── */}
            {activeTab === "Creators" && (
              <div className="rounded-xl border border-white/[0.06] bg-[#111111] overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                  <h3 className="text-[15px] font-semibold text-white">Detected Creators ({compCreators.length})</h3>
                  <p className="text-xs text-zinc-500">Creators spotted working with {selected.name}</p>
                </div>
                <table className="w-full">
                  <thead><tr className="border-b border-white/[0.04]">
                    <th className="text-left px-5 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Creator</th>
                    <th className="text-right px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Videos</th>
                    <th className="text-right px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Avg Views</th>
                    <th className="text-left px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Last Post</th>
                    <th className="text-center px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Action</th>
                  </tr></thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {compCreators.map(c => {
                      const platCfg = PLATFORM_CONFIG[c.platform]
                      const isInactive = c.status === "inactive"
                      return (
                        <tr key={c.id} className={cn("hover:bg-white/[0.02] transition-colors", c.flagged_outreach && "bg-amber-500/5")}>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <Avatar className="w-8 h-8"><AvatarImage src={c.avatar_url ?? ""} /><AvatarFallback className="bg-purple-600/20 text-purple-400 text-xs font-bold">{c.creator_handle.slice(1,3).toUpperCase()}</AvatarFallback></Avatar>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <p className="text-sm font-medium text-zinc-200">{c.creator_handle}</p>
                                  {c.flagged_outreach && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                                </div>
                                <span style={{ color: platCfg.fgColor, fontSize: "10px", fontWeight: 500 }}>{platCfg.label}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-right"><span className="text-sm text-zinc-300">{c.videos_posted}</span></td>
                          <td className="px-4 py-3.5 text-right"><span className="text-sm font-medium text-zinc-200">{formatNumber(c.avg_views)}</span></td>
                          <td className="px-4 py-3.5"><span className="text-xs text-zinc-500">{timeAgo(c.last_seen_at)}</span></td>
                          <td className="px-4 py-3.5 text-center">
                            <span className={cn("px-2 py-0.5 rounded-full text-[11px] font-medium border", isInactive ? "bg-zinc-500/10 text-zinc-500 border-zinc-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20")}>
                              {isInactive ? "Inactive" : "Active"}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <button
                              onClick={() => toggleFlag(c.id)}
                              title={c.flagged_outreach ? "Remove flag" : "Flag for Outreach"}
                              className={cn("p-1.5 rounded-md transition-colors", c.flagged_outreach ? "text-amber-400 bg-amber-500/10 hover:bg-amber-500/20" : "text-zinc-600 hover:text-amber-400 hover:bg-amber-500/10")}
                            >
                              {c.flagged_outreach ? <StarOff className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5" />}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── VS. YOU ─────────────────────────────────────── */}
            {activeTab === "vs. You" && (
              <div className="space-y-4">
                {/* Comparison grid */}
                <div className="rounded-xl border border-white/[0.06] bg-[#111111] overflow-hidden">
                  <div className="grid grid-cols-3 border-b border-white/[0.06]">
                    <div className="px-5 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Metric</div>
                    <div className="px-5 py-3 text-center text-[11px] font-medium text-purple-400 uppercase tracking-wider">{selected.name}</div>
                    <div className="px-5 py-3 text-center text-[11px] font-medium text-emerald-400 uppercase tracking-wider">Your Workspace</div>
                  </div>
                  {[
                    { label: "Total Views",      comp: formatNumber(totalViews),    yours: "0", compWin: null as boolean | null },
                    { label: "Creator Count",    comp: String(compCreators.length), yours: "0", compWin: null },
                    { label: "Avg Views/Video",  comp: formatNumber(avgViews),       yours: "0", compWin: null },
                    { label: "Videos Tracked",   comp: String(compVideos.length),    yours: "0", compWin: null },
                    { label: "Top Format",       comp: formatPie[0]?.name ?? "—",   yours: "—", compWin: null },
                  ].map(row => (
                    <div key={row.label} className="grid grid-cols-3 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                      <div className="px-5 py-3.5 text-sm text-zinc-400">{row.label}</div>
                      <div className="px-5 py-3.5 text-center">
                        <span className={cn("text-sm font-semibold", row.compWin === true ? "text-red-400" : row.compWin === false ? "text-emerald-400" : "text-zinc-300")}>
                          {String(row.comp)}
                          {row.compWin === true && <ArrowUpRight className="w-3 h-3 inline ml-0.5" />}
                        </span>
                      </div>
                      <div className="px-5 py-3.5 text-center">
                        <span className={cn("text-sm font-semibold", row.compWin === false ? "text-red-400" : row.compWin === true ? "text-emerald-400" : "text-zinc-300")}>
                          {String(row.yours)}
                          {row.compWin === false && <ArrowDownRight className="w-3 h-3 inline ml-0.5" />}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Overlaid chart */}
                <div className="rounded-xl border border-white/[0.06] bg-[#111111] p-5">
                  <h3 className="text-[15px] font-semibold text-white mb-4">Monthly View Trends — Head to Head</h3>
                  {weeklyData.length === 0 ? (
                    <p className="text-sm text-zinc-500 text-center py-16">Add competitor accounts to see comparison</p>
                  ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={weeklyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="week" tick={{ fill: "#52525b", fontSize: 10 }} tickLine={false} axisLine={false} interval={3} />
                      <YAxis tick={{ fill: "#52525b", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${(v/1000000).toFixed(1)}M`} />
                      <Tooltip content={<ChartTooltip />} />
                      <Line type="monotone" dataKey="competitor" stroke="#7C3AED" strokeWidth={2.5} dot={false} name={selected.name} />
                      <Line type="monotone" dataKey="yours" stroke="#10b981" strokeWidth={2.5} dot={false} strokeDasharray="5 3" name="Your workspace" />
                    </LineChart>
                  </ResponsiveContainer>
                  )}
                </div>
              </div>
            )}

            {/* ── AI REPORTS ──────────────────────────────────── */}
            {activeTab === "AI Reports" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-zinc-500">{compReports.length} report{compReports.length !== 1 ? "s" : ""} generated</p>
                  <button
                    onClick={handleGenerateReport}
                    disabled={generatingReport}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-70 text-white text-sm font-medium transition-all"
                  >
                    {generatingReport ? (
                      <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</>
                    ) : (
                      <><Sparkles className="w-3.5 h-3.5" /> Generate Fresh Report</>
                    )}
                  </button>
                </div>

                {compReports.map(report => (
                  <div key={report.id} className="rounded-xl border border-white/[0.06] bg-[#111111] overflow-hidden">
                    <div className="px-5 py-4 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-400" />
                          <h3 className="text-[15px] font-semibold text-white">Week of {formatDate(report.week_of)}</h3>
                          {report.id.includes("fresh") && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-600/20 text-purple-400 border border-purple-500/20">New</span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-2 max-w-lg">{report.summary?.slice(0, 120)}...</p>
                      </div>
                      <button
                        onClick={() => setExpandedReport(expandedReport === report.id ? null : report.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 text-sm font-medium transition-all border border-purple-500/20 flex-shrink-0"
                      >
                        {expandedReport === report.id ? <><X className="w-3.5 h-3.5" /> Close</> : <>Read Full Report</>}
                      </button>
                    </div>

                    {expandedReport === report.id && (
                      <div className="border-t border-white/[0.06] px-5 py-4 space-y-4">
                        <div>
                          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Summary</p>
                          <p className="text-sm text-zinc-300 leading-relaxed">{report.summary}</p>
                        </div>
                        {report.recommendations && report.recommendations.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Recommendations</p>
                            <div className="space-y-2">
                              {report.recommendations.map((rec, i) => (
                                <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-purple-600/5 border border-purple-500/10">
                                  <Check className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
                                  <p className="text-sm text-zinc-300">{rec}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Competitor Drawer */}
      <AddCompetitorDrawer
        open={showAddDrawer}
        onClose={() => setShowAddDrawer(false)}
        onAdd={(comp: Competitor) => {
          setCompetitors(prev => [comp, ...prev])
          setSelectedId(comp.id)
        }}
      />
    </div>
  )
}
