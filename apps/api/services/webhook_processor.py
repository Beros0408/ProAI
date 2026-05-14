"""
Background processor for universal webhook events.
Called as a FastAPI BackgroundTask so the HTTP response returns < 100 ms.
"""
from __future__ import annotations

import logging
from uuid import UUID

from core.config import get_settings
from core.database import get_supabase

logger = logging.getLogger(__name__)
settings = get_settings()

AGENT_PROMPTS: dict[str, str] = {
    "marketing": "You are ProAI's Marketing Agent. Analyze the following webhook payload and provide actionable marketing insights, content ideas, or recommended next steps.",
    "sales": "You are ProAI's Sales Agent. Analyze the following webhook payload and provide sales recommendations, lead qualification insights, or follow-up actions.",
    "automation": "You are ProAI's Automation Agent. Analyze the following webhook payload and suggest workflow automations or integration improvements.",
    "analytics": "You are ProAI's Analytics Agent. Analyze the following webhook payload and extract key metrics, trends, or KPIs.",
    "communication": "You are ProAI's Communication Agent. Analyze the following webhook payload and draft a professional communication response or follow-up.",
    "legal": "You are ProAI's Legal Agent. Analyze the following webhook payload and flag any legal considerations or compliance points.",
    "general": "You are ProAI's General Agent. Analyze the following webhook payload and provide a helpful summary with recommended next actions.",
    "social_media": "You are ProAI's Social Media Agent. Analyze the following webhook payload and suggest relevant social media content or engagement strategies.",
}


def _payload_matches_rule(payload: dict, condition_field: str | None, condition_value: str | None) -> bool:
    """Return True when the rule condition matches the payload (or when no condition is set)."""
    if not condition_field or not condition_value:
        return True
    try:
        parts = condition_field.split(".")
        value = payload
        for part in parts:
            if isinstance(value, dict):
                value = value.get(part)
            else:
                return False
        return str(value) == condition_value
    except Exception:
        return False


async def _call_llm(prompt: str, payload_str: str) -> str:
    """Call the configured LLM (Anthropic preferred, OpenAI fallback)."""
    full_prompt = f"{prompt}\n\nWebhook payload:\n{payload_str}"
    try:
        if settings.anthropic_api_key:
            import anthropic
            client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
            message = client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=1024,
                messages=[{"role": "user", "content": full_prompt}],
            )
            return message.content[0].text
    except Exception as exc:
        logger.warning("Anthropic call failed, falling back to OpenAI: %s", exc)

    try:
        if settings.openai_api_key:
            from openai import OpenAI
            client = OpenAI(api_key=settings.openai_api_key)
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": full_prompt}],
                max_tokens=1024,
            )
            return response.choices[0].message.content or ""
    except Exception as exc:
        logger.warning("OpenAI call failed: %s", exc)

    return "AI processing unavailable — no LLM provider configured."


async def process_webhook_event(event_id: UUID) -> None:
    """Process a webhook event in the background."""
    supabase = get_supabase()
    event_id_str = str(event_id)

    # 1. Load event
    event_resp = supabase.table("webhook_events").select("*").eq("id", event_id_str).single().execute()
    if not event_resp.data:
        logger.error("Webhook event %s not found", event_id_str)
        return
    event = event_resp.data

    # 2. Mark processing
    supabase.table("webhook_events").update({"status": "processing"}).eq("id", event_id_str).execute()

    try:
        # 3. Load matching rules
        rules_resp = (
            supabase.table("webhook_rules")
            .select("*")
            .eq("webhook_token_id", event["webhook_token_id"])
            .eq("enabled", True)
            .execute()
        )
        rules = rules_resp.data or []

        # Default to general agent when no rules are configured
        if not rules:
            rules = [{"agent_id": "general", "condition_field": None, "condition_value": None}]

        import json
        payload = event.get("payload", {})
        payload_str = json.dumps(payload, indent=2, ensure_ascii=False)

        results: list[str] = []
        agent_triggered: str | None = None

        for rule in rules:
            if not _payload_matches_rule(payload, rule.get("condition_field"), rule.get("condition_value")):
                continue

            agent_id = rule.get("agent_id", "general")
            agent_triggered = agent_id
            prompt = AGENT_PROMPTS.get(agent_id, AGENT_PROMPTS["general"])
            response = await _call_llm(prompt, payload_str)
            results.append(f"[{agent_id.upper()}]\n{response}")

        combined_response = "\n\n---\n\n".join(results) if results else "No matching rules found."

        # 4. Mark completed
        supabase.table("webhook_events").update({
            "status": "completed",
            "agent_triggered": agent_triggered,
            "agent_response": combined_response,
            "completed_at": "now()",
        }).eq("id", event_id_str).execute()

        # 5. Store in-app notification (best effort)
        _create_notification(supabase, event["user_id"], event_id_str, agent_triggered)

    except Exception as exc:
        logger.exception("Failed to process webhook event %s", event_id_str)
        supabase.table("webhook_events").update({
            "status": "failed",
            "error_message": str(exc),
        }).eq("id", event_id_str).execute()


def _create_notification(supabase, user_id: str, event_id: str, agent_triggered: str | None) -> None:
    """Insert a simple notification row if the table exists."""
    try:
        agent_label = (agent_triggered or "general").capitalize()
        supabase.table("notifications").insert({
            "user_id": user_id,
            "type": "webhook_processed",
            "title": f"Webhook traité par l'agent {agent_label}",
            "body": f"Un événement webhook a été analysé. Consultez l'historique pour voir la réponse.",
            "metadata": {"webhook_event_id": event_id},
            "read": False,
        }).execute()
    except Exception:
        pass
