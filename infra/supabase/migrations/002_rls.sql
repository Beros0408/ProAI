-- Migration 002: Row Level Security (multi-tenancy)
-- Toutes les tables sont isolées par organization_id via le JWT Supabase

-- Helper: extraire organization_id depuis le JWT
create or replace function auth.organization_id() returns uuid as $$
  select (auth.jwt() ->> 'organization_id')::uuid;
$$ language sql stable;

-- ============================================================
-- organizations
-- ============================================================
alter table organizations enable row level security;

create policy "org: membres voient leur org" on organizations
  for select using (id = auth.organization_id());

create policy "org: owner peut modifier" on organizations
  for update using (
    id = auth.organization_id()
    and exists (
      select 1 from users
      where users.organization_id = organizations.id
        and users.id = auth.uid()
        and users.role = 'owner'
    )
  );

-- ============================================================
-- users
-- ============================================================
alter table users enable row level security;

create policy "users: voir les membres de sa org" on users
  for select using (organization_id = auth.organization_id());

create policy "users: modifier son propre profil" on users
  for update using (id = auth.uid());

-- ============================================================
-- subscriptions
-- ============================================================
alter table subscriptions enable row level security;

create policy "subscriptions: voir sa subscription" on subscriptions
  for select using (organization_id = auth.organization_id());

-- ============================================================
-- workspaces
-- ============================================================
alter table workspaces enable row level security;

create policy "workspaces: select" on workspaces
  for select using (organization_id = auth.organization_id() and deleted_at is null);

create policy "workspaces: insert" on workspaces
  for insert with check (organization_id = auth.organization_id());

create policy "workspaces: update" on workspaces
  for update using (organization_id = auth.organization_id());

create policy "workspaces: soft-delete" on workspaces
  for update using (organization_id = auth.organization_id());

-- ============================================================
-- agents
-- ============================================================
alter table agents enable row level security;

create policy "agents: select" on agents
  for select using (organization_id = auth.organization_id());

create policy "agents: insert" on agents
  for insert with check (organization_id = auth.organization_id());

create policy "agents: update" on agents
  for update using (organization_id = auth.organization_id());

create policy "agents: delete" on agents
  for delete using (organization_id = auth.organization_id());

-- ============================================================
-- conversations
-- ============================================================
alter table conversations enable row level security;

create policy "conversations: select" on conversations
  for select using (organization_id = auth.organization_id() and deleted_at is null);

create policy "conversations: insert" on conversations
  for insert with check (organization_id = auth.organization_id());

create policy "conversations: update" on conversations
  for update using (organization_id = auth.organization_id());

-- ============================================================
-- messages
-- ============================================================
alter table messages enable row level security;

create policy "messages: select" on messages
  for select using (organization_id = auth.organization_id());

create policy "messages: insert" on messages
  for insert with check (organization_id = auth.organization_id());

-- ============================================================
-- memory_items
-- ============================================================
alter table memory_items enable row level security;

create policy "memory: select" on memory_items
  for select using (organization_id = auth.organization_id() and deleted_at is null);

create policy "memory: insert" on memory_items
  for insert with check (organization_id = auth.organization_id());

create policy "memory: update" on memory_items
  for update using (organization_id = auth.organization_id());
