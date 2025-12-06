"""Unified logging utilities for Toron Engine v2.

This module centralises logger creation to ensure consistent formatting
and configurable log levels across the engine and simulation harness.
"""

from __future__ import annotations

import json
import logging
import os
import sys
from datetime import datetime
from typing import Any, Dict, Optional

DEFAULT_LEVEL = os.getenv("TORON_LOG_LEVEL", "INFO").upper()


def _ensure_handler(logger: logging.Logger) -> None:
    """Attach a stream handler if none exists.

    The handler emits JSON-serialisable messages to stdout to make it easy
    for log aggregators to parse events. Duplicate handlers are avoided so
    repeated calls to :func:`get_logger` remain idempotent.
    """

    if logger.handlers:
        return
    handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter("%(message)s")
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.propagate = False


def get_logger(name: str, level: Optional[str | int] = None) -> logging.Logger:
    """Return a configured logger instance.

    Parameters
    ----------
    name:
        Logger namespace. Typically a module or subsystem name.
    level:
        Optional override for the logging level. If omitted, the
        ``TORON_LOG_LEVEL`` environment variable is used, defaulting to
        ``INFO``.
    """

    logger = logging.getLogger(name)
    _ensure_handler(logger)
    logger.setLevel(level or DEFAULT_LEVEL)
    return logger


def log_event(logger: logging.Logger, event: str, **fields: Any) -> None:
    """Emit a structured log entry.

    The payload is serialised to JSON and includes a timestamp and event
    name. Any keyword arguments are merged into the payload allowing
    contextual metadata to be attached without additional boilerplate.
    """

    payload: Dict[str, Any] = {
        "ts": datetime.utcnow().isoformat() + "Z",
        "event": event,
    }
    for key, value in fields.items():
        try:
            json.dumps(value)
            payload[key] = value
        except (TypeError, ValueError):
            payload[key] = repr(value)
    logger.info(json.dumps(payload))


__all__ = ["get_logger", "log_event", "DEFAULT_LEVEL"]
