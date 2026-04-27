from redis.asyncio import Redis
from supabase import Client
from memory.short_term import ShortTermMemory
from memory.long_term import LongTermMemory


class MemoryManager:
    def __init__(self, redis: Redis, supabase: Client) -> None:
        self.short_term = ShortTermMemory(redis)
        self.long_term = LongTermMemory(supabase)

    async def add_turn(self, conversation_id: str, user_msg: str, assistant_msg: str) -> None:
        await self.short_term.append(conversation_id, "user", user_msg)
        await self.short_term.append(conversation_id, "assistant", assistant_msg)

    async def get_context(self, conversation_id: str, limit: int = 10) -> list[dict]:
        return await self.short_term.get_history(conversation_id, limit=limit)

    async def store_fact(self, organization_id: str, fact: str, metadata: dict | None = None) -> str:
        return await self.long_term.store(organization_id, fact, metadata)

    async def recall(self, organization_id: str, query: str, top_k: int = 5) -> list[dict]:
        return await self.long_term.search(organization_id, query, top_k)
