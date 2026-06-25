from __future__ import annotations

import logging
from typing import Any, Dict, List, Literal, Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel, Field
from supabase import Client

from core.database import get_supabase
from core.security import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()

TABLE       = "workflows"
TABLE_STEPS = "workflow_steps"

VALID_TRIGGERS = Literal["manual", "new_lead", "webhook", "scheduled", "email_received"]
VALID_STEPS    = Literal["send_email", "send_slack", "create_task", "update_lead",
                         "linkedin_post", "webhook_call", "wait", "condition"]

# ── Pydantic models ────────────────────────────────────────────────────────────

class WorkflowStepIn(BaseModel):
    step_type: VALID_STEPS
    name: str = ""
    config: Dict[str, Any] = Field(default_factory=dict)


class WorkflowStepOut(BaseModel):
    id: str
    step_order: int
    step_type: str
    name: str
    config: Dict[str, Any]


class WorkflowCreate(BaseModel):
    name: str
    description: Optional[str] = None
    trigger_type: VALID_TRIGGERS = "manual"
    trigger_config: Dict[str, Any] = Field(default_factory=dict)
    steps: List[WorkflowStepIn] = Field(default_factory=list)


class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    trigger_type: Optional[VALID_TRIGGERS] = None
    trigger_config: Optional[Dict[str, Any]] = None
    steps: Optional[List[WorkflowStepIn]] = None


