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

export interface YouTubeChannelInfo {
  channel_name:     string
  avatar:           string
  subscriber_count: number
  video_count:      number
  total_views:      number
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

// ─── 5. YouTube — handle → channel ID + channel info ────────────────────────

interface YTChannelIdResponse {
  channel_id?: string
  id?:         string
}

/** Resolve a @handle to a UC… channel ID via EnsembleData. */
export async function getYouTubeChannelIdFromHandle(handle: string): Promise<string> {
  const clean = handle.replace(/^@/, "").trim()
  if (!clean) throw new EnsembleDataError(422, "YouTube handle is required")

  const cacheKey = `yt:handle-id:${clean}`
  const cached = fromCache<string>(cacheKey)
  if (cached) return cached

  const raw = await ed<YTChannelIdResponse | string>("/youtube/channel/get-id", { username: clean })
  const channelId =
    typeof raw === "string"
      ? raw
      : (raw.channel_id ?? raw.id ?? "")

  if (!channelId) {
    throw new EnsembleDataError(404, `YouTube channel not found for @${clean}`)
  }

  toCache(cacheKey, channelId)
  return channelId
}

export function extractYouTubeIdentifier(input: string): { type: "channel_id" | "handle"; value: string } {
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

/** Resolve a handle, @handle, URL, or UC… channel ID to a channel ID. */
export async function resolveYouTubeChannelId(usernameOrUrl: string): Promise<string> {
  const parsed = extractYouTubeIdentifier(usernameOrUrl)
  if (parsed.type === "channel_id") return parsed.value
  return getYouTubeChannelIdFromHandle(parsed.value)
}

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
