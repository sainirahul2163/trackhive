import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase-server"
import { PLATFORM_LIMITATIONS } from "@/lib/ensembledata"
import { ScraperError } from "@/lib/scraper"
import { YouTubeApiError } from "@/lib/youtube"
import { syncTikTokFromScraper } from "@/lib/tiktok-sync"
import { syncInstagramFromScraper } from "@/lib/instagram-sync"
import { syncYouTubeFromApi } from "@/lib/youtube-sync"


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
        await syncTikTokFromScraper(supabase, account, 30)
      } else if (account.platform === "instagram") {
        await syncInstagramFromScraper(supabase, account, 30)
      } else if (account.platform === "youtube") {
        await syncYouTubeFromApi(supabase, account, 30)
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
        error:    err instanceof ScraperError || err instanceof YouTubeApiError
          ? err.message
          : String(err),
      })
    }
  }

  console.log(`[sync] Synced ${result.synced} accounts, failed ${result.failed}, skipped ${result.skipped}`)
  return NextResponse.json({ ...result, platform_limitations: PLATFORM_LIMITATIONS })
}
