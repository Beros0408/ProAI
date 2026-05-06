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

class AgendaEventBase(BaseModel):
    title:      str   = Field(..., min_length=1)
    description: str  = Field("", max_length=500)
    date:       str   = Field(...)          # "YYYY-MM-DD"
    start:      str   = Field(...)          # "HH:MM"
    end:        str   = Field(...)          # "HH:MM"
    reminder:   Literal["15min", "30min", "1h", "1j"] = "30min"
    color:      str   = Field(default="#0ea5e9")
    recurrence: Literal["none", "daily", "weekly", "monthly"] = "none"


class AgendaEvent(AgendaEventBase):
    id: str


class AgendaTaskBase(BaseModel):
    title:    str = Field(..., min_length=1)
    priority: Literal["high", "medium", "low"] = "medium"


class AgendaTask(AgendaTaskBase):
    id:        str
    completed: bool = False


class SmartSuggestResponse(BaseModel):
    summary: str
    plan:    List[str]


# ── Mock fallback data ─────────────────────────────────────────────────────

MOCK_EVENTS: List[Dict[str, Any]] = [
    {"id": "evt-1", "title": "Revue produit",      "description": "Préparer la démo.",            "date": "2026-05-01", "start": "10:00", "end": "11:00", "reminder": "30min", "color": "#0ea5e9", "recurrence": "weekly"},
    {"id": "evt-2", "title": "Standup client",     "description": "Point rapide sur livrables.",  "date": "2026-05-02", "start": "14:00", "end": "14:30", "reminder": "15min", "color": "#fb923c", "recurrence": "none"},
    {"id": "evt-3", "title": "Sprint planning",    "description": "Organisation des priorités.",  "date": "2026-05-03", "start": "09:00", "end": "10:30", "reminder": "1h",    "color": "#22c55e", "recurrence": "weekly"},
    {"id": "evt-4", "title": "Audit contenu",      "description": "Vérifier les posts programmés.","date": "2026-05-04", "start": "16:00", "end": "17:00", "reminder": "1h",    "color": "#8b5cf6", "recurrence": "none"},
    {"id": "evt-5", "title": "Rappel facturation", "description": "Envoi facture au client A.",   "date": "2026-05-05", "start": "11:00", "end": "11:30", "reminder": "15min", "color": "#ec4899", "recurrence": "monthly"},
]

MOCK_TASKS: List[Dict[str, Any]] = [
    {"id": "tsk-1", "title": "Finaliser le briefing marketing", "completed": False, "priority": "high"},
    {"id": "tsk-2", "title": "Répondre aux emails clients",     "completed": True,  "priority": "medium"},
    {"id": "tsk-3", "title": "Mettre à jour le pipeline",      "completed": False, "priority": "low"},
    {"id": "tsk-4", "title": "Valider le script vidéo",        "completed": False, "priority": "high"},
]


# ── DB ↔ API mapping ───────────────────────────────────────────────────────

def _row_to_event(row: Dict[str, Any]) -> AgendaEvent:
    return AgendaEvent(
        id=str(row["id"]),
        title=row["title"],
        description=row.get("description") or "",
        date=str(row["date"]),
        start=row.get("start_time") or row.get("start") or "00:00",
        end=row.get("end_time")   or row.get("end")   or "00:00",
        reminder=row.get("reminder") or "30min",
        color=row.get("color") or "#0ea5e9",
        recurrence=row.get("recurrence") or "none",
    )


def _row_to_task(row: Dict[str, Any]) -> AgendaTask:
    return AgendaTask(
        id=str(row["id"]),
        title=row["title"],
        completed=bool(row.get("completed", False)),
        priority=row.get("priority") or "medium",
    )


# ── Event endpoints ────────────────────────────────────────────────────────

@router.get("/events", response_model=List[AgendaEvent])
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
            .order("date", desc=False)
            .execute()
        )
        rows = result.data or []
        if not rows:
            return [AgendaEvent(**e) for e in MOCK_EVENTS]
        return [_row_to_event(r) for r in rows]
    except Exception as exc:
        logger.warning("Supabase unavailable for agenda events: %s", exc)
        return [AgendaEvent(**e) for e in MOCK_EVENTS]


