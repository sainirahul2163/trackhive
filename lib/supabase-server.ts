/**
 * Server-side Supabase client — use ONLY in API routes and server components.
 * Uses the public anon key (Row Level Security enforced by Supabase).
 */
import { createClient } from "@supabase/supabase-js"

export function createServerSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