class WorkflowOut(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    trigger_type: str
    trigger_config: Dict[str, Any]
    is_active: bool
    run_count: int
    last_run_at: Optional[str] = None
    created_at: str
    steps: List[WorkflowStepOut] = Field(default_factory=list)


# ── Mock fallback ──────────────────────────────────────────────────────────────

MOCK_WORKFLOWS: List[Dict[str, Any]] = [
    {
        "id": "wf-1", "name": "Lead Scoring Auto", "description": "Score new leads automatically",
        "trigger_type": "new_lead", "trigger_config": {}, "is_active": True, "run_count": 42,
        "last_run_at": None, "created_at": "2026-04-15",
        "steps": [
            {"id": "s1", "step_order": 1, "step_type": "update_lead", "name": "Calculer le score IA", "config": {}},
            {"id": "s2", "step_order": 2, "step_type": "send_email",   "name": "Envoyer email de bienvenue", "config": {}},
        ],
    },
    {
        "id": "wf-2", "name": "Nurturing Hebdo", "description": None,
        "trigger_type": "scheduled", "trigger_config": {"cron": "0 9 * * 1"}, "is_active": False, "run_count": 8,
        "last_run_at": None, "created_at": "2026-04-20",
        "steps": [
            {"id": "s3", "step_order": 1, "step_type": "send_email", "name": "Newsletter hebdomadaire", "config": {}},
        ],
    },
]


# ── Helpers ────────────────────────────────────────────────────────────────────

def _row_to_out(row: Dict[str, Any], steps: List[Dict[str, Any]] | None = None) -> WorkflowOut:
    return WorkflowOut(
        id=str(row["id"]),
        name=row["name"],
        description=row.get("description"),
        trigger_type=row.get("trigger_type") or "manual",
        trigger_config=row.get("trigger_config") or {},
        is_active=bool(row.get("is_active", False)),
        run_count=int(row.get("run_count") or 0),
        last_run_at=str(row["last_run_at"])[:10] if row.get("last_run_at") else None,
        created_at=str(row.get("created_at") or "")[:10],
        steps=[
            WorkflowStepOut(
                id=str(s["id"]),
                step_order=int(s["step_order"]),
                step_type=s["step_type"],
                name=s.get("name") or "",
                config=s.get("config") or {},
            )
            for s in sorted(steps or [], key=lambda x: x.get("step_order", 0))
        ],
    )


def _fetch_steps(supabase: Client, workflow_id: str) -> List[Dict[str, Any]]:
    res = supabase.table(TABLE_STEPS).select("*").eq("workflow_id", workflow_id).execute()
    return res.data or []


def _replace_steps(supabase: Client, workflow_id: str, steps: List[WorkflowStepIn]) -> None:
    supabase.table(TABLE_STEPS).delete().eq("workflow_id", workflow_id).execute()
    if steps:
        rows = [
            {
                "workflow_id": workflow_id,
                "step_order": i + 1,
                "step_type": s.step_type,
                "name": s.name,
                "config": s.config,
            }
            for i, s in enumerate(steps)
        ]
        supabase.table(TABLE_STEPS).insert(rows).execute()


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.get("/", response_model=List[WorkflowOut])
async def list_workflows(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    user_id = current_user["user_id"]
    try:
        wf_res = (
            supabase.table(TABLE)
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=False)
            .execute()
        )
        rows = wf_res.data or []
        if not rows:
            return [WorkflowOut(**w) for w in MOCK_WORKFLOWS]
        result = []
        for row in rows:
            steps = _fetch_steps(supabase, row["id"])
            result.append(_row_to_out(row, steps))
        return result
    except Exception as exc:
        logger.warning("Supabase unavailable for workflows (GET): %s", exc)
        return [WorkflowOut(**w) for w in MOCK_WORKFLOWS]


@router.get("/{workflow_id}", response_model=WorkflowOut)
async def get_workflow(
    workflow_id: str,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    user_id = current_user["user_id"]
    try:
        res = (
            supabase.table(TABLE)
            .select("*")
            .eq("id", workflow_id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )
        if not res.data:
            raise HTTPException(status_code=404, detail="Workflow not found")
        steps = _fetch_steps(supabase, workflow_id)
        return _row_to_out(res.data, steps)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=404, detail="Workflow not found") from exc


@router.post("/", response_model=WorkflowOut, status_code=201)
async def create_workflow(
    data: WorkflowCreate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    user_id = current_user["user_id"]
    try:
        row = {
            "user_id":        user_id,
            "name":           data.name,
            "description":    data.description,
            "trigger_type":   data.trigger_type,
            "trigger_config": data.trigger_config,
            "is_active":      False,
        }
        wf_res = supabase.table(TABLE).insert(row).execute()
        wf = wf_res.data[0]
        _replace_steps(supabase, wf["id"], data.steps)
        steps = _fetch_steps(supabase, wf["id"])
        return _row_to_out(wf, steps)
    except Exception as exc:
        logger.error("Failed to create workflow: %s", exc)
        raise HTTPException(status_code=500, detail="Could not create workflow") from exc


@router.patch("/{workflow_id}", response_model=WorkflowOut)
async def update_workflow(
    workflow_id: str,
    data: WorkflowUpdate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    user_id = current_user["user_id"]
    updates: Dict[str, Any] = {}
    if data.name is not None:           updates["name"]           = data.name
    if data.description is not None:    updates["description"]    = data.description
    if data.trigger_type is not None:   updates["trigger_type"]   = data.trigger_type
    if data.trigger_config is not None: updates["trigger_config"] = data.trigger_config
    try:
        if updates:
            res = (
                supabase.table(TABLE)
                .update(updates)
                .eq("id", workflow_id)
                .eq("user_id", user_id)
                .execute()
            )
            if not res.data:
                raise HTTPException(status_code=404, detail="Workflow not found")
            wf = res.data[0]
        else:
            wf_res = (
                supabase.table(TABLE)
                .select("*")
                .eq("id", workflow_id)
                .eq("user_id", user_id)
                .single()
                .execute()
            )
            if not wf_res.data:
                raise HTTPException(status_code=404, detail="Workflow not found")
            wf = wf_res.data

        if data.steps is not None:
            _replace_steps(supabase, workflow_id, data.steps)

        steps = _fetch_steps(supabase, workflow_id)
        return _row_to_out(wf, steps)
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Failed to update workflow: %s", exc)
        raise HTTPException(status_code=500, detail="Could not update workflow") from exc


@router.patch("/{workflow_id}/toggle", response_model=WorkflowOut)
async def toggle_workflow(
    workflow_id: str,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    user_id = current_user["user_id"]
    try:
        cur = (
            supabase.table(TABLE)
            .select("is_active")
            .eq("id", workflow_id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )
        if not cur.data:
            raise HTTPException(status_code=404, detail="Workflow not found")
        new_state = not cur.data["is_active"]
        res = (
            supabase.table(TABLE)
            .update({"is_active": new_state})
            .eq("id", workflow_id)
            .eq("user_id", user_id)
            .execute()
        )
        steps = _fetch_steps(supabase, workflow_id)
        return _row_to_out(res.data[0], steps)
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Failed to toggle workflow: %s", exc)
        raise HTTPException(status_code=500, detail="Could not toggle workflow") from exc


@router.delete("/{workflow_id}")
async def delete_workflow(
    workflow_id: str,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
) -> Response:
    user_id = current_user["user_id"]
    try:
        supabase.table(TABLE).delete().eq("id", workflow_id).eq("user_id", user_id).execute()
    except Exception as exc:
        logger.error("Failed to delete workflow: %s", exc)
        raise HTTPException(status_code=500, detail="Could not delete workflow") from exc
    return Response(status_code=204)
