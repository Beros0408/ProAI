from __future__ import annotations
from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, END
from agents import intent_classifier, marketing, sales, general


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


def build_graph() -> StateGraph:
    graph = StateGraph(AgentState)
    graph.add_node("classify", _classify)
    graph.add_node("marketing", _marketing)
    graph.add_node("sales", _sales)
    graph.add_node("general", _general)

    graph.set_entry_point("classify")
    graph.add_conditional_edges(
        "classify",
        _route,
        {"marketing": "marketing", "sales": "sales", "general": "general"},
    )
    graph.add_edge("marketing", END)
    graph.add_edge("sales", END)
    graph.add_edge("general", END)
    return graph.compile()


_graph = build_graph()


async def run_orchestrator(message: str, history: list[dict] | None = None) -> dict:
    initial: AgentState = {"message": message, "history": history or [], "intent": "", "response": ""}
    final = await _graph.ainvoke(initial)
    return {"response": final["response"], "intent": final["intent"]}
