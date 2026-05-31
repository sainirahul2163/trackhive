import { supabase } from "@/lib/supabase"
import type { TrackedAccount, TrackedVideo } from "@/types"

export async function fetchTrackedAccounts(): Promise<TrackedAccount[]> {
  const { data, error } = await supabase
    .from("tracked_accounts")
    .select("*")
    .order("total_views", { ascending: false })

  if (error) throw new Error(error.message)
  return data as TrackedAccount[]
}

export async function fetchTrackedAccount(id: string): Promise<TrackedAccount> {
  const { data, error } = await supabase
    .from("tracked_accounts")
    .select("*")
    .eq("id", id)
    .single()

  if (error) throw new Error(error.message)
  return data as TrackedAccount
}

export async function fetchTrackedVideos(accountId: string): Promise<TrackedVideo[]> {
  const { data, error } = await supabase
    .from("tracked_videos")
    .select("*")
    .eq("account_id", accountId)
    .order("posted_at", { ascending: false })

  if (error) throw new Error(error.message)
  return data as TrackedVideo[]
}

export async function insertTrackedAccount(
  account: Omit<TrackedAccount, "id" | "created_at">
): Promise<TrackedAccount> {
  const { data, error } = await supabase
    .from("tracked_accounts")
    .insert(account)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as TrackedAccount
}
