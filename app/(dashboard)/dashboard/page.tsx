"use client"

import {
  Eye,
  Megaphone,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Play,
  MoreHorizontal,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const metrics = [
  {
    title: "Total Views",
    value: "24.8M",
    change: "+18.2%",
    changeType: "positive" as const,
    icon: Eye,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    description: "vs last month",
  },
  {
    title: "Active Campaigns",
    value: "12",
    change: "+3",
    changeType: "positive" as const,
    icon: Megaphone,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    description: "this month",
  },
  {
    title: "Pending Payouts",
    value: "$48,230",
    change: "-$2,100",
    changeType: "negative" as const,
    icon: DollarSign,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    description: "vs last week",
  },
  {
    title: "Creator Alerts",
    value: "7",
    change: "+4",
    changeType: "negative" as const,
    icon: AlertTriangle,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    description: "need attention",
  },
]

const generateChartData = () => {
  const data = []
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      views: Math.floor(Math.random() * 900000 + 400000),
      revenue: Math.floor(Math.random() * 8000 + 2000),
    })
  }
  return data
}

const chartData = generateChartData()

const topVideos = [
  {
    id: "1",
    title: "I tried every protein powder for 30 days",
    creator: "@jake_fitness",
    views: "4.2M",
    revenue: "$12,400",
    status: "active",
    campaign: "ProteinPro Summer",
  },
  {
    id: "2",
    title: "My honest review of this $200 gadget",
    creator: "@techreviewer",
    views: "2.8M",
    revenue: "$8,900",
    status: "active",
    campaign: "GadgetHive Q2",
  },
  {
    id: "3",
    title: "Day in my life as a NYC freelancer",
    creator: "@freelife_nyc",
    views: "1.9M",
    revenue: "$5,200",
    status: "paused",
    campaign: "Creator Life Series",
  },
  {
    id: "4",
    title: "How I make $10K/month with this app",
    creator: "@moneymoves22",
    views: "1.6M",
    revenue: "$4,100",
    status: "active",
    campaign: "FinanceApp Pro",
  },
  {
    id: "5",
    title: "The skincare routine that changed my life",
    creator: "@glowup_daily",
    views: "1.1M",
    revenue: "$3,800",
    status: "completed",
    campaign: "Glow Summer",
  },
]

const recentAlerts = [
  {
    id: "1",
    type: "warning",
    message: "@jake_fitness missed posting deadline by 2 days",
    time: "15 min ago",
  },
  {
    id: "2",
    type: "info",
    message: "Campaign \"GadgetHive Q2\" is 80% through budget",
    time: "1 hour ago",
  },
  {
    id: "3",
    type: "success",
    message: "@glowup_daily completed all deliverables",
    time: "3 hours ago",
  },
  {
    id: "4",
    type: "error",
    message: "Payment to @moneymoves22 failed — card declined",
    time: "5 hours ago",
  },
  {
    id: "5",
    type: "warning",
    message: "Competitor \"BrandX\" launched 3 new campaigns",
    time: "Yesterday",
  },
]

const alertDots: Record<string, string> = {
  warning: "bg-amber-400",
  info: "bg-blue-400",
  success: "bg-emerald-400",
  error: "bg-red-400",
}

const statusColors = {
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  paused: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  completed: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 shadow-xl">
        <p className="text-xs text-zinc-500 mb-2">{label}</p>
        <p className="text-sm font-semibold text-purple-400">
          {Number(payload[0]?.value).toLocaleString()} views
        </p>
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-semibold text-white tracking-tight">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          Here&apos;s what&apos;s happening with your campaigns today.
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          const isPositive = metric.changeType === "positive"
          return (
            <div
              key={metric.title}
              className="rounded-xl border border-white/[0.06] bg-[#111111] p-5 hover:border-white/10 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  {metric.title}
                </span>
                <div className={`w-8 h-8 rounded-lg ${metric.bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${metric.color}`} />
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-2xl font-bold text-white tracking-tight">{metric.value}</p>
                <div className="flex items-center gap-1.5">
                  {isPositive ? (
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />
                  )}
                  <span
                    className={`text-xs font-medium ${
                      isPositive ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {metric.change}
                  </span>
                  <span className="text-xs text-zinc-600">{metric.description}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Chart + Alerts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Line chart */}
        <div className="xl:col-span-2 rounded-xl border border-white/[0.06] bg-[#111111] p-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-[15px] font-semibold text-white">Views Overview</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Last 30 days</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" />
              <span>+18.2%</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: "#52525b", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval={6}
              />
              <YAxis
                tick={{ fill: "#52525b", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="views"
                stroke="#7C3AED"
                strokeWidth={2}
                fill="url(#viewsGradient)"
                dot={false}
                activeDot={{ r: 4, fill: "#7C3AED", stroke: "#0a0a0a", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Alerts */}
        <div className="rounded-xl border border-white/[0.06] bg-[#111111] p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[15px] font-semibold text-white">Recent Alerts</h2>
            <button className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
              View all
            </button>
          </div>
          <div className="space-y-3">
            {recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-colors"
              >
                <div className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${alertDots[alert.type]}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-zinc-300 leading-relaxed">{alert.message}</p>
                  <p className="text-[11px] text-zinc-600 mt-1">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top performing videos table */}
      <div className="rounded-xl border border-white/[0.06] bg-[#111111] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-[15px] font-semibold text-white">Top Performing Videos</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Sorted by total views this month</p>
          </div>
          <button className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
            View all
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.04]">
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Video
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="text-center px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {topVideos.map((video) => (
                <tr
                  key={video.id}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-600/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <Play className="w-3.5 h-3.5 text-purple-400" fill="currentColor" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors line-clamp-1">
                          {video.title}
                        </p>
                        <p className="text-xs text-zinc-500">{video.creator}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs text-zinc-400">{video.campaign}</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-sm font-medium text-zinc-200">{video.views}</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-sm font-medium text-emerald-400">{video.revenue}</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                        statusColors[video.status as keyof typeof statusColors]
                      }`}
                    >
                      {video.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <button className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-white/[0.05] transition-all">
                      <MoreHorizontal className="w-4 h-4 text-zinc-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
