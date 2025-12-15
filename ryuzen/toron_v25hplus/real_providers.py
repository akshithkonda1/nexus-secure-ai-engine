"""Production provider adapters for Toron real-model execution."""

from __future__ import annotations

import os
import time
from dataclasses import dataclass
from typing import Any, Dict, Optional, Protocol


class Provider(Protocol):
    name: str

    def invoke(self, prompt: str) -> "ProviderResponse":
        ...


@dataclass
class ProviderResponse:
    success: bool
    content: Optional[str]
    latency_ms: float
    error: Optional[str]


class _BaseProvider:
    def __init__(self, name: str) -> None:
        self.name = name

    def _time_call(self, func) -> ProviderResponse:
        start = time.monotonic()
        try:
            content = func()
            latency = (time.monotonic() - start) * 1000
            return ProviderResponse(success=True, content=content, latency_ms=latency, error=None)
        except Exception as exc:
            latency = (time.monotonic() - start) * 1000
            return ProviderResponse(success=False, content=None, latency_ms=latency, error=str(exc))


class OpenAIProvider(_BaseProvider):
    def __init__(self, model: str = "gpt-4o-mini") -> None:
        super().__init__(name=f"openai:{model}")
        self.model = model
        self._client = None

    def _load_client(self):
        if self._client is None:
            from openai import OpenAI

            self._client = OpenAI()
        return self._client

    def invoke(self, prompt: str) -> ProviderResponse:
        def _call() -> str:
            client = self._load_client()
            completion = client.chat.completions.create(
                model=self.model, messages=[{"role": "user", "content": prompt}]
            )
            return completion.choices[0].message.content or ""

        return self._time_call(_call)


class AnthropicProvider(_BaseProvider):
    def __init__(self, model: str = "claude-3-opus-20240229") -> None:
        super().__init__(name=f"anthropic:{model}")
        self.model = model
        self._client = None

    def _load_client(self):
        if self._client is None:
            from anthropic import Anthropic

            self._client = Anthropic()
        return self._client

    def invoke(self, prompt: str) -> ProviderResponse:
        def _call() -> str:
            client = self._load_client()
            message = client.messages.create(
                model=self.model,
                max_tokens=256,
                messages=[{"role": "user", "content": prompt}],
            )
            return "".join(block.text for block in message.content if hasattr(block, "text"))

        return self._time_call(_call)


def load_real_providers() -> Dict[str, Provider]:
    providers: Dict[str, Provider] = {}
    if os.getenv("OPENAI_API_KEY"):
        try:
            providers["openai"] = OpenAIProvider()
        except Exception:
            providers["openai"] = OpenAIProvider()  # defer actual failure to invocation time
    if os.getenv("ANTHROPIC_API_KEY"):
        try:
            providers["anthropic"] = AnthropicProvider()
        except Exception:
            providers["anthropic"] = AnthropicProvider()
    return providers

