from fastapi import APIRouter, Depends
from redis.asyncio import Redis
from core.redis import get_redis

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
async def health_check():
    return {"status": "ok", "service": "ProAI API"}


@router.get("/ready")
async def readiness_check(redis: Redis = Depends(get_redis)):
    await redis.ping()
    return {"status": "ready", "redis": "ok"}
