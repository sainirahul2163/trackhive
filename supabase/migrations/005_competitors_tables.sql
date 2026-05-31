-- ============================================================
-- TrackHive Competitor Intelligence Module - Migration 005
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: competitors
-- Top-level brand competitor record
-- ============================================================
CREATE TABLE IF NOT EXISTS competitors (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id  UUID,
  name          TEXT NOT NULL,
  website       TEXT,
  logo_url      TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- TABLE: competitor_accounts
-- Social media accounts belonging to a competitor brand
-- ============================================================
CREATE TABLE IF NOT EXISTS competitor_accounts (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competitor_id     UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  platform          TEXT NOT NULL CHECK (platform IN ('tiktok', 'instagram', 'youtube', 'facebook')),
  username          TEXT NOT NULL,
  avatar_url        TEXT,
  follower_count    BIGINT DEFAULT 0,
  total_views       BIGINT DEFAULT 0,
  avg_views         BIGINT DEFAULT 0,
  posting_frequency NUMERIC(4, 1) DEFAULT 0,   -- videos per week
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- TABLE: competitor_videos
-- Videos posted by competitor accounts
-- ============================================================
CREATE TABLE IF NOT EXISTS competitor_videos (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competitor_account_id UUID NOT NULL REFERENCES competitor_accounts(id) ON DELETE CASCADE,
  platform              TEXT NOT NULL CHECK (platform IN ('tiktok', 'instagram', 'youtube', 'facebook')),
  video_url             TEXT,
  thumbnail_url         TEXT,
  caption               TEXT,
  views                 BIGINT DEFAULT 0,
  likes                 BIGINT DEFAULT 0,
  engagement_rate       NUMERIC(6, 2) DEFAULT 0.00,
  content_format        TEXT CHECK (content_format IN ('product_demo','testimonial','lifestyle','hook_first','before_after','storytime','other')),
  posted_at             TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- TABLE: competitor_creators
-- Creators spotted working with a competitor brand
-- ============================================================
CREATE TABLE IF NOT EXISTS competitor_creators (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competitor_id     UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  account_id        UUID REFERENCES tracked_accounts(id) ON DELETE SET NULL,
  creator_handle    TEXT NOT NULL,
  platform          TEXT NOT NULL CHECK (platform IN ('tiktok', 'instagram', 'youtube', 'facebook')),
  avatar_url        TEXT,
  follower_count    BIGINT DEFAULT 0,
  avg_views         BIGINT DEFAULT 0,
  videos_posted     INTEGER DEFAULT 0,
  status            TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  flagged_outreach  BOOLEAN DEFAULT FALSE,
  first_seen_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_seen_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- TABLE: ai_reports
-- Weekly AI-generated intelligence reports per competitor
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_reports (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id     UUID,
  competitor_id    UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  week_of          DATE NOT NULL,
  summary          TEXT,
  top_videos       JSONB,          -- array of {url, views, caption}
  recommendations  JSONB,          -- array of recommendation strings
  created_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_competitors_workspace         ON competitors (workspace_id);
CREATE INDEX IF NOT EXISTS idx_competitor_accounts_competitor ON competitor_accounts (competitor_id);
CREATE INDEX IF NOT EXISTS idx_competitor_videos_account     ON competitor_videos (competitor_account_id);
CREATE INDEX IF NOT EXISTS idx_competitor_videos_posted      ON competitor_videos (posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_competitor_creators_competitor ON competitor_creators (competitor_id);
CREATE INDEX IF NOT EXISTS idx_ai_reports_competitor         ON ai_reports (competitor_id, week_of DESC);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE competitors          ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_accounts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_videos    ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_creators  ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_reports           ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_competitors"         ON competitors          FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_competitor_accounts" ON competitor_accounts  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_competitor_videos"   ON competitor_videos    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_competitor_creators" ON competitor_creators  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_ai_reports"          ON ai_reports           FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- SEED: 3 sample competitors
-- ============================================================
WITH comp AS (
  INSERT INTO competitors (name, website) VALUES
    ('GrowthBrands Co',  'https://growthbrands.co'),
    ('ViralPush Inc',    'https://viralpush.com'),
    ('NexGen Creator',   'https://nexgencreator.io')
  RETURNING id, name
)
INSERT INTO competitor_accounts (competitor_id, platform, username, follower_count, total_views, avg_views, posting_frequency)
SELECT
  c.id,
  acc.platform,
  acc.username,
  acc.follower_count,
  acc.total_views,
  acc.avg_views,
  acc.posting_frequency
FROM comp c
JOIN (VALUES
  ('GrowthBrands Co',  'tiktok',    '@growthbrands_tt',  890000,  42000000, 680000, 4.2),
  ('GrowthBrands Co',  'instagram', '@growthbrands',      640000,  18000000, 290000, 2.8),
  ('ViralPush Inc',    'tiktok',    '@viralpush',        1200000,  78000000, 920000, 6.1),
  ('ViralPush Inc',    'youtube',   '@viralpush_yt',      380000,  24000000, 410000, 1.5),
  ('NexGen Creator',   'instagram', '@nexgencreator',     520000,  14000000, 220000, 3.4),
  ('NexGen Creator',   'tiktok',    '@nexgen_tt',         310000,   9000000, 180000, 2.9)
) AS acc(comp_name, platform, username, follower_count, total_views, avg_views, posting_frequency)
ON c.name = acc.comp_name;
