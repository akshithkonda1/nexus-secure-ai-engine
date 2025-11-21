from __future__ import annotations

from typing import Any, Dict


class ErrorShaper:
    """Consistent error shaping wrapper."""

    def shape(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        if payload.get("status") == "error":
            message = payload.get("error_message") or payload.get("message")
            shaped = {
                "response": message or "unknown error",
                "tokens_used": 0,
                "model_used": payload.get("winner") or "",
                "models_considered": payload.get("models_used") or [],
                "latency_ms": 0.0,
                "confidence": 0.0,
                "drift_flag": False,
                "hallucination_score": 1.0,
                "meta": payload,
            }
            return shaped
        return payload


__all__ = ["ErrorShaper"]
