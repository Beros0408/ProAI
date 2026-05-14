-- 013_crm_leads.sql
-- Fresh CRM leads table. Replaces the never-applied 001/008/012 leads
-- migrations. Run this in the Supabase SQL Editor.

-- ── Table ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS crm_leads (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Identity
  name            TEXT          NOT NULL,
  email           TEXT,
  phone           TEXT,

  -- Professional
  company         TEXT,
  job_title       TEXT,
  linkedin_url    TEXT,
  website_url     TEXT,

  -- Pipeline (Kanban column)
  stage           TEXT          NOT NULL DEFAULT 'nouveau'
    CHECK (stage IN ('nouveau', 'contacte', 'negociation', 'gagne')),

  -- Opportunity
  estimated_value DECIMAL(12,2) NOT NULL DEFAULT 0,
  source          TEXT
    CHECK (source IN ('linkedin', 'website', 'referral', 'event', 'other')),
  status          TEXT          NOT NULL DEFAULT 'to_contact'
    CHECK (status IN ('to_contact', 'contacted', 'qualified', 'won', 'lost')),
  score           INTEGER       NOT NULL DEFAULT 50
    CHECK (score >= 0 AND score <= 100),

  -- Follow-up
  notes           TEXT,
  tags            TEXT[]        DEFAULT '{}',
  next_contact_at TIMESTAMPTZ,

  -- Metadata
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_crm_leads_user_id     ON crm_leads(user_id);
CREATE INDEX IF NOT EXISTS idx_crm_leads_user_stage  ON crm_leads(user_id, stage);
CREATE INDEX IF NOT EXISTS idx_crm_leads_status      ON crm_leads(status);
CREATE INDEX IF NOT EXISTS idx_crm_leads_score       ON crm_leads(score DESC);
CREATE INDEX IF NOT EXISTS idx_crm_leads_next_contact ON crm_leads(next_contact_at);
CREATE INDEX IF NOT EXISTS idx_crm_leads_created     ON crm_leads(created_at DESC);

-- ── Row-Level Security ────────────────────────────────────────────────────────

ALTER TABLE crm_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_manage_own_crm_leads" ON crm_leads;
CREATE POLICY "users_manage_own_crm_leads"
  ON crm_leads FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── updated_at trigger ────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION crm_leads_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_crm_leads_updated_at ON crm_leads;
CREATE TRIGGER trg_crm_leads_updated_at
  BEFORE UPDATE ON crm_leads
  FOR EACH ROW EXECUTE FUNCTION crm_leads_set_updated_at();
