import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase-server"
import { ScraperError } from "@/lib/scraper"
import { syncTikTokFromScraper } from "@/lib/tiktok-sync"
import { syncInstagramFromScraper } from "@/lib/instagram-sync"
import { syncFacebookFromScraper } from "@/lib/facebook-sync"

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

  const scraperPlatforms = ["tiktok", "instagram", "facebook"] as const
  if (!scraperPlatforms.includes(account.platform as typeof scraperPlatforms[number])) {
    return NextResponse.json(
      { error: "Scraper only supports TikTok, Instagram, and Facebook accounts" },
      { status: 400 },
    )
  }

  try {
    if (account.platform === "tiktok") {
      const result = await syncTikTokFromScraper(supabase, account, 30)

      console.log(`[account/scrape] Scraped @${result.username}: ${result.videosSaved} videos`)
      return NextResponse.json({
        success:        true,
        username:       result.username,
        videos_saved:   result.videosSaved,
        follower_count: result.followerCount,
      })
    }

    if (account.platform === "instagram") {
      const result = await syncInstagramFromScraper(supabase, account, 30)

      console.log(`[account/scrape] Scraped @${result.username}: ${result.reelsSaved} reels`)
      return NextResponse.json({
        success:        true,
        username:       result.username,
        videos_saved:   result.reelsSaved,
        follower_count: result.followerCount,
      })
    }

    const result = await syncFacebookFromScraper(supabase, account, 30)

    console.log(`[account/scrape] Scraped @${result.username}: ${result.reelsSaved} reels`)
    return NextResponse.json({
      success:        true,
      username:       result.username,
      videos_saved:   result.reelsSaved,
      follower_count: result.followerCount,
    })
  } catch (err) {
    if (err instanceof ScraperError) {
      const status = err.status >= 400 && err.status < 600 ? err.status : 502
      return NextResponse.json({ error: err.message }, { status })
    }
    console.error("[account/scrape]", err)
    return NextResponse.json({ error: "Failed to scrape account" }, { status: 500 })
  }
}
