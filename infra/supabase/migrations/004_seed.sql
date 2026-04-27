-- Migration 004: Données de seed (développement uniquement)
-- NE PAS exécuter en production

-- Organisation démo
insert into organizations (id, name, slug, plan_id)
values (
  '00000000-0000-0000-0000-000000000001',
  'ProAI Demo',
  'proai-demo',
  'pro'
) on conflict (id) do nothing;

-- Subscription démo
insert into subscriptions (organization_id, plan_id, status, current_period_end)
values (
  '00000000-0000-0000-0000-000000000001',
  'pro',
  'active',
  now() + interval '1 year'
) on conflict do nothing;

-- Utilisateur démo (owner)
insert into users (id, email, full_name, organization_id, role)
values (
  '00000000-0000-0000-0000-000000000002',
  'demo@proai.dev',
  'Demo User',
  '00000000-0000-0000-0000-000000000001',
  'owner'
) on conflict (id) do nothing;

-- Workspace démo
insert into workspaces (id, organization_id, name, description, business_profile)
values (
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000001',
  'Mon Business',
  'Workspace de démonstration',
  '{
    "sector": "SaaS",
    "targetAudience": "PME",
    "mainObjective": "Automatiser le support client",
    "teamSize": "2-5",
    "currentTools": ["Notion", "Slack"],
    "businessSummary": "Éditeur SaaS B2B spécialisé en agents IA"
  }'::jsonb
) on conflict (id) do nothing;

-- Agent démo (marketing)
insert into agents (
  id, workspace_id, organization_id,
  name, agent_type, llm_provider, llm_model,
  system_prompt, temperature, max_tokens
)
values (
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000001',
  'Agent Marketing',
  'marketing',
  'openai',
  'gpt-4o',
  'Tu es un expert en marketing digital pour PME. Réponds de façon concise et actionnable.',
  0.7,
  2048
) on conflict (id) do nothing;

-- Conversation démo
insert into conversations (
  id, workspace_id, organization_id,
  title, agent_type, message_count
)
values (
  '00000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000001',
  'Stratégie réseaux sociaux Q2',
  'marketing',
  2
) on conflict (id) do nothing;

-- Messages démo
insert into messages (conversation_id, organization_id, role, content)
values
  (
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000001',
    'user',
    'Aide-moi à créer une stratégie LinkedIn pour le prochain trimestre.'
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000001',
    'assistant',
    'Voici une stratégie LinkedIn en 3 axes : 1) Publier 3x/semaine du contenu éducatif, 2) Engager avec 10 prospects/jour, 3) Lancer une newsletter mensuelle.'
  )
on conflict do nothing;

-- Mémoire démo
insert into memory_items (workspace_id, organization_id, category, content, importance)
values
  (
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'BUSINESS_FACT',
    'L''entreprise cible les PME de 2 à 20 employés dans le secteur SaaS',
    8
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'PREFERENCE',
    'L''utilisateur préfère des réponses courtes et actionnables, avec des listes numérotées',
    7
  )
on conflict do nothing;
