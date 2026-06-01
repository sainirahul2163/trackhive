"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Eye, EyeOff, Zap, ArrowRight, Loader2, Check } from "lucide-react"
import { supabase } from "@/lib/supabase"

type Role = "brand" | "agency" | "creator" | ""

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  if (pw.length === 0) return { score: 0, label: "", color: "" }
  let score = 0
  if (pw.length >= 8)         score++
  if (/[A-Z]/.test(pw))       score++
  if (/[0-9]/.test(pw))       score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  const map = [
    { label: "Too short",  color: "#ef4444" },
    { label: "Weak",       color: "#ef4444" },
    { label: "Fair",       color: "#f59e0b" },
    { label: "Good",       color: "#22c55e" },
    { label: "Strong",     color: "#7C3AED" },
  ]
  return { score, ...map[score] }
}

const ROLES: Array<{ value: Role; label: string; desc: string }> = [
  { value: "brand",   label: "Brand",   desc: "Running UGC campaigns" },
  { value: "agency",  label: "Agency",  desc: "Managing multiple brands" },
  { value: "creator", label: "Creator", desc: "Creating content" },
]

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<Role>("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const strength = getPasswordStrength(password)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 6) { setError("Password must be at least 6 characters."); return }
    setLoading(true)
    try {
      const { error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: fullName.trim(), role },
        },
      })
      if (authError) { setError(authError.message); return }
      router.push("/onboarding/step-1")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 16px 32px", position: "relative" }}>
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse at top left, rgba(124,58,237,0.15) 0%, transparent 60%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: "420px", position: "relative", zIndex: 10 }}>
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Zap className="w-4 h-4 text-white" fill="white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">TrackHive</span>
        </div>

        <div style={{ borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "#111111", padding: "32px" }}>
          <div className="text-center mb-6">
            <h1 className="text-[22px] font-semibold text-white mb-1.5">Create your account</h1>
            <p className="text-sm text-zinc-500">Start your 14-day free trial. No credit card required.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Jane Smith"
                required
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#e4e4e7", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                className="placeholder:text-zinc-600 focus:border-purple-500/50 transition-all"
              />
            </div>

            {/* Work email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Work Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="jane@company.com"
                required
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#e4e4e7", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                className="placeholder:text-zinc-600 focus:border-purple-500/50 transition-all"
              />
            </div>

            {/* Password + strength */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  style={{ width: "100%", padding: "10px 40px 10px 14px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#e4e4e7", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                  className="placeholder:text-zinc-600 focus:border-purple-500/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Strength bar */}
              {password.length > 0 && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        style={{
                          flex: 1, height: "3px", borderRadius: "2px",
                          backgroundColor: i <= strength.score ? strength.color : "rgba(255,255,255,0.1)",
                          transition: "background-color 0.3s",
                        }}
                      />
                    ))}
                  </div>
                  <p style={{ fontSize: "11px", color: strength.color }}>{strength.label}</p>
                </div>
              )}
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">I am a...</label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    style={{
                      padding: "10px 8px", borderRadius: "8px", textAlign: "center",
                      border: role === r.value ? "1px solid rgba(124,58,237,0.5)" : "1px solid rgba(255,255,255,0.08)",
                      backgroundColor: role === r.value ? "rgba(124,58,237,0.1)" : "rgba(255,255,255,0.03)",
                      cursor: "pointer", transition: "all 0.15s",
                    }}
                  >
                    {role === r.value && (
                      <div className="flex justify-center mb-1">
                        <Check className="w-3 h-3 text-purple-400" />
                      </div>
                    )}
                    <p style={{ fontSize: "12px", fontWeight: 600, color: role === r.value ? "#c084fc" : "#a1a1aa" }}>{r.label}</p>
                    <p style={{ fontSize: "10px", color: "#71717a", marginTop: "2px" }}>{r.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-70 text-white text-sm font-semibold transition-all active:scale-[0.98] shadow-lg shadow-purple-500/20"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} />
            </div>
            <div className="relative flex justify-center">
              <span style={{ backgroundColor: "#111111" }} className="px-3 text-xs text-zinc-600">or</span>
            </div>
          </div>

          {/* Demo button */}
          <Link
            href="/demo"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-zinc-300 hover:text-white transition-all"
            style={{ border: "1px solid rgba(255,255,255,0.10)", backgroundColor: "transparent", display: "flex" }}
          >
            Try Demo Dashboard
          </Link>

          {/* Terms */}
          <p className="text-center text-[11px] text-zinc-600 mt-4 leading-relaxed">
            By signing up you agree to our{" "}
            <Link href="#" className="text-zinc-500 hover:text-zinc-300 underline underline-offset-2">Terms</Link>
            {" "}&amp;{" "}
            <Link href="#" className="text-zinc-500 hover:text-zinc-300 underline underline-offset-2">Privacy Policy</Link>
          </p>
        </div>

        <p className="text-center text-sm text-zinc-600 mt-5">
          Already have an account?{" "}
          <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
