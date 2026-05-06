# Migrations

Run these files in order in the Supabase SQL editor
(Dashboard → SQL Editor) or via `psql`.

| File | Table(s) | Description |
|------|----------|-------------|
| 001_leads.sql | `leads` | CRM pipeline leads |
| 002_agenda.sql | `agenda_events`, `agenda_tasks` | Calendar events & tasks |
| 003_workflows.sql | `workflows` | Automation workflow builder |
| 004_scheduled_posts.sql | `scheduled_posts` | Social media publishing calendar |
| 005_messages.sql | `messages` | Per-conversation chat history |
| 006_conversations_user_id.sql | `conversations` | Add user_id column for multi-tenant isolation |
| 007_business_profiles.sql | `business_profiles` | Onboarding business profile per user |

## Notes

- All tables use `user_id UUID` for multi-tenant row isolation.
- RLS is enabled on every table. The service-role key (used server-side)
  bypasses RLS; queries are always explicitly filtered by `user_id`.
- `set_updated_at()` trigger function is created in migration 001 and
  reused by later migrations — run them in order.
- The `conversations` table is assumed to already exist (created by the
  initial Supabase setup / auth router).
