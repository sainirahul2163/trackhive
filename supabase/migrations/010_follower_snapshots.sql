-- Daily follower count history per tracked account (for Follower Growth chart)

CREATE TABLE IF NOT EXISTS follower_snapshots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id      UUID NOT NULL REFERENCES tracked_accounts(id) ON DELETE CASCADE,
  follower_count  INTEGER NOT NULL,
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (account_id, date)
);

CREATE INDEX IF NOT EXISTS idx_follower_snapshots_account_date
  ON follower_snapshots (account_id, date DESC);

ALTER TABLE follower_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_follower_snapshots"
  ON follower_snapshots FOR ALL USING (true) WITH CHECK (true);
