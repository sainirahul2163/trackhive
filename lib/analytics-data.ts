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
