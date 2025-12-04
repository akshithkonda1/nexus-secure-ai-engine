from __future__ import annotations

import asyncio
import random
from typing import List

import pytest


pytestmark = pytest.mark.chaos


class FlakyProvider:
    def __init__(self, failure_rate: float = 0.4, seed: int = 0):
        self.random = random.Random(seed)
        self.failure_rate = failure_rate

    async def invoke(self, payload: str) -> str:
        await asyncio.sleep(0)
        if self.random.random() < self.failure_rate:
            raise TimeoutError("provider timeout")
        return f"ok:{payload}"


@pytest.mark.asyncio
async def test_flaky_provider_does_not_deadlock():
    provider = FlakyProvider()
    results: List[str] = []

    async def call_once(idx: int):
        try:
            result = await provider.invoke(f"payload-{idx}")
            results.append(result)
        except TimeoutError:
            results.append(f"timeout-{idx}")

    await asyncio.gather(*(call_once(i) for i in range(10)))

    assert len(results) == 10
    assert any(r.startswith("timeout") for r in results)
    assert any(r.startswith("ok") for r in results)
