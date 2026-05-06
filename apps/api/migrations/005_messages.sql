-- Migration 005: messages table (per-conversation chat history)
-- The conversations table already exists (used by conversations.py router).
-- This adds the messages table to persist individual chat turns.

CREATE TABLE IF NOT EXISTS messages (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID        NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id         UUID        NOT NULL,
  role            TEXT        NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content         TEXT        NOT NULL,
  agent_type      TEXT,                   -- 'marketing' | 'sales' | 'general' | …
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS messages_conversation_id_idx ON messages (conversation_id);
CREATE INDEX IF NOT EXISTS messages_user_id_idx         ON messages (user_id);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_own_messages" ON messages;
CREATE POLICY "users_own_messages" ON messages
  FOR ALL USING (user_id = auth.uid());

-- Keep message_count on conversations in sync
CREATE OR REPLACE FUNCTION increment_message_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE conversations
  SET message_count = message_count + 1,
      updated_at    = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS messages_increment_count ON messages;
CREATE TRIGGER messages_increment_count
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION increment_message_count();
