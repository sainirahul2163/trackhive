/**
 * EnsembleData API client — SERVER SIDE ONLY.
 * Never import this file in client components.
 * Token lives in ENSEMBLEDATA_API_TOKEN (no NEXT_PUBLIC_ prefix).
 */

// ─── Custom error ─────────────────────────────────────────────────────────────

export class EnsembleDataError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = "EnsembleDataError"
  }
}

// ─── Typed return interfaces ───────────────────────────────────────────────────

export interface TikTokUserInfo {
  username:       string
  display_name:   string
  avatar_url:     string
  follower_count: number
  following_count: number
  video_count:    number
  total_likes:    number
}

export interface TikTokVideo {
  id:          string
  description: string
  thumbnail:   string
  views:       number
  likes:       number
  comments:    number
  shares:      number
  created_at:  string   // ISO-8601
}

export interface InstagramUserInfo {
  username:        string
  full_name:       string
  avatar_url:      string
  follower_count:  number
  following_count: number
  post_count:      number
  /** Always false — Meta does not expose view counts to third-party apps */
  views_available: false
  /** Pre-calculated: average (likes + comments) / followers * 100 across recent posts */
  engagement_rate: number
}

export interface InstagramPost {
  id:              string
  caption:         string
  thumbnail:       string
  /** Always null — Instagram does not expose view counts to third-party apps */
  views:           null
  /** Always false */
  views_available: false
  likes:           number
  comments:        number
  /** Per-post engagement: (likes + comments) / followers * 100 */
  engagement_rate: number
  created_at:      string
}

export interface YouTubeChannelInfo {
  channel_name:     string
  avatar:           string
  subscriber_count: number
  video_count:      number
  total_views:      number
}

// ─── Internal: raw API shapes (minimal — only fields we read) ─────────────────

interface TTUserRaw {
  user: {
    uniqueId:     string
    nickname:     string
    avatarMedium: { url_list: string[] }
  }
  stats: {
    followerCount:  number
    followingCount: number
    videoCount:     number
    heartCount:     number
  }
}

interface TTPostRaw {
  aweme_id:   string
  desc:       string
  create_time: number
  video?: {
    cover?: { url_list: string[] }
  }
  statistics: {
    play_count:    number
    digg_count:    number
    comment_count: number
    share_count:   number
  }
}

interface IGDetailedRaw {
  username:                   string
  full_name:                  string
  profile_pic_url:            string
  edge_followed_by:           { count: number }
  edge_follow:                { count: number }
  edge_owner_to_timeline_media: { count: number }
}

interface IGPostNodeRaw {
  id:                    string
  edge_media_to_caption: { edges: { node: { text: string } }[] }
  taken_at_timestamp:    number
  display_url:           string
  thumbnail_src:         string
  edge_liked_by:         { count: number }
  edge_media_to_comment: { count: number }
  video_view_count?:     number
}

interface IGPostsRaw {
  posts: { node: IGPostNodeRaw }[]
}

// ─── In-process 1-hour cache ──────────────────────────────────────────────────

const CACHE_TTL = 60 * 60 * 1000  // 1 hour in ms

interface CacheEntry<T> {
  value:     T
  expiresAt: number
}

const cache = new Map<string, CacheEntry<unknown>>()

function fromCache<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    cache.delete(key)
    return null
  }
  return entry.value
}

function toCache<T>(key: string, value: T): void {
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL })
}

// ─── Internal: shared fetch helper ────────────────────────────────────────────

function getToken(): string {
  const t = process.env.ENSEMBLEDATA_API_TOKEN
  if (!t) throw new EnsembleDataError(500, "ENSEMBLEDATA_API_TOKEN is not configured")
  return t
}

