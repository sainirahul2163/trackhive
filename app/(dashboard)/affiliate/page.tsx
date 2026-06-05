"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function AffiliatePage() {
  return (
    <div className="max-w-lg mx-auto py-20 text-center space-y-4">
      <h1 className="text-xl font-semibold text-white">Affiliate Portal</h1>
      <p className="text-sm text-zinc-500">Coming soon — earn by referring TrackHive to agencies and brands.</p>
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>
    </div>
  )
}
