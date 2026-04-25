# Mission Agent Backend -- ProAI

## Livrables attendus
1. apps/api/main.py -- FastAPI app
2. apps/api/core/ -- config, database, redis, security
3. apps/api/routers/ -- auth, chat, conversations, memory, health
4. apps/api/agents/ -- orchestrator (LangGraph), intent_classifier, marketing, sales, general
5. apps/api/memory/ -- memory_manager, short_term, long_term
6. apps/api/schemas/ -- Pydantic schemas
7. apps/api/tests/ -- conftest + 5+ tests avec mocks LLM
8. apps/api/Dockerfile

## Validation
cd apps/api && uvicorn main:app --reload
# -> http://localhost:8000/docs
