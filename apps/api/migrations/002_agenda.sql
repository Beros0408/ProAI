-- Migration 002: agenda_events and agenda_tasks tables

-- ── Events ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agenda_events (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        NOT NULL,
  title       TEXT        NOT NULL,
  description TEXT        NOT NULL DEFAULT '',
  date        DATE        NOT NULL,
  start_time  TEXT        NOT NULL,   -- "HH:MM"
  end_time    TEXT        NOT NULL,   -- "HH:MM"
  reminder    TEXT        NOT NULL DEFAULT '30min'
                CHECK (reminder IN ('15min', '30min', '1h', '1j')),
  color       TEXT        NOT NULL DEFAULT '#0ea5e9',
  recurrence  TEXT        NOT NULL DEFAULT 'none'
                CHECK (recurrence IN ('none', 'daily', 'weekly', 'monthly')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS agenda_events_user_id_idx ON agenda_events (user_id);
CREATE INDEX IF NOT EXISTS agenda_events_date_idx    ON agenda_events (user_id, date);

ALTER TABLE agenda_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_own_agenda_events" ON agenda_events;
CREATE POLICY "users_own_agenda_events" ON agenda_events
  FOR ALL USING (user_id = auth.uid());

-- ── Tasks ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agenda_tasks (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        NOT NULL,
  title       TEXT        NOT NULL,
  completed   BOOLEAN     NOT NULL DEFAULT false,
  priority    TEXT        NOT NULL DEFAULT 'medium'
                CHECK (priority IN ('high', 'medium', 'low')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS agenda_tasks_user_id_idx ON agenda_tasks (user_id);

ALTER TABLE agenda_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_own_agenda_tasks" ON agenda_tasks;
CREATE POLICY "users_own_agenda_tasks" ON agenda_tasks
  FOR ALL USING (user_id = auth.uid());
