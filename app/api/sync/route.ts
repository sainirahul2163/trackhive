import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase-server"
import {
  getTikTokUserInfo,
  getTikTokUserVideos,
  getInstagramUserInfo,
  fetchInstagramReelsApify,
  EnsembleDataError,
  PLATFORM_LIMITATIONS,
} from "@/lib/ensembledata"


interface TrackedAccountRow {
  id:             string
  platform:       "tiktok" | "instagram" | "youtube" | "facebook"
  username:       string
  last_synced_at: string | null
}

interface SyncResult {
  synced:  number
  failed:  number
  skipped: number
  errors:  { id: string; username: string; error: string }[]
}

const ONE_HOUR_MS = 60 * 60 * 1000

/** Columns that exist on tracked_videos (per migrations 001 + 008). */
interface TrackedVideoRow {
  account_id:      string
  platform:        TrackedAccountRow["platform"]
  video_url:       string
  thumbnail_url:   string | null
  caption:         string | null
  views:           number
  likes:           number
  comments:        number
  shares:          number
  engagement_rate: number
  virality_score:  number
  posted_at:       string | null
}

export async function POST(req: Request) {
  // Optional: single-account sync via body { accountId }
  let accountId: string | null = null
  try {
    const body = (await req.json()) as { accountId?: string }
    accountId = body.accountId ?? null
  } catch {
    // No body is fine — full sync mode
  }

  const supabase = createServerSupabase()
  const result: SyncResult = { synced: 0, failed: 0, skipped: 0, errors: [] }

  // ── Fetch accounts to sync ─────────────────────────────────────────────────
  let query = supabase
    .from("tracked_accounts")
    .select("id, platform, username, last_synced_at")

  if (accountId) {
    query = query.eq("id", accountId)
  }

  const { data: accounts, error: fetchErr } = await query
  if (fetchErr) {
    return NextResponse.json({ error: fetchErr.message }, { status: 500 })
  }

  const rows = (accounts ?? []) as TrackedAccountRow[]

  // ── Process each account ───────────────────────────────────────────────────
  for (const account of rows) {
    const lastSynced = account.last_synced_at ? new Date(account.last_synced_at).getTime() : 0
    const staleSince = Date.now() - lastSynced

    // Skip accounts synced within the last hour (unless forced single-account sync)
    if (!accountId && staleSince < ONE_HOUR_MS) {
      result.skipped++
      continue
    }

    try {
      if (account.platform === "tiktok") {
        await syncTikTok(supabase, account)
      } else if (account.platform === "instagram") {
        await syncInstagram(supabase, account)
      } else {
        // youtube / facebook — skip (YouTube needs separate key)
        result.skipped++
        continue
      }
      result.synced++
    } catch (err) {
      result.failed++
      result.errors.push({
        id:       account.id,
        username: account.username,
        error:    err instanceof EnsembleDataError ? err.message : String(err),
      })
    }
  }

  return NextResponse.json({ ...result, platform_limitations: PLATFORM_LIMITATIONS })
}

// ─── TikTok sync ──────────────────────────────────────────────────────────────

async function syncTikTok(
  supabase: ReturnType<typeof createServerSupabase>,
  account:  TrackedAccountRow,
) {
  const [info, videos] = await Promise.all([
    getTikTokUserInfo(account.username),
    getTikTokUserVideos(account.username, 2),
  ])

  // Compute aggregate stats from videos
  const totalViews = videos.reduce((s, v) => s + v.views, 0)
  const avgViews   = videos.length ? Math.round(totalViews / videos.length) : 0
  const engRate    = computeEngagementRate(videos.map((v) => ({
    views: v.views, likes: v.likes, comments: v.comments, shares: v.shares,
  })))

  // Update tracked_accounts
  await supabase
    .from("tracked_accounts")
    .update({
      display_name:    info.display_name,
      avatar_url:      info.avatar_url,
      follower_count:  info.follower_count,
      total_views:     totalViews,
      avg_views:       avgViews,
      engagement_rate: engRate,
      last_synced_at:  new Date().toISOString(),
    })
    .eq("id", account.id)

  for (const video of videos) {
    const videoUrl = `https://www.tiktok.com/@${account.username}/video/${video.id}`
    const engagementRate = video.views
      ? (((video.likes + video.comments + video.shares) / video.views) * 100)
      : 0
    const viralityScore = Math.min(10, Math.round((video.views / 100_000) * 10) / 10)

    const payload: TrackedVideoRow = {
      account_id:      account.id,
      platform:        "tiktok",
      video_url:       videoUrl,
      thumbnail_url:   video.thumbnail || null,
      caption:         video.description || null,
      views:           video.views,
      likes:           video.likes,
      comments:        video.comments,
      shares:          video.shares,
      engagement_rate: Math.round(engagementRate * 100) / 100,
      virality_score:  viralityScore,
      posted_at:       video.created_at || null,
    }

    const upserted = await upsertTrackedVideo(supabase, payload)
    if (upserted?.id) {
      await insertDailySnapshot(supabase, upserted.id, video)
    }
  }
}

