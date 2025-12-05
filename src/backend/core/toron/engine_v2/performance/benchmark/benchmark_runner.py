"""Performance benchmark runner for Toron Engine v2."""

from __future__ import annotations

import asyncio
import time
from statistics import mean
from typing import Callable, List

from ...core.debate_engine import DebateEngine
from ...core.consensus_integrator import ConsensusIntegrator
from ...core.fact_extractor import FactExtractor
from ...core.web_search import WebSearch
from ...performance.cache.multi_layer_cache import MultiLayerCache


class BenchmarkRunner:
    def __init__(self, adapter):
        self.adapter = adapter
        self.cache = MultiLayerCache()
        self.debate = DebateEngine(adapter)
        self.consensus = ConsensusIntegrator()
        self.fact_extractor = FactExtractor(adapter)
        self.web_search = WebSearch()

    async def throughput(self, request: dict, iterations: int = 50) -> float:
        start = time.time()
        await asyncio.gather(*(self.debate.run({"selected_models": request.get("models", []), "prompt": request.get("prompt", "")}) for _ in range(iterations)))
        duration = time.time() - start
        return iterations / duration if duration else 0

    async def debate_stress(self, prompt: str, models: List[str], rounds: int = 10) -> List[float]:
        latencies = []
        for _ in range(rounds):
            start = time.time()
            await self.debate.run({"selected_models": models, "prompt": prompt})
            latencies.append((time.time() - start) * 1000)
        return latencies

    async def provider_rtt(self, provider_call: Callable, samples: int = 5) -> List[float]:
        latencies = []
        for _ in range(samples):
            start = time.time()
            await provider_call()
            latencies.append((time.time() - start) * 1000)
        return latencies

    async def consensus_timing(self, debate_result: dict, validation: dict, runs: int = 5) -> float:
        durations = []
        for _ in range(runs):
            start = time.time()
            await self.consensus.integrate({"debate_result": debate_result, "validation": validation})
            durations.append((time.time() - start) * 1000)
        return mean(durations)

    async def cache_profile(self, request: dict, value: dict):
        cold_start = time.time()
        await self.cache.set(request, value)
        cold_latency = (time.time() - cold_start) * 1000

        warm_start = time.time()
        await self.cache.get(request)
        warm_latency = (time.time() - warm_start) * 1000

        return {"cold_write_ms": cold_latency, "warm_read_ms": warm_latency}
