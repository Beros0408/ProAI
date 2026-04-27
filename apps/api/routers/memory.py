from fastapi import APIRouter, Depends
from redis.asyncio import Redis
from supabase import Client
from core.redis import get_redis
from core.database import get_supabase
from core.security import get_current_user
from memory.memory_manager import MemoryManager
from schemas.memory import MemorySearchRequest, MemorySearchResponse, MemoryEntry
from datetime import datetime, timezone

router = APIRouter(prefix="/memory", tags=["memory"])


@router.post("/search", response_model=MemorySearchResponse)
async def search_memory(
    body: MemorySearchRequest,
    current_user: dict = Depends(get_current_user),
    redis: Redis = Depends(get_redis),
    supabase: Client = Depends(get_supabase),
):
    manager = MemoryManager(redis, supabase)
    raw = await manager.recall(current_user["organization_id"], body.query, body.top_k)
    entries = [
        MemoryEntry(
            id=r["id"],
            content=r["content"],
            metadata=r.get("metadata", {}),
            created_at=r.get("created_at", datetime.now(timezone.utc)),
        )
        for r in raw
    ]
    return MemorySearchResponse(entries=entries, query=body.query)
