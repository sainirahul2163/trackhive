/**
 * YouTube Data API v3 client — SERVER SIDE ONLY.
 * API key from YOUTUBE_API_KEY env var.
 */

export class YouTubeApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "YouTubeApiError"
  }
}

export interface YouTubeChannelData {
  channel_id:       string
  handle:           string | null
  display_name:     string
  avatar_url:       string
  subscriber_count: number
  video_count:      number
  total_views:      number
}

export interface YouTubeVideoData {
  video_id:       string
  title:          string
  thumbnail_url:  string
  views:          number
  likes:          number
  comments:       number
  published_at:   string
}

const YT_BASE = "https://www.googleapis.com/youtube/v3"

function getApiKey(): string {
  const key = process.env.YOUTUBE_API_KEY?.trim()
  if (!key) throw new YouTubeApiError(500, "YOUTUBE_API_KEY is not configured")
  return key
}

function toNum(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value)
  return Number.isFinite(n) ? Math.trunc(n) : 0
}

async function ytFetch<T>(path: string, params: Record<string, string>): Promise<T> {
  const qs = new URLSearchParams({ ...params, key: getApiKey() })
  const res = await fetch(`${YT_BASE}/${path}?${qs}`, { next: { revalidate: 0 } })

  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new YouTubeApiError(res.status, `YouTube API ${path} → HTTP ${res.status}: ${body}`)
  }

  return (await res.json()) as T
}

export function extractYouTubeIdentifier(
  input: string,
): { type: "channel_id" | "handle"; value: string } {
  const trimmed = input.trim()

  if (/^UC[\w-]{10,}$/.test(trimmed)) {
    return { type: "channel_id", value: trimmed }
  }

  try {
    const u = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`)
    const parts = u.pathname.split("/").filter(Boolean)

    if (parts[0] === "channel" && parts[1]) {
      return { type: "channel_id", value: parts[1] }
    }
    if (parts[0]?.startsWith("@")) {
      return { type: "handle", value: parts[0].slice(1) }
    }
    if ((parts[0] === "c" || parts[0] === "user") && parts[1]) {
      return { type: "handle", value: parts[1] }
    }
    const channelParam = u.searchParams.get("channel")
    if (channelParam) {
      return { type: "channel_id", value: channelParam }
    }
  } catch {
    // fall through — treat as plain handle
  }

  return { type: "handle", value: trimmed.replace(/^@/, "") }
}

interface YTChannelItem {
  id: string
  snippet: {
    title:       string
    customUrl?:  string
    thumbnails?: { default?: { url?: string }; high?: { url?: string } }
  }
  statistics: {
    subscriberCount?: string
    videoCount?:      string
    viewCount?:       string
  }
  contentDetails?: {
    relatedPlaylists?: { uploads?: string }
  }
}

interface YTChannelsResponse {
  items?: YTChannelItem[]
}

function mapChannelItem(item: YTChannelItem): YouTubeChannelData {
  const thumbs = item.snippet.thumbnails
  return {
    channel_id:       item.id,
    handle:           item.snippet.customUrl?.replace(/^@/, "") ?? null,
    display_name:     item.snippet.title,
    avatar_url:       thumbs?.high?.url ?? thumbs?.default?.url ?? "",
    subscriber_count: toNum(item.statistics.subscriberCount),
    video_count:      toNum(item.statistics.videoCount),
    total_views:      toNum(item.statistics.viewCount),
  }
}

/** Resolve a handle, @handle, URL, or UC… channel ID to channel metadata. */
export async function getYouTubeChannel(input: string): Promise<YouTubeChannelData> {
  const parsed = extractYouTubeIdentifier(input)
  if (!parsed.value) {
    throw new YouTubeApiError(422, "YouTube handle or channel ID is required")
  }

  const params: Record<string, string> = {
    part: "snippet,statistics,contentDetails",
  }

  if (parsed.type === "channel_id") {
    params.id = parsed.value
  } else {
    params.forHandle = parsed.value
  }

  const json = await ytFetch<YTChannelsResponse>("channels", params)
  const item = json.items?.[0]

  if (!item) {
    throw new YouTubeApiError(404, `YouTube channel not found: ${parsed.value}`)
  }

  return mapChannelItem(item)
}

interface YTPlaylistItem {
  snippet?: {
    resourceId?: { videoId?: string }
    publishedAt?: string
  }
}

interface YTPlaylistItemsResponse {
  items?: YTPlaylistItem[]
}

interface YTVideoItem {
  id: string
  snippet: {
    title:        string
    publishedAt?: string
    thumbnails?:  { high?: { url?: string }; default?: { url?: string } }
  }
  statistics: {
    viewCount?:    string
    likeCount?:    string
    commentCount?: string
  }
}

interface YTVideosResponse {
  items?: YTVideoItem[]
}

/** Fetch recent uploads for a channel via uploads playlist + video stats. */
export async function getYouTubeVideos(
  channelId: string,
  limit = 30,
): Promise<YouTubeVideoData[]> {
  const channelJson = await ytFetch<YTChannelsResponse>("channels", {
    part: "contentDetails",
    id:   channelId,
  })

  const uploadsPlaylistId =
    channelJson.items?.[0]?.contentDetails?.relatedPlaylists?.uploads

  if (!uploadsPlaylistId) return []

  const playlistJson = await ytFetch<YTPlaylistItemsResponse>("playlistItems", {
    part:       "snippet",
    playlistId: uploadsPlaylistId,
    maxResults: String(Math.min(limit, 50)),
  })

  const videoIds = (playlistJson.items ?? [])
    .map((item) => item.snippet?.resourceId?.videoId?.trim())
    .filter((id): id is string => Boolean(id))

  if (!videoIds.length) return []

  const videosJson = await ytFetch<YTVideosResponse>("videos", {
    part: "snippet,statistics",
    id:   videoIds.join(","),
  })

  return (videosJson.items ?? []).map((video) => {
    const thumbs = video.snippet.thumbnails
    return {
      video_id:      video.id,
      title:         video.snippet.title,
      thumbnail_url: thumbs?.high?.url ?? thumbs?.default?.url ?? "",
      views:         toNum(video.statistics.viewCount),
      likes:         toNum(video.statistics.likeCount),
      comments:      toNum(video.statistics.commentCount),
      published_at:  video.snippet.publishedAt ?? "",
    }
  })
}
