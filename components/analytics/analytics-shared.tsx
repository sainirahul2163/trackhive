"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import {
  AtSign, FolderOpen, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  ChevronDown, CalendarDays, Video, ImageIcon, Info, Download, Settings, SlidersHorizontal,
  Link2, FileText,
} from "lucide-react"
import {
  format, subDays, startOfDay, startOfMonth, endOfMonth, subMonths, isSameDay, isAfter,
} from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { PlatformIcon, PLATFORM_CONFIG } from "@/lib/platform"
import type { Platform, TrackedAccount } from "@/types"
import type { AnalyticsFilters } from "@/lib/analytics-queries"

const ALL_PLATFORMS: Platform[] = ["tiktok", "instagram", "youtube", "facebook"]

const DATE_PRESETS = [
  { id: "today",     label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "last7",     label: "Last 7 days" },
  { id: "last30",    label: "Last 30 days" },
  { id: "last90",    label: "Last 90 days" },
  { id: "thisMonth", label: "This month" },
  { id: "lastMonth", label: "Last month" },
] as const

type DatePresetId = typeof DATE_PRESETS[number]["id"]

function getPresetRange(preset: DatePresetId): { from: Date; to: Date } {
  const today = startOfDay(new Date())
  switch (preset) {
    case "today":
      return { from: today, to: today }
    case "yesterday": {
      const y = subDays(today, 1)
      return { from: y, to: y }
    }
    case "last7":
      return { from: subDays(today, 6), to: today }
    case "last30":
      return { from: subDays(today, 29), to: today }
    case "last90":
      return { from: subDays(today, 89), to: today }
    case "thisMonth":
      return { from: startOfMonth(today), to: today }
    case "lastMonth": {
      const prev = subMonths(today, 1)
      return { from: startOfMonth(prev), to: endOfMonth(prev) }
    }
  }
}

export function defaultDateRange(): { from: Date; to: Date } {
  return getPresetRange("last30")
}

function formatRangeShort(from: Date, to: Date): string {
  if (from.getFullYear() === to.getFullYear()) {
    return `${format(from, "MMM d")} – ${format(to, "MMM d")}`
  }
  return `${format(from, "MMM d")} – ${format(to, "MMM d, yyyy")}`
}

function formatRangeFull(from: Date, to: Date): string {
  if (from.getFullYear() === to.getFullYear()) {
    return `${format(from, "MMM d")} – ${format(to, "MMM d, yyyy")}`
  }
  return `${format(from, "MMM d, yyyy")} – ${format(to, "MMM d, yyyy")}`
}

export function getDateRangeLabel(from: Date, to: Date): string {
  for (const preset of DATE_PRESETS) {
    const range = getPresetRange(preset.id)
    if (isSameDay(from, range.from) && isSameDay(to, range.to)) {
      return preset.label
    }
  }
  return formatRangeShort(from, to)
}

function detectPreset(from: Date, to: Date): DatePresetId | null {
  for (const preset of DATE_PRESETS) {
    const range = getPresetRange(preset.id)
    if (isSameDay(from, range.from) && isSameDay(to, range.to)) {
      return preset.id
    }
  }
  return null
}

function endOfToday(): Date {
  const d = new Date()
  d.setHours(23, 59, 59, 999)
  return d
}

function isFutureDate(date: Date): boolean {
  return isAfter(startOfDay(date), startOfDay(new Date()))
}

const RANGE_PICKER_CALENDAR_CLASSNAMES = {
  cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
  day: "h-9 w-9 p-0 font-normal rounded-md text-zinc-300",
  day_today: "text-white border border-white/40 bg-transparent",
  day_outside: "day-outside text-zinc-600 opacity-50",
  day_disabled: "text-zinc-600 opacity-30 cursor-not-allowed pointer-events-none hover:bg-transparent hover:text-zinc-600",
} as const

/** v8 styles range/selected days via modifiersStyles — not classNames.day_range_* */
const RANGE_PICKER_MODIFIERS_STYLES = {
  selected: {
    backgroundColor: "#7C3AED",
    color: "#ffffff",
    borderRadius: "50%",
  },
  range_start: {
    backgroundColor: "#7C3AED",
    color: "#ffffff",
    borderRadius: "50%",
  },
  range_end: {
    backgroundColor: "#7C3AED",
    color: "#ffffff",
    borderRadius: "50%",
  },
  range_middle: {
    backgroundColor: "rgba(124, 58, 237, 0.2)",
    color: "#ffffff",
    borderRadius: 0,
  },
  future: {
    opacity: 0.3,
    cursor: "not-allowed",
    pointerEvents: "none",
  },
} as const

