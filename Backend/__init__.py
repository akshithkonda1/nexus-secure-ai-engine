"""Compatibility wrapper for legacy uppercase ``Backend`` imports."""

from __future__ import annotations

from importlib import import_module as _import_module
import sys as _sys


# Import the canonical lowercase package. This executes ``backend.__init__``
# which registers all ``Backend.*`` aliases for downstream modules.
_backend = _import_module("backend")


# Reuse the same module object so ``Backend`` behaves exactly like
# ``backend``.  This ensures package attributes such as ``__path__`` are
# correctly propagated for submodule imports like ``Backend.telemetry``.
_sys.modules[__name__] = _backend
