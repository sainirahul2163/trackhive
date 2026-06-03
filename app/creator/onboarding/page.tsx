"use client"

import { useState } from "react"
import { Check, ChevronRight, Plus, X } from "lucide-react"

function InstagramIcon({ style }: { style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

function YoutubeIcon({ style }: { style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" style={style}>
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" /><polygon fill="white" points="9.75,15.02 15.5,12 9.75,8.98 9.75,15.02" />
    </svg>
  )
}

// TikTok icon as SVG component
function TikTokIcon({ style }: { style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" style={style}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.27 8.27 0 0 0 4.84 1.55V6.78a4.85 4.85 0 0 1-1.07-.09z" />
    </svg>
  )
}

// ── Types ──────────────────────────────────────────────────────
interface OnboardingState {
  displayName: string
  bio: string
  niche: string
  socialHandles: { platform: string; handle: string }[]
  payoutMethod: "bank" | "paypal" | ""
  accountDetail: string
  agreeToTerms: boolean
}

const NICHES = [
  { id: "fitness",    label: "Fitness & Lifestyle", emoji: "💪" },
  { id: "beauty",     label: "Beauty & Skincare",   emoji: "✨" },
  { id: "fashion",    label: "Fashion",              emoji: "👗" },
  { id: "tech",       label: "Tech & Gadgets",       emoji: "🎧" },
  { id: "food",       label: "Food & Cooking",       emoji: "🍳" },
  { id: "travel",     label: "Travel",               emoji: "✈️" },
  { id: "gaming",     label: "Gaming",               emoji: "🎮" },
  { id: "finance",    label: "Finance",              emoji: "📈" },
  { id: "education",  label: "Education",            emoji: "📚" },
  { id: "parenting",  label: "Parenting",            emoji: "👶" },
]

const PLATFORMS = [
  { id: "tiktok",    label: "TikTok",    Icon: TikTokIcon,  color: "#fafafa", bg: "rgba(255,255,255,0.07)" },
  { id: "instagram", label: "Instagram", Icon: InstagramIcon, color: "#f472b6", bg: "rgba(244,114,182,0.1)"  },
  { id: "youtube",   label: "YouTube",   Icon: YoutubeIcon,  color: "#f87171", bg: "rgba(248,113,113,0.1)"  },
]

export default function CreatorOnboardingPage() {
  const [step, setStep] = useState(1)
  const [state, setState] = useState<OnboardingState>({
    displayName:   "",
    bio:           "",
    niche:         "",
    socialHandles: [],
    payoutMethod:  "",
    accountDetail: "",
    agreeToTerms:  false,
  })
  const [addPlatform, setAddPlatform] = useState("")
  const [addHandle, setAddHandle]     = useState("")
  const [done, setDone] = useState(false)

  function set<K extends keyof OnboardingState>(key: K, value: OnboardingState[K]) {
    setState(s => ({ ...s, [key]: value }))
  }

  function addSocial() {
    if (!addPlatform || !addHandle.trim()) return
    const exists = state.socialHandles.find(h => h.platform === addPlatform)
    if (exists) return
    setState(s => ({ ...s, socialHandles: [...s.socialHandles, { platform: addPlatform, handle: addHandle.trim() }] }))
    setAddPlatform("")
    setAddHandle("")
  }

  function removeSocial(platform: string) {
    setState(s => ({ ...s, socialHandles: s.socialHandles.filter(h => h.platform !== platform) }))
  }

  function canNext() {
    if (step === 1) return state.displayName.trim().length >= 2 && state.niche !== ""
    if (step === 2) return state.socialHandles.length >= 1
    if (step === 3) return state.agreeToTerms
    return false
  }

  function handleFinish() {
    if (typeof window !== "undefined") {
      window.location.href = "/creator"
    }
  }

  const STEPS = [
    { num: 1, label: "Profile"   },
    { num: 2, label: "Platforms" },
    { num: 3, label: "Payouts"   },
  ]

  if (done) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0a" }}>
        <div style={{ textAlign: "center", padding: "40px 24px" }}>
          <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "linear-gradient(135deg, #7C3AED, #a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Check style={{ width: "32px", height: "32px", color: "white" }} />
          </div>
          <h2 style={{ fontSize: "26px", fontWeight: 800, color: "#fafafa", marginBottom: "8px" }}>You&apos;re all set! 🎉</h2>
          <p style={{ fontSize: "14px", color: "#71717a", marginBottom: "28px" }}>Your creator profile is ready. Brands can now discover and invite you to campaigns.</p>
          <button onClick={handleFinish}
            style={{ padding: "12px 28px", borderRadius: "10px", backgroundColor: "#7C3AED", color: "white", fontSize: "14px", fontWeight: 700, border: "none", cursor: "pointer" }}>
            Go to my Dashboard →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
      <div style={{ width: "100%", maxWidth: "520px" }}>
        {/* Logo / brand */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, #7C3AED, #a78bfa)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "16px", fontWeight: 900, color: "white" }}>T</span>
            </div>
            <span style={{ fontSize: "18px", fontWeight: 800, color: "#fafafa" }}>TrackHive</span>
          </div>
          <p style={{ fontSize: "13px", color: "#71717a" }}>Creator onboarding — takes under 2 minutes</p>
        </div>

        {/* Step progress */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0", marginBottom: "28px" }}>
          {STEPS.map((s, i) => (
            <div key={s.num} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "50%",
                  backgroundColor: step > s.num ? "#7C3AED" : step === s.num ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.05)",
                  border: step >= s.num ? "2px solid #7C3AED" : "2px solid rgba(255,255,255,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 200ms",
                }}>
                  {step > s.num
                    ? <Check style={{ width: "14px", height: "14px", color: "white" }} />
                    : <span style={{ fontSize: "12px", fontWeight: 800, color: step === s.num ? "#a78bfa" : "#52525b" }}>{s.num}</span>
                  }
                </div>
                <span style={{ fontSize: "10px", fontWeight: 600, color: step >= s.num ? "#a78bfa" : "#52525b" }}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ width: "60px", height: "2px", backgroundColor: step > s.num ? "#7C3AED" : "rgba(255,255,255,0.06)", margin: "0 4px", marginBottom: "16px", transition: "background 200ms" }} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div style={{ borderRadius: "18px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "#111111", padding: "28px 26px", display: "flex", flexDirection: "column", gap: "18px" }}>

          {/* ── Step 1: Profile ── */}
          {step === 1 && (
            <>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#fafafa", marginBottom: "4px" }}>Welcome! Let&apos;s set up your profile</h2>
                <p style={{ fontSize: "13px", color: "#71717a" }}>This is what brands will see when they discover you.</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.07em" }}>Display Name *</label>
                  <input value={state.displayName} onChange={e => set("displayName", e.target.value)} placeholder="Your full name or creator handle"
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "9px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "#0d0d0d", color: "#fafafa", fontSize: "13px", outline: "none", height: "42px", boxSizing: "border-box" }} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.07em" }}>Bio (optional)</label>
                  <textarea value={state.bio} onChange={e => set("bio", e.target.value)} placeholder="Tell brands who you are and what you create…" rows={3}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "9px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "#0d0d0d", color: "#fafafa", fontSize: "13px", outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.07em" }}>Your Niche *</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px" }}>
                    {NICHES.map(n => (
                      <button key={n.id} onClick={() => set("niche", n.id)}
                        style={{ padding: "9px 12px", borderRadius: "9px", border: state.niche === n.id ? "1px solid rgba(124,58,237,0.4)" : "1px solid rgba(255,255,255,0.07)", backgroundColor: state.niche === n.id ? "rgba(124,58,237,0.1)" : "rgba(255,255,255,0.02)", color: state.niche === n.id ? "#a78bfa" : "#e4e4e7", fontSize: "12px", fontWeight: 600, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: "7px", transition: "all 150ms" }}>
                        <span>{n.emoji}</span>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.label}</span>
                        {state.niche === n.id && <Check style={{ width: "11px", height: "11px", marginLeft: "auto", flexShrink: 0 }} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── Step 2: Platforms ── */}
          {step === 2 && (
            <>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#fafafa", marginBottom: "4px" }}>Connect your platforms</h2>
                <p style={{ fontSize: "13px", color: "#71717a" }}>Add at least one social account so brands can verify your reach.</p>
              </div>

              {/* Connected list */}
              {state.socialHandles.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                  {state.socialHandles.map(h => {
                    const plat = PLATFORMS.find(p => p.id === h.platform)
                    if (!plat) return null
                    const Icon = plat.Icon
                    return (
                      <div key={h.platform} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "10px", border: "1px solid rgba(52,211,153,0.2)", backgroundColor: "rgba(52,211,153,0.04)" }}>
                        <Icon style={{ width: "16px", height: "16px", color: plat.color }} />
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "#fafafa", flex: 1 }}>{h.handle}</span>
                        <span style={{ fontSize: "10px", fontWeight: 600, color: "#34d399", padding: "1px 7px", borderRadius: "4px", backgroundColor: "rgba(52,211,153,0.1)" }}>{plat.label}</span>
                        <button onClick={() => removeSocial(h.platform)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                          <X style={{ width: "13px", height: "13px", color: "#52525b" }} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Add new */}
              <div style={{ padding: "14px", borderRadius: "11px", border: "1px solid rgba(255,255,255,0.07)", backgroundColor: "#0d0d0d" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "#52525b", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.07em" }}>Add account</p>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {PLATFORMS.map(p => {
                    const Icon = p.Icon
                    const isConnected = state.socialHandles.some(h => h.platform === p.id)
                    return (
                      <button key={p.id} onClick={() => !isConnected && setAddPlatform(p.id)}
                        disabled={isConnected}
                        style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 12px", borderRadius: "8px", border: addPlatform === p.id ? "1px solid rgba(124,58,237,0.4)" : "1px solid rgba(255,255,255,0.07)", backgroundColor: addPlatform === p.id ? "rgba(124,58,237,0.1)" : isConnected ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.04)", color: isConnected ? "#3f3f46" : addPlatform === p.id ? "#a78bfa" : p.color, fontSize: "12px", fontWeight: 600, cursor: isConnected ? "not-allowed" : "pointer", opacity: isConnected ? 0.4 : 1 }}>
                        <Icon style={{ width: "13px", height: "13px" }} />
                        {p.label}
                        {isConnected && <Check style={{ width: "10px", height: "10px" }} />}
                      </button>
                    )
                  })}
                </div>
                {addPlatform && (
                  <div style={{ marginTop: "10px", display: "flex", gap: "7px" }}>
                    <input value={addHandle} onChange={e => setAddHandle(e.target.value)} placeholder="@yourhandle"
                      onKeyDown={e => e.key === "Enter" && addSocial()}
                      style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "#111111", color: "#fafafa", fontSize: "12px", outline: "none", height: "36px", boxSizing: "border-box" }} />
                    <button onClick={addSocial} style={{ padding: "0 14px", borderRadius: "8px", backgroundColor: "#7C3AED", color: "white", fontSize: "12px", fontWeight: 700, border: "none", cursor: "pointer", height: "36px", display: "flex", alignItems: "center", gap: "5px" }}>
                      <Plus style={{ width: "12px", height: "12px" }} />
                      Add
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── Step 3: Payouts ── */}
          {step === 3 && (
            <>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#fafafa", marginBottom: "4px" }}>Set up payouts</h2>
                <p style={{ fontSize: "13px", color: "#71717a" }}>How do you want to receive campaign payments?</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { id: "bank",   label: "Bank Transfer",    desc: "Direct deposit to checking or savings account", icon: "🏦" },
                  { id: "paypal", label: "PayPal",           desc: "Fast transfers to your PayPal account",          icon: "💳" },
                ] .map(m => (
                  <button key={m.id} onClick={() => set("payoutMethod", m.id as "bank" | "paypal")}
                    style={{ padding: "14px 16px", borderRadius: "11px", border: state.payoutMethod === m.id ? "1px solid rgba(124,58,237,0.4)" : "1px solid rgba(255,255,255,0.07)", backgroundColor: state.payoutMethod === m.id ? "rgba(124,58,237,0.08)" : "rgba(255,255,255,0.02)", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "20px" }}>{m.icon}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "13px", fontWeight: 700, color: "#fafafa" }}>{m.label}</p>
                      <p style={{ fontSize: "11px", color: "#71717a", marginTop: "2px" }}>{m.desc}</p>
                    </div>
                    <div style={{ width: "18px", height: "18px", borderRadius: "50%", border: state.payoutMethod === m.id ? "2px solid #7C3AED" : "2px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {state.payoutMethod === m.id && <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#7C3AED" }} />}
                    </div>
                  </button>
                ))}
              </div>

              {state.payoutMethod && (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                    {state.payoutMethod === "bank" ? "Account number (last 4 digits or routing)" : "PayPal email"}
                  </label>
                  <input value={state.accountDetail} onChange={e => set("accountDetail", e.target.value)}
                    placeholder={state.payoutMethod === "bank" ? "e.g. 4891" : "you@paypal.com"}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "9px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "#0d0d0d", color: "#fafafa", fontSize: "13px", outline: "none", height: "42px", boxSizing: "border-box" }} />
                  <p style={{ fontSize: "11px", color: "#52525b" }}>You can update this later in Earnings → Payment Methods.</p>
                </div>
              )}

              {/* Terms */}
              <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
                <div onClick={() => set("agreeToTerms", !state.agreeToTerms)}
                  style={{ width: "18px", height: "18px", borderRadius: "5px", border: state.agreeToTerms ? "none" : "2px solid rgba(255,255,255,0.12)", backgroundColor: state.agreeToTerms ? "#7C3AED" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px", cursor: "pointer", transition: "all 150ms" }}>
                  {state.agreeToTerms && <Check style={{ width: "11px", height: "11px", color: "white" }} />}
                </div>
                <p style={{ fontSize: "12px", color: "#a1a1aa", lineHeight: 1.6 }}>
                  I agree to the <a href="/terms" target="_blank" style={{ color: "#a78bfa", textDecoration: "underline" }}>Terms of Service</a> and <a href="/privacy" target="_blank" style={{ color: "#a78bfa", textDecoration: "underline" }}>Privacy Policy</a>.
                  I understand that payouts are subject to campaign completion and review.
                </p>
              </label>
            </>
          )}

          {/* Navigation */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "4px" }}>
            {step > 1
              ? <button onClick={() => setStep(s => s - 1)} style={{ padding: "9px 18px", borderRadius: "9px", border: "1px solid rgba(255,255,255,0.09)", backgroundColor: "transparent", color: "#e4e4e7", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>← Back</button>
              : <div />
            }
            {step < 3
              ? <button onClick={() => setStep(s => s + 1)} disabled={!canNext()}
                  style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 20px", borderRadius: "9px", backgroundColor: canNext() ? "#7C3AED" : "rgba(124,58,237,0.3)", color: "white", fontSize: "13px", fontWeight: 700, border: "none", cursor: canNext() ? "pointer" : "not-allowed", transition: "background 150ms" }}>
                  Continue <ChevronRight style={{ width: "14px", height: "14px" }} />
                </button>
              : <button onClick={() => { if (canNext()) setDone(true) }} disabled={!canNext()}
                  style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 20px", borderRadius: "9px", backgroundColor: canNext() ? "#7C3AED" : "rgba(124,58,237,0.3)", color: "white", fontSize: "13px", fontWeight: 700, border: "none", cursor: canNext() ? "pointer" : "not-allowed", transition: "background 150ms" }}>
                  Finish setup ✓
                </button>
            }
          </div>
        </div>

        <p style={{ textAlign: "center", fontSize: "11px", color: "#3f3f46", marginTop: "16px" }}>
          Step {step} of 3 · TrackHive Creator App
        </p>
      </div>
    </div>
  )
}
