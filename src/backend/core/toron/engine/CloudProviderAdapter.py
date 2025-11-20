from __future__ import annotations

import asyncio
import random
from typing import Dict, Iterable, List, Optional, Tuple

from nexus.ai.nexus_engine import ModelConnector, _choose_models


class CloudProviderAdapter:
    """Normalize access to multi-cloud model connectors with failover helpers."""

    def __init__(self, connectors: Dict[str, ModelConnector]):
        self.connectors = connectors

    def list_models(self) -> List[str]:
        return list(self.connectors.keys())

    def resolve_models(self, requested: Optional[Iterable[str]], tier: str) -> Tuple[List[str], bool, Optional[str]]:
        return _choose_models(self.list_models(), requested, tier)

    async def dispatch(
        self,
        name: str,
        prompt: str,
        history: Optional[List[Dict[str, str]]] = None,
        deadline: Optional[float] = None,
    ) -> Tuple[str, str, float]:
        connector = self.connectors[name]
        started = asyncio.get_event_loop().time()
        inference = connector.infer(prompt, history=history or [], model_name=name, deadline=deadline)
        if asyncio.iscoroutine(inference):
            text, _meta = await inference
        else:
            text, _meta = inference
        elapsed = asyncio.get_event_loop().time() - started
        return name, text or "", elapsed

    async def dispatch_with_retry(
        self,
        name: str,
        prompt: str,
        *,
        history: Optional[List[Dict[str, str]]] = None,
        deadline: Optional[float] = None,
        retries: int = 2,
        base_backoff: float = 0.2,
    ) -> Tuple[str, str, float]:
        attempt = 0
        last_error: Optional[Exception] = None
        while attempt <= retries:
            try:
                return await self.dispatch(name, prompt, history=history, deadline=deadline)
            except Exception as exc:  # pragma: no cover - passthrough to underlying connector
                last_error = exc
                await asyncio.sleep(base_backoff * (2 ** attempt) + random.random() * 0.05)
                attempt += 1
        raise last_error or RuntimeError("dispatch failed")

    async def parallel_dispatch(
        self,
        names: Iterable[str],
        prompt: str,
        *,
        history: Optional[List[Dict[str, str]]] = None,
        deadline: Optional[float] = None,
    ) -> Dict[str, Tuple[str, float]]:
        async def _call(n: str):
            _, text, elapsed = await self.dispatch_with_retry(n, prompt, history=history, deadline=deadline)
            return n, text, elapsed

        results: Dict[str, Tuple[str, float]] = {}
        tasks = [asyncio.create_task(_call(n)) for n in names]
        for fut in asyncio.as_completed(tasks):
            name, text, elapsed = await fut
            results[name] = (text, elapsed)
        return results

    def get_connector(self, name: str) -> ModelConnector:
        return self.connectors[name]


__all__ = ["CloudProviderAdapter"]
