import pytest


@pytest.mark.asyncio
async def test_health_ok(client):
    resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_readiness_ok(client, mock_redis):
    resp = await client.get("/health/ready")
    assert resp.status_code == 200
    assert resp.json()["redis"] == "ok"
