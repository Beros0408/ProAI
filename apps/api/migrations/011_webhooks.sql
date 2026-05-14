-- 011_webhooks.sql
-- Universal Webhook System: tokens, events, rules

CREATE TABLE IF NOT EXISTS webhook_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token       TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_webhook_tokens_user_id ON webhook_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_tokens_token   ON webhook_tokens(token);

CREATE TABLE IF NOT EXISTS webhook_events (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_token_id UUID NOT NULL REFERENCES webhook_tokens(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_ip        TEXT,
  payload          JSONB NOT NULL,
  headers          JSONB,
  status           TEXT CHECK (status IN ('received', 'processing', 'completed', 'failed')) NOT NULL DEFAULT 'received',
  agent_triggered  TEXT,
  agent_response   TEXT,
  error_message    TEXT,
  received_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_token_id ON webhook_events(webhook_token_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_user_id  ON webhook_events(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_received ON webhook_events(received_at DESC);

CREATE TABLE IF NOT EXISTS webhook_rules (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_token_id UUID NOT NULL REFERENCES webhook_tokens(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id         TEXT NOT NULL,
  condition_field  TEXT,
  condition_value  TEXT,
  enabled          BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_rules_token_id ON webhook_rules(webhook_token_id);
CREATE INDEX IF NOT EXISTS idx_webhook_rules_user_id  ON webhook_rules(user_id);

-- RLS
ALTER TABLE webhook_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_rules  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_manage_own_webhook_tokens" ON webhook_tokens;
CREATE POLICY "users_manage_own_webhook_tokens"
  ON webhook_tokens FOR ALL
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_view_own_webhook_events" ON webhook_events;
CREATE POLICY "users_view_own_webhook_events"
  ON webhook_events FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_manage_own_webhook_rules" ON webhook_rules;
CREATE POLICY "users_manage_own_webhook_rules"
  ON webhook_rules FOR ALL
  USING (auth.uid() = user_id);
