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
router = APIRouter(prefix="/agenda", tags=["agenda"])

EVENTS_TABLE = "agenda_events"
TASKS_TABLE  = "agenda_tasks"

# ── Pydantic models ────────────────────────────────────────────────────────
# These match the frontend CalEvent / Task interfaces exactly.

class CalEventBase(BaseModel):
    title:     str = Field(..., min_length=1)
    day:       int = Field(..., ge=0, le=6)   # 0 = Monday … 6 = Sunday
    startHour: int = Field(..., ge=0, le=23)
    startMin:  int = Field(default=0, ge=0, le=59)
    endHour:   int = Field(..., ge=0, le=23)
    endMin:    int = Field(default=0, ge=0, le=59)
    type:      str = "meeting"
    icon:      str = "video"


class CalEvent(CalEventBase):
    id:          str
    aiSuggested: bool = False


class TaskBase(BaseModel):
    text:     str = Field(..., min_length=1)
    priority: Literal["high", "medium", "low"] = "medium"


class Task(TaskBase):
    id:   str
    done: bool = False


class SmartSuggestResponse(BaseModel):
    summary: str
    plan:    List[str]


# ── Mock fallback data ─────────────────────────────────────────────────────

MOCK_EVENTS: List[Dict[str, Any]] = [
    {"id": "1", "title": "Sprint planning",        "day": 0, "startHour": 9,  "startMin": 0,  "endHour": 10, "endMin": 0,  "type": "meeting", "icon": "video"},
    {"id": "2", "title": "Deep work - Stratégie",  "day": 0, "startHour": 10, "startMin": 30, "endHour": 12, "endMin": 30, "type": "focus",   "icon": "brain"},
    {"id": "3", "title": "Call client Nextera",    "day": 1, "startHour": 14, "startMin": 0,  "endHour": 15, "endMin": 0,  "type": "call",    "icon": "phone"},
    {"id": "4", "title": "Revue produit",          "day": 2, "startHour": 10, "startMin": 0,  "endHour": 11, "endMin": 0,  "type": "meeting", "icon": "video"},
    {"id": "5", "title": "Rédaction newsletter",   "day": 2, "startHour": 14, "startMin": 0,  "endHour": 16, "endMin": 0,  "type": "focus",   "icon": "brain"},
]

MOCK_TASKS: List[Dict[str, Any]] = [
    {"id": "t1", "text": "Finaliser le briefing marketing", "done": False, "priority": "high"},
    {"id": "t2", "text": "Mettre à jour le pipeline CRM",   "done": False, "priority": "medium"},
    {"id": "t3", "text": "Valider le script vidéo",         "done": False, "priority": "high"},
    {"id": "t4", "text": "Envoyer rapport hebdo",           "done": True,  "priority": "low"},
]


# ── DB ↔ API mapping ───────────────────────────────────────────────────────

def _row_to_event(row: Dict[str, Any]) -> CalEvent:
    return CalEvent(
        id=str(row["id"]),
        title=row["title"],
        day=row.get("day") or 0,
        startHour=row.get("start_hour") or 9,
        startMin=row.get("start_min") or 0,
        endHour=row.get("end_hour") or 10,
        endMin=row.get("end_min") or 0,
        type=row.get("type") or "meeting",
        icon=row.get("icon") or "video",
    )


def _row_to_task(row: Dict[str, Any]) -> Task:
    return Task(
        id=str(row["id"]),
        text=row.get("text") or row.get("title") or "",
        done=bool(row.get("done") or row.get("completed", False)),
        priority=row.get("priority") or "medium",
    )


# ── Event endpoints ────────────────────────────────────────────────────────

@router.get("/events", response_model=List[CalEvent])
async def list_events(
    current_user: dict = Depends(get_optional_user),
    supabase: Client = Depends(get_supabase),
):
    user_id = current_user["user_id"]
    try:
        result = (
            supabase.table(EVENTS_TABLE)
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=False)
            .execute()
        )
        rows = result.data or []
        if not rows:
            return [CalEvent(**e) for e in MOCK_EVENTS]
        return [_row_to_event(r) for r in rows]
    except Exception as exc:
        logger.warning("Supabase unavailable for agenda events: %s", exc)
        return [CalEvent(**e) for e in MOCK_EVENTS]


@router.post("/events", response_model=CalEvent)
async def create_event(
    payload: CalEventBase,
    current_user: dict = Depends(get_optional_user),
    supabase: Client = Depends(get_supabase),
):
    user_id = current_user["user_id"]
    try:
        row = {
            "user_id":    user_id,
            "title":      payload.title,
            "day":        payload.day,
            "start_hour": payload.startHour,
            "start_min":  payload.startMin,
            "end_hour":   payload.endHour,
            "end_min":    payload.endMin,
            "type":       payload.type,
            "icon":       payload.icon,
        }
        result = supabase.table(EVENTS_TABLE).insert(row).execute()
        return _row_to_event(result.data[0])
    except Exception as exc:
        logger.error("Failed to create agenda event: %s", exc)
        return CalEvent(id=uuid4().hex, **payload.model_dump())


