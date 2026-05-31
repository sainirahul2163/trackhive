"use client"

import Link from "next/link"
import { useState } from "react"
import { Eye, EyeOff, Zap, ArrowRight, Check } from "lucide-react"

const features = [
  "Track unlimited creator campaigns",
  "Real-time performance analytics",
  "Automated payout management",
  "Competitor intelligence",
]

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-transparent pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
            <Zap className="w-4.5 h-4.5 text-white" fill="white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">TrackHive</span>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#111111] p-8">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-semibold text-white mb-1.5">Create your account</h1>
            <p className="text-sm text-zinc-500">Start tracking campaigns in minutes</p>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Work email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-all active:scale-[0.98]"
            >
              Create account
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-xs text-zinc-600 mt-4">
            By signing up, you agree to our{" "}
            <Link href="#" className="text-purple-400 hover:text-purple-300">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-purple-400 hover:text-purple-300">
              Privacy Policy
            </Link>
          </p>

          <div className="mt-6 pt-5 border-t border-white/[0.06] space-y-2">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-purple-600/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-2.5 h-2.5 text-purple-400" />
                </div>
                <span className="text-xs text-zinc-500">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-sm text-zinc-600 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-purple-400 hover:text-purple-300 transition-colors font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
