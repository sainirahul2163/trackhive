"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import {
  Zap, CheckCircle2, User, Mail, CreditCard,
  DollarSign, Shield, ArrowRight, Loader2,
  TrendingUp, Video, Star, AlertCircle,
} from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"

type Step = "loading" | "error" | "welcome" | "profile" | "payment" | "done"

interface InviteData {
  brand: string
  campaign: string
  baseFee: number
  cpmRate: number
  milestoneBonus: number
  milestoneViews: number
  paymentMethods: string[]
}

const PAYMENT_METHOD_OPTIONS = ["PayPal", "Bank Transfer", "Wise"]

/* ─── Progress bar ──────────────────────────────────── */
const STEPS: { id: Step; label: string }[] = [
  { id: "welcome", label: "Welcome" },
  { id: "profile", label: "Your Details" },
  { id: "payment", label: "Payment Setup" },
  { id: "done",    label: "All Done" },
]

function StepDot({ active, done }: { active: boolean; done: boolean }) {
  return (
    <div style={{
      width: "24px", height: "24px", borderRadius: "50%", flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      backgroundColor: done ? "#7C3AED" : active ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.06)",
      border: `2px solid ${done || active ? "#7C3AED" : "rgba(255,255,255,0.1)"}`,
      transition: "all 300ms",
    }}>
      {done && <CheckCircle2 style={{ width: "13px", height: "13px", color: "white" }} />}
      {active && !done && <div style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#7C3AED" }} />}
    </div>
  )
}

/* ─── Card wrapper ──────────────────────────────────── */
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      backgroundColor: "#111111",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "20px",
      padding: "36px",
      width: "100%",
      maxWidth: "480px",
      boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
    }}>
      {children}
    </div>
  )
}

