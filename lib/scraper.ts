/**
 * TrackHive scraper service clients (server-side only).
 * TikTok: SCRAPER_URL | Instagram: INSTAGRAM_SCRAPER_URL
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

async function tiktokScrapePost<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const base = getTikTokScraperUrl()
  const res = await fetch(`${base}${path}`, {
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

  if (!res.ok || !json.success || json.data == null) {
    throw new ScraperError(
      res.status,
      json.error ?? `Scraper request failed (${res.status})`,
    )
  }

  return json.data
}

async function instagramScrapeList<T>(
  path: string,
  body: Record<string, unknown>,
  allowEmpty = false,
): Promise<T[]> {
  const base = getInstagramScraperUrl()
  const res = await fetch(`${base}${path}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  })

  let json: { success?: boolean; error?: string; data?: T[] }
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

  if (!Array.isArray(json.data)) {
    throw new ScraperError(res.status, "Scraper returned invalid data")
  }

  if (!allowEmpty && json.data.length === 0) {
    throw new ScraperError(404, "Instagram profile not found")
  }

  return json.data
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
