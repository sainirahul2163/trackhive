-- ============================================================
-- TrackHive Trends Module - Migration 004
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: trend_videos
-- Stores discovered trending UGC videos for inspiration
-- ============================================================
CREATE TABLE IF NOT EXISTS trend_videos (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id     UUID,
  platform         TEXT NOT NULL CHECK (platform IN ('tiktok', 'instagram', 'youtube', 'facebook')),
  video_url        TEXT,
  thumbnail_url    TEXT,
  caption          TEXT,
  creator_handle   TEXT NOT NULL,
  views            BIGINT DEFAULT 0,
  likes            BIGINT DEFAULT 0,
  engagement_rate  NUMERIC(6, 2) DEFAULT 0.00,
  virality_score   NUMERIC(4, 1) DEFAULT 0.0,
  niche            TEXT CHECK (niche IN ('beauty','tech','finance','fitness','food','gaming','lifestyle','other')),
  content_format   TEXT CHECK (content_format IN ('product_demo','testimonial','lifestyle','hook_first','before_after','storytime','other')),
  posted_at        TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- TABLE: inspiration_boards
-- Curated boards for saving trend video inspiration
-- ============================================================
CREATE TABLE IF NOT EXISTS inspiration_boards (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id  UUID,
  campaign_id   UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- TABLE: board_videos
-- Join table: videos saved to boards
-- ============================================================
CREATE TABLE IF NOT EXISTS board_videos (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id   UUID NOT NULL REFERENCES inspiration_boards(id) ON DELETE CASCADE,
  video_id   UUID NOT NULL REFERENCES trend_videos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT board_videos_unique UNIQUE (board_id, video_id)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_trend_videos_workspace ON trend_videos (workspace_id);
CREATE INDEX IF NOT EXISTS idx_trend_videos_platform  ON trend_videos (platform);
CREATE INDEX IF NOT EXISTS idx_trend_videos_niche     ON trend_videos (niche);
CREATE INDEX IF NOT EXISTS idx_trend_videos_virality  ON trend_videos (virality_score DESC);
CREATE INDEX IF NOT EXISTS idx_boards_workspace       ON inspiration_boards (workspace_id);
CREATE INDEX IF NOT EXISTS idx_board_videos_board     ON board_videos (board_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE trend_videos       ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspiration_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_videos       ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_trend_videos"   ON trend_videos       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_boards"         ON inspiration_boards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_board_videos"   ON board_videos       FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- SEED: Inspiration boards
-- ============================================================
INSERT INTO inspiration_boards (name) VALUES
  ('Summer Campaign Ideas'),
  ('Hook Formulas'),
  ('Competitor Analysis')
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED: Sample trend videos
-- ============================================================
INSERT INTO trend_videos (platform, video_url, thumbnail_url, caption, creator_handle, views, likes, engagement_rate, virality_score, niche, content_format, posted_at)
VALUES
  ('tiktok',    null, null, 'I tried every protein powder for 30 days 💪 results shocked me', '@jakefit',      8400000, 620000, 7.4, 9.6, 'fitness',   'before_after',  NOW() - INTERVAL '2 days'),
  ('instagram', null, null, 'POV: You finally found a skincare routine that works ✨',          '@glowup',      5200000, 410000, 7.9, 9.1, 'beauty',    'testimonial',   NOW() - INTERVAL '3 days'),
  ('tiktok',    null, null, 'The $0 budget hack that made me $10K this month 💰',              '@moneymoves',  9800000, 780000, 8.0, 9.8, 'finance',   'hook_first',    NOW() - INTERVAL '1 day'),
  ('youtube',   null, null, 'Full MacBook Pro M4 review — 3 months later',                     '@techreviewer',3100000, 210000, 6.8, 7.2, 'tech',      'product_demo',  NOW() - INTERVAL '5 days'),
  ('tiktok',    null, null, 'What I eat in a day as a professional chef 🍳',                   '@chefsana',    4700000, 380000, 8.1, 8.4, 'food',      'lifestyle',     NOW() - INTERVAL '4 days'),
  ('instagram', null, null, 'My morning routine changed everything (storytime)',                '@lifewithalex',2800000, 190000, 6.8, 6.9, 'lifestyle', 'storytime',     NOW() - INTERVAL '6 days'),
  ('tiktok',    null, null, 'Testing viral gym hacks so you don''t have to 😤',                '@fitfails',    6600000, 520000, 7.9, 9.0, 'fitness',   'before_after',  NOW() - INTERVAL '2 days'),
  ('youtube',   null, null, 'I built a $500K Shopify store in 60 days — full breakdown',       '@ecomking',    2200000, 160000, 7.3, 7.8, 'finance',   'storytime',     NOW() - INTERVAL '7 days'),
  ('instagram', null, null, 'Rating every foundation shade from lightest to darkest 💄',       '@beautytruth',  3900000, 310000, 7.9, 8.7, 'beauty',    'product_demo',  NOW() - INTERVAL '3 days'),
  ('tiktok',    null, null, 'Day in the life of a NYC software engineer 👩‍💻',                  '@techlife',    5800000, 450000, 7.8, 8.9, 'tech',      'lifestyle',     NOW() - INTERVAL '1 day'),
  ('facebook',  null, null, 'How I paid off $80K debt in 2 years (real numbers)',              '@debtfree',    1800000, 140000, 7.8, 7.1, 'finance',   'testimonial',   NOW() - INTERVAL '8 days'),
  ('tiktok',    null, null, 'Aesthetic meal prep for the whole week 🥑',                       '@mealqueen',   7200000, 580000, 8.1, 9.3, 'food',      'hook_first',    NOW() - INTERVAL '2 days')
ON CONFLICT DO NOTHING;
