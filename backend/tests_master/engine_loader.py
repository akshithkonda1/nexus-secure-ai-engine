from __future__ import annotations

import importlib
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Any

DEFAULT_ENGINE_PATH = "backend.tests_master.engine_loader.LocalToronEngine"
CONFIG_PATH = Path("testops_config.yaml")


class EngineLoadError(RuntimeError):
    """Raised when the engine cannot be loaded."""


@dataclass
class LocalToronEngine:
    name: str = "LocalToronEngine"

    def process(self, prompt: str) -> str:
        return f"{self.name}:{prompt}"


def _read_engine_path() -> str:
    env_path = os.getenv("ENGINE_PATH") or os.getenv("TESTOPS_ENGINE_PATH")
    if env_path:
        return env_path
    if CONFIG_PATH.exists():
        for line in CONFIG_PATH.read_text(encoding="utf-8").splitlines():
            if line.strip().startswith("ENGINE_PATH"):
                _, value = line.split(":", 1)
                return value.strip().strip("'\"")
    return DEFAULT_ENGINE_PATH


def load_engine_instance() -> Any:
    engine_path = _read_engine_path()
    if engine_path == DEFAULT_ENGINE_PATH:
        return LocalToronEngine()

    try:
        module_path, class_name = engine_path.rsplit(".", 1)
    except ValueError as exc:  # pragma: no cover - defensive
        raise EngineLoadError(f"Invalid ENGINE_PATH: {engine_path}") from exc

    try:
        module = importlib.import_module(module_path)
    except ModuleNotFoundError as exc:
        raise EngineLoadError(f"Module not found: {module_path}") from exc

    try:
        cls = getattr(module, class_name)
    except AttributeError as exc:
        raise EngineLoadError(f"Engine class not found: {class_name}") from exc

    try:
        return cls()  # type: ignore[call-arg]
    except Exception as exc:  # pragma: no cover - engine specific
        raise EngineLoadError(f"Engine instantiation failed: {exc}") from exc


__all__ = ["load_engine_instance", "EngineLoadError", "LocalToronEngine"]
