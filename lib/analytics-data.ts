import { addDays, format, subDays } from "date-fns"
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

export async function fetchDailyStats(accountId: string, days = 30): Promise<DailyViewsPoint[]> {
  const since = new Date()
  since.setDate(since.getDate() - days)
  const sinceStr = since.toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from("video_daily_stats")
    .select("date, views, likes, comments, shares, tracked_videos!inner(account_id)")
    .eq("tracked_videos.account_id", accountId)
    .gte("date", sinceStr)
    .order("date", { ascending: true })

  if (error) throw new Error(error.message)

  const byDate = new Map<string, DailyViewsPoint>()
  for (const row of (data ?? []) as (DailyViewsPoint & { tracked_videos: unknown })[]) {
    const existing = byDate.get(row.date)
    if (existing) {
      existing.views    += Number(row.views    ?? 0)
      existing.likes    += Number(row.likes    ?? 0)
      existing.comments += Number(row.comments ?? 0)
      existing.shares   += Number(row.shares   ?? 0)
    } else {
      byDate.set(row.date, {
        date:     row.date,
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
  since.setDate(since.getDate() - days)
  const sinceStr = since.toISOString().slice(0, 10)
  return points.filter((p) => p.date >= sinceStr)
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

/** Merges real daily snapshots with posted_at view proxies for gap dates. */
export function buildSmartChartData(
  dailyStats: DailyViewsPoint[],
  videos: TrackedVideo[],
  days: number,
): SmartChartResult {
  const endDate = new Date()
  const startDate = subDays(endDate, days)
  const startStr = format(startDate, "yyyy-MM-dd")
  const endStr = format(endDate, "yyyy-MM-dd")

  const statsInRange = dailyStats.filter((s) => s.date >= startStr && s.date <= endStr)
  const videosInRange = videos.filter((v) => {
    if (!v.posted_at) return false
    const dateKey = format(new Date(v.posted_at), "yyyy-MM-dd")
    return dateKey >= startStr && dateKey <= endStr
  })

  if (statsInRange.length === 0 && videosInRange.length === 0) {
    return { points: [], label: "Daily Views", isEmpty: true }
  }

  const viewsByDate = new Map<string, number>()
  const datesWithDailyStats = new Set<string>()
  const datesWithProxy = new Set<string>()

  for (const stat of statsInRange) {
    datesWithDailyStats.add(stat.date)
    viewsByDate.set(stat.date, (viewsByDate.get(stat.date) ?? 0) + stat.views)
  }

  for (const video of videosInRange) {
    const dateKey = format(new Date(video.posted_at!), "yyyy-MM-dd")
    if (datesWithDailyStats.has(dateKey)) continue
    datesWithProxy.add(dateKey)
    viewsByDate.set(dateKey, (viewsByDate.get(dateKey) ?? 0) + Number(video.views ?? 0))
  }

  const points: SmartChartPoint[] = []
  let current = startDate
  while (current <= endDate) {
    const dateKey = format(current, "yyyy-MM-dd")
    points.push({ date: dateKey, views: viewsByDate.get(dateKey) ?? 0 })
    current = addDays(current, 1)
  }

  let label: ViewsChartLabel = "Views by Post Date"
  if (datesWithDailyStats.size > 0 && datesWithProxy.size > 0) {
    label = "Views History"
  } else if (datesWithDailyStats.size > 0) {
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
