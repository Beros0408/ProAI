from pydantic import BaseModel
from datetime import datetime


class ConversationCreate(BaseModel):
    title: str | None = None


class ConversationResponse(BaseModel):
    id: str
    title: str | None = None
    organization_id: str | None = None
    user_id: str | None = None
    created_at: datetime
    updated_at: datetime
    message_count: int = 0


class ConversationList(BaseModel):
    conversations: list[ConversationResponse]
    total: int


class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    user_id: str
    role: str
    content: str
    agent_type: str | None = None
    created_at: datetime
