# Mission Agent Frontend -- ProAI

## Livrables attendus
1. apps/web/app/ -- Layout root, pages auth, onboarding, dashboard, chat
2. apps/web/components/layout/ -- Sidebar, Header
3. apps/web/components/chat/ -- ChatContainer, ChatMessage, ChatInput, AgentBadge
4. apps/web/components/dashboard/ -- TodayActions, AgentStatus, KPICard, ActivityFeed
5. apps/web/components/onboarding/ -- OnboardingWizard + 5 steps
6. apps/web/hooks/ -- useChat, useSSE, useUser, useWorkspace
7. apps/web/lib/ -- supabase/client, supabase/server, api, utils
8. apps/web/middleware.ts -- Protection des routes
9. apps/web/Dockerfile

## Validation
cd apps/web && pnpm install && pnpm dev
# -> http://localhost:3000
