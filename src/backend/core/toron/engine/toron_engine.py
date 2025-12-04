"""Primary Toron Engine implementation."""
from __future__ import annotations

import asyncio
import hashlib
import logging
import time
from datetime import datetime
from time import perf_counter
from typing import Any, Dict, Generator, Iterable, List
from uuid import uuid4

from src.backend.core.toron.engine.cache_layer import CacheLayer
from src.backend.core.toron.engine.consensus_integrator import ToronConsensus, integrate_consensus
from src.backend.core.toron.engine.debate_engine import DebateEngine
from src.backend.core.toron.engine.fact_extractor import extract_facts
from src.backend.core.toron.engine.model_router import ModelRouter
from src.backend.core.toron.engine.orchestrator import Orchestrator
from src.backend.core.toron.engine.telemetry_sanitizer import (
    TelemetryRecord,
    build_telemetry_record,
    sanitize_telemetry,
)
from src.backend.core.toron.engine.web_scraper import scrape_pages
from src.backend.core.toron.engine.web_search import perform_web_search
from src.backend.core.toron.engine.web_validator import ValidationResult, validate_facts
from src.backend.core.toron.decision_blocks import DecisionBlock, DecisionStep
from src.backend.core.toron.micro_agent_router import run_plan
from src.backend.rate_limit.concurrency_gate import ConcurrencyGate
from src.backend.rate_limit.global_rate_limiter import GlobalRateLimiter
from src.backend.rate_limit.user_rate_limiter import UserRateLimiter


