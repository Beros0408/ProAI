# Plan Vague B — Sécurité backend Krezia

**Date** : 2026-05-15
**Branche** : `chore/rebrand-krezia`
**Périmètre strict** : sécurité de l'API uniquement. Aucun rebranding, refonte DB multi-tenant, intégration email ou autre.
**Approche unique** : tous les endpoints concernés basculent en authentifié strict via `get_current_user`. Pas de rate-limit IP en plus à ce stade. Cas particulier `/welcome/send` résolu par **Option D** (suppression pure du router welcome ; intégration email transactionnel reportée à une **Vague E** dédiée).

---

## Section A — Inventaire (résultats de l'étape 1)

### A.1 Code à supprimer / modifier dans `apps/api/core/security.py`

Fichier intégral (76 lignes). Éléments à traiter :

| Ligne(s) | Élément | Action prévue |
|---|---|---|
| 13 | `DEMO_USER_ID = "00000000-0000-0000-0000-000000000001"` | **Supprimer** |
| 14 | `DEMO_USER = {"user_id": DEMO_USER_ID, "email": "demo@proai.app", "organization_id": None}` | **Supprimer** |
| 21-46 | `async def get_current_user(credentials = Depends(bearer_scheme)) -> dict` | **Garder tel quel** (signature OK, lève 401 sur token manquant/invalide, retourne `{"user_id", "email", "organization_id"}`) |
| 49-51 | `_optional_bearer = HTTPBearer(auto_error=False)` | **Supprimer** (uniquement utilisé par `get_optional_user`) |
| 54-76 | `async def get_optional_user(...) -> dict` | **Supprimer** |

Signature de `get_current_user` à conserver pour les routers migrés :
```python
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    """Strict auth — raises 401 if no valid JWT."""
    token = credentials.credentials
    try:
        supabase = get_supabase_client()
        user_response = supabase.auth.get_user(token)
        user = user_response.user
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {
            "user_id": user.id,
            "email": user.email,
            "organization_id": user.user_metadata.get("organization_id", None),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}") from e
```

> ⚠️ Note : `bearer_scheme = HTTPBearer()` (sans `auto_error=False`) → FastAPI lève **403** si pas de header (et non 401). Ce comportement est confirmé par le test existant `test_chat_requires_auth` (`assert resp.status_code == 403`) et `test_me_unauthenticated`. Donc 403 = absence de header, 401 = token invalide. Cohérent.

### A.2 Routers qui utilisent `get_optional_user` (à migrer en strict)

**8 routers, 35 endpoints** affectés.

| Router | Fichier | Lignes des `Depends(get_optional_user)` | Nb endpoints |
|---|---|---|---|
| Chat | `apps/api/routers/chat.py` | 95 | 1 |
| Conversations | `apps/api/routers/conversations.py` | 31, 59, 83, 99 | 4 |
| Agenda | `apps/api/routers/agenda.py` | 101, 125, 152, 187, 203, 227, 248, 282, 298 | 9 |
| CRM | `apps/api/routers/crm.py` | 149, 172, 206, 235, 261, 286, 301 | 7 |
| Onboarding | `apps/api/routers/onboarding.py` | 84, 110 | 2 |
| Reports | `apps/api/routers/reports.py` | 130, 177 | 2 |
| Schedule | `apps/api/routers/schedule.py` | 64, 88, 112, 137 | 4 |
| Workflows | `apps/api/routers/workflows.py` | 143, 171, 197, 224, 273, 308 | 6 |
| **Total** | | | **35** |

Pour chaque fichier, il y a aussi l'import en haut : `from core.security import get_optional_user` (ligne ~12-13 selon le fichier) à changer en `from core.security import get_current_user`.

**Logique conditionnelle `DEMO_USER_ID` dans les routers** : `grep DEMO_USER` sur tout `apps/api/routers/` ne retourne **aucune occurrence**. Aucun router ne distingue actuellement un utilisateur réel d'un DEMO_USER → la migration est mécanique et n'introduit pas de cas particuliers à gérer.

**Références à l'UUID `00000000-0000-0000-0000-000000000001` hors security.py** (2 occurrences) :
- `apps/api/migrations/006_conversations_user_id.sql` lignes 10 et 17 : `UPDATE conversations SET user_id = '0000…0001'` (backfill historique) + `ALTER COLUMN user_id SET DEFAULT '0000…0001'`. **Sans impact direct côté code** après suppression de DEMO_USER. Le DEFAULT côté DB ne s'applique que si un INSERT omet `user_id`, ce qui sera désormais toujours une erreur côté app → comportement défensif OK, à laisser ou nettoyer en vague ultérieure.
- `apps/api/migrations/README.md` ligne 44 : phrase descriptive « The DEMO_USER (`0000…0001`) is used when no JWT token is present (development mode). » → **À mettre à jour dans le cadre du plan**.

### A.3 Endpoints totalement publics (à passer en authentifié)

Routers qui n'importent **rien** de `core.security` (vérifié par `grep ^(from|import)` sur chaque fichier) :