const RANGE_PICKER_MODIFIERS_CLASSNAMES = {
  future: "hover:bg-transparent hover:text-zinc-600",
} as const

export function AnalyticsBreadcrumb({ section }: { section: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-zinc-500 mb-1">
      <Link href="/analytics/overview" className="hover:text-zinc-300 transition-colors">Analytics</Link>
      <span>/</span>
      <span className="text-zinc-300">{section}</span>
      <button className="ml-1 p-1 rounded hover:bg-white/[0.05] text-zinc-600 hover:text-zinc-400" title="Copy link">
        <Link2 className="w-3.5 h-3.5" />
      </button>
      <button className="p-1 rounded hover:bg-white/[0.05] text-zinc-600 hover:text-zinc-400" title="Documentation">
        <FileText className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

interface DateRangePickerProps {
  from: Date
  to: Date
  onChange: (from: Date, to: Date) => void
}

export function DateRangePicker({ from, to, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const [draftFrom, setDraftFrom] = useState(from)
  const [draftTo, setDraftTo] = useState(to)
  const [activePreset, setActivePreset] = useState<DatePresetId | null>("last30")

  const maxDate = useMemo(() => endOfToday(), [])
  const today = useMemo(() => startOfDay(new Date()), [])

  const startDate = useMemo(() => {
    if (!draftFrom) return undefined
    if (!draftTo) return startOfDay(draftFrom)
    return startOfDay(draftFrom <= draftTo ? draftFrom : draftTo)
  }, [draftFrom, draftTo])

  const endDate = useMemo(() => {
    if (!draftFrom) return undefined
    if (!draftTo) return startOfDay(draftFrom)
    return startOfDay(draftFrom <= draftTo ? draftTo : draftFrom)
  }, [draftFrom, draftTo])

  const rangeModifiers = useMemo(() => ({
    future: (date: Date) => isFutureDate(date),
  }), [])

  const triggerLabel = useMemo(() => getDateRangeLabel(from, to), [from, to])

  useEffect(() => {
    if (open) {
      setDraftFrom(from)
      setDraftTo(to)
      setActivePreset(detectPreset(from, to))
    }
  }, [open, from, to])

  function applyDraft() {
    if (!draftFrom || !draftTo) return
    let start = startOfDay(draftFrom <= draftTo ? draftFrom : draftTo)
    let end = startOfDay(draftFrom <= draftTo ? draftTo : draftFrom)
    if (isAfter(start, today)) start = today
    if (isAfter(end, today)) end = today
    onChange(start, end)
    setOpen(false)
  }

  function cancelDraft() {
    setDraftFrom(from)
    setDraftTo(to)
    setActivePreset(detectPreset(from, to))
    setOpen(false)
  }

  function handleRangeSelect(range: { from?: Date; to?: Date } | undefined) {
    if (!range?.from) return
    if (isFutureDate(range.from)) return
    if (range.to && isFutureDate(range.to)) return

    setDraftFrom(startOfDay(range.from))
    setDraftTo(range.to ? startOfDay(range.to) : startOfDay(range.from))
    setActivePreset(null)
  }

  function selectPreset(id: DatePresetId) {
    const range = getPresetRange(id)
    setDraftFrom(range.from)
    setDraftTo(range.to)
    setActivePreset(id)
  }

  const footerLabel = draftFrom && draftTo
    ? formatRangeFull(
        draftFrom <= draftTo ? draftFrom : draftTo,
        draftFrom <= draftTo ? draftTo : draftFrom,
      )
    : "Select a date range"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-300 hover:border-white/15 transition-colors min-w-[140px]"
      >
        <CalendarDays className="w-3.5 h-3.5 text-zinc-500" />
        <span className="truncate">{triggerLabel}</span>
        <ChevronDown className="w-3.5 h-3.5 ml-auto text-zinc-500" />
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 overflow-hidden"
        align="start"
        style={{ backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        <div style={{ display: "flex" }}>
          {/* Preset sidebar */}
          <div
            style={{
              width: "148px",
              flexShrink: 0,
              borderRight: "1px solid rgba(255,255,255,0.08)",
              padding: "12px 8px",
              display: "flex",
              flexDirection: "column",
              gap: "2px",
            }}
          >
            {DATE_PRESETS.map((preset) => {
              const selected = activePreset === preset.id
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => selectPreset(preset.id)}
                  style={{
                    textAlign: "left",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: selected ? 600 : 400,
                    color: selected ? "#fafafa" : "#a1a1aa",
                    backgroundColor: selected ? "rgba(124,58,237,0.15)" : "transparent",
                    border: "none",
                    cursor: "pointer",
                    transition: "background-color 0.15s, color 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!selected) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)"
                  }}
                  onMouseLeave={(e) => {
                    if (!selected) e.currentTarget.style.backgroundColor = "transparent"
                  }}
                >
                  {preset.label}
                </button>
              )
            })}
          </div>

          {/* Calendars + footer */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Calendar
              mode="range"
              selected={
                startDate && endDate
                  ? { from: startDate, to: endDate }
                  : undefined
              }
              onSelect={handleRangeSelect}
              numberOfMonths={2}
              defaultMonth={startDate ?? draftFrom}
              showOutsideDays={false}
              disabled={{ after: maxDate }}
              toDate={maxDate}
              modifiers={rangeModifiers}
              modifiersStyles={RANGE_PICKER_MODIFIERS_STYLES}
              modifiersClassNames={RANGE_PICKER_MODIFIERS_CLASSNAMES}
              classNames={RANGE_PICKER_CALENDAR_CLASSNAMES}
            />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                padding: "12px 16px",
                borderTop: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <span style={{ fontSize: "13px", color: "#e4e4e7", fontWeight: 500 }}>
                {footerLabel}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  type="button"
                  onClick={cancelDraft}
                  style={{
                    padding: "7px 14px",
                    borderRadius: "7px",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "#a1a1aa",
                    backgroundColor: "transparent",
                    border: "1px solid rgba(255,255,255,0.08)",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyDraft}
                  disabled={!draftFrom || !draftTo}
                  style={{
                    padding: "7px 16px",
                    borderRadius: "7px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#fff",
                    backgroundColor: "#7C3AED",
                    border: "none",
                    cursor: draftFrom && draftTo ? "pointer" : "not-allowed",
                    opacity: draftFrom && draftTo ? 1 : 0.5,
                    boxShadow: "0 0 16px rgba(124,58,237,0.25)",
                  }}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

interface AccountMultiSelectProps {
  accounts: TrackedAccount[]
  selected: string[]
  onChange: (ids: string[]) => void
}

export function AccountMultiSelect({ accounts, selected, onChange }: AccountMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const label = selected.length ? `${selected.length} account${selected.length > 1 ? "s" : ""}` : "Select accounts"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-400 hover:border-white/15 min-w-[160px]">
        <AtSign className="w-3.5 h-3.5" />
        <span>{label}</span>
        <ChevronDown className="w-3.5 h-3.5 ml-auto" />
      </PopoverTrigger>
      <PopoverContent className="w-64 bg-[#1a1a1a] border-white/10 p-2 max-h-64 overflow-y-auto" align="start">
        <button
          className="w-full text-left px-2 py-1.5 text-xs text-purple-400 hover:bg-white/[0.05] rounded"
          onClick={() => onChange([])}
        >
          All accounts
        </button>
        {accounts.map((a) => {
          const checked = selected.includes(a.id)
          return (
            <label key={a.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/[0.05] rounded cursor-pointer">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => {
                  onChange(checked ? selected.filter((id) => id !== a.id) : [...selected, a.id])
                }}
                className="accent-purple-600"
              />
              <PlatformIcon platform={a.platform} className="w-3.5 h-3.5" />
              <span className="text-sm text-zinc-300 truncate">@{a.username}</span>
            </label>
          )
        })}
      </PopoverContent>
    </Popover>
  )
}

export function ProjectsPlaceholder() {
  return (
    <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-500 cursor-not-allowed opacity-60">
      <FolderOpen className="w-3.5 h-3.5" />
      <span>Select projects</span>
      <ChevronDown className="w-3.5 h-3.5 ml-auto" />
    </button>
  )
}

interface PlatformTogglesProps {
  selected: Platform[]
  onChange: (platforms: Platform[]) => void
}

export function PlatformToggles({ selected, onChange }: PlatformTogglesProps) {
  return (
    <div className="flex items-center gap-1">
      {ALL_PLATFORMS.map((p) => {
        const active = selected.length === 0 || selected.includes(p)
        const cfg = PLATFORM_CONFIG[p]
        return (
          <button
            key={p}
            type="button"
            title={cfg.label}
            onClick={() => {
              if (selected.length === 0) onChange([p])
              else if (selected.includes(p)) {
                const next = selected.filter((x) => x !== p)
                onChange(next)
              } else onChange([...selected, p])
            }}
            className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
              active && selected.includes(p)
                ? "border-purple-500/40 bg-purple-600/15"
                : active
                ? "border-white/10 bg-white/[0.04]"
                : "border-white/[0.04] bg-transparent opacity-40"
            }`}
            style={{ color: cfg.fgColor }}
          >
            <PlatformIcon platform={p} className="w-4 h-4" />
          </button>
        )
      })}
    </div>
  )
}

interface ContentTypeTogglesProps {
  contentType: AnalyticsFilters["contentType"]
  onChange: (t: AnalyticsFilters["contentType"]) => void
}

export function ContentTypeToggles({ contentType, onChange }: ContentTypeTogglesProps) {
  return (
    <div className="flex items-center gap-1">
      {([
        { key: "video" as const, icon: Video, label: "Video" },
        { key: "image" as const, icon: ImageIcon, label: "Image" },
      ]).map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          type="button"
          title={label}
          onClick={() => onChange(contentType === key ? "all" : key)}
          className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
            contentType === key || contentType === "all"
              ? "border-white/10 bg-white/[0.04] text-zinc-300"
              : "border-white/[0.04] opacity-40 text-zinc-600"
          }`}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  )
}

export function InternalAccountsDropdown() {
  return (
    <select className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-300 outline-none">
      <option>Internal Accounts</option>
      <option>All Accounts</option>
    </select>
  )
}

export function InfoTooltip({ text }: { text: string }) {
  return (
    <span title={text} className="inline-flex">
      <Info className="w-3 h-3 text-zinc-600 cursor-help" />
    </span>
  )
}

interface PaginationProps {
  page: number
  pageSize: number
  total: number
  onPageChange: (p: number) => void
  onPageSizeChange: (s: number) => void
}

export function TablePagination({ page, pageSize, total, onPageChange, onPageSizeChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.04] text-sm text-zinc-500">
      <span>{total} item{total !== 1 ? "s" : ""}</span>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs">Items per page</span>
          <select
            value={pageSize}
            onChange={(e) => { onPageSizeChange(Number(e.target.value)); onPageChange(1) }}
            className="bg-white/[0.04] border border-white/[0.08] rounded px-2 py-1 text-xs text-zinc-300 outline-none"
          >
            {[10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <span className="text-xs">Page {page} of {totalPages}</span>
        <div className="flex items-center gap-1">
          {[
            { icon: ChevronsLeft, fn: () => onPageChange(1), disabled: page <= 1 },
            { icon: ChevronLeft, fn: () => onPageChange(page - 1), disabled: page <= 1 },
            { icon: ChevronRight, fn: () => onPageChange(page + 1), disabled: page >= totalPages },
            { icon: ChevronsRight, fn: () => onPageChange(totalPages), disabled: page >= totalPages },
          ].map(({ icon: Icon, fn, disabled }, i) => (
            <button
              key={i}
              onClick={fn}
              disabled={disabled}
              className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/[0.06] disabled:opacity-30 text-zinc-400"
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ExportCsvButton({ rows, filename }: { rows: string[][]; filename: string }) {
  return (
    <button
      type="button"
      title="Export CSV"
      onClick={() => {
        const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n")
        const blob = new Blob([csv], { type: "text/csv" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
      }}
      className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/[0.04] border border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/15"
    >
      <Download className="w-4 h-4" />
    </button>
  )
}

export function FilterIconButton() {
  return (
    <button className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/[0.04] border border-white/[0.08] text-zinc-400 hover:text-white">
      <SlidersHorizontal className="w-4 h-4" />
    </button>
  )
}

export function TableSettingsButton() {
  return (
    <button className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/[0.04] border border-white/[0.08] text-zinc-400 hover:text-white">
      <Settings className="w-4 h-4" />
    </button>
  )
}

export function PostActivitySparkline({ postsByDay }: { postsByDay?: Map<string, number> }) {
  const days: { label: string; count: number }[] = []
  const labels = ["W", "T", "F", "S", "S", "M", "T", "W", "T", "F"]
  for (let i = 9; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    days.push({ label: labels[9 - i], count: postsByDay?.get(key) ?? 0 })
  }
  const max = Math.max(...days.map((d) => d.count), 1)

  return (
    <div className="flex items-end gap-px h-4">
      {days.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-0.5">
          <div
            style={{
              width: 4,
              height: d.count > 0 ? Math.max(4, Math.round((d.count / max) * 16)) : 4,
              borderRadius: 1,
              backgroundColor: d.count > 0 ? "#f97316" : "rgba(255,255,255,0.08)",
            }}
          />
        </div>
      ))}
    </div>
  )
}

export function filtersFromState(
  accountIds: string[],
  platforms: Platform[],
  contentType: AnalyticsFilters["contentType"],
  from: Date,
  to: Date,
): AnalyticsFilters {
  return {
    accountIds,
    platforms: platforms.length === ALL_PLATFORMS.length ? [] : platforms,
    contentType,
    dateFrom: format(from, "yyyy-MM-dd"),
    dateTo: format(to, "yyyy-MM-dd"),
  }
}
