"use client"

import { useState } from "react"
import { X, ExternalLink, Copy, Bookmark, Plus, Check, Flame, TrendingUp, Minus } from "lucide-react"
import {
  AreaChart,
  Area,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { PlatformIcon, PLATFORM_CONFIG, formatNumber, viralityLabel } from "@/lib/platform"
import type { TrackedVideo } from "@/types"

interface VideoDetailDrawerProps {
  video: TrackedVideo | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function generateSparkline(baseViews: number, days = 14) {
  return Array.from({ length: days }, (_, i) => ({
    day: `Day ${i + 1}`,
    views: Math.floor(
      baseViews * (0.05 + Math.random() * 0.15) * Math.exp(-i * 0.08) + Math.random() * 10000
    ),
  }))
}

function formatDate(iso: string | null): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

interface SparkTooltipProps {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}

const SparkTooltip = ({ active, payload, label }: SparkTooltipProps) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#1a1a1a] border border-white/10 rounded px-2 py-1">
        <p className="text-[10px] text-zinc-500">{label}</p>
        <p className="text-xs font-semibold text-purple-400">
          {Number(payload[0]?.value).toLocaleString()}
        </p>
      </div>
    )
  }
  return null
}

const TAG_COLORS = [
  "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "bg-pink-500/10 text-pink-400 border-pink-500/20",
  "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
]

export function VideoDetailDrawer({ video, open, onOpenChange }: VideoDetailDrawerProps) {
  const [tags, setTags] = useState<string[]>([])
  const [addingTag, setAddingTag] = useState(false)
  const [newTag, setNewTag] = useState("")
  const [copied, setCopied] = useState(false)

  const sparkData = video ? generateSparkline(video.views) : []
  const vl = video ? viralityLabel(video.virality_score) : null
  const cfg = video ? PLATFORM_CONFIG[video.platform] : null
  const allTags = [...(video?.tags ?? []), ...tags]

  function handleCopyUrl() {
    if (!video) return
    navigator.clipboard.writeText(video.video_url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleAddTag() {
    const trimmed = newTag.trim().toLowerCase()
    if (trimmed && !allTags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed])
    }
    setNewTag("")
    setAddingTag(false)
  }

  if (!video || !cfg || !vl) return null

  const stats = [
    { label: "Views", value: formatNumber(video.views), color: "text-blue-400" },
    { label: "Likes", value: formatNumber(video.likes), color: "text-pink-400" },
    { label: "Comments", value: formatNumber(video.comments), color: "text-amber-400" },
    { label: "Shares", value: formatNumber(video.shares), color: "text-emerald-400" },
    { label: "Saves", value: formatNumber(video.saves), color: "text-purple-400" },
    { label: "Eng. Rate", value: `${video.engagement_rate.toFixed(1)}%`, color: "text-cyan-400" },
  ]

  const ViralityIcon =
    video.virality_score >= 7.5 ? Flame : video.virality_score >= 4.5 ? TrendingUp : Minus

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full sm:max-w-[500px] bg-[#111111] border-l border-white/[0.08] p-0 flex flex-col gap-0"
      >
        {/* Header */}
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-white/[0.06] flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${cfg.bg} ${cfg.textColor}`}>
                <PlatformIcon platform={video.platform} className="w-3 h-3" />
                {cfg.label}
              </span>
              <span className="text-xs text-zinc-500">{formatDate(video.posted_at)}</span>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <SheetTitle className="text-sm font-medium text-zinc-200 leading-snug pt-1 pr-2">
            {video.caption}
          </SheetTitle>
        </SheetHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Thumbnail */}
          {video.thumbnail_url && (
            <div className="px-5 pt-5">
              <div className="rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06] aspect-video">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={video.thumbnail_url}
                  alt={video.caption ?? ""}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          <div className="px-5 py-5 space-y-5">
            {/* Virality Score */}
            <div className={`flex items-center gap-3 p-4 rounded-xl border ${vl.className}`}>
              <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center">
                <ViralityIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">
                  Virality Score: {video.virality_score.toFixed(1)} / 10
                </p>
                <p className="text-xs opacity-75">
                  {vl.label === "Hot"
                    ? "This video is going viral 🔥"
                    : vl.label === "Rising"
                    ? "Gaining traction — worth boosting"
                    : "Steady performance — monitor trends"}
                </p>
              </div>
              <span className={`ml-auto text-lg font-bold`}>{vl.label}</span>
            </div>

            {/* Stats grid */}
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">Performance</p>
              <div className="grid grid-cols-3 gap-2">
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-lg bg-white/[0.03] border border-white/[0.05] p-3 text-center"
                  >
                    <p className={`text-base font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sparkline */}
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
                Views — Last 14 Days
              </p>
              <div className="rounded-xl bg-white/[0.02] border border-white/[0.05] px-3 pt-3 pb-1">
                <ResponsiveContainer width="100%" height={80}>
                  <AreaChart data={sparkData} margin={{ top: 2, right: 2, left: -30, bottom: 0 }}>
                    <defs>
                      <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Tooltip content={<SparkTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="views"
                      stroke="#7C3AED"
                      strokeWidth={1.5}
                      fill="url(#sparkGrad)"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Tags */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Tags</p>
                <button
                  onClick={() => setAddingTag(true)}
                  className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Add tag
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {allTags.map((tag, i) => (
                  <span
                    key={tag}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                      TAG_COLORS[i % TAG_COLORS.length]
                    }`}
                  >
                    {tag}
                  </span>
                ))}
                {addingTag && (
                  <input
                    autoFocus
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddTag()
                      if (e.key === "Escape") { setAddingTag(false); setNewTag("") }
                    }}
                    onBlur={handleAddTag}
                    placeholder="type + enter"
                    className="px-2.5 py-1 rounded-full text-xs bg-white/[0.05] border border-purple-500/30 text-zinc-200 placeholder:text-zinc-600 outline-none w-28"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="px-5 py-4 border-t border-white/[0.06] flex gap-2 flex-shrink-0">
          <a
            href={video.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-zinc-300 hover:text-white hover:border-white/10 text-sm font-medium transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open on {cfg.label}
          </a>
          <button
            onClick={handleCopyUrl}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-zinc-300 hover:text-white hover:border-white/10 text-sm font-medium transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy URL"}
          </button>
          <button className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-all active:scale-[0.98]">
            <Bookmark className="w-3.5 h-3.5" />
            Save
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
