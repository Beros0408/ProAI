import redis.asyncio as aioredis
from core.config import get_settings

settings = get_settings()

_redis_client: aioredis.Redis | None = None


async def get_redis() -> aioredis.Redis:
    global _redis_client
    if _redis_client is None:
        _redis_client = aioredis.from_url(settings.redis_url, decode_responses=True)
    return _redis_client


async def close_redis() -> None:
    global _redis_client
    if _redis_client:
        await _redis_client.aclose()
        _redis_client = None


async def rate_limit_check(redis: aioredis.Redis, key: str) -> bool:
    """Returns True if request is allowed, False if rate-limited."""
    s = get_settings()
    current = await redis.incr(key)
    if current == 1:
        await redis.expire(key, s.rate_limit_window_seconds)
    return current <= s.rate_limit_requests
