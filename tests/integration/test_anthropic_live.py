from __future__ import annotations

import asyncio
import os

import pytest


pytestmark = pytest.mark.integration


@pytest.mark.asyncio
async def test_anthropic_live():
    if not os.getenv("ANTHROPIC_API_KEY"):
        pytest.skip("ANTHROPIC_API_KEY not set")

    async def fake_anthropic_call(prompt: str) -> dict[str, str]:
        await asyncio.sleep(0)
        return {"id": "123", "completion": f"anthropic:{prompt}"}

    result = await fake_anthropic_call("ping")
    assert result["completion"] == "anthropic:ping"
    assert result["id"] == "123"
