import { supabase } from "@/lib/supabase"
import type { Campaign, CampaignCreator } from "@/types"

export async function fetchCampaigns(userId?: string): Promise<Campaign[]> {
  let query = supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false })

  if (userId) {
    query = query.eq("workspace_id", userId)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data as Campaign[]
}

export async function fetchCampaign(id: string): Promise<Campaign> {
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .single()
  if (error) throw new Error(error.message)
  return data as Campaign
}

export async function fetchCampaignCreators(campaignId: string): Promise<CampaignCreator[]> {
  const { data, error } = await supabase
    .from("campaign_creators")
    .select("*, account:tracked_accounts(*)")
    .eq("campaign_id", campaignId)
    .order("views_delivered", { ascending: false })
  if (error) throw new Error(error.message)
  return data as CampaignCreator[]
}

export async function insertCampaign(
  payload: Omit<Campaign, "id" | "created_at" | "total_views" | "total_videos" | "total_payout">
): Promise<Campaign> {
  const { data, error } = await supabase
    .from("campaigns")
    .insert({ ...payload, total_views: 0, total_videos: 0, total_payout: 0 })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Campaign
}

export async function insertCampaignCreators(
  campaignId: string,
  accountIds: string[]
): Promise<void> {
  if (accountIds.length === 0) return
  const { error } = await supabase.from("campaign_creators").insert(
    accountIds.map(account_id => ({ campaign_id: campaignId, account_id }))
  )
  if (error) throw new Error(error.message)
}
