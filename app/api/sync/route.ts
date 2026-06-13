import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase-server"
import {
  fetchInstagramProfileApify,
  fetchInstagramReelsApify,
  getYouTubeChannelInfo,
  resolveYouTubeChannelId,
  EnsembleDataError,
  PLATFORM_LIMITATIONS,
  type InstagramPost,
} from "@/lib/ensembledata"
import { ScraperError } from "@/lib/scraper"
import { syncTikTokFromScraper } from "@/lib/tiktok-sync"


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
  saves?:           number
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
  } else {
    query = query.not("workspace_id", "is", null)
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
      } else if (account.platform === "youtube") {
        await syncYouTube(supabase, account)
      } else {
        result.skipped++
        continue
      }
      result.synced++
    } catch (err) {
      result.failed++
      result.errors.push({
        id:       account.id,
        username: account.username,
        error:    err instanceof EnsembleDataError || err instanceof ScraperError
          ? err.message
          : String(err),
      })
    }
  }

  console.log(`[sync] Synced ${result.synced} accounts, failed ${result.failed}, skipped ${result.skipped}`)
  return NextResponse.json({ ...result, platform_limitations: PLATFORM_LIMITATIONS })
}

// ─── TikTok sync ──────────────────────────────────────────────────────────────

async function syncTikTok(
  supabase: ReturnType<typeof createServerSupabase>,
  account:  TrackedAccountRow,
) {
  await syncTikTokFromScraper(supabase, account, 30)
}

// ─── Instagram sync ───────────────────────────────────────────────────────────
// Profile + reels: Apify only (profile-scraper + reel-scraper).

async function syncInstagram(
  supabase: ReturnType<typeof createServerSupabase>,
  account:  TrackedAccountRow,
) {
  console.log("Apify token:", !!process.env.APIFY_API_TOKEN)

  const profileResult = await fetchInstagramProfileApify(account.username)

  if (!profileResult) {
    throw new Error(`Instagram profile not found for @${account.username}`)
  }

  const reels = await fetchInstagramReelsApify(account.username)

  const totalViews = reels.reduce((s, r) => s + r.views, 0)
  const avgViews   = reels.length ? Math.round(totalViews / reels.length) : 0
  const engRate    = computeEngagementRate(reels.map((r) => ({
    views: r.views, likes: r.likes, comments: r.comments,
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
    if (!shortcode) continue

    const views    = toNum(reel.views)
    const likes    = toNum(reel.likes)
    const comments = toNum(reel.comments)
    const shares   = resolveInstagramShares(reel)
    const engagementRate = computeVideoEngagementRate(views, likes, comments)

    const payload = buildTrackedVideoPayload({
      account_id:       account.id,
      platform:         "instagram",
      video_url:        `https://www.instagram.com/reel/${shortcode}/`,
      thumbnail_url:    resolveThumbnailUrl(reel.thumbnail),
      caption:          reel.caption,
      views,
      likes,
      comments,
      shares,
      engagement_rate:  engagementRate,
      virality_score:   Math.min(10, (views / 50_000) * 10),
      posted_at:        reel.created_at,
      duration_seconds: reel.duration_seconds,
      audio_name:       reel.audio_name,
      saves:            reel.saves,
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

// ─── YouTube sync ─────────────────────────────────────────────────────────────

async function syncYouTube(
  supabase: ReturnType<typeof createServerSupabase>,
  account:  TrackedAccountRow,
) {
  const channelId = await resolveYouTubeChannelId(account.username)
  const info = await getYouTubeChannelInfo(channelId)

  await supabase
    .from("tracked_accounts")
    .update({
      username:        channelId,
      display_name:    info.channel_name,
      avatar_url:      info.avatar,
      follower_count:  info.subscriber_count,
      total_views:     info.total_views,
      avg_views:       info.video_count ? Math.round(info.total_views / info.video_count) : 0,
      engagement_rate: 0,
      last_synced_at:  new Date().toISOString(),
    })
    .eq("id", account.id)

  await insertFollowerSnapshot(supabase, account.id, info.subscriber_count)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface InstagramReelWithShares extends InstagramPost {
  sharesCount?:     number
  videoShareCount?: number
  shareCount?:      number
  likesCount?:      number
  videoPlayCount?:  number | null
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
  saves?:           unknown
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
  if (input.saves != null) {
    row.saves = toNum(input.saves)
  }

  return row
}

async function upsertTrackedVideo(
  supabase: ReturnType<typeof createServerSupabase>,
  videoPayload: TrackedVideoRow,
): Promise<{ id: string } | null> {
  if (!videoPayload.video_url) {
    return null
  }

  const { data, error } = await supabase
    .from("tracked_videos")
    .upsert(videoPayload, {
      onConflict: "video_url",
    })
    .select("id")
    .maybeSingle()

  if (error) {
    console.error("[sync] tracked_videos upsert error:", error.message)
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
    console.error("[sync] tracked_videos lookup error:", findErr.message)
    throw new Error(findErr.message)
  }

  return existing
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
    console.error("[sync] video_daily_stats upsert error:", error.message)
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
    console.error("[sync] follower_snapshots upsert error:", error.message)
  }
}
