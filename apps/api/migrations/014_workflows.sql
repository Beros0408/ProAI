-- 014_workflows.sql
-- Fresh workflows schema. Replaces the never-applied 003_workflows.sql.
-- Uses structured trigger + steps instead of raw ReactFlow nodes/edges JSON.
-- Run in Supabase SQL Editor BEFORE deploying to production.

-- ── workflows ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS workflows (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT        NOT NULL,
  description     TEXT,
  trigger_type    TEXT        NOT NULL DEFAULT 'manual'
    CHECK (trigger_type IN ('manual', 'new_lead', 'webhook', 'scheduled', 'email_received')),
  trigger_config  JSONB       NOT NULL DEFAULT '{}',
  is_active       BOOLEAN     NOT NULL DEFAULT false,
  run_count       INTEGER     NOT NULL DEFAULT 0,
  last_run_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── workflow_steps ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS workflow_steps (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID        NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  step_order  INTEGER     NOT NULL,
  step_type   TEXT        NOT NULL
    CHECK (step_type IN ('send_email', 'send_slack', 'create_task', 'update_lead',
                         'linkedin_post', 'webhook_call', 'wait', 'condition')),
  name        TEXT,
  config      JSONB       NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_workflows_user_id    ON workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_workflows_is_active  ON workflows(is_active);
CREATE INDEX IF NOT EXISTS idx_wf_steps_workflow    ON workflow_steps(workflow_id, step_order);

-- ── RLS ───────────────────────────────────────────────────────────────────────

ALTER TABLE workflows       ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_steps  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_manage_own_workflows" ON workflows;
CREATE POLICY "users_manage_own_workflows"
  ON workflows FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_manage_own_workflow_steps" ON workflow_steps;
CREATE POLICY "users_manage_own_workflow_steps"
  ON workflow_steps FOR ALL
  USING  (auth.uid() = (SELECT user_id FROM workflows WHERE id = workflow_id))
  WITH CHECK (auth.uid() = (SELECT user_id FROM workflows WHERE id = workflow_id));

-- ── updated_at trigger ────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION workflows_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_workflows_updated_at ON workflows;
CREATE TRIGGER trg_workflows_updated_at
  BEFORE UPDATE ON workflows
  FOR EACH ROW EXECUTE FUNCTION workflows_set_updated_at();
