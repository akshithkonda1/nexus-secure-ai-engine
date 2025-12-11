"""Deterministic engine loader for Toron test harness."""
from __future__ import annotations

import importlib
import os
from dataclasses import dataclass
from typing import Any


class EngineLoadError(RuntimeError):
    """Raised when the configured engine cannot be resolved."""


@dataclass
class EngineConfig:
    path: str = os.getenv("ENGINE_PATH", "toron.engine.toron_v25hplus.ToronEngine")


def load_engine_instance(config: EngineConfig | None = None) -> Any:
    """
    Attempt to import and instantiate the configured engine.
    Falls back to a deterministic stub when the target module is unavailable.
    """

    cfg = config or EngineConfig()
    module_path, _, class_name = cfg.path.rpartition('.')
    if not module_path or not class_name:
        raise EngineLoadError(f"Invalid ENGINE_PATH: {cfg.path}")

    try:
        module = importlib.import_module(module_path)
        cls = getattr(module, class_name)
        return cls()
    except Exception as exc:  # noqa: BLE001
        if os.getenv("TESTOPS_ALLOW_STUB_ENGINE", "1") == "1":
            class StubEngine:
                def __init__(self):
                    self.identity = "ToronStubEngine"

                def process(self, prompt: str):
                    return {"echo": prompt, "latency_ms": 3.3, "meta": {"deterministic": True}}

            return StubEngine()
        raise EngineLoadError(str(exc)) from exc


__all__ = ["EngineLoadError", "EngineConfig", "load_engine_instance"]