async function ed<T>(path: string, params: Record<string, string | number | boolean>): Promise<T> {
  const token = getToken()
  const qs = new URLSearchParams(
    Object.entries({ ...params, token }).map(([k, v]) => [k, String(v)])
  )
  const url = `https://ensembledata.com/apis${path}?${qs}`

  const res = await fetch(url, { next: { revalidate: 0 } })

  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new EnsembleDataError(res.status, `EnsembleData ${path} → HTTP ${res.status}: ${body}`)
  }

  const json = (await res.json()) as unknown as Record<string, unknown>

  // EnsembleData error status codes (still return 200 HTTP in some cases)
  if (typeof json.status_code === "number" && json.status_code >= 400) {
    throw new EnsembleDataError(json.status_code, String(json.detail ?? "API error"))
  }

  return json.data as T
}

// ─── 1. TikTok User Info ──────────────────────────────────────────────────────

export async function getTikTokUserInfo(username: string): Promise<TikTokUserInfo> {
  const cacheKey = `tt:info:${username}`
  const cached = fromCache<TikTokUserInfo>(cacheKey)
  if (cached) return cached

  const raw = await ed<TTUserRaw>("/tt/user/info", { username })

  const result: TikTokUserInfo = {
    username:        raw.user.uniqueId,
    display_name:    raw.user.nickname,
    avatar_url:      raw.user.avatarMedium?.url_list?.[0] ?? "",
    follower_count:  raw.stats.followerCount  ?? 0,
    following_count: raw.stats.followingCount ?? 0,
    video_count:     raw.stats.videoCount     ?? 0,
    total_likes:     raw.stats.heartCount     ?? 0,
  }

  toCache(cacheKey, result)
  return result
}

// ─── 2. TikTok User Videos ────────────────────────────────────────────────────

export async function getTikTokUserVideos(username: string, depth = 1): Promise<TikTokVideo[]> {
  const cacheKey = `tt:posts:${username}:${depth}`
  const cached = fromCache<TikTokVideo[]>(cacheKey)
  if (cached) return cached

  const raw = await ed<TTPostRaw[]>("/tt/user/posts", { username, depth })

  const posts: TikTokVideo[] = (raw ?? []).map((p) => ({
    id:          p.aweme_id,
    description: p.desc ?? "",
    thumbnail:   p.video?.cover?.url_list?.[0] ?? "",
    views:       p.statistics?.play_count    ?? 0,
    likes:       p.statistics?.digg_count    ?? 0,
    comments:    p.statistics?.comment_count ?? 0,
    shares:      p.statistics?.share_count   ?? 0,
    created_at:  new Date((p.create_time ?? 0) * 1000).toISOString(),
  }))

  toCache(cacheKey, posts)
  return posts
}

// ─── 3. Instagram User Info ───────────────────────────────────────────────────
// Uses /instagram/user/detailed-info (10 units) — has follower counts.
// NOTE: Instagram does NOT provide view counts to third-party apps via EnsembleData.
//       Only likes, comments, followers, and post counts are available.

export async function getInstagramUserInfo(username: string): Promise<InstagramUserInfo> {
  const cacheKey = `ig:info:${username}`
  const cached = fromCache<InstagramUserInfo>(cacheKey)
  if (cached) return cached

  const raw = await ed<IGDetailedRaw>("/instagram/user/detailed-info", { username })

  const followerCount = raw.edge_followed_by?.count ?? 0

  // Try to fetch recent posts for engagement rate calculation
  let engagementRate = 0
  try {
    const posts = await ed<IGPostsRaw>("/instagram/user/posts", { username })
    const nodes = posts?.posts ?? []
    if (nodes.length > 0 && followerCount > 0) {
      const totalLikes    = nodes.reduce((s, { node: p }) => s + (p.edge_liked_by?.count ?? 0), 0)
      const totalComments = nodes.reduce((s, { node: p }) => s + (p.edge_media_to_comment?.count ?? 0), 0)
      engagementRate = Math.round(((totalLikes + totalComments) / nodes.length / followerCount) * 100 * 100) / 100
    }
  } catch {
    // Non-fatal — engagement rate stays 0 if posts can't be fetched
  }

  const result: InstagramUserInfo = {
    username:        raw.username,
    full_name:       raw.full_name ?? "",
    avatar_url:      raw.profile_pic_url ?? "",
    follower_count:  followerCount,
    following_count: raw.edge_follow?.count                 ?? 0,
    post_count:      raw.edge_owner_to_timeline_media?.count ?? 0,
    views_available: false,
    engagement_rate: engagementRate,
  }

  toCache(cacheKey, result)
  return result
}

