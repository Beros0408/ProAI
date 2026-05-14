from __future__ import annotations

import logging
from typing import Any, Dict, List, Literal, Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel, Field, EmailStr
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
    estimated_value: int = 0
    # Enriched fields
    phone: Optional[str] = None
    job_title: Optional[str] = None
    source: Optional[Literal["linkedin", "website", "referral", "event", "other"]] = None
    status: Literal["to_contact", "contacted", "qualified", "won", "lost"] = "to_contact"
    score: int = Field(default=50, ge=0, le=100)
    notes: Optional[str] = None
    next_contact_at: Optional[str] = None  # ISO date string
    linkedin_url: Optional[str] = None
    website_url: Optional[str] = None
    tags: Optional[List[str]] = None


class LeadUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    company: Optional[str] = None
    estimated_value: Optional[int] = None
    phone: Optional[str] = None
    job_title: Optional[str] = None
    source: Optional[Literal["linkedin", "website", "referral", "event", "other"]] = None
    status: Optional[Literal["to_contact", "contacted", "qualified", "won", "lost"]] = None
    score: Optional[int] = Field(default=None, ge=0, le=100)
    notes: Optional[str] = None
    next_contact_at: Optional[str] = None
    linkedin_url: Optional[str] = None
    website_url: Optional[str] = None
    tags: Optional[List[str]] = None


class Lead(BaseModel):
    id: str
    name: str
    email: str
    company: str
    stage: str
    score: int
    estimated_value: int = 0
    notes: str = ""
    created_at: str
    # Enriched
    phone: Optional[str] = None
    job_title: Optional[str] = None
    source: Optional[str] = None
    status: str = "to_contact"
    next_contact_at: Optional[str] = None
    linkedin_url: Optional[str] = None
    website_url: Optional[str] = None
    tags: Optional[List[str]] = None


class LeadResponse(BaseModel):
    leads: List[Lead]
    stats: Dict[str, Any]


# ── Mock fallback ──────────────────────────────────────────────────────────

MOCK_LEADS: List[Dict[str, Any]] = [
    {"id": "1", "name": "Alice Dubois",  "email": "alice@techcorp.fr",    "company": "TechCorp",   "stage": "nouveau",    "score": 85, "estimated_value": 50000, "notes": "", "status": "to_contact",  "phone": "+33 6 12 34 56 78", "job_title": "Directrice Marketing",  "source": "linkedin",  "created_at": "2024-04-28"},
    {"id": "2", "name": "Bob Martin",    "email": "bob@startup.io",       "company": "Startup AI", "stage": "nouveau",    "score": 55, "estimated_value": 30000, "notes": "", "status": "contacted",   "phone": None,                "job_title": "CEO",                    "source": "website",   "created_at": "2024-04-27"},
    {"id": "3", "name": "Carol Johnson", "email": "carol@enterprise.com", "company": "Enterprise", "stage": "contacte",   "score": 90, "estimated_value": 100000,"notes": "Très intéressée", "status": "qualified", "phone": "+33 1 23 45 67 89", "job_title": "VP Sales",        "source": "referral",  "created_at": "2024-04-20"},
]


# ── DB ↔ API mapping ───────────────────────────────────────────────────────

def _score_int(raw: Any) -> int:
    """Handle legacy TEXT scores (hot/warm/cold) and integer scores."""
    if isinstance(raw, int):
        return max(0, min(100, raw))
    if isinstance(raw, str):
        return {"hot": 85, "warm": 50, "cold": 25}.get(raw, 50)
    return 50


