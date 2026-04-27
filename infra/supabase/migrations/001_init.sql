-- Migration 001: Schema initial ProAI
-- Extensions
create extension if not exists "uuid-ossp";

-- Organizations (tenants)
create table if not exists organizations (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  slug          text not null unique,
  plan_id       text not null default 'free',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Users
create table if not exists users (
  id              uuid primary key default uuid_generate_v4(),
  email           text not null unique,
  full_name       text not null,
  avatar_url      text,
  organization_id uuid not null references organizations(id) on delete cascade,
  role            text not null default 'member' check (role in ('owner','admin','member','viewer')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Subscriptions
create table if not exists subscriptions (
  id                     uuid primary key default uuid_generate_v4(),
  organization_id        uuid not null references organizations(id) on delete cascade,
  plan_id                text not null default 'free',
  stripe_customer_id     text,
  stripe_subscription_id text,
  status                 text not null default 'active' check (status in ('active','canceled','past_due','trialing')),
  current_period_end     timestamptz,
  created_at             timestamptz not null default now()
);

-- Workspaces
create table if not exists workspaces (
  id               uuid primary key default uuid_generate_v4(),
  organization_id  uuid not null references organizations(id) on delete cascade,
  name             text not null,
  description      text,
  business_profile jsonb not null default '{}',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  deleted_at       timestamptz
);

-- Agents
create table if not exists agents (
  id               uuid primary key default uuid_generate_v4(),
  workspace_id     uuid not null references workspaces(id) on delete cascade,
  organization_id  uuid not null references organizations(id) on delete cascade,
  name             text not null,
  agent_type       text not null default 'general' check (agent_type in ('general','marketing','sales','automation','analytics')),
  system_prompt    text,
  status           text not null default 'active' check (status in ('active','inactive','archived')),
  llm_provider     text not null default 'openai' check (llm_provider in ('openai','anthropic')),
  llm_model        text not null default 'gpt-4o',
  temperature      numeric(3,2) not null default 0.7,
  max_tokens       int not null default 2048,
  metadata         jsonb,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Conversations
create table if not exists conversations (
  id               uuid primary key default uuid_generate_v4(),
  workspace_id     uuid not null references workspaces(id) on delete cascade,
  organization_id  uuid not null references organizations(id) on delete cascade,
  title            text not null,
  agent_type       text not null default 'general',
  message_count    int not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  deleted_at       timestamptz
);

-- Messages
create table if not exists messages (
  id               uuid primary key default uuid_generate_v4(),
  conversation_id  uuid not null references conversations(id) on delete cascade,
  organization_id  uuid not null references organizations(id) on delete cascade,
  role             text not null check (role in ('user','assistant','system')),
  content          text not null,
  agent_type       text,
  tokens_used      int,
  metadata         jsonb,
  created_at       timestamptz not null default now()
);

-- Memory items (sans vecteur -- ajouté dans 003_pgvector)
create table if not exists memory_items (
  id               uuid primary key default uuid_generate_v4(),
  workspace_id     uuid not null references workspaces(id) on delete cascade,
  organization_id  uuid not null references organizations(id) on delete cascade,
  category         text not null check (category in ('BUSINESS_FACT','PREFERENCE','DECISION','PERSONA','KPI')),
  content          text not null,
  importance       int not null default 5 check (importance between 1 and 10),
  expires_at       timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  deleted_at       timestamptz
);

-- Indexes
create index if not exists idx_users_organization_id          on users(organization_id);
create index if not exists idx_workspaces_organization_id     on workspaces(organization_id);
create index if not exists idx_agents_workspace_id            on agents(workspace_id);
create index if not exists idx_conversations_workspace_id     on conversations(workspace_id);
create index if not exists idx_messages_conversation_id       on messages(conversation_id);
create index if not exists idx_memory_items_workspace_id      on memory_items(workspace_id);
create index if not exists idx_subscriptions_organization_id  on subscriptions(organization_id);
