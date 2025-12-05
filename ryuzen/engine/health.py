"""Health metadata utilities for the Toron engine."""
from __future__ import annotations

from typing import Any, Dict, Optional

from ryuzen.engine.simulation_mode import SimulationMode


def check_engine_loaded(engine: Optional[Any] = None) -> bool:
    """Return True if an engine instance is available."""
    return engine is not None


def check_simulation_flag() -> bool:
    """Return current simulation mode flag."""
    return SimulationMode.is_enabled()


def check_provider_count(engine: Optional[Any] = None) -> int:
    """Return the number of providers registered with the engine."""
    if engine is None:
        return 0

    providers = getattr(engine, "providers", None)
    try:
        return len(providers) if providers is not None else 0
    except Exception:
        return 0


def health_metadata(engine: Optional[Any] = None) -> Dict[str, Any]:
    """Return structured health metadata for diagnostics."""
    loaded = check_engine_loaded(engine)
    provider_count = check_provider_count(engine)

    return {
        "engine_loaded": loaded,
        "simulation_mode": check_simulation_flag(),
        "provider_count": provider_count,
        "details": {
            "engine_class": engine.__class__.__name__ if engine else None,
        },
    }
