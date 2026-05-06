from __future__ import annotations

import logging
from datetime import date
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from supabase import Client

from core.database import get_supabase
from core.security import get_optional_user

logger = logging.getLogger(__name__)
router = APIRouter()

TABLE = "workflows"


# ── Pydantic models ────────────────────────────────────────────────────────

class WorkflowNode(BaseModel):
    id: str
    data: Dict[str, Any]
    position: Dict[str, float]
    type: str


class WorkflowEdge(BaseModel):
    id: str
    source: str
    target: str


class WorkflowCreate(BaseModel):
    name: str
    nodes: List[WorkflowNode] = []
    edges: List[WorkflowEdge] = []


class Workflow(BaseModel):
    id: str
    name: str
    active: bool
    createdAt: str
    nodes: List[WorkflowNode] = []
    edges: List[WorkflowEdge] = []


# ── Mock fallback ──────────────────────────────────────────────────────────

MOCK_WORKFLOWS: List[Dict[str, Any]] = [
    {"id": "wf-1", "name": "Lead Scoring",        "active": True,  "createdAt": "2024-04-15", "nodes": [], "edges": []},
    {"id": "wf-2", "name": "Email Nurturing",      "active": False, "createdAt": "2024-04-20", "nodes": [], "edges": []},
    {"id": "wf-3", "name": "Social Auto-Publish",  "active": True,  "createdAt": "2024-04-25", "nodes": [], "edges": []},
]


# ── DB ↔ API mapping ───────────────────────────────────────────────────────

def _row_to_workflow(row: Dict[str, Any]) -> Workflow:
    return Workflow(
        id=str(row["id"]),
        name=row["name"],
        active=bool(row.get("active", False)),
        createdAt=str(row.get("created_at") or row.get("createdAt") or date.today()),
        nodes=row.get("nodes") or [],
        edges=row.get("edges") or [],
    )


# ── Endpoints ──────────────────────────────────────────────────────────────

@router.get("/", response_model=List[Workflow])
async def get_workflows(
    current_user: dict = Depends(get_optional_user),
    supabase: Client = Depends(get_supabase),
):
    user_id = current_user["user_id"]
    try:
        result = (
            supabase.table(TABLE)
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=False)
            .execute()
        )
        rows = result.data or []
        if not rows:
            return [Workflow(**w) for w in MOCK_WORKFLOWS]
        return [_row_to_workflow(r) for r in rows]
    except Exception as exc:
        logger.warning("Supabase unavailable for workflows (GET): %s", exc)
        return [Workflow(**w) for w in MOCK_WORKFLOWS]


@router.post("/", response_model=Workflow)
async def create_workflow(
    workflow_data: WorkflowCreate,
    current_user: dict = Depends(get_optional_user),
    supabase: Client = Depends(get_supabase),
):
    user_id = current_user["user_id"]
    try:
        row = {
            "user_id": user_id,
            "name":    workflow_data.name,
            "active":  False,
            "nodes":   [n.model_dump() for n in workflow_data.nodes],
            "edges":   [e.model_dump() for e in workflow_data.edges],
        }
        result = supabase.table(TABLE).insert(row).execute()
        return _row_to_workflow(result.data[0])
    except Exception as exc:
        logger.error("Failed to create workflow: %s", exc)
        raise HTTPException(status_code=500, detail="Could not create workflow") from exc


@router.patch("/{workflow_id}/toggle", response_model=Workflow)
async def toggle_workflow(
    workflow_id: str,
    current_user: dict = Depends(get_optional_user),
    supabase: Client = Depends(get_supabase),
):
    user_id = current_user["user_id"]
    try:
        res = (
            supabase.table(TABLE)
            .select("active")
            .eq("id", workflow_id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )
        if not res.data:
            raise HTTPException(status_code=404, detail="Workflow not found")
        new_state = not res.data["active"]
        result = (
            supabase.table(TABLE)
            .update({"active": new_state})
            .eq("id", workflow_id)
            .eq("user_id", user_id)
            .execute()
        )
        return _row_to_workflow(result.data[0])
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Failed to toggle workflow: %s", exc)
        raise HTTPException(status_code=500, detail="Could not toggle workflow") from exc


@router.put("/{workflow_id}", response_model=Workflow)
async def update_workflow(
    workflow_id: str,
    workflow_data: WorkflowCreate,
    current_user: dict = Depends(get_optional_user),
    supabase: Client = Depends(get_supabase),
):
    user_id = current_user["user_id"]
    try:
        row = {
            "name":  workflow_data.name,
            "nodes": [n.model_dump() for n in workflow_data.nodes],
            "edges": [e.model_dump() for e in workflow_data.edges],
        }
        result = (
            supabase.table(TABLE)
            .update(row)
            .eq("id", workflow_id)
            .eq("user_id", user_id)
            .execute()
        )
        if not result.data:
            raise HTTPException(status_code=404, detail="Workflow not found")
        return _row_to_workflow(result.data[0])
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Failed to update workflow: %s", exc)
        raise HTTPException(status_code=500, detail="Could not update workflow") from exc


@router.delete("/{workflow_id}")
async def delete_workflow(
    workflow_id: str,
    current_user: dict = Depends(get_optional_user),
    supabase: Client = Depends(get_supabase),
):
    user_id = current_user["user_id"]
    try:
        supabase.table(TABLE).delete().eq("id", workflow_id).eq("user_id", user_id).execute()
        return {"message": "Workflow deleted"}
    except Exception as exc:
        logger.error("Failed to delete workflow: %s", exc)
        raise HTTPException(status_code=500, detail="Could not delete workflow") from exc
