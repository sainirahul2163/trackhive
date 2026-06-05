import { NextResponse } from "next/server"
import {
  getTikTokUserInfo,
  getInstagramUserInfo,
  getYouTubeChannelInfo,
  fetchInstagramReelsApify,
  EnsembleDataError,
} from "@/lib/ensembledata"

export interface AccountPreview {
  platform:         "tiktok" | "instagram" | "youtube"
  username:         string
  display_name:     string
  avatar_url:       string
  follower_count:   number
  video_count:      number
  /** Highest reel view count from Apify (Instagram only) */
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
      const info = await getTikTokUserInfo(username)
      preview = {
        platform:       "tiktok",
        username:       info.username,
        display_name:   info.display_name,
        avatar_url:     info.avatar_url,
        follower_count: info.follower_count,
        video_count:    info.video_count,
      }
    } else if (platform === "instagram") {
      const [info, reels] = await Promise.all([
        getInstagramUserInfo(username),
        fetchInstagramReelsApify(username),
      ])
      const topReelViews = reels.length
        ? Math.max(...reels.map((r) => r.views))
        : 0
      preview = {
        platform:       "instagram",
        username:       info.username,
        display_name:   info.full_name || info.username,
        avatar_url:     info.avatar_url,
        follower_count: info.follower_count,
        video_count:    reels.length || info.post_count,
        top_reel_views: topReelViews,
      }
    } else if (platform === "youtube") {
      const info = await getYouTubeChannelInfo(username)
      preview = {
        platform:       "youtube",
        username,
        display_name:   info.channel_name,
        avatar_url:     info.avatar,
        follower_count: info.subscriber_count,
        video_count:    info.video_count,
      }
    } else {
      return NextResponse.json({ error: "Unsupported platform" }, { status: 400 })
    }

    return NextResponse.json(preview)
  } catch (err) {
    if (err instanceof EnsembleDataError) {
      const status = err.status === 404 ? 404 : 502
      return NextResponse.json({ error: err.message }, { status })
    }
    console.error("[account/preview]", err)
    return NextResponse.json({ error: "Failed to fetch account info" }, { status: 500 })
  }
}
