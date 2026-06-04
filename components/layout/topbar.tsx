"use client"

import { Bell, ChevronDown, Check } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { cn } from "@/lib/utils"
import { useUser } from "@/lib/use-user"

const workspaces = [
  { id: "1", name: "Acme Corp", plan: "Pro" },
  { id: "2", name: "Startup Inc", plan: "Starter" },
  { id: "3", name: "Personal", plan: "Free" },
]

const notifications = [
  { id: "1", message: "Campaign \"Summer Drop\" reached 1M views", time: "2m ago", unread: true },
  { id: "2", message: "Creator @jake_creates submitted new content", time: "1h ago", unread: true },
  { id: "3", message: "Payment of $2,400 processed successfully", time: "3h ago", unread: false },
]

export function Topbar() {
  const [activeWorkspace, setActiveWorkspace] = useState(workspaces[0])
  const unreadCount = notifications.filter((n) => n.unread).length
  const { user } = useUser()
  const displayName = user?.displayName ?? ""
  const initials    = user?.initials    ?? ""
  const avatarSrc   = user?.avatarUrl   ?? ""

  async function handleSignOut() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <header
      className="flex items-center justify-between px-5"
      style={{ height: "56px", flexShrink: 0, backgroundColor: "#0a0a0a", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* ── Workspace switcher ── */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-white/[0.05] transition-colors outline-none cursor-pointer">
          <div className="w-5 h-5 rounded bg-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
            {activeWorkspace.name.charAt(0)}
          </div>
          <span className="text-sm font-medium text-zinc-200">{activeWorkspace.name}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-600/20 text-purple-400 font-medium">{activeWorkspace.plan}</span>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 bg-[#1a1a1a] border-white/10">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs text-zinc-500 font-medium">Workspaces</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/[0.06]" />
            {workspaces.map((ws) => (
              <DropdownMenuItem key={ws.id} onClick={() => setActiveWorkspace(ws)}
                className="flex items-center justify-between cursor-pointer hover:bg-white/[0.05] text-zinc-300 focus:bg-white/[0.05] focus:text-zinc-100">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-purple-600 flex items-center justify-center text-[10px] font-bold text-white">{ws.name.charAt(0)}</div>
                  <span className="text-sm">{ws.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-zinc-500">{ws.plan}</span>
                  {activeWorkspace.id === ws.id && <Check className="w-3 h-3 text-purple-400" />}
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="bg-white/[0.06]" />
            <DropdownMenuItem className="text-purple-400 hover:text-purple-300 focus:text-purple-300 hover:bg-white/[0.05] focus:bg-white/[0.05] cursor-pointer text-sm">
              + Create workspace
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex items-center gap-2">
        {/* ── Notifications ── */}
        <DropdownMenu>
          <DropdownMenuTrigger className="relative p-2 rounded-md hover:bg-white/[0.05] transition-colors outline-none cursor-pointer">
            <Bell className="w-4 h-4 text-zinc-400" />
            {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-purple-500" />}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-[#1a1a1a] border-white/10">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex items-center justify-between">
                <span className="text-sm font-semibold text-zinc-200">Notifications</span>
                <span className="text-xs text-purple-400 cursor-pointer hover:text-purple-300">Mark all read</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/[0.06]" />
              {notifications.map((notif) => (
                <DropdownMenuItem key={notif.id}
                  className={cn("flex flex-col items-start gap-0.5 cursor-pointer py-3 hover:bg-white/[0.05] focus:bg-white/[0.05]", notif.unread && "bg-purple-600/5")}>
                  <div className="flex items-start gap-2 w-full">
                    {notif.unread && <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />}
                    <p className={cn("text-sm leading-snug", notif.unread ? "text-zinc-200" : "text-zinc-400")}>{notif.message}</p>
                  </div>
                  <span className="text-xs text-zinc-600 ml-3.5">{notif.time}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* ── User avatar ── */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-md hover:bg-white/[0.05] transition-colors outline-none cursor-pointer">
            <Avatar className="w-7 h-7">
              <AvatarImage src={avatarSrc} />
              <AvatarFallback className="bg-purple-600 text-white text-xs font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-zinc-300">{displayName}</span>
            <ChevronDown className="w-3 h-3 text-zinc-500" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-[#1a1a1a] border-[#2a2a2a]">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-gray-400 text-xs">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#2a2a2a]" />
              <DropdownMenuItem className="text-gray-300 hover:text-white cursor-pointer">
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-gray-300 hover:text-white cursor-pointer"
                onClick={() => { window.location.href = "/settings" }}
              >
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-[#2a2a2a]" />
            <DropdownMenuItem
              className="text-red-400 hover:text-red-300 cursor-pointer"
              onClick={handleSignOut}
            >
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
