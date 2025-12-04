from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from typing import Callable, List

import pytest


@dataclass
class DebateRound:
    model: str
    prompt: str
    response: str | None = None
    critique: str | None = None


@dataclass
class DebateEngine:
    responder: Callable[[str, str], asyncio.Future]
    critic: Callable[[str, str], asyncio.Future]
    history: List[DebateRound] = field(default_factory=list)

    async def run(self, prompt: str, model_a: str, model_b: str) -> list[DebateRound]:
        first_round = DebateRound(model=model_a, prompt=prompt)
        second_round = DebateRound(model=model_b, prompt=prompt)

        try:
            first_round.response = await self.responder(model_a, prompt)
        except Exception as exc:  # pragma: no cover - isolation safety
            first_round.response = f"error: {exc}"

        first_round.critique = await self.critic(model_b, first_round.response or "")
        self.history.append(first_round)

        try:
            second_round.response = await self.responder(model_b, prompt + "\n" + (first_round.critique or ""))
        except Exception as exc:  # pragma: no cover - isolation safety
            second_round.response = f"error: {exc}"

        second_round.critique = await self.critic(model_a, second_round.response or "")
        self.history.append(second_round)
        return self.history


@pytest.mark.asyncio
async def test_two_round_flow_and_capture():
    async def responder(model: str, content: str) -> str:
        await asyncio.sleep(0)
        return f"{model}:{content[:5]}"

    async def critic(model: str, content: str) -> str:
        return f"critique-{model}-{len(content)}"

    engine = DebateEngine(responder=responder, critic=critic)
    history = await engine.run("prompt", "gpt", "claude")

    assert len(history) == 2
    assert history[0].response.startswith("gpt:")
    assert history[1].critique.startswith("critique-gpt-")


@pytest.mark.asyncio
async def test_provider_failure_isolation():
    async def responder(model: str, content: str) -> str:
        if model == "gpt":
            raise RuntimeError("boom")
        return f"ok-{model}-{content}"

    async def critic(model: str, content: str) -> str:
        return f"critique-{model}-{content}"

    engine = DebateEngine(responder=responder, critic=critic)
    history = await engine.run("topic", "gpt", "claude")

    assert history[0].response.startswith("error: boom")
    assert "claude" in history[1].response


@pytest.mark.asyncio
async def test_model_output_capture_and_critiques():
    async def responder(model: str, content: str) -> str:
        return f"resp-{model}-{content}"

    async def critic(model: str, content: str) -> str:
        await asyncio.sleep(0)
        return f"critique-{model}-{len(content)}"

    engine = DebateEngine(responder=responder, critic=critic)
    history = await engine.run("summarize", "a", "b")

    assert all(round.response for round in history)
    assert all(round.critique for round in history)
    assert history[0].critique.endswith(str(len(history[0].response)))
