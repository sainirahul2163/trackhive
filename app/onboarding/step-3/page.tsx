"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Zap, Check, Mail, MessageSquare, Hash, ArrowLeft } from "lucide-react"
import { toast, Toaster } from "sonner"
import confetti from "canvas-confetti"

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

export default function OnboardingStep3() {
  const router = useRouter()
  const [alertMethod, setAlertMethod] = useState<"email" | "slack" | "discord">("email")
  const [discordWebhook, setDiscordWebhook] = useState("")
  const [finishing, setFinishing] = useState(false)
  const [done, setDone] = useState(false)

  function launchConfetti() {
    const end = Date.now() + 2200

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.65 },
        colors: ["#7C3AED", "#a855f7", "#10b981", "#f59e0b", "#3b82f6", "#ec4899"],
      })
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.65 },
        colors: ["#7C3AED", "#a855f7", "#10b981", "#f59e0b", "#3b82f6", "#ec4899"],
      })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()
  }

  function handleSlackClick() {
    setAlertMethod("slack")
    toast("Coming soon", {
      description: "Slack integration will be available in the next release.",
      duration: 3000,
    })
  }

  function handleFinish() {
    setFinishing(true)
    setTimeout(() => {
      setDone(true)
      launchConfetti()
      setTimeout(() => router.push("/dashboard"), 2400)
    }, 800)
  }

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: { backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", color: "#fafafa" },
        }}
      />

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

          <StepIndicator current={3} />

          <div style={{ borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "#111111", padding: "32px" }}>
            {!done ? (
              <>
                <div className="text-center mb-6">
                  <h1 className="text-[22px] font-semibold text-white mb-1.5">Setup your alerts</h1>
                  <p className="text-sm text-zinc-500">Get notified when creators post or campaigns hit milestones.</p>
                </div>

                <div className="space-y-3">
                  {/* Email (default selected) */}
                  <button
                    onClick={() => setAlertMethod("email")}
                    style={{
                      width: "100%", padding: "14px 16px", borderRadius: "10px", textAlign: "left", cursor: "pointer", transition: "all 0.15s",
                      border: alertMethod === "email" ? "1px solid rgba(124,58,237,0.5)" : "1px solid rgba(255,255,255,0.08)",
                      backgroundColor: alertMethod === "email" ? "rgba(124,58,237,0.08)" : "rgba(255,255,255,0.03)",
                      display: "flex", alignItems: "center", gap: "12px",
                    }}
                  >
                    <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "rgba(124,58,237,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Mail className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p style={{ fontSize: "14px", fontWeight: 600, color: alertMethod === "email" ? "#c084fc" : "#e4e4e7" }}>Just email me</p>
                      <p style={{ fontSize: "12px", color: "#71717a", marginTop: "1px" }}>Alerts sent to your signup email</p>
                    </div>
                    {alertMethod === "email" && (
                      <div style={{ width: "18px", height: "18px", borderRadius: "50%", backgroundColor: "#7C3AED", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </button>

                  {/* Slack — shows "Coming soon" toast on click */}
                  <button
                    onClick={handleSlackClick}
                    style={{
                      width: "100%", padding: "14px 16px", borderRadius: "10px", textAlign: "left", cursor: "pointer", transition: "all 0.15s",
                      border: alertMethod === "slack" ? "1px solid rgba(74,222,128,0.4)" : "1px solid rgba(255,255,255,0.08)",
                      backgroundColor: alertMethod === "slack" ? "rgba(74,222,128,0.05)" : "rgba(255,255,255,0.03)",
                      display: "flex", alignItems: "center", gap: "12px",
                    }}
                  >
                    <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "rgba(74,222,128,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <MessageSquare className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p style={{ fontSize: "14px", fontWeight: 600, color: alertMethod === "slack" ? "#4ade80" : "#e4e4e7" }}>Connect Slack</p>
                        <span style={{ fontSize: "10px", fontWeight: 600, color: "#71717a", backgroundColor: "rgba(255,255,255,0.06)", padding: "1px 6px", borderRadius: "4px" }}>Coming soon</span>
                      </div>
                      <p style={{ fontSize: "12px", color: "#71717a", marginTop: "1px" }}>Post alerts to a Slack channel</p>
                    </div>
                    {alertMethod === "slack" && (
                      <div style={{ width: "18px", height: "18px", borderRadius: "50%", backgroundColor: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </button>

                  {/* Discord */}
                  <button
                    onClick={() => setAlertMethod("discord")}
                    style={{
                      width: "100%", padding: "14px 16px", borderRadius: "10px", textAlign: "left", cursor: "pointer", transition: "all 0.15s",
                      border: alertMethod === "discord" ? "1px solid rgba(99,102,241,0.5)" : "1px solid rgba(255,255,255,0.08)",
                      backgroundColor: alertMethod === "discord" ? "rgba(99,102,241,0.06)" : "rgba(255,255,255,0.03)",
                      display: "flex", alignItems: "center", gap: "12px",
                    }}
                  >
                    <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Hash className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="flex-1">
                      <p style={{ fontSize: "14px", fontWeight: 600, color: alertMethod === "discord" ? "#818cf8" : "#e4e4e7" }}>Discord Webhook</p>
                      <p style={{ fontSize: "12px", color: "#71717a", marginTop: "1px" }}>Send alerts to a Discord server</p>
                    </div>
                    {alertMethod === "discord" && (
                      <div style={{ width: "18px", height: "18px", borderRadius: "50%", backgroundColor: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </button>

                  {/* Discord webhook URL input */}
                  {alertMethod === "discord" && (
                    <input
                      type="url"
                      value={discordWebhook}
                      onChange={e => setDiscordWebhook(e.target.value)}
                      placeholder="https://discord.com/api/webhooks/..."
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(99,102,241,0.3)", color: "#e4e4e7", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                      className="placeholder:text-zinc-600"
                    />
                  )}
                </div>

                <button
                  onClick={handleFinish}
                  disabled={finishing}
                  className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-70 text-white text-sm font-semibold transition-all shadow-lg shadow-purple-500/20"
                >
                  {finishing ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Setting up...</>
                  ) : (
                    <><Check className="w-4 h-4" /> Finish Setup</>
                  )}
                </button>

                <button
                  onClick={() => router.push("/onboarding/step-2")}
                  className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" /> Back
                </button>
              </>
            ) : (
              <div className="text-center py-6">
                <div style={{ width: "72px", height: "72px", borderRadius: "50%", backgroundColor: "rgba(124,58,237,0.15)", border: "2px solid rgba(124,58,237,0.4)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <Check className="w-8 h-8 text-purple-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">You&apos;re all set! 🎉</h2>
                <p className="text-sm text-zinc-500">Taking you to your dashboard...</p>
              </div>
            )}
          </div>

          <p className="text-center text-xs text-zinc-600 mt-4">Step 3 of 3</p>
        </div>
      </div>
    </>
  )
}
