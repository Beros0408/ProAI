from __future__ import annotations
import base64
import json
from typing import Literal
from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from PyPDF2 import PdfReader
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from core.config import get_settings

router = APIRouter(prefix="/upload", tags=["upload"])

class UploadAnalyzeResponse(BaseModel):
    type: Literal["image", "pdf"]
    analysis: str
    actions: list[str]

_SYSTEM = """Vous êtes un assistant d'analyse de fichiers. Vous recevez soit une image, soit un PDF. Fournissez un diagnostic clair et des actions concrètes.
Répondez uniquement avec un JSON valide contenant keys: type, analysis, actions."""

_prompt = ChatPromptTemplate.from_messages([
    ("system", _SYSTEM),
    ("human", "{message}"),
])

async def _analyze_with_ia(message: str) -> str:
    settings = get_settings()
    llm = ChatOpenAI(model="gpt-4o", api_key=settings.openai_api_key, temperature=0.3)
    chain = _prompt | llm
    result = await chain.ainvoke({"message": message})
    return result.content

@router.post("/analyze", response_model=UploadAnalyzeResponse)
async def analyze_upload(file: UploadFile = File(...)):
    try:
        content_bytes = await file.read()
        if file.content_type.startswith("image/"):
            encoded = base64.b64encode(content_bytes).decode()
            prompt = (
                "Analyse cette image encodée en base64. Ne tiens compte que de l'image et donne un retour clair sur son contenu, sa qualité visuelle et les actions possibles. "
                f"Réponds en JSON avec les champs type: 'image', analysis, actions.\nBase64: {encoded[:1000]}..."
            )
            raw = await _analyze_with_ia(prompt)
            payload = json.loads(raw.strip())
            return UploadAnalyzeResponse(**payload)

        if file.filename.lower().endswith(".pdf") or file.content_type == "application/pdf":
            reader = PdfReader(content_bytes)
            text = "\n".join(page.extract_text() or "" for page in reader.pages)
            prompt = (
                "Analyse ce document PDF et synthétise les points clés, les opportunités et les actions recommandées. "
                "Réponds en JSON avec les champs type: 'pdf', analysis, actions.\n\n"
                f"Texte extrait : {text[:20000]}"
            )
            raw = await _analyze_with_ia(prompt)
            payload = json.loads(raw.strip())
            return UploadAnalyzeResponse(**payload)

        raise HTTPException(status_code=400, detail="Type de fichier non pris en charge")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Réponse IA incorrecte, impossible de parser le JSON")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
