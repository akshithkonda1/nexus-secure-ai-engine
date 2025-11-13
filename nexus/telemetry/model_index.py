"""Helpers for organising telemetry metadata by model."""
from __future__ import annotations

from collections import defaultdict
from typing import Any, Dict, Iterable, List, Mapping, MutableMapping, Optional, Union

from .recorder import TelemetryEvent

TelemetryLike = Union[TelemetryEvent, Mapping[str, Any]]
PerModelTelemetry = Dict[str, List[Dict[str, Any]]]


def _coerce_payload(event: TelemetryLike) -> Dict[str, Any]:
    if isinstance(event, TelemetryEvent):
        return event.to_dict()
    return dict(event)


def _normalise_float(value: Any) -> Optional[float]:
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _normalise_int(value: Any) -> Optional[int]:
    if value is None:
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def sort_telemetry_by_model(events: Iterable[TelemetryLike]) -> PerModelTelemetry:
    """Group telemetry entries by model identifier."""

    grouped: MutableMapping[str, List[Dict[str, Any]]] = defaultdict(list)

    for event in events:
        payload = _coerce_payload(event)
        model_name = payload.get("model_name")
        if not model_name:
            continue
        record = {
            "model_name": str(model_name),
            "latency_ms": _normalise_float(payload.get("latency_ms")),
            "failure_type": payload.get("failure_type"),
            "hallucination_score": _normalise_float(payload.get("hallucination_score")),
            "disagreement": _normalise_float(payload.get("disagreement")),
            "token_usage": _normalise_int(payload.get("token_usage")),
            "timestamp": _normalise_float(payload.get("timestamp")),
            "debate_metadata": dict(payload.get("debate_metadata") or {}),
            "extra": dict(payload.get("extra") or {}),
        }
        grouped[str(model_name)].append(record)

    sorted_grouped: PerModelTelemetry = {}
    for model, entries in grouped.items():
        entries.sort(
            key=lambda item: (
                float("inf") if item["timestamp"] is None else item["timestamp"],
                float("inf") if item["latency_ms"] is None else item["latency_ms"],
            )
        )
        sorted_grouped[model] = entries

    return dict(sorted(sorted_grouped.items(), key=lambda item: item[0]))


__all__ = ["sort_telemetry_by_model", "TelemetryLike", "PerModelTelemetry"]
