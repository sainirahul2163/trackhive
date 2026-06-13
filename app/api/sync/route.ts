import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase-server"
import {
  getYouTubeChannelInfo,
  resolveYouTubeChannelId,
  EnsembleDataError,
  PLATFORM_LIMITATIONS,
} from "@/lib/ensembledata"
import { ScraperError } from "@/lib/scraper"
import { syncTikTokFromScraper } from "@/lib/tiktok-sync"
import { syncInstagramFromScraper } from "@/lib/instagram-sync"


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

async function syncInstagram(
  supabase: ReturnType<typeof createServerSupabase>,
  account:  TrackedAccountRow,
) {
  await syncInstagramFromScraper(supabase, account, 30)
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

function toNum(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value)
  return Number.isFinite(n) ? Math.trunc(n) : 0
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
