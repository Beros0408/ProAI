from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt
from supabase import create_client
from core.config import get_settings

settings = get_settings()
bearer_scheme = HTTPBearer()

# Fallback user_id used when no auth header is provided.
# All demo / unauthenticated data is stored under this UUID so the DB
# never receives NULL for user_id.
DEMO_USER_ID = "00000000-0000-0000-0000-000000000001"
DEMO_USER = {"user_id": DEMO_USER_ID, "email": "demo@proai.app", "organization_id": None}


def get_supabase_client():
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    """Strict auth — raises 401 if no valid JWT."""
    token = credentials.credentials
    try:
        supabase = get_supabase_client()
        user_response = supabase.auth.get_user(token)
        user = user_response.user
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        return {
            "user_id": user.id,
            "email": user.email,
            "organization_id": user.user_metadata.get("organization_id", None),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}"
        ) from e


# Optional auth bearer — auto_error=False means FastAPI won't raise if the
# header is absent; the dependency then returns DEMO_USER instead.
_optional_bearer = HTTPBearer(auto_error=False)


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_optional_bearer),
) -> dict:
    """
    Soft auth — returns the authenticated user when a valid JWT is present,
    falls back to DEMO_USER when no Authorization header is sent.
    This keeps legacy endpoints working while adding multi-tenant isolation.
    """
    if not credentials:
        return DEMO_USER
    try:
        supabase = get_supabase_client()
        user_response = supabase.auth.get_user(credentials.credentials)
        user = user_response.user
        if user:
            return {
                "user_id": user.id,
                "email": user.email,
                "organization_id": user.user_metadata.get("organization_id", None),
            }
    except Exception:
        pass
    return DEMO_USER


def create_access_token(
    data: dict,
    expires_delta: timedelta | None = None,
) -> str:
    """
    Génère un JWT signé contenant les claims fournis et une date d'expiration.

    Args:
        data: claims à inclure dans le token (par ex. {"sub": "user-id"}).
        expires_delta: durée de validité. Si None, utilise la valeur de settings.

    Returns:
        Le token JWT encodé en string.
    """
    to_encode = data.copy()
    if expires_delta is not None:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.jwt_access_token_expire_minutes
        )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode,
        settings.secret_key,
        algorithm=settings.jwt_algorithm,
    )
    return encoded_jwt