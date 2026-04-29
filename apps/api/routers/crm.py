from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Literal
from core.config import get_settings

router = APIRouter()

class LeadCreate(BaseModel):
    name: str
    email: str
    company: str
    estimatedValue: int

class Lead(LeadCreate):
    id: str
    dateAdded: str
    score: Literal['hot', 'warm', 'cold']
    stage: Literal['nouveau', 'contacte', 'negociation', 'gagne']

class LeadResponse(BaseModel):
    leads: List[Lead]
    stats: Dict[str, Any]

# Mock data
mock_leads: List[Lead] = [
    {
        'id': '1',
        'name': 'Alice Dubois',
        'email': 'alice@techcorp.fr',
        'company': 'TechCorp',
        'estimatedValue': 50000,
        'dateAdded': '2024-04-28',
        'score': 'hot',
        'stage': 'nouveau'
    },
    {
        'id': '2',
        'name': 'Bob Martin',
        'email': 'bob@startup.io',
        'company': 'Startup AI',
        'estimatedValue': 30000,
        'dateAdded': '2024-04-27',
        'score': 'warm',
        'stage': 'nouveau'
    },
    {
        'id': '3',
        'name': 'Carol Johnson',
        'email': 'carol@enterprise.com',
        'company': 'Enterprise Co',
        'estimatedValue': 100000,
        'dateAdded': '2024-04-20',
        'score': 'hot',
        'stage': 'contacte'
    },
]

@router.get("/leads", response_model=LeadResponse)
async def get_leads():
    """Get all leads with stats"""
    total_value = sum(lead['estimatedValue'] for lead in mock_leads)
    stats = {
        'total': len(mock_leads),
        'value': total_value,
        'by_stage': {
            'nouveau': len([l for l in mock_leads if l['stage'] == 'nouveau']),
            'contacte': len([l for l in mock_leads if l['stage'] == 'contacte']),
            'negociation': len([l for l in mock_leads if l['stage'] == 'negociation']),
            'gagne': len([l for l in mock_leads if l['stage'] == 'gagne']),
        }
    }
    return LeadResponse(leads=mock_leads, stats=stats)

@router.post("/leads", response_model=Lead)
async def create_lead(lead_data: LeadCreate):
    """Create a new lead"""
    new_lead: Lead = {
        'id': str(len(mock_leads) + 1),
        'name': lead_data.name,
        'email': lead_data.email,
        'company': lead_data.company,
        'estimatedValue': lead_data.estimatedValue,
        'dateAdded': '2024-04-29',
        'score': 'cold',
        'stage': 'nouveau'
    }
    mock_leads.append(new_lead)
    return new_lead

@router.patch("/leads/{lead_id}/stage")
async def update_lead_stage(lead_id: str, stage: Literal['nouveau', 'contacte', 'negociation', 'gagne']):
    """Update lead stage"""
    for lead in mock_leads:
        if lead['id'] == lead_id:
            lead['stage'] = stage
            return lead
    raise HTTPException(status_code=404, detail="Lead not found")

@router.post("/leads/{lead_id}/score")
async def score_lead(lead_id: str):
    """Score a lead using AI"""
    try:
        from langchain_openai import ChatOpenAI
        
        settings = get_settings()
        lead = next((l for l in mock_leads if l['id'] == lead_id), None)
        
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        
        llm = ChatOpenAI(model="gpt-4o", api_key=settings.openai_api_key, temperature=0.3)
        
        prompt = f"""Évalue la qualité du lead suivant sur une échelle de 1-100:
Nom: {lead['name']}
Email: {lead['email']}
Entreprise: {lead['company']}
Valeur estimée: {lead['estimatedValue']} €

Réponds UNIQUEMENT avec un nombre entre 1-100.
90-100: Chaud (hot)
50-89: Tiède (warm)
0-49: Froid (cold)"""
        
        response = await llm.ainvoke(prompt)
        score_value = int(response.content.strip())
        
        if score_value >= 90:
            lead['score'] = 'hot'
        elif score_value >= 50:
            lead['score'] = 'warm'
        else:
            lead['score'] = 'cold'
        
        return {
            'lead_id': lead_id,
            'score': lead['score'],
            'value': score_value
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error scoring lead: {str(e)}")
