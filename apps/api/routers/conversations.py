from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from core.database import get_supabase
from core.security import get_optional_user
from schemas.conversation import (
    ConversationCreate,
    ConversationList,
    ConversationResponse,
    MessageResponse,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/conversations", tags=["conversations"])

TABLE = "conversations"
MESSAGES_TABLE = "messages"


# ── Conversations ──────────────────────────────────────────────────────────

@router.get("", response_model=ConversationList)
async def list_conversations(
    current_user: dict = Depends(get_optional_user),
    supabase: Client = Depends(get_supabase),
):
    user_id = current_user["user_id"]
    try:
        result = (
            supabase.table(TABLE)
            .select("*")
            .eq("user_id", user_id)
            .order("updated_at", desc=True)
            .execute()
        )
        conversations = [ConversationResponse(**row) for row in (result.data or [])]
        return ConversationList(conversations=conversations, total=len(conversations))
    except Exception as exc:
        logger.warning("Supabase unavailable for conversations (GET): %s", exc)
        return ConversationList(conversations=[], total=0)


@router.post("", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    body: ConversationCreate,
    current_user: dict = Depends(get_optional_user),
    supabase: Client = Depends(get_supabase),
):
    user_id = current_user["user_id"]
    now = datetime.now(timezone.utc).isoformat()
    row = {
        "id":              str(uuid.uuid4()),
        "user_id":         user_id,
        "organization_id": current_user.get("organization_id"),
        "title":           body.title or "Nouvelle conversation",
        "created_at":      now,
        "updated_at":      now,
        "message_count":   0,
    }
    try:
        result = supabase.table(TABLE).insert(row).execute()
        return ConversationResponse(**result.data[0])
    except Exception as exc:
        logger.error("Failed to create conversation: %s", exc)
        raise HTTPException(status_code=500, detail="Could not create conversation") from exc


@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    conversation_id: str,
    current_user: dict = Depends(get_optional_user),
    supabase: Client = Depends(get_supabase),
):
    user_id = current_user["user_id"]
    try:
        supabase.table(TABLE).delete().eq("id", conversation_id).eq("user_id", user_id).execute()
    except Exception as exc:
        logger.error("Failed to delete conversation: %s", exc)
        raise HTTPException(status_code=500, detail="Could not delete conversation") from exc


# ── Messages ───────────────────────────────────────────────────────────────

@router.get("/{conversation_id}/messages", response_model=List[MessageResponse])
async def list_messages(
    conversation_id: str,
    current_user: dict = Depends(get_optional_user),
    supabase: Client = Depends(get_supabase),
):
    user_id = current_user["user_id"]
    try:
        result = (
            supabase.table(MESSAGES_TABLE)
            .select("*")
            .eq("conversation_id", conversation_id)
            .eq("user_id", user_id)
            .order("created_at", desc=False)
            .execute()
        )
        return [MessageResponse(**row) for row in (result.data or [])]
    except Exception as exc:
        logger.warning("Supabase unavailable for messages (GET): %s", exc)
        return []
