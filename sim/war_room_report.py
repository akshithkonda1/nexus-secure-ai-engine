"""Lightweight war-room logging and reporting helpers for SIM runs.

This module records notable events during stress or simulation runs and
condenses them into a JSON summary that downstream dashboards can consume.
"""
from __future__ import annotations

import json
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Iterable, List


@dataclass
class WarRoomEvent:
    event_type: str
    details: Dict[str, Any]
    timestamp: str | None = None

    def to_record(self) -> Dict[str, Any]:
        record = asdict(self)
        record["timestamp"] = self.timestamp or datetime.utcnow().isoformat()
        return record


class WarRoomLogger:
    """Append-only JSONL logger for war-room style incident tracking."""

    def __init__(self, path: str | Path = "sim/war_room_report.jsonl"):
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def log(self, event_type: str, details: Dict[str, Any]) -> None:
        event = WarRoomEvent(event_type=event_type, details=details)
        with self.path.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(event.to_record()) + "\n")


class WarRoomReporter:
    """Summarize war-room logs into actionable guidance."""

    def __init__(self, logpath: str | Path = "sim/war_room_report.jsonl"):
        self.logpath = Path(logpath)

    def _load_events(self) -> List[Dict[str, Any]]:
        if not self.logpath.exists():
            return []
        with self.logpath.open("r", encoding="utf-8") as handle:
            return [json.loads(line) for line in handle if line.strip()]

    def generate_summary(self) -> Dict[str, Any]:
        events = self._load_events()
        summary = {
            "total_events": len(events),
            "timeouts": self._count(events, "TIMEOUT"),
            "latency_spikes": self._count(events, "LATENCY_SPIKE"),
            "failures": self._count(events, "FAILURE"),
            "model_errors": self._count(events, "MODEL_ERROR"),
            "recommendation": self._recommend(events),
        }

        output_path = self.logpath.parent / "war_room_summary.json"
        with output_path.open("w", encoding="utf-8") as handle:
            json.dump(summary, handle, indent=2)

        return summary

    @staticmethod
    def _count(events: Iterable[Dict[str, Any]], event_type: str) -> int:
        return sum(1 for event in events if event.get("event_type") == event_type)

    @staticmethod
    def _recommend(events: Iterable[Dict[str, Any]]) -> str:
        events = list(events)
        if any(event for event in events if event.get("event_type") == "FAILURE"):
            return "Increase caching, improve MAL retry tuning."
        if any(event for event in events if event.get("event_type") == "LATENCY_SPIKE"):
            return "Increase compute capacity on Tier 1/2."
        if any(event for event in events if event.get("event_type") == "MODEL_ERROR"):
            return "Validate model endpoints and Opus escalation logic."
        if any(event for event in events if event.get("event_type") == "TIMEOUT"):
            return "Revisit timeout budgets and async concurrency settings."
        return "System stable. Ready for Controlled Beta."


__all__ = ["WarRoomLogger", "WarRoomReporter", "WarRoomEvent"]
