import asyncio
import sys
import types
from typing import Any, Dict, List

import pytest

# Stub heavy optional dependencies to keep tests deterministic.
sys.modules.setdefault("aioboto3", types.SimpleNamespace(Session=lambda: None))
sys.modules.setdefault(
    "openai",
    types.SimpleNamespace(AsyncOpenAI=object, AsyncAzureOpenAI=object),
)

# Minimal OpenTelemetry stubs for import-time dependencies
class _DummySpan:
    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):  # pragma: no cover - noop
        return False

    def get_span_context(self):  # pragma: no cover - noop
        return None

    def set_attribute(self, *_, **__):  # pragma: no cover - noop
        return None


class _DummyTracer:
    def start_as_current_span(self, *_, **__):  # pragma: no cover - noop
        return _DummySpan()


trace_module = types.ModuleType("opentelemetry.trace")
trace_module.get_tracer = lambda *_: _DummyTracer()
trace_module.get_current_span = lambda *_: _DummySpan()
trace_module.set_span_in_context = lambda span: None
trace_module.Link = lambda ctx: None

class _SpanKind:  # pragma: no cover - simple constant holder
    INTERNAL = "INTERNAL"


trace_module.SpanKind = _SpanKind

propagate_module = types.ModuleType("opentelemetry.propagate")
propagate_module.inject = lambda carrier: carrier
propagate_module.extract = lambda carrier: carrier

opentelemetry_module = types.ModuleType("opentelemetry")
opentelemetry_module.trace = trace_module
opentelemetry_module.propagate = propagate_module

sys.modules.setdefault("opentelemetry", opentelemetry_module)
sys.modules.setdefault("opentelemetry.trace", trace_module)
sys.modules.setdefault("opentelemetry.propagate", propagate_module)

exporter_module = types.ModuleType("opentelemetry.exporter")
otlp_module = types.ModuleType("opentelemetry.exporter.otlp")
proto_module = types.ModuleType("opentelemetry.exporter.otlp.proto")
grpc_module = types.ModuleType("opentelemetry.exporter.otlp.proto.grpc")
trace_exporter_module = types.ModuleType("opentelemetry.exporter.otlp.proto.grpc.trace_exporter")


class _DummyExporter:  # pragma: no cover - import stub
    def __init__(self, *_, **__):
        pass


trace_exporter_module.OTLPSpanExporter = _DummyExporter

sys.modules.setdefault("opentelemetry.exporter", exporter_module)
sys.modules.setdefault("opentelemetry.exporter.otlp", otlp_module)
sys.modules.setdefault("opentelemetry.exporter.otlp.proto", proto_module)
sys.modules.setdefault("opentelemetry.exporter.otlp.proto.grpc", grpc_module)
sys.modules.setdefault("opentelemetry.exporter.otlp.proto.grpc.trace_exporter", trace_exporter_module)

sdk_resources = types.ModuleType("opentelemetry.sdk.resources")
sdk_resources.SERVICE_NAME = "service.name"


class _DummyResource:  # pragma: no cover - import stub
    @staticmethod
    def create(attrs):
        return attrs


sdk_resources.Resource = _DummyResource
sys.modules.setdefault("opentelemetry.sdk.resources", sdk_resources)

sdk_trace = types.ModuleType("opentelemetry.sdk.trace")


class _DummyTracerProvider:  # pragma: no cover - import stub
    def __init__(self, *_, **__):
        pass

    def add_span_processor(self, *_):
        return None


sdk_trace.TracerProvider = _DummyTracerProvider
sys.modules.setdefault("opentelemetry.sdk.trace", sdk_trace)

sdk_trace_export = types.ModuleType("opentelemetry.sdk.trace.export")


class _DummyBatchSpanProcessor:  # pragma: no cover - import stub
    def __init__(self, *_, **__):
        pass


sdk_trace_export.BatchSpanProcessor = _DummyBatchSpanProcessor
sys.modules.setdefault("opentelemetry.sdk.trace.export", sdk_trace_export)

instrumentation_modules = {
    "opentelemetry.instrumentation.asyncio": "AsyncioInstrumentor",
    "opentelemetry.instrumentation.redis": "RedisInstrumentor",
    "opentelemetry.instrumentation.botocore": "BotocoreInstrumentor",
    "opentelemetry.instrumentation.httpx": "HTTPXClientInstrumentor",
    "opentelemetry.instrumentation.aiohttp_client": "AioHttpClientInstrumentor",
}


class _DummyInstrumentor:  # pragma: no cover - import stub
    def instrument(self, *_, **__):
        return None

    def uninstrument(self, *_, **__):
        return None


for module_name, class_name in instrumentation_modules.items():
    mod = types.ModuleType(module_name)
    setattr(mod, class_name, _DummyInstrumentor)
    sys.modules.setdefault(module_name, mod)

