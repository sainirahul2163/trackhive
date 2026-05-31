-- ============================================================
-- TrackHive Campaigns Module - Migration 002
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: campaigns
-- ============================================================
CREATE TABLE IF NOT EXISTS campaigns (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id    UUID,
  name            TEXT NOT NULL,
  brand           TEXT,
  status          TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  start_date      DATE,
  end_date        DATE,
  target_views    BIGINT DEFAULT 0,
  target_videos   INTEGER DEFAULT 0,
  total_views     BIGINT DEFAULT 0,
  total_videos    INTEGER DEFAULT 0,
  total_payout    NUMERIC(12, 2) DEFAULT 0.00,
  -- payout rules (stored inline for simplicity)
  base_fee        NUMERIC(10, 2) DEFAULT 0.00,
  cpm_rate        NUMERIC(8, 4) DEFAULT 0.00,
  milestone_bonus NUMERIC(10, 2) DEFAULT 0.00,
  performance_cap NUMERIC(10, 2) DEFAULT 0.00,
  payout_window   INTEGER DEFAULT 30,          -- days
  brief           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- TABLE: campaign_creators
-- Joins a campaign to a tracked_account
-- ============================================================
CREATE TABLE IF NOT EXISTS campaign_creators (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id     UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  account_id      UUID NOT NULL REFERENCES tracked_accounts(id) ON DELETE CASCADE,
  status          TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'behind_schedule', 'completed', 'removed')),
  videos_posted   INTEGER DEFAULT 0,
  views_delivered BIGINT DEFAULT 0,
  payout_earned   NUMERIC(10, 2) DEFAULT 0.00,
  payout_status   TEXT NOT NULL DEFAULT 'pending'
                    CHECK (payout_status IN ('pending', 'approved', 'on_hold', 'paid')),
  last_posted_at  TIMESTAMPTZ,
  joined_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT campaign_creators_unique UNIQUE (campaign_id, account_id)
);

-- ============================================================
-- TABLE: campaign_alerts
-- ============================================================
CREATE TABLE IF NOT EXISTS campaign_alerts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('warning', 'info', 'success', 'error')),
  message     TEXT NOT NULL,
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_campaigns_workspace   ON campaigns (workspace_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status      ON campaigns (status);
CREATE INDEX IF NOT EXISTS idx_campaign_creators_campaign ON campaign_creators (campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_creators_account  ON campaign_creators (account_id);
CREATE INDEX IF NOT EXISTS idx_campaign_alerts_campaign   ON campaign_alerts (campaign_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE campaigns         ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_alerts   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_campaigns"         ON campaigns         FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_campaign_creators" ON campaign_creators FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_campaign_alerts"   ON campaign_alerts   FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- SEED: Sample campaigns
-- ============================================================
INSERT INTO campaigns (name, brand, status, start_date, end_date, target_views, target_videos, total_views, total_videos, total_payout, base_fee, cpm_rate, payout_window)
VALUES
  ('Summer Drop 2024',       'ProteinPro',   'active',    '2024-06-01', '2024-07-31', 5000000, 20, 3240000, 12, 14800.00, 200.00, 4.50, 30),
  ('GadgetHive Q2',          'GadgetHive',   'active',    '2024-05-01', '2024-06-30', 3000000, 15, 1820000,  8,  9200.00, 150.00, 3.00, 14),
  ('Creator Life Series',    'Freelance Hub','paused',    '2024-04-01', '2024-05-31', 2000000, 10,  920000,  6,  4100.00, 100.00, 2.50, 30),
  ('Glow Summer Campaign',   'GlowBeauty',   'completed', '2024-03-01', '2024-04-30', 4000000, 18, 4280000, 19, 21500.00, 250.00, 5.00, 30),
  ('FinanceApp Pro Launch',  'FinanceApp',   'draft',     '2024-07-15', '2024-08-31', 6000000, 25,       0,  0,      0.00, 300.00, 6.00, 30)
ON CONFLICT DO NOTHING;
