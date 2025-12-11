"""Version lock for Toron v2.5H+ usage."""
from __future__ import annotations

from typing import Type

# Importing from the mandated module path to ensure only the correct engine is used.
try:  # pragma: no cover - import guard
    from ryuzen.engine.toron_v25hplus import ToronEngine  # type: ignore
except ImportError:  # Fallback when the symbol is not exported but the module is available.
    from ryuzen.engine.toron_v25hplus import RyuzenToronV25HPlus as ToronEngine  # type: ignore

EXPECTED_MODULE = "ryuzen.engine.toron_v25hplus"
EXPECTED_VERSION = "2.5H+"


def enforce_version(engine_cls: Type[object]) -> None:
    """Validate that the provided engine class resolves to Toron v2.5H+.

    Raises:
        RuntimeError: If the engine class does not originate from the expected module.
    """

    module_name = getattr(engine_cls, "__module__", "")
    if module_name != EXPECTED_MODULE:
        raise RuntimeError(
            f"Toron engine version mismatch: expected module {EXPECTED_MODULE}, got {module_name}"
        )

    if getattr(engine_cls, "__name__", "") != "ToronEngine":
        # Normalize aliasing while still enforcing the module path.
        setattr(engine_cls, "__name__", "ToronEngine")


__all__ = ["ToronEngine", "EXPECTED_VERSION", "enforce_version"]