@router.patch("/events/{event_id}", response_model=CalEvent)
async def update_event(
    event_id: str,
    payload: CalEventBase,
    current_user: dict = Depends(get_optional_user),
    supabase: Client = Depends(get_supabase),
):
    user_id = current_user["user_id"]
    try:
        row = {
            "title":      payload.title,
            "day":        payload.day,
            "start_hour": payload.startHour,
            "start_min":  payload.startMin,
            "end_hour":   payload.endHour,
            "end_min":    payload.endMin,
            "type":       payload.type,
            "icon":       payload.icon,
        }
        result = (
            supabase.table(EVENTS_TABLE)
            .update(row)
            .eq("id", event_id)
            .eq("user_id", user_id)
            .execute()
        )
        if not result.data:
            raise HTTPException(status_code=404, detail="Événement introuvable")
        return _row_to_event(result.data[0])
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Failed to update agenda event: %s", exc)
        return CalEvent(id=event_id, **payload.model_dump())


@router.delete("/events/{event_id}")
async def delete_event(
    event_id: str,
    current_user: dict = Depends(get_optional_user),
    supabase: Client = Depends(get_supabase),
):
    user_id = current_user["user_id"]
    try:
        supabase.table(EVENTS_TABLE).delete().eq("id", event_id).eq("user_id", user_id).execute()
        return {"status": "deleted"}
    except Exception as exc:
        logger.error("Failed to delete agenda event: %s", exc)
        raise HTTPException(status_code=500, detail="Could not delete event") from exc


# ── Task endpoints ─────────────────────────────────────────────────────────

@router.get("/tasks", response_model=List[Task])
async def list_tasks(
    current_user: dict = Depends(get_optional_user),
    supabase: Client = Depends(get_supabase),
):
    user_id = current_user["user_id"]
    try:
        result = (
            supabase.table(TASKS_TABLE)
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=False)
            .execute()
        )
        rows = result.data or []
        if not rows:
            return [Task(**t) for t in MOCK_TASKS]
        return [_row_to_task(r) for r in rows]
    except Exception as exc:
        logger.warning("Supabase unavailable for agenda tasks: %s", exc)
        return [Task(**t) for t in MOCK_TASKS]


@router.post("/tasks", response_model=Task)
async def create_task(
    payload: TaskBase,
    current_user: dict = Depends(get_optional_user),
    supabase: Client = Depends(get_supabase),
):
    user_id = current_user["user_id"]
    try:
        row = {
            "user_id":  user_id,
            "text":     payload.text,
            "done":     False,
            "priority": payload.priority,
        }
        result = supabase.table(TASKS_TABLE).insert(row).execute()
        return _row_to_task(result.data[0])
    except Exception as exc:
        logger.error("Failed to create agenda task: %s", exc)
        return Task(id=uuid4().hex, done=False, **payload.model_dump())


@router.patch("/tasks/{task_id}/toggle", response_model=Task)
async def toggle_task(
    task_id: str,
    current_user: dict = Depends(get_optional_user),
    supabase: Client = Depends(get_supabase),
):
    user_id = current_user["user_id"]
    try:
        res = (
            supabase.table(TASKS_TABLE)
            .select("done")
            .eq("id", task_id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )
        if not res.data:
            raise HTTPException(status_code=404, detail="Tâche introuvable")
        new_state = not res.data["done"]
        result = (
            supabase.table(TASKS_TABLE)
            .update({"done": new_state})
            .eq("id", task_id)
            .eq("user_id", user_id)
            .execute()
        )
        return _row_to_task(result.data[0])
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Failed to toggle task: %s", exc)
        raise HTTPException(status_code=500, detail="Could not toggle task") from exc


@router.delete("/tasks/{task_id}")
async def delete_task(
    task_id: str,
    current_user: dict = Depends(get_optional_user),
    supabase: Client = Depends(get_supabase),
):
    user_id = current_user["user_id"]
    try:
        supabase.table(TASKS_TABLE).delete().eq("id", task_id).eq("user_id", user_id).execute()
        return {"status": "deleted"}
    except Exception as exc:
        logger.error("Failed to delete task: %s", exc)
        raise HTTPException(status_code=500, detail="Could not delete task") from exc


# ── Smart suggest ──────────────────────────────────────────────────────────

@router.post("/smart-suggest", response_model=SmartSuggestResponse)
async def smart_suggest(
    current_user: dict = Depends(get_optional_user),
    supabase: Client = Depends(get_supabase),
):
    user_id = current_user["user_id"]
    try:
        result = (
            supabase.table(TASKS_TABLE)
            .select("*")
            .eq("user_id", user_id)
            .eq("done", False)
            .execute()
        )
        pending = [_row_to_task(r) for r in (result.data or [])]
    except Exception:
        pending = [Task(**t) for t in MOCK_TASKS if not t["done"]]

    if not pending:
        return SmartSuggestResponse(summary="Toutes les tâches sont complétées.", plan=["Aucune action requise."])

    ordered = sorted(pending, key=lambda t: {"high": 0, "medium": 1, "low": 2}[t.priority])
    plan = [f"{i + 1}. {t.text} — priorité {t.priority}" for i, t in enumerate(ordered)]
    return SmartSuggestResponse(
        summary="Plan optimisé généré pour organiser les tâches par priorité.",
        plan=plan,
    )
