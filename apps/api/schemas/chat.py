from pydantic import BaseModel, Field
from typing import Literal


class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str


class ChatRequest(BaseModel):
    conversation_id: str | None = None
    message: str = Field(..., min_length=1, max_length=4000)
    stream: bool = False


class ChatResponse(BaseModel):
    conversation_id: str
    message: ChatMessage
    intent: str | None = None
    agent_used: str | None = None
    tokens_used: int | None = None
