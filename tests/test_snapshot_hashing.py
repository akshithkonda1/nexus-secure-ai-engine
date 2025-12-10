"""Deterministic hashing coverage for StateSnapshot payloads."""

from __future__ import annotations

from ryuzen.toron_v25hplus import RyuzenEngine
from ryuzen.toron_v25hplus.engine import SnapshotHasher


def test_snapshot_hash_is_deterministic() -> None:
    engine = RyuzenEngine()
    snapshot = engine.execute("Hashing run is deterministic.", witnesses=[{"name": "hash", "reliability": 0.9}])

    digest_one = SnapshotHasher(snapshot).hexdigest()
    digest_two = SnapshotHasher(snapshot).hexdigest()

    assert digest_one == digest_two
    assert len(digest_one) == 64


def test_snapshot_hash_changes_with_prompt() -> None:
    engine = RyuzenEngine()
    base = engine.execute("Prompt A", witnesses=[{"name": "hash", "reliability": 0.9}])
    variant = engine.execute("Prompt B", witnesses=[{"name": "hash", "reliability": 0.9}])

    assert SnapshotHasher(base).hexdigest() != SnapshotHasher(variant).hexdigest()
