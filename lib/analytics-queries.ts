import { supabase } from "@/lib/supabase"
import type { Platform, TrackedAccount, TrackedVideo, VideoDailyStat } from "@/types"

export interface AnalyticsFilters {
  accountIds: string[]
  platforms: Platform[]
  contentType: "all" | "video" | "image"
  dateFrom: string
  dateTo: string
}

export interface OverviewMetrics {
  postedVideos: number
  activeAccounts: number
  views: number
  likes: number
  comments: number
  engagement: number
  deltas: {
    postedVideos: number
    activeAccounts: number
    views: number
    likes: number
    comments: number
    engagement: number
  }
}

export interface ChartPoint {
  date: string
  views: number
  postedVideos: number
}

export interface TopVideoRow {
  id: string
  caption: string
  views: number
  likes: number
  thumbnail_url: string | null
  platform: Platform
  username: string
  display_name: string | null
  avatar_url: string | null
}

export interface TopAccountRow {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  platform: Platform
  total_views: number | null
}

export interface VideoWithAccount extends TrackedVideo {
  account: Pick<TrackedAccount, "username" | "display_name" | "avatar_url" | "avg_views">
}

export interface AccountWithTotals extends TrackedAccount {
  video_count: number
  total_likes: number
  total_comments: number
  total_shares: number
  creator_name: string | null
  tracking_limit?: number
  postsByDay?: Map<string, number>
}

function workspaceFilter(userId?: string) {
  if (!userId) return null
  return `workspace_id.eq.${userId},workspace_id.is.null`
}

export function defaultDateRange(days = 30): { from: Date; to: Date } {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - days)
  from.setHours(0, 0, 0, 0)
  to.setHours(23, 59, 59, 999)
  return { from, to }
}

export function previousPeriod(from: string, to: string): { dateFrom: string; dateTo: string } {
  const start = new Date(from)
  const end = new Date(to)
  const span = end.getTime() - start.getTime()
  const prevEnd = new Date(start.getTime() - 86400000)
  const prevStart = new Date(prevEnd.getTime() - span)
  return {
    dateFrom: prevStart.toISOString().slice(0, 10),
    dateTo: prevEnd.toISOString().slice(0, 10),
  }
}

export async function fetchUserAccountIds(userId?: string): Promise<string[]> {
  let query = supabase.from("tracked_accounts").select("id")
  const orFilter = workspaceFilter(userId)
  if (orFilter) query = query.or(orFilter)
  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => r.id as string)
}

async function fetchVideosInRange(
  accountIds: string[],
  dateFrom: string,
  dateTo: string,
  platforms: Platform[],
): Promise<TrackedVideo[]> {
  if (!accountIds.length) return []

  let query = supabase
    .from("tracked_videos")
    .select("*")
    .in("account_id", accountIds)
    .gte("posted_at", `${dateFrom}T00:00:00`)
    .lte("posted_at", `${dateTo}T23:59:59`)

  if (platforms.length) query = query.in("platform", platforms)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data ?? []) as TrackedVideo[]
}

function computeEngagement(views: number, likes: number, comments: number): number {
  if (!views) return 0
  return Math.round(((likes + comments) / views) * 100 * 100) / 100
}

export async function fetchOverviewMetrics(
  filters: AnalyticsFilters,
  accountIds: string[],
): Promise<OverviewMetrics> {
  const ids = filters.accountIds.length ? filters.accountIds : accountIds
  const videos = await fetchVideosInRange(ids, filters.dateFrom, filters.dateTo, filters.platforms)

  const views = videos.reduce((s, v) => s + (v.views ?? 0), 0)
  const likes = videos.reduce((s, v) => s + v.likes, 0)
  const comments = videos.reduce((s, v) => s + v.comments, 0)
  const engagement = computeEngagement(views, likes, comments)
  const activeAccountSet = new Set(videos.map((v) => v.account_id))

  const prev = previousPeriod(filters.dateFrom, filters.dateTo)
  const prevVideos = await fetchVideosInRange(ids, prev.dateFrom, prev.dateTo, filters.platforms)
  const prevViews = prevVideos.reduce((s, v) => s + (v.views ?? 0), 0)
  const prevLikes = prevVideos.reduce((s, v) => s + v.likes, 0)
  const prevComments = prevVideos.reduce((s, v) => s + v.comments, 0)
  const prevEngagement = computeEngagement(prevViews, prevLikes, prevComments)

  return {
    postedVideos: videos.length,
    activeAccounts: activeAccountSet.size || ids.length,
    views,
    likes,
    comments,
    engagement,
    deltas: {
      postedVideos: videos.length - prevVideos.length,
      activeAccounts: activeAccountSet.size - new Set(prevVideos.map((v) => v.account_id)).size,
      views: views - prevViews,
      likes: likes - prevLikes,
      comments: comments - prevComments,
      engagement: Math.round((engagement - prevEngagement) * 100) / 100,
    },
  }
}