/* ─── Input field ───────────────────────────────────── */
function Field({ label, type = "text", placeholder, value, onChange }: {
  label: string; type?: string; placeholder: string; value: string; onChange: (v: string) => void
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "13px", fontWeight: 500, color: "#a1a1aa" }}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          padding: "11px 14px", borderRadius: "10px",
          border: "1px solid rgba(255,255,255,0.08)",
          backgroundColor: "rgba(255,255,255,0.04)",
          color: "#fafafa", fontSize: "14px", outline: "none",
          transition: "border-color 150ms",
        }}
        onFocus={e => (e.target.style.borderColor = "rgba(124,58,237,0.5)")}
        onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
      />
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────── */
export default function InvitePage() {
  const { token } = useParams<{ token: string }>()
  const [step, setStep] = useState<Step>("loading")
  const [invite, setInvite] = useState<InviteData | null>(null)
  const [errorMessage, setErrorMessage] = useState("")

  // Form state
  const [name, setName]         = useState("")
  const [email, setEmail]       = useState("")
  const [handle, setHandle]     = useState("")
  const [payMethod, setPayMethod] = useState("PayPal")
  const [payDetail, setPayDetail] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!token) {
      setErrorMessage("Invalid invite link.")
      setStep("error")
      return
    }

    async function loadInvite() {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data, error } = await supabase
        .from("creators")
        .select("id, name, invite_accepted")
        .eq("invite_token", token)
        .maybeSingle()

      if (error || !data) {
        setErrorMessage(error?.message ?? "This invite link is invalid or has expired.")
        setStep("error")
        return
      }

      if (data.invite_accepted) {
        setErrorMessage("This invite has already been accepted.")
        setStep("error")
        return
      }

      setInvite({
        brand: "Campaign sponsor",
        campaign: "Creator campaign",
        baseFee: 0,
        cpmRate: 0,
        milestoneBonus: 0,
        milestoneViews: 0,
        paymentMethods: PAYMENT_METHOD_OPTIONS,
      })
      setStep("welcome")
    }

    loadInvite().catch(() => {
      setErrorMessage("Unable to load invite. Please try again later.")
      setStep("error")
    })
  }, [token])

  async function handleProfileNext() {
    if (!name.trim() || !email.trim()) return
    setStep("payment")
  }

  async function handleFinish() {
    if (!payDetail.trim()) return
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 1500))
    setSubmitting(false)
    setStep("done")
  }

  const stepIndex = STEPS.findIndex(s => s.id === step)

  if (step === "error") {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#0a0a0a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", gap: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: "linear-gradient(135deg,#7C3AED,#6D28D9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap style={{ width: "15px", height: "15px", color: "white" }} />
          </div>
          <span style={{ fontSize: "16px", fontWeight: 700, color: "#fafafa" }}>TrackHive</span>
        </div>
        <Card>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "14px", backgroundColor: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <AlertCircle style={{ width: "26px", height: "26px", color: "#f87171" }} />
            </div>
            <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#fafafa", marginBottom: "8px" }}>Invite not found</h1>
            <p style={{ fontSize: "14px", color: "#71717a", lineHeight: 1.6, marginBottom: "24px" }}>
              {errorMessage || "This invite link is invalid or has expired. Contact the brand that sent you the invite for a new link."}
            </p>
            <a
              href="/login"
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                padding: "12px 24px", borderRadius: "10px",
                backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                color: "#a1a1aa", fontSize: "14px", fontWeight: 500, textDecoration: "none",
              }}
            >
              Go to login
            </a>
          </div>
        </Card>
      </div>
    )
  }

  /* Loading */
  if (step === "loading") {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#0a0a0a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg,#7C3AED,#6D28D9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Zap style={{ width: "22px", height: "22px", color: "white" }} />
        </div>
        <Loader2 style={{ width: "20px", height: "20px", color: "#7C3AED", animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontSize: "14px", color: "#71717a" }}>Validating your invite…</p>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: "100vh", backgroundColor: "#0a0a0a",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "24px",
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "32px" }}>
        <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: "linear-gradient(135deg,#7C3AED,#6D28D9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Zap style={{ width: "15px", height: "15px", color: "white" }} />
        </div>
        <span style={{ fontSize: "16px", fontWeight: 700, color: "#fafafa" }}>TrackHive</span>
      </div>

      {/* Progress (hide on loading/done) */}
      {step !== "done" && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "28px" }}>
          {STEPS.slice(0, -1).map((s, i) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <StepDot active={s.id === step} done={i < stepIndex} />
              <span style={{ fontSize: "12px", color: s.id === step ? "#a78bfa" : "#52525b", fontWeight: s.id === step ? 600 : 400 }}>
                {s.label}
              </span>
              {i < 2 && <div style={{ width: "24px", height: "1px", backgroundColor: i < stepIndex ? "#7C3AED" : "rgba(255,255,255,0.08)" }} />}
            </div>
          ))}
        </div>
      )}

      {/* ── Step: Welcome ─────────────────────────────── */}
      {step === "welcome" && invite && (
        <Card>
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "14px", backgroundColor: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Star style={{ width: "26px", height: "26px", color: "#a78bfa" }} />
            </div>
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#fafafa", marginBottom: "8px" }}>
              You&apos;ve been invited!
            </h1>
            <p style={{ fontSize: "14px", color: "#71717a", lineHeight: 1.6 }}>
              <span style={{ color: "#fafafa", fontWeight: 600 }}>{invite.brand}</span> wants you to join their{" "}
              <span style={{ color: "#a78bfa", fontWeight: 600 }}>{invite.campaign}</span> campaign on TrackHive.
            </p>
          </div>

          {/* Deal summary */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px", padding: "16px", borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p style={{ fontSize: "11px", fontWeight: 600, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Deal breakdown</p>
            {[
              { icon: DollarSign, label: "Base fee",          value: `$${invite.baseFee} per video`, color: "text-emerald-400" },
              { icon: TrendingUp, label: "CPM rate",          value: `$${invite.cpmRate} per 1,000 views`, color: "" },
              { icon: Video,      label: "Milestone bonus",   value: `$${invite.milestoneBonus} at ${(invite.milestoneViews / 1000).toFixed(0)}K views`, color: "" },
            ].map(row => {
              const Icon = row.icon
              return (
                <div key={row.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Icon style={{ width: "14px", height: "14px", color: "#71717a" }} />
                    <span style={{ fontSize: "13px", color: "#71717a" }}>{row.label}</span>
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#fafafa" }}>{row.value}</span>
                </div>
              )
            })}
          </div>

          <button
            onClick={() => setStep("profile")}
            style={{
              width: "100%", padding: "13px", borderRadius: "11px",
              backgroundColor: "#7C3AED", color: "white",
              fontSize: "15px", fontWeight: 600, cursor: "pointer", border: "none",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            }}
          >
            Accept Invite
            <ArrowRight style={{ width: "16px", height: "16px" }} />
          </button>
          <p style={{ fontSize: "12px", color: "#52525b", textAlign: "center", marginTop: "12px" }}>
            By continuing you agree to the creator payment terms.
          </p>
        </Card>
      )}

      {/* ── Step: Profile ─────────────────────────────── */}
      {step === "profile" && (
        <Card>
          <div style={{ marginBottom: "24px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.25)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" }}>
              <User style={{ width: "20px", height: "20px", color: "#60a5fa" }} />
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#fafafa", marginBottom: "6px" }}>Your details</h2>
            <p style={{ fontSize: "14px", color: "#71717a" }}>This info will be used for invoicing and communication.</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "24px" }}>
            <Field label="Full name *"    placeholder="Jane Smith"              value={name}   onChange={setName} />
            <Field label="Email address *" placeholder="jane@email.com"         type="email"  value={email}  onChange={setEmail} />
            <Field label="Social handle"  placeholder="@yourusername"           value={handle} onChange={setHandle} />
          </div>

          <button
            onClick={handleProfileNext}
            disabled={!name.trim() || !email.trim()}
            style={{
              width: "100%", padding: "13px", borderRadius: "11px",
              backgroundColor: !name.trim() || !email.trim() ? "rgba(124,58,237,0.4)" : "#7C3AED",
              color: "white", fontSize: "15px", fontWeight: 600,
              cursor: !name.trim() || !email.trim() ? "not-allowed" : "pointer",
              border: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            }}
          >
            Continue
            <ArrowRight style={{ width: "16px", height: "16px" }} />
          </button>
        </Card>
      )}

      {/* ── Step: Payment ─────────────────────────────── */}
      {step === "payment" && invite && (
        <Card>
          <div style={{ marginBottom: "24px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.25)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" }}>
              <CreditCard style={{ width: "20px", height: "20px", color: "#34d399" }} />
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#fafafa", marginBottom: "6px" }}>Payment setup</h2>
            <p style={{ fontSize: "14px", color: "#71717a" }}>How should {invite.brand} pay you?</p>
          </div>

          {/* Method selector */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
            <label style={{ fontSize: "13px", fontWeight: 500, color: "#a1a1aa" }}>Payment method</label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {invite.paymentMethods.map(m => (
                <button
                  key={m}
                  onClick={() => setPayMethod(m)}
                  style={{
                    padding: "8px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: 500, cursor: "pointer",
                    border: `1px solid ${payMethod === m ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.08)"}`,
                    backgroundColor: payMethod === m ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.03)",
                    color: payMethod === m ? "#a78bfa" : "#71717a",
                    transition: "all 150ms",
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "24px" }}>
            <Field
              label={payMethod === "PayPal" ? "PayPal email *" : payMethod === "Wise" ? "Wise email *" : "Account details *"}
              placeholder={payMethod === "PayPal" ? "paypal@email.com" : payMethod === "Wise" ? "wise@email.com" : "Account number / IBAN"}
              value={payDetail}
              onChange={setPayDetail}
            />
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "12px", borderRadius: "10px", backgroundColor: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)", marginBottom: "20px" }}>
            <Shield style={{ width: "15px", height: "15px", color: "#34d399", flexShrink: 0, marginTop: "1px" }} />
            <p style={{ fontSize: "12px", color: "#6ee7b7", lineHeight: 1.5 }}>
              Your payment info is encrypted and only used to process payouts. We never share it with third parties.
            </p>
          </div>

          <button
            onClick={handleFinish}
            disabled={!payDetail.trim() || submitting}
            style={{
              width: "100%", padding: "13px", borderRadius: "11px",
              backgroundColor: !payDetail.trim() ? "rgba(124,58,237,0.4)" : "#7C3AED",
              color: "white", fontSize: "15px", fontWeight: 600,
              cursor: !payDetail.trim() ? "not-allowed" : "pointer",
              border: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            }}
          >
            {submitting ? <Loader2 style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} /> : (
              <>Finish Setup <ArrowRight style={{ width: "16px", height: "16px" }} /></>
            )}
          </button>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </Card>
      )}

      {/* ── Step: Done ────────────────────────────────── */}
      {step === "done" && (
        <Card>
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{
              width: "72px", height: "72px", borderRadius: "50%",
              backgroundColor: "rgba(16,185,129,0.15)", border: "2px solid rgba(16,185,129,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px",
            }}>
              <CheckCircle2 style={{ width: "36px", height: "36px", color: "#34d399" }} />
            </div>
            <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#fafafa", marginBottom: "10px" }}>
              You&apos;re all set! 🎉
            </h2>
            <p style={{ fontSize: "14px", color: "#71717a", lineHeight: 1.65, marginBottom: "28px" }}>
              Your invite has been accepted. {invite?.brand} will be in touch with campaign details soon. Payouts are processed automatically once milestones are hit.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "center", padding: "12px", borderRadius: "10px", backgroundColor: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.15)", marginBottom: "24px" }}>
              <Mail style={{ width: "14px", height: "14px", color: "#a78bfa" }} />
              <span style={{ fontSize: "13px", color: "#a78bfa" }}>Check your email for a confirmation receipt.</span>
            </div>
            <a
              href="/"
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                padding: "12px 24px", borderRadius: "10px",
                backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                color: "#a1a1aa", fontSize: "14px", fontWeight: 500, textDecoration: "none",
              }}
            >
              Back to TrackHive
            </a>
          </div>
        </Card>
      )}
    </div>
  )
}
