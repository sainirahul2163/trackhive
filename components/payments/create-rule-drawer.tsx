"use client"

import { useState } from "react"
import { X, Check } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { PayoutRule } from "@/types"

interface CreateRuleDrawerProps {
  open: boolean
  onClose: () => void
  onSave: (rule: PayoutRule) => void
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-zinc-400">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-zinc-600">{hint}</p>}
    </div>
  )
}

function AmountInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">$</span>
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder ?? "0.00"}
        className="w-full pl-7 pr-3 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all"
      />
    </div>
  )
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative w-9 h-5 rounded-full flex-shrink-0 transition-colors ${enabled ? "bg-purple-600" : "bg-white/10"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-4" : "translate-x-0"}`} />
    </button>
  )
}

const WINDOW_OPTIONS = [
  { value: 7,   label: "7 days"   },
  { value: 14,  label: "14 days"  },
  { value: 30,  label: "30 days"  },
  { value: 0,   label: "All time" },
]

export function CreateRuleDrawer({ open, onClose, onSave }: CreateRuleDrawerProps) {
  const [name, setName] = useState("")
  const [baseFeeEnabled, setBaseFeeEnabled] = useState(true)
  const [baseFee, setBaseFee] = useState("150")
  const [cpmEnabled, setCpmEnabled] = useState(true)
  const [cpmRate, setCpmRate] = useState("3.00")
  const [milestoneEnabled, setMilestoneEnabled] = useState(false)
  const [milestoneBonus, setMilestoneBonus] = useState("500")
  const [milestoneViews, setMilestoneViews] = useState("1000000")
  const [capEnabled, setCapEnabled] = useState(false)
  const [cap, setCap] = useState("2000")
  const [window, setWindow] = useState(30)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function estimatedPayout(views: number, videos: number) {
    const base = baseFeeEnabled ? parseFloat(baseFee || "0") * videos : 0
    const cpm = cpmEnabled ? (views / 1000) * parseFloat(cpmRate || "0") : 0
    const bonus = milestoneEnabled && views >= parseInt(milestoneViews || "0")
      ? parseFloat(milestoneBonus || "0") : 0
    const raw = base + cpm + bonus
    const maxCap = capEnabled ? parseFloat(cap || "0") : Infinity
    return Math.min(raw, maxCap)
  }

  function handleClose() {
    setName(""); setBaseFeeEnabled(true); setBaseFee("150")
    setCpmEnabled(true); setCpmRate("3.00"); setMilestoneEnabled(false)
    setMilestoneBonus("500"); setMilestoneViews("1000000")
    setCapEnabled(false); setCap("2000"); setWindow(30)
    setSaved(false)
    onClose()
  }

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    try {
      const payload = {
        name: name.trim(),
        base_fee: baseFeeEnabled ? parseFloat(baseFee || "0") : 0,
        cpm_rate: cpmEnabled ? parseFloat(cpmRate || "0") : 0,
        milestone_bonus: milestoneEnabled ? parseFloat(milestoneBonus || "0") : 0,
        milestone_views: milestoneEnabled ? parseInt(milestoneViews || "0") : 0,
        performance_cap: capEnabled ? parseFloat(cap || "0") : 0,
        payout_window_days: window,
        is_default: false,
      }

      const { data, error } = await supabase.from("payout_rules").insert(payload).select().single()

      if (error) throw error
      onSave(data as PayoutRule)
      setSaved(true)
      setTimeout(handleClose, 1500)
    } catch {
      // Optimistic in demo mode
      const mockRule: PayoutRule = {
        id: Math.random().toString(36).slice(2),
        workspace_id: null,
        name: name.trim(),
        base_fee: baseFeeEnabled ? parseFloat(baseFee || "0") : 0,
        cpm_rate: cpmEnabled ? parseFloat(cpmRate || "0") : 0,
        milestone_bonus: milestoneEnabled ? parseFloat(milestoneBonus || "0") : 0,
        milestone_views: milestoneEnabled ? parseInt(milestoneViews || "0") : 0,
        performance_cap: capEnabled ? parseFloat(cap || "0") : 0,
        payout_window_days: window,
        is_default: false,
        created_at: new Date().toISOString(),
      }
      onSave(mockRule)
      setSaved(true)
      setTimeout(handleClose, 1500)
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  const est100K = estimatedPayout(100000, 5)
  const est500K = estimatedPayout(500000, 5)
  const est1M   = estimatedPayout(1000000, 10)

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={handleClose} />
      <div
        className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 flex flex-col"
        style={{ backgroundColor: "#111111", borderLeft: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-white">Create Payout Rule</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Save a reusable rule template for creator payouts.</p>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <Field label="Rule Name *">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Premium Creator"
              className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-purple-500/40 transition-all"
            />
          </Field>

          {/* Base fee */}
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-300">Base Fee per Video</span>
              <Toggle enabled={baseFeeEnabled} onChange={setBaseFeeEnabled} />
            </div>
            {baseFeeEnabled && <AmountInput value={baseFee} onChange={setBaseFee} placeholder="150.00" />}
          </div>

          {/* CPM */}
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-300">CPM Rate (per 1,000 views)</span>
              <Toggle enabled={cpmEnabled} onChange={setCpmEnabled} />
            </div>
            {cpmEnabled && <AmountInput value={cpmRate} onChange={setCpmRate} placeholder="3.00" />}
          </div>

          {/* Milestone */}
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-300">Milestone Bonus</span>
              <Toggle enabled={milestoneEnabled} onChange={setMilestoneEnabled} />
            </div>
            {milestoneEnabled && (
              <div className="grid grid-cols-2 gap-2">
                <Field label="Bonus amount">
                  <AmountInput value={milestoneBonus} onChange={setMilestoneBonus} placeholder="500" />
                </Field>
                <Field label="If video hits (views)">
                  <input
                    type="number"
                    value={milestoneViews}
                    onChange={e => setMilestoneViews(e.target.value)}
                    placeholder="1000000"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-purple-500/40 transition-all"
                  />
                </Field>
              </div>
            )}
          </div>

          {/* Performance cap */}
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-300">Performance Cap per Creator</span>
              <Toggle enabled={capEnabled} onChange={setCapEnabled} />
            </div>
            {capEnabled && <AmountInput value={cap} onChange={setCap} placeholder="2000.00" />}
          </div>

          {/* Payout window */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-zinc-400">Payout Window</p>
            <div className="grid grid-cols-4 gap-2">
              {WINDOW_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setWindow(opt.value)}
                  className={`py-2 rounded-lg text-sm font-medium transition-all border ${
                    window === opt.value
                      ? "bg-purple-600 border-purple-600 text-white"
                      : "bg-white/[0.04] border-white/[0.08] text-zinc-400 hover:text-zinc-200 hover:border-white/[0.12]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Live preview */}
          <div className="rounded-lg border border-purple-500/20 bg-purple-600/5 p-4 space-y-3">
            <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Live Preview</p>
            <div className="space-y-1.5">
              {[
                { label: "100K views, 5 videos", value: est100K },
                { label: "500K views, 5 videos", value: est500K },
                { label: "1M views, 10 videos",  value: est1M   },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">{row.label}</span>
                  <span className="font-semibold text-purple-400">${row.value.toFixed(0)}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-zinc-600">Estimates based on current rule settings. Cap applied if enabled.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-white/[0.06] flex-shrink-0">
          <button onClick={handleClose} className="flex-1 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-zinc-300 hover:text-white font-medium transition-all">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim() || saved}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-all"
          >
            {saved ? (
              <><Check className="w-3.5 h-3.5" /> Saved!</>
            ) : saving ? (
              "Saving..."
            ) : (
              "Save Rule"
            )}
          </button>
        </div>
      </div>
    </>
  )
}
