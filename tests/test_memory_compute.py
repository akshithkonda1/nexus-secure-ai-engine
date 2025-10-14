from typing import Any, Dict


import importlib
import pathlib
import sys

import pytest


MODULE_PATH = pathlib.Path(__file__).resolve().parents[1] / "nexus" / "ai"


if str(MODULE_PATH) not in sys.path:
    sys.path.insert(0, str(MODULE_PATH))

_mod = importlib.import_module("nexus.ai.memory_compute")

InMemoryStore = _mod.InMemoryStore
MemoryStore = _mod.MemoryStore
MemoryStoreError = _mod.MemoryStoreError
MultiMemoryStore = _mod.MultiMemoryStore
_ttl_seconds = _mod._ttl_seconds
verify_memory_writes = _mod.verify_memory_writes


class FailingStore(MemoryStore):
    def save(
        self, session_id: str, role: str, text: str, meta: Dict[str, Any] | None = None
    ) -> str:
        raise MemoryStoreError("fail save")

    def recent(self, session_id: str, limit: int = 8):
        raise MemoryStoreError("fail recent")


class RecordingStore(MemoryStore):
    def __init__(self):
        self.saved: list[Dict[str, Any]] = []

    def save(
        self, session_id: str, role: str, text: str, meta: Dict[str, Any] | None = None
    ) -> str:
        self.saved.append({"session": session_id, "role": role, "text": text, "meta": meta or {}})
        return "ok"

    def recent(self, session_id: str, limit: int = 8):
        return [{"role": "assistant", "text": "hi", "ts": 1}]


class RecentFailStore(RecordingStore):
    def recent(self, session_id: str, limit: int = 8):
        raise MemoryStoreError("boom")


@pytest.fixture(autouse=True)
def clear_ttl_cache():
    _ttl_seconds.cache_clear()  # type: ignore[attr-defined]
    yield
    _ttl_seconds.cache_clear()  # type: ignore[attr-defined]


def test_in_memory_requires_dict_meta():
    store = InMemoryStore()
    with pytest.raises(MemoryStoreError):
        store.save("s", "user", "hi", meta=["bad"])  # type: ignore[arg-type]


def test_multi_memory_requires_memory_store_instances():
    with pytest.raises(MemoryStoreError):
        MultiMemoryStore([object()])  # type: ignore[list-item]


def test_multi_memory_falls_back_to_secondary_store():
    recorder = RecordingStore()
    multi = MultiMemoryStore([FailingStore(), recorder], fanout_writes=False)

    mid = multi.save("s", "user", "hi", {"ephemeral": True})
    assert mid == "ok"
    assert recorder.saved[0]["session"] == "s"

    history = multi.recent("s", limit=1)
    assert history and history[0]["text"] == "hi"


def test_multi_memory_recent_fallback_when_primary_errors():
    primary = RecentFailStore()
    secondary = RecordingStore()
    multi = MultiMemoryStore([primary, secondary], fanout_writes=True)

    multi.save("s", "user", "hi", {})
    history = multi.recent("s", limit=1)
    assert history and history[0]["text"] == "hi"


def test_multi_memory_raises_when_all_stores_fail():
    multi = MultiMemoryStore([FailingStore(), FailingStore()], fanout_writes=True)
    with pytest.raises(MemoryStoreError):
        multi.save("s", "user", "hi", {})


@pytest.mark.parametrize("value", ["abc", "", "-1"])
def test_ttl_seconds_validation(value, monkeypatch):
    monkeypatch.setenv("NEXUS_MEM_TTL_SECONDS", value)
    with pytest.raises(MemoryStoreError):
        _ttl_seconds()


def test_verify_memory_writes_handles_failures():
    class PartialStore(RecordingStore):
        def __init__(self):
            super().__init__()
            self.calls = 0

        def save(
            self, session_id: str, role: str, text: str, meta: Dict[str, Any] | None = None
        ) -> str:
            self.calls += 1
            if self.calls == 1:
                raise MemoryStoreError("first write boom")
            return super().save(session_id, role, text, meta)

    store = PartialStore()
    ok, ids = verify_memory_writes(store, "s", trials=2)
    assert not ok
    assert ids == []


def test_ttl_cache_recovers(monkeypatch):
    monkeypatch.setenv("NEXUS_MEM_TTL_SECONDS", "120")
    assert _ttl_seconds() == 120
    monkeypatch.setenv("NEXUS_MEM_TTL_SECONDS", "240")
    _ttl_seconds.cache_clear()  # type: ignore[attr-defined]
    assert _ttl_seconds() == 240
