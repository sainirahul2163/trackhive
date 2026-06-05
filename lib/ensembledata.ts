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
  shares:          number
  /** Per-reel engagement: (likes + comments) / views * 100 */
  engagement_rate: number
  created_at:      string
}

interface ApifyReelRaw {
  shortCode:      string
  caption?:       string
  likesCount:     number
  commentsCount:  number
  videoPlayCount: number | null
  timestamp:      string
  url:            string
  displayUrl?:    string
  previewUrl?:    string
  thumbnailUrl?:  string
  imageUrl?:      string
  images?:        string[]
  sharesCount?:     number
  videoShareCount?: number
}

interface ApifyProfileRaw {
  username:        string
  fullName?:       string
  profilePicUrl?:  string
  followersCount?: number
  followsCount?:  number
  postsCount?:     number
}

export interface InstagramProfileApify {
  username:        string
  display_name:    string
  avatar_url:      string
  follower_count:  number
  following_count: number
  post_count:      number
  views_available: false
  engagement_rate: number
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

interface TTCoverField {
  url_list?: string[]
}

interface TTPostRaw {
  aweme_id:    string
  desc:        string
  create_time: number
  video?: {
    cover?:         TTCoverField
    origin_cover?:  TTCoverField
    originCover?:   TTCoverField
    dynamic_cover?: TTCoverField
    dynamicCover?:  TTCoverField
  }
  statistics?: {
    play_count?:    number
    digg_count?:    number
    comment_count?: number
    share_count?:   number
    shareCount?:    number
  }
  stats?: {
    play_count?:    number
    digg_count?:    number
    comment_count?: number
    share_count?:   number
    shareCount?:    number
  }
}

/** TikTok shares: share_count / shareCount on statistics or stats. */
export function extractTikTokShares(post: TTPostRaw): number {
  const stats = post.statistics ?? post.stats
  if (!stats) return 0
  const n = stats.share_count ?? stats.shareCount ?? 0
  return Number.isFinite(Number(n)) ? Number(n) : 0
}

function extractInstagramShares(reel: ApifyReelRaw): number {
  const n = reel.sharesCount ?? reel.videoShareCount ?? 0
  return Number.isFinite(Number(n)) ? Number(n) : 0
}

function firstUrl(...lists: (string[] | undefined)[]): string {
  for (const list of lists) {
    const url = list?.[0]?.trim()
    if (url) return url
  }
  return ""
}

/** TikTok cover: cover → originCover → dynamicCover (snake + camelCase). */
export function extractTikTokThumbnail(video?: TTPostRaw["video"]): string {
  if (!video) return ""
  return firstUrl(
    video.cover?.url_list,
    video.origin_cover?.url_list,
    video.originCover?.url_list,
    video.dynamic_cover?.url_list,
    video.dynamicCover?.url_list,
  )
}

function extractInstagramThumbnail(reel: ApifyReelRaw): string {
  const url =
    reel.displayUrl?.trim() ||
    reel.thumbnailUrl?.trim() ||
    reel.previewUrl?.trim() ||
    reel.images?.[0]?.trim() ||
    reel.imageUrl?.trim() ||
    null

  console.log("[Instagram thumbnail]", url)
  return url ?? ""
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

  const posts: TikTokVideo[] = (raw ?? []).map((p) => {
    const stats = p.statistics ?? p.stats
    return {
      id:          p.aweme_id,
      description: p.desc ?? "",
      thumbnail:   extractTikTokThumbnail(p.video),
      views:       stats?.play_count    ?? 0,
      likes:       stats?.digg_count    ?? 0,
      comments:    stats?.comment_count ?? 0,
      shares:      extractTikTokShares(p),
      created_at:  new Date((p.create_time ?? 0) * 1000).toISOString(),
    }
  })

  toCache(cacheKey, posts)
  return posts
}

// ─── Instagram helpers ────────────────────────────────────────────────────────

function reelEngagementRate(views: number, likes: number, comments: number): number {
  if (views <= 0) return 0
  return Math.round(((likes + comments) / views) * 100 * 100) / 100
}

function getApifyToken(): string {
  const token = process.env.APIFY_API_TOKEN
  if (!token) throw new EnsembleDataError(500, "APIFY_API_TOKEN is not configured")
  return token
}

export async function fetchInstagramProfileApify(
  username: string,
): Promise<InstagramProfileApify | null> {
  const token = getApifyToken()

  const cacheKey = `apify:ig:profile:${username}`
  const cached = fromCache<InstagramProfileApify | null>(cacheKey)
  if (cached !== null) return cached

  const res = await fetch(
    `https://api.apify.com/v2/actors/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=${token}`,
    {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ usernames: [username] }),
      next:    { revalidate: 0 },
    },
  )

  if (!res.ok) return null

  const data = (await res.json()) as ApifyProfileRaw[]
  const profile = data[0]
  if (!profile) return null

  const result: InstagramProfileApify = {
    username:        profile.username ?? username,
    display_name:    profile.fullName ?? "",
    avatar_url:      profile.profilePicUrl ?? "",
    follower_count:  profile.followersCount ?? 0,
    following_count: profile.followsCount ?? 0,
    post_count:      profile.postsCount ?? 0,
    views_available: false,
    engagement_rate: 0,
  }

  toCache(cacheKey, result)
  return result
}

