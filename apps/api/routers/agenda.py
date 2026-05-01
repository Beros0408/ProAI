from __future__ import annotations
from typing import Literal
from uuid import uuid4
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/agenda", tags=["agenda"])

class AgendaEventBase(BaseModel):
    title: str = Field(..., min_length=1)
    description: str = Field('', max_length=500)
    date: str = Field(...)
    start: str = Field(...)
    end: str = Field(...)
    reminder: Literal['15min', '30min', '1h', '1j'] = '30min'
    color: str = Field(default='#0ea5e9')
    recurrence: Literal['none', 'daily', 'weekly', 'monthly'] = 'none'

class AgendaEvent(AgendaEventBase):
    id: str

class AgendaTaskBase(BaseModel):
    title: str = Field(..., min_length=1)
    priority: Literal['high', 'medium', 'low'] = 'medium'

class AgendaTask(AgendaTaskBase):
    id: str
    completed: bool = False

class SmartSuggestResponse(BaseModel):
    summary: str
    plan: list[str]

_events: list[AgendaEvent] = [
    {
        'id': 'evt-1',
        'title': 'Revue produit',
        'description': 'Préparer la démo avec l’équipe produit.',
        'date': '2026-05-01',
        'start': '10:00',
        'end': '11:00',
        'reminder': '30min',
        'color': '#0ea5e9',
        'recurrence': 'weekly',
    },
    {
        'id': 'evt-2',
        'title': 'Standup client',
        'description': 'Point rapide sur les livrables.',
        'date': '2026-05-02',
        'start': '14:00',
        'end': '14:30',
        'reminder': '15min',
        'color': '#fb923c',
        'recurrence': 'none',
    },
    {
        'id': 'evt-3',
        'title': 'Sprint planning',
        'description': 'Organisation des priorités pour la semaine.',
        'date': '2026-05-03',
        'start': '09:00',
        'end': '10:30',
        'reminder': '1h',
        'color': '#22c55e',
        'recurrence': 'weekly',
    },
    {
        'id': 'evt-4',
        'title': 'Audit contenu',
        'description': 'Vérifier les posts et articles programmés.',
        'date': '2026-05-04',
        'start': '16:00',
        'end': '17:00',
        'reminder': '1h',
        'color': '#8b5cf6',
        'recurrence': 'none',
    },
    {
        'id': 'evt-5',
        'title': 'Rappel facturation',
        'description': 'Envoi facture au client A.',
        'date': '2026-05-05',
        'start': '11:00',
        'end': '11:30',
        'reminder': '15min',
        'color': '#ec4899',
        'recurrence': 'monthly',
    },
]

_tasks: list[AgendaTask] = [
    {'id': 'tsk-1', 'title': 'Finaliser le briefing marketing', 'completed': False, 'priority': 'high'},
    {'id': 'tsk-2', 'title': 'Répondre aux emails clients', 'completed': True, 'priority': 'medium'},
    {'id': 'tsk-3', 'title': 'Mettre à jour le pipeline', 'completed': False, 'priority': 'low'},
    {'id': 'tsk-4', 'title': 'Valider le script vidéo', 'completed': False, 'priority': 'high'},
]

@router.get('/events', response_model=list[AgendaEvent])
async def list_events():
    return _events

@router.post('/events', response_model=AgendaEvent)
async def create_event(payload: AgendaEventBase):
    new_event = AgendaEvent(id=uuid4().hex, **payload.model_dump())
    _events.append(new_event)
    return new_event

@router.patch('/events/{event_id}', response_model=AgendaEvent)
async def update_event(event_id: str, payload: AgendaEventBase):
    for index, event in enumerate(_events):
        if event.id == event_id:
            updated = AgendaEvent(id=event_id, **payload.model_dump())
            _events[index] = updated
            return updated
    raise HTTPException(status_code=404, detail='Événement introuvable')

@router.delete('/events/{event_id}')
async def delete_event(event_id: str):
    for index, event in enumerate(_events):
        if event.id == event_id:
            _events.pop(index)
            return {'status': 'deleted'}
    raise HTTPException(status_code=404, detail='Événement introuvable')

@router.get('/tasks', response_model=list[AgendaTask])
async def list_tasks():
    return _tasks

@router.post('/tasks', response_model=AgendaTask)
async def create_task(payload: AgendaTaskBase):
    task = AgendaTask(id=uuid4().hex, completed=False, **payload.model_dump())
    _tasks.append(task)
    return task

@router.patch('/tasks/{task_id}/toggle', response_model=AgendaTask)
async def toggle_task(task_id: str):
    for index, task in enumerate(_tasks):
        if task.id == task_id:
            _tasks[index] = AgendaTask(**{**task.model_dump(), 'completed': not task.completed})
            return _tasks[index]
    raise HTTPException(status_code=404, detail='Tâche introuvable')

@router.post('/smart-suggest', response_model=SmartSuggestResponse)
async def smart_suggest():
    pending = [task for task in _tasks if not task.completed]
    if not pending:
        return SmartSuggestResponse(summary='Toutes les tâches sont complétées.', plan=['Aucune action requise.'])

    ordered = sorted(pending, key=lambda item: {'high': 0, 'medium': 1, 'low': 2}[item.priority])
    plan = [f"{index + 1}. {task.title} - prioritaire {task.priority}" for index, task in enumerate(ordered)]
    return SmartSuggestResponse(
        summary='Plan optimisé généré pour organiser les tâches en priorité et libérer des créneaux clients.',
        plan=plan,
    )
