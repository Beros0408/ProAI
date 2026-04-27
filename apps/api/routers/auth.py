from fastapi import APIRouter, HTTPException, status, Depends
from core.database import get_supabase
from core.security import get_current_user
from core.config import get_settings
from schemas.auth import LoginRequest, TokenResponse, UserProfile

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()

@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest):
    sb = get_supabase()
    try:
        res = sb.auth.sign_in_with_password({"email": body.email, "password": body.password})
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials") from exc
    user = res.user
    session = res.session
    if not user or not session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return TokenResponse(access_token=session.access_token, expires_in=session.expires_in or 3600)

@router.get("/me", response_model=UserProfile)
async def me(current_user: dict = Depends(get_current_user)):
    return UserProfile(
        user_id=current_user["user_id"],
        email=current_user.get("email", ""),
        organization_id=current_user.get("organization_id"),
    )