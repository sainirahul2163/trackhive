import { supabase } from "@/lib/supabase"

export interface Project {
  id:           string
  workspace_id: string | null
  name:         string
  url:          string | null
  description:  string | null
  created_at:   string
}

export async function fetchProjects(userId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("workspace_id", userId)
    .order("created_at", { ascending: false })
  if (error) throw new Error(error.message)
  return data as Project[]
}

export async function createProject(
  userId: string,
  payload: { name: string; url?: string | null; description?: string | null },
): Promise<Project> {
  const { data, error } = await supabase
    .from("projects")
    .insert({
      workspace_id: userId,
      name:         payload.name,
      url:          payload.url ?? null,
      description:  payload.description ?? null,
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Project
}
