# ProAI -- Contexte Projet Global

## Vision
SaaS B2B multi-tenant : agents IA pour freelances, entrepreneurs et PME.

## Stack Technique
- Frontend : Next.js 14 (App Router) + Tailwind CSS + shadcn/ui + Framer Motion
- Backend  : FastAPI (Python 3.11) + LangGraph + LangChain
- Auth     : Supabase Auth (JWT + OAuth)
- DB       : PostgreSQL via Supabase + pgvector (embeddings mÃ©moire)
- Cache    : Redis (Upstash) pour sessions et rate limiting
- LLM      : OpenAI GPT-4o + Anthropic Claude (dual provider, fallback)
- Deploy   : Vercel (frontend) + Railway (backend)
- Monorepo : Turborepo + pnpm workspaces

## Structure
apps/web/        --> Next.js 14 frontend
apps/api/        --> FastAPI backend
packages/types/  --> Types TypeScript partagÃ©s
packages/ui/     --> Composants shadcn/ui partagÃ©s
infra/           --> Docker, migrations SQL Supabase
docs/            --> Documentation et fichiers de mission agents
.claude/agents/  --> Sub-agents Claude Code spÃ©cialisÃ©s

## Design Tokens
bg-base: #0A0A0F | bg-surface: #111118 | border: #1E1E2E
primary: #6366F1 | text: #E2E8F0 | muted: #64748B

## Conventions
- TypeScript strict mode, aucun any
- snake_case Python | PascalCase TypeScript/React
- Conventional Commits : feat/fix/chore(scope): description
- Variables d'env : jamais en dur, toujours dans .env
- RLS activÃ©e sur TOUTES les tables Supabase
- organization_id dans TOUTES les requetes DB (multi-tenancy)

## Ports Locaux
- Frontend : http://localhost:3000
- Backend  : http://localhost:8000
- API Docs : http://localhost:8000/docs
- DB Admin : http://localhost:54323
