from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel
from core.config import get_settings
from core.security import get_current_user
import stripe

router = APIRouter(prefix="/billing", tags=["billing"])

settings = get_settings()


def get_stripe():
    stripe.api_key = settings.stripe_secret_key
    return stripe


class CheckoutRequest(BaseModel):
    plan: str  # 'pro' or 'enterprise'
    annual: bool = False


class CheckoutResponse(BaseModel):
    checkout_url: str
    session_id: str


PRICE_MAP = {
    'pro_monthly': 2900,       # 29 EUR
    'pro_annual': 27600,       # 23 EUR x 12
    'enterprise_monthly': 9900, # 99 EUR
    'enterprise_annual': 94800, # 79 EUR x 12
}

PLAN_NAMES = {
    'pro_monthly': 'ProAI Pro - Mensuel',
    'pro_annual': 'ProAI Pro - Annuel',
    'enterprise_monthly': 'ProAI Enterprise - Mensuel',
    'enterprise_annual': 'ProAI Enterprise - Annuel',
}


@router.post("/create-checkout", response_model=CheckoutResponse)
async def create_checkout(
    body: CheckoutRequest,
    current_user: dict = Depends(get_current_user),
):
    s = get_stripe()

    interval = 'year' if body.annual else 'month'
    price_key = f"{body.plan}_{'annual' if body.annual else 'monthly'}"
    amount = PRICE_MAP.get(price_key)
    plan_name = PLAN_NAMES.get(price_key)

    if not amount or not plan_name:
        raise HTTPException(status_code=400, detail="Plan invalide")

    try:
        session = s.checkout.Session.create(
            payment_method_types=['card'],
            mode='subscription',
            line_items=[{
                'price_data': {
                    'currency': 'eur',
                    'unit_amount': amount if body.annual else amount,
                    'recurring': {'interval': interval},
                    'product_data': {
                        'name': plan_name,
                        'description': f"Abonnement ProAI {body.plan.capitalize()}",
                    },
                },
                'quantity': 1,
            }],
            customer_email=current_user.get('email'),
            metadata={
                'user_id': current_user['user_id'],
                'plan': body.plan,
                'annual': str(body.annual),
            },
            success_url='http://localhost:3000/dashboard?payment=success',
            cancel_url='http://localhost:3000/pricing?payment=cancelled',
        )

        return CheckoutResponse(
            checkout_url=session.url,
            session_id=session.id,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature', '')
    s = get_stripe()

    try:
        if settings.stripe_webhook_secret and settings.stripe_webhook_secret != 'whsec_later':
            event = s.Webhook.construct_event(
                payload, sig_header, settings.stripe_webhook_secret
            )
        else:
            import json
            event = json.loads(payload)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    event_type = event.get('type', '')

    if event_type == 'checkout.session.completed':
        session = event['data']['object']
        user_id = session.get('metadata', {}).get('user_id')
        plan = session.get('metadata', {}).get('plan')
        print(f"[BILLING] Paiement réussi - User: {user_id}, Plan: {plan}")

    elif event_type == 'customer.subscription.deleted':
        subscription = event['data']['object']
        print(f"[BILLING] Abonnement annulé - Sub: {subscription.get('id')}")

    elif event_type == 'invoice.payment_failed':
        invoice = event['data']['object']
        print(f"[BILLING] Paiement échoué - Invoice: {invoice.get('id')}")

    return {"status": "ok"}


@router.get("/plans")
async def get_plans():
    return {
        "plans": [
            {
                "id": "free",
                "name": "Gratuit",
                "price_monthly": 0,
                "price_annual": 0,
                "features": [
                    "1 agent IA spécialisé",
                    "50 réponses IA / mois",
                    "Dashboard avec KPIs de base",
                    "Générateur de contenu (1 plateforme)",
                    "Mind map basique",
                ],
            },
            {
                "id": "pro",
                "name": "Pro",
                "price_monthly": 29,
                "price_annual": 23,
                "features": [
                    "6 agents IA spécialisés inclus",
                    "Conversations IA illimitées",
                    "CRM intelligent avec scoring",
                    "Générateur multi-plateforme (8 canaux)",
                    "Workflows automatisés",
                    "Calendrier de publication",
                    "Rapports hebdomadaires automatiques",
                    "Prédictions IA (ventes, churn)",
                    "Mind map avancée",
                    "Support prioritaire",
                ],
            },
            {
                "id": "enterprise",
                "name": "Enterprise",
                "price_monthly": 99,
                "price_annual": 79,
                "features": [
                    "Tout le plan Pro inclus",
                    "Agents IA illimités",
                    "Mode équipe (multi-utilisateurs)",
                    "Analytics avancées et benchmarks",
                    "Accès API publique ProAI",
                    "Intégrations premium (Slack, CRM, n8n)",
                    "Export rapports PDF personnalisés",
                    "Support dédié + onboarding",
                    "White-label disponible",
                ],
            },
        ]
    }


@router.get("/status")
async def billing_status(current_user: dict = Depends(get_current_user)):
    return {
        "user_id": current_user["user_id"],
        "plan": "free",
        "status": "active",
        "next_billing_date": None,
    }
