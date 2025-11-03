"""Compatibility package exposing the Backend modules under a lowercase namespace."""
from importlib import import_module
import sys

_app_module = import_module("Backend.app")
_app_module.__name__ = "backend.app"
sys.modules.setdefault("backend.app", _app_module)
create_app = _app_module.create_app

_telemetry_module = import_module("Backend.telemetry")
_telemetry_module.__name__ = "backend.telemetry"
sys.modules.setdefault("backend.telemetry", _telemetry_module)

_abuse_module = import_module("Backend.abuse_middleware")
_abuse_module.__name__ = "backend.abuse_middleware"
sys.modules.setdefault("backend.abuse_middleware", _abuse_module)

_services_module = import_module("Backend.services.debate_service")
_services_module.__name__ = "backend.services.debate_service"
sys.modules.setdefault("backend.services.debate_service", _services_module)

__all__ = ["create_app"]

from . import services  # noqa: E402  # pylint: disable=wrong-import-position

__all__.append("services")
