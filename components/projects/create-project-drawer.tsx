"use client"

import { useState } from "react"
import { X, Check } from "lucide-react"
import { toast } from "sonner"
import { createProject } from "@/lib/projects-data"
import type { Project } from "@/lib/projects-data"

interface CreateProjectDrawerProps {
  open: boolean
  onClose: () => void
  userId: string
  onCreated: (project: Project) => void
}

export function CreateProjectDrawer({ open, onClose, userId, onCreated }: CreateProjectDrawerProps) {
  const [name, setName] = useState("")
  const [url, setUrl] = useState("")
  const [description, setDescription] = useState("")
  const [saving, setSaving] = useState(false)

  if (!open) return null

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Project name is required")
      return
    }
    setSaving(true)
    try {
      const project = await createProject(userId, {
        name: name.trim(),
        url: url.trim() || null,
        description: description.trim() || null,
      })
      onCreated(project)
      setName("")
      setUrl("")
      setDescription("")
      onClose()
      toast.success("Project created")
    } catch {
      toast.error("Failed to create project")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-black/60 z-40" />
      <div className="fixed inset-y-0 right-0 w-full max-w-md z-50 flex flex-col bg-[#111111] border-l border-white/[0.08] shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <h2 className="text-[15px] font-semibold text-white">New Project</h2>
          <button onClick={onClose} className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Name *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Summer Campaign 2026"
              className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-zinc-200 outline-none focus:border-purple-500/40"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">URL</label>
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-zinc-200 outline-none focus:border-purple-500/40"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Optional project description…"
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-zinc-200 outline-none focus:border-purple-500/40 resize-none"
            />
          </div>
        </div>
        <div className="px-5 py-4 border-t border-white/[0.06]">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-all disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            {saving ? "Creating…" : "Create Project"}
          </button>
        </div>
      </div>
    </>
  )
}
