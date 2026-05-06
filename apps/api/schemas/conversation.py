from pydantic import BaseModel
from datetime import datetime


class ConversationCreate(BaseModel):
    title: str | None = None
    agent_type: str | None = "general"


class ConversationResponse(BaseModel):
    id: str
    user_id: str | None = None
    agent_type: str | None = "general"
    title: str | None = None
    created_at: datetime
    updated_at: datetime


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