export async function fetchChartData(
  filters: AnalyticsFilters,
  accountIds: string[],
): Promise<ChartPoint[]> {
  const ids = filters.accountIds.length ? filters.accountIds : accountIds
  if (!ids.length) return []

  const { data: stats, error } = await supabase
    .from("video_daily_stats")
    .select("date, views, tracked_videos!inner(account_id, platform, posted_at)")
    .in("tracked_videos.account_id", ids)
    .gte("date", filters.dateFrom)
    .lte("date", filters.dateTo)

  if (error) throw new Error(error.message)

  interface StatRow {
    date: string
    views: number
    tracked_videos: { account_id: string; platform: Platform; posted_at: string | null }
  }

  const byDate = new Map<string, ChartPoint>()
  for (const row of (stats ?? []) as unknown as StatRow[]) {
    if (filters.platforms.length && !filters.platforms.includes(row.tracked_videos.platform)) continue
    const existing = byDate.get(row.date) ?? { date: row.date, views: 0, postedVideos: 0 }
    existing.views += row.views
    byDate.set(row.date, existing)
  }

  const videos = await fetchVideosInRange(ids, filters.dateFrom, filters.dateTo, filters.platforms)
  for (const v of videos) {
    if (!v.posted_at) continue
    const d = v.posted_at.slice(0, 10)
    const existing = byDate.get(d) ?? { date: d, views: 0, postedVideos: 0 }
    existing.postedVideos += 1
    byDate.set(d, existing)
  }

  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date))
}

export async function fetchTopVideos(
  filters: AnalyticsFilters,
  accountIds: string[],
  metric: "views" | "likes" | "comments",
  limit: number,
): Promise<TopVideoRow[]> {
  const ids = filters.accountIds.length ? filters.accountIds : accountIds
  if (!ids.length) return []

  let query = supabase
    .from("tracked_videos")
    .select("id, caption, views, likes, comments, thumbnail_url, platform, posted_at, tracked_accounts(username, display_name, avatar_url)")
    .in("account_id", ids)
    .gte("posted_at", `${filters.dateFrom}T00:00:00`)
    .lte("posted_at", `${filters.dateTo}T23:59:59`)
    .order(metric, { ascending: false })
    .limit(limit)

  if (filters.platforms.length) query = query.in("platform", filters.platforms)

  const { data, error } = await query
  if (error) throw new Error(error.message)

  interface Row {
    id: string
    caption: string | null
    views: number | null
    likes: number
    comments: number
    thumbnail_url: string | null
    platform: Platform
    tracked_accounts: { username: string; display_name: string | null; avatar_url: string | null } | null
  }

  return ((data ?? []) as unknown as Row[]).map((r) => ({
    id: r.id,
    caption: r.caption ?? "Untitled",
    views: r.views ?? 0,
    likes: r.likes,
    thumbnail_url: r.thumbnail_url,
    platform: r.platform,
    username: r.tracked_accounts?.username ?? "unknown",
    display_name: r.tracked_accounts?.display_name ?? null,
    avatar_url: r.tracked_accounts?.avatar_url ?? null,
  }))
}

