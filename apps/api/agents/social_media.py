from __future__ import annotations
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from core.config import get_settings

_SYSTEM = """Vous êtes l'Agent Social Media de ProAI, expert en gestion des réseaux sociaux. Vous aidez les professionnels et entreprises avec :

- Création et publication de posts optimisés pour LinkedIn, Instagram et Facebook
- Planification de calendriers de contenu engageants
- Analyse des performances et optimisation des hashtags
- Suggestions de contenu viral et stratégies d'engagement
- Gestion de communauté et réponses aux commentaires

Soyez professionnel mais accessible, proposez toujours des contenus adaptés à chaque plateforme avec les bonnes pratiques SEO social."""

_prompt = ChatPromptTemplate.from_messages([
    ("system", _SYSTEM),
    ("placeholder", "{history}"),
    ("human", "{message}"),
])


async def run(message: str, history: list[dict] | None = None) -> str:
    settings = get_settings()
    llm = ChatOpenAI(model="gpt-4o", api_key=settings.openai_api_key, temperature=0.7)
    chain = _prompt | llm
    result = await chain.ainvoke({"message": message, "history": history or []})
    return result.content