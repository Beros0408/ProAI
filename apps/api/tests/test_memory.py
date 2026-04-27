import pytest
import json
from unittest.mock import AsyncMock, MagicMock
from memory.short_term import ShortTermMemory
from memory.memory_manager import MemoryManager


@pytest.mark.asyncio
async def test_short_term_append_and_get():
    redis = AsyncMock()
    redis.rpush = AsyncMock()
    redis.expire = AsyncMock()
    stored = [json.dumps({"role": "user", "content": "Hello"})]
    redis.lrange = AsyncMock(return_value=stored)

    stm = ShortTermMemory(redis)
    await stm.append("conv-1", "user", "Hello")
    history = await stm.get_history("conv-1")

    assert len(history) == 1
    assert history[0]["role"] == "user"
    assert history[0]["content"] == "Hello"


@pytest.mark.asyncio
async def test_memory_manager_add_turn():
    redis = AsyncMock()
    redis.rpush = AsyncMock()
    redis.expire = AsyncMock()
    redis.lrange = AsyncMock(return_value=[])

    supabase = MagicMock()

    manager = MemoryManager(redis, supabase)
    await manager.add_turn("conv-1", "Hello", "Hi there!")

    assert redis.rpush.call_count == 2


@pytest.mark.asyncio
async def test_short_term_clear():
    redis = AsyncMock()
    redis.delete = AsyncMock()

    stm = ShortTermMemory(redis)
    await stm.clear("conv-1")

    redis.delete.assert_called_once_with("stm:conv-1")
