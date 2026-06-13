import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase-server"
import { ScraperError } from "@/lib/scraper"
import { syncTikTokFromScraper } from "@/lib/tiktok-sync"

export async function POST(req: Request) {
  let accountId: string | null = null
  try {
    const body = (await req.json()) as { accountId?: string }
    accountId = body.accountId ?? null
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  if (!accountId) {
    return NextResponse.json({ error: "accountId is required" }, { status: 400 })
  }

  const supabase = createServerSupabase()

  const { data: account, error: fetchErr } = await supabase
    .from("tracked_accounts")
    .select("id, platform, username")
    .eq("id", accountId)
    .single()

  if (fetchErr || !account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 })
  }

  if (account.platform !== "tiktok") {
    return NextResponse.json({ error: "Scraper only supports TikTok accounts" }, { status: 400 })
  }

  try {
    const result = await syncTikTokFromScraper(supabase, account, 30)

    console.log(`[account/scrape] Scraped @${result.username}: ${result.videosSaved} videos`)
    return NextResponse.json({
      success:        true,
      username:       result.username,
      videos_saved:   result.videosSaved,
      follower_count: result.followerCount,
    })
  } catch (err) {
    if (err instanceof ScraperError) {
      const status = err.status >= 400 && err.status < 600 ? err.status : 502
      return NextResponse.json({ error: err.message }, { status })
    }
    console.error("[account/scrape]", err)
    return NextResponse.json({ error: "Failed to scrape TikTok account" }, { status: 500 })
  }
}
