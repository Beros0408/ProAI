from __future__ import annotations
from langgraph.graph import StateGraph, END
from typing import TypedDict
from agents import intent_classifier, marketing, sales, general, social_media, communication, automation, analytics, legal


class AgentState(TypedDict):
    message: str
    history: list[dict]
    intent: str
    response: str


_QUICK_KEYWORDS: dict[str, list[str]] = {
    "marketing": ["campagne", "contenu", "seo", "inbound", "brand", "persona", "aida", "copywriting"],
    "sales": ["lead", "prospect", "crm", "pipe", "conversion", "relance", "deal", "closing", "script de vente"],
    "social_media": ["linkedin", "instagram", "tiktok", "twitter", "reels", "hashtag", "post", "publication", "réseaux sociaux"],
    "communication": ["email", "cold email", "objet", "séquence", "newsletter", "slack", "rédige un message"],
    "automation": ["zapier", "make", "n8n", "notion", "airtable", "pipedream", "bardeen", "integromat", "workflow", "workflow automation", "automatise", "automatisation", "intégration", "trigger", "webhook", "api", "tâche", "agenda", "planning", "slack bot", "discord bot", "apps script", "power automate"],
    "analytics": ["kpi", "dashboard", "tableau de bord", "taux de conversion", "roi", "rapport", "statistiques", "analyse", "chiffres", "métriques"],
    "legal": ["contrat", "rgpd", "juridique", "droit", "cgv", "cgu", "sarl", "sas", "sasu", "inpi", "avocat", "société", "statut", "propriété intellectuelle", "marque", "rupture conventionnelle"],
}


def _quick_classify(message: str) -> str | None:
    msg = message.lower()
    for intent, keywords in _QUICK_KEYWORDS.items():
        if any(kw in msg for kw in keywords):
            return intent
    return None


async def _classify(state: AgentState) -> AgentState:
    quick = _quick_classify(state["message"])
    if quick:
        return {**state, "intent": quick}
    intent = await intent_classifier.classify_intent(state["message"])
    return {**state, "intent": intent}


async def _route(state: AgentState) -> str:
    return state["intent"]


async def _marketing(state: AgentState) -> AgentState:
    resp = await marketing.run(state["message"], state["history"])
    return {**state, "response": resp}


async def _sales(state: AgentState) -> AgentState:
    resp = await sales.run(state["message"], state["history"])
    return {**state, "response": resp}


async def _general(state: AgentState) -> AgentState:
    resp = await general.run(state["message"], state["history"])
    return {**state, "response": resp}


async def _social_media(state: AgentState) -> AgentState:
    resp = await social_media.run(state["message"], state["history"])
    return {**state, "response": resp}


async def _communication(state: AgentState) -> AgentState:
    resp = await communication.run(state["message"], state["history"])
    return {**state, "response": resp}


async def _automation(state: AgentState) -> AgentState:
    resp = await automation.run(state["message"], state["history"])
    return {**state, "response": resp}


async def _analytics(state: AgentState) -> AgentState:
    resp = await analytics.run(state["message"], state["history"])
    return {**state, "response": resp}


async def _legal(state: AgentState) -> AgentState:
    resp = await legal.run(state["message"], state["history"])
    return {**state, "response": resp}


def build_graph() -> StateGraph:
    graph = StateGraph(AgentState)
    graph.add_node("classify", _classify)
    graph.add_node("marketing", _marketing)
    graph.add_node("sales", _sales)
    graph.add_node("general", _general)
    graph.add_node("social_media", _social_media)
    graph.add_node("communication", _communication)
    graph.add_node("automation", _automation)
    graph.add_node("analytics", _analytics)
    graph.add_node("legal", _legal)

    graph.set_entry_point("classify")
    graph.add_conditional_edges(
        "classify",
        _route,
        {
            "marketing":     "marketing",
            "sales":         "sales",
            "general":       "general",
            "social_media":  "social_media",
            "communication": "communication",
            "automation":    "automation",
            "analytics":     "analytics",
            "legal":         "legal",
        },
    )
    for node in ("marketing", "sales", "general", "social_media", "communication", "automation", "analytics", "legal"):
        graph.add_edge(node, END)

    return graph.compile()


_graph = build_graph()


async def run_orchestrator(
    message: str,
    history: list[dict] | None = None,
    business_context: str | None = None,
) -> dict:
    augmented = list(history or [])
    if business_context:
        augmented.insert(0, ("system", business_context))
    initial: AgentState = {"message": message, "history": augmented, "intent": "", "response": ""}
    final = await _graph.ainvoke(initial)
    return {"response": final["response"], "intent": final["intent"]}
