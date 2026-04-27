from __future__ import annotations
import uuid
from datetime import datetime, timezone
from supabase import Client


class LongTermMemory:
    """Persists important facts in Supabase (pgvector for semantic search)."""

    TABLE = "memory_entries"

    def __init__(self, supabase: Client) -> None:
        self._sb = supabase

    async def store(self, organization_id: str, content: str, metadata: dict | None = None) -> str:
        entry_id = str(uuid.uuid4())
        row = {
            "id": entry_id,
            "organization_id": organization_id,
            "content": content,
            "metadata": metadata or {},
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        self._sb.table(self.TABLE).insert(row).execute()
        return entry_id

    async def search(self, organization_id: str, query: str, top_k: int = 5) -> list[dict]:
        # Full-text fallback; replace with pgvector RPC when embeddings are ready.
        result = (
            self._sb.table(self.TABLE)
            .select("*")
            .eq("organization_id", organization_id)
            .ilike("content", f"%{query}%")
            .limit(top_k)
            .execute()
        )
        return result.data or []

    async def delete(self, entry_id: str, organization_id: str) -> None:
        self._sb.table(self.TABLE).delete().eq("id", entry_id).eq("organization_id", organization_id).execute()
