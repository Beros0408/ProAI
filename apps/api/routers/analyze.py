from __future__ import annotations
import json
import httpx
from pydantic import BaseModel, HttpUrl, Field
from fastapi import APIRouter, HTTPException
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from core.config import get_settings

router = APIRouter(prefix="/analyze", tags=["analyze"])

class WebsiteAnalyzeRequest(BaseModel):
    url: HttpUrl

class AnalysisDetail(BaseModel):
    summary: str
    score: str

class WebsiteAnalyzeResponse(BaseModel):
    score: int
    seo: AnalysisDetail
    performance: AnalysisDetail
    accessibility: AnalysisDetail
    best_practices: AnalysisDetail
    recommendations: list[str]

_SYSTEM = """Vous êtes un expert en SEO, UX et performance web. Pour chaque site web analysé, fournissez un diagnostic clair et mesurable.
Répondez uniquement avec un JSON valide contenant les clés : score, seo, performance, accessibility, best_practices, recommendations."""

_prompt = ChatPromptTemplate.from_messages([
    ("system", _SYSTEM),
    ("human", "{message}"),
])

async def _analyze_text(message: str) -> str:
    settings = get_settings()
    llm = ChatOpenAI(model="gpt-4o", api_key=settings.openai_api_key, temperature=0)
    chain = _prompt | llm
    result = await chain.ainvoke({"message": message})
    return result.content

@router.post("/website", response_model=WebsiteAnalyzeResponse)
async def analyze_website(body: WebsiteAnalyzeRequest):
    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.get(str(body.url), follow_redirects=True)
        response.raise_for_status()
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Impossible de récupérer l'URL : {exc}")

    prompt = (
        f"Analyse le HTML suivant pour en extraire les forces et faiblesses SEO, UX et performance :\n\n{response.text[:25000]}\n\n"  # Limit length
        "Retourne un JSON avec : score (0-100), seo, performance, accessibility, best_practices, recommendations."
    )
    try:
        raw = await _analyze_text(prompt)
        payload = json.loads(raw.strip())
        return WebsiteAnalyzeResponse(**payload)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Réponse IA incorrecte, impossible de parser le JSON")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
