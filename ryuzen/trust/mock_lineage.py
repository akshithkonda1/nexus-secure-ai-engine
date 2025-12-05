"""Mock lineage tracker for simulated runs."""
from __future__ import annotations

from datetime import datetime
from typing import Dict, Iterable, List
from uuid import uuid4


class MockLineageTracker:
    """Produces a synthetic lineage record for simulated outputs."""

    def generate(self, prompt: str, model_outputs: Iterable[Dict[str, object]]) -> Dict[str, object]:
        outputs: List[Dict[str, object]] = list(model_outputs)
        return {
            "id": str(uuid4()),
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "prompt": prompt,
            "models": [entry.get("model") for entry in outputs],
            "latencies": [entry.get("latency_ms") for entry in outputs],
        }
