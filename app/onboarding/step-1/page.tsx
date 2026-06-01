"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Zap, ArrowRight } from "lucide-react"

const TEAM_SIZES = ["Just me", "2–10", "11–50", "50+"] as const
const GOALS = [
  { value: "track",    label: "Track creators",      emoji: "📊" },
  { value: "campaigns",label: "Manage campaigns",    emoji: "🚀" },
  { value: "pay",      label: "Pay creators",        emoji: "💸" },
  { value: "all",      label: "All of the above",    emoji: "⚡" },
] as const

type TeamSize = typeof TEAM_SIZES[number]
type Goal = typeof GOALS[number]["value"]

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-8">
      {[1, 2, 3].map(n => (
        <div key={n} className="flex items-center gap-2">
          <div style={{
            width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700,
            backgroundColor: n < current ? "#7C3AED" : n === current ? "#7C3AED" : "rgba(255,255,255,0.06)",
            color: n <= current ? "#fff" : "#52525b",
            border: n === current ? "2px solid rgba(124,58,237,0.4)" : "none",
            boxShadow: n === current ? "0 0 0 4px rgba(124,58,237,0.15)" : "none",
          }}>{n}</div>
          {n < 3 && <div style={{ width: "32px", height: "2px", borderRadius: "1px", backgroundColor: n < current ? "#7C3AED" : "rgba(255,255,255,0.08)" }} />}
        </div>
      ))}
    </div>
  )
}

export default function OnboardingStep1() {
  const router = useRouter()
  const [company, setCompany] = useState("")
  const [website, setWebsite] = useState("")
  const [teamSize, setTeamSize] = useState<TeamSize | "">("")
  const [goal, setGoal] = useState<Goal | "">("")

  function handleContinue() {
    if (!company.trim() || !teamSize || !goal) return
    localStorage.setItem("onboarding", JSON.stringify({ company: company.trim(), website: website.trim(), teamSize, goal }))
    router.push("/onboarding/step-2")
  }

  const isValid = company.trim() && teamSize && goal

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse at top left, rgba(124,58,237,0.15) 0%, transparent 60%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: "480px", position: "relative", zIndex: 10 }}>
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Zap className="w-4 h-4 text-white" fill="white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">TrackHive</span>
        </div>

        <StepIndicator current={1} />

        <div style={{ borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "#111111", padding: "32px" }}>
          <div className="text-center mb-6">
            <h1 className="text-[22px] font-semibold text-white mb-1.5">Tell us about yourself</h1>
            <p className="text-sm text-zinc-500">Help us personalise your experience.</p>
          </div>

          <div className="space-y-5">
            {/* Company */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Company Name *</label>
              <input
                type="text"
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="Acme Corp"
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#e4e4e7", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                className="placeholder:text-zinc-600 focus:border-purple-500/50 transition-all"
              />
            </div>

            {/* Website */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Website URL <span className="text-zinc-600">(optional)</span></label>
              <input
                type="url"
                value={website}
                onChange={e => setWebsite(e.target.value)}
                placeholder="https://yourcompany.com"
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#e4e4e7", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                className="placeholder:text-zinc-600 focus:border-purple-500/50 transition-all"
              />
            </div>

            {/* Team size */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400">Team Size *</label>
              <div className="grid grid-cols-4 gap-2">
                {TEAM_SIZES.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setTeamSize(s)}
                    style={{
                      padding: "10px 8px", borderRadius: "8px", textAlign: "center", cursor: "pointer", transition: "all 0.15s",
                      border: teamSize === s ? "1px solid rgba(124,58,237,0.5)" : "1px solid rgba(255,255,255,0.08)",
                      backgroundColor: teamSize === s ? "rgba(124,58,237,0.12)" : "rgba(255,255,255,0.03)",
                    }}
                  >
                    <span style={{ fontSize: "12px", fontWeight: 600, color: teamSize === s ? "#c084fc" : "#a1a1aa" }}>{s}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Goal */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400">Main goal? *</label>
              <div className="grid grid-cols-2 gap-2">
                {GOALS.map(g => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setGoal(g.value)}
                    style={{
                      padding: "12px", borderRadius: "8px", textAlign: "left", cursor: "pointer", transition: "all 0.15s",
                      border: goal === g.value ? "1px solid rgba(124,58,237,0.5)" : "1px solid rgba(255,255,255,0.08)",
                      backgroundColor: goal === g.value ? "rgba(124,58,237,0.1)" : "rgba(255,255,255,0.03)",
                    }}
                  >
                    <div style={{ fontSize: "18px", marginBottom: "4px" }}>{g.emoji}</div>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: goal === g.value ? "#c084fc" : "#a1a1aa" }}>{g.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleContinue}
            disabled={!isValid}
            className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all shadow-lg shadow-purple-500/20"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <p className="text-center text-xs text-zinc-600 mt-4">Step 1 of 3</p>
      </div>
    </div>
  )
}
