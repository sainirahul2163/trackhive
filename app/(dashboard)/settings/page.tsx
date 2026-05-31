"use client"

import { User, Bell, Shield, CreditCard, Globe } from "lucide-react"

const settingsSections = [
  { icon: User, label: "Profile", description: "Your name, email, and personal info" },
  { icon: Bell, label: "Notifications", description: "Email and push notification preferences" },
  { icon: Shield, label: "Security", description: "Password, 2FA, and active sessions" },
  { icon: CreditCard, label: "Billing", description: "Plans, invoices, and payment methods" },
  { icon: Globe, label: "Integrations", description: "Connect YouTube, TikTok, Instagram APIs" },
]

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-[22px] font-semibold text-white tracking-tight">Settings</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          Manage your account and workspace preferences.
        </p>
      </div>

      <div className="space-y-2">
        {settingsSections.map((section) => {
          const Icon = section.icon
          return (
            <div
              key={section.label}
              className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-[#111111] hover:border-white/10 hover:bg-white/[0.02] transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-lg bg-white/[0.04] flex items-center justify-center group-hover:bg-purple-600/10 transition-colors">
                <Icon className="w-5 h-5 text-zinc-400 group-hover:text-purple-400 transition-colors" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
                  {section.label}
                </p>
                <p className="text-xs text-zinc-500">{section.description}</p>
              </div>
              <div className="text-zinc-600 group-hover:text-zinc-400 transition-colors">
                →
              </div>
            </div>
          )
        })}
      </div>

      <div className="p-4 rounded-xl border border-white/[0.06] bg-[#111111]">
        <p className="text-xs text-zinc-500 text-center">
          Full settings panel coming soon. More options will be available here.
        </p>
      </div>
    </div>
  )
}
