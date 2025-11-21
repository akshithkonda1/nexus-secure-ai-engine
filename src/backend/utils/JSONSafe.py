"""Utilities to safely serialize content without leaking PII."""
from __future__ import annotations

import json
from typing import Any

from .Normalize import normalize_unicode


def safe_serialize(data: Any) -> str:
    def _convert(obj: Any) -> Any:
        if isinstance(obj, bytes):
            return obj.decode("utf-8", errors="replace")
        if isinstance(obj, (set, frozenset)):
            return list(obj)
        return obj

    normalized = normalize_unicode(json.dumps(data, default=_convert, ensure_ascii=False))
    return normalized


__all__ = ["safe_serialize"]
