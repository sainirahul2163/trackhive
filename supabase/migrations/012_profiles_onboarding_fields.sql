-- Onboarding fields for profiles (company website + alert preferences)

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS alert_method text DEFAULT 'email'
    CHECK (alert_method IN ('email', 'slack', 'discord')),
  ADD COLUMN IF NOT EXISTS discord_webhook text;
