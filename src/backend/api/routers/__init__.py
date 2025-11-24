"""Router registry for the backend API."""

from . import connectors, health, llm, projects, telemetry

__all__ = [
    "connectors",
    "health",
    "llm",
    "projects",
    "telemetry",
]

