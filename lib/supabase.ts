import { createBrowserClient } from "@supabase/ssr"

// Uses @supabase/ssr's browser client so the session is stored in cookies
// (not localStorage). This makes the session readable by the Next.js middleware
// which checks cookies — fixing the post-login redirect loop.
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
