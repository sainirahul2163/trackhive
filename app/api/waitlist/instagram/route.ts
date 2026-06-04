import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase-server"

interface WaitlistBody {
  email:   string
  userId?: string
}

export async function POST(req: Request) {
  let body: WaitlistBody
  try {
    body = (await req.json()) as WaitlistBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { email, userId } = body

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
  }

  const supabase = createServerSupabase()

  const { error } = await supabase
    .from("instagram_oauth_waitlist")
    .upsert(
      { email: email.toLowerCase().trim(), user_id: userId ?? null },
      { onConflict: "email", ignoreDuplicates: true },
    )

  if (error) {
    // Duplicate email — already on list
    if (error.code === "23505") {
      return NextResponse.json({ message: "already_on_waitlist" }, { status: 200 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: "added_to_waitlist" }, { status: 201 })
}
