import pytest
import pytest_asyncio
from unittest.mock import AsyncMock, MagicMock, patch
from httpx import AsyncClient, ASGITransport
from core.security import create_access_token


@pytest.fixture(scope="session")
def valid_token() -> str:
    return create_access_token({"sub": "user-123", "org": "org-456"})


@pytest.fixture(scope="session")
def auth_headers(valid_token: str) -> dict:
    return {"Authorization": f"Bearer {valid_token}"}


@pytest.fixture
def mock_redis():
    redis = AsyncMock()
    redis.ping = AsyncMock(return_value=True)
    redis.incr = AsyncMock(return_value=1)
    redis.expire = AsyncMock()
    redis.lrange = AsyncMock(return_value=[])
    redis.rpush = AsyncMock()
    return redis


@pytest.fixture
def mock_supabase():
    sb = MagicMock()
    sb.table.return_value.select.return_value.eq.return_value.order.return_value.execute.return_value.data = []
    return sb


@pytest_asyncio.fixture
async def client(mock_redis, mock_supabase):
    from main import app
    from core.redis import get_redis
    from core.database import get_supabase

    app.dependency_overrides[get_redis] = lambda: mock_redis
    app.dependency_overrides[get_supabase] = lambda: mock_supabase

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()
