import pytest
from unittest.mock import AsyncMock, patch


@pytest.mark.asyncio
async def test_chat_returns_response(client, auth_headers, mock_redis):
    mock_redis.incr = AsyncMock(return_value=1)
    mock_redis.lrange = AsyncMock(return_value=[])
    mock_redis.rpush = AsyncMock()

    with patch("routers.chat.run_orchestrator", new_callable=AsyncMock) as mock_orch:
        mock_orch.return_value = {"response": "Voici une stratégie marketing.", "intent": "marketing"}

        resp = await client.post(
            "/api/v1/chat",
            json={"message": "Aide-moi avec ma stratégie marketing"},
            headers=auth_headers,
        )

    assert resp.status_code == 200
    data = resp.json()
    assert data["message"]["role"] == "assistant"
    assert data["intent"] == "marketing"
    assert "conversation_id" in data


@pytest.mark.asyncio
async def test_chat_rate_limited(client, auth_headers, mock_redis):
    mock_redis.incr = AsyncMock(return_value=9999)

    resp = await client.post(
        "/api/v1/chat",
        json={"message": "test"},
        headers=auth_headers,
    )
    assert resp.status_code == 429


@pytest.mark.asyncio
async def test_chat_requires_auth(client):
    resp = await client.post("/api/v1/chat", json={"message": "hello"})
    assert resp.status_code == 403
