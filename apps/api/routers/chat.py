from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from supabase import Client

from agents.orchestrator import run_orchestrator
from agents.tools import get_leads_context, get_tasks_context, get_analytics_context, get_action_cards
from core.database import get_supabase
from core.security import get_optional_user
from schemas.chat import ActionCard, ChatRequest, ChatResponse, ChatMessage

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


# Intents that need CRM pipeline data
_SALES_INTENTS = {"sales"}
# Intents that need task/agenda data
_TASK_INTENTS = {"automation"}
# Intents that need full analytics stats
_ANALYTICS_INTENTS = {"analytics"}
# All data-rich intents (pre-classify by keyword for fast path)
_KEYWORD_INTENTS: dict[str, list[str]] = {
    "sales":      ["lead", "prospect", "crm", "pipeline", "closing", "relance"],
    "automation": ["workflow", "automatise", "tâche", "agenda", "planning", "zapier"],
    "analytics":  ["kpi", "dashboard", "rapport", "statistiques", "taux", "métriques", "chiffres"],
}


def _detect_intent_keywords(message: str) -> str | None:
    msg = message.lower()
    for intent, kws in _KEYWORD_INTENTS.items():
        if any(kw in msg for kw in kws):
            return intent
    return None


@router.post("", response_model=ChatResponse)
async def chat(
    body: ChatRequest,
    current_user: dict = Depends(get_optional_user),
    supabase: Client = Depends(get_supabase),
):
    user_id = current_user["user_id"]
    conversation_id = body.conversation_id or str(uuid.uuid4())

    context_parts: list[str] = []

    # 1 — Profil business (best-effort)
    try:
        res = (
            supabase.table("business_profiles")
            .select("business_name,sector,target_audience,main_objective,company_size")
            .eq("user_id", user_id)
            .single()
            .execute()
        )
        if res.data:
            context_parts.append(_build_business_context(res.data))
    except Exception:
        pass

    # 2 — Contextual data pre-fetch based on message keywords
    keyword_intent = _detect_intent_keywords(body.message)

    if keyword_intent in _SALES_INTENTS or keyword_intent is None:
        # Always include CRM pipeline for sales signals (and as background for other agents)
        leads_ctx = await get_leads_context(supabase, user_id)
        if leads_ctx:
            context_parts.append(leads_ctx)

    if keyword_intent in _TASK_INTENTS:
        tasks_ctx = await get_tasks_context(supabase, user_id)
        if tasks_ctx:
            context_parts.append(tasks_ctx)

    if keyword_intent in _ANALYTICS_INTENTS:
        analytics_ctx = await get_analytics_context(supabase, user_id)
        if analytics_ctx:
            context_parts.append(analytics_ctx)

    # If no specific intent detected, inject both tasks + analytics for general richness
    if keyword_intent is None:
        tasks_ctx = await get_tasks_context(supabase, user_id)
        if tasks_ctx:
            context_parts.append(tasks_ctx)
        analytics_ctx = await get_analytics_context(supabase, user_id)
        if analytics_ctx:
            context_parts.append(analytics_ctx)

    full_context = "\n\n".join(context_parts) or None

    try:
        result = await run_orchestrator(body.message, [], business_context=full_context)
        response_text = result["response"]
        agent_used = result.get("intent", "general")
    except Exception as exc:
        logger.exception("Orchestrator error")
        response_text = f"Erreur interne : {str(exc)}"
        agent_used = "general"

    await _persist_messages(
        supabase=supabase,
        conversation_id=conversation_id,
        user_id=user_id,
        user_text=body.message,
        assistant_text=response_text,
        agent_type=agent_used,
    )

    raw_cards = get_action_cards(agent_used, body.message)
    actions = [ActionCard(label=c["label"], href=c["href"], variant=c.get("variant", "secondary")) for c in raw_cards]

    return ChatResponse(
        conversation_id=conversation_id,
        message=ChatMessage(role="assistant", content=response_text),
        intent=agent_used,
        agent_used=agent_used,
        actions=actions,
    )
