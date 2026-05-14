"""
Universal Webhook System router.

Public endpoint:
  POST /api/v1/webhook/{token}   — no auth required, rate-limited

Authenticated endpoints (JWT required):
  GET    /api/v1/webhooks
  POST   /api/v1/webhooks
  PATCH  /api/v1/webhooks/{id}
  DELETE /api/v1/webhooks/{id}
  GET    /api/v1/webhooks/{id}/events
  POST   /api/v1/webhooks/{id}/test
  GET    /api/v1/webhooks/{id}/rules
  POST   /api/v1/webhooks/{id}/rules
  DELETE /api/v1/webhooks/{id}/rules/{rule_id}
"""
from __future__ import annotations

import logging
import secrets
from typing import Any, Optional
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, status
from fastapi.responses import Response
from pydantic import BaseModel

from core.database import get_supabase
from core.security import get_current_user
from services.webhook_processor import process_webhook_event

logger = logging.getLogger(__name__)
router = APIRouter(tags=["webhooks"])

# ── Rate-limit counters stored in-process (Redis preferred in prod) ────────────
_rate_counters: dict[str, list[float]] = {}
RATE_LIMIT = 100  # requests per minute per token


def _check_rate_limit(token: str) -> bool:
    import time
    now = time.time()
    window = 60.0
    hits = [t for t in _rate_counters.get(token, []) if now - t < window]
    if len(hits) >= RATE_LIMIT:
        return False
    hits.append(now)
    _rate_counters[token] = hits
    return True


# ── Pydantic schemas ───────────────────────────────────────────────────────────

class WebhookTokenCreate(BaseModel):
    name: str
    description: Optional[str] = None


class WebhookTokenUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class WebhookRuleCreate(BaseModel):
    agent_id: str
    condition_field: Optional[str] = None
    condition_value: Optional[str] = None


# ── PUBLIC: receive webhook ────────────────────────────────────────────────────

@router.post("/webhook/{token}", include_in_schema=True, status_code=200)
async def receive_webhook(
    token: str,
    request: Request,
    background_tasks: BackgroundTasks,
) -> dict:
    """
    Public endpoint.  Any external tool (Zapier, Tally, n8n…) POSTs here.
    Response is always < 100 ms — processing happens in background.
    """
    if not _check_rate_limit(token):
        raise HTTPException(status_code=429, detail="Rate limit exceeded")

    supabase = get_supabase()

    # 1. Validate token
    token_resp = (
        supabase.table("webhook_tokens")
        .select("id, user_id, is_active")
        .eq("token", token)
        .single()
        .execute()
    )
    if not token_resp.data:
        raise HTTPException(status_code=404, detail="Webhook token not found")
    wt = token_resp.data
    if not wt["is_active"]:
        raise HTTPException(status_code=403, detail="Webhook token is disabled")

    # 2. Parse payload (accept any JSON; fall back to empty dict)
    try:
        payload: dict[str, Any] = await request.json()
    except Exception:
        payload = {}

    # 3. Capture headers (sanitised)
    safe_headers = {
        k: v for k, v in request.headers.items()
        if k.lower() not in {"authorization", "cookie", "x-api-key"}
    }

    # 4. Insert event
    source_ip = request.headers.get("x-forwarded-for", request.client.host if request.client else None)
    insert_resp = (
        supabase.table("webhook_events")
        .insert({
            "webhook_token_id": wt["id"],
            "user_id": wt["user_id"],
            "source_ip": source_ip,
            "payload": payload,
            "headers": safe_headers,
            "status": "received",
        })
        .execute()
    )
    event_data = insert_resp.data[0] if insert_resp.data else None
    if not event_data:
        logger.error("Failed to insert webhook event for token %s", token)
        return {"status": "ok"}

    # 5. Update last_used_at (best effort)
    supabase.table("webhook_tokens").update({"last_used_at": "now()"}).eq("id", wt["id"]).execute()

    # 6. Process in background
    background_tasks.add_task(process_webhook_event, UUID(event_data["id"]))

    return {"status": "ok", "event_id": event_data["id"]}


# ── AUTH: list webhooks ────────────────────────────────────────────────────────

@router.get("/webhooks")
async def list_webhooks(current_user: dict = Depends(get_current_user)) -> dict:
    supabase = get_supabase()
    resp = (
        supabase.table("webhook_tokens")
        .select("*")
        .eq("user_id", current_user["user_id"])
        .order("created_at", desc=True)
        .execute()
    )
    tokens = resp.data or []

    # Attach event counts
    for wt in tokens:
        count_resp = (
            supabase.table("webhook_events")
            .select("id", count="exact")
            .eq("webhook_token_id", wt["id"])
            .execute()
        )
        wt["event_count"] = count_resp.count or 0

    return {"webhooks": tokens}


# ── AUTH: create webhook ───────────────────────────────────────────────────────

@router.post("/webhooks", status_code=201)
async def create_webhook(
    body: WebhookTokenCreate,
    current_user: dict = Depends(get_current_user),
) -> dict:
    supabase = get_supabase()
    token = secrets.token_urlsafe(32)
    resp = (
        supabase.table("webhook_tokens")
        .insert({
            "user_id": current_user["user_id"],
            "token": token,
            "name": body.name,
            "description": body.description,
        })
        .execute()
    )
    if not resp.data:
        raise HTTPException(status_code=500, detail="Failed to create webhook")
    return {"webhook": resp.data[0]}


# ── AUTH: update webhook ───────────────────────────────────────────────────────

