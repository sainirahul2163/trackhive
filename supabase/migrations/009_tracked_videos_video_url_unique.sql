-- tracked_videos.video_url must be UNIQUE for upsert onConflict
-- Deduplicate existing rows (keep newest created_at per URL) before adding constraint
DELETE FROM tracked_videos a
USING tracked_videos b
WHERE a.video_url = b.video_url
  AND a.created_at < b.created_at;

CREATE UNIQUE INDEX IF NOT EXISTS idx_tracked_videos_video_url_unique
  ON tracked_videos (video_url);
