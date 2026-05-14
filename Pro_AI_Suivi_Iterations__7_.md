# ProAI — Suivi des Iterations

Derniere mise a jour: 14 mai 2026
Auteur: Beros (Kabeya Bernard)
Iteration en cours: IT-022 TERMINEE

---

## Iteration IT-020 — Deploiement Production

### Periode
- Debut: 11 mai 2026
- Fin: 13 mai 2026
- Statut: TERMINEE - ProAI est en production et fonctionnel

### Objectif
Deployer ProAI en production complete avec frontend Vercel et backend
Railway operationnels, connectes et accessibles publiquement.

---

## Bilan IT-020

- Bugs resolus: 9
- Bugs en cours: 0
- Backend Railway: Active (proaiweb-production.up.railway.app)
- Frontend Vercel: Ready (proai-saas.vercel.app)
- Auth production: Fonctionnelle
- Chat IA production: Operationnel
- Personnalisation: Contexte utilisateur integre
- Agents IA: 7 agents fonctionnels

---

## Realisations IT-020

### Frontend (apps/web)

1. Icone n8n corrigee (SVG officiel Wikimedia)
2. Mode Warm: 65 occurrences de couleurs hardcodees corrigees dans 20 fichiers
3. Next.js 14.2.0 vers 14.2.35 (CVE-2025-55184 et CVE-2025-67779 resolues)
4. Variable NEXT_PUBLIC_API_URL: .env.production cree et commite

### Backend (apps/api)

5. Preparation Railway: requirements.txt, Dockerfile, railway.toml
6. Audit exhaustif des dependances Python: ajout email-validator, langchain core, langchain-openai, langchain-anthropic
7. Backend Railway deploye et actif: /health renvoie {"status":"ok"}
8. 18 variables d'environnement configurees et validees

### Infrastructure

9. Frontend Vercel deploye et accessible
10. Variables Railway/Vercel auditees et corrigees (plusieurs etaient corrompues)
11. Variables critiques validees: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL, OPENAI_API_KEY, SECRET_KEY

### Agents IA

12. Bug TikTok corrige sur l'agent social_media (ajout hooks 3 secondes, formats viraux, hashtags, algorithme, calendrier)
13. Audit des 6 autres agents: aucun bug type TikTok detecte
14. 2 points d'amelioration mineurs identifies (reportes au backlog):
    - Sales: fallback a ameliorer si pas de donnees CRM injectees
    - Communication: clarifier l'ambiguite du mot "scripts" (email vs telephone)

---

## Commits IT-020

- c0218f1  fix(agents): add TikTok expertise to social_media agent
- 9e05995  fix(web): use NEXT_PUBLIC_API_URL instead of hardcoded localhost
- df43358  fix(api): add all missing runtime dependencies for production
- 7cbda5f  fix(api): add email-validator dependency for Pydantic EmailStr
- 77da232  chore(railway): force snapshot refresh
- 3eace38  trigger: force Railway redeploy
- a12e999  fix(security): upgrade Next.js to fix CVE-2025-55184 + CVE-2025-67779
- e38e0e4  feat(api): prepare backend for Railway deployment
- bd89acd  fix(theme): replace hardcoded inline styles

9 commits, 0 regression, MVP en ligne.

---

## Backlog post IT-020

### Priorite haute

1. Webhook Stripe a configurer
   - URL: https://proaiweb-production.up.railway.app/billing/webhook
   - Recuperer STRIPE_WEBHOOK_SECRET reel et mettre a jour Railway
   - Test parcours de paiement complet (carte test 4242 4242 4242 4242)

2. Test des autres fonctionnalites en production
   - CRM Kanban
   - Workflow builder
   - Scheduling calendar
   - Notifications
   - Reports & analytics
   - Predictions

3. Agent Juridique (nouveau, demande par Beros)
   - Creer apps/api/agents/legal.py
   - Mapping backend, carte frontend, traductions FR/EN
   - Disclaimer obligatoire (informations generales, pas conseil juridique)
   - Perimetre a definir (droit francais/europeen ?)
   - Domaines possibles: droit des societes, RGPD, contrats, droit du travail, fiscalite

### Priorite moyenne

