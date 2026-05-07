from __future__ import annotations

from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from supabase import Client
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

from core.config import get_settings
from core.database import get_supabase
from core.security import get_optional_user

router = APIRouter(prefix='/reports', tags=['reports'])


class ReportGenerateRequest(BaseModel):
    context: str = Field(default='')


class ReportResponse(BaseModel):
    report: str
    metrics: dict[str, int]
    date: str


_reports: list[ReportResponse] = [
    ReportResponse(
        report="Cette semaine a été marquée par un bon rythme d'exécution avec un focus sur l'acquisition et la qualification des leads.",
        metrics={'actionsCompleted': 28, 'kpis': 82, 'productivity': 89},
        date='2026-04-23',
    ),
    ReportResponse(
        report="Le pipeline reste solide, mais il est nécessaire d'augmenter la réactivité sur les opportunités hautement qualifiées.",
        metrics={'actionsCompleted': 21, 'kpis': 74, 'productivity': 82},
        date='2026-04-16',
    ),
]

_SYSTEM = (
    "Vous êtes un assistant analytique expert. "
    "Synthétisez les données de performance en un rapport hebdomadaire structuré, "
    "percutant et actionnable, rédigé en français impeccable. "
    "Format : paragraphe de synthèse, points forts, points d'amélioration, 3 recommandations concrètes."
)

_prompt = ChatPromptTemplate.from_messages([
    ('system', _SYSTEM),
    ('human', '{message}'),
])


async def _fetch_week_stats(user_id: str, supabase: Client) -> dict[str, int]:
    """Récupère les métriques réelles de la semaine depuis Supabase."""
    week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    stats: dict[str, int] = {
        'conversations': 0,
        'leads': 0,
        'tasks_done': 0,
        'posts_scheduled': 0,
    }

    try:
        res = (
            supabase.table('conversations')
            .select('*', count='exact')
            .eq('user_id', user_id)
            .gte('created_at', week_ago)
            .execute()
        )
        stats['conversations'] = res.count or 0
    except Exception:
        pass

    try:
        res = (
            supabase.table('leads')
            .select('*', count='exact')
            .eq('user_id', user_id)
            .gte('created_at', week_ago)
            .execute()
        )
        stats['leads'] = res.count or 0
    except Exception:
        pass

    try:
        res = (
            supabase.table('agenda_tasks')
            .select('*', count='exact')
            .eq('user_id', user_id)
            .eq('done', True)
            .execute()
        )
        stats['tasks_done'] = res.count or 0
    except Exception:
        pass

    try:
        res = (
            supabase.table('scheduled_posts')
            .select('*', count='exact')
            .eq('user_id', user_id)
            .gte('created_at', week_ago)
            .execute()
        )
        stats['posts_scheduled'] = res.count or 0
    except Exception:
        pass

    return stats


async def _generate_report_text(prompt_text: str) -> str:
    settings = get_settings()
    if not settings.openai_api_key:
        return (
            "Cette semaine a été positive avec une amélioration du suivi client, "
            "une hausse des conversions et des recommandations pour optimiser la prospection."
        )
    llm = ChatOpenAI(model='gpt-4o-mini', api_key=settings.openai_api_key, temperature=0.7)
    chain = _prompt | llm
    result = await chain.ainvoke({'message': prompt_text})
    return result.content


@router.post('/generate', response_model=ReportResponse)
async def generate_report(
    payload: ReportGenerateRequest,
    current_user: dict = Depends(get_optional_user),
    supabase: Client = Depends(get_supabase),
):
    user_id = current_user["user_id"]

    # Récupération des données réelles
    stats = await _fetch_week_stats(user_id, supabase)

    stats_summary = (
        f"Données réelles de la semaine écoulée :\n"
        f"- Conversations initiées : {stats['conversations']}\n"
        f"- Leads ajoutés au pipeline : {stats['leads']}\n"
        f"- Tâches complétées : {stats['tasks_done']}\n"
        f"- Posts planifiés : {stats['posts_scheduled']}\n"
    )

    actions_total = stats['conversations'] + stats['tasks_done'] + stats['posts_scheduled']
    kpis_score = min(100, max(50, 60 + stats['leads'] * 3 + stats['conversations'] * 2))
    productivity = min(100, max(55, 65 + stats['tasks_done'] * 4))

    prompt_text = (
        "Rédige un rapport hebdomadaire professionnel en français. "
        "Inclus une synthèse exécutive, les points forts, les axes d'amélioration "
        "et 3 recommandations concrètes pour la semaine prochaine.\n\n"
        f"{stats_summary}"
        f"Contexte additionnel : {payload.context or 'Aucun contexte spécifique fourni.'}"
    )

    try:
        report_text = await _generate_report_text(prompt_text)
        new_report = ReportResponse(
            report=report_text,
            metrics={
                'actionsCompleted': max(actions_total, 5),
                'kpis': kpis_score,
                'productivity': productivity,
            },
            date=datetime.now(timezone.utc).date().isoformat(),
        )
        _reports.insert(0, new_report)
        return new_report
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get('', response_model=list[ReportResponse])
async def get_reports(
    current_user: dict = Depends(get_optional_user),
    supabase: Client = Depends(get_supabase),
):
    return _reports