export async function fetchInstagramReelsApify(username: string): Promise<InstagramPost[]> {
  const token = getApifyToken()

  const cacheKey = `apify:ig:reels:${username}`
  const cached = fromCache<InstagramPost[]>(cacheKey)
  if (cached) return cached

  const res = await fetch(
    `https://api.apify.com/v2/actors/apify~instagram-reel-scraper/run-sync-get-dataset-items?token=${token}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: [username], maxReelsPerProfile: 20 }),
      next: { revalidate: 0 },
    }
  )

  if (!res.ok) return []

  const raw: ApifyReelRaw[] = await res.json()

  const posts: InstagramPost[] = raw
    .filter(r => r.videoPlayCount !== null && r.videoPlayCount > 0)
    .map(r => {
      console.log("[Instagram reel raw]", JSON.stringify(r).substring(0, 800))
      const views    = r.videoPlayCount ?? 0
      const likes    = r.likesCount    ?? 0
      const comments = r.commentsCount ?? 0
      const shares   = extractInstagramShares(r)
      return {
        id:              r.shortCode,
        shortcode:       r.shortCode,
        caption:         r.caption ?? '',
        thumbnail:       extractInstagramThumbnail(r),
        views,
        play_count:      views,
        views_available: true as const,
        likes,
        comments,
        shares,
        engagement_rate: reelEngagementRate(views, likes, comments),
        created_at:      r.timestamp ?? new Date().toISOString(),
      }
    })

  toCache(cacheKey, posts)
  return posts
}

function accountEngagementFromReels(reels: InstagramPost[]): number {
  if (!reels.length) return 0
  const totalViews = reels.reduce((s, r) => s + r.views, 0)
  if (!totalViews) return 0
  const totalEngage = reels.reduce((s, r) => s + r.likes + r.comments, 0)
  return Math.round((totalEngage / totalViews) * 100 * 100) / 100
}

// ─── 3. Instagram User Info ───────────────────────────────────────────────────
// Profile + engagement: Apify only (profile-scraper + reel-scraper).

export async function getInstagramUserInfo(username: string): Promise<InstagramUserInfo> {
  const cacheKey = `ig:info:${username}`
  const cached = fromCache<InstagramUserInfo>(cacheKey)
  if (cached) return cached

  const profile = await fetchInstagramProfileApify(username)
  if (!profile) {
    throw new EnsembleDataError(404, `Instagram profile not found for @${username}`)
  }

  let engagementRate = 0
  try {
    const reels = await fetchInstagramReelsApify(username)
    engagementRate = accountEngagementFromReels(reels)
  } catch {
    // Non-fatal — engagement rate stays 0 if reels can't be fetched
  }

  const result: InstagramUserInfo = {
    user_id:         0,
    username:        profile.username,
    full_name:       profile.display_name,
    avatar_url:      profile.avatar_url,
    follower_count:  profile.follower_count,
    following_count: profile.following_count,
    post_count:      profile.post_count,
    views_available: true,
    engagement_rate: engagementRate,
  }

  toCache(cacheKey, result)
  return result
}

// ─── 4. Instagram User Reels (posts with views) ───────────────────────────────
// Apify instagram-reel-scraper → videoPlayCount, likesCount, commentsCount

export async function getInstagramUserPosts(
  username: string,
  depth = 1,
): Promise<InstagramPost[]> {
  const cacheKey = `ig:reels:${username}:${depth}`
  const cached = fromCache<InstagramPost[]>(cacheKey)
  if (cached) return cached

  const posts = await fetchInstagramReelsApify(username)

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
