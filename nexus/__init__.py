"""Top-level Nexus package."""

from importlib import import_module
from types import ModuleType
from typing import TYPE_CHECKING

__all__ = [
    "ai",
]

ai: ModuleType = import_module("nexus.ai")

if TYPE_CHECKING:
    from . import ai as ai  # noqa: F401
