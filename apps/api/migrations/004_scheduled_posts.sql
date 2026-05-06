-- Migration 004: scheduled_posts table (social media publishing calendar)

CREATE TABLE IF NOT EXISTS scheduled_posts (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        UUID        NOT NULL,
  platform       TEXT        NOT NULL
                   CHECK (platform IN ('linkedin', 'instagram', 'facebook', 'twitter')),
  content        TEXT        NOT NULL,
  scheduled_date DATE        NOT NULL,
  scheduled_time TEXT        NOT NULL DEFAULT '10:00',  -- "HH:MM"
  status         TEXT        NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'published', 'failed')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS scheduled_posts_user_id_idx ON scheduled_posts (user_id);
CREATE INDEX IF NOT EXISTS scheduled_posts_date_idx    ON scheduled_posts (user_id, scheduled_date);

ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_own_scheduled_posts" ON scheduled_posts;
CREATE POLICY "users_own_scheduled_posts" ON scheduled_posts
  FOR ALL USING (user_id = auth.uid());
