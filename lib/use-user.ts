"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import type { User } from "@supabase/supabase-js"

export interface AuthUser {
  id:          string
  email:       string
  displayName: string   // full_name → email prefix → "User"
  initials:    string   // up to 2 chars, uppercase
  avatarUrl:   string
}

function toAuthUser(user: User): AuthUser {
  const meta     = (user.user_metadata ?? {}) as Record<string, string>
  const fullName = meta.full_name ?? meta.name ?? ""
  const email    = user.email ?? ""

  const displayName = fullName || email.split("@")[0] || "User"

  const initials = fullName
    ? fullName.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase()
    : displayName.slice(0, 2).toUpperCase()

  const avatarUrl =
    meta.avatar_url ??
    meta.picture ??
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=7C3AED&textColor=ffffff`

  return { id: user.id, email, displayName, initials, avatarUrl }
}

export function useUser() {
  const [user,    setUser]    = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ? toAuthUser(data.user) : null)
      setLoading(false)
    })

    // Keep in sync if session changes (e.g. token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? toAuthUser(session.user) : null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
