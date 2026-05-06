-- Migration 009: agenda_events and agenda_tasks (matches frontend CalEvent/Task interfaces)

CREATE TABLE IF NOT EXISTS agenda_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  day INTEGER,
  start_hour INTEGER,
  start_min INTEGER DEFAULT 0,
  end_hour INTEGER,
  end_min INTEGER DEFAULT 0,
  type TEXT DEFAULT 'meeting',
  icon TEXT DEFAULT 'video',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS agenda_events_user_id_idx ON agenda_events (user_id);
ALTER TABLE agenda_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_own_events" ON agenda_events;
CREATE POLICY "users_own_events" ON agenda_events FOR ALL USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS agenda_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  text TEXT NOT NULL,
  done BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS agenda_tasks_user_id_idx ON agenda_tasks (user_id);
ALTER TABLE agenda_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_own_tasks" ON agenda_tasks;
CREATE POLICY "users_own_tasks" ON agenda_tasks FOR ALL USING (user_id = auth.uid());
