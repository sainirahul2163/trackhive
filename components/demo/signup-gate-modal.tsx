"use client"

import Link from "next/link"
import { X, Sparkles } from "lucide-react"

interface SignupGateModalProps {
  open: boolean
  onClose: () => void
  feature?: string
}

export function SignupGateModal({ open, onClose, feature = "this feature" }: SignupGateModalProps) {
  if (!open) return null
  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm"
        style={{ borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)", backgroundColor: "#111111", padding: "32px" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7 text-purple-400" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Sign up to use {feature}</h2>
          <p className="text-sm text-zinc-500 leading-relaxed mb-6">
            Create a free account to unlock all features, connect your real social accounts, and start tracking real data.
          </p>
          <div className="space-y-2.5">
            <Link
              href="/signup"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-all shadow-lg shadow-purple-500/20"
            >
              Create Free Account
            </Link>
            <Link
              href="/login"
              className="w-full flex items-center justify-center py-2.5 rounded-lg text-sm text-zinc-400 hover:text-zinc-200 transition-all"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            >
              Sign in instead
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
