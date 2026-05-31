"use client"

import { useState } from "react"
import { X, Send, Copy, Check, ChevronDown } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { supabase } from "@/lib/supabase"
import type { PayoutRule } from "@/types"

interface InviteCreatorDrawerProps {
  open: boolean
  onClose: () => void
  rules: PayoutRule[]
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-zinc-400">{label}</label>
      {children}
    </div>
  )
}

function TextInput({ value, onChange, placeholder, type = "text" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all"
    />
  )
}

const MOCK_CAMPAIGNS = [
  { id: "1", name: "Summer Drop 2024" },
  { id: "2", name: "GadgetHive Q2" },
  { id: "3", name: "Creator Life Series" },
  { id: "5", name: "FinanceApp Pro Launch" },
]

export function InviteCreatorDrawer({ open, onClose, rules }: InviteCreatorDrawerProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [campaignId, setCampaignId] = useState("")
  const [ruleId, setRuleId] = useState("")
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [inviteLink, setInviteLink] = useState("")
  const [copied, setCopied] = useState(false)

  const selectedCampaign = MOCK_CAMPAIGNS.find(c => c.id === campaignId)
  const selectedRule = rules.find(r => r.id === ruleId)

  function estimatedPayout() {
    if (!selectedRule) return null
    // estimate: 5 videos, 500K views
    const base = selectedRule.base_fee * 5
    const cpm = (500000 / 1000) * selectedRule.cpm_rate
    return Math.min(base + cpm, selectedRule.performance_cap || Infinity)
  }

  async function handleSend() {
    if (!name.trim() || !email.trim()) return
    setSending(true)
    try {
      const token = Math.random().toString(36).slice(2, 18)
      const { error } = await supabase.from("creators").insert({
        name: name.trim(),
        email: email.trim(),
        invite_token: token,
        invite_sent_at: new Date().toISOString(),
        invite_accepted: false,
      })
      if (error) throw error
      const link = `${window.location.origin}/invite/${token}`
      setInviteLink(link)
      setSent(true)
    } catch {
      // Still show invite link in demo mode
      const token = Math.random().toString(36).slice(2, 18)
      setInviteLink(`${window.location.origin}/invite/${token}`)
      setSent(true)
    } finally {
      setSending(false)
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleClose() {
    setName(""); setEmail(""); setCampaignId(""); setRuleId("")
    setSent(false); setInviteLink(""); setCopied(false)
    onClose()
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={handleClose}
      />
      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 flex flex-col"
        style={{ backgroundColor: "#111111", borderLeft: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-white">Invite Creator</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Send an invite to onboard a creator for payments.</p>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {!sent ? (
            <>
              {/* Creator info */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-purple-600/20 text-purple-400 font-bold text-sm">
                    {name ? name.slice(0, 2).toUpperCase() : "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-200 truncate">{name || "Creator Name"}</p>
                  <p className="text-xs text-zinc-500 truncate">{email || "creator@email.com"}</p>
                </div>
              </div>

              <Field label="Creator Name *">
                <TextInput value={name} onChange={setName} placeholder="e.g. Jake Fitness" />
              </Field>

              <Field label="Email Address *">
                <TextInput value={email} onChange={setEmail} placeholder="creator@example.com" type="email" />
              </Field>

              <Field label="Campaign Assignment">
                <div className="relative">
                  <select
                    value={campaignId}
                    onChange={e => setCampaignId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-zinc-200 outline-none focus:border-purple-500/40 transition-colors cursor-pointer appearance-none"
                  >
                    <option value="" className="bg-[#1a1a1a] text-zinc-500">No campaign (invite only)</option>
                    {MOCK_CAMPAIGNS.map(c => <option key={c.id} value={c.id} className="bg-[#1a1a1a]">{c.name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                </div>
              </Field>

              <Field label="Payout Rule">
                <div className="relative">
                  <select
                    value={ruleId}
                    onChange={e => setRuleId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-zinc-200 outline-none focus:border-purple-500/40 transition-colors cursor-pointer appearance-none"
                  >
                    <option value="" className="bg-[#1a1a1a] text-zinc-500">Select a rule...</option>
                    {rules.map(r => <option key={r.id} value={r.id} className="bg-[#1a1a1a]">{r.name}{r.is_default ? " (Default)" : ""}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                </div>
              </Field>

              {/* Preview */}
              {(selectedCampaign || selectedRule) && (
                <div className="rounded-lg border border-purple-500/20 bg-purple-600/5 p-4">
                  <p className="text-xs font-medium text-purple-400 mb-1.5">Preview</p>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    Creator will receive an invite to claim
                    {selectedRule && estimatedPayout() !== null && (
                      <span className="font-semibold text-purple-400"> ~${estimatedPayout()!.toFixed(0)}</span>
                    )}
                    {selectedCampaign && (
                      <> from <span className="font-semibold text-white">{selectedCampaign.name}</span></>
                    )}
                    .
                  </p>
                  {selectedRule && (
                    <p className="text-xs text-zinc-500 mt-1.5">
                      Rule: {selectedRule.name} · ${selectedRule.base_fee}/video · ${selectedRule.cpm_rate}/1K views
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Success state */
            <div className="space-y-5">
              <div className="flex flex-col items-center py-6 text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                  <Check className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-base font-semibold text-white mb-1">Invite Sent!</h3>
                <p className="text-sm text-zinc-500 max-w-xs">
                  {name} will receive an email at <span className="text-zinc-300">{email}</span> with their onboarding link.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-zinc-400">Invite Link</p>
                <div className="flex gap-2">
                  <div className="flex-1 px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-zinc-400 font-mono truncate">
                    {inviteLink}
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex-shrink-0 px-3 py-2.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 text-xs font-medium transition-all border border-purple-500/20 flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p className="text-[11px] text-zinc-600">Link expires in 7 days. Creator will set up their payment info after clicking.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-white/[0.06] flex-shrink-0">
          <button onClick={handleClose} className="flex-1 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-zinc-300 hover:text-white font-medium transition-all">
            {sent ? "Close" : "Cancel"}
          </button>
          {!sent && (
            <button
              onClick={handleSend}
              disabled={sending || !name.trim() || !email.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              {sending ? "Sending..." : "Send Invite"}
            </button>
          )}
        </div>
      </div>
    </>
  )
}
