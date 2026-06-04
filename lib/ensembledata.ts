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
}

export interface InstagramPost {
  id:         string
  caption:    string
  thumbnail:  string
  views:      number
  likes:      number
  comments:   number
  created_at: string
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

export async function getInstagramUserInfo(username: string): Promise<InstagramUserInfo> {
  const cacheKey = `ig:info:${username}`
  const cached = fromCache<InstagramUserInfo>(cacheKey)
  if (cached) return cached

  const raw = await ed<IGDetailedRaw>("/instagram/user/detailed-info", { username })

  const result: InstagramUserInfo = {
    username:        raw.username,
    full_name:       raw.full_name ?? "",
    avatar_url:      raw.profile_pic_url ?? "",
    follower_count:  raw.edge_followed_by?.count            ?? 0,
    following_count: raw.edge_follow?.count                 ?? 0,
    post_count:      raw.edge_owner_to_timeline_media?.count ?? 0,
  }

  toCache(cacheKey, result)
  return result
}

// ─── 4. Instagram User Posts ──────────────────────────────────────────────────

export async function getInstagramUserPosts(username: string): Promise<InstagramPost[]> {
  const cacheKey = `ig:posts:${username}`
  const cached = fromCache<InstagramPost[]>(cacheKey)
  if (cached) return cached

  const raw = await ed<IGPostsRaw>("/instagram/user/posts", { username })

  const posts: InstagramPost[] = (raw?.posts ?? []).map(({ node: p }) => ({
    id:         p.id,
    caption:    p.edge_media_to_caption?.edges?.[0]?.node?.text ?? "",
    thumbnail:  p.thumbnail_src || p.display_url || "",
    views:      p.video_view_count ?? 0,
    likes:      p.edge_liked_by?.count         ?? 0,
    comments:   p.edge_media_to_comment?.count ?? 0,
    created_at: new Date(p.taken_at_timestamp * 1000).toISOString(),
  }))

  toCache(cacheKey, posts)
  return posts
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
