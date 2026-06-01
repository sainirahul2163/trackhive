import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

/** Returns the currently authenticated user, or null if not signed in. */
export async function getCurrentUser(): Promise<User | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/** Returns true if there is an active session. */
export async function isAuthenticated(): Promise<boolean> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session !== null
}

/** Signs the user out and returns to the login page. */
export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
}
