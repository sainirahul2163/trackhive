import { createServerSupabase } from "@/lib/supabase-server"
import { scrapeInstagramProfile, scrapeInstagramReels } from "@/lib/scraper"

type SupabaseClient = ReturnType<typeof createServerSupabase>

interface TrackedVideoRow {
  account_id:       string
  platform:         "instagram"
  video_url:        string
  thumbnail_url:    string | null
  caption:          string | null
  views:            number
  likes:            number
  comments:         number
  shares:           number
  engagement_rate:  number
  virality_score:   number
  posted_at:        string | null
  duration_seconds?: number
}

function toNum(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value)
  return Number.isFinite(n) ? Math.trunc(n) : 0
}

function computeVideoEngagementRate(views: number, likes: number, comments: number): number {
  if (!views) return 0
  return Math.round(((likes + comments) / views) * 100 * 100) / 100
}

function computeEngagementRate(
  items: { views: number; likes: number; comments: number }[],
): number {
  if (!items.length) return 0
  const totalViews = items.reduce((s, v) => s + v.views, 0)
  if (!totalViews) return 0
  const totalEngage = items.reduce((s, v) => s + v.likes + v.comments, 0)
  return Math.round((totalEngage / totalViews) * 100 * 100) / 100
}

async function upsertTrackedVideo(
  supabase: SupabaseClient,
  videoPayload: TrackedVideoRow,
): Promise<{ id: string } | null> {
  if (!videoPayload.video_url) return null

  const { data, error } = await supabase
    .from("tracked_videos")
    .upsert(videoPayload, { onConflict: "video_url" })
    .select("id")
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (data?.id) return data

  const { data: existing, error: findErr } = await supabase
    .from("tracked_videos")
    .select("id")
    .eq("video_url", videoPayload.video_url)
    .maybeSingle()

  if (findErr) throw new Error(findErr.message)
  return existing
}

async function insertDailySnapshot(
  supabase: SupabaseClient,
  videoId: string,
  stats: { views: number; likes: number; comments: number; shares: number },
) {
  const today = new Date().toISOString().slice(0, 10)
  const { error } = await supabase
    .from("video_daily_stats")
    .upsert(
      {
        video_id: videoId,
        date:     today,
        views:    toNum(stats.views),
        likes:    toNum(stats.likes),
        comments: toNum(stats.comments),
        shares:   toNum(stats.shares),
      },
      { onConflict: "video_id,date" },
    )

  if (error) {
    console.error("[instagram-sync] video_daily_stats upsert error:", error.message)
  }
}

async function insertFollowerSnapshot(
  supabase: SupabaseClient,
  accountId: string,
  followerCount: number,
) {
  const today = new Date().toISOString().slice(0, 10)
  const { error } = await supabase
    .from("follower_snapshots")
    .upsert(
      {
        account_id:     accountId,
        follower_count: toNum(followerCount),
        date:           today,
      },
      { onConflict: "account_id,date" },
    )

  if (error) {
    console.error("[instagram-sync] follower_snapshots upsert error:", error.message)
  }
}

export async function syncInstagramFromScraper(
  supabase: SupabaseClient,
  account: { id: string; username: string },
  reelLimit = 30,
): Promise<{ username: string; reelsSaved: number; followerCount: number }> {
  const [profile, reels] = await Promise.all([
    scrapeInstagramProfile(account.username),
    scrapeInstagramReels(account.username, reelLimit),
  ])

  const totalViews = reels.reduce((s, r) => s + toNum(r.views), 0)
  const avgViews   = reels.length ? Math.round(totalViews / reels.length) : 0
  const engRate    = computeEngagementRate(reels.map((r) => ({
    views:    toNum(r.views),
    likes:    toNum(r.likes),
    comments: toNum(r.comments),
  })))

  await supabase
    .from("tracked_accounts")
    .update({
      username:        profile.username,
      display_name:    profile.display_name,
      avatar_url:      profile.avatar_url,
      follower_count:  toNum(profile.follower_count),
      total_views:     totalViews,
      avg_views:       avgViews,
      engagement_rate: engRate,
      last_synced_at:  new Date().toISOString(),
    })
    .eq("id", account.id)

  await insertFollowerSnapshot(supabase, account.id, profile.follower_count)

  let reelsSaved = 0
  for (const reel of reels) {
    const shortcode = reel.shortcode.trim()
    if (!shortcode) continue

    const views    = toNum(reel.views)
    const likes    = toNum(reel.likes)
    const comments = toNum(reel.comments)

    const payload: TrackedVideoRow = {
      account_id:      account.id,
      platform:        "instagram",
      video_url:       `https://www.instagram.com/reel/${shortcode}/`,
      thumbnail_url:   reel.thumbnail_url || null,
      caption:         reel.description || null,
      views,
      likes,
      comments,
      shares:          0,
      engagement_rate: computeVideoEngagementRate(views, likes, comments),
      virality_score:  Math.round(Math.min(10, (views / 50_000) * 10) * 10) / 10,
      posted_at:       reel.posted_at || null,
      duration_seconds: reel.duration_seconds ?? undefined,
    }

    const upserted = await upsertTrackedVideo(supabase, payload)
    if (upserted?.id) {
      await insertDailySnapshot(supabase, upserted.id, { views, likes, comments, shares: 0 })
      reelsSaved++
    }
  }

  return {
    username:      profile.username,
    reelsSaved,
    followerCount: profile.follower_count,
  }
}
