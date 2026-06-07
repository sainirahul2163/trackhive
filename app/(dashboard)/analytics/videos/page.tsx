"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Play, Clock, Heart, MessageCircle, Share2, MoreHorizontal,
  ExternalLink, Trash2, Eye, Radio,
} from "lucide-react"
import { subDays, format, isWithinInterval, parseISO } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { VideoDetailDrawer } from "@/components/analytics/video-detail-drawer"
import { PlatformIcon, PLATFORM_CONFIG, formatNumber } from "@/lib/platform"
import {
  AnalyticsBreadcrumb, AccountMultiSelect, ProjectsPlaceholder,
  PlatformToggles, ContentTypeToggles, InternalAccountsDropdown,
  TablePagination, ExportCsvButton, FilterIconButton, TableSettingsButton,
  DateRangePicker,
} from "@/components/analytics/analytics-shared"
import {
  fetchAllVideosWithAccounts, performanceMultiplier, multiplierBadge, formatDuration,
  type VideoWithAccount,
} from "@/lib/analytics-queries"
import { fetchTrackedAccounts } from "@/lib/analytics-data"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/lib/use-user"
import type { Platform, TrackedAccount, TrackedVideo } from "@/types"

type SortKey = "posted_at" | "views" | "likes" | "comments" | "shares" | "duration" | "performance"

