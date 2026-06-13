/**
 * TrackHive scraper service clients (server-side only).
 * TikTok: SCRAPER_URL | Instagram: INSTAGRAM_SCRAPER_URL | Facebook: FACEBOOK_SCRAPER_URL
 */

export class ScraperError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "ScraperError"
  }
}

// ─── TikTok ───────────────────────────────────────────────────────────────────

export interface TikTokProfileData {
  username:         string
  user_id:          string
  sec_uid:          string
  display_name:     string
  bio:              string
  avatar_url:       string
  followers_count:  number
  following_count:  number
  likes_count:      number
  video_count:      number
  scraped_at:       string
}

export interface TikTokVideoData {
  video_id:         string
  username:         string
  description:      string
  thumbnail_url:    string
  views_count:      number
  likes_count:      number
  comments_count:   number
  shares_count:     number
  posted_at:        string
  scraped_at:       string
}

// ─── Instagram ────────────────────────────────────────────────────────────────

export interface InstagramProfileData {
  username:         string
  display_name:     string
  avatar_url:       string
  follower_count:   number
  following_count:  number
  post_count:       number
  biography:        string
}

export interface InstagramReelData {
  shortcode:          string
  description:        string
  thumbnail_url:      string
  views:              number
  likes:              number
  comments:           number
  posted_at:          string
  duration_seconds:   number | null
}

// ─── Facebook ─────────────────────────────────────────────────────────────────

export interface FacebookProfileData {
  username:         string
  display_name:     string
  avatar_url:       string
  follower_count:   number
  following_count:  number
  post_count:       number
  biography:        string
}

export interface FacebookReelData {
  reel_id:          string
  description:      string
  thumbnail_url:    string
  views:            number
  likes:            number
  comments:         number
  shares:           number
  posted_at:        string
  video_url:        string
}

interface InstagramProfileRaw {
  account:              string
  followers:            number
  posts_count:          number
  biography?:           string
  full_name?:           string
  profile_image_link?:  string
  following?:           number
}

interface InstagramReelRaw {
  shortcode:            string
  description?:         string
  thumbnail?:           string
  views?:               number
  video_play_count?:    number
  likes?:               number
  num_comments?:        number
  date_posted?:         string
  length?:              number | string | null
}

interface FacebookProfileRaw {
  username?:            string
  account?:             string
  page_name?:           string
  display_name?:        string
  full_name?:           string
  name?:                string
  avatar_url?:          string
  profile_image?:       string
  profile_pic?:         string
  profile_image_url?:   string
  followers_count?:     number
  followers?:           number
  follower_count?:      number
  following_count?:     number
  following?:           number
  video_count?:         number
  reels_count?:         number
  posts_count?:         number
  bio?:                 string
  biography?:           string
}

interface FacebookReelRaw {
  reel_id?:             string
  video_id?:            string
  id?:                  string
  post_id?:             string
  url?:                 string
  description?:         string
  caption?:             string
  text?:                string
  thumbnail_url?:       string
  thumbnail?:           string
  views_count?:         number
  views?:               number
  play_count?:          number
  likes_count?:         number
  likes?:               number
  reactions?:           number
  comments_count?:      number
  comments?:            number
  shares_count?:        number
  shares?:              number
  posted_at?:           string
  created_at?:          string
  date?:                string
  scraped_at?:          string
}

function toNum(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value)
  return Number.isFinite(n) ? Math.trunc(n) : 0
}

function getTikTokScraperUrl(): string {
  const url = process.env.SCRAPER_URL?.trim()
  if (!url) throw new ScraperError(500, "SCRAPER_URL is not configured")
  return url.replace(/\/$/, "")
}

function getInstagramScraperUrl(): string {
  const url = process.env.INSTAGRAM_SCRAPER_URL?.trim()
  if (!url) throw new ScraperError(500, "INSTAGRAM_SCRAPER_URL is not configured")
  return url.replace(/\/$/, "")
}