// ─── 4. Instagram User Posts ──────────────────────────────────────────────────
// NOTE: `views` is always null — Instagram does not expose view counts to
//       third-party applications. Engagement rate is calculated from
//       (likes + comments) / followers * 100.

export async function getInstagramUserPosts(
  username:      string,
  followerCount = 0,
): Promise<InstagramPost[]> {
  const cacheKey = `ig:posts:${username}`
  const cached = fromCache<InstagramPost[]>(cacheKey)
  if (cached) return cached

  const raw = await ed<IGPostsRaw>("/instagram/user/posts", { username })

  const posts: InstagramPost[] = (raw?.posts ?? []).map(({ node: p }) => {
    const likes    = p.edge_liked_by?.count         ?? 0
    const comments = p.edge_media_to_comment?.count ?? 0
    const engRate  = followerCount > 0
      ? Math.round(((likes + comments) / followerCount) * 100 * 100) / 100
      : 0

    return {
      id:              p.id,
      caption:         p.edge_media_to_caption?.edges?.[0]?.node?.text ?? "",
      thumbnail:       p.thumbnail_src || p.display_url || "",
      views:           null,           // Instagram does not provide view counts
      views_available: false,
      likes,
      comments,
      engagement_rate: engRate,
      created_at:      new Date(p.taken_at_timestamp * 1000).toISOString(),
    }
  })

  toCache(cacheKey, posts)
  return posts
}

// ─── Platform capability map ──────────────────────────────────────────────────

export const PLATFORM_LIMITATIONS = {
  instagram: { views: false,  saves: false, shares: false },
  tiktok:    { views: true,   saves: false, shares: true  },
  youtube:   { views: true,   saves: false, shares: false },
  facebook:  { views: false,  saves: false, shares: false },
} as const

export type PlatformId = keyof typeof PLATFORM_LIMITATIONS

/** Returns true when the given platform exposes view counts to third-party apps */
export function platformHasViews(platform: string): boolean {
  return (PLATFORM_LIMITATIONS as Record<string, { views: boolean }>)[platform]?.views ?? false
}

// ─── 5. YouTube Channel Info ──────────────────────────────────────────────────
// Uses YouTube Data API v3 (free, requires YOUTUBE_API_KEY env var).

export async function getYouTubeChannelInfo(channelId: string): Promise<YouTubeChannelInfo> {
  const cacheKey = `yt:channel:${channelId}`
  const cached = fromCache<YouTubeChannelInfo>(cacheKey)
  if (cached) return cached

  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) throw new EnsembleDataError(500, "YOUTUBE_API_KEY is not configured")

  const qs = new URLSearchParams({
    part:  "snippet,statistics",
    id:    channelId,
    key:   apiKey,
  })

  const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?${qs}`, {
    next: { revalidate: 0 },
  })

  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new EnsembleDataError(res.status, `YouTube API → HTTP ${res.status}: ${body}`)
  }

  interface YTChannel {
    items?: {
      snippet:    { title: string; thumbnails: { default: { url: string } } }
      statistics: { subscriberCount: string; videoCount: string; viewCount: string }
    }[]
  }

  const json = (await res.json()) as YTChannel
  const item = json.items?.[0]

  if (!item) throw new EnsembleDataError(404, `YouTube channel not found: ${channelId}`)

  const result: YouTubeChannelInfo = {
    channel_name:     item.snippet.title,
    avatar:           item.snippet.thumbnails?.default?.url ?? "",
    subscriber_count: parseInt(item.statistics.subscriberCount, 10) || 0,
    video_count:      parseInt(item.statistics.videoCount,      10) || 0,
    total_views:      parseInt(item.statistics.viewCount,       10) || 0,
  }

  toCache(cacheKey, result)
  return result
}
