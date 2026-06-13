/**
 * Platform capability metadata — SERVER SIDE ONLY.
 */

export const PLATFORM_LIMITATIONS = {
  instagram: { views: true,   saves: false, shares: false },
  tiktok:    { views: true,   saves: false, shares: true  },
  youtube:   { views: true,   saves: false, shares: false },
  facebook:  { views: true,   saves: false, shares: false },
} as const

export type PlatformId = keyof typeof PLATFORM_LIMITATIONS

/** Returns true when the given platform exposes view counts to third-party apps */
export function platformHasViews(platform: string): boolean {
  return (PLATFORM_LIMITATIONS as Record<string, { views: boolean }>)[platform]?.views ?? false
}
