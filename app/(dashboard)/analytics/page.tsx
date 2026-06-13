"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Plus, Search, RefreshCw, Trash2, Eye,
  Users, TrendingUp, Globe, AlertCircle, Heart, MessageCircle, Share2, Video,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { AddAccountDrawer } from "@/components/analytics/add-account-drawer"
import { PlatformIcon, PLATFORM_CONFIG, formatNumber } from "@/lib/platform"
import { CmdKSearch } from "@/components/ui/cmd-search"
import { fetchAccountsWithTotals, type AccountWithTotals } from "@/lib/analytics-queries"
import {
  AnalyticsBreadcrumb, ExportCsvButton, TablePagination, PostActivitySparkline,
} from "@/components/analytics/analytics-shared"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/lib/use-user"
import { toast, Toaster } from "sonner"
import type { TrackedAccount, Platform } from "@/types"

const TOAST_STYLE = {
  backgroundColor: "#1a1a1a",
  border:          "1px solid rgba(255,255,255,0.08)",
  color:           "#fafafa",
} as const

const FACEBOOK_SYNC_NOW_MESSAGE =
  "Syncing Facebook data can take 3–5 minutes due to Meta's platform limitations. Please keep this page open."

type SortKey = "username" | "followers" | "total_views" | "avg_views" | "engagement_rate" | "video_count" | "total_likes" | "total_comments" | "total_shares" | "last_synced_at"

const PLATFORMS: { value: Platform | "all"; label: string }[] = [
  { value: "all", label: "All Platforms" },
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "facebook", label: "Facebook" },
]


