import { format, subDays } from "date-fns"
import { supabase } from "@/lib/supabase"
import type { TrackedAccount, TrackedVideo } from "@/types"

/** Returns tracked accounts scoped to the given userId. */
export async function fetchTrackedAccounts(userId?: string): Promise<TrackedAccount[]> {
  let query = supabase
    .from("tracked_accounts")
    .select("*")
    .order("total_views", { ascending: false })

  if (userId) {
    query = query.eq("workspace_id", userId)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data as TrackedAccount[]
}

export async function fetchTrackedAccount(id: string): Promise<TrackedAccount> {
  const { data, error } = await supabase
    .from("tracked_accounts")
    .select("*")
    .eq("id", id)
    .single()

  if (error) throw new Error(error.message)
  return data as TrackedAccount
}

export async function fetchTrackedVideos(accountId: string): Promise<TrackedVideo[]> {
  const { data, error } = await supabase
    .from("tracked_videos")
    .select("*")
    .eq("account_id", accountId)
    .order("posted_at", { ascending: false })
    .limit(1000)

  if (error) throw new Error(error.message)
  return data as TrackedVideo[]
}

export interface AccountVideoAggregates {
  total_views:    number
  total_likes:    number
  total_comments: number
}

/** SUM(views), SUM(likes), SUM(comments) for all videos on an account. */
export async function fetchAccountVideoAggregates(
  accountId: string,
): Promise<AccountVideoAggregates> {
  const { data, error } = await supabase
    .from("tracked_videos")
    .select("views, likes, comments")
    .eq("account_id", accountId)

  if (error) throw new Error(error.message)

  const rows = data ?? []
  return rows.reduce<AccountVideoAggregates>(
    (acc, row) => ({
      total_views:    acc.total_views    + Number(row.views    ?? 0),
      total_likes:    acc.total_likes    + Number(row.likes    ?? 0),
      total_comments: acc.total_comments + Number(row.comments ?? 0),
    }),
    { total_views: 0, total_likes: 0, total_comments: 0 },
  )
}

export interface DailyViewsPoint {
  date:     string
  views:    number
  likes:    number
  comments: number
  shares:   number
}

function normalizeDateKey(value: string): string {
  return value.split("T")[0]
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

export async function fetchDailyStats(accountId: string, days = 30): Promise<DailyViewsPoint[]> {
  const since = new Date()
  since.setUTCDate(since.getUTCDate() - days)
  const sinceStr = since.toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from("video_daily_stats")
    .select("date, views, likes, comments, shares, tracked_videos!inner(account_id)")
    .eq("tracked_videos.account_id", accountId)
    .gte("date", sinceStr)
    .order("date", { ascending: true })
    .limit(1000)

  if (error) throw new Error(error.message)

  const byDate = new Map<string, DailyViewsPoint>()
  for (const row of (data ?? []) as (DailyViewsPoint & { tracked_videos: unknown })[]) {
    const dateKey = normalizeDateKey(row.date)
    const existing = byDate.get(dateKey)
    if (existing) {
      existing.views    += Number(row.views    ?? 0)
      existing.likes    += Number(row.likes    ?? 0)
      existing.comments += Number(row.comments ?? 0)
      existing.shares   += Number(row.shares   ?? 0)
    } else {
      byDate.set(dateKey, {
        date:     dateKey,
        views:    Number(row.views    ?? 0),
        likes:    Number(row.likes    ?? 0),
        comments: Number(row.comments ?? 0),
        shares:   Number(row.shares   ?? 0),
      })
    }
  }
  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date))
}

export function filterStatsByDays<T extends { date: string }>(points: T[], days: number): T[] {
  const since = new Date()
  since.setUTCDate(since.getUTCDate() - days)
  const sinceStr = since.toISOString().slice(0, 10)
  return points.filter((p) => normalizeDateKey(p.date) >= sinceStr)
}

export type ViewsChartLabel = "Daily Views" | "Views by Post Date" | "Views History"

