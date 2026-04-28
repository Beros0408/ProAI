from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from langchain_openai import ChatOpenAI
from core.config import get_settings

router = APIRouter()

class MindMapRequest(BaseModel):
    idea: str

class MindMapResponse(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]

_SYSTEM = """Vous êtes un expert en mind mapping et en structuration d'idées. Votre tâche est de transformer une idée ou un projet en une mind map structurée avec des noeuds et des connexions.

Pour l'idée donnée, générez un JSON avec :
- nodes: tableau de noeuds avec id, type, position {x, y}, data {label, agentType?}
- edges: tableau de connexions avec id, source, target

Structurez la mind map de manière logique :
- Noeud central : l'idée principale
- Branches principales : aspects clés du projet
- Sous-branches : détails et actions
- Utilisez des couleurs et des types d'agents appropriés (marketing, sales, communication, social_media, general, automation, analytics)

Répondez UNIQUEMENT avec du JSON valide, sans texte supplémentaire."""

_prompt = ChatPromptTemplate.from_messages([
    ("system", _SYSTEM),
    ("human", "Idée : {idea}\n\nGénérez la mind map en JSON."),
])

@router.post("/generate", response_model=MindMapResponse)
async def generate_mindmap(request: MindMapRequest):
    try:
        settings = get_settings()
        llm = ChatOpenAI(model="gpt-4o", api_key=settings.openai_api_key, temperature=0.3)

        chain = _prompt | llm
        result = await chain.ainvoke({"idea": request.idea})

        # Parse the JSON response
        import json
        try:
            data = json.loads(result.content.strip())
            return MindMapResponse(**data)
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Erreur lors du parsing de la réponse IA")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la génération: {str(e)}")