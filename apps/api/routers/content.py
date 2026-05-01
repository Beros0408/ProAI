from __future__ import annotations
from typing import Literal
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from core.config import get_settings

router = APIRouter(prefix='/content', tags=['content'])

class LinkedInRequest(BaseModel):
    topic: str = Field(..., min_length=1)
    tone: Literal['professional', 'casual', 'inspirational']
    language: Literal['fr', 'en']

class NewsletterRequest(BaseModel):
    topic: str = Field(..., min_length=1)
    sections: int = Field(..., ge=2, le=6)
    language: Literal['fr', 'en']

class EmailRequest(BaseModel):
    type: Literal['cold', 'followup', 'relance', 'remerciement']
    context: str = Field(..., min_length=1)
    language: Literal['fr', 'en']

class InstagramRequest(BaseModel):
    subject: str = Field(..., min_length=1)
    style: Literal['carousel', 'reel', 'story']
    language: Literal['fr', 'en']

class FacebookRequest(BaseModel):
    subject: str = Field(..., min_length=1)
    type: Literal['post', 'event', 'publicité']
    language: Literal['fr', 'en']

class TwitterRequest(BaseModel):
    subject: str = Field(..., min_length=1)
    format: Literal['tweet unique', 'thread']
    language: Literal['fr', 'en']

class BlogRequest(BaseModel):
    subject: str = Field(..., min_length=1)
    keywords: str = Field(..., min_length=1)
    length: Literal['court', 'moyen', 'long']
    language: Literal['fr', 'en']

class VideoScriptRequest(BaseModel):
    subject: str = Field(..., min_length=1)
    platform: Literal['YouTube', 'TikTok', 'Reels']
    duration: str = Field(..., min_length=1)
    language: Literal['fr', 'en']

class ContentResponse(BaseModel):
    content: str
    suggestions: list[str]

_SYSTEM = '''Vous êtes un assistant expert en génération de contenu professionnel. Vous aidez à produire des textes clairs, engageants et adaptés au format demandé.
Respectez le ton, la langue, et fournissez toujours des hashtags ou appels à l'action pertinents.
Répondez uniquement avec le contenu demandé et une liste de suggestions.'''

_prompt = ChatPromptTemplate.from_messages([
    ('system', _SYSTEM),
    ('human', '{message}'),
])

async def _generate_text(message: str) -> str:
    settings = get_settings()
    if not settings.openai_api_key:
        return 'Contenu généré automatiquement. Activez l’API OpenAI pour obtenir un résultat personnalisé.'
    llm = ChatOpenAI(model='gpt-4o', api_key=settings.openai_api_key, temperature=0.7)
    chain = _prompt | llm
    result = await chain.ainvoke({'message': message})
    return result.content

@router.post('/linkedin', response_model=ContentResponse)
async def generate_linkedin(body: LinkedInRequest):
    prompt = (
        f'Génère un post LinkedIn en {body.language} sur le sujet suivant : {body.topic}. '
        f'Utilise un ton {body.tone}, propose un hook fort, un corps de message structuré, des hashtags et un appel à l'action clair. '
        'Rends le texte professionnel et accessible.'
    )
    try:
        content = await _generate_text(prompt)
        suggestions = [
            'Variez les hashtags pour toucher une audience plus large',
            'Ajoutez une question finale pour améliorer l engagement',
            'Mentionnez une ressource ou un lien utile',
        ]
        return ContentResponse(content=content, suggestions=suggestions)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

@router.post('/newsletter', response_model=ContentResponse)
async def generate_newsletter(body: NewsletterRequest):
    prompt = (
        f'Rédige une newsletter en {body.language} sur le thème : {body.topic}. '
        f'Structure-la en {body.sections} sections claires avec des titres, un court sommaire et une conclusion. '
        'Ajoute des conseils actionnables, un ton professionnel et un appel à l action à la fin.'
    )
    try:
        content = await _generate_text(prompt)
        suggestions = [
            'Personnalisez l introduction avec le nom du destinataire',
            'Incluez un lien vers une ressource ou un article lié',
            'Ajoutez une phrase de relance pour le prochain envoi',
        ]
        return ContentResponse(content=content, suggestions=suggestions)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

