from __future__ import annotations

from pathlib import Path
import importlib
import inspect
from typing import Any, Dict, Type

import yaml


class EngineLoadError(Exception):
    """Raised when the Toron engine cannot be loaded or instantiated."""


def load_config(config_path: Path | None = None) -> Dict[str, Any]:
    """Load and validate the TestOps configuration.

    Args:
        config_path: Optional path override for the YAML configuration file.

    Returns:
        Parsed configuration mapping.

    Raises:
        EngineLoadError: If the configuration file cannot be read or is invalid.
    """

    resolved_path = config_path or Path(__file__).resolve().parents[2] / "testops_config.yaml"

    if not resolved_path.is_file():
        raise EngineLoadError(f"Configuration file not found at {resolved_path}.")

    try:
        with resolved_path.open("r", encoding="utf-8") as config_file:
            config: Dict[str, Any] = yaml.safe_load(config_file) or {}
    except OSError as exc:
        raise EngineLoadError(f"Failed to read configuration file: {exc}.") from exc
    except yaml.YAMLError as exc:
        raise EngineLoadError("Failed to parse YAML configuration.") from exc

    if not isinstance(config, dict):
        raise EngineLoadError("Configuration content is not a mapping.")

    engine_path = config.get("ENGINE_PATH")
    if not isinstance(engine_path, str) or not engine_path.strip():
        raise EngineLoadError("ENGINE_PATH missing or not a valid string in configuration.")

    return config


def import_engine_class(engine_path: str) -> Type[Any]:
    """Import and return the engine class defined by a dotted path."""

    if not engine_path or "." not in engine_path:
        raise EngineLoadError("Engine path must be a dotted string like 'module.ClassName'.")

    module_path, _, class_name = engine_path.rpartition(".")
    if not module_path or not class_name:
        raise EngineLoadError("Invalid ENGINE_PATH format; expected 'module.ClassName'.")

    try:
        module = importlib.import_module(module_path)
    except ModuleNotFoundError as exc:
        raise EngineLoadError(f"Could not import engine module '{module_path}': {exc}.") from exc

    try:
        engine_class = getattr(module, class_name)
    except AttributeError as exc:
        raise EngineLoadError(
            f"Engine class '{class_name}' not found in module '{module_path}'."
        ) from exc

    if not callable(engine_class):
        raise EngineLoadError(f"Engine target '{engine_path}' is not callable.")

    return engine_class


def load_engine_instance(config_path: Path | None = None) -> Any:
    """Instantiate and return the Toron engine defined in configuration."""

    config = load_config(config_path)
    engine_path = config["ENGINE_PATH"]
    engine_class = import_engine_class(engine_path)

    try:
        signature = inspect.signature(engine_class)
        kwargs: Dict[str, Any] = {"config": config} if "config" in signature.parameters else {}
        return engine_class(**kwargs)
    except Exception as exc:  # noqa: BLE001
        raise EngineLoadError(f"Failed to instantiate engine '{engine_path}': {exc}.") from exc
