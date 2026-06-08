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

function dayBefore(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00.000Z`)
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().slice(0, 10)
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

interface RawDailyStatRow {
  date: string
  views: number
  likes: number
  comments: number
  shares: number
  video_id: string
}

function aggregateAccountDailyIncrements(
  rows: RawDailyStatRow[],
  sinceStr: string,
): DailyViewsPoint[] {
  const byVideo = new Map<string, Array<{ date: string; views: number; likes: number; comments: number; shares: number }>>()

  for (const row of rows) {
    const dateKey = normalizeDateKey(row.date)
    const list = byVideo.get(row.video_id) ?? []
    list.push({
      date: dateKey,
      views: Number(row.views ?? 0),
      likes: Number(row.likes ?? 0),
      comments: Number(row.comments ?? 0),
      shares: Number(row.shares ?? 0),
    })
    byVideo.set(row.video_id, list)
  }

  const byDate = new Map<string, DailyViewsPoint>()

  for (const entries of Array.from(byVideo.values())) {
    entries.sort((a, b) => a.date.localeCompare(b.date))
    let prevViews = 0
    let prevLikes = 0
    let prevComments = 0
    let prevShares = 0

    for (const entry of entries) {
      const viewInc = Math.max(0, entry.views - prevViews)
      const likeInc = Math.max(0, entry.likes - prevLikes)
      const commentInc = Math.max(0, entry.comments - prevComments)
      const shareInc = Math.max(0, entry.shares - prevShares)
      prevViews = entry.views
      prevLikes = entry.likes
      prevComments = entry.comments
      prevShares = entry.shares

      if (entry.date < sinceStr) continue

      const existing = byDate.get(entry.date)
      if (existing) {
        existing.views += viewInc
        existing.likes += likeInc
        existing.comments += commentInc
        existing.shares += shareInc
      } else {
        byDate.set(entry.date, {
          date: entry.date,
          views: viewInc,
          likes: likeInc,
          comments: commentInc,
          shares: shareInc,
        })
      }
    }
  }

  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date))
}

export async function fetchDailyStats(accountId: string, days = 30): Promise<DailyViewsPoint[]> {
  const since = new Date()
  since.setUTCDate(since.getUTCDate() - days)
  const sinceStr = since.toISOString().slice(0, 10)
  const fetchFrom = dayBefore(sinceStr)

  const allRows: RawDailyStatRow[] = []
  const pageSize = 1000
  let offset = 0

  while (true) {
    const { data, error } = await supabase
      .from("video_daily_stats")
      .select("date, views, likes, comments, shares, video_id, tracked_videos!inner(account_id)")
      .eq("tracked_videos.account_id", accountId)
      .gte("date", fetchFrom)
      .order("date", { ascending: true })
      .range(offset, offset + pageSize - 1)

    if (error) throw new Error(error.message)

    const rows = (data ?? []) as RawDailyStatRow[]
    if (!rows.length) break
    allRows.push(...rows)

    if (rows.length < pageSize) break
    offset += pageSize
  }

  return aggregateAccountDailyIncrements(allRows, sinceStr)
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

function resolveSmartChartViews(
  date: string,
  firstSyncDate: string | null,
  dailyByDate: Map<string, number>,
  postedAtByDate: Map<string, number>,
): number {
  if (dailyByDate.has(date)) return dailyByDate.get(date)!
  if (firstSyncDate && date >= firstSyncDate) return 0
  return postedAtByDate.get(date) ?? 0
}

/**
 * Builds views chart data: daily_stats when available; posted_at fallback
 * only for pre-sync dates without stats. Output is cumulative for smooth curve.
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

  const firstSyncDate =
    dailyStats.length > 0
      ? dailyStats.map((s) => normalizeDateKey(s.date)).sort()[0]
      : null

  let usedDaily = false
  let usedProxy = false
  const discretePoints: SmartChartPoint[] = []

  for (const dateKey of dayKeys) {
    const views = resolveSmartChartViews(dateKey, firstSyncDate, dailyByDate, postedAtByDate)
    if (dailyByDate.has(dateKey)) usedDaily = true
    else if (firstSyncDate && dateKey >= firstSyncDate) usedDaily = true
    else if (postedAtByDate.has(dateKey)) usedProxy = true
    discretePoints.push({ date: dateKey, views })
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
