from __future__ import annotations
from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, END
from agents import intent_classifier, marketing, sales, general, social_media, communication


class AgentState(TypedDict):
    message: str
    history: list[dict]
    intent: str
    response: str


async def _classify(state: AgentState) -> AgentState:
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


def build_graph() -> StateGraph:
    graph = StateGraph(AgentState)
    graph.add_node("classify", _classify)
    graph.add_node("marketing", _marketing)
    graph.add_node("sales", _sales)
    graph.add_node("general", _general)
    graph.add_node("social_media", _social_media)
    graph.add_node("communication", _communication)

    graph.set_entry_point("classify")
    graph.add_conditional_edges(
        "classify",
        _route,
        {"marketing": "marketing", "sales": "sales", "general": "general", "social_media": "social_media", "communication": "communication"},
    )
    graph.add_edge("marketing", END)
    graph.add_edge("sales", END)
    graph.add_edge("general", END)
    graph.add_edge("social_media", END)
    graph.add_edge("communication", END)
    return graph.compile()


_graph = build_graph()


async def run_orchestrator(
    message: str,
    history: list[dict] | None = None,
    business_context: str | None = None,
) -> dict:
    augmented = list(history or [])
    if business_context:
        # Prepend as system message so every agent receives the business profile
        augmented.insert(0, ("system", business_context))
    initial: AgentState = {"message": message, "history": augmented, "intent": "", "response": ""}
    final = await _graph.ainvoke(initial)
    return {"response": final["response"], "intent": final["intent"]}
