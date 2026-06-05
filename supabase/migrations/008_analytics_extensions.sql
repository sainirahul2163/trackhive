-- Analytics parity extensions: video metadata, account tracking limits, creator links

ALTER TABLE tracked_videos
  ADD COLUMN IF NOT EXISTS duration_seconds INT,
  ADD COLUMN IF NOT EXISTS audio_name TEXT;

ALTER TABLE tracked_accounts
  ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES creators(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS tracking_limit INT DEFAULT 30;

ALTER TABLE creators
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS internal_notes TEXT;

CREATE TABLE IF NOT EXISTS individually_tracked_videos (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID,
  platform     TEXT NOT NULL CHECK (platform IN ('tiktok', 'instagram', 'youtube', 'facebook')),
  video_url    TEXT NOT NULL UNIQUE,
  caption      TEXT,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('ok', 'pending', 'error')),
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID,
  name         TEXT NOT NULL,
  url          TEXT,
  description  TEXT,
  apple_app    TEXT,
  account_type TEXT,
  added_by     TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE individually_tracked_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_individually_tracked_videos" ON individually_tracked_videos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_projects" ON projects FOR ALL USING (true) WITH CHECK (true);
