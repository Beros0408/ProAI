from __future__ import annotations

import logging
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from supabase import Client

from core.config import get_settings
from core.database import get_supabase
from core.security import get_optional_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/onboarding", tags=["onboarding"])

TABLE = "business_profiles"


# ── Pydantic models ────────────────────────────────────────────────────────

class BusinessProfileCreate(BaseModel):
    business_name:   str | None = None
    sector:          str | None = None
    target_audience: str | None = None
    main_objective:  str | None = None
    company_size:    str | None = None
    current_tools:   str | None = None


class BusinessProfileResponse(BusinessProfileCreate):
    id:               str
    user_id:          str
    business_summary: str | None = None


# ── Helpers ────────────────────────────────────────────────────────────────

async def _generate_summary(payload: BusinessProfileCreate) -> str:
    """Call LLM to produce a 2-3 sentence business summary. Falls back to a template."""
    try:
        from langchain_openai import ChatOpenAI

        settings = get_settings()
        llm = ChatOpenAI(model="gpt-4o-mini", api_key=settings.openai_api_key, temperature=0.7)
        prompt = (
            "Génère un résumé business de 2-3 phrases pour ce profil, en français, "
            "commençant par le nom de l'entreprise.\n\n"
            f"Nom: {payload.business_name or 'Non renseigné'}\n"
            f"Secteur: {payload.sector or 'Non renseigné'}\n"
            f"Objectif: {payload.main_objective or 'Non renseigné'}\n"
            f"Cible: {payload.target_audience or 'Non renseigné'}\n"
            f"Taille équipe: {payload.company_size or 'Non renseigné'}\n"
            "Sois concis et orienté résultats."
        )
        response = await llm.ainvoke(prompt)
        return response.content.strip()
    except Exception as exc:
        logger.warning("LLM summary generation failed: %s", exc)
        name = payload.business_name or "Votre entreprise"
        sector = payload.sector or "business"
        obj = payload.main_objective or "la croissance"
        return f"{name} opère dans le secteur {sector} avec pour objectif principal : {obj}."


def _row_to_profile(row: Dict[str, Any]) -> BusinessProfileResponse:
    return BusinessProfileResponse(
        id=str(row["id"]),
        user_id=str(row["user_id"]),
        business_name=row.get("business_name"),
        sector=row.get("sector"),
        target_audience=row.get("target_audience"),
        main_objective=row.get("main_objective"),
        company_size=row.get("company_size"),
        current_tools=row.get("current_tools"),
        business_summary=row.get("business_summary"),
    )


# ── Endpoints ──────────────────────────────────────────────────────────────

@router.get("/profile", response_model=BusinessProfileResponse)
async def get_profile(
    current_user: dict = Depends(get_optional_user),
    supabase: Client = Depends(get_supabase),
):
    """Return the business profile for the current user."""
    user_id = current_user["user_id"]
    try:
        res = (
            supabase.table(TABLE)
            .select("*")
            .eq("user_id", user_id)
            .single()
            .execute()
        )
        if not res.data:
            raise HTTPException(status_code=404, detail="Profil introuvable")
        return _row_to_profile(res.data)
    except HTTPException:
        raise
    except Exception as exc:
        logger.warning("Could not fetch business profile: %s", exc)
        raise HTTPException(status_code=404, detail="Profil introuvable") from exc


@router.post("/profile", response_model=BusinessProfileResponse)
async def upsert_profile(
    payload: BusinessProfileCreate,
    current_user: dict = Depends(get_optional_user),
    supabase: Client = Depends(get_supabase),
):
    """Create or update the business profile for the current user."""
    user_id = current_user["user_id"]

    summary = await _generate_summary(payload)

    row = {
        "user_id":          user_id,
        "business_name":    payload.business_name,
        "sector":           payload.sector,
        "target_audience":  payload.target_audience,
        "main_objective":   payload.main_objective,
        "company_size":     payload.company_size,
        "current_tools":    payload.current_tools,
        "business_summary": summary,
    }

    try:
        result = (
            supabase.table(TABLE)
            .upsert(row, on_conflict="user_id")
            .execute()
        )
        return _row_to_profile(result.data[0])
    except Exception as exc:
        logger.error("Failed to upsert business profile: %s", exc)
        raise HTTPException(status_code=500, detail="Could not save profile") from exc