class ToronEngine:
    """Production-safe orchestration layer for Toron."""

    def __init__(
        self,
        router: ModelRouter,
        orchestrator: Orchestrator,
        debate_engine: DebateEngine,
        global_rate_limiter: GlobalRateLimiter,
        user_rate_limiter: UserRateLimiter,
        concurrency_gate: ConcurrencyGate,
        cache_layer: CacheLayer | None = None,
    ) -> None:
        self.router = router
        self.orchestrator = orchestrator
        self.debate_engine = debate_engine
        self.global_rate_limiter = global_rate_limiter
        self.user_rate_limiter = user_rate_limiter
        self.concurrency_gate = concurrency_gate
        self.cache_layer = cache_layer or CacheLayer.from_environment()
        self._logger = logging.getLogger(__name__)
        self._model_reliability: Dict[str, float] = {}

    def process(
        self, prompt: str, user_id: str | None = None, context: Dict[str, str] | None = None, stream: bool = False
    ) -> str | Iterable[str]:
        """Run the full orchestration pipeline."""

        self.global_rate_limiter.check()
        self.user_rate_limiter.check(user_id or "anonymous")

        with self.concurrency_gate.track():
            plan = self.orchestrator.plan(prompt, context)
            model = self.router.select_model(plan)
            transcript = self.debate_engine.run_debate(prompt, model, context)
            result = self.orchestrator.finalize_response(prompt, model, transcript)

        if stream:
            return self._stream_response(result)
        return result

    async def process_with_validation(
        self, prompt: str, user_id: str | None = None, context: Dict[str, str] | None = None
    ) -> ToronConsensus:
        """Run the extended orchestration pipeline with web validation and consensus."""

        sanitized_prompt = self._normalize_prompt(prompt)
        context_hash = self._context_hash(context)
        cache_key = CacheLayer.build_key(sanitized_prompt, context_hash)

        cached = await self.cache_layer.get_cached_result(cache_key)
        if cached:
            return cached

        self.global_rate_limiter.check()
        self.user_rate_limiter.check(user_id or "anonymous")

        start = perf_counter()
        with self.concurrency_gate.track():
            model_outputs = await self._run_parallel_models(sanitized_prompt, context or {})
            facts = extract_facts(model_outputs)

            search_results = await perform_web_search(sanitized_prompt)
            urls = [doc.url for doc in search_results[:3]]
            scraped_pages = await scrape_pages(urls)
            validation = validate_facts(facts, scraped_pages)
            consensus = integrate_consensus(model_outputs, validation, self._model_reliability)

        latency = perf_counter() - start
        telemetry = self._build_telemetry(consensus, validation, latency, prompt_type=context.get("mode") if context else "chat")
        self._record_telemetry(telemetry)

        await self.cache_layer.set_cached_result(cache_key, consensus)
        return consensus

    def stream_tokens(self, text: str) -> Generator[str, None, None]:
        """Yield tokens for SSE/WebSocket streaming."""

        for chunk in text.split():
            time.sleep(0.01)
            yield chunk

    def _stream_response(self, text: str) -> Generator[str, None, None]:
        for token in self.stream_tokens(text):
            yield token

    async def _run_parallel_models(self, prompt: str, context: Dict[str, str]) -> Dict[str, str]:
        models = self.router.get_models()
        if not models:
            return {}

        expanded_models: List[Dict[str, str]] = (models * ((10 + len(models) - 1) // len(models)))[:10]

        async def run_single(model: Dict[str, str]) -> str:
            try:
                transcript = await asyncio.wait_for(
                    asyncio.to_thread(self.debate_engine.run_debate, prompt, model, context), timeout=0.35
                )
                summary = await asyncio.wait_for(
                    asyncio.to_thread(self.orchestrator.finalize_response, prompt, model, transcript), timeout=0.35
                )
                return summary
            except Exception:
                return f"{model.get('name', 'model')}: unavailable"

        tasks = [run_single(model) for model in expanded_models]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        outputs: Dict[str, str] = {}
        for model, result in zip(expanded_models, results):
            name = model.get("name", f"model-{len(outputs)}")
            if isinstance(result, Exception):
                outputs[name] = f"{name}: error"
            else:
                outputs[name] = str(result)
            self._model_reliability[name] = min(1.0, self._model_reliability.get(name, 0.6) + 0.01)
        return outputs

    def _context_hash(self, context: Dict[str, str] | None) -> str:
        if not context:
            return "none"
        serialized = "|".join(f"{key}:{context[key]}" for key in sorted(context.keys()))
        return hashlib.sha256(serialized.encode()).hexdigest()

    def _normalize_prompt(self, prompt: str) -> str:
        return " ".join(prompt.split()).strip()

    def _build_telemetry(
        self, consensus: ToronConsensus, validation: ValidationResult, latency: float, prompt_type: str | None = None
    ) -> TelemetryRecord:
        contradiction_rate = len(validation.contradicted) / max(
            len(validation.supported) + len(validation.contradicted) + len(validation.unknown), 1
        )
        drift = 1.0 - consensus.model_consensus_score if consensus.model_consensus_score < 1 else 0.0
        return build_telemetry_record(
            prompt_type=prompt_type or "chat",
            drift=drift,
            contradiction_rate=contradiction_rate,
            validation_confidence=validation.confidence,
        )

    def _record_telemetry(self, telemetry: TelemetryRecord) -> None:
        try:
            sanitized = sanitize_telemetry({"prompt_type": telemetry.prompt_type})
            self._logger.info(
                "toron.telemetry", extra={"telemetry": telemetry.model_dump(), "safe_fields": sanitized}
            )
        except Exception:
            self._logger.debug("telemetry logging skipped")

    def warmup(self) -> None:
        """Warm-up hook for infrastructure readiness probes."""

        self.global_rate_limiter.reset()
        self.user_rate_limiter.reset()

    def generate_web_access_plan(self, url: str, reason: str) -> Dict[str, object]:
        """Produce a reversible DecisionBlock for sandboxed web extraction."""

        return {
            "plan_name": "Extract Web Data",
            "steps": [
                {"action": "web_fetch", "params": {"url": url}},
                {"action": "web_extract", "params": {}},
            ],
            "reversible": True,
            "risk": "Low",
            "reason": reason,
        }

    def reflect_web_data(self, block: Dict[str, object], extracted_json: Dict[str, object]) -> Dict[str, object]:
        """Reflect on extraction results versus planned actions."""

        headings = extracted_json.get("headings", []) if isinstance(extracted_json, dict) else []
        paragraphs = extracted_json.get("paragraphs", []) if isinstance(extracted_json, dict) else []
        tables = extracted_json.get("tables", []) if isinstance(extracted_json, dict) else []
        links = extracted_json.get("links", []) if isinstance(extracted_json, dict) else []

        summary = {
            "summary": f"Captured {len(headings)} headings, {len(paragraphs)} paragraphs, {len(tables)} tables, and {len(links)} links.",
            "plan_reference": block,
            "accuracy_boost": "context_enriched" if paragraphs else "neutral",
        }

        return summary
