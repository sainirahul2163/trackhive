-- ──────────────────────────────────────────────────────────────────────────────
-- Migration 006: profiles table + auto-create trigger
-- ──────────────────────────────────────────────────────────────────────────────

-- 1. Create the profiles table
create table if not exists public.profiles (
  id           uuid         primary key references auth.users on delete cascade,
  full_name    text,
  email        text,
  avatar_url   text,
  company_name text,
  role         text         check (role in ('brand', 'agency', 'creator')) default 'brand',
  created_at   timestamptz  not null default now()
);

-- 2. Row-level security — users can only read/write their own profile
alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 3. Trigger: auto-create a profiles row whenever a new auth user is created
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'brand')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Drop existing trigger if it exists, then re-create
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4. Backfill profiles for any existing auth users who don't have one yet
insert into public.profiles (id, email, full_name, role)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', ''),
  coalesce(u.raw_user_meta_data->>'role', 'brand')
from auth.users u
where not exists (
  select 1 from public.profiles p where p.id = u.id
);
