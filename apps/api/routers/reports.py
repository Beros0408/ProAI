from __future__ import annotations
import json
from uuid import uuid4
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from core.config import get_settings

router = APIRouter(prefix='/reports', tags=['reports'])

class ReportGenerateRequest(BaseModel):
    context: str = Field(default='')

class ReportResponse(BaseModel):
    report: str
    metrics: dict[str, int]
    date: str

_reports: list[ReportResponse] = [
    ReportResponse(
        report='Cette semaine a été marquée par un bon rythme d’exécution avec un focus sur l’acquisition et la qualification des leads.',
        metrics={'actionsCompleted': 28, 'kpis': 82, 'productivity': 89},
        date='2026-04-23',
    ),
    ReportResponse(
        report='Le pipeline reste solide, mais il est nécessaire d’augmenter la réactivité sur les opportunités hautement qualifiées.',
        metrics={'actionsCompleted': 21, 'kpis': 74, 'productivity': 82},
        date='2026-04-16',
    ),
]

_SYSTEM = '''Vous êtes un assistant capable de synthétiser une semaine de performance en actions, KPIs et recommandations claires.
Répondez uniquement avec un texte structuré en français.''' 

_prompt = ChatPromptTemplate.from_messages([
    ('system', _SYSTEM),
    ('human', '{message}'),
])

async def _generate_report(message: str) -> str:
    settings = get_settings()
    if not settings.openai_api_key:
        return (
            'Cette semaine a été positive avec une amélioration du suivi client, une hausse des conversions et des recommandations pour optimiser la prospection.'
        )
    llm = ChatOpenAI(model='gpt-4o', api_key=settings.openai_api_key, temperature=0.7)
    chain = _prompt | llm
    result = await chain.ainvoke({'message': message})
    return result.content

@router.post('/generate', response_model=ReportResponse)
async def generate_report(payload: ReportGenerateRequest):
    prompt = (
        f"Rédige un rapport hebdomadaire en français en résumant les actions réalisées, les KPIs clés et trois recommandations pour la semaine prochaine. "
        f"Contexte : {payload.context or 'Aucun contexte spécifique fourni.'}"
    )
    try:
        report_text = await _generate_report(prompt)
        new_report = ReportResponse(
            report=report_text,
            metrics={'actionsCompleted': 26, 'kpis': 80, 'productivity': 87},
            date=__import__('datetime').date.today().isoformat(),
        )
        _reports.insert(0, new_report)
        return new_report
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

@router.get('', response_model=list[ReportResponse])
async def get_reports():
    return _reports
