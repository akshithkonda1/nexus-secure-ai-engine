"""
Lightweight Toron engine wiring for the Ryuzen backend.

This module keeps the runtime importable even when optional dependencies
(such as trust and compliance layers) are unavailable. It integrates the
existing Toron fusion pipeline, optional hallucination validation, and
response lineage tracking while providing a fully simulated execution path
for local testing.
"""
from __future__ import annotations
from ryuzen.engine.simulation_mode import SimulationMode
from ryuzen.engine.mock_provider import MockProvider
from ryuzen.trust.mock_trust_layer import MockTrustLayer
from ryuzen.trust.mock_lineage import MockLineage
from ryuzen.enterprise.compliance.mock_compliance import MockCompliance
from ryuzen.engine.debate_engine import DebateEngine
from ryuzen.engine.consensus import ConsensusIntegrator
from ryuzen.engine.fusion_utils import FusionUtils

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

_hallucination_guard_spec = importlib.util.find_spec("ryuzen.trust.hallucination_guard")
HallucinationGuard = None
if _hallucination_guard_spec:
    HallucinationGuard = importlib.import_module("ryuzen.trust.hallucination_guard").HallucinationGuard

_response_lineage_spec = importlib.util.find_spec("ryuzen.trust.response_lineage")
ResponseLineage = None
if _response_lineage_spec:
    ResponseLineage = importlib.import_module("ryuzen.trust.response_lineage").ResponseLineage


