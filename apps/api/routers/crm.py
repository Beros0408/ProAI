from __future__ import annotations

import logging
from typing import Any, Dict, List, Literal, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from supabase import Client

from core.config import get_settings
from core.database import get_supabase
from core.security import get_optional_user

logger = logging.getLogger(__name__)
router = APIRouter()

TABLE = "leads"

# ── Pydantic models ────────────────────────────────────────────────────────

class LeadCreate(BaseModel):
    name: str
    email: str = ""
    company: str = ""
    notes: str = ""


class Lead(BaseModel):
    id: str
    name: str
    email: str
    company: str
    stage: str
    score: int
    notes: str
    created_at: str


class LeadResponse(BaseModel):
    leads: List[Lead]
    stats: Dict[str, Any]


# ── Mock fallback ──────────────────────────────────────────────────────────

MOCK_LEADS: List[Dict[str, Any]] = [
    {"id": "1", "name": "Alice Dubois",  "email": "alice@techcorp.fr",    "company": "TechCorp",    "stage": "nouveau",    "score": 85, "notes": "", "created_at": "2024-04-28"},
    {"id": "2", "name": "Bob Martin",    "email": "bob@startup.io",       "company": "Startup AI",  "stage": "nouveau",    "score": 55, "notes": "", "created_at": "2024-04-27"},
    {"id": "3", "name": "Carol Johnson", "email": "carol@enterprise.com", "company": "Enterprise",  "stage": "contacte",   "score": 90, "notes": "", "created_at": "2024-04-20"},
]


# ── DB ↔ API mapping ───────────────────────────────────────────────────────

def _row_to_lead(row: Dict[str, Any]) -> Lead:
    created = str(row.get("created_at") or "")[:10]
    return Lead(
        id=str(row["id"]),
        name=row["name"],
        email=row.get("email") or "",
        company=row.get("company") or "",
        stage=row.get("stage") or "nouveau",
        score=int(row.get("score") or 0),
        notes=row.get("notes") or "",
        created_at=created,
    )


def _build_stats(leads: List[Lead]) -> Dict[str, Any]:
    return {
        "total": len(leads),
        "by_stage": {
            "nouveau":     sum(1 for l in leads if l.stage == "nouveau"),
            "contacte":    sum(1 for l in leads if l.stage == "contacte"),
            "negociation": sum(1 for l in leads if l.stage == "negociation"),
            "gagne":       sum(1 for l in leads if l.stage == "gagne"),
        },
        "avg_score": round(sum(l.score for l in leads) / len(leads), 1) if leads else 0,
    }


# ── Endpoints ──────────────────────────────────────────────────────────────

@router.get("/leads", response_model=LeadResponse)
async def get_leads(
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
            leads = [Lead(**m) for m in MOCK_LEADS]
        else:
            leads = [_row_to_lead(r) for r in rows]
    except Exception as exc:
        logger.warning("Supabase unavailable for leads (GET): %s", exc)
        leads = [Lead(**m) for m in MOCK_LEADS]

    return LeadResponse(leads=leads, stats=_build_stats(leads))


@router.post("/leads", response_model=Lead)
async def create_lead(
    lead_data: LeadCreate,
    current_user: dict = Depends(get_optional_user),
    supabase: Client = Depends(get_supabase),
):
    user_id = current_user["user_id"]
    try:
        row = {
            "user_id": user_id,
            "name":    lead_data.name,
            "email":   lead_data.email,
            "company": lead_data.company,
            "notes":   lead_data.notes,
            "stage":   "nouveau",
            "score":   0,
        }
        result = supabase.table(TABLE).insert(row).execute()
        return _row_to_lead(result.data[0])
    except Exception as exc:
        logger.error("Failed to create lead: %s", exc)
        raise HTTPException(status_code=500, detail="Could not save lead") from exc


@router.patch("/leads/{lead_id}/stage")
async def update_lead_stage(
    lead_id: str,
    stage: Literal["nouveau", "contacte", "negociation", "gagne"],
    current_user: dict = Depends(get_optional_user),
    supabase: Client = Depends(get_supabase),
):
    user_id = current_user["user_id"]
    try:
        result = (
            supabase.table(TABLE)
            .update({"stage": stage})
            .eq("id", lead_id)
            .eq("user_id", user_id)
            .execute()
        )
        if not result.data:
            raise HTTPException(status_code=404, detail="Lead not found")
        return _row_to_lead(result.data[0])
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Failed to update lead stage: %s", exc)
        raise HTTPException(status_code=500, detail="Could not update lead stage") from exc


@router.patch("/leads/{lead_id}/score")
async def update_lead_score(
    lead_id: str,
    score: int,
    current_user: dict = Depends(get_optional_user),
    supabase: Client = Depends(get_supabase),
):
    user_id = current_user["user_id"]
    try:
        result = (
            supabase.table(TABLE)
            .update({"score": max(0, min(100, score))})
            .eq("id", lead_id)
            .eq("user_id", user_id)
            .execute()
        )
        if not result.data:
            raise HTTPException(status_code=404, detail="Lead not found")
        return _row_to_lead(result.data[0])
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Failed to update lead score: %s", exc)
        raise HTTPException(status_code=500, detail="Could not update lead score") from exc


@router.delete("/leads/{lead_id}", status_code=204)
async def delete_lead(
    lead_id: str,
    current_user: dict = Depends(get_optional_user),
    supabase: Client = Depends(get_supabase),
):
    user_id = current_user["user_id"]
    try:
        supabase.table(TABLE).delete().eq("id", lead_id).eq("user_id", user_id).execute()
    except Exception as exc:
        logger.error("Failed to delete lead: %s", exc)
        raise HTTPException(status_code=500, detail="Could not delete lead") from exc


@router.post("/leads/{lead_id}/ai-score")
async def ai_score_lead(
    lead_id: str,
    current_user: dict = Depends(get_optional_user),
    supabase: Client = Depends(get_supabase),
):
    """Score a lead with AI (0-100) and persist."""
    user_id = current_user["user_id"]
    try:
        res = (
            supabase.table(TABLE)
            .select("*")
            .eq("id", lead_id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )
        lead_row = res.data
        if not lead_row:
            raise HTTPException(status_code=404, detail="Lead not found")
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=404, detail="Lead not found") from exc

    try:
        from langchain_openai import ChatOpenAI

        settings = get_settings()
        llm = ChatOpenAI(model="gpt-4o-mini", api_key=settings.openai_api_key, temperature=0.2)
        prompt = (
            f"Évalue ce lead sur une échelle 0-100.\n"
            f"Nom: {lead_row['name']}\nEmail: {lead_row.get('email', '')}\n"
            f"Entreprise: {lead_row.get('company', '')}\nNotes: {lead_row.get('notes', '')}\n"
            "Réponds UNIQUEMENT avec un entier entre 0 et 100."
        )
        response = await llm.ainvoke(prompt)
        score_value = max(0, min(100, int(response.content.strip())))

        supabase.table(TABLE).update({"score": score_value}).eq("id", lead_id).eq("user_id", user_id).execute()
        return {"lead_id": lead_id, "score": score_value}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Error scoring lead: {exc}") from exc