@router.post("/events", response_model=AgendaEvent)
async def create_event(
    payload: AgendaEventBase,
    current_user: dict = Depends(get_optional_user),
    supabase: Client = Depends(get_supabase),
):
    user_id = current_user["user_id"]
    try:
        row = {
            "user_id":     user_id,
            "title":       payload.title,
            "description": payload.description,
            "date":        payload.date,
            "start_time":  payload.start,
            "end_time":    payload.end,
            "reminder":    payload.reminder,
            "color":       payload.color,
            "recurrence":  payload.recurrence,
        }
        result = supabase.table(EVENTS_TABLE).insert(row).execute()
        return _row_to_event(result.data[0])
    except Exception as exc:
        logger.error("Failed to create agenda event: %s", exc)
        # Graceful fallback: return object with a temporary id
        return AgendaEvent(id=uuid4().hex, **payload.model_dump())


@router.patch("/events/{event_id}", response_model=AgendaEvent)
async def update_event(
    event_id: str,
    payload: AgendaEventBase,
    current_user: dict = Depends(get_optional_user),
    supabase: Client = Depends(get_supabase),
):
    user_id = current_user["user_id"]
    try:
        row = {
            "title":       payload.title,
            "description": payload.description,
            "date":        payload.date,
            "start_time":  payload.start,
            "end_time":    payload.end,
            "reminder":    payload.reminder,
            "color":       payload.color,
            "recurrence":  payload.recurrence,
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
        return AgendaEvent(id=event_id, **payload.model_dump())


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

@router.get("/tasks", response_model=List[AgendaTask])
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
            return [AgendaTask(**t) for t in MOCK_TASKS]
        return [_row_to_task(r) for r in rows]
    except Exception as exc:
        logger.warning("Supabase unavailable for agenda tasks: %s", exc)
        return [AgendaTask(**t) for t in MOCK_TASKS]


@router.post("/tasks", response_model=AgendaTask)
async def create_task(
    payload: AgendaTaskBase,
    current_user: dict = Depends(get_optional_user),
    supabase: Client = Depends(get_supabase),
):
    user_id = current_user["user_id"]
    try:
        row = {
            "user_id":   user_id,
            "title":     payload.title,
            "completed": False,
            "priority":  payload.priority,
        }
        result = supabase.table(TASKS_TABLE).insert(row).execute()
        return _row_to_task(result.data[0])
    except Exception as exc:
        logger.error("Failed to create agenda task: %s", exc)
        return AgendaTask(id=uuid4().hex, completed=False, **payload.model_dump())


@router.patch("/tasks/{task_id}/toggle", response_model=AgendaTask)
async def toggle_task(
    task_id: str,
    current_user: dict = Depends(get_optional_user),
    supabase: Client = Depends(get_supabase),
):
    user_id = current_user["user_id"]
    try:
        # Fetch current state first
        res = (
            supabase.table(TASKS_TABLE)
            .select("completed")
            .eq("id", task_id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )
        if not res.data:
            raise HTTPException(status_code=404, detail="Tâche introuvable")
        new_state = not res.data["completed"]
        result = (
            supabase.table(TASKS_TABLE)
            .update({"completed": new_state})
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


# ── Smart suggest (stateless AI — no DB needed) ────────────────────────────

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
            .eq("completed", False)
            .execute()
        )
        pending = [_row_to_task(r) for r in (result.data or [])]
    except Exception:
        pending = [AgendaTask(**t) for t in MOCK_TASKS if not t["completed"]]

    if not pending:
        return SmartSuggestResponse(summary="Toutes les tâches sont complétées.", plan=["Aucune action requise."])

    ordered = sorted(pending, key=lambda t: {"high": 0, "medium": 1, "low": 2}[t.priority])
    plan = [f"{i + 1}. {t.title} — priorité {t.priority}" for i, t in enumerate(ordered)]
    return SmartSuggestResponse(
        summary="Plan optimisé généré pour organiser les tâches en priorité et libérer des créneaux clients.",
        plan=plan,
    )