function timeAgo(iso: string | null): string {
  if (!iso) return "Never"
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function TableSkeleton() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#111111] overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.04] flex gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16 ml-auto" />
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-white/[0.03]">
          <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-3.5 w-14" />
          <Skeleton className="h-3.5 w-14" />
          <Skeleton className="h-3.5 w-14" />
          <Skeleton className="h-3.5 w-10" />
          <Skeleton className="h-3.5 w-16" />
        </div>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const router = useRouter()
  const { user } = useUser()
  const [accounts, setAccounts] = useState<AccountWithTotals[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [platform, setPlatform] = useState<Platform | "all">("all")
  const [sortKey, setSortKey] = useState<SortKey>("total_views")
  const [sortAsc, setSortAsc] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const load = useCallback(async (userId?: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAccountsWithTotals(userId)
      setAccounts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load accounts.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(user?.id) }, [load, user?.id])

  const filtered = accounts
    .filter((a) => {
      const matchSearch =
        a.username.toLowerCase().includes(search.toLowerCase()) ||
        (a.display_name ?? "").toLowerCase().includes(search.toLowerCase())
      const matchPlatform = platform === "all" || a.platform === platform
      return matchSearch && matchPlatform
    })
    .sort((a, b) => {
      let av: number | string = 0
      let bv: number | string = 0
      if (sortKey === "username") {
        av = a.username
        bv = b.username
        return sortAsc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
      }
      if (sortKey === "last_synced_at") {
        av = a.last_synced_at ? new Date(a.last_synced_at).getTime() : 0
        bv = b.last_synced_at ? new Date(b.last_synced_at).getTime() : 0
      } else if (sortKey === "video_count") {
        av = a.video_count
        bv = b.video_count
      } else if (sortKey === "total_likes") {
        av = a.total_likes
        bv = b.total_likes
      } else if (sortKey === "total_comments") {
        av = a.total_comments
        bv = b.total_comments
      } else if (sortKey === "total_shares") {
        av = a.total_shares
        bv = b.total_shares
      } else if (sortKey === "followers") {
        av = a.follower_count
        bv = b.follower_count
      } else if (sortKey === "engagement_rate") {
        av = a.engagement_rate
        bv = b.engagement_rate
      } else if (sortKey === "avg_views") {
        av = a.avg_views ?? 0
        bv = b.avg_views ?? 0
      } else {
        av = a.total_views ?? 0
        bv = b.total_views ?? 0
      }
      return sortAsc ? Number(av) - Number(bv) : Number(bv) - Number(av)
    })

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc)
    else { setSortKey(key); setSortAsc(false) }
  }

  const csvRows = [
    ["Username", "Platform", "Followers", "Views", "Videos", "Likes", "Comments", "Shares", "Engagement"],
    ...filtered.map((a) => [
      a.username,
      a.platform,
      String(a.follower_count),
      String(a.total_views ?? 0),
      String(a.video_count),
      String(a.total_likes),
      String(a.total_comments),
      a.platform === "instagram" ? "N/A" : String(a.total_shares),
      `${a.engagement_rate}%`,
    ]),
  ]

  const stats = {
    totalAccounts: accounts.length,
    totalViews: accounts.reduce((s, a) => s + (a.total_views ?? 0), 0),
    avgEngagement:
      accounts.reduce((s, a) => s + a.engagement_rate, 0) / (accounts.length || 1),
    activePlatforms: new Set(accounts.map((a) => a.platform)).size,
  }

  const [syncingId, setSyncingId] = useState<string | null>(null)

  async function handleSync(id: string) {
    const account = accounts.find((a) => a.id === id)
    if (account?.platform === "facebook") {
      toast.info(FACEBOOK_SYNC_NOW_MESSAGE, { duration: 10000 })
    }

    setSyncingId(id)
    try {
      await fetch("/api/sync", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ accountId: id }),
      })
      await load(user?.id)
    } finally {
      setSyncingId(null)
    }
  }

  async function handleRemove(id: string) {
    setAccounts((prev) => prev.filter((a) => a.id !== id))
    await supabase.from("tracked_accounts").delete().eq("id", id)
  }

  function handleAccountAdded(account: TrackedAccount) {
    setAccounts((prev) => [{
      ...account,
      video_count: 0,
      total_likes: 0,
      total_comments: 0,
      total_shares: 0,
      creator_name: null,
      postsByDay: new Map(),
    }, ...prev])
  }

  const statCards = [
    { label: "Total Accounts", value: stats.totalAccounts, icon: Users, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Total Views", value: formatNumber(stats.totalViews), icon: Eye, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Avg Engagement", value: `${stats.avgEngagement.toFixed(1)}%`, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Active Platforms", value: stats.activePlatforms, icon: Globe, color: "text-amber-400", bg: "bg-amber-500/10" },
  ]

  return (
    <div className="space-y-5 max-w-7xl">
      <Toaster position="top-right" toastOptions={{ style: TOAST_STYLE }} />
      <CmdKSearch />
      <AnalyticsBreadcrumb section="Accounts" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-white tracking-tight">Accounts</h1>
          <p className="text-sm text-zinc-500 mt-0.5">View and analyze performance metrics across your tracked accounts.</p>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Add Account
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {statCards.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="rounded-xl border border-white/[0.06] bg-[#111111] px-4 py-3.5 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div>
                <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider">{s.label}</p>
                {loading ? (
                  <Skeleton className="h-5 w-16 mt-1" />
                ) : (
                  <p className="text-lg font-bold text-white leading-tight">{s.value}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search accounts..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#111111] border border-white/[0.06] text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-purple-500/40 transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {PLATFORMS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPlatform(p.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                platform === p.value
                  ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                  : "bg-[#111111] text-zinc-400 border border-white/[0.06] hover:text-zinc-200 hover:border-white/10"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <ExportCsvButton rows={csvRows} filename="trackhive-accounts.csv" />
      </div>

      {/* Loading state */}
      {loading && <TableSkeleton />}

      {/* Error state */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-red-500/10 bg-red-500/5">
          <AlertCircle className="w-8 h-8 text-red-400 mb-3" />
          <p className="text-sm font-medium text-white mb-1">Failed to load accounts</p>
          <p className="text-xs text-zinc-500 mb-4 text-center max-w-xs">{error}</p>
          <button
            onClick={() => load(user?.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.09] text-zinc-200 text-sm font-medium transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 rounded-xl border border-white/[0.06] bg-[#111111]">
          <div className="w-12 h-12 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-purple-400" />
          </div>
          <p className="text-base font-semibold text-white mb-1">
            {search || platform !== "all" ? "No accounts match your filters" : "No accounts tracked yet"}
          </p>
          <p className="text-sm text-zinc-500 mb-5 text-center max-w-xs">
            {search || platform !== "all"
              ? "Try adjusting your search or platform filter."
              : "Add a TikTok, Instagram, YouTube or Facebook account to start tracking."}
          </p>
          {!search && platform === "all" && (
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Account
            </button>
          )}
        </div>
      )}

      {/* Table */}
      {!loading && !error && filtered.length > 0 && (
        <div className="rounded-xl border border-white/[0.06] bg-[#111111] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  {([
                    { key: "username" as SortKey, label: "Account", align: "left", icon: undefined },
                    { key: null, label: "Creator", align: "left" },
                    { key: null, label: "Post Activity", align: "left" },
                    { key: "video_count" as SortKey, label: "Videos", icon: Video },
                    { key: "followers" as SortKey, label: "Followers", icon: Users },
                    { key: "total_views" as SortKey, label: "Views", icon: Eye },
                    { key: "total_likes" as SortKey, label: "Likes", icon: Heart },
                    { key: "total_comments" as SortKey, label: "Comments", icon: MessageCircle },
                    { key: "total_shares" as SortKey, label: "Shares", icon: Share2 },
                    { key: "engagement_rate" as SortKey, label: "Engagement", align: "right" },
                    { key: "last_synced_at" as SortKey, label: "Last Synced", align: "left" },
                  ]).map((col, i) => {
                    const Icon = col.icon
                    return (
                      <th
                        key={i}
                        title={col.label}
                        className={`${col.align === "left" ? "text-left" : "text-right"} px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider ${col.key ? "cursor-pointer hover:text-zinc-300" : ""}`}
                        onClick={() => col.key && toggleSort(col.key)}
                      >
                        {Icon ? <Icon className="w-3.5 h-3.5 inline" /> : col.label}
                      </th>
                    )
                  })}
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {paged.map((account) => {
                  const cfg = PLATFORM_CONFIG[account.platform]
                  return (
                    <tr
                      key={account.id}
                      onClick={() => router.push(`/analytics/${account.id}`)}
                      className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            <AvatarImage src={account.avatar_url ?? ""} />
                            <AvatarFallback className="bg-purple-600/20 text-purple-400 text-xs font-bold">
                              {account.username.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
                                {account.display_name ?? account.username}
                              </span>
                              <span
                                className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium"
                                style={{ backgroundColor: cfg.bgColor, color: cfg.fgColor }}
                              >
                                <PlatformIcon platform={account.platform} className="w-2.5 h-2.5" />
                                {cfg.label}
                              </span>
                            </div>
                            <span className="text-xs text-zinc-500">@{account.username}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-zinc-500">{account.creator_name ?? "None"}</span>
                        <button className="ml-1 text-zinc-600 hover:text-purple-400 text-xs" onClick={(e) => e.stopPropagation()}>+</button>
                      </td>
                      <td className="px-4 py-3.5">
                        <PostActivitySparkline postsByDay={account.postsByDay} />
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="text-sm text-zinc-300">{account.video_count}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="text-sm text-zinc-300">{formatNumber(account.follower_count)}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="text-sm font-medium text-zinc-200">{formatNumber(account.total_views ?? 0)}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="text-sm text-zinc-300">{formatNumber(account.total_likes)}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="text-sm text-zinc-300">{formatNumber(account.total_comments)}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="text-sm text-zinc-400">{account.platform === "instagram" ? "N/A" : formatNumber(account.total_shares)}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className={`text-sm font-medium ${account.engagement_rate >= 5 ? "text-emerald-400" : account.engagement_rate >= 3 ? "text-zinc-300" : "text-amber-400"}`}>
                          {account.engagement_rate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${account.last_synced_at ? "bg-emerald-400" : "bg-zinc-600"}`} />
                          <span className="text-xs text-zinc-500">{timeAgo(account.last_synced_at)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/analytics/${account.id}`}
                            className="p-1.5 rounded-md hover:bg-white/[0.06] text-zinc-500 hover:text-zinc-200 transition-colors"
                            title="View"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleSync(account.id)}
                            disabled={syncingId === account.id}
                            className="p-1.5 rounded-md hover:bg-white/[0.06] text-zinc-500 hover:text-zinc-200 transition-colors disabled:opacity-50"
                            title="Sync now"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${syncingId === account.id ? "animate-spin" : ""}`} />
                          </button>
                          <button
                            onClick={() => handleRemove(account.id)}
                            className="p-1.5 rounded-md hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <TablePagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} onPageSizeChange={setPageSize} />
        </div>
      )}

      <AddAccountDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onAccountAdded={handleAccountAdded}
      />
    </div>
  )
}
