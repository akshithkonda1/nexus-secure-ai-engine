"""Nexus backend package."""

from __future__ import annotations

import importlib
import sys as _sys
from typing import Iterable

from .app import create_app


__all__ = ["create_app"]


def _register_aliases(modules: Iterable[str]) -> None:
    for name in modules:
        target_name = f"{__name__}.{name}"
        try:
            module = importlib.import_module(target_name)
        except ModuleNotFoundError:  # pragma: no cover - defensive
            continue
        alias = f"Backend.{name}"
        _sys.modules.setdefault(alias, module)


_register_aliases(
    (
        "app",
        "abuse_middleware",
        "telemetry",
        "services",
        "services.debate_service",
        "utils",
    )
)


# Provide a compatibility alias for environments that previously imported
# the legacy ``Backend`` package name. This ensures case-insensitive
# filesystems behave correctly without duplicating the package tree.
_sys.modules.setdefault("Backend", _sys.modules[__name__])
