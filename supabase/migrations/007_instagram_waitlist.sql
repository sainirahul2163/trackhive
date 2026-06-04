-- ─── 007: Instagram OAuth Waitlist ──────────────────────────────────────────
-- Stores emails of users who want to be notified when Instagram
-- direct OAuth (view counts, reach, impressions) is available.

create table if not exists public.instagram_oauth_waitlist (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  user_id    uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Index for fast lookup by email
create index if not exists idx_ig_waitlist_email
  on public.instagram_oauth_waitlist (email);

-- RLS: users can only see/insert their own entry
alter table public.instagram_oauth_waitlist enable row level security;

create policy "Users can insert their own waitlist entry"
  on public.instagram_oauth_waitlist
  for insert
  with check (auth.uid() = user_id or user_id is null);

create policy "Users can view their own waitlist entry"
  on public.instagram_oauth_waitlist
  for select
  using (auth.uid() = user_id or user_id is null);
