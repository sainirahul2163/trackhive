"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { FolderOpen, Plus, Search, SlidersHorizontal } from "lucide-react"
import { Toaster } from "sonner"
import { CreateProjectDrawer } from "@/components/projects/create-project-drawer"
import { fetchProjects } from "@/lib/projects-data"
import { useUser } from "@/lib/use-user"
import type { Project } from "@/lib/projects-data"

export default function ProjectsPage() {
  const { user } = useUser()
  const [search, setSearch] = useState("")
  const [projects, setProjects] = useState<Project[]>([])
  const [showDrawer, setShowDrawer] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (userId?: string) => {
    if (!userId) return
    setLoading(true)
    try {
      const data = await fetchProjects(userId)
      setProjects(data)
    } catch {
      setProjects([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(user?.id) }, [load, user?.id])

  const filtered = projects.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
    <Toaster position="top-right" toastOptions={{ style: { backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", color: "#fafafa" } }} />
    <div className="space-y-5 max-w-7xl">
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <Link href="/projects" className="hover:text-zinc-300">Organization</Link>
        <span>/</span>
        <span className="text-zinc-300">Projects</span>
      </div>
      <div>
        <h1 className="text-[22px] font-semibold text-white tracking-tight">Projects</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Manage your organization&apos;s projects.</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects…" className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#111111] border border-white/[0.06] text-sm text-zinc-200 outline-none focus:border-purple-500/40" />
        </div>
        <button className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/[0.04] border border-white/[0.08] text-zinc-400"><SlidersHorizontal className="w-4 h-4" /></button>
        <button
          onClick={() => setShowDrawer(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-sm font-medium ml-auto"
        >
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-[#111111] overflow-hidden">
        {filtered.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.04] text-[11px] text-zinc-500 uppercase">
                {["Name", "URL", "Description", "Added at"].map((h) => (
                  <th key={h} className="text-left px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3.5 font-medium text-zinc-200">{p.name}</td>
                  <td className="px-4 py-3.5 text-zinc-400">{p.url ?? "—"}</td>
                  <td className="px-4 py-3.5 text-zinc-500 max-w-xs truncate">{p.description ?? "—"}</td>
                  <td className="px-4 py-3.5 text-xs text-zinc-500">
                    {new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
              <FolderOpen className="w-6 h-6 text-zinc-500" />
            </div>
            <p className="text-base font-semibold text-white mb-1">
              {loading ? "Loading projects…" : "Create your first project"}
            </p>
            <p className="text-sm text-zinc-500 max-w-md mb-5">Projects help you organize and track content across different campaigns, brands, or initiatives.</p>
            <button
              onClick={() => setShowDrawer(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-sm font-medium"
            >
              <Plus className="w-4 h-4" /> New Project
            </button>
          </div>
        )}
      </div>

      {user?.id && (
        <CreateProjectDrawer
          open={showDrawer}
          onClose={() => setShowDrawer(false)}
          userId={user.id}
          onCreated={project => setProjects(prev => [project, ...prev])}
        />
      )}
    </div>
    </>
  )
}
