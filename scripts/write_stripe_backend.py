# Script Python pour creer le router Stripe backend
import os

TARGET = os.path.join(
    "C:", os.sep, "Users", "bkabe", "Desktop", "Porjet - ProAI",
    "ProAI", "apps", "api", "routers", "billing.py"
)

CODE = """\
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
        print(f"[BILLING] Paiement reussi - User: {user_id}, Plan: {plan}")

    elif event_type == 'customer.subscription.deleted':
        subscription = event['data']['object']
        print(f"[BILLING] Abonnement annule - Sub: {subscription.get('id')}")

    elif event_type == 'invoice.payment_failed':
        invoice = event['data']['object']
        print(f"[BILLING] Paiement echoue - Invoice: {invoice.get('id')}")

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
                    "1 agent IA specialise",
                    "50 reponses IA / mois",
                    "Dashboard avec KPIs de base",
                    "Generateur de contenu (1 plateforme)",
                    "Mind map basique",
                ],
            },
            {
                "id": "pro",
                "name": "Pro",
                "price_monthly": 29,
                "price_annual": 23,
                "features": [
                    "6 agents IA specialises inclus",
                    "Conversations IA illimitees",
                    "CRM intelligent avec scoring",
                    "Generateur multi-plateforme (8 canaux)",
                    "Workflows automatises",
                    "Calendrier de publication",
                    "Rapports hebdomadaires automatiques",
                    "Predictions IA (ventes, churn)",
                    "Mind map avancee",
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
                    "Agents IA illimites",
                    "Mode equipe (multi-utilisateurs)",
                    "Analytics avancees et benchmarks",
                    "Acces API publique ProAI",
                    "Integrations premium (Slack, CRM, n8n)",
                    "Export rapports PDF personnalises",
                    "Support dedie + onboarding",
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
"""

with open(TARGET, "w", encoding="utf-8") as f:
    f.write(CODE)

print(f"[OK] Billing router cree : {TARGET}")
print(f"[OK] Taille : {os.path.getsize(TARGET)} octets")

# Ajouter stripe_secret_key et stripe_publishable_key et stripe_webhook_secret dans config.py
config_path = os.path.join(
    "C:", os.sep, "Users", "bkabe", "Desktop", "Porjet - ProAI",
    "ProAI", "apps", "api", "core", "config.py"
)

with open(config_path, "r", encoding="utf-8") as f:
    config_content = f.read()

if "stripe_secret_key" not in config_content:
    # Trouver la derniere ligne de la classe Settings
    config_content = config_content.replace(
        "class Settings(",
        "class Settings("
    )
    # Ajouter les champs Stripe avant la fin de la classe
    if "stripe" not in config_content.lower():
        # Trouver le dernier champ de la classe
        lines = config_content.split('\n')
        insert_idx = None
        for i, line in enumerate(lines):
            if 'class Settings' in line:
                # Chercher le dernier champ
                for j in range(i+1, len(lines)):
                    stripped = lines[j].strip()
                    if stripped and not stripped.startswith('#') and not stripped.startswith('class') and ':' in stripped:
                        insert_idx = j
                    if stripped.startswith('class ') or (stripped.startswith('def ') and j > i+2):
                        break
        if insert_idx:
            lines.insert(insert_idx + 1, '    stripe_secret_key: str = ""')
            lines.insert(insert_idx + 2, '    stripe_publishable_key: str = ""')
            lines.insert(insert_idx + 3, '    stripe_webhook_secret: str = ""')
            config_content = '\n'.join(lines)
            with open(config_path, "w", encoding="utf-8") as f:
                f.write(config_content)
            print(f"[OK] Config Stripe ajoutee dans : {config_path}")
        else:
            print("[WARN] Impossible de trouver ou inserer les champs Stripe dans config.py")
            print("[INFO] Ajoutez manuellement dans la classe Settings:")
            print('    stripe_secret_key: str = ""')
            print('    stripe_publishable_key: str = ""')
            print('    stripe_webhook_secret: str = ""')
else:
    print("[INFO] Config Stripe deja presente")

# Ajouter le router billing dans main.py
main_path = os.path.join(
    "C:", os.sep, "Users", "bkabe", "Desktop", "Porjet - ProAI",
    "ProAI", "apps", "api", "main.py"
)

with open(main_path, "r", encoding="utf-8") as f:
    main_content = f.read()

if "billing" not in main_content:
    # Ajouter import
    main_content = main_content.replace(
        "from routers import health, auth, chat, conversations, memory, mindmap, content, analyze, upload",
        "from routers import health, auth, chat, conversations, memory, mindmap, content, analyze, upload, billing"
    )
    # Si deja modifie avec crm, workflows etc
    if "billing" not in main_content:
        main_content = main_content.replace(
            "from routers import",
            "from routers import"
        )
        # Chercher la derniere ligne d'import de routers
        lines = main_content.split('\n')
        for i, line in enumerate(lines):
            if 'from routers import' in line and 'billing' not in line:
                lines[i] = line.rstrip().rstrip(',') + ', billing'
                break
        main_content = '\n'.join(lines)

    # Ajouter le router
    if 'billing.router' not in main_content:
        main_content = main_content.replace(
            '@app.get("/")',
            'app.include_router(billing.router, prefix="/api/v1")\n\n@app.get("/")'
        )

    with open(main_path, "w", encoding="utf-8") as f:
        f.write(main_content)
    print(f"[OK] Billing router ajoute dans main.py")
else:
    print("[INFO] Billing deja dans main.py")
