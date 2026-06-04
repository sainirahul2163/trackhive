import { supabase } from "@/lib/supabase"
import type { Creator, Payout, PayoutRule } from "@/types"

export async function fetchCreators(userId?: string): Promise<Creator[]> {
  let query = supabase
    .from("creators")
    .select("*")
    .order("created_at", { ascending: false })

  if (userId) {
    query = query.or(`workspace_id.eq.${userId},workspace_id.is.null`)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data as Creator[]
}

export async function fetchPayouts(status?: string, userId?: string): Promise<Payout[]> {
  let query = supabase
    .from("payouts")
    .select("*, creator:creators(*), campaign:campaigns(id,name)")
    .order("created_at", { ascending: false })

  if (status) query = query.eq("status", status)
  if (userId) query = query.or(`workspace_id.eq.${userId},workspace_id.is.null`)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data as Payout[]
}

export async function fetchPayoutRules(userId?: string): Promise<PayoutRule[]> {
  let query = supabase
    .from("payout_rules")
    .select("*")
    .order("is_default", { ascending: false })

  if (userId) {
    query = query.or(`workspace_id.eq.${userId},workspace_id.is.null`)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data as PayoutRule[]
}

export async function updatePayoutStatus(
  id: string,
  status: string,
  extra?: Partial<Pick<Payout, "adjustment" | "adjustment_note" | "paid_at" | "invoice_number" | "amount">>
): Promise<void> {
  const { error } = await supabase
    .from("payouts")
    .update({ status, ...extra })
    .eq("id", id)
  if (error) throw new Error(error.message)
}

export async function insertCreator(
  payload: Pick<Creator, "name" | "email" | "payment_method"> & { invite_token?: string }
): Promise<Creator> {
  const { data, error } = await supabase
    .from("creators")
    .insert({ ...payload, invite_sent_at: new Date().toISOString(), invite_accepted: false })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Creator
}

export async function insertPayoutRule(
  payload: Omit<PayoutRule, "id" | "created_at">
): Promise<PayoutRule> {
  const { data, error } = await supabase
    .from("payout_rules")
    .insert(payload)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as PayoutRule
}
