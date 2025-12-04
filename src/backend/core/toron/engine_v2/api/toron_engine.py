"""
Toron Engine v2.0 — Main Engine Entry Point.
"""

import asyncio
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
from ..core.fact_extractor import FactExtractor
from ..core.web_search import WebSearch
from ..core.web_validator import WebValidator
from ..core.consensus_integrator import ConsensusIntegrator
from ..aloe.lifecycle_manager import LifecycleManager
from ..runtime.cloudwatch_telemetry import CloudWatchTelemetry

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

        # b. run bootstrap
        bootstrap = EngineBootstrap()
        self.providers = bootstrap.initialize()
        self.telemetry = CloudWatchTelemetry()

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
        self.fact_extractor = FactExtractor(self.provider_adapter)
        self.web_search = WebSearch()
        self.validator = WebValidator(self.provider_adapter)
        self.consensus = ConsensusIntegrator()

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
            # Validate request
            request = ToronRequest(**request_dict)

            # Session context
            context = SessionContext(request_dict).as_dict()

            # Policy enforcement
            self.policy.validate(request_dict)

            # Run full ALOE pipeline
            result = await self.lifecycle.run(request_dict, context)

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
