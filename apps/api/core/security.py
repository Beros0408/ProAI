from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt
from supabase import create_client
from core.config import get_settings

settings = get_settings()
bearer_scheme = HTTPBearer()


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