4. Amelioration agent Sales: fallback explicite si pas de donnees CRM
5. Amelioration agent Communication: redirection vers Sales pour scripts d'appel
6. Bug dev local TypeError webpack sur localhost:3000
7. Google OAuth Supabase (optionnel)
8. SMTP transactionnel pour emails
9. Permissions micro et Web Speech API

### Priorite basse

10. Mode PWA pleinement active
11. Favicon .ico legacy
12. Monitoring Sentry (SENTRY_DSN actuellement vide)

---

## URLs

- Frontend prod: https://proai-saas.vercel.app
- Backend prod: https://proaiweb-production.up.railway.app
- Health check: https://proaiweb-production.up.railway.app/health
- GitHub: https://github.com/Beros0408/ProAI
- Supabase ref: jdjuzavfgvfgexkluszd
- Railway: poetic-passion / @proai/web
- Vercel admin: https://vercel.com/beros0408s-projects/proai-saas
- Stripe: Mode TEST (sk_test_, pk_test_)

---

## Iteration IT-021 a demarrer

1. Configurer le webhook Stripe en production
2. Test complet du parcours de paiement
3. Test exhaustif des fonctionnalites principales en prod
4. Mise en place de l'agent Juridique
5. Ameliorations mineures Sales et Communication

---

## Iteration IT-022 — Webhook Universel + CRM Premium (14 mai 2026)

### Periode
- Debut: 14 mai 2026
- Fin: 14 mai 2026
- Statut: TERMINEE

### Objectif
Construire deux fonctionnalites majeures en une seule journee :
un systeme de webhooks universels permettant a ProAI de recevoir des
evenements de n'importe quel outil externe, et un CRM premium avec
persistence reelle en base de donnees.

---

## Bilan IT-022

- Commits livres: 5
- Bugs corriges: 1 (auth JWT 403)
- Nouvelles tables DB: 4 (webhook_tokens, webhook_events, webhook_rules, crm_leads)
- Nouveaux endpoints backend: 11 (webhooks) + 6 (crm enrichi)
- Nouveaux composants frontend: 6

---

## Realisations IT-022

### 1. Webhook Universel (systeme complet)

**Migration 011_webhooks.sql**
- Table webhook_tokens : URL unique par utilisateur avec token UUID
- Table webhook_events : log de tous les evenements recus avec payload JSON
- Table webhook_rules : regles de routage vers les agents IA
- RLS activee sur toutes les tables, trigger updated_at

**Backend apps/api/routers/webhooks.py**
- POST /api/v1/webhook/{token} : endpoint PUBLIC, pas d'auth JWT, 100 req/min
- Reponse < 100ms garantie via FastAPI BackgroundTasks
- Rate limiter en memoire (dict keyed par token)
- GET/POST /api/v1/webhooks : liste et creation (auth stricte)
- PATCH/DELETE /api/v1/webhooks/{id} : mise a jour et suppression
- GET /api/v1/webhooks/{id}/events : historique pagine
- POST /api/v1/webhooks/{id}/test : evenement synthetique de test
- GET/POST/DELETE /api/v1/webhooks/{id}/rules : regles de routage

**Service apps/api/services/webhook_processor.py**
- Traitement asynchrone : charge evenement, cherche regles, appelle LLM
- Support Claude Haiku (priorite) et OpenAI GPT-4o-mini (fallback)
- Match de conditions en notation point (ex: payload.action = "submitted")
- Creation de notification Supabase en best-effort

**Frontend apps/web**
- WebhookCard.tsx : affiche URL, copie, test, toggle actif/inactif, suppression
- WebhookCreateModal.tsx : formulaire nom + description
- WebhookEventsHistory.tsx : historique pagine avec payload expandable
- WebhookRulesEditor.tsx : editeur de regles avec champ condition dot-notation
- IntegrationComingSoonCard.tsx : carte "bientot disponible" avec glow
- WebhookIntegrationTutorial.tsx : guides pas-a-pas Tally, Zapier, n8n, Make
- Page Integrations : 3 sections (webhooks, natifs bientot, CTA agent)

### 2. Correction Auth JWT 403

**Probleme** : POST /api/v1/webhooks retournait 403 "Not authenticated"
en raison de @supabase/ssr v0.3.x dont getSession() renvoie null en production.

