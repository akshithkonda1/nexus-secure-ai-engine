import asyncio
import sys
import types

import pytest

from ryuzen.toron_v25hplus import cache as cache_mod
from ryuzen.toron_v25hplus import consensus
from ryuzen.toron_v25hplus import engine
from ryuzen.toron_v25hplus import mal
from ryuzen.toron_v25hplus import mmre
from ryuzen.toron_v25hplus import real_providers
from ryuzen.toron_v25hplus import reasoning
from ryuzen.toron_v25hplus import semantic
from ryuzen.toron_v25hplus.aloe import ALOERequest, ALOESynthesiser
from ryuzen.toron_v25hplus.executor import SafeExecutor
from ryuzen.toron_v25hplus.sim_suite import DEFAULT_SIM_CASES, run_suite
from ryuzen.toron_v25hplus.telemetry_stub import TelemetryBuffer


def test_stale_while_revalidate_cache_refreshes_and_tracks_hits():
    async def _exercise():
        cache = cache_mod.StaleWhileRevalidateCache(ttl_seconds=0.01)
        calls = []

        async def factory():
            calls.append("refresh")
            return len(calls)

        # first call sets value
        first = await cache.get_or_refresh("k", factory)
        assert first == 1

        # immediate hit before expiration
        second = await cache.get_or_refresh("k", factory)
        assert second == 1

        # force stale by adjusting expiry
        cache._entries["k"].expires_at = 0
        third = await cache.get_or_refresh("k", factory)
        assert third == 1

        # allow background task to run
        await asyncio.sleep(0.05)

        assert cache.telemetry.snapshot()["hit"] >= 1
        assert cache.telemetry.snapshot()["stale_hit"] == 1
        assert cache.telemetry.snapshot().get("revalidated", 0) >= 1

    asyncio.run(_exercise())


def test_safe_executor_enforces_error_budget():
    class DummyProvider(real_providers._BaseProvider):
        def __init__(self, name, succeed=True):
            super().__init__(name)
            self.succeed = succeed

        def invoke(self, prompt: str) -> real_providers.ProviderResponse:
            return real_providers.ProviderResponse(
                success=self.succeed, content=prompt if self.succeed else None, latency_ms=0.1, error=None
            )

    providers = {"ok": DummyProvider("ok", True), "fail": DummyProvider("fail", False)}
    async def _run_executor(error_budget):
        executor = SafeExecutor(providers, error_budget=error_budget)
        return await executor.run("ping")

    results = asyncio.run(_run_executor(0.6))
    assert [r.provider for r in results] == ["ok"]

    with pytest.raises(RuntimeError):
        asyncio.run(_run_executor(0.1))


def test_safe_executor_handles_empty_provider_map():
    executor = SafeExecutor({}, error_budget=0.1)
    results = asyncio.run(executor.run("ping"))
    assert results == []


class DummyMMREngine(mmre.MMREngine):
    def __init__(self):
        super().__init__(max_results=3)
        self.queries = []

    def _search(self, query: str):
        self.queries.append(query)
        return ["evidence"] if "good" in query else []


def test_mmre_engine_reports_density_and_conflicts():
    engine = DummyMMREngine()
    packet = engine.evaluate_claims(["good claim", "bad claim"])
    assert packet.verified_facts == ["good claim"]
    assert packet.conflicts_detected == ["bad claim"]
    assert packet.evidence_density == pytest.approx(1 / 6)
    assert packet.escalation_required is True
    assert len(engine.queries) == 2


def test_mmre_engine_handles_search_failures(monkeypatch):
    monkeypatch.setattr(mmre.requests, "get", lambda *a, **k: (_ for _ in ()).throw(RuntimeError("no network")))
    engine = mmre.MMREngine(max_results=2)
    packet = engine.evaluate_claims(["one"])
    assert packet.verified_facts == []
    assert packet.conflicts_detected == ["one"]


class DummyDetector(semantic.SemanticContradictionDetector):
    def __init__(self):
        super().__init__(model_name="dummy")
        self.embeddings = {}

    def embed(self, text: str):
        if text not in self.embeddings:
            self.embeddings[text] = semantic.np.array([0.0, 1.0])
        return self.embeddings[text]

    def cosine_similarity(self, a, b):
        return float((a == b).all())


def test_semantic_contradiction_detector_prefers_label_conflicts(monkeypatch):
    detector = DummyDetector()
    # bypass model load by injecting simple vectors
    detector.embeddings["a"] = detector.embeddings["b"] = semantic.np.array([1.0, 0.0])
    contradictions, rate = detector.find_disagreements([
        ("a", "yes"),
        ("b", "no"),
    ])
    assert any("label conflict" in item for item in contradictions)
    assert rate == pytest.approx(1.0)


