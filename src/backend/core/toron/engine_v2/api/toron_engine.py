"""
Toron Engine v2.0 — Main Engine Entry Point.
"""

import asyncio
import logging
import time

from ..bootstrap.engine_bootstrap import EngineBootstrap
from ..bootstrap.env_config import EngineConfig
from ..runtime.response_builder import ResponseBuilder
from ..runtime.error_shaper import ErrorShaper
from ..runtime.session_context import SessionContext
from ..runtime.slo_manager import SLOManager
from ..runtime.cost_guardrails import CostGuardrails
from ..runtime.alert_manager import AlertManager
from ..runtime.tracing_manager import TracingManager
from ..runtime.replay_store import ReplayStore
from ..runtime.execution_policy import ExecutionPolicy
from ..core.connectors.connector_factory import ConnectorFactory
from ..core.cloud_provider_adapter import CloudProviderAdapter
from ..core.debate_engine import DebateEngine
from ..core.evidence_scrubber import EvidenceScrubber
from ..core.evidence_injector import EvidenceInjector
from ..core.search_connector import SearchConnector
from ..core.fact_extractor import FactExtractor
from ..core.web_search import WebSearch
from ..core.web_validator import WebValidator
from ..core.consensus_integrator import ConsensusIntegrator
from ..aloe.lifecycle_manager import LifecycleManager
from ..runtime.cloudwatch_telemetry import CloudWatchTelemetry
from ..performance.cache.multi_layer_cache import MultiLayerCache
from ..routing.query_optimizer import QueryOptimizer
from ..routing.router import Router
from ..tracing.tracer import ToronTracer

from .request_schema import ToronRequest
from .response_schema import ToronResponseSchema
from .health_check import HealthCheck


