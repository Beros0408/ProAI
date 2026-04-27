-- Migration 003: pgvector -- embeddings mémoire sémantique
create extension if not exists vector;

-- Colonne embedding sur memory_items (text-embedding-3-small = 1536 dims)
alter table memory_items
  add column if not exists embedding vector(1536);

-- Index HNSW pour recherche ANN rapide
create index if not exists idx_memory_items_embedding
  on memory_items
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

-- Table dédiée pour les embeddings de messages (RAG sur historique)
create table if not exists message_embeddings (
  id               uuid primary key default uuid_generate_v4(),
  message_id       uuid not null references messages(id) on delete cascade,
  organization_id  uuid not null references organizations(id) on delete cascade,
  workspace_id     uuid not null references workspaces(id) on delete cascade,
  embedding        vector(1536) not null,
  created_at       timestamptz not null default now()
);

create index if not exists idx_msg_embeddings_embedding
  on message_embeddings
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

create index if not exists idx_msg_embeddings_workspace
  on message_embeddings(workspace_id);

-- RLS sur message_embeddings
alter table message_embeddings enable row level security;

create policy "msg_embeddings: select" on message_embeddings
  for select using (organization_id = auth.organization_id());

create policy "msg_embeddings: insert" on message_embeddings
  for insert with check (organization_id = auth.organization_id());

-- Fonction utilitaire: recherche sémantique dans la mémoire
create or replace function search_memory(
  query_embedding vector(1536),
  p_workspace_id  uuid,
  match_count     int default 5,
  min_similarity  float default 0.7
)
returns table (
  id          uuid,
  content     text,
  category    text,
  importance  int,
  similarity  float
)
language sql stable as $$
  select
    m.id,
    m.content,
    m.category,
    m.importance,
    1 - (m.embedding <=> query_embedding) as similarity
  from memory_items m
  where
    m.workspace_id = p_workspace_id
    and m.deleted_at is null
    and m.embedding is not null
    and 1 - (m.embedding <=> query_embedding) >= min_similarity
  order by m.embedding <=> query_embedding
  limit match_count;
$$;
