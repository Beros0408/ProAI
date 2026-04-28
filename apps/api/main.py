from contextlib import asynccontextmanager
import sentry_sdk
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import get_settings
from core.redis import close_redis
from routers import health, auth, chat, conversations, memory, mindmap

settings = get_settings()

if settings.sentry_dsn:
    sentry_sdk.init(dsn=settings.sentry_dsn, traces_sample_rate=0.2)

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await close_redis()

app = FastAPI(
    title="ProAI API",
    description="SaaS B2B multi-tenant AI agents for freelancers, entrepreneurs, and SMBs.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router, prefix="/api/v1")
app.include_router(chat.router, prefix="/api/v1")
app.include_router(conversations.router, prefix="/api/v1")
app.include_router(memory.router, prefix="/api/v1")
app.include_router(mindmap.router, prefix="/api/v1/mindmap")

@app.get("/")
async def root():
    return {"message": "ProAI API", "docs": "/docs"}