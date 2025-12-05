"""Simulation mode toggle for Toron.

Provides a simple enable/disable flag that can be checked anywhere in the
engine to decide whether to rely on simulated providers instead of external
backends.
"""
from __future__ import annotations

from typing import ClassVar


class SimulationMode:
    """Simple global toggle for simulation behavior."""

    _enabled: ClassVar[bool] = False

    @classmethod
    def enable(cls) -> None:
        """Enable simulation mode."""
        cls._enabled = True

    @classmethod
    def disable(cls) -> None:
        """Disable simulation mode."""
        cls._enabled = False

    @classmethod
    def is_enabled(cls) -> bool:
        """Return whether simulation mode is currently enabled."""
        return cls._enabled