// ─── Instagram sync ───────────────────────────────────────────────────────────
// Profile info: EnsembleData. Reels + views: Apify instagram-reel-scraper.

async function syncInstagram(
  supabase: ReturnType<typeof createServerSupabase>,
  account:  TrackedAccountRow,
) {
  const [info, reels] = await Promise.all([
    getInstagramUserInfo(account.username),
    fetchInstagramReelsApify(account.username),
  ])

  const totalViews = reels.reduce((s, r) => s + r.views, 0)
  const avgViews   = reels.length ? Math.round(totalViews / reels.length) : 0
  const engRate    = computeEngagementRate(reels.map((r) => ({
    views: r.views, likes: r.likes, comments: r.comments, shares: 0,
  })))

  await supabase
    .from("tracked_accounts")
    .update({
      display_name:    info.full_name || info.username,
      avatar_url:      info.avatar_url,
      follower_count:  info.follower_count,
      total_views:     totalViews,
      avg_views:       avgViews,
      engagement_rate: engRate,
      last_synced_at:  new Date().toISOString(),
    })
    .eq("id", account.id)

  for (const reel of reels) {
    const videoUrl = `https://www.instagram.com/reel/${reel.shortcode}/`
    const engagementRate = reel.views
      ? (((reel.likes + reel.comments) / reel.views) * 100)
      : 0
    const viralityScore = Math.min(10, Math.round((reel.views / 50_000) * 10) / 10)

    const payload: TrackedVideoRow = {
      account_id:      account.id,
      platform:        "instagram",
      video_url:       videoUrl,
      thumbnail_url:   reel.thumbnail || null,
      caption:         reel.caption || null,
      views:           reel.views,
      likes:           reel.likes,
      comments:        reel.comments,
      shares:          0,
      engagement_rate: Math.round(engagementRate * 100) / 100,
      virality_score:  viralityScore,
      posted_at:       reel.created_at || null,
    }

    const upserted = await upsertTrackedVideo(supabase, payload)
    if (upserted?.id) {
      await insertDailySnapshot(supabase, upserted.id, {
        views:    reel.views,
        likes:    reel.likes,
        comments: reel.comments,
        shares:   0,
      })
    }
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Insert or update by account_id + video_url (no unique constraint on video_url for upsert). */
async function upsertTrackedVideo(
  supabase: ReturnType<typeof createServerSupabase>,
  payload: TrackedVideoRow,
): Promise<{ id: string } | null> {
  console.log("[sync] tracked_videos payload:", JSON.stringify(payload))

  const { data: existing, error: findErr } = await supabase
    .from("tracked_videos")
    .select("id")
    .eq("account_id", payload.account_id)
    .eq("video_url", payload.video_url)
    .maybeSingle()

  if (findErr) {
    console.error("[sync] tracked_videos lookup error:", findErr.message)
    throw new Error(findErr.message)
  }

  if (existing?.id) {
    const { data, error } = await supabase
      .from("tracked_videos")
      .update(payload)
      .eq("id", existing.id)
      .select("id")
      .single()

    if (error) {
      console.error("[sync] tracked_videos update error:", error.message, payload)
      throw new Error(error.message)
    }
    return data
  }

  const { data, error } = await supabase
    .from("tracked_videos")
    .insert(payload)
    .select("id")
    .single()

  if (error) {
    console.error("[sync] tracked_videos insert error:", error.message, payload)
    throw new Error(error.message)
  }
  return data
}

function computeEngagementRate(
  items: { views: number; likes: number; comments: number; shares: number }[],
): number {
  if (!items.length) return 0
  const totalViews = items.reduce((s, v) => s + v.views, 0)
  if (!totalViews) return 0
  const totalEngage = items.reduce((s, v) => s + v.likes + v.comments + v.shares, 0)
  return Math.round((totalEngage / totalViews) * 100 * 100) / 100
}

async function insertDailySnapshot(
  supabase:  ReturnType<typeof createServerSupabase>,
  videoId:   string,
  stats:     { views: number; likes: number; comments: number; shares: number },
) {
  const today = new Date().toISOString().slice(0, 10)
  await supabase
    .from("video_daily_stats")
    .upsert(
      {
        video_id: videoId,
        date:     today,
        views:    stats.views,
        likes:    stats.likes,
        comments: stats.comments,
        shares:   stats.shares,
      },
      { onConflict: "video_id,date" },
    )
}
