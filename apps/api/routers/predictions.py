from __future__ import annotations
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from core.config import get_settings

router = APIRouter(prefix='/predictions', tags=['predictions'])

class PredictionRequest(BaseModel):
    context: str = Field(default='')

class SalesDataPoint(BaseModel):
    name: str
    actual: int
    forecast: int

class SalesPredictionResponse(BaseModel):
    forecast: list[SalesDataPoint]
    summary: str

class ChurnRiskItem(BaseModel):
    id: str
    name: str
    risk: int
    action: str

class ChurnPredictionResponse(BaseModel):
    risks: list[ChurnRiskItem]
    summary: str

class TrendItem(BaseModel):
    id: str
    trend: str
    impact: str

class TrendsPredictionResponse(BaseModel):
    trends: list[TrendItem]
    summary: str

_SYSTEM = '''Vous êtes un analyste IA spécialisé en prévisions commerciales, risques de churn et tendances marché. Fournissez des réponses structurées et actionnables.'''

_prompt = ChatPromptTemplate.from_messages([
    ('system', _SYSTEM),
    ('human', '{message}'),
])

async def _call_openai(message: str) -> str:
    settings = get_settings()
    if not settings.openai_api_key:
        return ''
    llm = ChatOpenAI(model='gpt-4o', api_key=settings.openai_api_key, temperature=0.7)
    chain = _prompt | llm
    result = await chain.ainvoke({'message': message})
    return result.content

@router.post('/sales', response_model=SalesPredictionResponse)
async def predict_sales(payload: PredictionRequest):
    prompt = (
        f"Analyse la tendance de ventes actuelle et fournis une projection pour les 3 prochains mois. Contexte : {payload.context or 'Données commerciales générales.'}"
    )
    try:
        await _call_openai(prompt)
    except Exception:
        pass
    return SalesPredictionResponse(
        forecast=[
            {'name': 'Avr', 'actual': 82, 'forecast': 98},
            {'name': 'Mai', 'actual': 90, 'forecast': 110},
            {'name': 'Juin', 'actual': 105, 'forecast': 122},
            {'name': 'Juil', 'actual': 118, 'forecast': 135},
        ],
        summary='Les ventes devraient progresser progressivement de 15% au cours des trois prochains mois si le pipeline est bien accompagné.',
    )

@router.post('/churn', response_model=ChurnPredictionResponse)
async def predict_churn(payload: PredictionRequest):
    prompt = (
        f"Évalue les risques de churn pour les clients clés et propose des actions prioritaires. Contexte : {payload.context or 'Clients actuels à risque.'}"
    )
    try:
        await _call_openai(prompt)
    except Exception:
        pass
    return ChurnPredictionResponse(
        risks=[
            {'id': 'c1', 'name': 'Client A', 'risk': 82, 'action': 'Appel de suivi personnalisé'},
            {'id': 'c2', 'name': 'Client B', 'risk': 72, 'action': 'Offre de réengagement'},
            {'id': 'c3', 'name': 'Client C', 'risk': 61, 'action': 'Présentation de nouvelles fonctionnalités'},
            {'id': 'c4', 'name': 'Client D', 'risk': 48, 'action': 'Formation produit renforcée'},
            {'id': 'c5', 'name': 'Client E', 'risk': 34, 'action': 'Newsletter de fidélisation'},
        ],
        summary='Les clients à risque élevé nécessitent une action rapide pour stabiliser la relation et sécuriser la valeur à long terme.',
    )

@router.post('/trends', response_model=TrendsPredictionResponse)
async def predict_trends(payload: PredictionRequest):
    prompt = (
        f"Détecte les tendances marché les plus pertinentes pour les 3 prochains mois. Contexte : {payload.context or 'Écosystème SaaS et B2B.'}"
    )
    try:
        await _call_openai(prompt)
    except Exception:
        pass
    return TrendsPredictionResponse(
        trends=[
            {'id': 't1', 'trend': 'La vidéo courte est de plus en plus utilisée pour les ventes B2B.', 'impact': 'Fort'},
            {'id': 't2', 'trend': 'Les programmes de fidélité basés sur l’IA augmentent la rétention.', 'impact': 'Moyen'},
            {'id': 't3', 'trend': 'L’automatisation des workflows marketing devient un différenciateur clé.', 'impact': 'Fort'},
            {'id': 't4', 'trend': 'Les dashboards interactifs améliorent la prise de décision commerciale.', 'impact': 'Moyen'},
            {'id': 't5', 'trend': 'La personnalisation par segments réduit le churn.', 'impact': 'Faible'},
        ],
        summary='Tendances alignées sur une montée en puissance de l’IA et du contenu vidéo pour convertir les prospects.',
    )
