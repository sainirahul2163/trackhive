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

export interface DashboardCampaign {
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

// ── Campaigns Module ──────────────────────────────────────────

export type CampaignStatus = "draft" | "active" | "paused" | "completed"
export type PayoutStatus = "pending" | "approved" | "on_hold" | "paid"
export type CreatorStatus = "active" | "behind_schedule" | "completed" | "removed"

export interface Campaign {
  id: string
  workspace_id: string | null
  name: string
  brand: string | null
  status: CampaignStatus
  start_date: string | null
  end_date: string | null
  target_views: number
  target_videos: number
  total_views: number
  total_videos: number
  total_payout: number
  base_fee: number
  cpm_rate: number
  milestone_bonus: number
  performance_cap: number
  payout_window: number
  brief: string | null
  created_at: string
}

export interface CampaignCreator {
  id: string
  campaign_id: string
  account_id: string
  status: CreatorStatus
  videos_posted: number
  views_delivered: number
  payout_earned: number
  payout_status: PayoutStatus
  last_posted_at: string | null
  joined_at: string
  // joined from tracked_accounts
  account?: TrackedAccount
}

export interface CampaignAlert {
  id: string
  campaign_id: string
  type: "warning" | "info" | "success" | "error"
  message: string
  is_read: boolean
  created_at: string
}