export async function fetchTopAccounts(
  filters: AnalyticsFilters,
  accountIds: string[],
  limit: number,
): Promise<TopAccountRow[]> {
  const ids = filters.accountIds.length ? filters.accountIds : accountIds
  if (!ids.length) return []

  let query = supabase
    .from("tracked_accounts")
    .select("id, username, display_name, avatar_url, platform, total_views")
    .in("id", ids)
    .order("total_views", { ascending: false })
    .limit(limit)

  if (filters.platforms.length) query = query.in("platform", filters.platforms)

  const { data, error } = await query
  if (error) throw new Error(error.message)

  return (data ?? []) as TopAccountRow[]
}

export async function fetchHeatmapData(userId?: string): Promise<Map<string, number>> {
  const accountIds = await fetchUserAccountIds(userId)
  if (!accountIds.length) return new Map()

  const since = new Date()
  since.setDate(since.getDate() - 84)

  const { data, error } = await supabase
    .from("tracked_videos")
    .select("posted_at")
    .in("account_id", accountIds)
    .gte("posted_at", since.toISOString())
    .not("posted_at", "is", null)

  if (error) throw new Error(error.message)

  const counts = new Map<string, number>()
  for (const row of data ?? []) {
    const d = (row.posted_at as string).slice(0, 10)
    counts.set(d, (counts.get(d) ?? 0) + 1)
  }
  return counts
}

export function calculatePostingStreak(postDates: Map<string, number>): number {
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    if ((postDates.get(key) ?? 0) > 0) streak++
    else if (i > 0) break
  }
  return streak
}

export async function fetchSyncStatus(userId?: string): Promise<{
  lastRefresh: string | null
  nextRefreshHours: number
}> {
  let query = supabase.from("tracked_accounts").select("last_synced_at")
  const orFilter = workspaceFilter(userId)
  if (orFilter) query = query.or(orFilter)

  const { data, error } = await query
  if (error) throw new Error(error.message)

  const times = (data ?? [])
    .map((r) => r.last_synced_at as string | null)
    .filter(Boolean) as string[]

  const lastRefresh = times.length
    ? times.reduce((a, b) => (new Date(a) > new Date(b) ? a : b))
    : null

  const now = new Date()
  const nextMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1))
  const nextRefreshHours = Math.max(1, Math.round((nextMidnight.getTime() - now.getTime()) / 3600000))

  return { lastRefresh, nextRefreshHours }
}

export async function fetchAllVideosWithAccounts(userId?: string): Promise<VideoWithAccount[]> {
  const accountIds = await fetchUserAccountIds(userId)
  if (!accountIds.length) return []

  const { data, error } = await supabase
    .from("tracked_videos")
    .select("*, tracked_accounts(username, display_name, avatar_url, avg_views)")
    .in("account_id", accountIds)
    .order("posted_at", { ascending: false })

  if (error) throw new Error(error.message)

  interface Row extends TrackedVideo {
    tracked_accounts: Pick<TrackedAccount, "username" | "display_name" | "avatar_url" | "avg_views">
  }

  return ((data ?? []) as unknown as Row[]).map((r) => ({
    ...r,
    account: r.tracked_accounts,
  }))
}

