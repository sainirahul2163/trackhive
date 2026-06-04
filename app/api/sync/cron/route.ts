import { NextResponse } from "next/server"

/**
 * Vercel Cron endpoint — called by Vercel every 24 hours.
 * Vercel automatically adds a `Authorization: Bearer <CRON_SECRET>` header
 * when it calls cron routes. We verify it to prevent public triggering.
 */
export const runtime = "nodejs"

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Kick off the sync via internal POST
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://trackhive.io"

  const syncRes = await fetch(`${baseUrl}/api/sync`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    "{}",
  })

  const result = await syncRes.json()

  return NextResponse.json({ ok: true, sync: result })
}
