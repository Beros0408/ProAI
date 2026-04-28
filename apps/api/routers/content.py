from __future__ import annotations
from typing import Literal
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from core.config import get_settings

router = APIRouter(prefix="/content", tags=["content"])

class LinkedInRequest(BaseModel):
    topic: str = Field(..., min_length=1)
    tone: Literal["professional", "casual", "inspirational"]
    language: Literal["fr", "en"]

class NewsletterRequest(BaseModel):
    topic: str = Field(..., min_length=1)
    sections: int = Field(..., ge=2, le=6)
    language: Literal["fr", "en"]

class EmailRequest(BaseModel):
    type: Literal["cold", "followup", "relance", "remerciement"]
    context: str = Field(..., min_length=1)
    language: Literal["fr", "en"]

class ContentResponse(BaseModel):
    content: str
    suggestions: list[str]

_SYSTEM = """Vous êtes un assistant expert en génération de contenu professionnel. Vous aidez à produire des textes clairs, engageants et adaptés au format demandé.
Respectez le ton, la langue, et fournissez toujours des hashtags ou appels à l'action pertinents.
Répondez uniquement avec le contenu demandé et une liste de suggestions."""

_prompt = ChatPromptTemplate.from_messages([
    ("system", _SYSTEM),
    ("human", "{message}"),
])

async def _generate_text(message: str) -> str:
    settings = get_settings()
    llm = ChatOpenAI(model="gpt-4o", api_key=settings.openai_api_key, temperature=0.7)
    chain = _prompt | llm
    result = await chain.ainvoke({"message": message})
    return result.content

@router.post("/linkedin", response_model=ContentResponse)
async def generate_linkedin(body: LinkedInRequest):
    prompt = (
        f"Génère un post LinkedIn en {body.language} sur le sujet suivant : {body.topic}. "
        f"Utilise un ton {body.tone}, propose un hook fort, un corps de message structuré, des hashtags et un appel à l'action clair. "
        f"Rends le texte professionnel et accessible."
    )
    try:
        content = await _generate_text(prompt)
        suggestions = [
            "Variez les hashtags pour toucher une audience plus large",
            "Ajoutez une question finale pour améliorer l'engagement",
            "Mentionnez une ressource ou un lien utile",
        ]
        return ContentResponse(content=content, suggestions=suggestions)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

@router.post("/newsletter", response_model=ContentResponse)
async def generate_newsletter(body: NewsletterRequest):
    prompt = (
        f"Rédige une newsletter en {body.language} sur le thème : {body.topic}. "
        f"Structure-la en {body.sections} sections claires avec des titres, un court sommaire et une conclusion. "
        f"Ajoute des conseils actionnables, un ton professionnel et un appel à l'action à la fin."
    )
    try:
        content = await _generate_text(prompt)
        suggestions = [
            "Personnalisez l'introduction avec le nom du destinataire",
            "Incluez un lien vers une ressource ou un article lié",
            "Ajoutez une phrase de relance pour le prochain envoi",
        ]
        return ContentResponse(content=content, suggestions=suggestions)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

@router.post("/email", response_model=ContentResponse)
async def generate_email(body: EmailRequest):
    type_map = {
        "cold": "un cold email professionnel pour un prospect froid",
        "followup": "un email de relance après une première prise de contact",
        "relance": "un email de relance commercial avec un ton respectueux",
        "remerciement": "un email de remerciement après un rendez-vous ou une collaboration",
    }
    prompt = (
        f"Rédige {type_map[body.type]} en {body.language} sur le contexte suivant : {body.context}. "
        f"Sois clair, structuré et termine avec un appel à l'action simple."
    )
    try:
        content = await _generate_text(prompt)
        suggestions = [
            "Personnalisez l'objet pour augmenter le taux d'ouverture",
            "Ajoutez un paragraphe de preuve sociale ou de résultats",
            "Incluez une phrase de relance polie en fin d'email",
        ]
        return ContentResponse(content=content, suggestions=suggestions)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
