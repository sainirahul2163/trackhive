-- ============================================================
-- TrackHive Payments Module - Migration 003
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: creators
-- Stores creator profile + payment info (separate from tracked_accounts)
-- ============================================================
CREATE TABLE IF NOT EXISTS creators (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id      UUID,
  name              TEXT NOT NULL,
  email             TEXT,
  avatar_url        TEXT,
  payment_method    TEXT NOT NULL DEFAULT 'bank'
                      CHECK (payment_method IN ('paypal', 'bank', 'wise', 'crypto', 'check')),
  paypal_email      TEXT,
  bank_details      JSONB,                -- { routing, account, bank_name }
  tax_country       TEXT,
  kyc_status        TEXT NOT NULL DEFAULT 'not_started'
                      CHECK (kyc_status IN ('verified', 'pending', 'not_started', 'rejected')),
  total_earned      NUMERIC(12, 2) DEFAULT 0.00,
  total_paid        NUMERIC(12, 2) DEFAULT 0.00,
  invite_token      TEXT UNIQUE,
  invite_sent_at    TIMESTAMPTZ,
  invite_accepted   BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- TABLE: payouts
-- Individual payout records per creator per campaign
-- ============================================================
CREATE TABLE IF NOT EXISTS payouts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id    UUID,
  campaign_id     UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  creator_id      UUID REFERENCES creators(id) ON DELETE CASCADE,
  amount          NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  base_fee        NUMERIC(10, 2) DEFAULT 0.00,
  cpm_earned      NUMERIC(10, 2) DEFAULT 0.00,
  bonus           NUMERIC(10, 2) DEFAULT 0.00,
  adjustment      NUMERIC(10, 2) DEFAULT 0.00,
  adjustment_note TEXT,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'processing', 'paid', 'on_hold', 'failed')),
  payment_method  TEXT NOT NULL DEFAULT 'bank'
                    CHECK (payment_method IN ('paypal', 'bank', 'wise', 'crypto', 'check')),
  invoice_url     TEXT,
  invoice_number  TEXT,
  views_count     BIGINT DEFAULT 0,
  videos_count    INTEGER DEFAULT 0,
  paid_at         TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- TABLE: payout_rules
-- Reusable payout rule templates
-- ============================================================
CREATE TABLE IF NOT EXISTS payout_rules (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id        UUID,
  name                TEXT NOT NULL,
  base_fee            NUMERIC(10, 2) DEFAULT 0.00,
  cpm_rate            NUMERIC(8, 4) DEFAULT 0.00,
  milestone_bonus     NUMERIC(10, 2) DEFAULT 0.00,
  milestone_views     BIGINT DEFAULT 0,
  performance_cap     NUMERIC(10, 2) DEFAULT 0.00,
  payout_window_days  INTEGER DEFAULT 30,
  is_default          BOOLEAN DEFAULT FALSE,
  created_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_creators_workspace     ON creators (workspace_id);
CREATE INDEX IF NOT EXISTS idx_creators_kyc           ON creators (kyc_status);
CREATE INDEX IF NOT EXISTS idx_payouts_workspace      ON payouts (workspace_id);
CREATE INDEX IF NOT EXISTS idx_payouts_campaign       ON payouts (campaign_id);
CREATE INDEX IF NOT EXISTS idx_payouts_creator        ON payouts (creator_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status         ON payouts (status);
CREATE INDEX IF NOT EXISTS idx_payout_rules_workspace ON payout_rules (workspace_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE creators     ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_creators"     ON creators     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_payouts"      ON payouts      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_payout_rules" ON payout_rules FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- SEED: Sample payout rules
-- ============================================================
INSERT INTO payout_rules (name, base_fee, cpm_rate, milestone_bonus, milestone_views, performance_cap, payout_window_days, is_default)
VALUES
  ('Standard Creator', 150.00, 3.00, 0.00,   0,        1500.00, 30, true),
  ('Premium Creator',  300.00, 5.50, 1000.00, 1000000,  5000.00, 14, false),
  ('Budget Campaign',   75.00, 1.50, 0.00,   0,          500.00, 30, false)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED: Sample creators
-- ============================================================
INSERT INTO creators (name, email, payment_method, paypal_email, kyc_status, total_earned, total_paid)
VALUES
  ('Jake Fitness',   'jake@jakefit.com',    'paypal', 'jake@jakefit.com',    'verified',    24800.00, 21000.00),
  ('Glow Up Daily',  'hello@glowup.co',     'bank',   null,                  'verified',    12400.00, 10500.00),
  ('Tech Reviewer',  'contact@techrev.io',  'wise',   null,                  'pending',      8600.00,  7200.00),
  ('Free Life NYC',  'mel@freelifenyc.com', 'paypal', 'mel@freelifenyc.com', 'verified',     6200.00,  5800.00),
  ('Money Moves',    'info@moneymoves.co',  'bank',   null,                  'not_started',  3100.00,     0.00)
ON CONFLICT DO NOTHING;
