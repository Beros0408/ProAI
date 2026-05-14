-- 012_crm_enrich.sql
-- Enrich the leads table: convert score TEXT→INTEGER + add 9 new columns

-- 1. Drop the existing CHECK constraint on score
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_score_check;

-- 2. Convert score column from TEXT (hot/warm/cold) to INTEGER (0-100)
ALTER TABLE leads ALTER COLUMN score TYPE INTEGER
  USING CASE score
    WHEN 'hot'  THEN 85
    WHEN 'warm' THEN 50
    WHEN 'cold' THEN 25
    ELSE 50
  END;

ALTER TABLE leads ALTER COLUMN score SET DEFAULT 50;
ALTER TABLE leads ADD CONSTRAINT leads_score_num_check CHECK (score >= 0 AND score <= 100);

-- 3. New columns
ALTER TABLE leads ADD COLUMN IF NOT EXISTS notes           TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS phone           TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS job_title       TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS source          TEXT
  CHECK (source IN ('linkedin', 'website', 'referral', 'event', 'other'));
ALTER TABLE leads ADD COLUMN IF NOT EXISTS status          TEXT
  CHECK (status IN ('to_contact', 'contacted', 'qualified', 'won', 'lost'))
  DEFAULT 'to_contact';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS next_contact_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS linkedin_url    TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS website_url     TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS tags            TEXT[];

-- 4. Indexes for frequent queries
CREATE INDEX IF NOT EXISTS idx_leads_score        ON leads(score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status       ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_next_contact ON leads(next_contact_at);
