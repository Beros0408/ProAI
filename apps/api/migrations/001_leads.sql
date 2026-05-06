-- Migration 001: leads table
-- CRM pipeline leads with multi-tenant isolation via user_id

CREATE TABLE IF NOT EXISTS leads (
  id             UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        UUID         NOT NULL,
  name           TEXT         NOT NULL,
  email          TEXT         NOT NULL DEFAULT '',
  company        TEXT         NOT NULL DEFAULT '',
  estimated_value INTEGER      NOT NULL DEFAULT 0,
  date_added     DATE         NOT NULL DEFAULT CURRENT_DATE,
  score          TEXT         NOT NULL DEFAULT 'cold'
                   CHECK (score IN ('hot', 'warm', 'cold')),
  stage          TEXT         NOT NULL DEFAULT 'nouveau'
                   CHECK (stage IN ('nouveau', 'contacte', 'negociation', 'gagne')),
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leads_user_id_idx ON leads (user_id);
CREATE INDEX IF NOT EXISTS leads_stage_idx   ON leads (user_id, stage);

-- Row-Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_own_leads" ON leads;
CREATE POLICY "users_own_leads" ON leads
  FOR ALL USING (user_id = auth.uid());

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS leads_updated_at ON leads;
CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
