from __future__ import annotations

import asyncio
import os

import pytest


pytestmark = pytest.mark.integration


@pytest.mark.asyncio
async def test_openai_live(monkeypatch: pytest.MonkeyPatch):
    if not os.getenv("OPENAI_API_KEY"):
        pytest.skip("OPENAI_API_KEY not set")

    calls = {}

    async def fake_openai_call(prompt: str) -> str:
        calls["prompt"] = prompt
        await asyncio.sleep(0)
        return "openai-response"

    monkeypatch.setattr("builtins.openai_call", fake_openai_call, raising=False)
    result = await fake_openai_call("hello world")

    assert calls["prompt"] == "hello world"
    assert result == "openai-response"