**Fix apps/web/lib/api.ts**
- Client Supabase singleton pour eviter les races sur auth state
- getAuthHeaders() : tentative getSession() puis fallback readStoredToken()
- readStoredToken() : lit localStorage (supabase-js) OU cookies chunkes (@supabase/ssr)
- WebhookCard : remplacement du fetch nu par api.post() pour beneficier du fallback

### 3. CRM Premium (persistence DB reelle)

**Diagnostic** : la table leads des migrations 001/008 n'avait jamais ete
appliquee dans Supabase. Migration 012_crm_enrich.sql (ALTER sur leads
inexistant) invalide.

**Migration 013_crm_leads.sql (table reconstruite de zero)**
- Champs identite : name, email, phone
- Champs professionnels : company, job_title, linkedin_url, website_url
- Pipeline Kanban : stage CHECK (nouveau/contacte/negociation/gagne)
- Opportunite : estimated_value DECIMAL(12,2), source, status, score 0-100
- Suivi : notes, tags TEXT[], next_contact_at TIMESTAMPTZ
- RLS policy users_manage_own_crm_leads
- Trigger trg_crm_leads_updated_at
- 6 index (user_id, user+stage, status, score, next_contact, created_at)

**Backend apps/api/routers/crm.py**
- TABLE = "crm_leads" (etait "leads" — table inexistante)
- estimated_value : int -> float (DECIMAL en DB)
- updated_at dans le modele de reponse Lead
- Nouveaux endpoints : PATCH /leads/{id} (mise a jour partielle)
- Modeles enrichis : LeadCreate/LeadUpdate avec 9 champs supplementaires

**Frontend apps/web/app/(app)/crm/page.tsx (refonte complete)**
- Interface Lead etendue : score numerique 0-100, phone, jobTitle, source,
  status, nextContactAt, linkedinUrl, websiteUrl, tags
- useEffect + api.get() : chargement des leads au montage
- api.post() + api.delete() : persistence reelle create/delete
- Modal 4 sections avec onglets : Identite / Professionnel / Opportunite / Suivi
- Score : slider range 0-100 avec badge dynamique (hot >= 70 / warm >= 40 / cold < 40)
- Selects : source (linkedin/website/referral/event/other), status
- Cartes Kanban enrichies : score numerique + label, phone, job_title, source emoji,
  next_contact_at, premier tag

**Traductions apps/web/lib/i18n/translations.ts**
- 32 nouvelles cles en FR et EN (crm.form.phone, job_title, source.*,
  status.*, score, notes, next_contact, section.*, crm.loading)

---

## Commits IT-022

- afa903a  feat(integrations): universal webhook system
- 49e8039  fix(webhooks): JWT auth triple fallback + WebhookCard api.post()
- 8bc1e5a  feat(crm): enrich lead form with 7 essential fields
- ee9c357  feat(crm): crm_leads table + backend fix

---

## Action manuelle requise post IT-022

Executer dans Supabase SQL Editor (une seule fois) :
apps/api/migrations/013_crm_leads.sql

Sans cette etape, le CRM fonctionne en mode mock (donnees exemples).
Apres execution, le Kanban persistera les donnees en base.

---

## Backlog post IT-022

### Priorite haute

1. Enrichir formulaire CRM frontend (ajout tags multi-valeur)
2. Brancher agent Sales au contexte CRM (injection leads dans prompt)
3. Tester Webhooks en production avec Tally / Zapier / n8n
4. Configurer le webhook Stripe en production

### Priorite moyenne

5. Test complet Workflows, Agenda, Reports en production
6. Agent Juridique (droit francais/europeen, disclaimer obligatoire)
7. Amelioration agent Sales : fallback si pas de donnees CRM injectees
8. DuckFactory : demarrage du projet

### Priorite basse

9. Tags multi-valeur dans le formulaire CRM
10. Monitoring Sentry (SENTRY_DSN actuellement vide)
11. Mode PWA pleinement active

---

## Apprentissages cles

- Variables Vercel/Railway: toujours verifier le Raw Editor
- NEXT_PUBLIC_*: Next.js compile au build, necessite .env.production
- Watch Paths Railway: configurer /apps/api/** pour redeploiements pertinents
- Cache navigateur: tester en fenetre privee + Ctrl+Shift+R apres changement frontend
- Audit prompt systeme: la coherence frontend/backend est cruciale

---

ProAI est officiellement un SaaS B2B en production, accessible publiquement et fonctionnel.
