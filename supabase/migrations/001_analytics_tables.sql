-- ============================================================
-- TrackHive Analytics Module - Migration 001
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: tracked_accounts
-- Stores social media accounts being monitored per workspace
-- ============================================================
CREATE TABLE IF NOT EXISTS tracked_accounts (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id      UUID,                                        -- future: link to workspaces table
  platform          TEXT NOT NULL CHECK (platform IN ('tiktok', 'instagram', 'youtube', 'facebook')),
  username          TEXT NOT NULL,
  display_name      TEXT,
  avatar_url        TEXT,
  profile_url       TEXT,
  follower_count    BIGINT DEFAULT 0,
  total_views       BIGINT DEFAULT 0,
  avg_views         BIGINT DEFAULT 0,
  engagement_rate   NUMERIC(5, 2) DEFAULT 0.00,                 -- e.g. 4.75 = 4.75%
  last_synced_at    TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT tracked_accounts_username_platform_unique UNIQUE (workspace_id, platform, username)
);

-- ============================================================
-- TABLE: tracked_videos
-- Individual videos/posts for each tracked account
-- ============================================================
CREATE TABLE IF NOT EXISTS tracked_videos (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id        UUID NOT NULL REFERENCES tracked_accounts(id) ON DELETE CASCADE,
  platform          TEXT NOT NULL CHECK (platform IN ('tiktok', 'instagram', 'youtube', 'facebook')),
  video_url         TEXT NOT NULL,
  thumbnail_url     TEXT,
  caption           TEXT,
  views             BIGINT DEFAULT 0,
  likes             BIGINT DEFAULT 0,
  comments          BIGINT DEFAULT 0,
  shares            BIGINT DEFAULT 0,
  saves             BIGINT DEFAULT 0,
  engagement_rate   NUMERIC(5, 2) DEFAULT 0.00,
  virality_score    NUMERIC(4, 1) DEFAULT 0.0,                  -- 0.0 – 10.0
  tags              TEXT[] DEFAULT '{}',                         -- e.g. ['product demo', 'lifestyle']
  posted_at         TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- TABLE: video_daily_stats
-- Time-series data: views/engagement per day per video
-- ============================================================
CREATE TABLE IF NOT EXISTS video_daily_stats (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id  UUID NOT NULL REFERENCES tracked_videos(id) ON DELETE CASCADE,
  date      DATE NOT NULL,
  views     BIGINT DEFAULT 0,
  likes     BIGINT DEFAULT 0,
  comments  BIGINT DEFAULT 0,
  shares    BIGINT DEFAULT 0,

  CONSTRAINT video_daily_stats_video_date_unique UNIQUE (video_id, date)
);

-- ============================================================
-- INDEXES for common query patterns
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_tracked_accounts_workspace   ON tracked_accounts (workspace_id);
CREATE INDEX IF NOT EXISTS idx_tracked_accounts_platform    ON tracked_accounts (platform);
CREATE INDEX IF NOT EXISTS idx_tracked_videos_account       ON tracked_videos (account_id);
CREATE INDEX IF NOT EXISTS idx_tracked_videos_posted_at     ON tracked_videos (posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_tracked_videos_virality      ON tracked_videos (virality_score DESC);
CREATE INDEX IF NOT EXISTS idx_video_daily_stats_video_date ON video_daily_stats (video_id, date DESC);

-- ============================================================
-- ROW LEVEL SECURITY (enable but allow all for now)
-- Tighten per-workspace policies when auth is wired up
-- ============================================================
ALTER TABLE tracked_accounts   ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracked_videos     ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_daily_stats  ENABLE ROW LEVEL SECURITY;

-- Temporary open policies (replace with workspace-scoped policies later)
CREATE POLICY "allow_all_tracked_accounts"  ON tracked_accounts  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_tracked_videos"    ON tracked_videos    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_video_daily_stats" ON video_daily_stats FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- SEED: Sample data for development (optional — comment out for prod)
-- ============================================================

-- Insert a sample tracked account
INSERT INTO tracked_accounts (platform, username, display_name, avatar_url, follower_count, total_views, avg_views, engagement_rate, last_synced_at)
VALUES
  ('tiktok',    'jake_fitness',    'Jake Fitness',       'https://api.dicebear.com/7.x/avataaars/svg?seed=jake',      1240000, 48200000, 820000, 6.80, NOW()),
  ('instagram', 'glowup_daily',    'Glow Up Daily',      'https://api.dicebear.com/7.x/avataaars/svg?seed=glow',       892000, 21500000, 340000, 4.20, NOW()),
  ('youtube',   'techreviewer',    'Tech Reviewer',      'https://api.dicebear.com/7.x/avataaars/svg?seed=tech',       560000, 92000000, 1200000, 3.50, NOW()),
  ('tiktok',    'freelife_nyc',    'Free Life NYC',      'https://api.dicebear.com/7.x/avataaars/svg?seed=free',       330000,  9800000, 290000, 5.10, NOW()),
  ('instagram', 'moneymoves22',    'Money Moves',        'https://api.dicebear.com/7.x/avataaars/svg?seed=money',      210000,  5400000, 180000, 3.90, NOW())
ON CONFLICT DO NOTHING;
