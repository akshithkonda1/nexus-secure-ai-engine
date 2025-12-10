"""Synthetic dataset generation for Toron simulation runs."""

from __future__ import annotations

from dataclasses import dataclass
from hashlib import sha256
from typing import Dict, List


@dataclass(frozen=True)
class SyntheticRecord:
    """Single synthetic test case used by the simulation runner."""

    prompt: str
    expectation: str
    witness: Dict[str, object]
    failure_budget: int


class SyntheticDatasetGenerator:
    """Deterministically generate prompts and expectations.

    The generator is intentionally offline and seeded so CI runs remain stable.
    """

    def __init__(self, seed: str = "toron-v25h+") -> None:
        self.seed = seed

    def _make_record(self, index: int) -> SyntheticRecord:
        base = f"{self.seed}:{index}".encode()
        digest = sha256(base).hexdigest()
        prompt = f"Scenario {index}: {digest[:16]} should remain deterministic."
        expectation = "deterministic-consensus"
        witness = {
            "name": f"witness-{digest[16:20]}",
            "reliability": 0.8 + ((int(digest[0:2], 16) % 10) / 100),
        }
        failure_budget = int(digest[-2:], 16) % 2
        return SyntheticRecord(
            prompt=prompt,
            expectation=expectation,
            witness=witness,
            failure_budget=failure_budget,
        )

    def generate(self, count: int = 5) -> List[SyntheticRecord]:
        if count <= 0:
            return []
        return [self._make_record(idx) for idx in range(count)]
