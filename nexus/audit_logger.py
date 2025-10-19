"""Structured audit logging utilities."""
from __future__ import annotations

import json
import os
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Mapping

_REDACT = re.compile(r"([\w\.-]+@[\w\.-]+)|(\b\d{1,3}(\.\d{1,3}){3}\b)")


@dataclass(frozen=True)
class Actor:
    user_id: str
    tier: str | None = None


def redact(value: str | None) -> str:
    if not value:
        return ""
    return _REDACT.sub("[redacted]", value)


def log_event(event: str, actor: Actor | Mapping[str, Any], meta: Mapping[str, Any] | None = None) -> None:
    payload = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "event": event,
        "actor": actor if isinstance(actor, Mapping) else actor.__dict__,
        "meta": meta or {},
    }
    serialized = json.dumps(payload, ensure_ascii=False)
    serialized = redact(serialized)

    path = Path(os.getenv("AUDIT_LOG_PATH", "./logs/audit.jsonl")).expanduser()
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as handle:
        handle.write(serialized + "\n")


__all__ = ["Actor", "log_event", "redact"]
