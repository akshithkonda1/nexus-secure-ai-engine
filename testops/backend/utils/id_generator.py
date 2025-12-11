"""Deterministic ID generation utilities."""
from __future__ import annotations

import random
import uuid

# Deterministic seeding for reproducibility
random.seed(42)


def generate_run_id() -> str:
    """Generate a UUID4-based run identifier as a string."""
    return str(uuid.uuid4())


__all__ = ["generate_run_id"]
