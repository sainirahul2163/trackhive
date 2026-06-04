import { supabase } from "@/lib/supabase"
import type { Competitor, CompetitorAccount, CompetitorVideo, CompetitorCreator, AiReport, Platform } from "@/types"

export async function fetchCompetitors(userId?: string): Promise<Competitor[]> {
  let query = supabase
    .from("competitors")
    .select("*, accounts:competitor_accounts(*)")
    .order("created_at", { ascending: false })

  if (userId) {
    query = query.or(`workspace_id.eq.${userId},workspace_id.is.null`)
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
  name: string
  website: string | null
  handles: Partial<Record<Platform, string | null>>
}

export async function addCompetitor({ name, website, handles }: AddCompetitorInput): Promise<Competitor> {
  // Insert competitor
  const { data: comp, error: compErr } = await supabase
    .from("competitors")
    .insert({ name, website })
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

export async function updateCreatorFlag(id: string, flagged: boolean): Promise<void> {
  const { error } = await supabase
    .from("competitor_creators")
    .update({ flagged_outreach: flagged })
    .eq("id", id)
  if (error) throw new Error(error.message)
}
