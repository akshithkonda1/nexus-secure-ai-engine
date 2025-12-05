"""Simulated language model provider for Toron.

This provider emulates latency, jitter, and reliability characteristics of
external LLM endpoints while keeping everything local and deterministic.
"""
from __future__ import annotations

import asyncio
import random
from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, Optional


@dataclass
class MockModelProvider:
    model_name: str
    style: str = "balanced"
    latency_ms: float = 300.0
    jitter_ms: float = 50.0
    error_rate: float = 0.01
    seed: Optional[int] = None
    _rng: random.Random = field(init=False, repr=False)

    def __post_init__(self) -> None:
        seed = self.seed if self.seed is not None else hash((self.model_name, self.style))
        self._rng = random.Random(seed)

    async def generate(self, prompt: str) -> Dict[str, object]:
        """Simulate generation with latency, jitter, and occasional failures."""
        jitter = self._rng.uniform(-self.jitter_ms, self.jitter_ms)
        latency = max(self.latency_ms + jitter, 0)
        await asyncio.sleep(latency / 1000.0)

        if self._rng.random() < self.error_rate:
            raise RuntimeError(f"{self.model_name} simulated failure")

        timestamp = datetime.utcnow().isoformat() + "Z"
        output = f"[{self.style}] {prompt} :: response generated"
        return {
            "model": self.model_name,
            "output": output,
            "timestamp": timestamp,
            "latency_ms": latency,
        }
