-- 010_conversations.sql

-- Conversations
CREATE TABLE IF NOT EXISTS conversations (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID NOT NULL,
  agent_type TEXT DEFAULT 'general',
  title      TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS conversations_user_id_idx ON conversations (user_id);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_own_convos" ON conversations;
CREATE POLICY "users_own_convos" ON conversations FOR ALL USING (user_id = auth.uid());

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL,
  role            TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content         TEXT NOT NULL,
  agent_type      TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS messages_convo_idx ON messages (conversation_id);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_own_msgs" ON messages;
CREATE POLICY "users_own_msgs" ON messages FOR ALL USING (user_id = auth.uid());
