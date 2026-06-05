"use client"

import { useState } from "react"
import Link from "next/link"
import {
  AtSign, FolderOpen, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  ChevronDown, X, Video, ImageIcon, Info, Download, Settings, SlidersHorizontal,
  Link2, FileText,
} from "lucide-react"
import { format, subDays, addDays } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { PlatformIcon, PLATFORM_CONFIG } from "@/lib/platform"
import type { Platform, TrackedAccount } from "@/types"
import type { AnalyticsFilters } from "@/lib/analytics-queries"

const ALL_PLATFORMS: Platform[] = ["tiktok", "instagram", "youtube", "facebook"]

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
  label?: string
}

export function DateRangePicker({ from, to, onChange, label = "Last 30 days" }: DateRangePickerProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-300 hover:border-white/15 transition-colors"
      >
        <span>{label}</span>
        <span className="text-[10px] text-zinc-600 uppercase">UTC</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            const n = defaultRange()
            onChange(n.from, n.to)
          }}
          className="p-0.5 hover:text-white text-zinc-600"
        >
          <X className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onChange(subDays(from, 30), subDays(to, 30)) }}
          className="p-0.5 hover:text-white text-zinc-600"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onChange(addDays(from, 30), addDays(to, 30)) }}
          className="p-0.5 hover:text-white text-zinc-600"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto bg-[#1a1a1a] border-white/10 p-0" align="start">
        <Calendar
          mode="range"
          selected={{ from, to }}
          onSelect={(range) => {
            if (range?.from && range?.to) {
              onChange(range.from, range.to)
              setOpen(false)
            }
          }}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  )
}

function defaultRange() {
  const to = new Date()
  const from = subDays(to, 30)
  return { from, to }
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