class StubPipeline:
    def __call__(self, text, candidate_labels):
        return {"labels": candidate_labels, "scores": [0.6, 0.2, 0.1]}


def test_logic_detector_uses_threshold(monkeypatch):
    detector = reasoning.LogicDetector(threshold=0.5)
    detector._pipeline = StubPipeline()
    signal = detector.analyse("Needs reasoning")
    assert signal.requires_reasoning is True
    assert signal.confidence == pytest.approx(0.6)


class FakeProvider(real_providers._BaseProvider):
    def __init__(self, should_fail=False):
        super().__init__("fake")
        self.should_fail = should_fail

    def invoke(self, prompt: str) -> real_providers.ProviderResponse:
        if self.should_fail:
            raise ValueError("boom")
        return prompt.upper()


def test_real_provider_time_call_handles_success_and_error():
    provider = FakeProvider()
    success = provider._time_call(lambda: provider.invoke("hi"))
    assert success.success and success.content == "HI"

    failing = FakeProvider(should_fail=True)
    error = failing._time_call(lambda: failing.invoke("hi"))
    assert not error.success and error.error


def test_real_providers_invoke_with_fake_clients(monkeypatch):
    class FakeChat:
        class Completions:
            @staticmethod
            def create(model=None, messages=None):
                return types.SimpleNamespace(choices=[types.SimpleNamespace(message=types.SimpleNamespace(content="ok"))])

        completions = Completions()

    class FakeOpenAI:
        def __init__(self):
            self.chat = FakeChat()

    class FakeAnthropicMessages:
        @staticmethod
        def create(model=None, max_tokens=None, messages=None):
            return types.SimpleNamespace(content=[types.SimpleNamespace(text="anthropic")])

    class FakeAnthropic:
        def __init__(self):
            self.messages = FakeAnthropicMessages()

    monkeypatch.setitem(sys.modules, "openai", types.SimpleNamespace(OpenAI=lambda: FakeOpenAI()))
    monkeypatch.setitem(sys.modules, "anthropic", types.SimpleNamespace(Anthropic=lambda: FakeAnthropic()))

    openai_provider = real_providers.OpenAIProvider(model="demo")
    anthro_provider = real_providers.AnthropicProvider(model="demo")

    openai_resp = openai_provider.invoke("hello")
    anthropic_resp = anthro_provider.invoke("hello")

    assert openai_resp.success and "ok" in openai_resp.content
    assert anthropic_resp.success and "anthropic" in anthropic_resp.content


def test_consensus_weighting_and_fit_weights():
    weights = consensus.fit_weights([[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]], [10, 20, 30, 40])
    score = consensus.weighted_score(weights, [1, 1, 1, 1])
    assert 10 <= score <= 100


def test_engine_interpret_label_and_provider_execution(monkeypatch):
    tier = engine.ModelExecutionTier(providers={}, simulation_mode=False)
    assert tier._interpret_label("Definitely false", "true") == "false"
    assert tier._interpret_label("Seems TRUE", "false") == "true"
    assert tier._interpret_label("uncertain", "maybe") == "maybe"

    class DummyProvider(real_providers._BaseProvider):
        def __init__(self):
            super().__init__("dummy")

        def invoke(self, prompt: str) -> real_providers.ProviderResponse:
            return real_providers.ProviderResponse(success=True, content="true", latency_ms=10.0, error=None)

    tier.providers = {"dummy": DummyProvider()}
    psl = {"claims": (engine.Premise(text="claim", label="false"),), "token_count": 1}
    results = tier._run_providers(psl)
    assert results["dummy"][0]["label"] == "true"


def test_semantic_detector_loads_model_with_stub(monkeypatch):
    class FakeST:
        def __init__(self, name):
            self.name = name

        def encode(self, texts):
            return [[1.0, 0.0]]

    monkeypatch.setitem(sys.modules, "sentence_transformers", types.SimpleNamespace(SentenceTransformer=FakeST))
    detector = semantic.SemanticContradictionDetector(model_name="fake")
    vector = detector.embed("hello")
    assert detector._model is not None
    assert vector.tolist() == [1.0, 0.0]


def test_logic_detector_loads_pipeline_with_stub(monkeypatch):
    class FakePipeline:
        def __call__(self, text, candidate_labels):
            return {"scores": [0.4, 0.3, 0.2]}

    monkeypatch.setitem(sys.modules, "transformers", types.SimpleNamespace(pipeline=lambda *args, **kwargs: FakePipeline()))
    detector = reasoning.LogicDetector(threshold=0.3)
    signal = detector.analyse("text")
    assert signal.confidence == pytest.approx(0.4)
    assert signal.requires_reasoning


