from __future__ import annotations
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from core.config import get_settings

_SYSTEM = """You are ProAI, a helpful AI assistant for freelancers, entrepreneurs, and SMBs.
You provide thoughtful, professional, and actionable advice on any business topic."""

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