@router.patch("/webhooks/{webhook_id}")
async def update_webhook(
    webhook_id: str,
    body: WebhookTokenUpdate,
    current_user: dict = Depends(get_current_user),
) -> dict:
    supabase = get_supabase()
    updates = body.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    resp = (
        supabase.table("webhook_tokens")
        .update(updates)
        .eq("id", webhook_id)
        .eq("user_id", current_user["user_id"])
        .execute()
    )
    if not resp.data:
        raise HTTPException(status_code=404, detail="Webhook not found")
    return {"webhook": resp.data[0]}


# ── AUTH: delete webhook ───────────────────────────────────────────────────────

@router.delete("/webhooks/{webhook_id}")
async def delete_webhook(
    webhook_id: str,
    current_user: dict = Depends(get_current_user),
) -> Response:
    supabase = get_supabase()
    supabase.table("webhook_tokens").delete().eq("id", webhook_id).eq("user_id", current_user["user_id"]).execute()
    return Response(status_code=204)


# ── AUTH: event history ────────────────────────────────────────────────────────

@router.get("/webhooks/{webhook_id}/events")
async def list_webhook_events(
    webhook_id: str,
    page: int = 1,
    page_size: int = 20,
    current_user: dict = Depends(get_current_user),
) -> dict:
    supabase = get_supabase()

    # Verify ownership
    token_resp = (
        supabase.table("webhook_tokens")
        .select("id")
        .eq("id", webhook_id)
        .eq("user_id", current_user["user_id"])
        .single()
        .execute()
    )
    if not token_resp.data:
        raise HTTPException(status_code=404, detail="Webhook not found")

    offset = (page - 1) * page_size
    events_resp = (
        supabase.table("webhook_events")
        .select("*")
        .eq("webhook_token_id", webhook_id)
        .order("received_at", desc=True)
        .range(offset, offset + page_size - 1)
        .execute()
    )

    count_resp = (
        supabase.table("webhook_events")
        .select("id", count="exact")
        .eq("webhook_token_id", webhook_id)
        .execute()
    )

    return {
        "events": events_resp.data or [],
        "total": count_resp.count or 0,
        "page": page,
        "page_size": page_size,
    }


# ── AUTH: test webhook ─────────────────────────────────────────────────────────

@router.post("/webhooks/{webhook_id}/test")
async def test_webhook(
    webhook_id: str,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user),
) -> dict:
    supabase = get_supabase()

    token_resp = (
        supabase.table("webhook_tokens")
        .select("id, token, user_id")
        .eq("id", webhook_id)
        .eq("user_id", current_user["user_id"])
        .single()
        .execute()
    )
    if not token_resp.data:
        raise HTTPException(status_code=404, detail="Webhook not found")

    test_payload = {
        "event": "test",
        "source": "ProAI Test",
        "message": "This is a test event from ProAI to verify your webhook endpoint is working correctly.",
        "timestamp": __import__("datetime").datetime.utcnow().isoformat(),
    }

    insert_resp = (
        supabase.table("webhook_events")
        .insert({
            "webhook_token_id": webhook_id,
            "user_id": current_user["user_id"],
            "source_ip": "127.0.0.1",
            "payload": test_payload,
            "headers": {"content-type": "application/json", "x-proai-test": "true"},
            "status": "received",
        })
        .execute()
    )

    event_data = insert_resp.data[0] if insert_resp.data else None
    if event_data:
        background_tasks.add_task(process_webhook_event, UUID(event_data["id"]))

    return {"status": "ok", "message": "Test event sent", "event_id": event_data["id"] if event_data else None}


# ── AUTH: list rules ───────────────────────────────────────────────────────────

@router.get("/webhooks/{webhook_id}/rules")
async def list_webhook_rules(
    webhook_id: str,
    current_user: dict = Depends(get_current_user),
) -> dict:
    supabase = get_supabase()

    token_resp = (
        supabase.table("webhook_tokens")
        .select("id")
        .eq("id", webhook_id)
        .eq("user_id", current_user["user_id"])
        .single()
        .execute()
    )
    if not token_resp.data:
        raise HTTPException(status_code=404, detail="Webhook not found")

    resp = (
        supabase.table("webhook_rules")
        .select("*")
        .eq("webhook_token_id", webhook_id)
        .order("created_at")
        .execute()
    )
    return {"rules": resp.data or []}


# ── AUTH: create rule ──────────────────────────────────────────────────────────

@router.post("/webhooks/{webhook_id}/rules", status_code=201)
async def create_webhook_rule(
    webhook_id: str,
    body: WebhookRuleCreate,
    current_user: dict = Depends(get_current_user),
) -> dict:
    supabase = get_supabase()

    token_resp = (
        supabase.table("webhook_tokens")
        .select("id")
        .eq("id", webhook_id)
        .eq("user_id", current_user["user_id"])
        .single()
        .execute()
    )
    if not token_resp.data:
        raise HTTPException(status_code=404, detail="Webhook not found")

    resp = (
        supabase.table("webhook_rules")
        .insert({
            "webhook_token_id": webhook_id,
            "user_id": current_user["user_id"],
            "agent_id": body.agent_id,
            "condition_field": body.condition_field,
            "condition_value": body.condition_value,
        })
        .execute()
    )
    if not resp.data:
        raise HTTPException(status_code=500, detail="Failed to create rule")
    return {"rule": resp.data[0]}


# ── AUTH: delete rule ──────────────────────────────────────────────────────────

@router.delete("/webhooks/{webhook_id}/rules/{rule_id}")
async def delete_webhook_rule(
    webhook_id: str,
    rule_id: str,
    current_user: dict = Depends(get_current_user),
) -> Response:
    supabase = get_supabase()
    supabase.table("webhook_rules").delete().eq("id", rule_id).eq("user_id", current_user["user_id"]).execute()
    return Response(status_code=204)