def test_mal_layer_retries_and_caches():
    layer = mal.ModelAssuranceLayer()
    latency_first = layer.generate_latency("sig")
    latency_second = layer.generate_latency("sig")
    assert latency_first == latency_second
    assert layer.cached_latencies() == 1

    fingerprint = layer.fingerprint("payload")
    assert fingerprint == layer.fingerprint("payload")
    assert layer.cached_fingerprints() == 1

    success = layer.retry("sig", failure_budget=1, max_attempts=3)
    assert success["status"] == "ok"
    failed = layer.retry("sig-fail", failure_budget=5, max_attempts=2)
    assert failed["status"] == "failed"


def test_engine_cache_and_empty_provider_behavior():
    cache = engine.DeterministicCache[int]()
    value = cache.get_or_create("k", lambda: 5)
    assert value == 5
    assert cache.get_or_create("k", lambda: 6) == 5

    tier = engine.ModelExecutionTier(providers={}, simulation_mode=False)
    psl = {"claims": (engine.Premise(text="claim", label="true"),), "token_count": 1}
    assert tier._run_providers(psl) == {}


def test_real_provider_loader_respects_environment(monkeypatch):
    monkeypatch.setenv("OPENAI_API_KEY", "x")
    monkeypatch.setenv("ANTHROPIC_API_KEY", "y")
    monkeypatch.setitem(sys.modules, "openai", types.SimpleNamespace(OpenAI=lambda: object()))
    monkeypatch.setitem(sys.modules, "anthropic", types.SimpleNamespace(Anthropic=lambda: object()))
    providers = real_providers.load_real_providers()
    assert "openai" in providers and "anthropic" in providers


def test_semantic_detector_load_model_path(monkeypatch):
    class FakeST:
        def __init__(self, name):
            self.name = name

        def encode(self, texts):
            return [[0.5, 0.5]]

    monkeypatch.setitem(sys.modules, "sentence_transformers", types.SimpleNamespace(SentenceTransformer=FakeST))
    detector = semantic.SemanticContradictionDetector(model_name="fake")
    model = detector._load_model()
    assert model is detector._model
    vec = detector.embed("hi")
    assert pytest.approx(vec.tolist()) == [0.5, 0.5]


def test_ryuzen_engine_requires_providers_when_not_simulated(monkeypatch):
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    with pytest.raises(RuntimeError):
        engine.RyuzenEngine(simulation_mode=False, mmre_engine=mmre.MMREngine(max_results=0))


def test_aloe_synthesiser_formats_output_and_fallback():
    synthesiser = ALOESynthesiser()
    message = synthesiser.synthesise(ALOERequest(["Fact one", "Fact two"], tone="supportive", detail_level="list"))
    assert "Fact one" in message and "Fact two" in message

    empty = synthesiser.synthesise(ALOERequest([], tone="urgent"))
    assert "No verified facts" in empty

    class BadFact(str):
        def strip(self):
            raise ValueError("bad")

    fallback = synthesiser.synthesise(ALOERequest([BadFact()], tone="supportive"))
    assert "BadFact" not in fallback


def test_sim_suite_and_telemetry_buffer_utilities():
    payload = run_suite()
    assert payload["count"] == len(DEFAULT_SIM_CASES)
    assert all(item["status"] == "passed" for item in payload["results"])

    buffer = TelemetryBuffer()
    buffer.record("s1", 1.0)
    buffer.record("s2", 2.0)
    scrub = buffer.scrub()
    assert scrub["cleared"] == 2
    quarantine = buffer.quarantine("check", ["s1"])
    assert quarantine["count"] == 0


def test_cache_handles_hit_after_lock_and_refresh_failure():
    cache = cache_mod.StaleWhileRevalidateCache(ttl_seconds=0.01)

    async def slow_factory():
        await asyncio.sleep(0.01)
        return "value"

    async def failing_factory():
        raise RuntimeError("boom")

    # first call populates
    asyncio.run(cache.get_or_refresh("key", slow_factory))
    # second call should hit_after_lock path because value still fresh while under lock
    result = asyncio.run(cache.get_or_refresh("key", slow_factory))
    assert result == "value"

    # failed refresh increments telemetry
    asyncio.run(cache._refresh("key", failing_factory))
    assert cache.telemetry.snapshot().get("revalidate_failed", 0) >= 1
