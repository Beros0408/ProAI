-- Migration 007: business_profiles table
-- Stores the onboarding business profile per user.
-- user_id is UNIQUE so each user has at most one profile (upsert pattern).

CREATE TABLE IF NOT EXISTS business_profiles (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID        UNIQUE NOT NULL,
  business_name    TEXT,
  sector           TEXT,
  target_audience  TEXT,
  main_objective   TEXT,
  company_size     TEXT,
  current_tools    TEXT,
  business_summary TEXT,          -- AI-generated summary
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS business_profiles_user_id_idx ON business_profiles (user_id);

ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_own_profile" ON business_profiles;
CREATE POLICY "users_own_profile" ON business_profiles
  FOR ALL USING (user_id = auth.uid());

-- Reuse the set_updated_at() trigger created in 001_leads.sql
DROP TRIGGER IF EXISTS business_profiles_updated_at ON business_profiles;
CREATE TRIGGER business_profiles_updated_at
  BEFORE UPDATE ON business_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
