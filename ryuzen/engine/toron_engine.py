"""
Lightweight Toron engine wiring for the Ryuzen backend.

This module keeps the runtime importable even when optional dependencies
(such as trust and compliance layers) are unavailable. It integrates the
existing Toron fusion pipeline, optional hallucination validation, and
response lineage tracking while providing a fully simulated execution path
for local testing.
"""
from __future__ import annotations

import asyncio
import importlib
import logging
import os
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional

SRC_PATH = Path(__file__).resolve().parents[2] / "src"
if str(SRC_PATH) not in sys.path:
    sys.path.append(str(SRC_PATH))

try:
    from ryuzen.engine.mock_provider import MockModelProvider
    from ryuzen.engine.simulation_mode import SimulationMode
except Exception:  # pragma: no cover - fallback for environments without src path
    MockModelProvider = None
    SimulationMode = None

_hallucination_guard_spec = importlib.util.find_spec("ryuzen.trust.hallucination_guard")
HallucinationGuard = None
if _hallucination_guard_spec:
    HallucinationGuard = importlib.import_module("ryuzen.trust.hallucination_guard").HallucinationGuard

_response_lineage_spec = importlib.util.find_spec("ryuzen.trust.response_lineage")
ResponseLineage = None
if _response_lineage_spec:
    ResponseLineage = importlib.import_module("ryuzen.trust.response_lineage").ResponseLineage

_ask_toron_path = SRC_PATH / "backend" / "toron" / "askToron.py"
ask_toron = None

logger = logging.getLogger(__name__)


@dataclass
class ToronRequest:
    message: str


class ToronEngine:
    """Adapter that wires Toron processing with optional trust signals."""

    def __init__(
        self,
        enable_trust: bool = True,
        trust_layer: Optional[Any] = None,
        lineage_tracker: Optional[Any] = None,
        compliance_suite: Optional[Any] = None,
    ):
        self.guard = trust_layer or (HallucinationGuard() if (enable_trust and HallucinationGuard) else None)
        self.lineage = lineage_tracker or (ResponseLineage() if ResponseLineage else None)
        self.compliance = compliance_suite
        self.providers: List[Any] = []

        if SimulationMode and SimulationMode.is_enabled():
            self.load_simulation_providers()

    async def run(self, message: str, memory: Optional[Iterable[Any]] = None) -> Dict[str, Any]:
        global ask_toron

        if ask_toron is None and _ask_toron_path.exists() and os.getenv("RYUZEN_USE_TORON_PIPELINE"):
            spec = importlib.util.spec_from_file_location("ryuzen._ask_toron", _ask_toron_path)
            if spec and spec.loader:
                module = importlib.util.module_from_spec(spec)
                try:
                    spec.loader.exec_module(module)  # type: ignore[arg-type]
                    ask_toron = getattr(module, "ask_toron", None)
                except Exception:
                    logger.exception("Failed to load Toron pipeline; falling back to stub")

        if ask_toron is None:
            logger.warning("Toron pipeline unavailable; returning echo response")
            return {"response": message, "validation": None, "lineage": None}

        req = ToronRequest(message=message)
        reply = await ask_toron(req, memory or [])

        validation = None
        if self.guard:
            evaluate = getattr(self.guard, "evaluate", None)
            validate = getattr(self.guard, "validate", None)
            try:
                if callable(evaluate):
                    validation = evaluate([reply])
                elif callable(validate):
                    validation = validate([reply])
            except Exception:
                logger.exception("Hallucination guard evaluation failed")

        lineage_block = None
        if self.lineage:
            try:
                lineage_block = self.lineage.add_block(
                    prompt=message,
                    model_set=["toron-fusion"],
                    tfidf_metadata={"tokens": len(message)},
                    behavioral_signature="toron",
                    debate_rounds=1,
                )
            except Exception:
                logger.exception("Lineage tracking failed")

        return {"response": reply, "validation": validation, "lineage": lineage_block}

    def load_simulation_providers(self) -> None:
        """Register seven simulated providers for Toron."""
        if not MockModelProvider:
            logger.error("MockModelProvider unavailable; cannot load simulation providers")
            return

        self.providers = [
            MockModelProvider("Anthropic-Opus", style="harmonious", latency_ms=420, jitter_ms=60, error_rate=0.02),
            MockModelProvider("ChatGPT-5.1", style="balanced", latency_ms=300, jitter_ms=45, error_rate=0.015),
            MockModelProvider("Perplexity-Sonar", style="search", latency_ms=250, jitter_ms=40, error_rate=0.01),
            MockModelProvider("Gemini-3", style="creative", latency_ms=350, jitter_ms=55, error_rate=0.018),
            MockModelProvider("Mistral-Large", style="precise", latency_ms=280, jitter_ms=35, error_rate=0.012),
            MockModelProvider("DeepSeek-R1", style="reasoning", latency_ms=500, jitter_ms=75, error_rate=0.025),
            MockModelProvider("Meta-Llama-3", style="technical", latency_ms=320, jitter_ms=50, error_rate=0.017),
        ]

    async def simulate_debate(self, prompt: str) -> Dict[str, Any]:
        """Run all providers in parallel and return consensus."""
        if not self.providers:
            return {"responses": [], "consensus": None}

        tasks = [provider.generate(prompt) for provider in self.providers]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        responses: List[Dict[str, Any]] = []
        for provider, result in zip(self.providers, results):
            if isinstance(result, Exception):
                logger.warning("Provider %s failed during simulation: %s", provider.model_name, result)
                continue
            responses.append(result)

        consensus = None
        if responses:
            consensus = min(responses, key=lambda r: len(str(r.get("output", ""))))

        return {"responses": responses, "consensus": consensus}

    async def generate(self, prompt: str, memory: Optional[Iterable[Any]] = None) -> Dict[str, Any]:
        """Generate a response using simulation providers when enabled."""
        if SimulationMode and SimulationMode.is_enabled() and self.providers:
            debate_result = await self.simulate_debate(prompt)
            final = debate_result.get("consensus")

            validation = None
            if self.guard and final:
                evaluate = getattr(self.guard, "evaluate", None)
                if callable(evaluate):
                    validation = evaluate(final.get("output", ""))

            compliance_results: Dict[str, Any] = {}
            if self.compliance and final:
                for check in ("hipaa", "pii", "govcloud"):
                    fn = getattr(self.compliance, check, None)
                    if callable(fn):
                        compliance_results[check] = bool(fn(final.get("output", "")))

            lineage_block = None
            if self.lineage and debate_result.get("responses"):
                if hasattr(self.lineage, "generate"):
                    lineage_block = self.lineage.generate(prompt, debate_result["responses"])
                elif hasattr(self.lineage, "add_block"):
                    try:
                        lineage_block = self.lineage.add_block(
                            prompt=prompt,
                            model_set=[resp.get("model") for resp in debate_result["responses"]],
                            tfidf_metadata={"tokens": len(prompt)},
                            behavioral_signature="toron",
                            debate_rounds=1,
                        )
                    except Exception:
                        logger.exception("Lineage tracking failed")

            return {
                "prompt": prompt,
                "responses": debate_result["responses"],
                "consensus": final,
                "response": final.get("output") if final else None,
                "validation": validation,
                "lineage": lineage_block,
                "compliance": compliance_results,
            }

        return await self.run(prompt, memory)


def run_sync(message: str, memory: Optional[Iterable[Any]] = None) -> Dict[str, Any]:
    """Synchronous helper for environments without an event loop."""
    import asyncio

    engine = ToronEngine()
    return asyncio.get_event_loop().run_until_complete(engine.run(message, memory))
