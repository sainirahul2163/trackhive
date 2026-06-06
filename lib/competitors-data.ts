import { supabase } from "@/lib/supabase"
import type { Competitor, CompetitorAccount, CompetitorVideo, CompetitorCreator, AiReport, Platform } from "@/types"

export async function fetchCompetitors(userId?: string): Promise<Competitor[]> {
  let query = supabase
    .from("competitors")
    .select("*, accounts:competitor_accounts(*)")
    .order("created_at", { ascending: false })

  if (userId) {
    query = query.eq("workspace_id", userId)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data as Competitor[]
}

export async function fetchCompetitorDetail(id: string): Promise<Competitor> {
  const { data, error } = await supabase
    .from("competitors")
    .select("*, accounts:competitor_accounts(*)")
    .eq("id", id)
    .single()
  if (error) throw new Error(error.message)
  return data as Competitor
}

export async function fetchCompetitorVideos(competitorId: string): Promise<CompetitorVideo[]> {
  // Get all account IDs for this competitor
  const { data: accounts, error: accErr } = await supabase
    .from("competitor_accounts")
    .select("id")
    .eq("competitor_id", competitorId)
  if (accErr) throw new Error(accErr.message)

  const accountIds = (accounts ?? []).map((a: { id: string }) => a.id)
  if (accountIds.length === 0) return []

  const { data, error } = await supabase
    .from("competitor_videos")
    .select("*")
    .in("competitor_account_id", accountIds)
    .order("posted_at", { ascending: false })
  if (error) throw new Error(error.message)
  return data as CompetitorVideo[]
}

export async function fetchCompetitorCreators(competitorId: string): Promise<CompetitorCreator[]> {
  const { data, error } = await supabase
    .from("competitor_creators")
    .select("*")
    .eq("competitor_id", competitorId)
    .order("last_seen_at", { ascending: false })
  if (error) throw new Error(error.message)
  return data as CompetitorCreator[]
}

export async function fetchAiReports(competitorId: string): Promise<AiReport[]> {
  const { data, error } = await supabase
    .from("ai_reports")
    .select("*")
    .eq("competitor_id", competitorId)
    .order("week_of", { ascending: false })
  if (error) throw new Error(error.message)
  return data as AiReport[]
}

interface AddCompetitorInput {
  name:      string
  website:   string | null
  handles:   Partial<Record<Platform, string | null>>
  userId:    string
}

export async function addCompetitor({ name, website, handles, userId }: AddCompetitorInput): Promise<Competitor> {
  // Insert competitor
  const { data: comp, error: compErr } = await supabase
    .from("competitors")
    .insert({ name, website, workspace_id: userId })
    .select()
    .single()
  if (compErr) throw new Error(compErr.message)

  // Insert accounts for each non-empty handle
  const accountInserts = Object.entries(handles)
    .filter(([, username]) => username)
    .map(([platform, username]) => ({
      competitor_id: comp.id,
      platform,
      username: username!.startsWith("@") ? username! : `@${username!}`,
    }))

  let accounts: CompetitorAccount[] = []
  if (accountInserts.length > 0) {
    const { data: accs, error: accErr } = await supabase
      .from("competitor_accounts")
      .insert(accountInserts)
      .select()
    if (!accErr && accs) accounts = accs as CompetitorAccount[]
  }

  return { ...comp, accounts } as Competitor
}

export interface WeeklyComparisonPoint {
  week:       string
  competitor: number
  yours:      number
}

function weekStartKey(iso: string): string {
  const d = new Date(iso)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d.toISOString().slice(0, 10)
}

function weekLabel(key: string): string {
  return new Date(`${key}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function buildWeeklyBuckets(
  videos: { posted_at: string | null; views: number }[],
  weeksBack = 12,
): Map<string, number> {
  const totals = new Map<string, number>()
  const now = new Date()
  const start = new Date(now)
  start.setDate(start.getDate() - weeksBack * 7)

  for (const v of videos) {
    if (!v.posted_at) continue
    const posted = new Date(v.posted_at)
    if (posted < start) continue
    const key = weekStartKey(v.posted_at)
    totals.set(key, (totals.get(key) ?? 0) + (v.views ?? 0))
  }
  return totals
}

function mergeWeeklySeries(
  competitor: Map<string, number>,
  yours: Map<string, number>,
): WeeklyComparisonPoint[] {
  const keys = new Set([...Array.from(competitor.keys()), ...Array.from(yours.keys())])
  return Array.from(keys)
    .sort()
    .map((key) => ({
      week:       weekLabel(key),
      competitor: competitor.get(key) ?? 0,
      yours:      yours.get(key) ?? 0,
    }))
}

export async function fetchWeeklyComparison(
  competitorId: string,
  userId?: string,
): Promise<WeeklyComparisonPoint[]> {
  const { data: accounts, error: accErr } = await supabase
    .from("competitor_accounts")
    .select("id")
    .eq("competitor_id", competitorId)
  if (accErr) throw new Error(accErr.message)

  const accountIds = (accounts ?? []).map((a: { id: string }) => a.id)
  let competitorVideos: { posted_at: string | null; views: number }[] = []

  if (accountIds.length > 0) {
    const { data, error } = await supabase
      .from("competitor_videos")
      .select("posted_at, views")
      .in("competitor_account_id", accountIds)
    if (error) throw new Error(error.message)
    competitorVideos = (data ?? []) as { posted_at: string | null; views: number }[]
  }

  let yourVideos: { posted_at: string | null; views: number }[] = []
  if (userId) {
    const { data: tracked, error: trackErr } = await supabase
      .from("tracked_accounts")
      .select("id")
      .eq("workspace_id", userId)
    if (trackErr) throw new Error(trackErr.message)

    const trackedIds = (tracked ?? []).map((a: { id: string }) => a.id)
    if (trackedIds.length > 0) {
      const since = new Date()
      since.setDate(since.getDate() - 12 * 7)
      const { data, error } = await supabase
        .from("tracked_videos")
        .select("posted_at, views")
        .in("account_id", trackedIds)
        .gte("posted_at", since.toISOString())
      if (error) throw new Error(error.message)
      yourVideos = (data ?? []) as { posted_at: string | null; views: number }[]
    }
  }

  return mergeWeeklySeries(
    buildWeeklyBuckets(competitorVideos),
    buildWeeklyBuckets(yourVideos),
  )
}

export async function updateCreatorFlag(id: string, flagged: boolean): Promise<void> {
  const { error } = await supabase
    .from("competitor_creators")
    .update({ flagged_outreach: flagged })
    .eq("id", id)
  if (error) throw new Error(error.message)
}
