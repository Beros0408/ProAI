import json
from redis.asyncio import Redis


class ShortTermMemory:
    """Stores recent conversation messages in Redis with TTL."""

    TTL = 3600  # 1 hour

    def __init__(self, redis: Redis) -> None:
        self._redis = redis

    def _key(self, conversation_id: str) -> str:
        return f"stm:{conversation_id}"

    async def append(self, conversation_id: str, role: str, content: str) -> None:
        key = self._key(conversation_id)
        message = json.dumps({"role": role, "content": content})
        await self._redis.rpush(key, message)
        await self._redis.expire(key, self.TTL)

    async def get_history(self, conversation_id: str, limit: int = 20) -> list[dict]:
        key = self._key(conversation_id)
        raw = await self._redis.lrange(key, -limit, -1)
        return [json.loads(m) for m in raw]

    async def clear(self, conversation_id: str) -> None:
        await self._redis.delete(self._key(conversation_id))
