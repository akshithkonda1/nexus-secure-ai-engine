import time
from typing import List

import pytest

from nexus.ai.search_connector import SearchConnector, SearchResult
from nexus.ai.timeout_manager import apply_timeout


def test_provider_priority_and_retries(monkeypatch):
    connector = SearchConnector(sim_mode=False)
    calls: List[str] = []

    def google(query: str, max_results: int) -> List[SearchResult]:
        calls.append("google")
        return []

    def ddg(query: str, max_results: int) -> List[SearchResult]:
        calls.append("ddg")
        return []

    def tavily(query: str, max_results: int) -> List[SearchResult]:
        calls.append("tavily")
        return []

    def wiki(query: str, max_results: int) -> List[SearchResult]:
        calls.append("wikipedia")
        return []

    monkeypatch.setattr(connector, "_google", google)
    monkeypatch.setattr(connector, "_duckduckgo", ddg)
    monkeypatch.setattr(connector, "_tavily", tavily)
    monkeypatch.setattr(connector, "_wikipedia", wiki)
    monkeypatch.setattr(time, "sleep", lambda *_: None)

    connector.providers = [connector._google, connector._duckduckgo, connector._tavily, connector._wikipedia]
    result = connector.search("test query")

    assert result[0]["source"] == "toron:fallback"
    assert calls.count("google") == 4
    assert calls.count("ddg") == 4
    assert calls.count("tavily") == 4
    assert calls.count("wikipedia") == 4


def test_retry_stops_on_success(monkeypatch):
    connector = SearchConnector(sim_mode=False)
    attempts: List[int] = []

    def flaky(query: str, max_results: int) -> List[SearchResult]:
        attempts.append(1)
        if len(attempts) < 4:
            raise RuntimeError("boom")
        return [SearchResult(source="ok", content="done")]

    monkeypatch.setattr(time, "sleep", lambda *_: None)
    connector.providers = [flaky]
    results = connector.search("stability")
    assert len(attempts) == 4
    assert results[0]["source"] == "ok"


def test_timeout_decorator_enforces_limit():
    @apply_timeout(timeout=0.1)
    def slow_call() -> str:
        time.sleep(0.5)
        return "late"

    with pytest.raises(TimeoutError):
        slow_call()
