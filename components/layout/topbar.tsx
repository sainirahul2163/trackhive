"use client"

import { Bell, ChevronDown, Check } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { cn } from "@/lib/utils"

const workspaces = [
  { id: "1", name: "Acme Corp", plan: "Pro" },
  { id: "2", name: "Startup Inc", plan: "Starter" },
  { id: "3", name: "Personal", plan: "Free" },
]

const notifications = [
  {
    id: "1",
    message: "Campaign \"Summer Drop\" reached 1M views",
    time: "2m ago",
    unread: true,
  },
  {
    id: "2",
    message: "Creator @jake_creates submitted new content",
    time: "1h ago",
    unread: true,
  },
  {
    id: "3",
    message: "Payment of $2,400 processed successfully",
    time: "3h ago",
    unread: false,
  },
]

export function Topbar() {
  const [activeWorkspace, setActiveWorkspace] = useState(workspaces[0])
  const unreadCount = notifications.filter((n) => n.unread).length

  return (
    <header className="flex items-center justify-between h-14 px-5 border-b border-white/[0.06] bg-[#0a0a0a]">
      {/* Workspace switcher */}
      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-white/[0.05] transition-colors outline-none cursor-pointer"
        >
          <div className="w-5 h-5 rounded bg-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
            {activeWorkspace.name.charAt(0)}
          </div>
          <span className="text-sm font-medium text-zinc-200">{activeWorkspace.name}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-600/20 text-purple-400 font-medium">
            {activeWorkspace.plan}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-500 transition-colors" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-56 bg-[#1a1a1a] border-white/10"
        >
          <DropdownMenuLabel className="text-xs text-zinc-500 font-medium">
            Workspaces
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-white/[0.06]" />
          {workspaces.map((ws) => (
            <DropdownMenuItem
              key={ws.id}
              onClick={() => setActiveWorkspace(ws)}
              className="flex items-center justify-between cursor-pointer hover:bg-white/[0.05] text-zinc-300 focus:bg-white/[0.05] focus:text-zinc-100"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
                  {ws.name.charAt(0)}
                </div>
                <span className="text-sm">{ws.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-zinc-500">{ws.plan}</span>
                {activeWorkspace.id === ws.id && (
                  <Check className="w-3 h-3 text-purple-400" />
                )}
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator className="bg-white/[0.06]" />
          <DropdownMenuItem className="text-purple-400 hover:text-purple-300 focus:text-purple-300 hover:bg-white/[0.05] focus:bg-white/[0.05] cursor-pointer text-sm">
            + Create workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger className="relative p-2 rounded-md hover:bg-white/[0.05] transition-colors outline-none cursor-pointer">
            <Bell className="w-4 h-4 text-zinc-400" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-purple-500" />
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-80 bg-[#1a1a1a] border-white/10"
          >
            <DropdownMenuLabel className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-200">Notifications</span>
              <span className="text-xs text-purple-400 cursor-pointer hover:text-purple-300">
                Mark all read
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/[0.06]" />
            {notifications.map((notif) => (
              <DropdownMenuItem
                key={notif.id}
                className={cn(
                  "flex flex-col items-start gap-0.5 cursor-pointer py-3 hover:bg-white/[0.05] focus:bg-white/[0.05]",
                  notif.unread && "bg-purple-600/5"
                )}
              >
                <div className="flex items-start gap-2 w-full">
                  {notif.unread && (
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                  )}
                  <p className={cn(
                    "text-sm leading-snug",
                    notif.unread ? "text-zinc-200" : "text-zinc-400"
                  )}>
                    {notif.message}
                  </p>
                </div>
                <span className="text-xs text-zinc-600 ml-3.5">{notif.time}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-md hover:bg-white/[0.05] transition-colors outline-none cursor-pointer">
            <Avatar className="w-7 h-7">
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=trackhive" />
              <AvatarFallback className="bg-purple-600 text-white text-xs font-semibold">
                RH
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-zinc-300">Rahul</span>
            <ChevronDown className="w-3 h-3 text-zinc-500" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-52 bg-[#1a1a1a] border-white/10"
          >
            <DropdownMenuLabel className="text-zinc-400 text-xs font-normal">
              rahul@example.com
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/[0.06]" />
            <DropdownMenuItem className="text-zinc-300 hover:text-zinc-100 focus:text-zinc-100 hover:bg-white/[0.05] focus:bg-white/[0.05] cursor-pointer text-sm">
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="text-zinc-300 hover:text-zinc-100 focus:text-zinc-100 hover:bg-white/[0.05] focus:bg-white/[0.05] cursor-pointer text-sm">
              Billing
            </DropdownMenuItem>
            <DropdownMenuItem className="text-zinc-300 hover:text-zinc-100 focus:text-zinc-100 hover:bg-white/[0.05] focus:bg-white/[0.05] cursor-pointer text-sm">
              API Keys
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/[0.06]" />
            <DropdownMenuItem className="text-red-400 hover:text-red-300 focus:text-red-300 hover:bg-white/[0.05] focus:bg-white/[0.05] cursor-pointer text-sm">
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