export default function AnalyticsVideosPage() {
  const { user } = useUser()
  const [accounts, setAccounts] = useState<TrackedAccount[]>([])
  const [videos, setVideos] = useState<VideoWithAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([])
  const [platforms, setPlatforms] = useState<Platform[]>(["tiktok", "instagram", "youtube", "facebook"])
  const [dateFrom, setDateFrom] = useState<Date | null>(null)
  const [dateTo, setDateTo] = useState<Date | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>("posted_at")
  const [sortAsc, setSortAsc] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedVideo, setSelectedVideo] = useState<TrackedVideo | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [menuId, setMenuId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [accs, vids] = await Promise.all([
        fetchTrackedAccounts(user?.id),
        fetchAllVideosWithAccounts(user?.id),
      ])
      setAccounts(accs)
      setVideos(vids)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => {
    let list = [...videos]
    if (selectedAccounts.length) list = list.filter((v) => selectedAccounts.includes(v.account_id))
    if (platforms.length < 4) list = list.filter((v) => platforms.includes(v.platform))
    if (dateFrom && dateTo) {
      list = list.filter((v) => {
        if (!v.posted_at) return false
        return isWithinInterval(parseISO(v.posted_at), { start: dateFrom, end: dateTo })
      })
    }
    list.sort((a, b) => {
      let av = 0
      let bv = 0
      if (sortKey === "posted_at") {
        av = a.posted_at ? new Date(a.posted_at).getTime() : 0
        bv = b.posted_at ? new Date(b.posted_at).getTime() : 0
      } else if (sortKey === "performance") {
        av = performanceMultiplier(a.views ?? 0, a.account.avg_views ?? 0)
        bv = performanceMultiplier(b.views ?? 0, b.account.avg_views ?? 0)
      } else if (sortKey === "duration") {
        av = a.duration_seconds ?? 0
        bv = b.duration_seconds ?? 0
      } else {
        av = (a[sortKey] as number) ?? 0
        bv = (b[sortKey] as number) ?? 0
      }
      return sortAsc ? av - bv : bv - av
    })
    return list
  }, [videos, selectedAccounts, platforms, dateFrom, dateTo, sortKey, sortAsc])

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc)
    else { setSortKey(key); setSortAsc(false) }
  }

  async function handleRemove(id: string) {
    await supabase.from("tracked_videos").delete().eq("id", id)
    setVideos((prev) => prev.filter((v) => v.id !== id))
    setMenuId(null)
  }

  const csvRows = [
    ["Caption", "Platform", "Username", "Posted", "Views", "Likes", "Comments", "Shares"],
    ...filtered.map((v) => [
      v.caption ?? "",
      v.platform,
      v.account.username,
      v.posted_at ?? "",
      String(v.views ?? 0),
      String(v.likes),
      String(v.comments),
      v.platform === "instagram" ? "N/A" : String(v.shares),
    ]),
  ]

  const rangeFrom = dateFrom ?? subDays(new Date(), 30)
  const rangeTo = dateTo ?? new Date()

  return (
    <div className="space-y-5 max-w-[1400px]">
      <AnalyticsBreadcrumb section="Videos" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-white tracking-tight">Videos</h1>
          <p className="text-sm text-zinc-500 mt-0.5">All tracked videos across your accounts.</p>
        </div>
        <InternalAccountsDropdown />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <AccountMultiSelect accounts={accounts} selected={selectedAccounts} onChange={setSelectedAccounts} />
        <ProjectsPlaceholder />
        <DateRangePicker
          from={rangeFrom}
          to={rangeTo}
          onChange={(f, t) => { setDateFrom(f); setDateTo(t) }}
        />
        <PlatformToggles selected={platforms} onChange={setPlatforms} />
        <ContentTypeToggles contentType="all" onChange={() => {}} />
        <ExportCsvButton rows={csvRows} filename="trackhive-videos.csv" />
        <TableSettingsButton />
        <FilterIconButton />
        <Link
          href="/analytics/tracking-options"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-300 hover:text-white ml-auto"
        >
          <Radio className="w-4 h-4" />
          Tracking Options
        </Link>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-[#111111] overflow-hidden">
        {loading ? (
          <div className="p-8"><Skeleton className="h-48 w-full" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-zinc-400">No videos tracked yet</p>
            <Link href="/analytics" className="text-sm text-purple-400 hover:text-purple-300 mt-2 inline-block">Add an account to start tracking</Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.04]">
                    {[
                      { key: null, label: "Video" },
                      { key: null, label: "Platform" },
                      { key: "posted_at" as SortKey, label: "Posted at" },
                      { key: "duration" as SortKey, label: "Duration", icon: Clock },
                      { key: "views" as SortKey, label: "Views", icon: Play },
                      { key: "performance" as SortKey, label: "Performance", icon: Play },
                      { key: "likes" as SortKey, label: "Likes", icon: Heart },
                      { key: "comments" as SortKey, label: "Comments", icon: MessageCircle },
                      { key: "shares" as SortKey, label: "Shares", icon: Share2 },
                      { key: null, label: "" },
                    ].map((col, i) => (
                      <th
                        key={i}
                        className={`text-left px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider ${col.key ? "cursor-pointer hover:text-zinc-300" : ""}`}
                        onClick={() => col.key && toggleSort(col.key)}
                      >
                        {col.icon ? <col.icon className="w-3.5 h-3.5 inline" /> : col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paged.map((v) => {
                    const mult = performanceMultiplier(v.views ?? 0, v.account.avg_views ?? 0)
                    const badge = multiplierBadge(mult)
                    const cfg = PLATFORM_CONFIG[v.platform]
                    return (
                      <tr key={v.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3 max-w-xs">
                            <div className="w-10 h-10 rounded bg-white/[0.04] flex-shrink-0 overflow-hidden">
                              {v.thumbnail_url && (
                                <Image src={v.thumbnail_url} alt="" width={40} height={40} className="w-full h-full object-cover" unoptimized />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs text-zinc-300 truncate">{v.caption ?? "Untitled"}</p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <Avatar className="w-4 h-4">
                                  <AvatarImage src={v.account.avatar_url ?? undefined} />
                                  <AvatarFallback className="text-[8px]">{v.account.username[0]}</AvatarFallback>
                                </Avatar>
                                <span className="text-[10px] text-zinc-500">@{v.account.username}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <PlatformIcon platform={v.platform} className="w-4 h-4" />
                            <span className="text-xs text-zinc-400">{cfg.label}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-zinc-400 whitespace-nowrap">
                          {v.posted_at
                            ? format(new Date(v.posted_at), "MMM d, yyyy, h:mm a")
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-zinc-400">{formatDuration(v.duration_seconds)}</td>
                        <td className="px-4 py-3 text-xs font-medium text-white">{formatNumber(v.views ?? 0)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${badge.className}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-zinc-300">{formatNumber(v.likes)}</td>
                        <td className="px-4 py-3 text-xs text-zinc-300">{formatNumber(v.comments)}</td>
                        <td className="px-4 py-3 text-xs text-zinc-400">
                          {v.platform === "instagram" ? "N/A" : formatNumber(v.shares)}
                        </td>
                        <td className="px-4 py-3 relative">
                          <button onClick={() => setMenuId(menuId === v.id ? null : v.id)} className="text-zinc-500 hover:text-white">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          {menuId === v.id && (
                            <div className="absolute right-4 top-10 z-20 bg-[#1a1a1a] border border-white/10 rounded-lg py-1 shadow-xl min-w-[160px]">
                              <button
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:bg-white/[0.05]"
                                onClick={() => { setSelectedVideo(v); setDrawerOpen(true); setMenuId(null) }}
                              >
                                <Eye className="w-3.5 h-3.5" /> View details
                              </button>
                              <a href={v.video_url} target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:bg-white/[0.05]">
                                <ExternalLink className="w-3.5 h-3.5" /> Open on platform
                              </a>
                              <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-white/[0.05]" onClick={() => handleRemove(v.id)}>
                                <Trash2 className="w-3.5 h-3.5" /> Remove
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <TablePagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} onPageSizeChange={setPageSize} />
          </>
        )}
      </div>

      <VideoDetailDrawer video={selectedVideo} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  )
}
