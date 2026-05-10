from __future__ import annotations

import io
from fastapi import APIRouter, Form, HTTPException, UploadFile, File
from pydantic import BaseModel
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from core.config import get_settings

router = APIRouter(prefix="/upload", tags=["upload"])

MAX_BYTES = 10 * 1024 * 1024  # 10 MB

ACCEPTED_MIME = {
    "image/png", "image/jpeg", "image/jpg", "image/webp",
    "application/pdf",
    "text/plain", "text/csv",
}


class UploadAnalyzeResponse(BaseModel):
    analysis: str
    file_type: str
    file_name: str


_SYSTEM_MSG = SystemMessage(
    content=(
        "Tu es un expert en analyse de documents professionnels pour des entrepreneurs et PME francophones. "
        "Tu reçois le contenu d'un fichier (image, PDF, texte ou CSV) et tu fournis une analyse claire et actionnée. "
        "Réponds toujours en français, en markdown bien structuré avec : "
        "un résumé du contenu, les points clés, et 3 recommandations concrètes."
    )
)


async def _call_llm(messages: list) -> str:
    settings = get_settings()
    llm = ChatOpenAI(model="gpt-4o", api_key=settings.openai_api_key, temperature=0.3)
    result = await llm.ainvoke([_SYSTEM_MSG] + messages)
    return result.content


@router.post("/analyze", response_model=UploadAnalyzeResponse)
async def analyze_upload(
    file: UploadFile = File(...),
    message: str = Form(""),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Aucun fichier reçu.")

    content_bytes = await file.read()
    if len(content_bytes) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="Fichier trop volumineux (max. 10 Mo).")

    mime = (file.content_type or "").lower()
    fname = file.filename
    user_context = f"\nContexte de l'utilisateur : {message}" if message.strip() else ""

    # ── Images ──────────────────────────────────────────────────────────────────
    if mime.startswith("image/"):
        import base64
        encoded = base64.b64encode(content_bytes).decode()
        data_url = f"data:{mime};base64,{encoded}"
        human = HumanMessage(
            content=[
                {
                    "type": "image_url",
                    "image_url": {"url": data_url, "detail": "high"},
                },
                {
                    "type": "text",
                    "text": (
                        f"Analyse cette image nommée « {fname} »."
                        f"{user_context}\n\n"
                        "Décris son contenu, identifie les éléments importants "
                        "et propose 3 recommandations actionnables."
                    ),
                },
            ]
        )
        analysis = await _call_llm([human])
        return UploadAnalyzeResponse(analysis=analysis, file_type="image", file_name=fname)

    # ── PDF ─────────────────────────────────────────────────────────────────────
    if mime == "application/pdf" or fname.lower().endswith(".pdf"):
        try:
            from pypdf import PdfReader
            reader = PdfReader(io.BytesIO(content_bytes))
            text = "\n".join(page.extract_text() or "" for page in reader.pages)
        except Exception as exc:
            raise HTTPException(status_code=422, detail=f"Impossible de lire ce PDF : {exc}")

        if not text.strip():
            raise HTTPException(status_code=422, detail="Le PDF ne contient pas de texte extractible.")

        human = HumanMessage(
            content=(
                f"Analyse ce document PDF nommé « {fname} »."
                f"{user_context}\n\n"
                f"Contenu extrait :\n{text[:20000]}"
            )
        )
        analysis = await _call_llm([human])
        return UploadAnalyzeResponse(analysis=analysis, file_type="pdf", file_name=fname)

    # ── Texte / CSV ──────────────────────────────────────────────────────────────
    if mime in ("text/plain", "text/csv") or fname.lower().endswith((".txt", ".csv")):
        try:
            text = content_bytes.decode("utf-8", errors="replace")
        except Exception as exc:
            raise HTTPException(status_code=422, detail=f"Impossible de lire ce fichier : {exc}")

        file_type = "csv" if (mime == "text/csv" or fname.lower().endswith(".csv")) else "txt"
        label = "CSV / tableur" if file_type == "csv" else "fichier texte"
        human = HumanMessage(
            content=(
                f"Analyse ce {label} nommé « {fname} »."
                f"{user_context}\n\n"
                f"Contenu :\n{text[:20000]}"
            )
        )
        analysis = await _call_llm([human])
        return UploadAnalyzeResponse(analysis=analysis, file_type=file_type, file_name=fname)

    raise HTTPException(
        status_code=415,
        detail="Format non supporté. Acceptés : PNG, JPG, PDF, TXT, CSV.",
    )
