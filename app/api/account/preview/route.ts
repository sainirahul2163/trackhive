import { NextResponse } from "next/server"
import {
  scrapeTikTokProfile,
  scrapeInstagramProfile,
  scrapeInstagramReels,
  scrapeFacebookProfile,
  scrapeFacebookReels,
  ScraperError,
} from "@/lib/scraper"
import { getYouTubeChannel, YouTubeApiError } from "@/lib/youtube"

export interface AccountPreview {
  platform:         "tiktok" | "instagram" | "youtube" | "facebook"
  username:         string
  display_name:     string
  avatar_url:       string
  follower_count:   number
  video_count:      number
  /** Highest reel view count (Instagram/Facebook only) */
  top_reel_views?:  number
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const platform = searchParams.get("platform") as AccountPreview["platform"] | null
  const username = searchParams.get("username")

  if (!platform || !username) {
    return NextResponse.json({ error: "platform and username are required" }, { status: 400 })
  }

  try {
    let preview: AccountPreview

    if (platform === "tiktok") {
      const profile = await scrapeTikTokProfile(username)
      preview = {
        platform:       "tiktok",
        username:       profile.username,
        display_name:   profile.display_name,
        avatar_url:     profile.avatar_url,
        follower_count: profile.followers_count,
        video_count:    profile.video_count,
      }
    } else if (platform === "instagram") {
      const [profile, reels] = await Promise.all([
        scrapeInstagramProfile(username),
        scrapeInstagramReels(username, 20),
      ])
      const topReelViews = reels.length
        ? Math.max(...reels.map((r) => r.views))
        : 0
      preview = {
        platform:       "instagram",
        username:       profile.username,
        display_name:   profile.display_name,
        avatar_url:     profile.avatar_url,
        follower_count: profile.follower_count,
        video_count:    reels.length || profile.post_count,
        top_reel_views: topReelViews,
      }
    } else if (platform === "youtube") {
      const channel = await getYouTubeChannel(username)
      preview = {
        platform:       "youtube",
        username:       channel.channel_id,
        display_name:   channel.display_name,
        avatar_url:     channel.avatar_url,
        follower_count: channel.subscriber_count,
        video_count:    channel.video_count,
      }
    } else if (platform === "facebook") {
      console.log("[account/preview] Facebook preview", {
        username,
        scraperUrl: process.env.FACEBOOK_SCRAPER_URL?.trim() || "(FACEBOOK_SCRAPER_URL not set)",
      })
      const profile = await scrapeFacebookProfile(username)
      let reels: Awaited<ReturnType<typeof scrapeFacebookReels>> = []
      try {
        reels = await scrapeFacebookReels(username, 20)
      } catch (reelsErr) {
        console.error("[account/preview] Facebook reels fetch failed:", reelsErr)
      }
      const topReelViews = reels.length
        ? Math.max(...reels.map((r) => r.views))
        : 0
      preview = {
        platform:       "facebook",
        username:       profile.username,
        display_name:   profile.display_name,
        avatar_url:     profile.avatar_url,
        follower_count: profile.follower_count,
        video_count:    reels.length || profile.post_count,
        top_reel_views: topReelViews,
      }
    } else {
      return NextResponse.json({ error: "Unsupported platform" }, { status: 400 })
    }

    return NextResponse.json(preview)
  } catch (err) {
    if (err instanceof ScraperError || err instanceof YouTubeApiError) {
      console.error("[account/preview] scraper error:", {
        platform,
        username,
        status: err.status,
        message: err.message,
      })
      const status = err.status === 404 ? 404 : 502
      return NextResponse.json({ error: err.message }, { status })
    }
    console.error("[account/preview]", err)
    return NextResponse.json({ error: "Failed to fetch account info" }, { status: 500 })
  }
}
