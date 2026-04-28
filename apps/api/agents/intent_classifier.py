from __future__ import annotations
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from core.config import get_settings

INTENTS = ("marketing", "sales", "general", "social_media", "communication")

_SYSTEM = """You are an intent classifier for a B2B SaaS AI assistant.
Classify the user's message into exactly one intent: marketing, sales, general, social_media, or communication.
Reply with ONLY the intent word, nothing else."""

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
