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
