"""Safe model execution with error budgets."""

from __future__ import annotations

import asyncio
import time
from dataclasses import dataclass
from typing import Iterable, List, Mapping, Sequence

from .real_providers import Provider, ProviderResponse


@dataclass
class ExecutionResult:
    provider: str
    response: ProviderResponse


class SafeExecutor:
    """Execute provider calls concurrently while respecting an error budget."""

    def __init__(self, providers: Mapping[str, Provider], error_budget: float = 0.3) -> None:
        self.providers = providers
        self.error_budget = error_budget

    async def _invoke(self, name: str, provider: Provider, prompt: str) -> ExecutionResult:
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(None, provider.invoke, prompt)
        return ExecutionResult(provider=name, response=response)

    async def run(self, prompt: str) -> List[ExecutionResult]:
        tasks = [self._invoke(name, provider, prompt) for name, provider in self.providers.items()]
        results: List[ExecutionResult] = []
        if not tasks:
            return results
        for coro in asyncio.as_completed(tasks):
            result = await coro
            results.append(result)
        failures = sum(1 for item in results if not item.response.success)
        if tasks and (failures / len(tasks)) > self.error_budget:
            raise RuntimeError("Error budget exceeded during model execution")
        return [item for item in results if item.response.success]

