from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from supabase import Client

from agents.orchestrator import run_orchestrator
from core.database import get_supabase
from core.security import get_optional_user
from schemas.chat import ChatRequest, ChatResponse, ChatMessage

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chat", tags=["chat"])

MESSAGES_TABLE = "messages"
CONVERSATIONS_TABLE = "conversations"


async def _persist_messages(
    supabase: Client,
    conversation_id: str,
    user_id: str,
    user_text: str,
    assistant_text: str,
    agent_type: str,
) -> None:
    now = datetime.now(timezone.utc).isoformat()
    rows = [
        {
            "id":              str(uuid.uuid4()),
            "conversation_id": conversation_id,
            "user_id":         user_id,
            "role":            "user",
            "content":         user_text,
            "agent_type":      agent_type,
            "created_at":      now,
        },
        {
            "id":              str(uuid.uuid4()),
            "conversation_id": conversation_id,
            "user_id":         user_id,
            "role":            "assistant",
            "content":         assistant_text,
            "agent_type":      agent_type,
            "created_at":      now,
        },
    ]
    try:
        supabase.table(MESSAGES_TABLE).insert(rows).execute()
    except Exception as exc:
        logger.warning("Could not persist chat messages: %s", exc)


def _build_business_context(profile: dict) -> str:
    return (
        "PROFIL BUSINESS DE L'UTILISATEUR :\n"
        f"Entreprise : {profile.get('business_name') or 'Non renseigné'}\n"
        f"Secteur : {profile.get('sector') or 'Non renseigné'}\n"
        f"Cible client : {profile.get('target_audience') or 'Non renseigné'}\n"
        f"Objectif principal : {profile.get('main_objective') or 'Non renseigné'}\n"
        f"Taille équipe : {profile.get('company_size') or 'Non renseigné'}\n"
        "Adapte tes réponses à ce contexte business spécifique."
    )


@router.post("", response_model=ChatResponse)
async def chat(
    body: ChatRequest,
    current_user: dict = Depends(get_optional_user),
    supabase: Client = Depends(get_supabase),
):
    user_id = current_user["user_id"]
    conversation_id = body.conversation_id or str(uuid.uuid4())

    # Fetch business profile to inject into agent context (best-effort)
    business_context: str | None = None
    try:
        res = (
            supabase.table("business_profiles")
            .select("business_name,sector,target_audience,main_objective,company_size")
            .eq("user_id", user_id)
            .single()
            .execute()
        )
        if res.data:
            business_context = _build_business_context(res.data)
    except Exception:
        pass  # No profile yet — agents run without business context

    try:
        result = await run_orchestrator(body.message, [], business_context=business_context)
        response_text = result["response"]
        agent_used = result.get("intent", "general")
    except Exception as exc:
        response_text = f"Erreur interne: {str(exc)}"
        agent_used = "general"

    await _persist_messages(
        supabase=supabase,
        conversation_id=conversation_id,
        user_id=user_id,
        user_text=body.message,
        assistant_text=response_text,
        agent_type=agent_used,
    )

    return ChatResponse(
        conversation_id=conversation_id,
        message=ChatMessage(role="assistant", content=response_text),
        intent=agent_used,
        agent_used=agent_used,
    )
