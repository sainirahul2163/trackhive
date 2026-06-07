"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import {
  ComposedChart, Area, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts"
import {
  SlidersHorizontal, Search, AreaChart, LineChart, BarChart2, Save, X,
} from "lucide-react"
import { formatNumber } from "@/lib/platform"
import {
  buildCombinedChartData,
  METRIC_CHART_COLORS,
  METRIC_CHART_LABELS,
  type AnalyticsFilters,
  type ChartMetricId,
  type ChartAggregation,
  type ChartMode,
  type ChartStyle,
  type CombinedChartRow,
} from "@/lib/analytics-queries"

const STORAGE_KEY = "trackhive-metrics-chart-v1"

const DEFAULT_METRICS: ChartMetricId[] = ["views", "posted_videos"]

interface ChartSettings {
  activeMetrics: ChartMetricId[]
  style: ChartStyle
  aggregation: ChartAggregation
  mode: ChartMode
}

const DEFAULT_SETTINGS: ChartSettings = {
  activeMetrics: DEFAULT_METRICS,
  style: "area",
  aggregation: "day",
  mode: "discrete",
}

const ADDABLE_METRICS: { id: ChartMetricId; category: "account" | "video" }[] = [
  { id: "active_accounts", category: "account" },
  { id: "likes", category: "video" },
  { id: "comments", category: "video" },
  { id: "shares", category: "video" },
  { id: "engagement_rate", category: "video" },
  { id: "views", category: "video" },
  { id: "posted_videos", category: "video" },
]

type ChartRow = CombinedChartRow

interface MetricsChartProps {
  filters: AnalyticsFilters
  accountIds: string[]
}

function loadSettings(): ChartSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw) as ChartSettings
    if (!parsed.activeMetrics?.length) return DEFAULT_SETTINGS
    return { ...DEFAULT_SETTINGS, ...parsed }
  } catch {
    return DEFAULT_SETTINGS
  }
}

const SMALL_METRICS: ChartMetricId[] = [
  "likes",
  "comments",
  "shares",
  "engagement_rate",
  "active_accounts",
]

function formatMetricValue(metric: ChartMetricId, value: number): string {
  if (metric === "engagement_rate") return `${value.toFixed(1)}%`
  return formatNumber(value)
}

function formatAxisTick(v: number): string {
  return formatNumber(v)
}

interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{ dataKey: string; value: number; color: string }>
  label?: string
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  const dateLabel = label ?? ""
  return (
    <div
      style={{
        backgroundColor: "#1a1a1a",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 10,
        padding: "12px 14px",
        minWidth: 180,
      }}
    >
      <p style={{ fontSize: 12, fontWeight: 600, color: "#fafafa", marginBottom: 10 }}>
        {dateLabel}
        <span style={{ marginLeft: 8, fontSize: 10, color: "#71717a", fontWeight: 400 }}>UTC</span>
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {payload.map((entry) => {
          const metric = entry.dataKey as ChartMetricId
          const color = METRIC_CHART_COLORS[metric] ?? entry.color
          return (
            <div key={entry.dataKey} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: color, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: "#a1a1aa" }}>{METRIC_CHART_LABELS[metric]}</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#fafafa" }}>
                {formatMetricValue(metric, entry.value ?? 0)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ToggleGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div style={{ display: "flex", gap: 4, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 8, padding: 3 }}>
      {options.map((opt) => {
        const active = value === opt.id
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            style={{
              flex: 1,
              padding: "6px 10px",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: active ? 600 : 400,
              color: active ? "#fafafa" : "#71717a",
              backgroundColor: active ? "rgba(124,58,237,0.25)" : "transparent",
              border: "none",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export function MetricsChart({ filters, accountIds }: MetricsChartProps) {
  const [settings, setSettings] = useState<ChartSettings>(DEFAULT_SETTINGS)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [chartData, setChartData] = useState<ChartRow[]>([])
  const [loading, setLoading] = useState(true)
  const addRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSettings(loadSettings())
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    buildCombinedChartData(
      filters,
      accountIds,
      settings.activeMetrics,
      settings.aggregation,
      settings.mode,
    )
      .then((rows) => { if (!cancelled) setChartData(rows) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [filters, accountIds, settings.activeMetrics, settings.aggregation, settings.mode])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (addRef.current && !addRef.current.contains(e.target as Node)) {
        setAddOpen(false)
      }
    }
    if (addOpen) document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [addOpen])

  const saveSettings = useCallback((next: ChartSettings) => {
    setSettings(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }, [])

  const removeMetric = useCallback((metric: ChartMetricId) => {
    const next = settings.activeMetrics.filter((m) => m !== metric)
    if (next.length === 0) return
    saveSettings({ ...settings, activeMetrics: next })
  }, [settings, saveSettings])

  const toggleMetric = useCallback((metric: ChartMetricId) => {
    const active = settings.activeMetrics.includes(metric)
    const next = active
      ? settings.activeMetrics.filter((m) => m !== metric)
      : [...settings.activeMetrics, metric]
    if (next.length === 0) return
    saveSettings({ ...settings, activeMetrics: next })
    setAddOpen(false)
  }, [settings, saveSettings])

  const resetSettings = useCallback(() => {
    saveSettings(DEFAULT_SETTINGS)
  }, [saveSettings])

  const filteredAddable = useMemo(() => {
    const q = search.toLowerCase()
    return ADDABLE_METRICS.filter((m) =>
      METRIC_CHART_LABELS[m.id].toLowerCase().includes(q),
    )
  }, [search])

  const leftMetrics = settings.activeMetrics.filter((m) => m !== "posted_videos")
  const hasRightAxis = settings.activeMetrics.includes("posted_videos")
  const hasViews = settings.activeMetrics.includes("views")
  const smallMetrics = leftMetrics.filter((m) => SMALL_METRICS.includes(m))
  const useSecondaryAxis = hasViews && smallMetrics.length > 0

  const leftDomain = useMemo((): [number, number] => {
    if (!chartData.length || !leftMetrics.length) return [0, 10]
    if (useSecondaryAxis) {
      const maxViews = Math.max(...chartData.map((r) => Number(r.views ?? 0)))
      return maxViews > 0 ? [0, Math.ceil(maxViews * 1.1)] : [0, 10]
    }
    const max = Math.max(
      ...chartData.flatMap((r) => leftMetrics.map((m) => Number(r[m] ?? 0))),
      0,
    )
    return max > 0 ? [0, Math.ceil(max * 1.1)] : [0, 10]
  }, [chartData, leftMetrics, useSecondaryAxis])

  const left2Domain = useMemo((): [number, number] => {
    if (!useSecondaryAxis || !chartData.length) return [0, 10]
    const max = Math.max(
      ...chartData.flatMap((r) => smallMetrics.map((m) => Number(r[m] ?? 0))),
      0,
    )
    return max > 0 ? [0, Math.ceil(max * 1.2)] : [0, 10]
  }, [chartData, smallMetrics, useSecondaryAxis])

  function yAxisIdForMetric(metric: ChartMetricId): "left" | "left2" {
    if (useSecondaryAxis && SMALL_METRICS.includes(metric)) return "left2"
    return "left"
  }

  function renderLeftMetric(metric: ChartMetricId) {
    const color = METRIC_CHART_COLORS[metric]
    const axisId = yAxisIdForMetric(metric)
    const common = {
      key: metric,
      dataKey: metric,
      yAxisId: axisId,
      isAnimationActive: true,
      animationDuration: 400,
      connectNulls: true,
    }
    if (settings.style === "bar") {
      return (
        <Bar
          {...common}
          fill={color}
          barSize={8}
          radius={[2, 2, 0, 0]}
          fillOpacity={0.85}
        />
      )
    }
    if (settings.style === "line") {
      return (
        <Line
          {...common}
          type="monotone"
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: color }}
        />
      )
    }
    return (
      <Area
        {...common}
        type="monotone"
        stroke={color}
        strokeWidth={2}
        fill={color}
        fillOpacity={0.12}
        activeDot={{ r: 4, fill: color }}
      />
    )
  }

  return (
    <div
      className="rounded-xl border border-white/[0.06] bg-[#111111] overflow-hidden"
      style={{ position: "relative" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap flex-1">
          <span className="text-sm font-medium text-white mr-1">Metrics</span>
          {settings.activeMetrics.map((metric) => {
            const color = METRIC_CHART_COLORS[metric]
            return (
              <button
                key={metric}
                type="button"
                onClick={() => removeMetric(metric)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "4px 10px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 500,
                  color,
                  backgroundColor: `${color}22`,
                  border: `1px solid ${color}44`,
                  cursor: "pointer",
                }}
              >
                {METRIC_CHART_LABELS[metric]}
                <X style={{ width: 12, height: 12, opacity: 0.7 }} />
              </button>
            )
          })}
          <div ref={addRef} style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setAddOpen((v) => !v)}
              className="px-2 py-1 rounded-full text-xs text-zinc-500 border border-white/[0.08] hover:text-zinc-300 hover:border-white/15 transition-colors"
            >
              + Add
            </button>
            {addOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  left: 0,
                  zIndex: 50,
                  width: 260,
                  backgroundColor: "#1a1a1a",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  padding: 12,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 10px",
                    borderRadius: 8,
                    backgroundColor: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    marginBottom: 10,
                  }}
                >
                  <Search style={{ width: 14, height: 14, color: "#71717a", flexShrink: 0 }} />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search metrics..."
                    style={{
                      flex: 1,
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      fontSize: 12,
                      color: "#e4e4e7",
                    }}
                  />
                </div>
                {(["account", "video"] as const).map((cat) => {
                  const items = filteredAddable.filter((m) => m.category === cat)
                  if (!items.length) return null
                  return (
                    <div key={cat} style={{ marginBottom: 8 }}>
                      <p style={{ fontSize: 10, fontWeight: 600, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6, paddingLeft: 4 }}>
                        {cat === "account" ? "Account Metrics" : "Video Metrics"}
                      </p>
                      {items.map(({ id }) => {
                        const active = settings.activeMetrics.includes(id)
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => toggleMetric(id)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              width: "100%",
                              padding: "7px 8px",
                              borderRadius: 6,
                              border: "none",
                              cursor: "pointer",
                              backgroundColor: active ? "rgba(124,58,237,0.12)" : "transparent",
                              textAlign: "left",
                            }}
                            onMouseEnter={(e) => {
                              if (!active) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)"
                            }}
                            onMouseLeave={(e) => {
                              if (!active) e.currentTarget.style.backgroundColor = active ? "rgba(124,58,237,0.12)" : "transparent"
                            }}
                          >
                            <span style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: METRIC_CHART_COLORS[id], flexShrink: 0 }} />
                            <span style={{ fontSize: 13, color: active ? "#fafafa" : "#a1a1aa" }}>
                              {METRIC_CHART_LABELS[id]}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setSettingsOpen((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-zinc-400 border border-white/[0.08] hover:text-white transition-colors"
          style={settingsOpen ? { borderColor: "rgba(124,58,237,0.4)", color: "#fafafa" } : undefined}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Settings
        </button>
      </div>

      {/* Chart + settings panel */}
      <div style={{ display: "flex", position: "relative" }}>
        <div style={{ flex: 1, padding: "0 16px 16px", minWidth: 0, transition: "margin-right 0.25s ease" }}>
          {loading ? (
            <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 13, color: "#71717a" }}>Loading chart…</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart
                data={chartData}
                margin={{ top: 4, right: 8, left: useSecondaryAxis ? 4 : 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#71717a", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                {leftMetrics.length > 0 && (
                  <YAxis
                    yAxisId="left"
                    domain={leftDomain}
                    tick={{ fill: "#71717a", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={48}
                    tickFormatter={formatAxisTick}
                  />
                )}
                {useSecondaryAxis && (
                  <YAxis
                    yAxisId="left2"
                    orientation="left"
                    domain={left2Domain}
                    tick={{ fill: "#666666", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={45}
                    tickFormatter={formatAxisTick}
                  />
                )}
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 10]}
                  allowDecimals={false}
                  tick={{ fill: "#71717a", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip content={<ChartTooltip />} />
                {leftMetrics.map((m) => renderLeftMetric(m))}
                {hasRightAxis && (
                  <Bar
                    key="posted_videos"
                    yAxisId="right"
                    dataKey="posted_videos"
                    fill={METRIC_CHART_COLORS.posted_videos}
                    barSize={10}
                    radius={[2, 2, 0, 0]}
                    fillOpacity={0.9}
                    isAnimationActive
                    animationDuration={400}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Settings panel */}
        <div
          style={{
            width: settingsOpen ? 220 : 0,
            overflow: "hidden",
            transition: "width 0.25s ease",
            flexShrink: 0,
            borderLeft: settingsOpen ? "1px solid rgba(255,255,255,0.06)" : "none",
          }}
        >
          <div style={{ width: 220, padding: "12px 14px 16px" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#71717a", marginBottom: 8 }}>Style</p>
            <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
              {([
                { id: "area" as ChartStyle, icon: AreaChart, label: "Area" },
                { id: "line" as ChartStyle, icon: LineChart, label: "Line" },
                { id: "bar" as ChartStyle, icon: BarChart2, label: "Bar" },
              ]).map(({ id, icon: Icon, label }) => {
                const active = settings.style === id
                return (
                  <button
                    key={id}
                    type="button"
                    title={label}
                    onClick={() => saveSettings({ ...settings, style: id })}
                    style={{
                      flex: 1,
                      height: 36,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 8,
                      border: active ? "1px solid rgba(124,58,237,0.5)" : "1px solid rgba(255,255,255,0.08)",
                      backgroundColor: active ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.03)",
                      cursor: "pointer",
                      color: active ? "#a855f7" : "#71717a",
                    }}
                  >
                    <Icon style={{ width: 16, height: 16 }} />
                  </button>
                )
              })}
            </div>

            <p style={{ fontSize: 11, fontWeight: 600, color: "#71717a", marginBottom: 8 }}>Aggregation</p>
            <ToggleGroup
              options={[
                { id: "day", label: "Day" },
                { id: "week", label: "Week" },
                { id: "month", label: "Month" },
              ]}
              value={settings.aggregation}
              onChange={(v) => saveSettings({ ...settings, aggregation: v })}
            />

            <p style={{ fontSize: 11, fontWeight: 600, color: "#71717a", margin: "16px 0 8px" }}>Mode</p>
            <ToggleGroup
              options={[
                { id: "discrete", label: "Discrete" },
                { id: "cumulative", label: "Cumulative" },
              ]}
              value={settings.mode}
              onChange={(v) => saveSettings({ ...settings, mode: v })}
            />

            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <button
                type="button"
                onClick={resetSettings}
                style={{
                  flex: 1,
                  padding: "7px 0",
                  borderRadius: 7,
                  fontSize: 12,
                  color: "#71717a",
                  backgroundColor: "transparent",
                  border: "1px solid rgba(255,255,255,0.08)",
                  cursor: "pointer",
                }}
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  padding: "7px 0",
                  borderRadius: 7,
                  fontSize: 11,
                  fontWeight: 500,
                  color: "#fafafa",
                  backgroundColor: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  cursor: "pointer",
                }}
              >
                <Save style={{ width: 12, height: 12 }} />
                Save in Browser
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
