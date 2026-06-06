"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  X, Maximize2, Info, Flame, TrendingUp, Minus,
  Play, Heart, MessageCircle, Share2, Bookmark, Clock, Disc3, Calendar,
} from "lucide-react"
import {
  ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"
import { format } from "date-fns"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PlatformIcon, PLATFORM_CONFIG, formatNumber, viralityLabel } from "@/lib/platform"
import {
  fetchVideoDailyStats, fetchVideoById, extractHashtags, formatDuration,
} from "@/lib/analytics-queries"
import type { TrackedVideo, VideoDailyStat } from "@/types"

interface VideoDetailDrawerProps {
  video: TrackedVideo | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface MetricCardProps {
  icon: React.ElementType
  label: string
  value: string
  tooltip: string
}

function MetricCard({ icon: Icon, label, value, tooltip }: MetricCardProps) {
  return (
    <div className="rounded-lg bg-white/[0.03] border border-white/[0.05] p-3">
      <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-[10px] font-medium uppercase tracking-wide">{label}</span>
        <span title={tooltip}><Info className="w-2.5 h-2.5 cursor-help" /></span>
      </div>
      <p className="text-lg font-bold text-white">{value}</p>
    </div>
  )
}

export function VideoDetailDrawer({ video, open, onOpenChange }: VideoDetailDrawerProps) {
  const [dailyStats, setDailyStats] = useState<VideoDailyStat[]>([])
  const [accountInfo, setAccountInfo] = useState<{ username: string; display_name: string | null; avatar_url: string | null } | null>(null)
  const [loadingStats, setLoadingStats] = useState(false)
  const [showViews, setShowViews] = useState(true)
  const [showLikes, setShowLikes] = useState(true)
  const [showComments, setShowComments] = useState(true)

  useEffect(() => {
    if (!video?.id || !open) return
    setLoadingStats(true)
    Promise.all([
      fetchVideoDailyStats(video.id),
      fetchVideoById(video.id),
    ]).then(([stats, full]) => {
      setDailyStats(stats)
      if (full?.account) {
        setAccountInfo({
          username: full.account.username,
          display_name: full.account.display_name,
          avatar_url: full.account.avatar_url,
        })
      }
    }).finally(() => setLoadingStats(false))
  }, [video?.id, open])

  if (!video) return null

  const cfg = PLATFORM_CONFIG[video.platform]
  const vl = viralityLabel(video.virality_score)
  const hashtags = extractHashtags(video.caption)
  const chartData = dailyStats.map((d) => ({
    date: format(new Date(d.date), "MMM d"),
    views: d.views,
    likes: d.likes,
    comments: d.comments,
  }))

  const ViralityIcon = video.virality_score >= 7.5 ? Flame : video.virality_score >= 4.5 ? TrendingUp : Minus

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full sm:max-w-[560px] bg-[#111111] border-l border-white/[0.08] p-0 flex flex-col gap-0"
      >
        <SheetHeader className="px-5 pt-4 pb-3 border-b border-white/[0.06] flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Link
                href={`/analytics/videos/${video.id}`}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-zinc-400 border border-white/[0.08] hover:text-white"
              >
                <Maximize2 className="w-3.5 h-3.5" /> Full Page
              </Link>
              <a
                href={video.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-zinc-400 border border-white/[0.08] hover:text-white"
              >
                <PlatformIcon platform={video.platform} className="w-3.5 h-3.5" />
                {cfg.label} ↗
              </a>
            </div>
            <button onClick={() => onOpenChange(false)} className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06]">
              <X className="w-4 h-4" />
            </button>
          </div>
          <SheetTitle className="text-sm font-medium text-zinc-200 leading-snug pt-2 pr-2 text-left">
            {video.caption ?? "Untitled video"}
          </SheetTitle>
          <p className="text-xs text-zinc-500 text-left">{cfg.label} video by @{accountInfo?.username ?? "unknown"}</p>
          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-2">
              {hashtags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] bg-white/[0.06] text-zinc-400 border border-white/[0.06]">{tag}</span>
              ))}
            </div>
          )}
          {video.posted_at && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 pt-1">
              <Calendar className="w-3.5 h-3.5" />
              {format(new Date(video.posted_at), "MMM d, yyyy, h:mm a")}
            </div>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {video.thumbnail_url && (
            <div className="rounded-xl overflow-hidden border border-white/[0.06] aspect-video bg-white/[0.03]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={video.thumbnail_url} alt="" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <MetricCard icon={Play} label="Views" value={formatNumber(video.views)} tooltip="Total view count" />
            <MetricCard icon={Heart} label="Likes" value={formatNumber(video.likes)} tooltip="Total likes" />
            <MetricCard icon={MessageCircle} label="Comments" value={formatNumber(video.comments)} tooltip="Total comments" />
            <MetricCard icon={TrendingUp} label="Engagement" value={`${video.engagement_rate.toFixed(2)}%`} tooltip="likes + comments / views × 100" />
            <MetricCard icon={Share2} label="Shares" value={video.platform === "instagram" ? "N/A" : formatNumber(video.shares)} tooltip="Total shares" />
            <MetricCard icon={Bookmark} label="Bookmarks" value={formatNumber(video.saves)} tooltip="Total bookmarks/saves" />
            <MetricCard icon={Flame} label="Virality" value={video.virality_score.toFixed(2)} tooltip="Virality score 0-10" />
            <MetricCard icon={Clock} label="Duration" value={formatDuration(video.duration_seconds)} tooltip="Video length" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Metrics</p>
              <div className="flex gap-1 flex-wrap">
                {showViews && <button onClick={() => setShowViews(false)} className="px-2 py-0.5 rounded-full text-[10px] bg-orange-500/15 text-orange-400 border border-orange-500/25">Views ×</button>}
                {showLikes && <button onClick={() => setShowLikes(false)} className="px-2 py-0.5 rounded-full text-[10px] bg-blue-500/15 text-blue-400 border border-blue-500/25">Likes ×</button>}
                {showComments && <button onClick={() => setShowComments(false)} className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/25">Comments ×</button>}
                <button className="px-2 py-0.5 rounded-full text-[10px] text-zinc-500 border border-white/[0.08]">+ Add</button>
              </div>
            </div>
            {loadingStats ? (
              <p className="text-xs text-zinc-500 py-8 text-center">Loading chart…</p>
            ) : chartData.length === 0 ? (
              <p className="text-xs text-zinc-500 py-8 text-center border border-dashed border-white/[0.08] rounded-xl">Syncing data… Daily stats will appear after the next sync.</p>
            ) : (
              <div className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-2">
                <ResponsiveContainer width="100%" height={180}>
                  <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 10 }} />
                    {showViews && <YAxis yAxisId="left" tick={{ fill: "#71717a", fontSize: 10 }} />}
                    {(showLikes || showComments) && <YAxis yAxisId="right" orientation="right" tick={{ fill: "#71717a", fontSize: 10 }} />}
                    <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11 }} />
                    {showViews && <Area yAxisId="left" type="monotone" dataKey="views" fill="#f97316" fillOpacity={0.15} stroke="#f97316" strokeWidth={2} />}
                    {showLikes && <Bar yAxisId="right" dataKey="likes" fill="#3b82f6" barSize={8} radius={[2, 2, 0, 0]} />}
                    {showComments && <Bar yAxisId="right" dataKey="comments" fill="#eab308" barSize={8} radius={[2, 2, 0, 0]} />}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {accountInfo && (
            <div>
              <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-2">Account</p>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                <Avatar className="w-9 h-9">
                  <AvatarImage src={accountInfo.avatar_url ?? undefined} />
                  <AvatarFallback>{accountInfo.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-white">@{accountInfo.username}</p>
                  <p className="text-xs text-zinc-500">{accountInfo.display_name}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-2">Music</p>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.05]">
              <Disc3 className="w-5 h-5 text-zinc-500" />
              <div>
                <p className="text-sm text-white">{video.audio_name ?? "Original Sound"}</p>
                <p className="text-xs text-zinc-500">{video.audio_name ? "Track" : "Platform audio"}</p>
              </div>
            </div>
          </div>

          <div className={`flex items-center gap-3 p-3 rounded-xl border ${vl.className}`}>
            <ViralityIcon className="w-5 h-5" />
            <div>
              <p className="text-sm font-semibold">Virality: {video.virality_score.toFixed(1)}/10 — {vl.label}</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
