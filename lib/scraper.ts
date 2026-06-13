/**
 * TrackHive scraper service client (server-side only).
 * Base URL from SCRAPER_URL env var.
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

function getScraperUrl(): string {
  const url = process.env.SCRAPER_URL?.trim()
  if (!url) throw new ScraperError(500, "SCRAPER_URL is not configured")
  return url.replace(/\/$/, "")
}

async function scrapePost<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const base = getScraperUrl()
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

export async function scrapeTikTokProfile(username: string): Promise<TikTokProfileData> {
  return scrapePost<TikTokProfileData>("/scrape/tiktok/profile", { username })
}

export async function scrapeTikTokVideos(
  username: string,
  limit = 30,
): Promise<TikTokVideoData[]> {
  const base = getScraperUrl()
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
