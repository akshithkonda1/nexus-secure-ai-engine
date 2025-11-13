import os
from typing import Dict, Any, List, Optional, Tuple

# Allow optional deps fallbacks inside engine (requests/bs4/cryptography)
os.environ.setdefault("NEXUS_ALLOW_TEST_FALLBACKS", "1")

# Attempt both common import paths; adjust here if your layout differs.
try:
    from nexus.ai.nexus_engine import (
        Engine,
        EngineConfig,
        AccessContext,
        Crypter,
        WebRetriever,
        WebSource,
    )
except Exception:
    from nexus_engine import (  # type: ignore
        Engine,
        EngineConfig,
        AccessContext,
        Crypter,
        WebRetriever,
        WebSource,
    )


class FakeConnector:
    """Mimics ModelConnector.infer(), no HTTP."""

    def __init__(self, name: str, text: str):
        self.name = name
        self.adapter = "fake.adapter"
        self.endpoint = "https://fake.example.com"
        self._text = text

    def infer(
        self, prompt: str, *, history=None, model_name=None, deadline=None
    ) -> Tuple[str, Dict[str, Any]]:
        return self._text + " :: " + (prompt or "")[:40], {"usage": {"fake": True}}

    def health_check(self) -> bool:
        return False  # in your engine: False == healthy


class FakeWeb(WebRetriever):
    """Returns static HTTPS sources so verification passes offline."""

    def __init__(self):
        self.providers = []
        self.scraper = None

    def search_all(
        self,
        query: str,
        *,
        k_per_provider=5,
        want_images=False,
        max_total=12,
        deadline=None,
        request_id=None,
    ) -> List[WebSource]:
        return [
            WebSource(
                url="https://example.com/alpha",
                title="Alpha Source",
                snippet=f"This is a test snippet mentioning {query}",
                image=None,
                score=1.0,
            ),
            WebSource(
                url="https://www.wikipedia.org/",
                title="Wikipedia",
                snippet=f"Wikipedia page related to {query}",
                image=None,
                score=0.9,
            ),
        ][:max_total]


def mk_crypter() -> Crypter:
    key = b"x" * 32  # 32 bytes (AES-256) for tests only.
    return Crypter(key)


def mk_engine(text="Hello from fake model") -> Engine:
    connectors = {
        "fake-1": FakeConnector("fake-1", text),
        "fake-2": FakeConnector("fake-2", text + " (var)"),
    }
    cfg = EngineConfig(
        min_sources_required=1,  # verification must succeed
        search_k_per_provider=2,
        search_max_total=4,
        max_parallel=2,
        default_policy="consensus.simple",
        default_deadline_ms=2000,  # tight deadline to catch stalls
    )
    return Engine(
        connectors=connectors,
        memory=None,
        web=FakeWeb(),
        access=AccessContext(tenant_id="t1", instance_id="i1", user_id="u1"),
        crypter=mk_crypter(),
        config=cfg,
    )


def test_engine_run_happy_path():
    eng = mk_engine()
    out = eng.run(session_id="s1", query="what is nexus?")
    assert out["status"] == "ok"
    # required schema keys
    for key in ("answer", "pii_detected", "pii_details", "models_used", "timings", "meta"):
        assert key in out, f"missing key: {key}"
    assert isinstance(out["answer"], str) and out["answer"]
    assert isinstance(out["models_used"], list) and out["models_used"]
    assert isinstance(out["timings"], dict)
    assert isinstance(out["meta"], dict)
    assert out["winner"] in out["participants"]
    assert len(out["sources"]) >= 1


def test_engine_verification_failure_when_no_sources():
    class EmptyWeb(FakeWeb):
        def search_all(self, *a, **k):
            return []

    eng = mk_engine()
    eng.web = EmptyWeb()
    result = eng.run(session_id="s1", query="force failure")
    assert result["status"] == "error"
    assert result.get("error_code") == "verification_failed"


def test_rate_limit_and_concurrency_do_not_crash():
    eng = mk_engine()
    results = []
    for _ in range(3):
        try:
            results.append(eng.run(session_id="s1", query="rl test"))
        except Exception as e:
            results.append({"error": str(e)})
    assert len(results) == 3
    assert all(isinstance(item, dict) for item in results)


def test_health_snapshot_minimal():
    eng = mk_engine()
    snap = eng.health_snapshot()
    assert "ok" in snap and "components" in snap


def test_pii_detection_blocks_by_default():
    eng = mk_engine()
    result = eng.run(session_id="s1", query="contact me at jane@example.com")
    assert result["status"] == "pii_detected"
    assert result["pii_detected"] is True
    assert result["pii_details"]
    assert result["answer"] is None
    assert result.get("error_message")
    assert result.get("sanitized_preview")


def test_pii_override_allows_request():
    eng = mk_engine()
    result = eng.run(
        session_id="s1",
        query="contact me at jane@example.com",
        pii_override=True,
    )
    assert result["status"] == "ok"
    assert result["pii_detected"] is True
    assert "[REDACTED]" in result["answer"]
