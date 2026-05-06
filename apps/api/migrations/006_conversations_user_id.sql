-- Migration 006: add user_id to conversations table
-- conversations was created by the initial Supabase auth setup;
-- this patch adds multi-tenant user isolation matching all other tables.

ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS user_id UUID;

-- Back-fill existing rows with the demo user so NOT NULL can be enforced.
UPDATE conversations
  SET user_id = '00000000-0000-0000-0000-000000000001'
  WHERE user_id IS NULL;

ALTER TABLE conversations
  ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE conversations
  ALTER COLUMN user_id SET DEFAULT '00000000-0000-0000-0000-000000000001';

CREATE INDEX IF NOT EXISTS conversations_user_id_idx ON conversations (user_id);

-- Extend RLS so users see only their own conversations.
-- (The service-role key bypasses RLS; all server queries also filter .eq("user_id", uid).)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_own_conversations" ON conversations;
CREATE POLICY "users_own_conversations" ON conversations
  FOR ALL USING (user_id = auth.uid());
