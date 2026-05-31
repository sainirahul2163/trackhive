"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, ArrowRight, Check, Info, Sparkles,
  Search, ToggleLeft, FileText, ClipboardList,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PlatformIcon, PLATFORM_CONFIG, formatNumber } from "@/lib/platform"
import { insertCampaign, insertCampaignCreators } from "@/lib/campaigns-data"
import type { TrackedAccount } from "@/types"
import { cn } from "@/lib/utils"

// ── Mock tracked accounts for creator selection ───────────────
const MOCK_CREATORS: TrackedAccount[] = [
  { id: "1", workspace_id: null, platform: "tiktok",    username: "jake_fitness",  display_name: "Jake Fitness",   avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=jake",  profile_url: null, follower_count: 1240000, total_views: 48200000, avg_views: 820000, engagement_rate: 6.8, last_synced_at: null, created_at: "" },
  { id: "2", workspace_id: null, platform: "instagram", username: "glowup_daily",  display_name: "Glow Up Daily",  avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=glow",  profile_url: null, follower_count: 892000,  total_views: 21500000, avg_views: 340000, engagement_rate: 4.2, last_synced_at: null, created_at: "" },
  { id: "3", workspace_id: null, platform: "youtube",   username: "techreviewer",  display_name: "Tech Reviewer",  avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=tech",  profile_url: null, follower_count: 560000,  total_views: 92000000, avg_views: 1200000, engagement_rate: 3.5, last_synced_at: null, created_at: "" },
  { id: "4", workspace_id: null, platform: "tiktok",    username: "freelife_nyc",  display_name: "Free Life NYC",  avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=free",  profile_url: null, follower_count: 330000,  total_views: 9800000,  avg_views: 290000, engagement_rate: 5.1, last_synced_at: null, created_at: "" },
  { id: "5", workspace_id: null, platform: "instagram", username: "moneymoves22",  display_name: "Money Moves",    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=money", profile_url: null, follower_count: 210000,  total_views: 5400000,  avg_views: 180000, engagement_rate: 3.9, last_synced_at: null, created_at: "" },
  { id: "6", workspace_id: null, platform: "youtube",   username: "cookwithsana",  display_name: "Cook with Sana", avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=sana",  profile_url: null, follower_count: 142000,  total_views: 3100000,  avg_views: 95000,  engagement_rate: 7.2, last_synced_at: null, created_at: "" },
]

// ── Step config ───────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Basic Info",    icon: FileText       },
  { id: 2, label: "Add Creators",  icon: Search         },
  { id: 3, label: "Payout Rules",  icon: ToggleLeft     },
  { id: 4, label: "Brief",         icon: ClipboardList  },
  { id: 5, label: "Review",        icon: Check          },
]

// ── Form state types ──────────────────────────────────────────
interface BasicInfo {
  name: string
  brand: string
  start_date: string
  end_date: string
  target_views: string
  target_videos: string
}

interface PayoutRules {
  base_fee: string
  cpm_rate: string
  milestone_bonus: string
  performance_cap: string
  payout_window: string
  base_fee_enabled: boolean
  cpm_enabled: boolean
  milestone_enabled: boolean
  cap_enabled: boolean
}

// ── Input helper ──────────────────────────────────────────────
function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-zinc-400">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-zinc-600">{hint}</p>}
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

function Toggle({ enabled, onChange, label }: { enabled: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-zinc-300">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`relative w-9 h-5 rounded-full transition-colors ${enabled ? "bg-purple-600" : "bg-white/10"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-4" : "translate-x-0"}`} />
      </button>
    </div>
  )
}

export default function NewCampaignPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)

  const [basic, setBasic] = useState<BasicInfo>({
    name: "", brand: "", start_date: "", end_date: "",
    target_views: "", target_videos: "",
  })

  const [selectedCreators, setSelectedCreators] = useState<string[]>([])
  const [creatorSearch, setCreatorSearch] = useState("")

  const [payout, setPayout] = useState<PayoutRules>({
    base_fee: "200", cpm_rate: "4.00", milestone_bonus: "500", performance_cap: "2000",
    payout_window: "30",
    base_fee_enabled: true, cpm_enabled: true, milestone_enabled: false, cap_enabled: false,
  })

  const [brief, setBrief] = useState("")

  const filteredCreators = MOCK_CREATORS.filter(c =>
    c.username.toLowerCase().includes(creatorSearch.toLowerCase()) ||
    (c.display_name ?? "").toLowerCase().includes(creatorSearch.toLowerCase())
  )

  function toggleCreator(id: string) {
    setSelectedCreators(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  function estimatedPayout() {
    const baseFee = payout.base_fee_enabled ? parseFloat(payout.base_fee || "0") : 0
    const targetViews = parseInt(basic.target_views || "0")
    const cpm = payout.cpm_enabled ? parseFloat(payout.cpm_rate || "0") : 0
    const cpmTotal = (targetViews / 1000) * cpm
    const milestone = payout.milestone_enabled ? parseFloat(payout.milestone_bonus || "0") : 0
    const raw = (baseFee * selectedCreators.length) + cpmTotal + (milestone * selectedCreators.length)
    const cap = payout.cap_enabled ? parseFloat(payout.performance_cap || "0") : Infinity
    return Math.min(raw, cap * selectedCreators.length)
  }

  async function handleSubmit(saveAsDraft: boolean) {
    setSaving(true)
    try {
      const campaign = await insertCampaign({
        workspace_id: null,
        name: basic.name || "Untitled Campaign",
        brand: basic.brand || null,
        status: saveAsDraft ? "draft" : "active",
        start_date: basic.start_date || null,
        end_date: basic.end_date || null,
        target_views: parseInt(basic.target_views || "0"),
        target_videos: parseInt(basic.target_videos || "0"),
        base_fee: parseFloat(payout.base_fee || "0"),
        cpm_rate: parseFloat(payout.cpm_rate || "0"),
        milestone_bonus: parseFloat(payout.milestone_bonus || "0"),
        performance_cap: parseFloat(payout.performance_cap || "0"),
        payout_window: parseInt(payout.payout_window || "30"),
        brief: brief || null,
      })
      await insertCampaignCreators(campaign.id, selectedCreators)
      router.push("/campaigns")
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const canNext = () => {
    if (step === 1) return basic.name.trim().length > 0
    return true
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back */}
      <Link href="/campaigns" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Campaigns
      </Link>

      {/* Title */}
      <div>
        <h1 className="text-[22px] font-semibold text-white tracking-tight">New Campaign</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Set up a new creator campaign in minutes.</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => {
          const done = s.id < step
          const active = s.id === step
          return (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all",
                  done  ? "bg-purple-600 border-purple-600 text-white" :
                  active? "bg-purple-600/10 border-purple-500 text-purple-400" :
                          "bg-white/[0.04] border-white/10 text-zinc-600"
                )}>
                  {done ? <Check className="w-4 h-4" /> : s.id}
                </div>
                <span className={`text-[10px] font-medium whitespace-nowrap hidden sm:block ${
                  active ? "text-purple-400" : done ? "text-zinc-400" : "text-zinc-600"
                }`}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-5 rounded-full transition-all ${done ? "bg-purple-600" : "bg-white/[0.06]"}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Step card */}
      <div className="rounded-xl border border-white/[0.06] bg-[#111111] p-6">

        {/* STEP 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-semibold text-white">Basic Information</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Give your campaign a name and set the timeline.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field label="Campaign Name *">
                  <TextInput value={basic.name} onChange={v => setBasic(p => ({ ...p, name: v }))} placeholder="e.g. Summer Drop 2024" />
                </Field>
              </div>
              <Field label="Brand / Client">
                <TextInput value={basic.brand} onChange={v => setBasic(p => ({ ...p, brand: v }))} placeholder="e.g. ProteinPro" />
              </Field>
              <Field label="Target Views">
                <TextInput value={basic.target_views} onChange={v => setBasic(p => ({ ...p, target_views: v }))} placeholder="e.g. 5000000" type="number" />
              </Field>
              <Field label="Start Date">
                <TextInput value={basic.start_date} onChange={v => setBasic(p => ({ ...p, start_date: v }))} type="date" />
              </Field>
              <Field label="End Date">
                <TextInput value={basic.end_date} onChange={v => setBasic(p => ({ ...p, end_date: v }))} type="date" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Target Videos" hint="How many videos should creators post total?">
                  <TextInput value={basic.target_videos} onChange={v => setBasic(p => ({ ...p, target_videos: v }))} placeholder="e.g. 20" type="number" />
                </Field>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Add Creators */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-semibold text-white">Add Creators</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Select from your tracked accounts. {selectedCreators.length > 0 && <span className="text-purple-400">{selectedCreators.length} selected</span>}</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
              <input
                value={creatorSearch}
                onChange={e => setCreatorSearch(e.target.value)}
                placeholder="Search creators..."
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-purple-500/40 transition-colors"
              />
            </div>
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {filteredCreators.map(creator => {
                const selected = selectedCreators.includes(creator.id)
                const cfg = PLATFORM_CONFIG[creator.platform]
                return (
                  <button
                    key={creator.id}
                    type="button"
                    onClick={() => toggleCreator(creator.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                      selected
                        ? "border-purple-500/40 bg-purple-600/8"
                        : "border-white/[0.06] bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
                    )}
                  >
                    <Avatar className="w-9 h-9 flex-shrink-0">
                      <AvatarImage src={creator.avatar_url ?? ""} />
                      <AvatarFallback className="bg-purple-600/20 text-purple-400 text-xs font-bold">
                        {creator.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-zinc-200 truncate">{creator.display_name}</span>
                        <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${cfg.bg} ${cfg.textColor}`}>
                          <PlatformIcon platform={creator.platform} className="w-2.5 h-2.5" />
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500">{formatNumber(creator.avg_views)} avg views · {formatNumber(creator.follower_count)} followers</p>
                    </div>
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                      selected ? "border-purple-500 bg-purple-600" : "border-white/20 bg-transparent"
                    )}>
                      {selected && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* STEP 3: Payout Rules */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-semibold text-white">Payout Rules</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Define how creators get paid for this campaign.</p>
            </div>
            <div className="space-y-4">
              {/* Base fee */}
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
                <Toggle enabled={payout.base_fee_enabled} onChange={v => setPayout(p => ({ ...p, base_fee_enabled: v }))} label="Base Fee per Video ($)" />
                {payout.base_fee_enabled && (
                  <TextInput value={payout.base_fee} onChange={v => setPayout(p => ({ ...p, base_fee: v }))} placeholder="e.g. 200" type="number" />
                )}
              </div>
              {/* CPM */}
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
                <Toggle enabled={payout.cpm_enabled} onChange={v => setPayout(p => ({ ...p, cpm_enabled: v }))} label="CPM Rate ($ per 1,000 views)" />
                {payout.cpm_enabled && (
                  <TextInput value={payout.cpm_rate} onChange={v => setPayout(p => ({ ...p, cpm_rate: v }))} placeholder="e.g. 4.00" type="number" />
                )}
              </div>
              {/* Milestone bonus */}
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
                <Toggle enabled={payout.milestone_enabled} onChange={v => setPayout(p => ({ ...p, milestone_enabled: v }))} label="Milestone Bonus ($)" />
                {payout.milestone_enabled && (
                  <TextInput value={payout.milestone_bonus} onChange={v => setPayout(p => ({ ...p, milestone_bonus: v }))} placeholder="e.g. 500" type="number" />
                )}
              </div>
              {/* Performance cap */}
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
                <Toggle enabled={payout.cap_enabled} onChange={v => setPayout(p => ({ ...p, cap_enabled: v }))} label="Performance Cap per Creator ($)" />
                {payout.cap_enabled && (
                  <TextInput value={payout.performance_cap} onChange={v => setPayout(p => ({ ...p, performance_cap: v }))} placeholder="e.g. 2000" type="number" />
                )}
              </div>
              {/* Payout window */}
              <Field label="Payout Window">
                <select
                  value={payout.payout_window}
                  onChange={e => setPayout(p => ({ ...p, payout_window: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-zinc-200 outline-none focus:border-purple-500/40 transition-colors cursor-pointer"
                >
                  <option value="7" className="bg-[#1a1a1a]">7 days</option>
                  <option value="14" className="bg-[#1a1a1a]">14 days</option>
                  <option value="30" className="bg-[#1a1a1a]">30 days</option>
                  <option value="0" className="bg-[#1a1a1a]">All-time</option>
                </select>
              </Field>
            </div>
          </div>
        )}

        {/* STEP 4: Brief */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-white">Campaign Brief</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Describe what creators should make for this campaign.</p>
              </div>
              <div className="relative group">
                <button
                  disabled
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-600/20 text-purple-400 text-sm font-medium cursor-not-allowed opacity-60"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate AI Brief
                </button>
                <div className="absolute right-0 top-full mt-1.5 px-2.5 py-1.5 rounded-lg bg-[#1a1a1a] border border-white/10 text-xs text-zinc-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  Coming soon ✨
                </div>
              </div>
            </div>
            <textarea
              value={brief}
              onChange={e => setBrief(e.target.value)}
              placeholder={`Describe the campaign goals, content requirements, dos and don'ts, messaging focus, hashtags to use, posting schedule, etc.`}
              rows={14}
              className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all resize-none leading-relaxed"
            />
            <p className="text-xs text-zinc-600">{brief.length} characters</p>
          </div>
        )}

        {/* STEP 5: Review */}
        {step === 5 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-semibold text-white">Review & Launch</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Review all settings before saving.</p>
            </div>

            {/* Summary sections */}
            <div className="space-y-3">
              {/* Basic info */}
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 space-y-2">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Campaign</p>
                <p className="text-sm font-semibold text-white">{basic.name || "Untitled"}</p>
                {basic.brand && <p className="text-xs text-zinc-400">{basic.brand}</p>}
                <div className="grid grid-cols-2 gap-2 text-xs text-zinc-500 pt-1">
                  <span>Start: <span className="text-zinc-300">{basic.start_date || "—"}</span></span>
                  <span>End: <span className="text-zinc-300">{basic.end_date || "—"}</span></span>
                  <span>Target Views: <span className="text-zinc-300">{formatNumber(parseInt(basic.target_views || "0"))}</span></span>
                  <span>Target Videos: <span className="text-zinc-300">{basic.target_videos || "0"}</span></span>
                </div>
              </div>

              {/* Creators */}
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 space-y-2">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Creators</p>
                {selectedCreators.length === 0 ? (
                  <p className="text-sm text-zinc-600 italic">None selected</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedCreators.map(id => {
                      const c = MOCK_CREATORS.find(x => x.id === id)
                      if (!c) return null
                      return (
                        <span key={id} className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/[0.05] border border-white/[0.06] text-xs text-zinc-300">
                          <PlatformIcon platform={c.platform} className="w-3 h-3 text-zinc-500" />
                          @{c.username}
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Payout rules */}
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 space-y-2">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Payout Rules</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {payout.base_fee_enabled && <span className="text-zinc-400">Base fee: <span className="text-zinc-200">${payout.base_fee}/video</span></span>}
                  {payout.cpm_enabled && <span className="text-zinc-400">CPM: <span className="text-zinc-200">${payout.cpm_rate}/1K views</span></span>}
                  {payout.milestone_enabled && <span className="text-zinc-400">Milestone: <span className="text-zinc-200">${payout.milestone_bonus}</span></span>}
                  {payout.cap_enabled && <span className="text-zinc-400">Cap: <span className="text-zinc-200">${payout.performance_cap}/creator</span></span>}
                  <span className="text-zinc-400">Window: <span className="text-zinc-200">{payout.payout_window === "0" ? "All-time" : `${payout.payout_window}d`}</span></span>
                </div>
              </div>

              {/* Estimated total */}
              <div className="rounded-lg border border-purple-500/20 bg-purple-600/5 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-zinc-300">Estimated Total Payout</span>
                  </div>
                  <span className="text-xl font-bold text-purple-400">
                    ${estimatedPayout().toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <p className="text-xs text-zinc-600 mt-1.5 ml-6">
                  Based on {selectedCreators.length} creator{selectedCreators.length !== 1 ? "s" : ""} and {formatNumber(parseInt(basic.target_views || "0"))} target views.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => step > 1 ? setStep(s => s - 1) : router.push("/campaigns")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-zinc-300 hover:text-white hover:border-white/10 text-sm font-medium transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {step === 1 ? "Cancel" : "Back"}
        </button>

        {step < 5 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={!canNext()}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-all active:scale-[0.98]"
          >
            Continue
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => handleSubmit(true)}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-white/[0.06] border border-white/[0.08] text-zinc-300 hover:text-white text-sm font-medium transition-all disabled:opacity-50"
            >
              Save as Draft
            </button>
            <button
              onClick={() => handleSubmit(false)}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-medium transition-all active:scale-[0.98]"
            >
              {saving ? "Launching..." : "Launch Campaign"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