class ToronEngine:
    """
    The heart of Toron — full ALOE pipeline exposed through a clean API.
    """

    def __init__(self, config=None):
        # a. load config
        self.config = config or EngineConfig()

        # initialize attributes
        self.provider_adapter = None
        self.policy = None
        self.health = None
        self.slo = None
        self.cost = None
        self.alerts = None
        self.replay = None
        self.trace = None
        self.cache = None
        self.tracer = None
        self.query_optimizer = None

        # b. run bootstrap
        bootstrap = EngineBootstrap()
        self.providers = bootstrap.initialize()
        self.telemetry = CloudWatchTelemetry()

        self.cache = MultiLayerCache()
        self.tracer = ToronTracer()
        self.query_optimizer = QueryOptimizer()

        # c. discover connectors
        connectors = ConnectorFactory.discover(self.providers)
        if not connectors:
            raise RuntimeError("No model providers available.")

        # d. build provider_adapter
        self.provider_adapter = CloudProviderAdapter(connectors, self.config)

        # e. init runtime systems
        self.slo = SLOManager()
        self.cost = CostGuardrails()
        self.alerts = AlertManager()
        self.replay = ReplayStore()
        self.trace = TracingManager()
        self.health = HealthCheck(self.provider_adapter)

        # f. init core engines
        self.debate_engine = DebateEngine(self.provider_adapter)
        self.evidence_scrubber = EvidenceScrubber()
        self.search_connector = SearchConnector()
        self.evidence_injector = EvidenceInjector()
        self.fact_extractor = FactExtractor(self.provider_adapter)
        self.web_search = WebSearch()
        self.validator = WebValidator(self.provider_adapter)
        self.consensus = ConsensusIntegrator()

        self.router = Router(
            cache=self.cache,
            tracer=self.tracer,
            query_optimizer=self.query_optimizer,
            debate_engine=self.debate_engine,
            consensus_integrator=self.consensus,
            provider_adapter=self.provider_adapter,
        )

        # g. init execution policy
        self.policy = ExecutionPolicy(self.config)

        # h. init ALOE lifecycle
        self.builder = ResponseBuilder()
        self.errors = ErrorShaper()
        self.lifecycle = LifecycleManager(self.config, self.provider_adapter)

    async def process(self, request_dict: dict):
        """
        Main request handler.
        Validates → executes → builds response.
        """

        start = time.time()
        request = None
        try:
            with self.tracer.span("toron.engine.process", {"request_id": request_dict.get("request_id") } ):
                request = ToronRequest(**request_dict)

                context = SessionContext(request_dict).as_dict()

                with self.tracer.span("toron.engine.policy"):
                    self.policy.validate(request_dict)

                with self.tracer.span("toron.router.resolve"):
                    result = await self.router.resolve(request_dict, context)

                latency_ms = (time.time() - start) * 1000
                self.slo.record_latency(latency_ms)

                req_cost = result.get("usage_cost", 0.0)
                self.cost.register_cost(req_cost)

                if result.get("status") == "error":
                    self.slo.record_failure()

                    check = self.slo.check_slo()
                    if not check["slo_pass"]:
                        self.alerts.alert("Toron SLO Violation", check)

                    return self.errors.shape(result)

                self.slo.record_success()

                check = self.slo.check_slo()
                if not check["slo_pass"]:
                    self.alerts.alert("Toron SLO Violation", check)

                resp = self.builder.build(result, context)
                resp["session_id"] = context["session_id"]
                resp["timestamp"] = str(time.time())

                return resp

        except Exception as e:
            self.telemetry.log(
                "ToronEngineError",
                {
                    "error": str(e),
                    "session_id": getattr(request, "session_id", None),
                },
            )
            return self.errors.shape(e)


    def run_sync(self, request):
        return asyncio.run(self.process(request))


    async def health_check(self):
        return await self.provider_adapter.health_check_all()

    async def run_with_verification(self, query: str, models=None) -> dict:
        """Run debate → evidence scrubbing → verification → consensus.

        This method is defensive and attempts to return a structured payload
        even when individual stages fail.
        """

        logger = logging.getLogger(__name__)
        if not query or not str(query).strip():
            return {"status": "error", "message": "Query is empty."}

        selected_models = models or self.config.enterprise_model_list[: self.config.max_parallel_models]
        if not selected_models:
            return {"status": "error", "message": "No models configured."}

        try:
            debate_result = await self.debate_engine.run({
                "selected_models": selected_models,
                "prompt": query,
            })
        except Exception as exc:
            logger.error("Debate stage failed: %s", exc)
            return {"status": "error", "message": "Debate failed", "error": str(exc)}

        model_outputs = list((debate_result.get("model_outputs") or {}).values())
        claims = self.evidence_scrubber.extract_claims(model_outputs)

        try:
            verification_results = self.evidence_injector.verify_claims(
                claims,
                self.search_connector.search_claim,
            )
        except Exception as exc:  # pragma: no cover - defensive
            logger.error("Evidence verification failed: %s", exc)
            verification_results = []

        validation = self._build_validation_summary(verification_results)

        try:
            consensus_result = await self.consensus.integrate({
                "debate_result": debate_result,
                "validation": validation,
            })
        except Exception as exc:  # pragma: no cover - defensive
            logger.error("Consensus stage failed: %s", exc)
            consensus_result = {
                "final_answer": "",
                "confidence": 0.0,
                "error": str(exc),
            }

        return {
            "status": "ok",
            "query": query,
            "models": selected_models,
            "debate_result": debate_result,
            "claims": claims,
            "evidence": verification_results,
            "validation": validation,
            "consensus": consensus_result,
        }

    def _build_validation_summary(self, evidence: list[dict]) -> dict:
        if not evidence:
            return {
                "supported": [],
                "contradicted": [],
                "unknown": [],
                "web_evidence": [],
                "confidence": 0.0,
            }

        supported = [
            {"claim": e.get("claim"), "source_model": "web"}
            for e in evidence if e.get("verified")
        ]
        unknown = [
            {"claim": e.get("claim"), "source_model": "web"}
            for e in evidence if not e.get("verified")
        ]

        verified_ratio = len(supported) / max(len(evidence), 1)
        confidence = round(0.2 + (verified_ratio * 0.8), 4)

        return {
            "supported": supported,
            "contradicted": [],
            "unknown": unknown,
            "web_evidence": evidence,
            "confidence": confidence,
        }
