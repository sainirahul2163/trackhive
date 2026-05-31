export interface MetricCard {
  title: string
  value: string
  change: string
  changeType: "positive" | "negative" | "neutral"
  icon: string
}

export interface Video {
  id: string
  title: string
  creator: string
  views: number
  revenue: number
  status: "active" | "paused" | "completed"
  campaign: string
  date: string
}

export interface Alert {
  id: string
  type: "warning" | "info" | "success" | "error"
  message: string
  creator: string
  timestamp: string
}

export interface Campaign {
  id: string
  name: string
  status: "active" | "paused" | "completed" | "draft"
  creators: number
  budget: number
  spent: number
  views: number
  startDate: string
  endDate: string
}

export interface ChartDataPoint {
  date: string
  views: number
  revenue: number
}

export interface Creator {
  id: string
  name: string
  avatar: string
  platform: "youtube" | "tiktok" | "instagram"
  followers: number
  engagement: number
}

// ── Analytics Module ─────────────────────────────────────────

export type Platform = "tiktok" | "instagram" | "youtube" | "facebook"

export interface TrackedAccount {
  id: string
  workspace_id: string | null
  platform: Platform
  username: string
  display_name: string | null
  avatar_url: string | null
  profile_url: string | null
  follower_count: number
  total_views: number
  avg_views: number
  engagement_rate: number
  last_synced_at: string | null
  created_at: string
}

export type ViralityLabel = "Hot" | "Rising" | "Normal"

export interface TrackedVideo {
  id: string
  account_id: string
  platform: Platform
  video_url: string
  thumbnail_url: string | null
  caption: string | null
  views: number
  likes: number
  comments: number
  shares: number
  saves: number
  engagement_rate: number
  virality_score: number
  tags: string[]
  posted_at: string | null
  created_at: string
}

export interface VideoDailyStat {
  id: string
  video_id: string
  date: string
  views: number
  likes: number
  comments: number
  shares: number
}

export interface AccountStats {
  totalAccounts: number
  totalViews: number
  avgEngagement: number
  activePlatforms: number
}
