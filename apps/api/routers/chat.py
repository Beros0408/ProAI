import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from core.security import get_current_user
from agents.orchestrator import run_orchestrator
from schemas.chat import ChatRequest, ChatResponse, ChatMessage

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("", response_model=ChatResponse)
async def chat(
    body: ChatRequest,
    current_user: dict = Depends(get_current_user),
):
    conversation_id = body.conversation_id or str(uuid.uuid4())
    try:
        result = await run_orchestrator(body.message, [])
        return ChatResponse(
            conversation_id=conversation_id,
            message=ChatMessage(role="assistant", content=result["response"]),
            intent=result.get("intent", "general"),
            agent_used=result.get("intent", "general"),
        )
    except Exception as e:
        return ChatResponse(
            conversation_id=conversation_id,
            message=ChatMessage(role="assistant", content=f"Erreur interne: {str(e)}"),
            intent="general",
            agent_used="general",
        )