export interface SmartChartPoint {
  date:  string
  views: number
}

export interface SmartChartResult {
  points: SmartChartPoint[]
  label:  ViewsChartLabel
  isEmpty: boolean
}

/**
 * Builds views chart data: posted_at spreads history; daily_stats apply on/after
 * the first snapshot date. Output is cumulative for a smooth growth curve.
 */
export function buildSmartChartData(
  dailyStats: DailyViewsPoint[],
  videos: TrackedVideo[],
  days: number,
): SmartChartResult {
  const endStr = format(new Date(), "yyyy-MM-dd")
  const startStr = format(subDays(new Date(), days), "yyyy-MM-dd")
  const dayKeys = eachDayInRange(startStr, endStr)

  const hasPostsInRange = videos.some((v) => {
    if (!v.posted_at) return false
    const dateKey = normalizeDateKey(v.posted_at)
    return dateKey >= startStr && dateKey <= endStr
  })

  const statsInRange = dailyStats.filter((s) => {
    const dateKey = normalizeDateKey(s.date)
    return dateKey >= startStr && dateKey <= endStr
  })

  if (statsInRange.length === 0 && !hasPostsInRange) {
    return { points: [], label: "Daily Views", isEmpty: true }
  }

  const dailyByDate = new Map<string, number>()
  for (const stat of dailyStats) {
    const dateKey = normalizeDateKey(stat.date)
    if (dateKey < startStr || dateKey > endStr) continue
    dailyByDate.set(dateKey, (dailyByDate.get(dateKey) ?? 0) + stat.views)
  }

  const postedAtByDate = new Map<string, number>()
  for (const video of videos) {
    if (!video.posted_at) continue
    const dateKey = normalizeDateKey(video.posted_at)
    postedAtByDate.set(dateKey, (postedAtByDate.get(dateKey) ?? 0) + Number(video.views ?? 0))
  }

  const earliestStatsDate =
    dailyStats.length > 0
      ? dailyStats.map((s) => normalizeDateKey(s.date)).sort()[0]
      : null

  let usedDaily = false
  let usedProxy = false
  const discretePoints: SmartChartPoint[] = []

  for (const dateKey of dayKeys) {
    const useDailyStats = earliestStatsDate !== null && dateKey >= earliestStatsDate

    if (useDailyStats) {
      const views = dailyByDate.get(dateKey) ?? 0
      if (dailyByDate.has(dateKey)) usedDaily = true
      discretePoints.push({ date: dateKey, views })
    } else {
      const views = postedAtByDate.get(dateKey) ?? 0
      if (postedAtByDate.has(dateKey)) usedProxy = true
      discretePoints.push({ date: dateKey, views })
    }
  }

  let running = 0
  const points = discretePoints.map((p) => {
    running += p.views
    return { date: p.date, views: running }
  })

  let label: ViewsChartLabel = "Views by Post Date"
  if (usedDaily && usedProxy) {
    label = "Views History"
  } else if (usedDaily) {
    label = "Daily Views"
  }

  return { points, label, isEmpty: false }
}

export interface FollowerSnapshotPoint {
  date:            string
  follower_count:  number
}

export async function fetchFollowerSnapshots(
  accountId: string,
  days = 90,
): Promise<FollowerSnapshotPoint[]> {
  const since = new Date()
  since.setDate(since.getDate() - days)
  const sinceStr = since.toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from("follower_snapshots")
    .select("date, follower_count")
    .eq("account_id", accountId)
    .gte("date", sinceStr)
    .order("date", { ascending: true })

  if (error) throw new Error(error.message)

  return (data ?? []).map((row) => ({
    date:           String(row.date),
    follower_count: Number(row.follower_count ?? 0),
  }))
}

export async function insertTrackedAccount(
  account: Omit<TrackedAccount, "id" | "created_at">
): Promise<TrackedAccount> {
  const { data, error } = await supabase
    .from("tracked_accounts")
    .insert(account)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as TrackedAccount
}
