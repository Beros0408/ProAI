-- Migration 008: leads table (clean schema — drop old 001 schema if needed)

CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  company TEXT,
  stage TEXT DEFAULT 'new',
  score INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS leads_user_id_idx ON leads (user_id);
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_own_leads" ON leads;
CREATE POLICY "users_own_leads" ON leads FOR ALL USING (user_id = auth.uid());
DROP TRIGGER IF EXISTS leads_updated_at ON leads;
CREATE TRIGGER leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION set_updated_at();
