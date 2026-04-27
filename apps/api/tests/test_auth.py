import pytest
from unittest.mock import MagicMock, patch


@pytest.mark.asyncio
async def test_login_success(client):
    mock_user = MagicMock()
    mock_user.id = "user-123"
    mock_user.user_metadata = {"organization_id": "org-456"}

    mock_res = MagicMock()
    mock_res.user = mock_user

    with patch("routers.auth.get_supabase") as mock_sb_factory:
        sb = MagicMock()
        sb.auth.sign_in_with_password.return_value = mock_res
        mock_sb_factory.return_value = sb

        resp = await client.post("/api/v1/auth/login", json={"email": "test@example.com", "password": "secret"})

    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_invalid_credentials(client):
    with patch("routers.auth.get_supabase") as mock_sb_factory:
        sb = MagicMock()
        sb.auth.sign_in_with_password.side_effect = Exception("Invalid")
        mock_sb_factory.return_value = sb

        resp = await client.post("/api/v1/auth/login", json={"email": "bad@example.com", "password": "wrong"})

    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_me_authenticated(client, auth_headers):
    resp = await client.get("/api/v1/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["user_id"] == "user-123"


@pytest.mark.asyncio
async def test_me_unauthenticated(client):
    resp = await client.get("/api/v1/auth/me")
    assert resp.status_code == 403
