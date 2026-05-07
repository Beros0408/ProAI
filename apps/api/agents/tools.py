"""Fonctions de récupération de données partagées par tous les agents."""
from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone

from supabase import Client

logger = logging.getLogger(__name__)


# ── Leads ─────────────────────────────────────────────────────────────────────

async def get_leads_context(supabase: Client, user_id: str) -> str:
    """Retourne un résumé formaté du pipeline CRM pour injection dans le contexte."""
    try:
        res = (
            supabase.table("leads")
            .select("name,company,stage,score,email,notes")
            .eq("user_id", user_id)
            .order("score", desc=True)
            .limit(20)
            .execute()
        )
        leads = res.data or []
    except Exception as exc:
        logger.warning("get_leads_context: %s", exc)
        return ""

    if not leads:
        return ""

    hot  = [l for l in leads if int(l.get("score") or 0) >= 70]
    warm = [l for l in leads if 40 <= int(l.get("score") or 0) < 70]
    cold = [l for l in leads if int(l.get("score") or 0) < 40]

    lines = [
        f"\nPIPELINE CRM EN TEMPS RÉEL ({len(leads)} leads) :",
        f"  🔴 Chauds (≥ 70) : {len(hot)}  |  🟡 Tièdes (40-69) : {len(warm)}  |  🔵 Froids (< 40) : {len(cold)}",
        "\nDétail :",
    ]
    for lead in leads[:15]:
        score = int(lead.get("score") or 0)
        emoji = "🔴" if score >= 70 else "🟡" if score >= 40 else "🔵"
        note  = f" — {lead['notes']}" if lead.get("notes") else ""
        lines.append(
            f"  {emoji} {lead['name']} ({lead.get('company','N/A')}) "
            f"— score {score}/100, stade : {lead.get('stage','nouveau')}{note}"
        )
    return "\n".join(lines)


# ── Tâches ────────────────────────────────────────────────────────────────────

async def get_tasks_context(supabase: Client, user_id: str) -> str:
    """Retourne un résumé des tâches agenda pour injection dans le contexte."""
    try:
        res = (
            supabase.table("agenda_tasks")
            .select("text,done,priority")
            .eq("user_id", user_id)
            .execute()
        )
        tasks = res.data or []
    except Exception as exc:
        logger.warning("get_tasks_context: %s", exc)
        return ""

    if not tasks:
        return ""

    pending = [t for t in tasks if not t.get("done")]
    done    = [t for t in tasks if t.get("done")]

    lines = [
        f"\nTÂCHES AGENDA ({len(pending)} en attente, {len(done)} complétées) :",
    ]
    for priority, emoji in (("high", "🔴"), ("medium", "🟡"), ("low", "🔵")):
        group = [t for t in pending if t.get("priority") == priority]
        if group:
            label = {"high": "haute", "medium": "moyenne", "low": "faible"}[priority]
            lines.append(f"\n  {emoji} Priorité {label} ({len(group)}) :")
            for t in group[:5]:
                lines.append(f"    • {t.get('text','Sans titre')}")
    return "\n".join(lines)


# ── Statistiques analytics ────────────────────────────────────────────────────

async def get_analytics_context(supabase: Client, user_id: str) -> str:
    """Retourne les statistiques de performance pour injection dans le contexte."""
    week_ago  = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    month_ago = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
    s: dict[str, int] = {}

    for key, table, extra in [
        ("convos_week",   "conversations", {"gte": ("created_at", week_ago)}),
        ("leads_month",   "leads",         {"gte": ("created_at", month_ago)}),
        ("leads_total",   "leads",         {}),
        ("tasks_done",    "agenda_tasks",  {"eq": ("done", True)}),
        ("tasks_total",   "agenda_tasks",  {}),
        ("posts_week",    "scheduled_posts", {"gte": ("created_at", week_ago)}),
    ]:
        try:
            q = supabase.table(table).select("*", count="exact").eq("user_id", user_id)
            for op, (col, val) in extra.items():
                q = getattr(q, op)(col, val)
            s[key] = q.execute().count or 0
        except Exception:
            s[key] = 0

    # Score moyen leads
    try:
        res = supabase.table("leads").select("score").eq("user_id", user_id).execute()
        scores = [int(r.get("score") or 0) for r in (res.data or [])]
        s["avg_score"] = round(sum(scores) / len(scores)) if scores else 0
        s["hot_leads"] = len([x for x in scores if x >= 70])
    except Exception:
        s["avg_score"] = 0
        s["hot_leads"] = 0

    if all(v == 0 for v in s.values()):
        return ""

    completion = round(s["tasks_done"] / s["tasks_total"] * 100) if s["tasks_total"] else 0
    lines = [
        "\nSTATISTIQUES EN TEMPS RÉEL :",
        f"  💬 Conversations cette semaine : {s['convos_week']}",
        f"  👥 Nouveaux leads ce mois : {s['leads_month']}  (total : {s['leads_total']}, score moyen : {s['avg_score']}/100)",
        f"  🔴 Leads chauds (≥ 70) : {s['hot_leads']}",
        f"  ✅ Tâches complétées : {s['tasks_done']}/{s['tasks_total']} ({completion} %)",
        f"  📅 Posts planifiés cette semaine : {s['posts_week']}",
    ]
    return "\n".join(lines)


# ── Boutons d'action ──────────────────────────────────────────────────────────

def get_action_cards(intent: str, message: str) -> list[dict]:
    """Retourne les cartes d'action contextuelles à afficher sous la réponse."""
    msg     = message.lower()
    actions: list[dict] = []

    if intent == "marketing":
        actions.append({"label": "📝 Générer du contenu", "href": "/content", "variant": "primary"})
        if any(w in msg for w in ("planifie", "publie", "programme", "calendrier", "post", "schedule")):
            actions.append({"label": "📅 Planifier ce post", "href": "/schedule", "variant": "secondary"})
        if any(w in msg for w in ("template", "modèle")):
            actions.append({"label": "📋 Templates", "href": "/templates", "variant": "secondary"})

    elif intent == "sales":
        actions.append({"label": "👥 Voir le CRM", "href": "/crm", "variant": "primary"})
        if any(w in msg for w in ("ajoute", "crée", "nouveau", "nouveau lead", "add")):
            actions.append({"label": "➕ Ajouter un lead", "href": "/crm", "variant": "secondary"})

    elif intent == "social_media":
        actions.append({"label": "📝 Créer du contenu", "href": "/content", "variant": "primary"})
        actions.append({"label": "📅 Calendrier de publication", "href": "/schedule", "variant": "secondary"})

    elif intent == "communication":
        actions.append({"label": "📝 Générer un email", "href": "/content", "variant": "primary"})

    elif intent == "automation":
        actions.append({"label": "⚡ Gérer les workflows", "href": "/workflows", "variant": "primary"})
        if any(w in msg for w in ("tâche", "planifie", "semaine", "agenda")):
            actions.append({"label": "📋 Voir l'agenda", "href": "/agenda", "variant": "secondary"})

    elif intent == "analytics":
        actions.append({"label": "📊 Tableau de bord", "href": "/dashboard", "variant": "primary"})
        actions.append({"label": "📋 Rapport hebdomadaire", "href": "/reports", "variant": "secondary"})

    return actions