| Router | Fichier | Endpoint(s) | Nb |
|---|---|---|---|
| Content | `apps/api/routers/content.py` | `POST /linkedin`, `/newsletter`, `/email`, `/instagram`, `/facebook`, `/twitter`, `/blog`, `/video-script` | 8 |
| Mindmap | `apps/api/routers/mindmap.py` | `POST /generate` | 1 |
| Predictions | `apps/api/routers/predictions.py` | `POST /sales`, `/churn`, `/trends` | 3 |
| Analyze | `apps/api/routers/analyze.py` | `POST /website` | 1 |
| Upload | `apps/api/routers/upload.py` | `POST /analyze` | 1 |
| Welcome | `apps/api/routers/welcome.py` | `POST /send` | 1 |
| **Total** | | | **15** |

> ⚠️ **Différence avec le brief** : le brief listait « 13 endpoints publics (content/* x8 + mindmap + predictions x3 + analyze + welcome) ». L'inventaire en révèle **15** :
> - **`/upload/analyze`** est public — n'avait pas été identifié dans le brief (et était à tort listé `get_optional_user` dans la Section 3.2 de l'audit ; vérification en lisant `apps/api/routers/upload.py` lignes 1-130 : aucun import de `core.security`).
> - **`/welcome/send`** est public (déjà connu) mais **conceptuellement différent des autres** — appelé après `supabase.auth.signUp()`, à un instant où l'utilisateur n'a pas encore de session (cf. `apps/web/app/(auth)/signup/page.tsx` ligne 141). Cas à arbitrer (cf. Questions ouvertes B.0).

**Endpoints publics légitimes à NE PAS toucher** (pour mémoire) :
- `GET /health/` + `GET /health/ready` (healthcheck)
- `POST /api/v1/auth/login` (login lui-même)
- `POST /api/v1/billing/webhook` (Stripe webhook signé par signature)
- `GET /api/v1/billing/plans` (catalogue public)
- `POST /api/v1/webhook/{token}` (webhook entrant signé par token DB)

### A.4 Côté frontend — appels concernés

**Mécanisme d'auth standard** : `apps/web/lib/api.ts` (102 lignes) expose un wrapper `api.get/post/patch/delete` qui **lit automatiquement** la session Supabase (`getSession()`) ou fallback localStorage, et injecte `Authorization: Bearer <token>` quand le token est disponible. Toutes les pages qui passent par `api.*()` enverront donc le JWT sans aucune modification.

Pour chaque endpoint qui va devenir authentifié, vérification du chemin d'appel frontend :

| Endpoint qui devient auth | Composant/page appelant | Mode d'appel | Verdict |
|---|---|---|---|
| `POST /chat` | `hooks/useChat.ts:72` | `fetch()` direct **+ lecture Supabase session + Authorization conditionnel** | ✅ Envoie déjà le JWT quand présent |
| `POST /conversations/*` (4) | `app/(app)/chat/page.tsx` (probablement) | via `api.*()` (1 call détecté côté chat) | ✅ Auto |
| `POST /agenda/*` (9) | `app/(app)/agenda/page.tsx` (458 l.) | via `api.*()` (1 call) | ✅ Auto |
| `POST /crm/*` (7) | `app/(app)/crm/page.tsx` (770 l.) | via `api.*()` (3 calls) | ✅ Auto |
| `POST /onboarding/*` (2) | `components/onboarding/OnboardingWizard.tsx` (à confirmer) | via `api.*()` | ✅ Auto |
| `GET/POST /reports/*` (2) | `app/(app)/reports/page.tsx` (mock) | aucun call API détecté | ✅ Pas d'impact frontend (page mock) |
| `POST /schedule/*` (4) | `app/(app)/schedule/page.tsx` | via `api.*()` (1 call) | ✅ Auto |
| `POST /workflows/*` (6) | `app/(app)/workflows/page.tsx` | via `api.*()` (5 calls) | ✅ Auto |
| `POST /content/*` (8) | `app/(app)/content/page.tsx` (662 l.) | via `api.*()` (9 calls) | ✅ Auto |
| `POST /mindmap/generate` | `app/(app)/mindmap/page.tsx` | via `api.*()` (1 call) | ✅ Auto |
| `POST /analyze/website` | `app/(app)/analyze/page.tsx` | via `api.*()` (1 call) | ✅ Auto |
| `POST /predictions/{sales,churn,trends}` | `app/(app)/predictions/page.tsx` (mock) | aucun call API détecté | ✅ Pas d'impact frontend (page mock) |
| `POST /upload/analyze` | `components/chat/ChatContainer.tsx:42` | `fetch()` direct **+ Authorization conditionnel** | ✅ Envoie déjà le JWT (page dans `/chat`, donc utilisateur connecté) |
| `POST /welcome/send` | `app/(auth)/signup/page.tsx:141` | `fetch()` direct **sans Authorization** | ⚠️ **Pas de JWT** au moment de l'appel (juste après `signUp()`, avant confirmation email). Cf. Questions ouvertes B.0 |

**Conclusion frontend** : aucune modification de code frontend nécessaire pour 14/15 endpoints. **Seul `/welcome/send` pose problème** (cf. B.0).

### A.5 Tests existants

**Fichiers de tests présents** (`apps/api/tests/`, 262 lignes au total) :
- `conftest.py` (48 l.) — fixtures `valid_token`, `auth_headers`, `client`, mocks Redis/Supabase
- `test_agents.py` (60 l.)
- `test_auth.py` (49 l.) — login, /me strict
- `test_chat.py` (42 l.) — chat avec auth, rate limit, **`test_chat_requires_auth` attend déjà 403** ligne 39-42
- `test_health.py` (15 l.)
- `test_memory.py` (48 l.)

**Aucun test ne référence `DEMO_USER`, `get_optional_user`, ou n'effectue un appel anonyme attendant une réponse 200 sur un endpoint qui va devenir strict.** Confirmé par grep.

**⚠️ Découverte critique : les tests sont actuellement cassés au niveau de l'import.**
- `conftest.py` ligne 5 : `from core.security import create_access_token`
- Or `core/security.py` (intégralement lu) ne contient **aucune fonction `create_access_token`**.
- → Toute la suite de tests pytest échoue probablement à la collecte (`ImportError`).
- À traiter en **prérequis (B1)** pour avoir une baseline verte avant tout changement.

Le test `test_chat_requires_auth` existant (cf. ci-dessus) est aligné avec notre objectif final — il deviendra le canari naturel de la migration de `chat`.

Couverture tests vs périmètre :
- **Couverts** : chat, auth, health, memory (4 routers / 23 affectés)
- **Non couverts** : agenda, conversations, crm, onboarding, reports, schedule, workflows, content, mindmap, predictions, analyze, upload, welcome (13 routers / 23 affectés)
- → On n'a pas de garde-fou automatique pour la majorité des migrations. À compenser par des smoke tests manuels (cf. B7).

---

## Section B — Plan d'action en sous-tâches

Ordre d'exécution recommandé. Chaque étape doit être validée par un build + run local avant de passer à la suivante. **Aucune action destructive autorisée sans validation explicite.**

### B0 — Décision tranchée : `/welcome/send` → Option D (suppression pure)

**Décision** : supprimer entièrement le router `welcome` et son endpoint `/welcome/send`. Justification :
- L'envoi d'email welcome n'est **pas opérationnel aujourd'hui** : aucun provider (Resend / SendGrid / Mailgun) n'est intégré (cf. TODO Section 10 de l'audit). C'est du **code mort**.
- La suppression ferme la faille de sécurité (endpoint public quota-consommateur) **sans ajouter de dette ni de modif fonctionnelle frontend**, hors retrait du `fetch` orphelin.
- L'intégration email réelle (welcome, password reset, notifications) sera traitée dans une **Vague E** dédiée plus tard, avec le provider en place et les templates Krezia rebrandés.

Procédure d'exécution détaillée en B5. **Durée estimée** : 0 (décision prise).

### B1 — Réparer les tests existants (`create_access_token` manquant)

**Fichier(s)** : `apps/api/core/security.py` et/ou `apps/api/tests/conftest.py`.

**Action retenue (cf. décision #2)** : créer la fonction `create_access_token` dans `apps/api/core/security.py`. C'est attendu côté applicatif (pas seulement pour les tests) puisque `conftest.py` l'importe déjà depuis `core.security`.

**Signature exacte à implémenter** :
```python
from datetime import datetime, timedelta, timezone
from jose import jwt
from core.config import get_settings

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Signe un JWT avec SECRET_KEY + JWT_ALGORITHM (cf. core.config)."""
    settings = get_settings()
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.jwt_access_token_expire_minutes))
    to_encode["exp"] = expire
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.jwt_algorithm)
```

**Risques** : si le JWT généré par les tests ne correspond pas au format attendu par `get_current_user` (qui appelle `supabase.auth.get_user(token)`), le test n'authentifiera pas. Or `supabase.auth.get_user` n'accepte que des JWT signés par Supabase. → Solution : **mocker `supabase.auth.get_user` dans `conftest.py`** pour qu'il accepte le token de test sans aller chez Supabase. Pattern à appliquer en parallèle (override de dépendance `get_supabase_client`).

**Tests à faire après** :
```bash
cd apps/api
./.venv/Scripts/python.exe -m pytest tests/ -v
```
Attendu : tous les tests collectés. Au minimum `test_health` doit passer (smoke).

**Durée estimée** : 45 min – 1h (selon complexité du mock).

### B2 — Ajouter des smoke tests `_requires_auth` génériques

**Fichier(s)** : nouveau `apps/api/tests/test_auth_required.py` (à créer).

**Action** : ajouter un test paramétré qui frappe chaque endpoint protégé sans token et vérifie le statut 403 :
```python
import pytest

@pytest.mark.asyncio
@pytest.mark.parametrize("method,path", [
    ("get", "/api/v1/agenda/events"),
    ("post", "/api/v1/crm/leads"),
    ("post", "/api/v1/content/linkedin"),
    # ... un endpoint représentatif par router
])
async def test_endpoint_requires_auth(client, method, path):
    fn = getattr(client, method)
    resp = await fn(path)
    assert resp.status_code == 403
```

Pourquoi maintenant et pas après B3/B4 : ces tests doivent **échouer** au début (la majorité des endpoints n'est pas encore strict) et **passer** progressivement à chaque sous-tâche B3/B4 finie. C'est le garde-fou de la migration.

**Risques** : aucun, tests purs.

**Tests à faire après** : `pytest tests/test_auth_required.py -v`. Attendu : la moitié rouge (normal, c'est l'état initial), à fixer au fur et à mesure.

**Durée estimée** : 30 min.

### B3 — Migrer les 8 routers `get_optional_user` → `get_current_user`

**Fichier(s)** :
- `apps/api/routers/chat.py`
- `apps/api/routers/conversations.py`
- `apps/api/routers/agenda.py`
- `apps/api/routers/crm.py`
- `apps/api/routers/onboarding.py`
- `apps/api/routers/reports.py`
- `apps/api/routers/schedule.py`
- `apps/api/routers/workflows.py`

**Action** : remplacement mécanique par fichier. Pour chacun :
1. Changer l'import en haut : `from core.security import get_optional_user` → `from core.security import get_current_user`.
2. Remplacer **toutes les occurrences** de `Depends(get_optional_user)` par `Depends(get_current_user)` (35 occurrences réparties sur les 8 fichiers).
3. **Aucun changement de logique métier** — la signature retournée est identique (`{"user_id", "email", "organization_id"}`).

**Recommandation d'exécution** : un fichier à la fois, avec un import test backend (`python -c "from main import app"`) après chaque pour détecter les imports cassés ; et un commit Conventional Commits par router pour faciliter un revert ciblé (ex. `feat(security): enforce JWT on chat router`).

**Risques** :
- Si un endpoint reposait silencieusement sur la fenêtre `get_optional_user` → DEMO_USER pour servir des données d'aperçu non authentifié (landing, demo), il deviendra inaccessible. Vérifié : **aucun endpoint frontend n'est dans ce cas** (cf. Section A.4).
- Les requêtes Supabase passent par `SUPABASE_SERVICE_ROLE_KEY` qui contourne RLS → on continue de s'appuyer sur `.eq("user_id", user_id)` codé en dur. Aucun changement de modèle DB ici (hors scope).

**Tests à faire après chaque fichier** :
- Import `python -c "from main import app; print(app.title)"` → attendu `Krezia API`.
- Smoke manuel sur l'endpoint principal du router via curl/HTTPie avec et sans token (sans → 403, avec → 200).
- Relance `test_auth_required.py` : les tests correspondants au router migré doivent passer du rouge au vert.
- Pour `chat` spécifiquement : `pytest tests/test_chat.py -v` (`test_chat_requires_auth` doit toujours passer + `test_chat_returns_response` doit toujours passer).

**Durée estimée** : 2 h (8 fichiers × ~10–15 min + retest).

### B4 — Ajouter `get_current_user` sur les endpoints publics (hors `/welcome/send`)

**Fichier(s)** :
- `apps/api/routers/content.py` (8 endpoints)
- `apps/api/routers/mindmap.py` (1 endpoint)
- `apps/api/routers/predictions.py` (3 endpoints)
- `apps/api/routers/analyze.py` (1 endpoint)
- `apps/api/routers/upload.py` (1 endpoint)

**Action** : pour chaque router :
1. Ajouter l'import : `from core.security import get_current_user` (et `Depends` si pas déjà importé).
2. Pour chaque fonction d'endpoint, **ajouter le paramètre** `current_user: dict = Depends(get_current_user)` dans la signature.
3. **Pas besoin d'utiliser `current_user`** dans le corps (les endpoints sont stateless, ils génèrent à partir du body sans persistance par user). L'argument sert uniquement de garde d'accès.
4. Cas particulier `upload.py` : la signature est en `Form` + `File`, le `Depends` se place après ces paramètres.

Exemple sur `mindmap.py` :
```python
# Avant
@router.post("/generate", response_model=MindMapResponse)
async def generate_mindmap(request: MindMapRequest):
    ...

# Après
@router.post("/generate", response_model=MindMapResponse)
async def generate_mindmap(
    request: MindMapRequest,
    current_user: dict = Depends(get_current_user),
):
    ...
```

**Risques** :
- Frontend : tous les composants concernés (cf. A.4) lisent déjà le JWT via `lib/api.ts` ou explicitement. **Aucune modif frontend requise** sauf si des liens externes / partages publics existent (landing page mindmap démo, etc. — pas détecté).
- Tests existants : aucun ne couvre ces endpoints, donc rien à mettre à jour.

**Tests à faire après chaque fichier** :
- Import backend OK.
- Smoke curl : `curl -X POST http://localhost:8000/api/v1/mindmap/generate -H "Content-Type: application/json" -d '{"idea":"test"}'` → 403.
- Avec token : 200.
- Smoke frontend : ouvrir la page correspondante en étant connecté, déclencher l'action → doit fonctionner.

**Durée estimée** : 1 h.

### B5 — Suppression de l'endpoint `/welcome/send` et du router welcome

**Vérifications préalables effectuées (lecture seule)** :
- `apps/api/tests/` : aucune référence à `welcome` (grep insensible casse).
- `apps/api/templates/welcome_email.html` : **orphelin total**, jamais référencé dans le code (le router welcome.py contient juste un commentaire mort mentionnant `render_welcome_email` qui n'existe pas).
- `apps/web/` : 1 seule référence à `/welcome/send` → `apps/web/app/(auth)/signup/page.tsx` ligne 141 (le `fetch` fire-and-forget).

**Actions précises** :

a. **Supprimer** `apps/api/routers/welcome.py`.

b. **Modifier `apps/api/main.py`** :
   - Retirer `welcome` de la ligne d'import des routers (ligne 7 : `from routers import …, welcome` → enlever `welcome`).
   - Retirer la ligne `app.include_router(welcome.router, prefix="/api/v1")` (ligne 60).

c. **Supprimer** `apps/api/templates/welcome_email.html` (template orphelin de 5 occurrences ProAI, plus aucun consommateur).

d. **Modifier `apps/web/app/(auth)/signup/page.tsx`** :
   - Lignes 140-145 : supprimer le bloc `fetch(\`${API_URL}/api/v1/welcome/send\`, { … }).catch(…)`. Le `setSuccess(true)` + `setLoading(false)` qui suivent restent inchangés. C'est ~6 lignes nettes en moins, **sans modification fonctionnelle** (le `fetch` était fire-and-forget côté UX).

e. **Vérification post-suppression** : `grep -rn "welcome" apps/api apps/web --include='*.{py,ts,tsx,html}'` ne doit plus retourner que des références hors-périmètre (i18n strings, etc., à laisser tranquilles).

**Risques** : très faibles.
- Pas d'effet utilisateur : le `fetch` était fire-and-forget et le provider email n'était pas branché — aucun email n'était envoyé en prod aujourd'hui.
- Aucun test à mettre à jour (vérifié).
- Le `pnpm build` frontend doit passer sans warning sur la suppression des 6 lignes.
- Le `pytest` backend doit collecter (cf. B1 pour la baseline) sans nouveau warning.

**Tests à faire après** :
- Backend : `python -c "from main import app; print(app.title)"` → OK sans `welcome.router`.
- Frontend : `pnpm build` → 28 routes compilées (inchangé).
- Smoke local : signup d'un nouvel utilisateur → flow toujours fonctionnel (compte créé dans Supabase, redirect attendu), simplement sans tentative d'envoi welcome.
- `curl -X POST http://localhost:8000/api/v1/welcome/send -d '{}'` → **404** (endpoint disparu).

**Durée estimée** : 20–30 min.

### B6 — Supprimer le fallback DEMO_USER de `security.py`

**Fichier(s)** : `apps/api/core/security.py`.

**Action** : supprimer les lignes 13, 14, 49-51 (`_optional_bearer`), et 54-76 (`get_optional_user`). Le fichier passe de 76 lignes à ~50 lignes.

**Précondition** : B3 et B4 (et idéalement B5) achevés, sinon import errors immédiats à l'exécution.

**Action de contrôle** : avant la suppression, faire un dernier `grep` (lecture seule) pour vérifier qu'aucune référence n'est restée :
```bash
grep -rn "get_optional_user\|DEMO_USER" apps/api/ --include='*.py'
```
Attendu : aucune occurrence (sauf éventuellement security.py lui-même qu'on s'apprête à nettoyer).

**Risques** : ImportError si on a manqué une référence. Le test de smoke `python -c "from main import app"` détectera immédiatement.

**Tests à faire après** :
- Import backend OK.
- `pytest tests/ -v` : tous les tests passent (B1 prérequis pour ça).
- `pytest tests/test_auth_required.py -v` : tous verts.

**Durée estimée** : 15 min.

### B7 — Mise à jour de la documentation

**Fichier(s)** :
- `apps/api/migrations/README.md` ligne 44 : retirer la mention « The DEMO_USER (`0000…0001`) is used when no JWT token is present (development mode). »
- `CLAUDE.md` (racine repo) : pas de mention détectée à modifier (déjà silencieux sur DEMO_USER).
- Optionnel : `AUDIT_KREZIA_2026-05-15.md` (hors monorepo) : marquer les chantiers Vague B comme résolus dans le compte-rendu (à voir si tu veux garder l'audit comme snapshot historique ou le mettre à jour).

**Risques** : aucun, documentation pure.

**Durée estimée** : 10 min.

### B8 — Build & validation locale complète

**Périmètre tests retenu (cf. décision #5) : minimum strict.**
- Baseline réparée en B1.
- 5 à 8 tests `_requires_auth` ajoutés en B2 : un par catégorie d'endpoint (routers métier strict, anciens endpoints AI publics, upload). **Pas de tests fonctionnels étendus** sur CRM/workflows/etc. — hors scope.

**Action** :
1. **Backend** :
   ```bash
   cd apps/api
   ./.venv/Scripts/python.exe -m pytest tests/ -v
   ./.venv/Scripts/python.exe -c "from main import app; print(app.title, app.version)"
   ./.venv/Scripts/uvicorn.exe main:app --reload  # smoke run local
   ```
2. **Frontend** :
   ```bash
   cd apps/web
   pnpm build
   pnpm dev  # smoke run local
   ```
3. **Smoke E2E manuel** :
   - Login en local.
   - Tester un endpoint par feature impactée : chat, agenda, CRM, workflows, schedule, content, mindmap.
   - Tester en mode déconnecté : tous doivent renvoyer 403 dans les Network DevTools.
   - Tester signup (cf. B5) : le flux complet doit aboutir à un utilisateur Supabase créé + un log de welcome email côté backend.

**Risques** : régressions silencieuses (pages qui plantent au runtime alors que le build passe). D'où le smoke manuel.

**Durée estimée** : 1 h (incluant le smoke E2E).

### B9 — Commits & push

**Stratégie retenue (cf. décision #3) : regroupement en 5 commits cohérents.** Atomicité par phase logique pour minimiser le risque de pousser un état intermédiaire non démarrable.

| # | Commit | Regroupe | Justification |
|---|---|---|---|
| **C1** | `feat(security): add create_access_token and unblock test baseline` | B1 + ce plan | Indépendant. Peut même partir séparément si urgent. Inclut l'ajout de `PLAN_VAGUE_B_SECURITE.md`. |
| **C2** | `feat(security): remove DEMO_USER fallback, enforce auth on business endpoints` | B2 + B3 + B6 | **Atomique impératif** : si on supprime DEMO_USER sans migrer tous les routers, le backend ne démarre plus (ImportError sur `get_optional_user`). Doit tout partir ensemble. |
| **C3** | `feat(security): require auth on public AI endpoints` | B4 | 14 endpoints (content×8, mindmap, predictions×3, analyze, upload) protégés en un coup. |
| **C4** | `chore(welcome): remove unused /welcome/send endpoint (deferred to Vague E)` | B5 (suppression complète) | Suppression pure : `routers/welcome.py`, template HTML orphelin, include dans `main.py`, `fetch` orphelin côté `signup/page.tsx`. Corps du commit explicite que l'intégration email transactionnelle (welcome, password reset, notifications) est reportée à une Vague E dédiée, avec provider réel à choisir. |
| **C5** | `test: add 401 baseline tests for protected endpoints` | B8 (partie smoke tests systématisés) | Ajout de code de test pur, sans impact runtime. Peut partir en dernier. |

**Notes** :
- **C1 est indépendant** des autres : il fix les tests cassés sans toucher au comportement applicatif. Pushable en isolation si on veut débloquer la baseline rapidement.
- **C2 doit rester atomique** : split en sous-commits serait dangereux car suppression de DEMO_USER avant migration complète casse le backend.
- B7 (docs `migrations/README.md`) → à inclure dans C2 ou C5 selon l'humeur, peu importe.
- Push final vers `origin/chore/rebrand-krezia`. **Pas de merge dans main pendant cette vague.**

**Durée estimée** : 30 min (5 commits + push).

### B10 — Déploiement Railway et vérification prod

**Action** :
1. Vérifier que Railway suit bien la branche `chore/rebrand-krezia` (ou attendre un merge vers `main`).
2. Déclencher le déploiement.
3. Une fois déployé, smoke sur l'URL prod :
   - `curl -X POST https://<railway-url>/api/v1/content/linkedin -d '{}' -H 'Content-Type: application/json'` → attendu **403**.
   - Login depuis le frontend prod, vérifier qu'au moins 2 features impactées (chat + CRM) fonctionnent toujours.
4. Surveiller Sentry pendant 30 min minimum après déploiement (configuré dans `main.py` si `SENTRY_DSN` présent).

**Risques** :
- Cassure prod si on a manqué un endpoint utilisé par un client externe (Zapier, intégration tierce). **Le webhook entrant `/webhook/{token}` n'est PAS touché**, mais à confirmer s'il existe des consommateurs externes qui appellent `/content/*`, `/mindmap/*`, `/predictions/*` (peu probable mais à vérifier dans les logs Railway).
- Rollback : `git revert` du commit final + redéploiement (cf. Section D).

**Durée estimée** : 30 min de déploiement + 30 min de monitoring actif.

---

## Section C — Estimation totale & questions ouvertes

### C.1 Estimation totale

| Phase | Durée effective (sans pauses) |
|---|---|
| B0 (décision /welcome) | 0 (décision tranchée, sauf validation variante) |
| B1 (fix tests + `create_access_token`) | 45 min – 1 h |
| B2 (smoke tests auth) | 30 min |
| B3 (8 routers migrés) | 2 h |
| B4 (5 routers publics protégés) | 1 h |
| B5 (Option D : suppression complète du router welcome + cleanup orpheline) | 20–30 min |
| B6 (suppression DEMO_USER) | 15 min |
| B7 (docs) | 10 min |
| B8 (build + smoke E2E) | 1 h |
| B9 (5 commits + push) | 30 min |
| B10 (déploiement + monitoring) | 1 h |
| **Total effectif** | **~7 h 15** |

**Temps calendaire avec validations** : compter **1 à 2 jours ouvrés** (validations utilisateur à chaque étape majeure, monitoring asynchrone post-déploiement).

### C.2 Décisions prises

1. **`/welcome/send`** → **Option D : suppression pure** du router welcome (endpoint + fichier `routers/welcome.py` + template HTML orphelin + `fetch` orphelin côté signup page). Code mort aujourd'hui (aucun provider email intégré). L'intégration email transactionnelle (welcome, password reset, notifications) est **reportée à une Vague E dédiée**. Cf. B0 et B5.
2. **`create_access_token`** → créer dans `apps/api/core/security.py` avec signature `(data: dict, expires_delta: timedelta | None = None) -> str`. Signe avec `SECRET_KEY` + `JWT_ALGORITHM` de `core.config`. Cf. B1 pour le snippet.
3. **Stratégie commits** → **5 commits cohérents** (C1 à C5), regroupés par phase logique. C2 atomique impératif (suppression DEMO_USER + migration routers). Cf. B9 pour le détail.
4. **Périmètre frontend** → **zéro modif frontend dans la Vague B**, **sauf** `apps/web/app/(auth)/signup/page.tsx` (~10 lignes pour passer du flux Supabase Auth direct à un appel vers le nouveau `POST /auth/signup` backend). 14/15 endpoints déjà JWT-ready via `lib/api.ts` (auto-injection du Bearer). À vérifier qu'aucun appel orphelin ne pointe vers `/welcome/send` après le refactor C4.
5. **Tests** → **minimum strict**. (a) Réparer la baseline cassée (B1). (b) 5–8 tests paramétrés `_requires_auth` couvrant un endpoint représentatif par catégorie (routers métier, endpoints AI publics, upload). **Pas de tests fonctionnels étendus** sur CRM, workflows, etc. — hors scope vague B.

---

## Section D — Critères d'acceptation finaux

La Vague B est **terminée et réussie** lorsque **toutes** ces conditions sont remplies :

### D.1 Code

- [ ] `apps/api/core/security.py` ne contient plus `DEMO_USER`, `DEMO_USER_ID`, `get_optional_user`, ni `_optional_bearer`.
- [ ] Tous les 35 endpoints autrefois sous `get_optional_user` sont sous `get_current_user`.
- [ ] Les 14 endpoints publics ciblés (content×8, mindmap, predictions×3, analyze, upload) ont `Depends(get_current_user)` dans leur signature.
- [ ] Le cas `/welcome/send` est traité selon l'option choisie en B0.
- [ ] `grep -rn "get_optional_user\|DEMO_USER" apps/api/ --include='*.py'` ne retourne rien.

### D.2 Tests

- [ ] `pytest tests/` collecte sans erreur (B1 résolu).
- [ ] Tous les tests existants passent (chat, auth, health, memory).
- [ ] `tests/test_auth_required.py` (nouveau) : tous verts.
- [ ] Coverage des nouveaux tests >= 50 % sur les routers migrés.

### D.3 Frontend & build

- [ ] `pnpm build` passe sans warning de type ni erreur.
- [ ] Smoke E2E manuel : chat, CRM, workflows, content, mindmap fonctionnent une fois connecté.
- [ ] Smoke E2E manuel déconnecté : tous les endpoints protégés renvoient 403.

### D.4 Production

- [ ] Déploiement Railway réussi.
- [ ] Vérification curl prod : `POST /api/v1/content/linkedin` sans token → 403.
- [ ] Aucune nouvelle erreur Sentry dans les 30 min suivant le déploiement.

---

## Section E — Plan de rollback

### E.1 Si une régression est détectée localement (avant push)

- **Revert simple** : `git restore <fichier>` ou `git reset --soft HEAD~N` selon ce qui a été commité.
- **Pas de blocage** : on n'a rien poussé en distant.

### E.2 Si une régression est détectée après push mais avant déploiement Railway

- **Revert ciblé** : `git revert <hash>` sur la branche `chore/rebrand-krezia`, push.
- **Granularité** : la stratégie « 1 commit par sous-tâche » (B9) permet de revert juste le router fautif.

### E.3 Si une régression est détectée en prod

- **Rollback immédiat Railway** : restaurer le déploiement précédent via l'UI Railway (rollback de release, ~30 s).
- **Branch fix** :
  1. `git revert <hash-1>..<hash-N>` sur `chore/rebrand-krezia` pour annuler tous les commits Vague B.
  2. Push, redéploiement automatique.
- **Branch fix ciblé** : si la régression est isolée à 1 router, ne revert que celui-ci.

### E.4 Si la régression vient des endpoints publics protégés

Symptôme typique : un client externe (Zapier, intégration partenaire) qui appelait `/content/linkedin` ou `/mindmap/generate` reçoit 403.
- **Mitigation immédiate** : revert du commit qui a protégé cet endpoint spécifique (granularité du B4).
- **Solution long terme (Vague C ou ultérieure)** : émettre des tokens « API key longue durée » pour les intégrations externes (mécanisme distinct du JWT user), ou refactoriser ces endpoints pour passer par le système `webhook_tokens` existant.

### E.5 Si la suppression DEMO_USER casse quelque chose d'inattendu

- Très probable cause : un cron / worker / script Python utilise encore `get_optional_user` ou `DEMO_USER` (pas détecté dans l'inventaire, mais possible si présent dans `scripts/` ou un service externe non audité).
- **Mitigation** : `git revert` du commit B6 spécifiquement. Garder les migrations B3/B4 (qui sont indépendantes et n'ont pas besoin de DEMO_USER).

---

## Section F — Points de vigilance majeurs

1. **Tests cassés avant qu'on touche au code (B1)** : il est tentant d'attaquer directement B3. **Ne pas**. Sans la baseline de tests verts, on perdra la garantie qu'on ne casse rien.
2. **Préserver `bearer_scheme` pour `get_current_user`** : ne pas supprimer la ligne `bearer_scheme = HTTPBearer()` en pensant qu'elle dépendait de `get_optional_user`. C'est `_optional_bearer = HTTPBearer(auto_error=False)` qui est à supprimer, pas `bearer_scheme`.
3. **Ordre des paramètres dans les signatures FastAPI** : les paramètres `File`/`Form` doivent venir avant `Depends`. Pour `upload.py`, attention à l'ordre lors de l'ajout de `current_user`.
4. **EventSource `api.streamChat`** : la fonction existe dans `lib/api.ts:96-100` mais aucun endpoint backend `/chat/stream` n'a été détecté. Du code mort côté front, à supprimer en Vague D (cleanup). Ne pas le laisser obscurcir le verdict du build frontend.
5. **Webhook entrant `/webhook/{token}`** : reste public — c'est intentionnel (authentification par token DB). Ne pas le toucher.
6. **`/billing/webhook` Stripe** : reste public — signature Stripe vérifiée. Ne pas le toucher.
7. **Le `DEFAULT '00000000-…-001'` dans la colonne `conversations.user_id`** : sans danger après suppression du DEMO_USER côté code, mais à nettoyer en Vague C/D pour cohérence.
8. **L'URL `demo@proai.app` dans la constante DEMO_USER** : sera supprimée avec la constante. Mais à noter pour la cohérence rebrand globale (cf. Section 6 audit).
9. **Endpoints publics et quotas OpenAI** : la principale raison de protéger `/content/*`, `/mindmap`, `/analyze`, `/predictions`, `/upload` est de ne plus laisser n'importe qui consommer le quota OpenAI/Anthropic. Une fois en strict, le quota devient corrélé à `user.email` → on peut envisager un rate-limit par user (vague C). Mentionner ce gain dans la rétro Vague B.

---

---

## Section G — Backlog post-Vague B (vagues ultérieures)

Sujets identifiés pendant la vague B mais explicitement reportés. Pas de planification détaillée à ce stade — c'est un index pour mémoire.

### Vague E — Intégration email transactionnel

Périmètre prévu :
- Choix provider final : **Resend** (recommandé, déjà mentionné dans les TODO et la stack), **SendGrid** ou **Mailgun**.
- Création des endpoints d'envoi authentifiés (probablement service module + fonctions internes, pas d'endpoints HTTP directs côté frontend) :
  - Welcome email post-signup
  - Password reset
  - Notifications email (alertes CRM, rappels agenda, etc.)
- Templates HTML **rebrandés Krezia** (le template `welcome_email.html` supprimé en Vague B contenait 5 occurrences ProAI à reprendre proprement).
- Configuration : ajout de `RESEND_API_KEY` (ou équivalent) dans `.env` et `apps/api/core/config.py`.
- Intégration au flux signup : webhook Supabase `auth.user.created` OU déclenchement post-confirmation côté frontend, selon ce qui sera décidé alors.

### Autres sujets candidats à des vagues ultérieures

Issus de l'audit `AUDIT_KREZIA_2026-05-15.md` (hors monorepo) — à confirmer / cadrer au moment voulu :

- **Vague C** : harmonisation modèle DB (choix entre `user_id` mono-tenant et `organization_id` multi-tenant + outil de migration formel).
- **Vague D** : finalisation du rebrand technique (Stripe plans, URLs prod, paquets `@proai/*`, DB name `proai`).
- **Vague F** (ou intégrée à E) : rate-limit par user authentifié (Redis-backed), une fois que l'authentification stricte est en place et stable.

---

*Fin du plan.*
