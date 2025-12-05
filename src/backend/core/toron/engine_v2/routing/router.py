"""High-level routing orchestrator for Toron Engine v2."""

from __future__ import annotations

import time
from typing import Any, Dict, List, Optional

from ..performance.cache.multi_layer_cache import MultiLayerCache
from ..tracing.trace_context import TraceContext
from ..tracing.tracer import ToronTracer
from .fast_path import FastPathExecutor
from .query_optimizer import QueryOptimizer


class Router:
    def __init__(
        self,
        cache: MultiLayerCache,
        tracer: ToronTracer,
        query_optimizer: QueryOptimizer,
        debate_engine,
        consensus_integrator,
        provider_adapter,
        fast_path_executor: Optional[FastPathExecutor] = None,
    ):
        self.cache = cache
        self.tracer = tracer
        self.query_optimizer = query_optimizer
        self.debate_engine = debate_engine
        self.consensus_integrator = consensus_integrator
        self.provider_adapter = provider_adapter
        self.fast_path_executor = fast_path_executor or FastPathExecutor()
        self._cached_models: List[str] | None = None

    async def resolve(self, request_dict: Dict[str, Any], context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        context = context or {}
        start = time.time()
        prompt = request_dict.get("prompt", "")

        with self.tracer.span("toron.router", attributes={"session_id": context.get("session_id")}) as span:
            classification = self.query_optimizer.classify(request_dict)
            context.update(classification)
            span.set_attribute("intent", classification["intent"])
            span.set_attribute("complexity", classification["complexity"])

            fast_path_result = await self.fast_path_executor.try_fast_path(prompt)
            if fast_path_result:
                TraceContext.annotate_request(span, model_used="fast-path", cache_hit=False, latency_ms=(time.time() - start) * 1000)
                return fast_path_result

            cached = await self.cache.get(request_dict)
            if cached:
                TraceContext.annotate_request(span, model_used=cached.get("model_used"), cache_hit=True, latency_ms=(time.time() - start) * 1000)
                return cached

            models = await self._select_models(request_dict)
            context["selected_models"] = models
            span.set_attribute("models", ",".join(models))

            debate_context = {
                "selected_models": models,
                "prompt": prompt,
                "messages": request_dict.get("messages"),
            }

            debate_result = await self.debate_engine.run(debate_context)
            context["debate_result"] = debate_result

            consensus_result = await self.consensus_integrator.integrate({"debate_result": debate_result, "validation": {}})
            TraceContext.annotate_request(span, model_used=consensus_result.get("model_used"), cache_hit=False, latency_ms=(time.time() - start) * 1000)

            ttl = request_dict.get("ttl", 3600)
            await self.cache.set(request_dict, consensus_result, ttl=ttl)
            return consensus_result

    async def _select_models(self, request_dict: Dict[str, Any]) -> List[str]:
        if self._cached_models is None:
            try:
                self._cached_models = await self.provider_adapter.list_all_models()
            except Exception:
                self._cached_models = list(self.provider_adapter.connectors.keys())
        return self.query_optimizer.select_models(request_dict, self._cached_models)
