"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  Plus, RefreshCw, Trash2, Eye, MoreHorizontal, Pencil,
  Check, Clock, AtSign, Video,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { AddAccountDrawer } from "@/components/analytics/add-account-drawer"
import { PlatformIcon, PLATFORM_CONFIG } from "@/lib/platform"
import {
  AnalyticsBreadcrumb, AccountMultiSelect, ProjectsPlaceholder,
  PlatformToggles, FilterIconButton, TablePagination,
} from "@/components/analytics/analytics-shared"
import { fetchAccountsWithTotals } from "@/lib/analytics-queries"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/lib/use-user"
import type { TrackedAccount, Platform } from "@/types"
import type { AccountWithTotals } from "@/lib/analytics-queries"

type Tab = "accounts" | "videos" | "schedule"

interface IndividualVideo {
  id: string
  platform: Platform
  video_url: string
  caption: string | null
  status: string
}

export default function TrackingOptionsPage() {
  const { user } = useUser()
  const [tab, setTab] = useState<Tab>("accounts")
  const [accounts, setAccounts] = useState<AccountWithTotals[]>([])
  const [individualVideos, setIndividualVideos] = useState<IndividualVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([])
  const [platforms, setPlatforms] = useState<Platform[]>(["tiktok", "instagram", "youtube", "facebook"])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [syncingId, setSyncingId] = useState<string | null>(null)
  const [editingLimit, setEditingLimit] = useState<string | null>(null)
  const [limitValue, setLimitValue] = useState("30")
  const [videoUrl, setVideoUrl] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const accs = await fetchAccountsWithTotals(user?.id)
      setAccounts(accs)

      const { data, error } = await supabase.from("individually_tracked_videos").select("*").order("created_at", { ascending: false })
      if (!error) setIndividualVideos((data ?? []) as IndividualVideo[])
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => { load() }, [load])

  const filtered = accounts.filter((a) => {
    if (selectedAccounts.length && !selectedAccounts.includes(a.id)) return false
    if (platforms.length < 4 && !platforms.includes(a.platform)) return false
    return true
  })

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  async function handleSync(id: string) {
    setSyncingId(id)
    try {
      await fetch("/api/sync", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accountId: id }) })
      await load()
    } finally {
      setSyncingId(null)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this account from tracking?")) return
    await supabase.from("tracked_accounts").delete().eq("id", id)
    await load()
  }

  async function saveLimit(id: string) {
    const limit = parseInt(limitValue, 10)
    if (!limit || limit < 1) return
    await supabase.from("tracked_accounts").update({ tracking_limit: limit }).eq("id", id)
    setEditingLimit(null)
    await load()
  }

  async function trackVideo() {
    if (!videoUrl.trim()) return
    let platform: Platform = "tiktok"
    if (videoUrl.includes("instagram")) platform = "instagram"
    else if (videoUrl.includes("youtube") || videoUrl.includes("youtu.be")) platform = "youtube"
    else if (videoUrl.includes("facebook")) platform = "facebook"

    await supabase.from("individually_tracked_videos").insert({
      workspace_id: user?.id ?? null,
      platform,
      video_url: videoUrl.trim(),
      status: "pending",
    })
    setVideoUrl("")
    await load()
  }

  function handleAccountAdded(account: TrackedAccount) {
    setAccounts((prev) => [{
      ...account,
      video_count: 0,
      total_likes: 0,
      total_comments: 0,
      total_shares: 0,
      creator_name: null,
      tracking_limit: 30,
    }, ...prev])
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "accounts", label: "Accounts", icon: AtSign },
    { id: "videos", label: "Individual Videos", icon: Video },
    { id: "schedule", label: "Schedule", icon: Clock },
  ]

  return (
    <div className="space-y-5 max-w-7xl">
      <AnalyticsBreadcrumb section="Tracking Options" />
      <div>
        <h1 className="text-[22px] font-semibold text-white tracking-tight">Tracking Options</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Manage social accounts, videos, and hashtags you want to track.</p>
      </div>

      <div className="flex gap-1 border-b border-white/[0.06]">
        {tabs.map((t) => {
          const Icon = t.icon
          const active = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                active ? "border-purple-600 text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          )
        })}
      </div>

      {tab === "accounts" && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <AccountMultiSelect accounts={accounts} selected={selectedAccounts} onChange={setSelectedAccounts} />
            <ProjectsPlaceholder />
            <PlatformToggles selected={platforms} onChange={setPlatforms} />
            <select className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-300 outline-none">
              <option>All Accounts</option>
            </select>
            <FilterIconButton />
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium ml-auto"
            >
              <Plus className="w-4 h-4" />
              Track Account
            </button>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-[#111111] overflow-hidden">
            {loading ? <div className="p-8"><Skeleton className="h-32" /></div> : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.04] text-[11px] text-zinc-500 uppercase">
                        <th className="px-4 py-3 w-8"><input type="checkbox" onChange={(e) => setSelected(e.target.checked ? new Set(paged.map((a) => a.id)) : new Set())} /></th>
                        <th className="text-left px-4 py-3">Platform</th>
                        <th className="text-left px-4 py-3">Username</th>
                        <th className="text-left px-4 py-3">Status</th>
                        <th className="text-left px-4 py-3">Tools</th>
                        <th className="text-left px-4 py-3">Tracking Limit</th>
                        <th className="text-left px-4 py-3">Creator</th>
                        <th className="text-left px-4 py-3">Projects</th>
                        <th className="text-left px-4 py-3">Sync</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {paged.map((a) => {
                        const cfg = PLATFORM_CONFIG[a.platform]
                        const ok = a.last_synced_at && Date.now() - new Date(a.last_synced_at).getTime() < 86400000 * 2
                        return (
                          <tr key={a.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                            <td className="px-4 py-3">
                              <input type="checkbox" checked={selected.has(a.id)} onChange={() => {
                                const next = new Set(selected)
                                if (next.has(a.id)) next.delete(a.id)
                                else next.add(a.id)
                                setSelected(next)
                              }} />
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <PlatformIcon platform={a.platform} className="w-4 h-4" />
                                <span className="text-xs text-zinc-400">{cfg.label}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Avatar className="w-7 h-7">
                                  <AvatarImage src={a.avatar_url ?? undefined} />
                                  <AvatarFallback className="text-[9px]">{a.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-xs font-medium text-white">@{a.username}</p>
                                  <p className="text-[10px] text-zinc-500">{a.display_name}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${ok ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" : "bg-red-500/15 text-red-400 border border-red-500/25"}`}>
                                {ok ? "OK" : "Error"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <Link href={`/analytics/${a.id}`} className="p-1.5 rounded hover:bg-white/[0.06] text-zinc-500 hover:text-white"><Eye className="w-4 h-4" /></Link>
                                <button className="p-1.5 rounded hover:bg-white/[0.06] text-zinc-500"><MoreHorizontal className="w-4 h-4" /></button>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {editingLimit === a.id ? (
                                <div className="flex items-center gap-1">
                                  <input value={limitValue} onChange={(e) => setLimitValue(e.target.value)} className="w-12 px-1 py-0.5 text-xs bg-white/[0.05] border border-white/10 rounded text-white outline-none" />
                                  <span className="text-[10px] text-zinc-500">videos</span>
                                  <button onClick={() => saveLimit(a.id)} className="text-emerald-400"><Check className="w-3.5 h-3.5" /></button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-zinc-300">{a.tracking_limit ?? 30} videos</span>
                                  <button onClick={() => { setEditingLimit(a.id); setLimitValue(String(a.tracking_limit ?? 30)) }} className="text-zinc-600 hover:text-zinc-400"><Pencil className="w-3 h-3" /></button>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs text-zinc-500">{a.creator_name ?? "None"}</span>
                              <button className="ml-1 text-zinc-600 hover:text-purple-400 text-xs">+</button>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs text-zinc-500">None</span>
                              <button className="ml-1 text-zinc-600 hover:text-purple-400 text-xs">+</button>
                            </td>
                            <td className="px-4 py-3">
                              <button onClick={() => handleSync(a.id)} disabled={syncingId === a.id} className="p-1.5 rounded hover:bg-white/[0.06] text-zinc-500 hover:text-white disabled:opacity-50">
                                <RefreshCw className={`w-4 h-4 ${syncingId === a.id ? "animate-spin" : ""}`} />
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded hover:bg-red-500/10 text-zinc-500 hover:text-red-400">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <TablePagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} onPageSizeChange={setPageSize} />
              </>
            )}
          </div>
        </>
      )}

      {tab === "videos" && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Paste video URL to track individually..."
              className="flex-1 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-purple-500/40"
            />
            <button onClick={trackVideo} className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium flex items-center gap-2">
              <Plus className="w-4 h-4" /> Track Video
            </button>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-[#111111] overflow-hidden">
            {individualVideos.length === 0 ? (
              <p className="text-sm text-zinc-500 p-8 text-center">No individually tracked videos yet</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.04] text-[11px] text-zinc-500 uppercase">
                    <th className="text-left px-4 py-3">URL</th>
                    <th className="text-left px-4 py-3">Platform</th>
                    <th className="text-left px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {individualVideos.map((v) => (
                    <tr key={v.id} className="border-b border-white/[0.03]">
                      <td className="px-4 py-3 text-xs text-zinc-300 truncate max-w-md">{v.video_url}</td>
                      <td className="px-4 py-3"><PlatformIcon platform={v.platform} className="w-4 h-4" /></td>
                      <td className="px-4 py-3 text-xs text-zinc-400">{v.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {tab === "schedule" && (
        <div className="rounded-xl border border-dashed border-white/[0.1] bg-white/[0.02] p-12 flex flex-col items-center text-center gap-3">
          <Clock className="w-10 h-10 text-zinc-600" />
          <p className="text-sm font-semibold text-white">Schedule — Coming Soon</p>
          <p className="text-xs text-zinc-500 max-w-sm">Configure custom sync schedules for your tracked accounts.</p>
        </div>
      )}

      <AddAccountDrawer open={drawerOpen} onOpenChange={setDrawerOpen} onAccountAdded={handleAccountAdded} />
    </div>
  )
}
