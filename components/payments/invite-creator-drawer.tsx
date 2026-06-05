"use client"

import { useState, useEffect } from "react"
import {
  X, UserPlus, ScanLine, Info, Shield, Send, Check,
  ChevronDown, Search,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { fetchTrackedAccounts } from "@/lib/analytics-data"
import { PlatformIcon } from "@/lib/platform"
import { useUser } from "@/lib/use-user"
import type { PayoutRule, TrackedAccount } from "@/types"

interface InviteCreatorDrawerProps {
  open: boolean
  onClose: () => void
  rules: PayoutRule[]
}

type OnboardingMode = "off_platform" | "invite"

export function InviteCreatorDrawer({ open, onClose }: InviteCreatorDrawerProps) {
  const { user } = useUser()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [notes, setNotes] = useState("")
  const [mode, setMode] = useState<OnboardingMode>("off_platform")
  const [accounts, setAccounts] = useState<TrackedAccount[]>([])
  const [linkedIds, setLinkedIds] = useState<string[]>([])
  const [accountSearch, setAccountSearch] = useState("")
  const [accountPickerOpen, setAccountPickerOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (open) fetchTrackedAccounts(user?.id).then(setAccounts)
  }, [open, user?.id])

  const filteredAccounts = accounts.filter((a) =>
    a.username.toLowerCase().includes(accountSearch.toLowerCase()) ||
    (a.display_name ?? "").toLowerCase().includes(accountSearch.toLowerCase())
  )

  const linkedAccounts = accounts.filter((a) => linkedIds.includes(a.id))

  async function handleCreate() {
    if (!firstName.trim() || !email.trim()) return
    setCreating(true)
    try {
      const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ")
      const { data, error } = await supabase.from("creators").insert({
        name: fullName,
        first_name: firstName.trim(),
        last_name: lastName.trim() || null,
        email: email.trim(),
        internal_notes: notes.trim() || null,
        workspace_id: user?.id ?? null,
      }).select("id").single()

      if (error) throw error

      if (data?.id && linkedIds.length) {
        await supabase.from("tracked_accounts").update({ creator_id: data.id }).in("id", linkedIds)
      }

      setDone(true)
    } catch {
      setDone(true)
    } finally {
      setCreating(false)
    }
  }

  function handleClose() {
    setFirstName(""); setLastName(""); setEmail(""); setNotes("")
    setLinkedIds([]); setAccountSearch(""); setDone(false); setMode("off_platform")
    onClose()
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={handleClose} />
      <div
        className="fixed right-0 top-0 bottom-0 w-full max-w-lg z-50 flex flex-col"
        style={{ backgroundColor: "#111111", borderLeft: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] flex-shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-600/15 border border-purple-500/25 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Add Creator</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Add a new creator and associate them with tracked accounts.</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {done ? (
            <div className="flex flex-col items-center py-12 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                <Check className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">Creator Created</h3>
              <p className="text-sm text-zinc-500">{firstName} has been added to your creator roster.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-400">First Name *</label>
                  <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-zinc-200 outline-none focus:border-purple-500/40" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-xs font-medium text-zinc-400">Last Name</label>
                    <span className="text-[10px] text-zinc-600">Optional</span>
                  </div>
                  <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-zinc-200 outline-none focus:border-purple-500/40" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Email *</label>
                <div className="relative">
                  <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="creator@example.com" className="w-full px-3.5 py-2.5 pr-10 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-zinc-200 outline-none focus:border-purple-500/40" />
                  <ScanLine className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400 flex items-center gap-1">
                  Internal Notes
                  <span title="Private notes visible only to your team"><Info className="w-3 h-3 text-zinc-600 cursor-help" /></span>
                </label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add notes about this creator..." rows={3} className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-purple-500/40 resize-none" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400 flex items-center gap-1">
                  Tracked Accounts
                  <span title="Link social accounts to this creator"><Info className="w-3 h-3 text-zinc-600 cursor-help" /></span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setAccountPickerOpen(!accountPickerOpen)}
                    className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-zinc-500"
                  >
                    <Search className="w-4 h-4" />
                    Select accounts to link
                    <ChevronDown className="w-4 h-4 ml-auto" />
                  </button>
                  {accountPickerOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-10 bg-[#1a1a1a] border border-white/10 rounded-lg p-2 shadow-xl max-h-48 overflow-y-auto">
                      <input value={accountSearch} onChange={(e) => setAccountSearch(e.target.value)} placeholder="Search..." className="w-full px-2 py-1.5 mb-2 text-xs bg-white/[0.05] border border-white/[0.08] rounded text-zinc-300 outline-none" />
                      {filteredAccounts.map((a) => (
                        <label key={a.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/[0.05] rounded cursor-pointer">
                          <input type="checkbox" checked={linkedIds.includes(a.id)} onChange={() => setLinkedIds((prev) => prev.includes(a.id) ? prev.filter((id) => id !== a.id) : [...prev, a.id])} className="accent-purple-600" />
                          <PlatformIcon platform={a.platform} className="w-3.5 h-3.5" />
                          <span className="text-xs text-zinc-300">@{a.username}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {linkedAccounts.length === 0 ? (
                  <p className="text-xs text-zinc-600 py-2">No accounts selected for this creator</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {linkedAccounts.map((a) => (
                      <span key={a.id} className="px-2 py-1 rounded-full text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20">@{a.username}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400">Creator Onboarding</label>
                <button
                  type="button"
                  onClick={() => setMode("off_platform")}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${mode === "off_platform" ? "border-purple-500/40 bg-purple-600/5" : "border-white/[0.08] bg-white/[0.02]"}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 ${mode === "off_platform" ? "border-purple-500 bg-purple-500" : "border-zinc-600"}`} />
                    <Shield className="w-5 h-5 text-zinc-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-white">Manage Off-Platform</p>
                      <p className="text-xs text-zinc-500 mt-1">Can be invited later at anytime. Use all campaign & payout features:</p>
                      <ul className="mt-2 space-y-1">
                        {["Track creator performance", "Manage creator campaigns", "Calculate & send payouts"].map((item) => (
                          <li key={item} className="text-xs text-zinc-400 flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-400" />{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </button>

                <div className="w-full p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] opacity-50 cursor-not-allowed">
                  <div className="flex items-start gap-3">
                    <div className="w-4 h-4 rounded-full border-2 border-zinc-700 mt-0.5 flex-shrink-0" />
                    <Send className="w-5 h-5 text-zinc-600 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-zinc-500">Invite to Platform</p>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white/[0.08] text-zinc-500">Coming Soon</span>
                      </div>
                      <p className="text-xs text-zinc-600 mt-1">Use all campaign & payout features. Send platform invitation to creator.</p>
                      <ul className="mt-2 space-y-1">
                        {["Manage their personal data", "See individual analytics", "Agree to consents"].map((item) => (
                          <li key={item} className="text-xs text-zinc-600 flex items-center gap-1.5"><Check className="w-3 h-3" />{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-white/[0.06] flex-shrink-0">
          {done ? (
            <button onClick={handleClose} className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium">Close</button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={creating || !firstName.trim() || !email.trim()}
              className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-medium transition-all"
            >
              {creating ? "Creating…" : "Create"}
            </button>
          )}
        </div>
      </div>
    </>
  )
}