class ToronEngine:
    """Adapter that wires Toron processing with optional trust signals."""

    def __init__(
        self,
        enable_trust: bool = True,
        trust_layer: Optional[Any] = None,
        lineage_tracker: Optional[Any] = None,
        compliance_suite: Optional[Any] = None,
    ):
        # --- FIRST: CHECK SIMULATION MODE BEFORE ANYTHING ELSE ---
        from ryuzen.engine.simulation_mode import SimulationMode

        self.providers: List[Any] = []
        self.guard = None
        self.lineage = None
        self.compliance = None
        self.consensus = ConsensusIntegrator()
        self.utils = FusionUtils()
        self.debate_engine: Optional[DebateEngine] = None

        if SimulationMode.is_enabled():
            # Load mock providers & mock trust/lineage/compliance
            self.load_simulation_providers()
        else:
            # Production fallback setup (legacy Toron v1.0 logic)
            self.guard = trust_layer or (HallucinationGuard() if enable_trust else None)
            self.lineage = lineage_tracker or (ResponseLineage() if ResponseLineage else None)
            self.compliance = compliance_suite

        # Legacy ask_toron loading remains as fallback
        # Simulation bypasses this entirely
    async def run(self, message: str, memory: Optional[Iterable[Any]] = None) -> Dict[str, Any]:
        """Internal fallback when simulation is OFF."""
        global ask_toron

        if SimulationMode.is_enabled():
            # NEVER run the legacy run() logic in simulation mode
            return await self.generate(message, memory)

        if ask_toron is None and _ask_toron_path.exists() and os.getenv("RYUZEN_USE_TORON_PIPELINE"):
            spec = importlib.util.spec_from_file_location("ryuzen._ask_toron", _ask_toron_path)
            if spec and spec.loader:
                module = importlib.util.module_from_spec(spec)
                try:
                    spec.loader.exec_module(module)
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
            try:
                if callable(getattr(self.guard, "evaluate", None)):
                    validation = self.guard.evaluate([reply])
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

    # ---------------- SIMULATION SYSTEM ------------------

    def load_simulation_providers(self) -> None:
        """Register seven simulated providers for Toron."""
        from ryuzen.engine.mock_provider import MockProvider
        from ryuzen.trust.mock_trust_layer import MockTrustLayer
        from ryuzen.trust.mock_lineage import MockLineage
        from ryuzen.enterprise.compliance.mock_compliance import MockCompliance

        self.providers = [
            MockProvider(
                "Anthropic-Opus", style="harmonious", signature="contextual-humane", latency_ms=420, jitter_ms=60, error_rate=0.02
            ),
            MockProvider(
                "ChatGPT-5.1", style="balanced", signature="concise-adaptive", latency_ms=300, jitter_ms=45, error_rate=0.015
            ),
            MockProvider(
                "Perplexity-Sonar", style="search", signature="retrieval-forward", latency_ms=250, jitter_ms=40, error_rate=0.01
            ),
            MockProvider(
                "Gemini-3", style="creative", signature="imaginative-flow", latency_ms=350, jitter_ms=55, error_rate=0.018
            ),
            MockProvider(
                "Mistral-Large", style="precise", signature="deterministic-trace", latency_ms=280, jitter_ms=35, error_rate=0.012
            ),
            MockProvider(
                "DeepSeek-R1", style="reasoning", signature="chain-of-thought", latency_ms=500, jitter_ms=75, error_rate=0.025
            ),
            MockProvider(
                "Meta-Llama-3", style="technical", signature="systems-rigor", latency_ms=320, jitter_ms=50, error_rate=0.017
            ),
        ]

        # install mock guard, lineage, compliance
        self.guard = MockTrustLayer()
        self.lineage = MockLineage()
        self.compliance = MockCompliance()
        self.debate_engine = DebateEngine(self.providers, rounds=2)

    async def simulate_debate(self, prompt: str) -> Dict[str, Any]:
        """Run the debate engine and annotate responses with reliability metrics."""
        if not self.debate_engine:
            self.debate_engine = DebateEngine(self.providers, rounds=2)

        debate_result = await self.debate_engine.run(prompt)
        responses: List[Dict[str, Any]] = []

        for response in debate_result.get("responses", []):
            if not isinstance(response, dict):
                continue

            if response.get("error"):
                response.setdefault("confidence", 0.0)
                response.setdefault("output", "")

            tfidf_alignment = self.utils.tfidf_score(prompt, response.get("output", ""))
            hallucination = self.utils.hallucination_score(response.get("output", ""), prompt)
            reliability = self.utils.update_reliability(
                response.get("confidence", 0.5), tfidf_alignment, hallucination
            )

            response.update(
                {
                    "tfidf_alignment": tfidf_alignment,
                    "hallucination_risk": hallucination,
                    "reliability": reliability,
                }
            )

            responses.append(response)

        return {"responses": responses}

    async def generate(self, prompt: str, memory: Optional[Iterable[Any]] = None) -> Dict[str, Any]:
        """Simulation-first generate path."""
        if SimulationMode.is_enabled() and self.providers:
            debate_result = await self.simulate_debate(prompt)
            final = self.consensus.integrate(debate_result["responses"])

            disagreement = self.utils.disagreement_vector(
                [r.get("output", "") for r in debate_result["responses"] if r.get("output")]
            )

            if disagreement > 0.75:
                final["representative_output"] = "Consensus unstable — models disagree strongly."

            validation = None
            if self.guard and final:
                validation_fn = getattr(self.guard, "evaluate", None)
                if callable(validation_fn):
                    validation = validation_fn(final.get("representative_output", ""))

            compliance_results = {}
            for check in ("hipaa", "pii", "govcloud"):
                fn = getattr(self.compliance, check, None)
                if callable(fn):
                    compliance_results[check] = fn(final.get("representative_output", ""))

            lineage_block = None
            if self.lineage and debate_result["responses"]:
                lineage_fn = getattr(self.lineage, "generate", None)
                if callable(lineage_fn):
                    lineage_block = lineage_fn(prompt, debate_result["responses"])

            return {
                "prompt": prompt,
                "responses": debate_result["responses"],
                "consensus": final,
                "response": final.get("representative_output") if final else None,
                "validation": validation,
                "lineage": lineage_block,
                "compliance": compliance_results,
                "agreement_count": final.get("agreement_count", 0) if final else 0,
                "workspace_payload": {
                    "consensus": final,
                    "raw_models": debate_result["responses"],
                    "stability": 1 - disagreement,
                    "risk": disagreement,
                },
            }

        # fallback to production engine (run)
        return await self.run(prompt, memory)

    def generate_sync(self, prompt: str, memory: Optional[Iterable[Any]] = None) -> Dict[str, Any]:
        """Synchronous helper for environments without explicit event loop control."""
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            return asyncio.run(self.generate(prompt, memory))
        raise RuntimeError("generate_sync cannot be called from a running event loop")

_ask_toron_path = SRC_PATH / "backend" / "toron" / "askToron.py"
ask_toron = None

logger = logging.getLogger(__name__)


@dataclass
class ToronRequest:
    message: str


