import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client
from core.database import get_supabase
from core.security import get_current_user
from schemas.conversation import ConversationCreate, ConversationResponse, ConversationList

router = APIRouter(prefix="/conversations", tags=["conversations"])

TABLE = "conversations"


@router.get("", response_model=ConversationList)
async def list_conversations(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    org_id = current_user["organization_id"]
    result = supabase.table(TABLE).select("*").eq("organization_id", org_id).order("updated_at", desc=True).execute()
    conversations = [ConversationResponse(**row) for row in (result.data or [])]
    return ConversationList(conversations=conversations, total=len(conversations))


@router.post("", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    body: ConversationCreate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    now = datetime.now(timezone.utc).isoformat()
    row = {
        "id": str(uuid.uuid4()),
        "organization_id": current_user["organization_id"],
        "title": body.title,
        "created_at": now,
        "updated_at": now,
        "message_count": 0,
    }
    result = supabase.table(TABLE).insert(row).execute()
    return ConversationResponse(**result.data[0])


@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    conversation_id: str,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    org_id = current_user["organization_id"]
    supabase.table(TABLE).delete().eq("id", conversation_id).eq("organization_id", org_id).execute()
