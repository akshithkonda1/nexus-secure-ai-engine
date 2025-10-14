# mypy: ignore-errors

import importlib
import os
import pathlib
import sys
import threading
import time

import pytest


MODULE_PATH = pathlib.Path(__file__).resolve().parents[1] / "nexus" / "ai"

os.environ.setdefault("NEXUS_ALLOW_TEST_FALLBACKS", "1")

module_dir = str(MODULE_PATH)
if module_dir not in sys.path:
    sys.path.insert(0, module_dir)

nexus_engine = importlib.import_module("nexus.ai.nexus_engine")


class MemoryStub:
    def __init__(self):
        self._store = {}

    def save(self, session: str, role: str, text: str, meta):
        self._store.setdefault(session, []).append({"role": role, "text": text, "meta": meta})

    def recent(self, session: str, limit: int = 8):
        entries = self._store.get(session, [])
        return entries[-limit:]


class DummyConnector:
    def __init__(self, text: str):
        self.adapter = "dummy"
        self.endpoint = "https://example.com/api"
        self._text = text

    def infer(self, prompt, history=None, model_name=None, deadline=None):
        return self._text, {}

    def health_check(self):  # pragma: no cover - trivial in tests
        return False


class DummyWebRetriever:
    def __init__(self, batches):
        self.providers = []
        self._batches = list(batches)
        self._calls = 0
        self.scraper = _PassthroughScraper()

    def search_all(self, query, **kwargs):
        if self._calls < len(self._batches):
            result = self._batches[self._calls]
        else:
            result = []
        self._calls += 1
        return list(result)


class _PassthroughScraper:
    def enrich(self, src, **kwargs):  # pragma: no cover - simple stub
        return src


@pytest.fixture(autouse=True)
def reset_engine_state(monkeypatch):
    monkeypatch.setenv("NEXUS_HEALTH_AUTORUN", "0")
    monkeypatch.setattr(
        nexus_engine, "_GLOBAL_RATE_LIMITER", nexus_engine.RateLimiter(10_000, 10_000)
    )
    monkeypatch.setattr(
        nexus_engine,
        "_GLOBAL_CONCURRENCY_SEMAPHORE",
        threading.BoundedSemaphore(10_000),
    )
    monkeypatch.setattr(nexus_engine, "_SCRAPE_DENYLIST", [])
    monkeypatch.setattr(nexus_engine, "_SCRAPE_ALLOWLIST", [])
    monkeypatch.setattr(nexus_engine, "_RESPECT_ROBOTS", False)
    nexus_engine._reset_robots_cache()
    yield


def _make_engine(web_batches, *, min_sources=2):
    connectors = {
        "alpha": DummyConnector("unified answer"),
        "beta": DummyConnector("unified answer"),
    }
    config = nexus_engine.EngineConfig(
        min_sources_required=min_sources,
        search_k_per_provider=3,
        search_max_total=5,
    )
    engine = nexus_engine.Engine(
        connectors=connectors,
        memory=MemoryStub(),
        web=DummyWebRetriever(web_batches),
        access=nexus_engine.AccessContext("tenant", "instance", "user"),
        crypter=nexus_engine.Crypter(b"0" * 32),
        config=config,
    )
    engine.stop_health_monitor()
    return engine


def test_engine_run_includes_schema_and_policy(monkeypatch):
    sources = [
        [
            nexus_engine.WebSource(url="https://allowed.example/a", title="A", snippet="alpha"),
            nexus_engine.WebSource(url="https://second.example/b", title="B", snippet="beta"),
        ],
        [],
    ]
    engine = _make_engine(sources, min_sources=2)
    result = engine.run("session", "question")

    assert "meta" in result
    assert result["meta"]["schema_version"] == nexus_engine.ENGINE_SCHEMA_VERSION
    assert result["meta"]["policy"] == "consensus.simple"
    assert isinstance(result["meta"]["latencies"], dict) and result["meta"]["latencies"]
    assert "alpha" in result["meta"]["latencies"]
    assert len(result["sources"]) >= 2
    assert "policy_scores" in result["meta"]


def test_circuit_breaker_opens_after_threshold():
    breaker = nexus_engine._CircuitBreaker()
    wait = 0.0
    for _ in range(nexus_engine.CIRCUIT_THRESHOLD):
        wait = breaker.record_failure()
    allowed, retry_after = breaker.allow()
    assert not allowed
    assert retry_after > 0

    breaker.open_until = time.monotonic() - 1
    allowed_again, _ = breaker.allow()
    assert allowed_again
    assert wait >= 0


def test_rate_limiter_burst_and_per_minute_windows():
    limiter = nexus_engine.RateLimiter(per_minute=2, burst=3)
    base = 10.0
    assert limiter.try_acquire("key", now=base)[0]
    assert limiter.try_acquire("key", now=base + 1.0)[0]
    allowed_third, retry_third = limiter.try_acquire("key", now=base + 2.0)
    assert not allowed_third and retry_third > 0

    allowed, retry = limiter.try_acquire("key", now=base + 3.0)
    assert not allowed and retry > 0

    allowed_after, _ = limiter.try_acquire("key", now=base + 62.0)
    assert allowed_after

    minute_limiter = nexus_engine.RateLimiter(per_minute=2, burst=5)
    assert minute_limiter.try_acquire("other", now=base)[0]
    assert minute_limiter.try_acquire("other", now=base + 1.0)[0]
    allowed2, retry2 = minute_limiter.try_acquire("other", now=base + 2.0)
    assert not allowed2 and retry2 > 0


