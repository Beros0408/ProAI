# Migrations

Run these files **in order** in the Supabase SQL editor
(Dashboard → SQL Editor) or via `psql`.

| File | Table(s) | Description |
|------|----------|-------------|
| 001_leads.sql | `leads` | CRM leads (old schema — see 008) |
| 002_agenda.sql | `agenda_events`, `agenda_tasks` | Old schema — see 009 |
| 003_workflows.sql | `workflows` | Automation workflow builder |
| 004_scheduled_posts.sql | `scheduled_posts` | Social media publishing calendar |
| 005_messages.sql | `messages` | Per-conversation chat history |
| 006_conversations_user_id.sql | `conversations` | Add user_id column |
| 007_business_profiles.sql | `business_profiles` | Onboarding business profile |
| 008_leads.sql | `leads` | **Replaces 001** — clean schema (score INTEGER, notes) |
| 009_agenda.sql | `agenda_events`, `agenda_tasks` | **Replaces 002** — matches frontend interface (day/hour/min integers, text/done fields) |
| 010_conversations.sql | `conversations`, `messages` | **Replaces 005/006** — clean schema with agent_type |

## Fresh setup (recommended)

If starting from scratch, run only: **003, 004, 007, 008, 009, 010**

## Existing Supabase project

If tables already exist from 001/002/005/006, drop them first:

```sql
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS agenda_tasks CASCADE;
DROP TABLE IF EXISTS agenda_events CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
```

Then run **008, 009, 010**.

## Notes

- All tables use `user_id UUID` for multi-tenant row isolation.
- RLS is enabled on every table. The service-role key (used server-side)
  bypasses RLS; queries are always explicitly filtered by `user_id`.
- `set_updated_at()` trigger function is created in migration 001 and
  reused by later migrations — run it before 008 if doing fresh setup.
- The DEMO_USER (`00000000-0000-0000-0000-000000000001`) is used when
  no JWT token is present (development mode).