@router.post('/email', response_model=ContentResponse)
async def generate_email(body: EmailRequest):
    type_map = {
        'cold': 'un cold email professionnel pour un prospect froid',
        'followup': 'un email de relance après une première prise de contact',
        'relance': 'un email de relance commercial avec un ton respectueux',
        'remerciement': 'un email de remerciement après un rendez-vous ou une collaboration',
    }
    prompt = (
        f'Redige {type_map[body.type]} en {body.language} sur le contexte suivant : {body.context}. '
        'Sois clair, structuré et termine avec un appel à l action simple.'
    )
    try:
        content = await _generate_text(prompt)
        suggestions = [
            'Personnalisez l objet pour augmenter le taux d ouverture',
            'Ajoutez un paragraphe de preuve sociale ou de résultats',
            'Incluez une phrase de relance polie en fin d email',
        ]
        return ContentResponse(content=content, suggestions=suggestions)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

@router.post('/instagram', response_model=ContentResponse)
async def generate_instagram(body: InstagramRequest):
    prompt = (
        f'Génère un contenu Instagram en {body.language} sur le sujet suivant : {body.subject}. '
        f'Format : {body.style}. Fournis une légende avec emojis, 30 hashtags et une suggestion de visuel. '
        'Sois concis et engageant.'
    )
    try:
        content = await _generate_text(prompt)
        suggestions = [
            'Utilise des emojis pertinents',
            'Ajoute un appel à l action clair',
            'Inclue un visuel simple et impactant',
        ]
        return ContentResponse(content=content, suggestions=suggestions)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

@router.post('/facebook', response_model=ContentResponse)
async def generate_facebook(body: FacebookRequest):
    prompt = (
        f'Crée un post Facebook optimisé pour l engagement en {body.language} sur le sujet : {body.subject}. '
        f'Type : {body.type}. Propose aussi un ciblage et un call-to-action adapté.'
    )
    try:
        content = await _generate_text(prompt)
        suggestions = [
            'Rends le message accessible et visuel',
            'Utilise une question en ouverture',
            'Précise le public cible pour améliorer la diffusion',
        ]
        return ContentResponse(content=content, suggestions=suggestions)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

@router.post('/twitter', response_model=ContentResponse)
async def generate_twitter(body: TwitterRequest):
    prompt = (
        f'Génère un {body.format} en {body.language} sur le sujet : {body.subject}. '
        'Respecte la limite de 280 caractères par tweet si nécessaire et numérote chaque message pour un thread.'
    )
    try:
        content = await _generate_text(prompt)
        suggestions = [
            'Ajoute des hashtags pertinents',
            'Sois clair et percutant',
            'Propose un CTA orienté action',
        ]
        return ContentResponse(content=content, suggestions=suggestions)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

@router.post('/blog', response_model=ContentResponse)
async def generate_blog(body: BlogRequest):
    prompt = (
        f'Rédige un article de blog en {body.language} sur le sujet : {body.subject}. '
        f'Utilise les mots-clés : {body.keywords}. Longueur : {body.length}. '
        'Fournis un titre H1, trois sous-titres H2/H3, une meta description et un slug URL.'
    )
    try:
        content = await _generate_text(prompt)
        suggestions = [
            'Structure l article avec des sous-titres clairs',
            'Inclue des mots-clés naturellement',
            'Ajoute un CTA pertinent en fin d article',
        ]
        return ContentResponse(content=content, suggestions=suggestions)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

@router.post('/video-script', response_model=ContentResponse)
async def generate_video_script(body: VideoScriptRequest):
    prompt = (
        f'Rédige un script vidéo en {body.language} pour {body.platform} sur le sujet : {body.subject}. '
        f'Durée : {body.duration}. Fournis un hook intro, un développement, un CTA et des timestamps.'
    )
    try:
        content = await _generate_text(prompt)
        suggestions = [
            'Ouvre avec un hook fort',
            'Indique clairement les transitions',
            'Ajoute un CTA direct en fin de script',
        ]
        return ContentResponse(content=content, suggestions=suggestions)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
