from __future__ import annotations

from typing import Any, Dict, List, Optional

from .ModelNormalizer import ModelNormalizer


class ResponseBuilder:
    """Build Toron response schema from Nexus engine payloads."""

    def __init__(self, normalizer: Optional[ModelNormalizer] = None):
        self.normalizer = normalizer or ModelNormalizer()

    def build(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        start_meta = payload.get("meta", {})
        answer = payload.get("answer") or ""
        normalized = self.normalizer.normalize(answer)
        confidence, hallucination = self.normalizer.score(answer)
        latencies = payload.get("timings") or {}
        latency_ms = max((float(v) * 1000.0 for v in latencies.values()), default=0.0)
        models_used: List[str] = payload.get("participants") or payload.get("models_used") or []
        tokens_used = 0
        usage = start_meta.get("usage") if isinstance(start_meta, dict) else None
        if isinstance(usage, dict):
            tokens_used = int(usage.get("total_tokens", 0))
        return {
            "response": normalized,
            "tokens_used": tokens_used,
            "model_used": payload.get("winner") or (models_used[0] if models_used else ""),
            "models_considered": models_used,
            "latency_ms": latency_ms,
            "confidence": confidence,
            "drift_flag": False,
            "hallucination_score": hallucination,
            "meta": payload,
        }


__all__ = ["ResponseBuilder"]