function getFacebookScraperUrl(): string {
  const url = process.env.FACEBOOK_SCRAPER_URL?.trim()
  if (!url) throw new ScraperError(500, "FACEBOOK_SCRAPER_URL is not configured")
  return url.replace(/\/$/, "")
}

async function scraperPost<T>(
  baseUrl: string,
  path: string,
  body: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  })

  let json: { success?: boolean; error?: string; data?: T }
  try {
    json = (await res.json()) as typeof json
  } catch {
    throw new ScraperError(res.status, `Scraper returned invalid JSON (${res.status})`)
  }

  if (!res.ok || json.success === false || json.data == null) {
    throw new ScraperError(
      res.status,
      json.error ?? `Scraper request failed (${res.status})`,
    )
  }

  return json.data
}

async function tiktokScrapePost<T>(path: string, body: Record<string, unknown>): Promise<T> {
  return scraperPost<T>(getTikTokScraperUrl(), path, body)
}

async function scraperList<T>(
  baseUrl: string,
  path: string,
  body: Record<string, unknown>,
  allowEmpty = false,
  notFoundMessage = "Profile not found",
): Promise<T[]> {
  const res = await fetch(`${baseUrl}${path}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  })

  let json: { success?: boolean; error?: string; data?: T[] | T }
  try {
    json = (await res.json()) as typeof json
  } catch {
    throw new ScraperError(res.status, `Scraper returned invalid JSON (${res.status})`)
  }

  if (!res.ok || json.success === false) {
    throw new ScraperError(
      res.status,
      json.error ?? `Scraper request failed (${res.status})`,
    )
  }

  const items = Array.isArray(json.data)
    ? json.data
    : json.data != null
      ? [json.data as T]
      : []

  if (!allowEmpty && items.length === 0) {
    throw new ScraperError(404, notFoundMessage)
  }

  return items
}

async function instagramScrapeList<T>(
  path: string,
  body: Record<string, unknown>,
  allowEmpty = false,
): Promise<T[]> {
  return scraperList<T>(
    getInstagramScraperUrl(),
    path,
    body,
    allowEmpty,
    "Instagram profile not found",
  )
}

function normalizeInstagramProfile(raw: InstagramProfileRaw): InstagramProfileData {
  const username = raw.account?.trim() || ""
  return {
    username,
    display_name:    raw.full_name?.trim() || username,
    avatar_url:      raw.profile_image_link?.trim() || "",
    follower_count:  toNum(raw.followers),
    following_count: toNum(raw.following),
    post_count:      toNum(raw.posts_count),
    biography:       raw.biography?.trim() || "",
  }
}

function normalizeInstagramReel(raw: InstagramReelRaw): InstagramReelData | null {
  const shortcode = raw.shortcode?.trim()
  if (!shortcode) return null

  const views = toNum(raw.views ?? raw.video_play_count)
  return {
    shortcode,
    description:      raw.description?.trim() || "",
    thumbnail_url:    raw.thumbnail?.trim() || "",
    views,
    likes:            toNum(raw.likes),
    comments:         toNum(raw.num_comments),
    posted_at:        raw.date_posted || "",
    duration_seconds: raw.length != null ? toNum(raw.length) : null,
  }
}

function normalizeFacebookProfile(raw: FacebookProfileRaw): FacebookProfileData {
  const username = (raw.username ?? raw.account ?? raw.page_name ?? "").trim()
  return {
    username,
    display_name:    (raw.display_name ?? raw.full_name ?? raw.name ?? username).trim(),
    avatar_url:      (raw.avatar_url ?? raw.profile_image ?? raw.profile_pic ?? raw.profile_image_url ?? "").trim(),
    follower_count:  toNum(raw.followers_count ?? raw.followers ?? raw.follower_count),
    following_count: toNum(raw.following_count ?? raw.following),
    post_count:      toNum(raw.video_count ?? raw.reels_count ?? raw.posts_count),
    biography:       (raw.bio ?? raw.biography ?? "").trim(),
  }
}

function normalizeFacebookReel(raw: FacebookReelRaw, username: string): FacebookReelData | null {
  const reelId = String(raw.reel_id ?? raw.video_id ?? raw.id ?? raw.post_id ?? "").trim()
  if (!reelId) return null

  const videoUrl = raw.url?.trim() || `https://www.facebook.com/reel/${reelId}/`

  return {
    reel_id:       reelId,
    description:   (raw.description ?? raw.caption ?? raw.text ?? "").trim(),
    thumbnail_url: (raw.thumbnail_url ?? raw.thumbnail ?? "").trim(),
    views:         toNum(raw.views_count ?? raw.views ?? raw.play_count),
    likes:         toNum(raw.likes_count ?? raw.likes ?? raw.reactions),
    comments:      toNum(raw.comments_count ?? raw.comments),
    shares:        toNum(raw.shares_count ?? raw.shares),
    posted_at:     raw.posted_at ?? raw.created_at ?? raw.date ?? "",
    video_url:     videoUrl.includes("facebook.com")
      ? videoUrl
      : `https://www.facebook.com/${username}/videos/${reelId}/`,
  }
}

export async function scrapeTikTokProfile(username: string): Promise<TikTokProfileData> {
  return tiktokScrapePost<TikTokProfileData>("/scrape/tiktok/profile", { username })
}

export async function scrapeTikTokVideos(
  username: string,
  limit = 30,
): Promise<TikTokVideoData[]> {
  const base = getTikTokScraperUrl()
  const res = await fetch(`${base}/scrape/tiktok/videos`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ username, limit }),
  })

  let json: { success?: boolean; error?: string; data?: TikTokVideoData[] }
  try {
    json = (await res.json()) as typeof json
  } catch {
    throw new ScraperError(res.status, `Scraper returned invalid JSON (${res.status})`)
  }

  if (!res.ok || !json.success || !Array.isArray(json.data)) {
    throw new ScraperError(
      res.status,
      json.error ?? `Scraper request failed (${res.status})`,
    )
  }

  return json.data
}

