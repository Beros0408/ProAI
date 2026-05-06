from __future__ import annotations

import logging
from datetime import date
from typing import Any, Dict, List, Literal

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
    estimatedValue: int = 0


class Lead(BaseModel):
    id: str
    name: str
    email: str
    company: str
    estimatedValue: int
    dateAdded: str
    score: Literal["hot", "warm", "cold"]
    stage: Literal["nouveau", "contacte", "negociation", "gagne"]


class LeadResponse(BaseModel):
    leads: List[Lead]
    stats: Dict[str, Any]


# ── Mock fallback ──────────────────────────────────────────────────────────

MOCK_LEADS: List[Dict[str, Any]] = [
    {"id": "1", "name": "Alice Dubois",  "email": "alice@techcorp.fr",    "company": "TechCorp",    "estimatedValue": 50000,  "dateAdded": "2024-04-28", "score": "hot",  "stage": "nouveau"},
    {"id": "2", "name": "Bob Martin",    "email": "bob@startup.io",       "company": "Startup AI",  "estimatedValue": 30000,  "dateAdded": "2024-04-27", "score": "warm", "stage": "nouveau"},
    {"id": "3", "name": "Carol Johnson", "email": "carol@enterprise.com", "company": "Enterprise",  "estimatedValue": 100000, "dateAdded": "2024-04-20", "score": "hot",  "stage": "contacte"},
]


# ── DB ↔ API mapping ───────────────────────────────────────────────────────

def _row_to_lead(row: Dict[str, Any]) -> Lead:
    """Convert a Supabase snake_case row to the Lead response schema."""
    return Lead(
        id=str(row["id"]),
        name=row["name"],
        email=row.get("email") or "",
        company=row.get("company") or "",
        estimatedValue=row.get("estimated_value") or 0,
        dateAdded=str(row.get("date_added") or date.today()),
        score=row.get("score") or "cold",
        stage=row.get("stage") or "nouveau",
    )


def _build_stats(leads: List[Lead]) -> Dict[str, Any]:
    total_value = sum(l.estimatedValue for l in leads)
    return {
        "total": len(leads),
        "value": total_value,
        "by_stage": {
            "nouveau":     sum(1 for l in leads if l.stage == "nouveau"),
            "contacte":    sum(1 for l in leads if l.stage == "contacte"),
            "negociation": sum(1 for l in leads if l.stage == "negociation"),
            "gagne":       sum(1 for l in leads if l.stage == "gagne"),
        },
    }


# ── Endpoints ──────────────────────────────────────────────────────────────

@router.get("/leads", response_model=LeadResponse)
async def get_leads(
    current_user: dict = Depends(get_optional_user),
    supabase: Client = Depends(get_supabase),
):
    """Return all leads for the current user, falling back to mock data."""
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
        # If the DB is empty for this user, seed it with mock data once
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
    """Persist a new lead to Supabase."""
    user_id = current_user["user_id"]
    try:
        row = {
            "user_id":         user_id,
            "name":            lead_data.name,
            "email":           lead_data.email,
            "company":         lead_data.company,
            "estimated_value": lead_data.estimatedValue,
            "date_added":      str(date.today()),
            "score":           "cold",
            "stage":           "nouveau",
        }
        result = supabase.table(TABLE).insert(row).execute()
        return _row_to_lead(result.data[0])
    except Exception as exc:
        logger.error("Failed to create lead in Supabase: %s", exc)
        raise HTTPException(status_code=500, detail="Could not save lead") from exc


@router.patch("/leads/{lead_id}/stage")
async def update_lead_stage(
    lead_id: str,
    stage: Literal["nouveau", "contacte", "negociation", "gagne"],
    current_user: dict = Depends(get_optional_user),
    supabase: Client = Depends(get_supabase),
):
    """Move a lead to a different pipeline stage."""
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


@router.delete("/leads/{lead_id}", status_code=204)
async def delete_lead(
    lead_id: str,
    current_user: dict = Depends(get_optional_user),
    supabase: Client = Depends(get_supabase),
):
    """Delete a lead."""
    user_id = current_user["user_id"]
    try:
        supabase.table(TABLE).delete().eq("id", lead_id).eq("user_id", user_id).execute()
    except Exception as exc:
        logger.error("Failed to delete lead: %s", exc)
        raise HTTPException(status_code=500, detail="Could not delete lead") from exc


@router.post("/leads/{lead_id}/score")
async def score_lead(
    lead_id: str,
    current_user: dict = Depends(get_optional_user),
    supabase: Client = Depends(get_supabase),
):
    """Score a lead with AI and persist the result."""
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
        llm = ChatOpenAI(model="gpt-4o", api_key=settings.openai_api_key, temperature=0.3)
        prompt = (
            f"Évalue la qualité du lead sur une échelle 1-100.\n"
            f"Nom: {lead_row['name']}\nEmail: {lead_row['email']}\n"
            f"Entreprise: {lead_row['company']}\nValeur estimée: {lead_row['estimated_value']} €\n"
            "Réponds UNIQUEMENT avec un nombre entre 1 et 100."
        )
        response = await llm.ainvoke(prompt)
        score_value = int(response.content.strip())
        new_score = "hot" if score_value >= 90 else ("warm" if score_value >= 50 else "cold")

        supabase.table(TABLE).update({"score": new_score}).eq("id", lead_id).eq("user_id", user_id).execute()
        return {"lead_id": lead_id, "score": new_score, "value": score_value}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Error scoring lead: {exc}") from exc
