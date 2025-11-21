"""Router registry for the backend API."""

from . import connectors, health, llm, telemetry

__all__ = [
    "connectors",
    "health",
    "llm",
    "telemetry",
]

