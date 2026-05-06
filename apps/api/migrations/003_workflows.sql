-- Migration 003: workflows table

CREATE TABLE IF NOT EXISTS workflows (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        NOT NULL,
  name       TEXT        NOT NULL,
  active     BOOLEAN     NOT NULL DEFAULT false,
  nodes      JSONB       NOT NULL DEFAULT '[]',
  edges      JSONB       NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS workflows_user_id_idx ON workflows (user_id);

ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_own_workflows" ON workflows;
CREATE POLICY "users_own_workflows" ON workflows
  FOR ALL USING (user_id = auth.uid());

DROP TRIGGER IF EXISTS workflows_updated_at ON workflows;
CREATE TRIGGER workflows_updated_at
  BEFORE UPDATE ON workflows
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
