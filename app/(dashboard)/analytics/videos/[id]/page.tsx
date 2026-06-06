"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ExternalLink, Calendar, Disc3 } from "lucide-react"
import {
  ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PLATFORM_CONFIG, formatNumber } from "@/lib/platform"
import {
  fetchVideoById, fetchVideoDailyStats, extractHashtags, formatDuration,
} from "@/lib/analytics-queries"
import type { VideoDailyStat } from "@/types"
import type { VideoWithAccount } from "@/lib/analytics-queries"

export default function VideoFullPage() {
  const params = useParams()
  const id = params.id as string
  const [video, setVideo] = useState<VideoWithAccount | null>(null)
  const [stats, setStats] = useState<VideoDailyStat[]>([])
  const [showViews, setShowViews] = useState(true)
  const [showLikes, setShowLikes] = useState(true)
  const [showComments, setShowComments] = useState(true)

  useEffect(() => {
    if (!id) return
    fetchVideoById(id).then(setVideo)
    fetchVideoDailyStats(id).then(setStats)
  }, [id])

  if (!video) {
    return <div className="p-8 text-zinc-500 text-sm">Loading video…</div>
  }

  const cfg = PLATFORM_CONFIG[video.platform]
  const chartData = stats.map((d) => ({
    date: format(new Date(d.date), "MMM d"),
    views: d.views,
    likes: d.likes,
    comments: d.comments,
  }))
  const hashtags = extractHashtags(video.caption)

  return (
    <div className="max-w-5xl space-y-6">
      <Link href="/analytics/videos" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300">
        <ArrowLeft className="w-4 h-4" /> Back to Videos
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-white/[0.06] bg-[#111111] p-4 flex items-center justify-center min-h-[400px]">
          {video.thumbnail_url ? (
            <Image
              src={video.thumbnail_url}
              alt=""
              width={500}
              height={500}
              className="max-h-[500px] rounded-lg object-contain w-auto h-auto"
              unoptimized
            />
          ) : (
            <a href={video.video_url} target="_blank" rel="noopener noreferrer" className="text-sm text-purple-400 flex items-center gap-2">
              <ExternalLink className="w-4 h-4" /> View post on {cfg.label}
            </a>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-base font-medium text-white leading-snug">{video.caption}</p>
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {hashtags.map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded-full text-xs bg-white/[0.06] text-zinc-400">{t}</span>
                ))}
              </div>
            )}
            {video.posted_at && (
              <p className="flex items-center gap-1.5 text-xs text-zinc-500 mt-2">
                <Calendar className="w-3.5 h-3.5" />
                {format(new Date(video.posted_at), "MMM d, yyyy, h:mm a")}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            {[
              ["Views", formatNumber(video.views)],
              ["Likes", formatNumber(video.likes)],
              ["Comments", formatNumber(video.comments)],
              ["Engagement", `${video.engagement_rate.toFixed(2)}%`],
              ["Shares", video.platform === "instagram" ? "N/A" : formatNumber(video.shares)],
              ["Bookmarks", formatNumber(video.saves)],
              ["Virality", video.virality_score.toFixed(2)],
              ["Duration", formatDuration(video.duration_seconds)],
            ].map(([l, v]) => (
              <div key={l} className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                <p className="text-[10px] text-zinc-500 uppercase">{l}</p>
                <p className="text-lg font-bold text-white">{v}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-[#111111] p-4">
            <div className="flex gap-2 mb-3 flex-wrap">
              {showViews && <button onClick={() => setShowViews(false)} className="text-xs px-2 py-1 rounded-full bg-orange-500/15 text-orange-400">Views ×</button>}
              {showLikes && <button onClick={() => setShowLikes(false)} className="text-xs px-2 py-1 rounded-full bg-blue-500/15 text-blue-400">Likes ×</button>}
              {showComments && <button onClick={() => setShowComments(false)} className="text-xs px-2 py-1 rounded-full bg-amber-500/15 text-amber-400">Comments ×</button>}
            </div>
            {chartData.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-8">Syncing data…</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 11 }} />
                  {showViews && <YAxis yAxisId="left" tick={{ fill: "#71717a", fontSize: 11 }} />}
                  {(showLikes || showComments) && <YAxis yAxisId="right" orientation="right" tick={{ fill: "#71717a", fontSize: 11 }} />}
                  <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)" }} />
                  {showViews && <Area yAxisId="left" type="monotone" dataKey="views" fill="#f97316" fillOpacity={0.15} stroke="#f97316" />}
                  {showLikes && <Bar yAxisId="right" dataKey="likes" fill="#3b82f6" barSize={10} />}
                  {showComments && <Bar yAxisId="right" dataKey="comments" fill="#eab308" barSize={10} />}
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.05]">
            <Avatar className="w-9 h-9">
              <AvatarImage src={video.account.avatar_url ?? undefined} />
              <AvatarFallback>{video.account.username.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-white">@{video.account.username}</p>
              <p className="text-xs text-zinc-500">{video.account.display_name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.05]">
            <Disc3 className="w-5 h-5 text-zinc-500" />
            <p className="text-sm text-white">{video.audio_name ?? "Original Sound"}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
