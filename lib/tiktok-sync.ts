import { createServerSupabase } from "@/lib/supabase-server"
import { scrapeTikTokProfile, scrapeTikTokVideos } from "@/lib/scraper"

type SupabaseClient = ReturnType<typeof createServerSupabase>

interface TrackedVideoRow {
  account_id:       string
  platform:         "tiktok"
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
    console.error("[tiktok-sync] video_daily_stats upsert error:", error.message)
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
    console.error("[tiktok-sync] follower_snapshots upsert error:", error.message)
  }
}

export async function syncTikTokFromScraper(
  supabase: SupabaseClient,
  account: { id: string; username: string },
  videoLimit = 30,
): Promise<{ username: string; videosSaved: number; followerCount: number }> {
  const [profile, videos] = await Promise.all([
    scrapeTikTokProfile(account.username),
    scrapeTikTokVideos(account.username, videoLimit),
  ])

  const totalViews = videos.reduce((s, v) => s + toNum(v.views_count), 0)
  const avgViews   = videos.length ? Math.round(totalViews / videos.length) : 0
  const engRate    = computeEngagementRate(videos.map((v) => ({
    views:    toNum(v.views_count),
    likes:    toNum(v.likes_count),
    comments: toNum(v.comments_count),
  })))

  await supabase
    .from("tracked_accounts")
    .update({
      username:        profile.username,
      display_name:    profile.display_name,
      avatar_url:      profile.avatar_url,
      follower_count:  toNum(profile.followers_count),
      total_views:     totalViews,
      avg_views:       avgViews,
      engagement_rate: engRate,
      last_synced_at:  new Date().toISOString(),
    })
    .eq("id", account.id)

  await insertFollowerSnapshot(supabase, account.id, profile.followers_count)

  let videosSaved = 0
  for (const video of videos) {
    const videoId = String(video.video_id ?? "").trim()
    if (!videoId) continue

    const views    = toNum(video.views_count)
    const likes    = toNum(video.likes_count)
    const comments = toNum(video.comments_count)
    const shares   = toNum(video.shares_count)

    const payload: TrackedVideoRow = {
      account_id:      account.id,
      platform:        "tiktok",
      video_url:       `https://www.tiktok.com/@${profile.username}/video/${videoId}`,
      thumbnail_url:   video.thumbnail_url?.trim() || null,
      caption:         video.description?.trim() || null,
      views,
      likes,
      comments,
      shares,
      engagement_rate: computeVideoEngagementRate(views, likes, comments),
      virality_score:  Math.round(Math.min(10, (views / 100_000) * 10) * 10) / 10,
      posted_at:       video.posted_at || null,
    }

    const upserted = await upsertTrackedVideo(supabase, payload)
    if (upserted?.id) {
      await insertDailySnapshot(supabase, upserted.id, { views, likes, comments, shares })
      videosSaved++
    }
  }

  return {
    username:       profile.username,
    videosSaved,
    followerCount:  profile.followers_count,
  }
}
