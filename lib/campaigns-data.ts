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

export interface CampaignUpdatePayload {
  name?:          string
  brand?:         string | null
  start_date?:    string | null
  end_date?:      string | null
  target_views?:  number
  target_videos?: number
}

export async function updateCampaign(id: string, payload: CampaignUpdatePayload): Promise<Campaign> {
  const { data, error } = await supabase
    .from("campaigns")
    .update(payload)
    .eq("id", id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Campaign
}

export async function deleteCampaign(id: string): Promise<void> {
  const { error } = await supabase.from("campaigns").delete().eq("id", id)
  if (error) throw new Error(error.message)
}

export async function approveAllCampaignPayouts(campaignId: string): Promise<void> {
  const { error } = await supabase
    .from("campaign_creators")
    .update({ payout_status: "approved" })
    .eq("campaign_id", campaignId)
    .in("payout_status", ["pending", "on_hold"])
  if (error) throw new Error(error.message)

  const { error: payoutsError } = await supabase
    .from("payouts")
    .update({ status: "approved" })
    .eq("campaign_id", campaignId)
    .eq("status", "pending")
  if (payoutsError) throw new Error(payoutsError.message)
}

export async function updateCampaignCreatorPayoutStatus(
  creatorRowId: string,
  status: "pending" | "approved" | "on_hold" | "paid",
): Promise<void> {
  const { error } = await supabase
    .from("campaign_creators")
    .update({ payout_status: status })
    .eq("id", creatorRowId)
  if (error) throw new Error(error.message)
}
