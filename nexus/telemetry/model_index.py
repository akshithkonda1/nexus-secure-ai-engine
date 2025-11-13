"""Utilities for reorganising telemetry payloads by model.

The helpers defined here never capture user prompts or document content.
They only operate on sanitised metadata produced by :class:`TelemetryEvent`
instances or equivalent dictionary payloads.
"""
from __future__ import annotations

from collections import defaultdict
from typing import Dict, Iterable, List, Mapping, MutableMapping, Optional, Sequence, Union, Any

from .recorder import TelemetryEvent

TelemetryLike = Union[TelemetryEvent, Mapping[str, Any]]
PerModelTelemetry = Dict[str, List[Dict[str, Any]]]


def _coerce_payload(event: TelemetryLike) -> Dict[str, Any]:
    """Return a dictionary representation of ``TelemetryEvent``-like inputs."""

    if isinstance(event, TelemetryEvent):
        payload = event.to_dict()
    else:
        payload = dict(event)
    payload.setdefault("models", [])
    payload.setdefault("latencies", {})
    return payload


def _normalise_latency(value: Any) -> Optional[float]:
    """Convert latency values to ``float`` when possible."""

    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def sort_telemetry_by_model(events: Iterable[TelemetryLike]) -> PerModelTelemetry:
    """Group telemetry metadata by model identifier.

    Parameters
    ----------
    events:
        An iterable of :class:`TelemetryEvent` instances or plain mappings with
        the same structure as :meth:`TelemetryEvent.to_dict`.

    Returns
    -------
    dict
        Mapping of model identifier to a latency-sorted list of per-request
        telemetry entries. Each entry contains only metadata and never user
        content. The mapping's keys are returned in alphabetical order for a
        deterministic presentation.
    """

    grouped: MutableMapping[str, List[Dict[str, Any]]] = defaultdict(list)

    for event in events:
        payload = _coerce_payload(event)
        models = payload.get("models")
        if not isinstance(models, Sequence):
            continue

        latencies_obj = payload.get("latencies")
        latencies: Mapping[str, Any]
        if isinstance(latencies_obj, Mapping):
            latencies = latencies_obj  # type: ignore[assignment]
        else:
            latencies = {}

        errors_obj = payload.get("errors")
        errors: Mapping[str, Any]
        if isinstance(errors_obj, Mapping):
            errors = errors_obj
        else:
            errors = {}

        for model in models:
            model_key = str(model)
            entry = {
                "request_id": payload.get("request_id"),
                "session_id": payload.get("session_id"),
                "model": model_key,
                "latency": _normalise_latency(latencies.get(model_key)),
                "error": errors.get(model_key),
                "policy": payload.get("policy"),
                "disagreement": payload.get("disagreement"),
                "consensus": payload.get("consensus"),
                "extra": dict(payload.get("extra") or {}),
            }
            grouped[model_key].append(entry)

    sorted_grouped: PerModelTelemetry = {}
    for model_key, entries in grouped.items():
        entries.sort(
            key=lambda item: (
                float("inf") if item["latency"] is None else item["latency"],
                item.get("request_id") or "",
            )
        )
        sorted_grouped[model_key] = entries

    return dict(sorted(sorted_grouped.items(), key=lambda item: item[0]))


__all__ = ["sort_telemetry_by_model", "TelemetryLike", "PerModelTelemetry"]
