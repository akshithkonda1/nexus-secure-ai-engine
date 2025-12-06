"""Deterministic harness to orchestrate simulation runs."""

from __future__ import annotations

import random
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Tuple

try:
    import numpy as np
except Exception:  # pragma: no cover - optional dependency
    np = None

from .toron_logger import get_logger, log_event

logger = get_logger("nexus.harness")


@dataclass
class HarnessConfig:
    seed: int = 42
    model_order: Tuple[str, ...] = ("alpha", "beta", "gamma")


@dataclass
class HarnessContext:
    run_id: str
    output_dir: Path
    seed: int
    model_order: Tuple[str, ...]


class DeterministicHarness:
    """Configure seeds, run identifiers, and filesystem layout."""

    def __init__(self, config: HarnessConfig | None = None) -> None:
        self.config = config or HarnessConfig()
        self.context = self._prepare()

    def _prepare(self) -> HarnessContext:
        seed = self.config.seed
        random.seed(seed)
        if np is not None:
            np.random.seed(seed)
        timestamp = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
        run_id = f"sim-{seed}-{timestamp}"
        output_dir = Path("/sim_runs") / timestamp
        output_dir.mkdir(parents=True, exist_ok=True)
        log_event(logger, "harness.init", seed=seed, run_id=run_id, output=str(output_dir))
        return HarnessContext(run_id=run_id, output_dir=output_dir, seed=seed, model_order=self.config.model_order)

    def snapshot(self) -> Dict[str, object]:
        return {
            "run_id": self.context.run_id,
            "seed": self.context.seed,
            "model_order": self.context.model_order,
            "output_dir": str(self.context.output_dir),
        }


__all__ = ["DeterministicHarness", "HarnessContext", "HarnessConfig"]
