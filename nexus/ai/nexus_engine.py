"""Lightweight Nexus AI engine with verification pipeline."""

from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Any, Dict, List, Tuple

from .evidence_injector import EvidenceInjector
from .evidence_scrubber import EvidenceScrubber
from .search_connector import SearchConnector
from .timeout_manager import MODEL_TIMEOUT, apply_timeout
from .toron_logger import get_logger, log_event

ENGINE_SCHEMA_VERSION = "2.0"

logger = get_logger("nexus.engine")


@dataclass
class ModelResponse:
    model: str
    output: str
    latency: float


class Engine:
    """Simple multi-model debate runner with verification hooks."""

    def __init__(self, models: List[str] | None = None, sim_mode: bool = False) -> None:
        self.models = models or ["gpt-alpha", "gpt-beta", "gpt-gamma"]
        self.schema_version = ENGINE_SCHEMA_VERSION
        self.search_connector = SearchConnector(sim_mode=sim_mode)
        self.scrubber = EvidenceScrubber()
        self.injector = EvidenceInjector(self.search_connector)
        self.sim_mode = sim_mode

    @apply_timeout(MODEL_TIMEOUT)
    def _run_debate(self, prompt: str) -> List[ModelResponse]:
        responses: List[ModelResponse] = []
        for model in self.models:
            start = time.perf_counter()
            # Deterministic pseudo-output for simulation
            output = f"[{model}] asserts that {prompt.strip()} is addressed with evidence."
            latency = time.perf_counter() - start
            responses.append(ModelResponse(model=model, output=output, latency=latency))
        return responses

    def _rank(self, responses: List[ModelResponse]) -> Tuple[str, float]:
        if not responses:
            return "", 0.0
        best = max(responses, key=lambda r: len(r.output))
        return best.output, best.latency

    def _scrub_claims(self, responses: List[ModelResponse]) -> List[str]:
        combined = " ".join(r.output for r in responses)
        return self.scrubber.extract(combined)

    @apply_timeout(MODEL_TIMEOUT)
    def _verify(self, claims: List[str]) -> List[Dict[str, Any]]:
        return self.injector.verify_claims(claims)

    def run_with_verification(self, prompt: str) -> Dict[str, Any]:
        """Execute debate, extract claims, and verify them safely."""

        log_event(logger, "engine.start", prompt=prompt)
        result: Dict[str, Any] = {
            "prompt": prompt,
            "schema_version": self.schema_version,
            "model_outputs": [],
            "claims": [],
            "verified_claims": [],
            "metrics": {},
            "errors": [],
        }
        try:
            responses = self._run_debate(prompt)
            result["model_outputs"] = [r.__dict__ for r in responses]
            consensus, latency = self._rank(responses)
            result["consensus"] = consensus
            result.setdefault("metrics", {})["avg_model_latency"] = (
                sum(r.latency for r in responses) / len(responses) if responses else 0.0
            )
            claims = self._scrub_claims(responses)
            result["claims"] = claims
            verified = self._verify(claims)
            result["verified_claims"] = verified
            search_latencies = [v.get("latency", 0.0) for v in verified] or [0.0]
            result["metrics"].update(
                {
                    "avg_search_latency": sum(search_latencies) / len(search_latencies),
                    "verification_hits": sum(1 for v in verified if v.get("verified")),
                }
            )
        except TimeoutError as exc:
            log_event(logger, "engine.timeout", error=str(exc))
            result["errors"].append(str(exc))
        except Exception as exc:  # pragma: no cover - safety net
            log_event(logger, "engine.error", error=str(exc))
            result["errors"].append(str(exc))
        log_event(logger, "engine.done", errors=len(result.get("errors", [])))
        return result


__all__ = ["Engine", "ENGINE_SCHEMA_VERSION"]
