"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useState, Suspense } from "react"
import { Eye, EyeOff, Zap, ArrowRight, Loader2, Check } from "lucide-react"
import { supabase } from "@/lib/supabase"

function LoginForm() {
  const searchParams = useSearchParams()
  const next = searchParams.get("next") ?? "/dashboard"
  const resetSuccess = searchParams.get("reset") === "success"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      console.log("[login] signInWithPassword result:", { data, authError })

      if (authError) {
        console.error("[login] auth error:", authError.message)
        setError(authError.message)
        return
      }

      if (!data.session) {
        setError("Sign in succeeded but no session was returned. Please try again.")
        return
      }

      // Hard redirect so the browser sends the fresh auth cookie with the
      // next request — this lets the middleware confirm the session correctly.
      console.log("[login] success, redirecting to:", next)
      window.location.href = next
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unexpected error. Please try again."
      console.error("[login] unexpected error:", err)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{ minHeight: "100vh", backgroundColor: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", position: "relative" }}
    >
      {/* Background gradient */}
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse at top left, rgba(124,58,237,0.15) 0%, transparent 60%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: "400px", position: "relative", zIndex: 10 }}>
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Zap className="w-4 h-4 text-white" fill="white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">TrackHive</span>
        </div>

        {/* Card */}
        <div style={{ borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "#111111", padding: "32px" }}>
          <div className="text-center mb-6">
            <h1 className="text-[22px] font-semibold text-white mb-1.5">Welcome back</h1>
            <p className="text-sm text-zinc-500">Sign in to your account</p>
          </div>

          {resetSuccess && (
            <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 mb-4 flex items-center gap-2">
              <Check className="w-3.5 h-3.5 flex-shrink-0" />
              Password updated. Sign in with your new password.
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: "8px",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: error ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(255,255,255,0.08)",
                  color: "#e4e4e7", fontSize: "14px", outline: "none", boxSizing: "border-box",
                }}
                className="placeholder:text-zinc-600 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-400">Password</label>
                <Link href="/forgot-password" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: "100%", padding: "10px 40px 10px 14px", borderRadius: "8px",
                    backgroundColor: "rgba(255,255,255,0.05)",
                    border: error ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(255,255,255,0.08)",
                    color: "#e4e4e7", fontSize: "14px", outline: "none", boxSizing: "border-box",
                  }}
                  className="placeholder:text-zinc-600 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
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
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-70 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all active:scale-[0.98] shadow-lg shadow-purple-500/20"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
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
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/[0.04] transition-all"
            style={{ border: "1px solid rgba(255,255,255,0.10)" }}
          >
            Try Demo Dashboard
          </Link>
        </div>

        <p className="text-center text-sm text-zinc-600 mt-5">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
