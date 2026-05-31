import { supabase } from "@/lib/supabase"
import type { TrendVideo, InspirationBoard, BoardVideo } from "@/types"

export async function fetchTrendVideos(): Promise<TrendVideo[]> {
  const { data, error } = await supabase
    .from("trend_videos")
    .select("*")
    .order("virality_score", { ascending: false })
  if (error) throw new Error(error.message)
  return data as TrendVideo[]
}

export async function fetchBoards(): Promise<InspirationBoard[]> {
  const { data, error } = await supabase
    .from("inspiration_boards")
    .select("*")
    .order("created_at", { ascending: true })
  if (error) throw new Error(error.message)
  return data as InspirationBoard[]
}

export async function saveVideoToBoard(boardId: string, videoId: string): Promise<BoardVideo> {
  const { data, error } = await supabase
    .from("board_videos")
    .insert({ board_id: boardId, video_id: videoId })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as BoardVideo
}

export async function createBoard(name: string, campaignId?: string): Promise<InspirationBoard> {
  const { data, error } = await supabase
    .from("inspiration_boards")
    .insert({ name, campaign_id: campaignId ?? null })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as InspirationBoard
}

export async function fetchBoardVideos(boardId: string): Promise<TrendVideo[]> {
  const { data, error } = await supabase
    .from("board_videos")
    .select("*, video:trend_videos(*)")
    .eq("board_id", boardId)
    .order("created_at", { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map((row: { video: TrendVideo }) => row.video).filter(Boolean)
}
