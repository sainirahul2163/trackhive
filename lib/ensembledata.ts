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
  /** Numeric Instagram user ID (pk) — required for /instagram/user/reels */
  user_id:         number
  username:        string
  full_name:       string
  avatar_url:      string
  follower_count:  number
  following_count: number
  post_count:      number
  /** Reels endpoint exposes view_count and play_count */
  views_available: true
  /** Pre-calculated across recent reels: (likes + comments) / views * 100 */
  engagement_rate: number
}

export interface InstagramPost {
  id:              string
  /** Instagram shortcode — used for /reel/{shortcode}/ URLs */
  shortcode:       string
  caption:         string
  thumbnail:       string
  /** view_count from /instagram/user/reels */
  views:           number
  /** play_count from /instagram/user/reels (IG-only plays, separate from views) */
  play_count:      number
  views_available: true
  likes:           number
  comments:        number
  /** Per-reel engagement: (likes + comments) / views * 100 */
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

interface IGUserInfoRaw {
  pk:              string
  username:        string
  full_name:       string
  profile_pic_url:   string
}

interface IGDetailedRaw {
  username:                   string
  full_name:                  string
  profile_pic_url:            string
  edge_followed_by:           { count: number }
  edge_follow:                { count: number }
  edge_owner_to_timeline_media: { count: number }
}

interface IGReelMediaRaw {
  pk:              string
  code:            string
  taken_at:        number
  like_count:      number
  comment_count:   number
  view_count:      number
  play_count:      number
  caption?:        { text: string }
  image_versions2?: { candidates?: { url: string }[] }
}

interface IGReelsRaw {
  reels: { media: IGReelMediaRaw }[]
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

// ─── Instagram helpers ────────────────────────────────────────────────────────

/** Step 1: resolve username → numeric user_id (pk) via /instagram/user/info */
async function resolveInstagramUserId(username: string): Promise<number> {
  const cacheKey = `ig:pk:${username}`
  const cached = fromCache<number>(cacheKey)
  if (cached) return cached

  const raw = await ed<IGUserInfoRaw>("/instagram/user/info", { username })
  const userId = parseInt(raw.pk, 10)
  if (!userId || Number.isNaN(userId)) {
    throw new EnsembleDataError(422, `Could not resolve Instagram user_id for @${username}`)
  }

  toCache(cacheKey, userId)
  return userId
}

function reelEngagementRate(views: number, likes: number, comments: number): number {
  if (views <= 0) return 0
  return Math.round(((likes + comments) / views) * 100 * 100) / 100
}

function mapInstagramReels(reels: IGReelsRaw["reels"]): InstagramPost[] {
  return (reels ?? []).map(({ media: m }) => {
    const likes    = m.like_count    ?? 0
    const comments = m.comment_count ?? 0
    const views    = m.view_count    ?? 0
    const playCount = m.play_count   ?? 0

    return {
      id:              m.pk,
      shortcode:       m.code,
      caption:         m.caption?.text ?? "",
      thumbnail:       m.image_versions2?.candidates?.[0]?.url ?? "",
      views,
      play_count:      playCount,
      views_available: true as const,
      likes,
      comments,
      engagement_rate: reelEngagementRate(views, likes, comments),
      created_at:      new Date((m.taken_at ?? 0) * 1000).toISOString(),
    }
  })
}

function accountEngagementFromReels(reels: InstagramPost[]): number {
  if (!reels.length) return 0
  const totalViews = reels.reduce((s, r) => s + r.views, 0)
  if (!totalViews) return 0
  const totalEngage = reels.reduce((s, r) => s + r.likes + r.comments, 0)
  return Math.round((totalEngage / totalViews) * 100 * 100) / 100
}

// ─── 3. Instagram User Info ───────────────────────────────────────────────────
// Step 1: /instagram/user/info → user_id (pk)
// Step 2: /instagram/user/detailed-info → follower counts
// Engagement rate calculated from /instagram/user/reels view_count data.

export async function getInstagramUserInfo(username: string): Promise<InstagramUserInfo> {
  const cacheKey = `ig:info:${username}`
  const cached = fromCache<InstagramUserInfo>(cacheKey)
  if (cached) return cached

  const [basic, detailed] = await Promise.all([
    ed<IGUserInfoRaw>("/instagram/user/info", { username }),
    ed<IGDetailedRaw>("/instagram/user/detailed-info", { username }),
  ])

  const userId = parseInt(basic.pk, 10)
  if (!userId || Number.isNaN(userId)) {
    throw new EnsembleDataError(422, `Could not resolve Instagram user_id for @${username}`)
  }
  toCache(`ig:pk:${username}`, userId)

  let engagementRate = 0
  try {
    const reelsRaw = await ed<IGReelsRaw>("/instagram/user/reels", { user_id: userId, depth: 1 })
    engagementRate = accountEngagementFromReels(mapInstagramReels(reelsRaw?.reels ?? []))
  } catch {
    // Non-fatal — engagement rate stays 0 if reels can't be fetched
  }

  const result: InstagramUserInfo = {
    user_id:         userId,
    username:        detailed.username || basic.username,
    full_name:       detailed.full_name || basic.full_name || "",
    avatar_url:      detailed.profile_pic_url || basic.profile_pic_url || "",
    follower_count:  detailed.edge_followed_by?.count ?? 0,
    following_count: detailed.edge_follow?.count ?? 0,
    post_count:      detailed.edge_owner_to_timeline_media?.count ?? 0,
    views_available: true,
    engagement_rate: engagementRate,
  }

  toCache(cacheKey, result)
  return result
}

// ─── 4. Instagram User Reels (posts with views) ───────────────────────────────
// Step 1: /instagram/user/info → user_id (pk)
// Step 2: /instagram/user/reels → view_count, play_count, like_count, comment_count

export async function getInstagramUserPosts(
  username: string,
  depth = 1,
): Promise<InstagramPost[]> {
  const cacheKey = `ig:reels:${username}:${depth}`
  const cached = fromCache<InstagramPost[]>(cacheKey)
  if (cached) return cached

  const userId = await resolveInstagramUserId(username)
  const raw = await ed<IGReelsRaw>("/instagram/user/reels", { user_id: userId, depth })

  const posts = mapInstagramReels(raw?.reels ?? [])

  toCache(cacheKey, posts)
  return posts
}

// ─── Platform capability map ──────────────────────────────────────────────────

export const PLATFORM_LIMITATIONS = {
  instagram: { views: true,   saves: false, shares: false },
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