export async function scrapeInstagramProfile(username: string): Promise<InstagramProfileData> {
  const items = await instagramScrapeList<InstagramProfileRaw>(
    "/scrape/instagram/profile",
    { username },
  )
  return normalizeInstagramProfile(items[0])
}

export async function scrapeInstagramReels(
  username: string,
  limit = 30,
): Promise<InstagramReelData[]> {
  const items = await instagramScrapeList<InstagramReelRaw>(
    "/scrape/instagram/reels",
    { username, limit },
    true,
  )

  return items
    .map(normalizeInstagramReel)
    .filter((reel): reel is InstagramReelData => reel != null)
}

export async function scrapeFacebookProfile(username: string): Promise<FacebookProfileData> {
  const items = await scraperList<FacebookProfileRaw>(
    getFacebookScraperUrl(),
    "/scrape/facebook/profile",
    { username },
    false,
    "Facebook profile not found",
  )
  return normalizeFacebookProfile(items[0])
}

export async function scrapeFacebookReels(
  username: string,
  limit = 30,
): Promise<FacebookReelData[]> {
  const base = getFacebookScraperUrl()
  const res = await fetch(`${base}/scrape/facebook/reels`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ username, limit }),
  })

  let json: { success?: boolean; error?: string; data?: FacebookReelRaw[] }
  try {
    json = (await res.json()) as typeof json
  } catch {
    throw new ScraperError(res.status, `Scraper returned invalid JSON (${res.status})`)
  }

  if (!res.ok || json.success === false) {
    throw new ScraperError(
      res.status,
      json.error ?? `Scraper request failed (${res.status})`,
    )
  }

  if (!Array.isArray(json.data)) return []

  return json.data
    .map((reel) => normalizeFacebookReel(reel, username))
    .filter((reel): reel is FacebookReelData => reel != null)
}
