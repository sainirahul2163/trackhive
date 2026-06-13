import { createServerSupabase } from "@/lib/supabase-server"
import { getYouTubeChannel, getYouTubeVideos } from "@/lib/youtube"

type SupabaseClient = ReturnType<typeof createServerSupabase>

interface TrackedVideoRow {
  account_id:       string
  platform:         "youtube"
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
    console.error("[youtube-sync] video_daily_stats upsert error:", error.message)
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
    console.error("[youtube-sync] follower_snapshots upsert error:", error.message)
  }
}

export async function syncYouTubeFromApi(
  supabase: SupabaseClient,
  account: { id: string; username: string },
  videoLimit = 30,
): Promise<{ channelId: string; videosSaved: number; subscriberCount: number }> {
  const channel = await getYouTubeChannel(account.username)
  const videos  = await getYouTubeVideos(channel.channel_id, videoLimit)

  const totalViews = videos.reduce((s, v) => s + toNum(v.views), 0)
  const avgViews   = videos.length ? Math.round(totalViews / videos.length) : 0
  const engRate    = computeEngagementRate(videos.map((v) => ({
    views:    toNum(v.views),
    likes:    toNum(v.likes),
    comments: toNum(v.comments),
  })))

  await supabase
    .from("tracked_accounts")
    .update({
      username:        channel.channel_id,
      display_name:    channel.display_name,
      avatar_url:      channel.avatar_url,
      follower_count:  channel.subscriber_count,
      total_views:     totalViews || channel.total_views,
      avg_views:       avgViews,
      engagement_rate: engRate,
      last_synced_at:  new Date().toISOString(),
    })
    .eq("id", account.id)

  await insertFollowerSnapshot(supabase, account.id, channel.subscriber_count)

  let videosSaved = 0
  for (const video of videos) {
    const videoId = video.video_id.trim()
    if (!videoId) continue

    const views    = toNum(video.views)
    const likes    = toNum(video.likes)
    const comments = toNum(video.comments)

    const payload: TrackedVideoRow = {
      account_id:      account.id,
      platform:        "youtube",
      video_url:       `https://www.youtube.com/watch?v=${videoId}`,
      thumbnail_url:   video.thumbnail_url || null,
      caption:         video.title || null,
      views,
      likes,
      comments,
      shares:          0,
      engagement_rate: computeVideoEngagementRate(views, likes, comments),
      virality_score:  Math.round(Math.min(10, (views / 100_000) * 10) * 10) / 10,
      posted_at:       video.published_at || null,
    }

    const upserted = await upsertTrackedVideo(supabase, payload)
    if (upserted?.id) {
      await insertDailySnapshot(supabase, upserted.id, { views, likes, comments, shares: 0 })
      videosSaved++
    }
  }

  return {
    channelId:       channel.channel_id,
    videosSaved,
    subscriberCount: channel.subscriber_count,
  }
}