def _row_to_lead(row: Dict[str, Any]) -> Lead:
    created = str(row.get("created_at") or "")[:10]
    nc = row.get("next_contact_at")
    return Lead(
        id=str(row["id"]),
        name=row["name"],
        email=row.get("email") or "",
        company=row.get("company") or "",
        stage=row.get("stage") or "nouveau",
        score=_score_int(row.get("score")),
        estimated_value=int(row.get("estimated_value") or 0),
        notes=row.get("notes") or "",
        created_at=created,
        phone=row.get("phone"),
        job_title=row.get("job_title"),
        source=row.get("source"),
        status=row.get("status") or "to_contact",
        next_contact_at=str(nc)[:10] if nc else None,
        linkedin_url=row.get("linkedin_url"),
        website_url=row.get("website_url"),
        tags=row.get("tags"),
    )


def _build_stats(leads: List[Lead]) -> Dict[str, Any]:
    total_value = sum(l.estimated_value for l in leads)
    return {
        "total": len(leads),
        "total_value": total_value,
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
        leads = [_row_to_lead(r) for r in rows] if rows else [Lead(**m) for m in MOCK_LEADS]
    except Exception as exc:
        logger.warning("Supabase unavailable for leads (GET): %s", exc)
        leads = [Lead(**m) for m in MOCK_LEADS]
    return LeadResponse(leads=leads, stats=_build_stats(leads))


@router.post("/leads", response_model=Lead, status_code=201)
async def create_lead(
    lead_data: LeadCreate,
    current_user: dict = Depends(get_optional_user),
    supabase: Client = Depends(get_supabase),
):
    user_id = current_user["user_id"]
    row: Dict[str, Any] = {
        "user_id":        user_id,
        "name":           lead_data.name,
        "email":          lead_data.email,
        "company":        lead_data.company,
        "estimated_value":lead_data.estimated_value,
        "stage":          "nouveau",
        "score":          lead_data.score,
        "notes":          lead_data.notes or "",
        "phone":          lead_data.phone,
        "job_title":      lead_data.job_title,
        "source":         lead_data.source,
        "status":         lead_data.status,
        "next_contact_at":lead_data.next_contact_at,
        "linkedin_url":   lead_data.linkedin_url,
        "website_url":    lead_data.website_url,
        "tags":           lead_data.tags,
    }
    try:
        result = supabase.table(TABLE).insert(row).execute()
        return _row_to_lead(result.data[0])
    except Exception as exc:
        logger.error("Failed to create lead: %s", exc)
        raise HTTPException(status_code=500, detail="Could not save lead") from exc


@router.patch("/leads/{lead_id}", response_model=Lead)
async def update_lead(
    lead_id: str,
    data: LeadUpdate,
    current_user: dict = Depends(get_optional_user),
    supabase: Client = Depends(get_supabase),
):
    user_id = current_user["user_id"]
    updates = {k: v for k, v in data.model_dump(exclude_none=True).items()}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    try:
        result = (
            supabase.table(TABLE)
            .update(updates)
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
        logger.error("Failed to update lead: %s", exc)
        raise HTTPException(status_code=500, detail="Could not update lead") from exc


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


@router.delete("/leads/{lead_id}")
async def delete_lead(
    lead_id: str,
    current_user: dict = Depends(get_optional_user),
    supabase: Client = Depends(get_supabase),
) -> Response:
    user_id = current_user["user_id"]
    try:
        supabase.table(TABLE).delete().eq("id", lead_id).eq("user_id", user_id).execute()
    except Exception as exc:
        logger.error("Failed to delete lead: %s", exc)
        raise HTTPException(status_code=500, detail="Could not delete lead") from exc
    return Response(status_code=204)


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
            f"Entreprise: {lead_row.get('company', '')}\n"
            f"Poste: {lead_row.get('job_title', '')}\n"
            f"Source: {lead_row.get('source', '')}\n"
            f"Notes: {lead_row.get('notes', '')}\n"
            "Réponds UNIQUEMENT avec un entier entre 0 et 100."
        )
        response = await llm.ainvoke(prompt)
        score_value = max(0, min(100, int(response.content.strip())))
        supabase.table(TABLE).update({"score": score_value}).eq("id", lead_id).eq("user_id", user_id).execute()
        return {"lead_id": lead_id, "score": score_value}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Error scoring lead: {exc}") from exc
