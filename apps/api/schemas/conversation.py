from pydantic import BaseModel
from datetime import datetime


class ConversationCreate(BaseModel):
    title: str | None = None


class ConversationResponse(BaseModel):
    id: str
    title: str | None
    organization_id: str
    created_at: datetime
    updated_at: datetime
    message_count: int = 0


class ConversationList(BaseModel):
    conversations: list[ConversationResponse]
    total: int
