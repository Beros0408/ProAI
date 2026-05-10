import logging
from fastapi import APIRouter
from pydantic import BaseModel, EmailStr

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/welcome", tags=["welcome"])


class WelcomeRequest(BaseModel):
    email: str
    name: str


@router.post("/send")
async def send_welcome(body: WelcomeRequest):
    logger.info(f"[WELCOME] Sending welcome email to {body.email} (name: {body.name})")
    # TODO: integrate real email provider (Resend, SendGrid, Mailgun)
    # Example with Resend:
    #   import resend
    #   resend.api_key = settings.resend_api_key
    #   resend.Emails.send({
    #     "from": "ProAI <hello@proai.io>",
    #     "to": body.email,
    #     "subject": f"Bienvenue sur ProAI, {body.name} !",
    #     "html": render_welcome_email(body.name),
    #   })
    return {"success": True, "message": "Email de bienvenue envoyé"}
