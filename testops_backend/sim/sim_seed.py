"""Utilities for deterministic simulation seeds.

The simulation suite relies on fixed seeds to ensure byte-for-byte repeatability
of synthetic Toron runs. The helpers below keep randomness scoped to
``random.Random`` instances so that tests never leak global state.
"""
import hashlib
import os
import random
from dataclasses import dataclass
from typing import Optional

DEFAULT_SIM_SEED = 4242


@dataclass
class SeedContext:
    """Container for deterministic RNG instances.

    Keeping the RNG here allows callers to pass around an isolated generator
    without mutating module-level globals.
    """

    seed: int
    rng: random.Random


def build_seed(seed: Optional[int] = None) -> SeedContext:
    """Return a seeded RNG context.

    A fallback seed can be provided via the ``SIM_SEED`` environment variable
    to keep CI runs consistent.
    """

    resolved = seed if seed is not None else int(os.getenv("SIM_SEED", DEFAULT_SIM_SEED))
    return SeedContext(seed=resolved, rng=random.Random(resolved))


def determinism_fingerprint(values: list) -> str:
    """Return a simple hex fingerprint for a list of deterministic values."""

    joined = "|".join(map(str, values))
    digest = hashlib.sha256(joined.encode()).hexdigest()
    return digest[:16]
