from pydantic import BaseModel
from datetime import datetime


class MemoryEntry(BaseModel):
    id: str
    content: str
    metadata: dict = {}
    created_at: datetime


class MemorySearchRequest(BaseModel):
    query: str
    top_k: int = 5
    conversation_id: str | None = None


class MemorySearchResponse(BaseModel):
    entries: list[MemoryEntry]
    query: str
