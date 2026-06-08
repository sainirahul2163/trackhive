import { supabase } from "@/lib/supabase"
import { format, startOfWeek, startOfMonth } from "date-fns"
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

export type ChartMetricId =
  | "views"
  | "posted_videos"
  | "likes"
  | "comments"
  | "shares"
  | "active_accounts"
  | "engagement_rate"

export type ChartAggregation = "day" | "week" | "month"
export type ChartMode = "discrete" | "cumulative"
export type ChartStyle = "area" | "line" | "bar"

export interface MetricDataPoint {
  date: string
  value: number
}

export interface DailyMetricBucket {
  date: string
  views: number
  posted_videos: number
  likes: number
  comments: number
  shares: number
  active_accounts: number
  engagement_rate: number
}

interface InternalDailyBucket extends DailyMetricBucket {
  accountIds: Set<string>
  engagementSum: number
  engagementCount: number
}

export const METRIC_CHART_COLORS: Record<ChartMetricId, string> = {
  views:            "#3B82F6",
  posted_videos:    "#B45309",
  likes:            "#EC4899",
  comments:         "#8B5CF6",
  shares:           "#10B981",
  engagement_rate:  "#F59E0B",
  active_accounts:  "#06B6D4",
}

export const METRIC_CHART_LABELS: Record<ChartMetricId, string> = {
  views:            "Views",
  posted_videos:    "Posted Videos",
  likes:            "Likes",
  comments:         "Comments",
  shares:           "Shares",
  engagement_rate:  "Engagement Rate",
  active_accounts:  "Active Accounts",
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
  return `workspace_id.eq.${userId}`
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

function matchesContentType(
  video: Pick<TrackedVideo, "platform" | "duration_seconds">,
  contentType: AnalyticsFilters["contentType"],
): boolean {
  if (contentType === "all") return true
  if (contentType === "video") {
    return (
      (video.duration_seconds != null && video.duration_seconds > 0) ||
      video.platform === "tiktok" ||
      video.platform === "youtube"
    )
  }
  if (contentType === "image") {
    return (
      video.platform === "instagram" &&
      (video.duration_seconds == null || video.duration_seconds === 0)
    )
  }
  return true
}

function normalizeDateKey(value: string): string {
  return value.split("T")[0]
}

function utcDateBounds(dateFrom: string, dateTo: string): { start: Date; end: Date } {
  return {
    start: new Date(`${dateFrom}T00:00:00.000Z`),
    end: new Date(`${dateTo}T23:59:59.999Z`),
  }
}

/** Earliest video_daily_stats date across accounts — sync boundary for views chart. */
async function fetchFirstSyncDate(accountIds: string[]): Promise<string | null> {
  if (!accountIds.length) return null

  const { data, error } = await supabase
    .from("video_daily_stats")
    .select("date, tracked_videos!inner(account_id)")
    .in("tracked_videos.account_id", accountIds)
    .order("date", { ascending: true })
    .limit(1)

  if (error) throw new Error(error.message)
  if (!data?.length) return null
  return normalizeDateKey((data[0] as { date: string }).date)
}

function resolveViewsForDay(
  date: string,
  firstSyncDate: string | null,
  dailyViewsByDate: Map<string, number>,
  postedAtViewsByDate: Map<string, number>,
): number {
  if (firstSyncDate && date >= firstSyncDate) {
    return dailyViewsByDate.get(date) ?? 0
  }
  return postedAtViewsByDate.get(date) ?? 0
}

async function fetchPostedAtViewsByDate(
  accountIds: string[],
  dateFrom: string,
  dateTo: string,
  platforms: Platform[],
  contentType: AnalyticsFilters["contentType"],
): Promise<Map<string, number>> {
  if (!accountIds.length) return new Map()

  const { start, end } = utcDateBounds(dateFrom, dateTo)

  console.log("[Views Query]", {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    accountIds,
  })

  let query = supabase
    .from("tracked_videos")
    .select("posted_at, views, platform, duration_seconds")
    .in("account_id", accountIds)
    .gte("posted_at", start.toISOString())
    .lte("posted_at", end.toISOString())
    .not("posted_at", "is", null)

  if (platforms.length) query = query.in("platform", platforms)

  const { data, error } = await query.limit(1000)
  if (error) throw new Error(error.message)

  interface PostedAtRow {
    posted_at: string
    views: number | null
    platform: Platform
    duration_seconds: number | null
  }

  const rows = (data ?? []) as PostedAtRow[]
  console.log("[Views Result]", rows.slice(0, 5))

  const grouped = new Map<string, number>()
  for (const row of rows) {
    if (!row.posted_at) continue
    if (!matchesContentType(row, contentType)) continue
    const dateKey = normalizeDateKey(row.posted_at)
    grouped.set(dateKey, (grouped.get(dateKey) ?? 0) + (row.views ?? 0))
  }
  return grouped
}

async function fetchVideosInRange(
  accountIds: string[],
  dateFrom: string,
  dateTo: string,
  platforms: Platform[],
  contentType: AnalyticsFilters["contentType"] = "all",
): Promise<TrackedVideo[]> {
  if (!accountIds.length) return []

  const { start, end } = utcDateBounds(dateFrom, dateTo)

  let query = supabase
    .from("tracked_videos")
    .select("*")
    .in("account_id", accountIds)
    .gte("posted_at", start.toISOString())
    .lte("posted_at", end.toISOString())

  if (platforms.length) query = query.in("platform", platforms)

  const { data, error } = await query.limit(1000)
  if (error) throw new Error(error.message)
  const rows = (data ?? []) as TrackedVideo[]
  return contentType === "all" ? rows : rows.filter((v) => matchesContentType(v, contentType))
}

function computeEngagement(views: number, likes: number, comments: number): number {
  if (!views) return 0
  return Math.round(((likes + comments) / views) * 100 * 100) / 100
}

function eachDayInRange(dateFrom: string, dateTo: string): string[] {
  const days: string[] = []
  const cur = new Date(`${dateFrom}T00:00:00.000Z`)
  const end = new Date(`${dateTo}T00:00:00.000Z`)
  while (cur <= end) {
    days.push(cur.toISOString().slice(0, 10))
    cur.setUTCDate(cur.getUTCDate() + 1)
  }
  return days
}

interface DailyStatViewsRow {
  views: number
  video_id: string
  tracked_videos: {
    account_id: string
    platform: Platform
    duration_seconds: number | null
  }
}

async function sumViewsFromDailyStats(
  ids: string[],
  dateFrom: string,
  dateTo: string,
  platforms: Platform[],
  contentType: AnalyticsFilters["contentType"],
  allowedVideoIds: Set<string>,
): Promise<{ total: number; hasStats: boolean }> {
  const { data, error } = await supabase
    .from("video_daily_stats")
    .select("views, video_id, tracked_videos!inner(account_id, platform, duration_seconds)")
    .in("tracked_videos.account_id", ids)
    .gte("date", dateFrom)
    .lte("date", dateTo)

  if (error) throw new Error(error.message)

  let total = 0
  let hasStats = false
  for (const row of (data ?? []) as unknown as DailyStatViewsRow[]) {
    if (platforms.length && !platforms.includes(row.tracked_videos.platform)) continue
    if (contentType !== "all" && !allowedVideoIds.has(row.video_id)) continue
    hasStats = true
    total += row.views ?? 0
  }
  return { total, hasStats }
}

async function resolveViewsInRange(
  ids: string[],
  dateFrom: string,
  dateTo: string,
  platforms: Platform[],
  contentType: AnalyticsFilters["contentType"],
  videosInRange: TrackedVideo[],
): Promise<number> {
  const allowedVideoIds = new Set(videosInRange.map((v) => v.id))
  const { total, hasStats } = await sumViewsFromDailyStats(
    ids, dateFrom, dateTo, platforms, contentType, allowedVideoIds,
  )
  if (hasStats) return total
  return videosInRange.reduce((s, v) => s + (v.views ?? 0), 0)
}

export async function fetchOverviewMetrics(
  filters: AnalyticsFilters,
  accountIds: string[],
): Promise<OverviewMetrics> {
  const ids = filters.accountIds.length ? filters.accountIds : accountIds
  const videos = await fetchVideosInRange(ids, filters.dateFrom, filters.dateTo, filters.platforms, filters.contentType)

  const views = await resolveViewsInRange(
    ids, filters.dateFrom, filters.dateTo, filters.platforms, filters.contentType, videos,
  )
  const likes = videos.reduce((s, v) => s + v.likes, 0)
  const comments = videos.reduce((s, v) => s + v.comments, 0)
  const engagement = computeEngagement(views, likes, comments)
  const activeAccountSet = new Set(videos.map((v) => v.account_id))

  const prev = previousPeriod(filters.dateFrom, filters.dateTo)
  const prevVideos = await fetchVideosInRange(ids, prev.dateFrom, prev.dateTo, filters.platforms, filters.contentType)
  const prevViews = await resolveViewsInRange(
    ids, prev.dateFrom, prev.dateTo, filters.platforms, filters.contentType, prevVideos,
  )
  const prevLikes = prevVideos.reduce((s, v) => s + v.likes, 0)
  const prevComments = prevVideos.reduce((s, v) => s + v.comments, 0)
  const prevEngagement = computeEngagement(prevViews, prevLikes, prevComments)
  const prevActiveAccounts = new Set(prevVideos.map((v) => v.account_id)).size

  return {
    postedVideos: videos.length,
    activeAccounts: activeAccountSet.size,
    views,
    likes,
    comments,
    engagement,
    deltas: {
      postedVideos: videos.length - prevVideos.length,
      activeAccounts: activeAccountSet.size - prevActiveAccounts,
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

  const filteredVideos = await fetchVideosInRange(
    ids, filters.dateFrom, filters.dateTo, filters.platforms, filters.contentType,
  )

  const { data: stats, error } = await supabase
    .from("video_daily_stats")
    .select("date, views, video_id, tracked_videos!inner(account_id, platform, posted_at, duration_seconds)")
    .in("tracked_videos.account_id", ids)
    .gte("date", filters.dateFrom)
    .lte("date", filters.dateTo)

  if (error) throw new Error(error.message)

  interface StatRow {
    date: string
    views: number
    video_id: string
    tracked_videos: {
      account_id: string
      platform: Platform
      posted_at: string | null
      duration_seconds: number | null
    }
  }

  const dailyViewsByDate = new Map<string, number>()
  for (const row of (stats ?? []) as unknown as StatRow[]) {
    if (filters.platforms.length && !filters.platforms.includes(row.tracked_videos.platform)) continue
    if (!matchesContentType(row.tracked_videos, filters.contentType)) continue
    const dateKey = normalizeDateKey(row.date)
    dailyViewsByDate.set(dateKey, (dailyViewsByDate.get(dateKey) ?? 0) + (row.views ?? 0))
  }

  const postedAtViewsByDate = await fetchPostedAtViewsByDate(
    ids, filters.dateFrom, filters.dateTo, filters.platforms, filters.contentType,
  )

  const postedVideosByDate = new Map<string, number>()
  for (const v of filteredVideos) {
    if (!v.posted_at) continue
    const d = normalizeDateKey(v.posted_at)
    postedVideosByDate.set(d, (postedVideosByDate.get(d) ?? 0) + 1)
  }

  const firstSyncDate = await fetchFirstSyncDate(ids)

  return eachDayInRange(filters.dateFrom, filters.dateTo).map((d) => ({
    date: d,
    views: resolveViewsForDay(d, firstSyncDate, dailyViewsByDate, postedAtViewsByDate),
    postedVideos: postedVideosByDate.get(d) ?? 0,
  }))
}

function aggregationBucketKey(dateStr: string, aggregation: ChartAggregation): string {
  const d = new Date(`${dateStr}T12:00:00`)
  if (aggregation === "day") return dateStr
  if (aggregation === "week") {
    return format(startOfWeek(d, { weekStartsOn: 1 }), "yyyy-MM-dd")
  }
  return format(startOfMonth(d), "yyyy-MM-dd")
}

function formatMetricLabel(dateStr: string, aggregation: ChartAggregation): string {
  const d = new Date(`${dateStr}T12:00:00`)
  if (aggregation === "month") {
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" })
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function allAggregationKeys(
  dateFrom: string,
  dateTo: string,
  aggregation: ChartAggregation,
): string[] {
  const days = eachDayInRange(dateFrom, dateTo)
  if (aggregation === "day") return days
  const keys = new Set<string>()
  for (const d of days) keys.add(aggregationBucketKey(d, aggregation))
  return Array.from(keys).sort()
}

export type CombinedChartRow = { date: string; label: string } & Partial<Record<ChartMetricId, number>>

function toCumulative(points: MetricDataPoint[]): MetricDataPoint[] {
  let running = 0
  return points.map((p) => {
    running += p.value
    return { date: p.date, value: running }
  })
}

export async function fetchDailyMetricBuckets(
  filters: AnalyticsFilters,
  accountIds: string[],
): Promise<DailyMetricBucket[]> {
  const internal = await fetchInternalDailyMetricBuckets(filters, accountIds)
  return internal.map(toPublicMetricBucket)
}

async function fetchInternalDailyMetricBuckets(
  filters: AnalyticsFilters,
  accountIds: string[],
): Promise<InternalDailyBucket[]> {
  const ids = filters.accountIds.length ? filters.accountIds : accountIds
  const days = eachDayInRange(filters.dateFrom, filters.dateTo)
  if (!ids.length) {
    return days.map((d) => ({
      date: d, views: 0, posted_videos: 0, likes: 0, comments: 0,
      shares: 0, active_accounts: 0, engagement_rate: 0,
      accountIds: new Set<string>(), engagementSum: 0, engagementCount: 0,
    }))
  }

  const videos = await fetchVideosInRange(
    ids, filters.dateFrom, filters.dateTo, filters.platforms, filters.contentType,
  )

  const bucketMap = new Map<string, InternalDailyBucket>()
  for (const d of days) {
    bucketMap.set(d, {
      date: d, views: 0, posted_videos: 0, likes: 0, comments: 0, shares: 0,
      active_accounts: 0, engagement_rate: 0, accountIds: new Set(), engagementSum: 0, engagementCount: 0,
    })
  }

  for (const v of videos) {
    if (!v.posted_at) continue
    const d = normalizeDateKey(v.posted_at)
    const b = bucketMap.get(d)
    if (!b) continue
    b.posted_videos += 1
    b.likes += v.likes
    b.comments += v.comments
    b.shares += v.shares
    b.accountIds.add(v.account_id)
    b.engagementSum += v.engagement_rate
    b.engagementCount += 1
  }

  const { data: stats, error } = await supabase
    .from("video_daily_stats")
    .select("date, views, video_id, tracked_videos!inner(account_id, platform, duration_seconds)")
    .in("tracked_videos.account_id", ids)
    .gte("date", filters.dateFrom)
    .lte("date", filters.dateTo)

  if (error) throw new Error(error.message)

  interface StatRow {
    date: string
    views: number
    video_id: string
    tracked_videos: { account_id: string; platform: Platform; duration_seconds: number | null }
  }

  const dailyViewsByDate = new Map<string, number>()
  for (const row of (stats ?? []) as unknown as StatRow[]) {
    if (filters.platforms.length && !filters.platforms.includes(row.tracked_videos.platform)) continue
    if (!matchesContentType(row.tracked_videos, filters.contentType)) continue
    const dateKey = normalizeDateKey(row.date)
    dailyViewsByDate.set(dateKey, (dailyViewsByDate.get(dateKey) ?? 0) + (row.views ?? 0))
  }

  const postedAtViewsByDate = await fetchPostedAtViewsByDate(
    ids, "2020-01-01", filters.dateTo, filters.platforms, filters.contentType,
  )

  const firstSyncDate = await fetchFirstSyncDate(ids)

  for (const d of days) {
    const b = bucketMap.get(d)!
    b.views = resolveViewsForDay(d, firstSyncDate, dailyViewsByDate, postedAtViewsByDate)
  }

  return days.map((d) => bucketMap.get(d)!)
}

function toPublicMetricBucket(b: InternalDailyBucket): DailyMetricBucket {
  return {
    date: b.date,
    views: b.views,
    posted_videos: b.posted_videos,
    likes: b.likes,
    comments: b.comments,
    shares: b.shares,
    active_accounts: b.accountIds.size,
    engagement_rate: b.engagementCount
      ? Math.round((b.engagementSum / b.engagementCount) * 100) / 100
      : 0,
  }
}

function internalMetricValue(b: InternalDailyBucket, metric: ChartMetricId): number {
  if (metric === "active_accounts") return b.accountIds.size
  if (metric === "engagement_rate") {
    return b.engagementCount
      ? Math.round((b.engagementSum / b.engagementCount) * 100) / 100
      : 0
  }
  return b[metric]
}

export function aggregateMetricSeries(
  buckets: DailyMetricBucket[],
  metric: ChartMetricId,
  aggregation: ChartAggregation,
  mode: ChartMode,
): MetricDataPoint[] {
  // Public buckets only support day-level aggregation accurately for active_accounts
  return aggregateInternalMetricSeries(
    buckets.map((b) => ({
      ...b,
      accountIds: new Set<string>(),
      engagementSum: b.engagement_rate,
      engagementCount: b.engagement_rate > 0 ? 1 : 0,
    })),
    metric,
    aggregation,
    mode,
  )
}

function aggregateInternalMetricSeries(
  buckets: InternalDailyBucket[],
  metric: ChartMetricId,
  aggregation: ChartAggregation,
  mode: ChartMode,
): MetricDataPoint[] {
  if (aggregation === "day") {
    const points = buckets.map((b) => ({
      date: b.date,
      value: internalMetricValue(b, metric),
    }))
    return mode === "cumulative" ? toCumulative(points) : points
  }

  interface GroupAcc {
    sum: number
    engagementSum: number
    engagementCount: number
    accountIds: Set<string>
  }

  const grouped = new Map<string, GroupAcc>()
  const orderedKeys: string[] = []

  for (const b of buckets) {
    const key = aggregationBucketKey(b.date, aggregation)
    if (!grouped.has(key)) {
      grouped.set(key, { sum: 0, engagementSum: 0, engagementCount: 0, accountIds: new Set() })
      orderedKeys.push(key)
    }
    const g = grouped.get(key)!
    if (metric === "active_accounts") {
      for (const id of Array.from(b.accountIds)) g.accountIds.add(id)
    } else if (metric === "engagement_rate") {
      g.engagementSum += b.engagementSum
      g.engagementCount += b.engagementCount
    } else {
      g.sum += b[metric]
    }
  }

  const points: MetricDataPoint[] = orderedKeys.map((key) => {
    const g = grouped.get(key)!
    let value = g.sum
    if (metric === "active_accounts") value = g.accountIds.size
    if (metric === "engagement_rate") {
      value = g.engagementCount
        ? Math.round((g.engagementSum / g.engagementCount) * 100) / 100
        : 0
    }
    return { date: key, value }
  })

  return mode === "cumulative" ? toCumulative(points) : points
}

export async function fetchMetricData(
  filters: AnalyticsFilters,
  accountIds: string[],
  metric: ChartMetricId,
  aggregation: ChartAggregation,
  mode: ChartMode = "discrete",
): Promise<MetricDataPoint[]> {
  const buckets = await fetchInternalDailyMetricBuckets(filters, accountIds)
  return aggregateInternalMetricSeries(buckets, metric, aggregation, mode)
}

export async function buildCombinedChartData(
  filters: AnalyticsFilters,
  accountIds: string[],
  metrics: ChartMetricId[],
  aggregation: ChartAggregation,
  mode: ChartMode,
): Promise<CombinedChartRow[]> {
  if (!metrics.length) return []

  const buckets = await fetchInternalDailyMetricBuckets(filters, accountIds)
  const seriesByMetric = new Map<ChartMetricId, Map<string, number>>()

  for (const metric of metrics) {
    const series = aggregateInternalMetricSeries(buckets, metric, aggregation, mode)
    seriesByMetric.set(metric, new Map(series.map((p) => [p.date, p.value])))
  }

  const allDates = allAggregationKeys(filters.dateFrom, filters.dateTo, aggregation)

  return allDates.map((date) => {
    const row: CombinedChartRow = {
      date,
      label: formatMetricLabel(date, aggregation),
    }
    for (const metric of metrics) {
      row[metric] = seriesByMetric.get(metric)?.get(date) ?? 0
    }
    return row
  })
}

/** @deprecated Use buildCombinedChartData */
export async function buildCombinedChartRows(
  filters: AnalyticsFilters,
  accountIds: string[],
  metrics: ChartMetricId[],
  aggregation: ChartAggregation,
  mode: ChartMode,
): Promise<CombinedChartRow[]> {
  return buildCombinedChartData(filters, accountIds, metrics, aggregation, mode)
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
    .select("id, caption, views, likes, comments, thumbnail_url, platform, posted_at, duration_seconds, tracked_accounts(username, display_name, avatar_url)")
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
    duration_seconds: number | null
    tracked_accounts: { username: string; display_name: string | null; avatar_url: string | null } | null
  }

  const rows = ((data ?? []) as unknown as Row[]).filter((r) =>
    matchesContentType(
      { platform: r.platform, duration_seconds: r.duration_seconds },
      filters.contentType,
    ),
  )

  return rows.map((r) => ({
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

  const videos = await fetchVideosInRange(
    ids, filters.dateFrom, filters.dateTo, filters.platforms, filters.contentType,
  )
  if (!videos.length) return []

  const viewsByAccount = new Map<string, number>()
  for (const v of videos) {
    viewsByAccount.set(
      v.account_id,
      (viewsByAccount.get(v.account_id) ?? 0) + (v.views ?? 0),
    )
  }

  const activeIds = Array.from(viewsByAccount.keys())
  let query = supabase
    .from("tracked_accounts")
    .select("id, username, display_name, avatar_url, platform")
    .in("id", activeIds)

  if (filters.platforms.length) query = query.in("platform", filters.platforms)

  const { data, error } = await query
  if (error) throw new Error(error.message)

  interface AccountRow {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
    platform: Platform
  }

  return ((data ?? []) as AccountRow[])
    .map((a) => ({
      ...a,
      total_views: viewsByAccount.get(a.id) ?? 0,
    }))
    .sort((a, b) => (b.total_views ?? 0) - (a.total_views ?? 0))
    .slice(0, limit)
}

export async function fetchHeatmapData(
  userId?: string,
  scopedAccountIds?: string[],
): Promise<Map<string, number>> {
  const accountIds = scopedAccountIds?.length
    ? scopedAccountIds
    : await fetchUserAccountIds(userId)
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
