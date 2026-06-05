import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase-server"
import {
  getTikTokUserInfo,
  getTikTokUserVideos,
  fetchInstagramProfileApify,
  fetchInstagramReelsApify,
  EnsembleDataError,
  PLATFORM_LIMITATIONS,
  type TikTokVideo,
  type InstagramPost,
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

/** Exact tracked_videos insert columns (migrations 001 + 008). */
interface TrackedVideoRow {
  account_id:       string
  platform:         TrackedAccountRow["platform"]
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
  audio_name?:      string | null
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

  await insertFollowerSnapshot(supabase, account.id, info.follower_count)

  for (const video of videos) {
    const videoId = String(video.id ?? "").trim()
    if (!videoId) {
      console.log("[sync] TikTok: skipping video with missing id")
      continue
    }

    console.log("[TikTok raw video]", JSON.stringify(video).substring(0, 800))

    const views    = toNum(video.views)
    const likes    = toNum(video.likes)
    const comments = toNum(video.comments)
    const shares   = resolveTikTokShares(video)
    const engagementRate = views
      ? (((likes + comments + shares) / views) * 100)
      : 0

    const payload = buildTrackedVideoPayload({
      account_id:      account.id,
      platform:        "tiktok",
      video_url:       `https://www.tiktok.com/@${account.username}/video/${videoId}`,
      thumbnail_url:   resolveThumbnailUrl(video.thumbnail),
      caption:         video.description,
      views,
      likes,
      comments,
      shares,
      engagement_rate: engagementRate,
      virality_score:  Math.min(10, (views / 100_000) * 10),
      posted_at:       video.created_at,
    })

    const upserted = await upsertTrackedVideo(supabase, payload)
    if (upserted?.id) {
      await insertDailySnapshot(supabase, upserted.id, video)
    }
  }
}

// ─── Instagram sync ───────────────────────────────────────────────────────────
// Profile + reels: Apify only (profile-scraper + reel-scraper).

async function syncInstagram(
  supabase: ReturnType<typeof createServerSupabase>,
  account:  TrackedAccountRow,
) {
  console.log("Apify token:", !!process.env.APIFY_API_TOKEN)

  const profileResult = await fetchInstagramProfileApify(account.username)
  console.log("Instagram profile result:", JSON.stringify(profileResult))

  if (!profileResult) {
    throw new Error(`Instagram profile not found for @${account.username}`)
  }

  const reels = await fetchInstagramReelsApify(account.username)
  console.log("Instagram reels count:", reels?.length)

  const totalViews = reels.reduce((s, r) => s + r.views, 0)
  const avgViews   = reels.length ? Math.round(totalViews / reels.length) : 0
  const engRate    = computeEngagementRate(reels.map((r) => ({
    views: r.views, likes: r.likes, comments: r.comments, shares: r.shares,
  })))

  await supabase
    .from("tracked_accounts")
    .update({
      display_name:    profileResult.display_name || profileResult.username,
      avatar_url:      profileResult.avatar_url,
      follower_count:  profileResult.follower_count,
      total_views:     totalViews,
      avg_views:       avgViews,
      engagement_rate: engRate,
      last_synced_at:  new Date().toISOString(),
    })
    .eq("id", account.id)

  await insertFollowerSnapshot(supabase, account.id, profileResult.follower_count)

  for (const reel of reels) {
    const shortcode = String(reel.shortcode ?? reel.id ?? "").trim()
    if (!shortcode) {
      console.log("[sync] Instagram: skipping reel with missing shortcode")
      continue
    }

    console.log("[Instagram raw reel]", JSON.stringify(reel).substring(0, 800))
    console.log("[Instagram reel ALL keys]", Object.keys(reel))
    console.log("[Instagram reel shares fields]", {
      sharesCount:     reel.sharesCount,
      videoShareCount: reel.videoShareCount,
      shareCount:      reel.shareCount,
      shares:          reel.shares,
      videoPlayCount:  reel.videoPlayCount,
      likesCount:      reel.likesCount,
    })

    const views    = toNum(reel.views)
    const likes    = toNum(reel.likes)
    const comments = toNum(reel.comments)
    const shares   = resolveInstagramShares(reel)
    const engagementRate = views
      ? (((likes + comments + shares) / views) * 100)
      : 0

    const payload = buildTrackedVideoPayload({
      account_id:      account.id,
      platform:        "instagram",
      video_url:       `https://www.instagram.com/reel/${shortcode}/`,
      thumbnail_url:   resolveThumbnailUrl(reel.thumbnail),
      caption:         reel.caption,
      views,
      likes,
      comments,
      shares,
      engagement_rate: engagementRate,
      virality_score:  Math.min(10, (views / 50_000) * 10),
      posted_at:       reel.created_at,
    })

    const upserted = await upsertTrackedVideo(supabase, payload)
    if (upserted?.id) {
      await insertDailySnapshot(supabase, upserted.id, {
        views:    reel.views,
        likes:    reel.likes,
        comments: reel.comments,
        shares:   reel.shares,
      })
    }
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface TikTokVideoWithShares extends TikTokVideo {
  shareCount?:   number
  share_count?:  number
  statistics?:   { shareCount?: number; share_count?: number }
  stats?:        { shareCount?: number; share_count?: number }
  authorStats?:  { shareCount?: number }
}

interface InstagramReelWithShares extends InstagramPost {
  sharesCount?:     number
  videoShareCount?: number
  shareCount?:      number
  likesCount?:      number
  videoPlayCount?:  number | null
}

function resolveTikTokShares(video: TikTokVideo): number {
  const v = video as TikTokVideoWithShares
  return toNum(
    v.shares ??
    v.shareCount ??
    v.share_count ??
    v.statistics?.shareCount ??
    v.statistics?.share_count ??
    v.stats?.shareCount ??
    v.stats?.share_count ??
    v.authorStats?.shareCount ??
    0,
  )
}

function resolveInstagramShares(reel: InstagramPost): number {
  const r = reel as InstagramReelWithShares
  return toNum(
    r.shares ??
    r.sharesCount ??
    r.videoShareCount ??
    r.shareCount ??
    0,
  )
}

function resolveThumbnailUrl(url: string | null | undefined): string | null {
  const trimmed = url?.trim()
  return trimmed ? trimmed : null
}

function toNum(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value)
  return Number.isFinite(n) ? Math.trunc(n) : 0
}

/** Strip to exact tracked_videos schema; cast all numerics. */
function buildTrackedVideoPayload(input: {
  account_id:       string
  platform:         TrackedAccountRow["platform"]
  video_url:        string
  thumbnail_url?:   string | null
  caption?:         string | null
  views?:           unknown
  likes?:           unknown
  comments?:        unknown
  shares?:          unknown
  engagement_rate?: unknown
  virality_score?:  unknown
  posted_at?:       string | null
  duration_seconds?: unknown
  audio_name?:      string | null
}): TrackedVideoRow {
  const row: TrackedVideoRow = {
    account_id:      input.account_id,
    platform:        input.platform,
    video_url:       input.video_url.trim(),
    thumbnail_url:   input.thumbnail_url?.trim() || null,
    caption:         input.caption?.trim() || null,
    views:           toNum(input.views),
    likes:           toNum(input.likes),
    comments:        toNum(input.comments),
    shares:          toNum(input.shares),
    engagement_rate: Math.round(toNum(input.engagement_rate) * 100) / 100,
    virality_score:  Math.round(Math.min(10, toNum(input.virality_score)) * 10) / 10,
    posted_at:       input.posted_at || null,
  }

  if (input.duration_seconds != null) {
    row.duration_seconds = toNum(input.duration_seconds)
  }
  if (input.audio_name?.trim()) {
    row.audio_name = input.audio_name.trim()
  }

  return row
}

async function upsertTrackedVideo(
  supabase: ReturnType<typeof createServerSupabase>,
  videoPayload: TrackedVideoRow,
): Promise<{ id: string } | null> {
  if (!videoPayload.video_url) {
    console.log("Inserting video: skipped — video_url is empty")
    return null
  }

  console.log("Inserting video:", JSON.stringify(videoPayload))

  const { data, error } = await supabase
    .from("tracked_videos")
    .upsert(videoPayload, {
      onConflict: "video_url",
    })
    .select("id")
    .maybeSingle()

  if (error) {
    console.log("Insert error:", JSON.stringify(error))
    throw new Error(error.message)
  }

  if (data?.id) return data

  // Row already exists (ignoreDuplicates) — fetch id for daily snapshot
  const { data: existing, error: findErr } = await supabase
    .from("tracked_videos")
    .select("id")
    .eq("video_url", videoPayload.video_url)
    .maybeSingle()

  if (findErr) {
    console.log("Insert error:", JSON.stringify(findErr))
    throw new Error(findErr.message)
  }

  return existing
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
    console.log("[sync] video_daily_stats upsert error:", JSON.stringify(error))
  }
}

async function insertFollowerSnapshot(
  supabase:       ReturnType<typeof createServerSupabase>,
  accountId:      string,
  followerCount:  number,
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
    console.log("[sync] follower_snapshots upsert error:", JSON.stringify(error))
  }
}
