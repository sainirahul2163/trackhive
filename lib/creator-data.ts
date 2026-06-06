import { supabase } from "@/lib/supabase"

export async function updateCreatorProfile(
  userId: string,
  payload: { full_name: string; bio: string | null },
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", userId)
  if (error) throw new Error(error.message)
}

export async function acceptCampaignInvite(campaignCreatorId: string): Promise<void> {
  const { error } = await supabase
    .from("campaign_creators")
    .update({ status: "active" })
    .eq("id", campaignCreatorId)
  if (error) throw new Error(error.message)
}

export async function declineCampaignInvite(campaignCreatorId: string): Promise<void> {
  const { error } = await supabase
    .from("campaign_creators")
    .update({ status: "removed" })
    .eq("id", campaignCreatorId)
  if (error) throw new Error(error.message)
}
