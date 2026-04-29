from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime

router = APIRouter()

class WorkflowNode(BaseModel):
    id: str
    data: Dict[str, Any]
    position: Dict[str, float]
    type: str

class WorkflowEdge(BaseModel):
    id: str
    source: str
    target: str

class WorkflowCreate(BaseModel):
    name: str
    nodes: List[WorkflowNode] = []
    edges: List[WorkflowEdge] = []

class Workflow(WorkflowCreate):
    id: str
    active: bool
    createdAt: str

# Mock data
mock_workflows: List[Workflow] = [
    {
        'id': '1',
        'name': 'Lead Scoring',
        'active': True,
        'createdAt': '2024-04-15',
        'nodes': [],
        'edges': [],
    }
]

@router.get("/", response_model=List[Workflow])
async def get_workflows():
    """Get all workflows"""
    return mock_workflows

@router.post("/", response_model=Workflow)
async def create_workflow(workflow_data: WorkflowCreate):
    """Create a new workflow"""
    new_workflow: Workflow = {
        'id': str(len(mock_workflows) + 1),
        'name': workflow_data.name,
        'active': False,
        'createdAt': datetime.now().strftime('%Y-%m-%d'),
        'nodes': workflow_data.nodes,
        'edges': workflow_data.edges,
    }
    mock_workflows.append(new_workflow)
    return new_workflow

@router.patch("/{workflow_id}/toggle")
async def toggle_workflow(workflow_id: str):
    """Toggle workflow active status"""
    for workflow in mock_workflows:
        if workflow['id'] == workflow_id:
            workflow['active'] = not workflow['active']
            return workflow
    raise HTTPException(status_code=404, detail="Workflow not found")

@router.delete("/{workflow_id}")
async def delete_workflow(workflow_id: str):
    """Delete a workflow"""
    global mock_workflows
    for idx, workflow in enumerate(mock_workflows):
        if workflow['id'] == workflow_id:
            mock_workflows.pop(idx)
            return {"message": "Workflow deleted"}
    raise HTTPException(status_code=404, detail="Workflow not found")

@router.put("/{workflow_id}")
async def update_workflow(workflow_id: str, workflow_data: WorkflowCreate):
    """Update workflow (save nodes and edges)"""
    for workflow in mock_workflows:
        if workflow['id'] == workflow_id:
            workflow['name'] = workflow_data.name
            workflow['nodes'] = workflow_data.nodes
            workflow['edges'] = workflow_data.edges
            return workflow
    raise HTTPException(status_code=404, detail="Workflow not found")
