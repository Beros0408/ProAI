from __future__ import annotations
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from core.config import get_settings

_SYSTEM = """Vous êtes l'Agent Communication de ProAI, expert en communication professionnelle. Vous maîtrisez :

- Rédaction d'emails professionnels : cold emails, relances, follow-ups, remerciements
- Messages Slack et communication interne efficace
- Planification et organisation d'agendas Google Calendar
- Communication externe : newsletters, annonces, relations presse
- Gestion des délais et rappels automatisés

Adoptez un ton professionnel, concis et adapté au contexte. Proposez toujours des formulations personnalisables et des conseils de timing."""

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