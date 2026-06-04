import { supabase } from "@/lib/supabase"
import type { TrackedAccount, TrackedVideo } from "@/types"

export async function fetchTrackedAccounts(): Promise<TrackedAccount[]> {
  const { data, error } = await supabase
    .from("tracked_accounts")
    .select("*")
    .order("total_views", { ascending: false })

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

  const { data, error } = await supabase
    .from("video_daily_stats")
    .select("date, views, likes, comments, shares, tracked_videos!inner(account_id)")
    .eq("tracked_videos.account_id", accountId)
    .gte("date", since.toISOString().slice(0, 10))
    .order("date", { ascending: true })

  if (error) throw new Error(error.message)

  // Group by date and sum all videos
  const byDate = new Map<string, DailyViewsPoint>()
  for (const row of (data ?? []) as (DailyViewsPoint & { tracked_videos: unknown })[]) {
    const existing = byDate.get(row.date)
    if (existing) {
      existing.views    += row.views
      existing.likes    += row.likes
      existing.comments += row.comments
      existing.shares   += row.shares
    } else {
      byDate.set(row.date, { date: row.date, views: row.views, likes: row.likes, comments: row.comments, shares: row.shares })
    }
  }
  return Array.from(byDate.values())
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