# Stub response schema to avoid pydantic import-time validation in tests
response_schema_module = types.ModuleType("src.backend.core.toron.engine_v2.api.response_schema")


class _DummyResponseSchema:  # pragma: no cover - simple placeholder
    pass


response_schema_module.ToronResponseSchema = _DummyResponseSchema
sys.modules.setdefault("src.backend.core.toron.engine_v2.api.response_schema", response_schema_module)

from src.backend.core.toron.engine_v2.core.evidence_scrubber import EvidenceScrubber
from src.backend.core.toron.engine_v2.core.evidence_injector import EvidenceInjector
from src.backend.core.toron.engine_v2.core.search_connector import (
    SearchConnector,
    SearchError,
    SearchResult,
)
from src.backend.core.toron.engine_v2.api.toron_engine import ToronEngine
from src.backend.core.toron.engine_v2.bootstrap.env_config import EngineConfig


class DummyResponse:
    def __init__(self, status_code: int, payload: Dict[str, Any]):
        self.status_code = status_code
        self._payload = payload

    def json(self) -> Dict[str, Any]:
        return self._payload


def test_evidence_scrubber_extracts_and_dedupes():
    scrubber = EvidenceScrubber(max_claims=3)
    outputs = [
        "The Eiffel Tower is located in Paris. The Eiffel Tower is located in Paris.",
        "- Tesla was founded in 2003 and is headquartered in Austin, Texas.",
        "Prices increased by 5% last quarter according to reports.",
        None,
    ]

    claims = scrubber.extract_claims(outputs)
    assert len(claims) == 3
    assert any("Eiffel Tower" in c for c in claims)
    assert any("Tesla was founded" in c for c in claims)
    assert any("Prices increased" in c for c in claims)


def test_evidence_scrubber_handles_empty_inputs():
    scrubber = EvidenceScrubber()
    claims = scrubber.extract_claims(["", None, "Short."])
    assert claims == []


def test_search_connector_success(monkeypatch):
    connector = SearchConnector(api_key="dummy")

    def fake_post(url, json, timeout):  # type: ignore[override]
        assert "query" in json
        return DummyResponse(
            200,
            {
                "results": [
                    {"content": "Result content", "url": "https://example.com", "score": 0.9}
                ]
            },
        )

    monkeypatch.setattr("requests.post", fake_post)

    result = connector.search_claim("Test claim")
    assert isinstance(result, SearchResult)
    assert result.url == "https://example.com"
    assert "Result content" in result.content


def test_search_connector_rate_limit(monkeypatch):
    connector = SearchConnector(api_key="dummy")

    def fake_post(url, json, timeout):  # type: ignore[override]
        return DummyResponse(429, {"results": []})

    monkeypatch.setattr("requests.post", fake_post)

    with pytest.raises(SearchError):
        connector.search_claim("Test claim")


def test_evidence_injector_handles_failures():
    injector = EvidenceInjector()

    def failing_search(_: str) -> SearchResult:
        raise SearchError("boom")

    claims = ["Alpha beta is true", "Alpha beta is true"]
    results = injector.verify_claims(claims, failing_search)
    assert len(results) == 1
    assert results[0]["verified"] is False
    assert "boom" in results[0]["error"]


def test_run_with_verification_pipeline(monkeypatch):
    engine = ToronEngine.__new__(ToronEngine)
    engine.config = EngineConfig()
    engine.config.max_parallel_models = 2
    engine.config.enterprise_model_list = ["model-a", "model-b"]

    class DummyDebate:
        async def run(self, context):  # type: ignore[override]
            assert context["prompt"] == "What is the capital of France?"
            return {
                "model_outputs": {
                    "model-a": "Paris is the capital of France.",
                    "model-b": "France's capital city is Paris, population over 2 million.",
                }
            }

    class DummyConsensus:
        async def integrate(self, context):  # type: ignore[override]
            return {"final_answer": "Paris", "confidence": context["validation"]["confidence"]}

    engine.debate_engine = DummyDebate()
    engine.evidence_scrubber = EvidenceScrubber()
    engine.search_connector = SearchConnector(api_key="dummy")
    engine.evidence_injector = EvidenceInjector()
    engine.consensus = DummyConsensus()

    def fake_post(url, json, timeout):  # type: ignore[override]
        return DummyResponse(
            200,
            {"results": [{"content": "Paris is the capital of France", "url": "https://example.com"}]},
        )

    monkeypatch.setattr("requests.post", fake_post)

    result = asyncio.run(engine.run_with_verification("What is the capital of France?"))
    assert result["status"] == "ok"
    assert result["claims"]
    assert result["evidence"]
    assert result["consensus"]["final_answer"] == "Paris"
    assert result["validation"]["confidence"] > 0
