from __future__ import annotations

import logging
from typing import Any, Dict, List, Literal
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from supabase import Client

from core.database import get_supabase
from core.security import get_optional_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/schedule", tags=["schedule"])

TABLE = "scheduled_posts"


# ── Pydantic models ────────────────────────────────────────────────────────

class ScheduledPostBase(BaseModel):
    platform:       Literal["linkedin", "instagram", "facebook", "twitter"]
    content:        str = Field(..., min_length=1)
    scheduled_date: str = Field(...)   # "YYYY-MM-DD"
    scheduled_time: str = Field(...)   # "HH:MM"


class ScheduledPost(ScheduledPostBase):
    id:     str
    status: Literal["pending", "published", "failed"] = "pending"


class ScheduledPostUpdate(BaseModel):
    status: Literal["pending", "published", "failed"]


# ── Mock fallback ──────────────────────────────────────────────────────────

MOCK_POSTS: List[Dict[str, Any]] = [
    {"id": "post-1", "platform": "linkedin",  "content": "🚀 Nouveau produit lancé !",         "scheduled_date": "2026-05-07", "scheduled_time": "09:00", "status": "pending"},
    {"id": "post-2", "platform": "instagram", "content": "Découvrez notre offre du mois 🎯",   "scheduled_date": "2026-05-08", "scheduled_time": "12:00", "status": "pending"},
    {"id": "post-3", "platform": "twitter",   "content": "Thread : comment booster vos leads", "scheduled_date": "2026-05-09", "scheduled_time": "10:30", "status": "pending"},
]


# ── DB ↔ API mapping ───────────────────────────────────────────────────────

def _row_to_post(row: Dict[str, Any]) -> ScheduledPost:
    return ScheduledPost(
        id=str(row["id"]),
        platform=row["platform"],
        content=row["content"],
        scheduled_date=str(row.get("scheduled_date") or ""),
        scheduled_time=str(row.get("scheduled_time") or "00:00"),
        status=row.get("status") or "pending",
    )


# ── Endpoints ──────────────────────────────────────────────────────────────

@router.get("/posts", response_model=List[ScheduledPost])
async def list_posts(
    current_user: dict = Depends(get_optional_user),
    supabase: Client = Depends(get_supabase),
):
    user_id = current_user["user_id"]
    try:
        result = (
            supabase.table(TABLE)
            .select("*")
            .eq("user_id", user_id)
            .order("scheduled_date", desc=False)
            .execute()
        )
        rows = result.data or []
        if not rows:
            return [ScheduledPost(**p) for p in MOCK_POSTS]
        return [_row_to_post(r) for r in rows]
    except Exception as exc:
        logger.warning("Supabase unavailable for scheduled posts: %s", exc)
        return [ScheduledPost(**p) for p in MOCK_POSTS]


@router.post("/posts", response_model=ScheduledPost)
async def create_post(
    payload: ScheduledPostBase,
    current_user: dict = Depends(get_optional_user),
    supabase: Client = Depends(get_supabase),
):
    user_id = current_user["user_id"]
    try:
        row = {
            "user_id":        user_id,
            "platform":       payload.platform,
            "content":        payload.content,
            "scheduled_date": payload.scheduled_date,
            "scheduled_time": payload.scheduled_time,
            "status":         "pending",
        }
        result = supabase.table(TABLE).insert(row).execute()
        return _row_to_post(result.data[0])
    except Exception as exc:
        logger.error("Failed to create scheduled post: %s", exc)
        return ScheduledPost(id=uuid4().hex, status="pending", **payload.model_dump())


@router.patch("/posts/{post_id}/status", response_model=ScheduledPost)
async def update_post_status(
    post_id: str,
    payload: ScheduledPostUpdate,
    current_user: dict = Depends(get_optional_user),
    supabase: Client = Depends(get_supabase),
):
    user_id = current_user["user_id"]
    try:
        result = (
            supabase.table(TABLE)
            .update({"status": payload.status})
            .eq("id", post_id)
            .eq("user_id", user_id)
            .execute()
        )
        if not result.data:
            raise HTTPException(status_code=404, detail="Post introuvable")
        return _row_to_post(result.data[0])
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Failed to update post status: %s", exc)
        raise HTTPException(status_code=500, detail="Could not update post status") from exc


@router.delete("/posts/{post_id}", status_code=204)
async def delete_post(
    post_id: str,
    current_user: dict = Depends(get_optional_user),
    supabase: Client = Depends(get_supabase),
):
    user_id = current_user["user_id"]
    try:
        supabase.table(TABLE).delete().eq("id", post_id).eq("user_id", user_id).execute()
    except Exception as exc:
        logger.error("Failed to delete scheduled post: %s", exc)
        raise HTTPException(status_code=500, detail="Could not delete post") from exc