export async function fetchVideoDailyStats(videoId: string): Promise<VideoDailyStat[]> {
  const { data, error } = await supabase
    .from("video_daily_stats")
    .select("*")
    .eq("video_id", videoId)
    .order("date", { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as VideoDailyStat[]
}

export async function fetchVideoById(id: string): Promise<VideoWithAccount | null> {
  const { data, error } = await supabase
    .from("tracked_videos")
    .select("*, tracked_accounts(username, display_name, avatar_url, avg_views, platform)")
    .eq("id", id)
    .single()

  if (error) return null

  interface Row extends TrackedVideo {
    tracked_accounts: Pick<TrackedAccount, "username" | "display_name" | "avatar_url" | "avg_views" | "platform">
  }

  const row = data as unknown as Row
  return { ...row, account: row.tracked_accounts }
}

export async function fetchAccountsWithTotals(userId?: string): Promise<AccountWithTotals[]> {
  let query = supabase.from("tracked_accounts").select("*")
  const orFilter = workspaceFilter(userId)
  if (orFilter) query = query.or(orFilter)

  const { data: accounts, error } = await query.order("total_views", { ascending: false })
  if (error) throw new Error(error.message)

  const creatorIds = (accounts ?? [])
    .map((a) => a.creator_id as string | null | undefined)
    .filter((id): id is string => Boolean(id))

  const creatorNames = new Map<string, string>()
  if (creatorIds.length) {
    const { data: creators } = await supabase.from("creators").select("id, name").in("id", creatorIds)
    for (const c of creators ?? []) {
      creatorNames.set(c.id as string, c.name as string)
    }
  }

  const accountIds = (accounts ?? []).map((a) => a.id as string)
  if (!accountIds.length) return []

  const { data: videos, error: vErr } = await supabase
    .from("tracked_videos")
    .select("account_id, likes, comments, shares, posted_at")
    .in("account_id", accountIds)

  if (vErr) throw new Error(vErr.message)

  const totals = new Map<string, { count: number; likes: number; comments: number; shares: number; postsByDay: Map<string, number> }>()
  for (const id of accountIds) {
    totals.set(id, { count: 0, likes: 0, comments: 0, shares: 0, postsByDay: new Map() })
  }

  for (const v of videos ?? []) {
    const t = totals.get(v.account_id as string)
    if (!t) continue
    t.count += 1
    t.likes += v.likes as number
    t.comments += v.comments as number
    t.shares += v.shares as number
    if (v.posted_at) {
      const day = (v.posted_at as string).slice(0, 10)
      t.postsByDay.set(day, (t.postsByDay.get(day) ?? 0) + 1)
    }
  }

  return ((accounts ?? []) as TrackedAccount[]).map((a) => {
    const t = totals.get(a.id) ?? { count: 0, likes: 0, comments: 0, shares: 0, postsByDay: new Map() }
    return {
      ...a,
      video_count: t.count,
      total_likes: t.likes,
      total_comments: t.comments,
      total_shares: t.shares,
      creator_name: a.creator_id ? (creatorNames.get(a.creator_id) ?? null) : null,
      postsByDay: t.postsByDay,
    }
  })
}

export async function fetchTrackedVideoCount(userId?: string): Promise<number> {
  const accountIds = await fetchUserAccountIds(userId)
  if (!accountIds.length) return 0
  const { count, error } = await supabase
    .from("tracked_videos")
    .select("id", { count: "exact", head: true })
    .in("account_id", accountIds)
  if (error) throw new Error(error.message)
  return count ?? 0
}

export function performanceMultiplier(views: number, avgViews: number): number {
  if (!avgViews) return views > 0 ? 1 : 0
  return Math.round((views / avgViews) * 10) / 10
}

export function multiplierBadge(mult: number): { label: string; className: string } {
  if (mult < 0.5) return { label: `${mult}x`, className: "bg-orange-500/15 text-orange-400 border-orange-500/25" }
  if (mult < 1) return { label: `${mult}x`, className: "bg-zinc-500/15 text-zinc-400 border-zinc-500/25" }
  if (mult < 2) return { label: `${mult}x`, className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25" }
  if (mult < 5) return { label: `${mult}x`, className: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" }
  return { label: `${Math.round(mult)}x`, className: "bg-emerald-500/30 text-emerald-200 border-emerald-400/40" }
}

export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0) return "—"
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, "0")}`
}

export function extractHashtags(caption: string | null): string[] {
  if (!caption) return []
  const matches = caption.match(/#\w+/g)
  return matches ? Array.from(new Set(matches)) : []
}

export function formatDelta(value: number, isPercent = false): string {
  const prefix = value >= 0 ? "+" : ""
  if (isPercent) return `${prefix}${value.toFixed(1)}%`
  return `${prefix}${value.toLocaleString()}`
}

export function timeAgoLong(iso: string | null): string {
  if (!iso) return "never"
  const diff = Date.now() - new Date(iso).getTime()
  const hrs = Math.floor(diff / 3600000)
  if (hrs < 1) return "less than an hour ago"
  if (hrs < 24) return `about ${hrs} hour${hrs === 1 ? "" : "s"} ago`
  const days = Math.floor(hrs / 24)
  return `about ${days} day${days === 1 ? "" : "s"} ago`
}
