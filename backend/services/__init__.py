"""Compatibility namespace for backend services."""
from importlib import import_module
import sys

_module = import_module("Backend.services.debate_service")
_module.__name__ = "backend.services.debate_service"
sys.modules.setdefault("backend.services.debate_service", _module)

__all__ = ["_module"]
