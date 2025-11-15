# mypy: ignore-errors

import asyncio
import importlib
import json
import os
import pathlib
import sys
import types

import pytest

os.environ.setdefault("NEXUS_ALLOW_TEST_FALLBACKS", "1")

if "bs4" not in sys.modules:
    bs4_stub = types.ModuleType("bs4")

    class _DummySoup:  # pragma: no cover - simple stub for import
        def __init__(self, *args, **kwargs):
            pass

        def find(self, *args, **kwargs):
            return None

        def find_all(self, *args, **kwargs):
            return []

    bs4_stub.BeautifulSoup = _DummySoup
    sys.modules["bs4"] = bs4_stub

MODULE_PATH = pathlib.Path(__file__).resolve().parents[1] / "nexus" / "ai"
module_dir = str(MODULE_PATH)
if module_dir not in sys.path:
    sys.path.insert(0, module_dir)

ModelConnector = importlib.import_module("nexus.ai.nexus_engine").ModelConnector


@pytest.mark.parametrize(
    "adapter,sample,expected",
    [
        (
            "openai.chat",
            {"choices": [{"message": {"content": "chat-response"}}]},
            "chat-response",
        ),
        (
            "openai.responses",
            {"output_text": "responses-output"},
            "responses-output",
        ),
        (
            "anthropic.messages",
            {"content": [{"text": "anthropic-text"}]},
            "anthropic-text",
        ),
        (
            "gemini.generate",
            {"candidates": [{"content": {"parts": [{"text": "gemini"}]}}]},
            "gemini",
        ),
        (
            "cohere.chat",
            {"text": "cohere-chat"},
            "cohere-chat",
        ),
        (
            "cohere.generate",
            {"generations": [{"text": "cohere-generate"}]},
            "cohere-generate",
        ),
        (
            "tgi.generate",
            {"generated_text": "tgi-output"},
            "tgi-output",
        ),
        (
            "generic.json",
            {"text": "generic-output"},
            "generic-output",
        ),
    ],
)
def test_adapters_handle_sample_payload(monkeypatch, adapter, sample, expected):
    monkeypatch.setenv("NEXUS_ALLOWED_MODEL_DOMAINS", "example.com")
    connector = ModelConnector(name="model", endpoint="https://example.com/api", adapter=adapter)

    async def fake_post(payload, deadline=None):
        return sample

    connector._post = fake_post  # type: ignore[attr-defined]
    text, meta = asyncio.run(connector.infer("prompt"))
    assert text == expected
    assert isinstance(meta, dict)


def test_adapter_fallback_serializes_payload(monkeypatch):
    monkeypatch.setenv("NEXUS_ALLOWED_MODEL_DOMAINS", "example.com")
    connector = ModelConnector(
        name="model", endpoint="https://example.com/api", adapter="openai.chat"
    )

    payloads = []

    async def fake_post(payload, deadline=None):
        payloads.append(json.dumps(payload))
        return {"unexpected": "structure"}

    connector._post = fake_post  # type: ignore[attr-defined]
    text, _ = asyncio.run(connector.infer("prompt"))
    assert "unexpected" in text
    assert payloads, "adapter should serialize payload"
