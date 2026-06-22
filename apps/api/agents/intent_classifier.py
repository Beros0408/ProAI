from __future__ import annotations
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from core.config import get_settings

INTENTS = ("marketing", "sales", "general", "social_media", "communication")

_SYSTEM = """Tu es un classificateur d'intention pour Krezia, un assistant IA B2B pour entrepreneurs et PME francophones.

Classifie le message utilisateur dans EXACTEMENT une des intentions suivantes :
- marketing : stratégie de contenu, copywriting, campagnes, SEO, personas, positionnement, newsletter, blog
- sales : prospection, pipeline CRM, leads, closing, scripts de vente, objections, propositions commerciales, SPIN selling
- social_media : LinkedIn, Instagram, Facebook, Twitter/X, hashtags, reels, carrousels, community management
- communication : emails, cold emails, relances, communication interne, Slack, comptes-rendus, communiqués
- general : stratégie business, finances, organisation, croissance, tout ce qui ne correspond pas aux catégories ci-dessus

EXEMPLES DE CLASSIFICATION :
"Écris-moi un post LinkedIn" → social_media
"Comment améliorer mon taux de conversion ?" → sales
"Rédige un email de prospection" → communication
"Quelle stratégie de contenu pour mon SaaS ?" → marketing
"Montre-moi mes leads chauds" → sales
"Comment gérer mon équipe à distance ?" → general
"Script pour appel de découverte" → sales
"Idées de reels Instagram" → social_media
"Analyse mon positionnement" → marketing
"Template de cold email" → communication

Réponds UNIQUEMENT avec le mot de l'intention, rien d'autre."""

_prompt = ChatPromptTemplate.from_messages([
    ("system", _SYSTEM),
    ("human", "{message}"),
])


async def classify_intent(message: str) -> str:
    settings = get_settings()
    llm = ChatOpenAI(model="gpt-4o-mini", api_key=settings.openai_api_key, temperature=0)
    chain = _prompt | llm
    result = await chain.ainvoke({"message": message})
    intent = result.content.strip().lower()
    return intent if intent in INTENTS else "general"