def test_check_payload_size_enforces_limit(monkeypatch):
    monkeypatch.setattr(nexus_engine, "MAX_MODEL_REQUEST_BYTES", 16)
    with pytest.raises(nexus_engine.PayloadTooLargeError):
        nexus_engine._check_payload_size({"oversized": "x" * 32})


def test_verification_fallback_collects_additional_sources(monkeypatch):
    primary = [nexus_engine.WebSource(url="https://first.example/a", title="A", snippet="primary")]
    fallback = [
        nexus_engine.WebSource(url="https://second.example/b", title="B", snippet="secondary")
    ]
    engine = _make_engine([primary, [], fallback], min_sources=2)
    result = engine.run("session", "Need more evidence")
    assert len(result["sources"]) >= 2


def test_allowlist_filters_sources(monkeypatch):
    monkeypatch.setattr(nexus_engine, "_SCRAPE_ALLOWLIST", ["allowed.example"])
    sources = [
        [
            nexus_engine.WebSource(url="https://allowed.example/a", title="A", snippet="alpha"),
            nexus_engine.WebSource(url="https://blocked.example/b", title="B", snippet="beta"),
        ]
    ]
    engine = _make_engine(sources, min_sources=1)
    result = engine.run("session", "question")
    assert result["sources"]
    assert all("allowed.example" in src["url"] for src in result["sources"])


def test_html_scraper_respects_robots_rules(monkeypatch):
    monkeypatch.setattr(nexus_engine, "_RESPECT_ROBOTS", True)
    nexus_engine._reset_robots_cache()

    class _StubResponse:
        def __init__(self, text: str, status: int = 200):
            self._text = text
            self.text = text
            self.status_code = status
            self.ok = status < 400
            self.headers = {"content-length": str(len(text))}
            self.encoding = "utf-8"

        def iter_content(self, chunk_size=65536):  # pragma: no cover - simple generator
            yield self._text.encode(self.encoding or "utf-8")

        def close(self):  # pragma: no cover - nothing to clean
            pass

    class _SessionStub:
        def __init__(self, routes):
            self.routes = dict(routes)
            self.calls = []

        def get(self, url, **kwargs):
            self.calls.append(url)
            factory = self.routes.get(url)
            if factory is None:
                raise AssertionError(f"Unexpected URL requested: {url}")
            return factory()

    robots_url = "https://site.test/robots.txt"

    session = _SessionStub({robots_url: lambda: _StubResponse("User-agent: *\nDisallow: /private")})
    scraper = nexus_engine.HtmlScraper(session=session)
    src = nexus_engine.WebSource(url="https://site.test/private/page")

    blocked = scraper.enrich(src)
    assert blocked is src
    assert session.calls == [robots_url]

    def _unexpected():  # pragma: no cover - ensures cache prevents refetch
        raise AssertionError("robots.txt should not be fetched twice")

    session.routes[robots_url] = _unexpected
    blocked_again = scraper.enrich(src)
    assert blocked_again is src
    assert session.calls == [robots_url]


def test_html_scraper_fetches_when_robots_allows(monkeypatch):
    monkeypatch.setattr(nexus_engine, "_RESPECT_ROBOTS", True)
    nexus_engine._reset_robots_cache()

    class _StubResponse:
        def __init__(self, text: str, status: int = 200):
            self._text = text
            self.text = text
            self.status_code = status
            self.ok = status < 400
            self.headers = {"content-length": str(len(text))}
            self.encoding = "utf-8"

        def iter_content(self, chunk_size=65536):  # pragma: no cover - simple generator
            yield self._text.encode(self.encoding or "utf-8")

        def close(self):  # pragma: no cover - nothing to clean
            pass

    class _SessionStub:
        def __init__(self, routes):
            self.routes = dict(routes)
            self.calls = []

        def get(self, url, **kwargs):
            self.calls.append(url)
            factory = self.routes.get(url)
            if factory is None:
                raise AssertionError(f"Unexpected URL requested: {url}")
            return factory()

    robots_url = "https://site.test/robots.txt"
    page_url = "https://site.test/allowed"

    session = _SessionStub(
        {
            robots_url: lambda: _StubResponse("User-agent: *\nAllow: /"),
            page_url: lambda: _StubResponse(
                "<html><head><title>Doc</title></head><body><p>Hello</p></body></html>"
            ),
        }
    )
    scraper = nexus_engine.HtmlScraper(session=session)
    src = nexus_engine.WebSource(url=page_url)

    enriched = scraper.enrich(src)
    assert enriched.url == page_url
    assert session.calls == [robots_url, page_url]
