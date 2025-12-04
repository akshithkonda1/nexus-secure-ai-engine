"""
Toron Engine v2.0 — Main Engine Entry Point.
"""

from ..bootstrap.engine_bootstrap import EngineBootstrap
from ..bootstrap.env_config import EngineConfig
from ..runtime.response_builder import ResponseBuilder
from ..runtime.error_shaper import ErrorShaper
from ..runtime.execution_policy import ExecutionPolicy

from ..aloe.lifecycle_manager import LifecycleManager
from ..core.connectors.connector_factory import ConnectorFactory
from ..core.cloud_provider_adapter import CloudProviderAdapter
from ..core.debate_engine import DebateEngine
from ..core.fact_extractor import FactExtractor
from ..core.web_search import WebSearch
from ..core.web_validator import WebValidator
from ..core.consensus_integrator import ConsensusIntegrator
from ..runtime.cloudwatch_telemetry import CloudWatchTelemetry

from .request_schema import ToronRequest
from .response_schema import ToronResponseSchema
from .health_check import HealthCheck


class ToronEngine:
    """
    The heart of Toron — full ALOE pipeline exposed through a clean API.
    """

    def __init__(self, config=None):
        self.config = config or EngineConfig()

        # Bootstrap cloud providers
        bootstrap = EngineBootstrap()
        self.providers = bootstrap.initialize()
        self.config = bootstrap.config
        self.telemetry = CloudWatchTelemetry()

        connectors = ConnectorFactory.discover(providers)
        if not connectors:
            raise RuntimeError("No model providers available.")

        # Core Engines
        self.debate_engine = DebateEngine(self.provider_adapter)
        self.fact_extractor = FactExtractor(self.provider_adapter)
        self.web_search = WebSearch()
        self.validator = WebValidator(self.provider_adapter)
        self.consensus = ConsensusIntegrator()

        # ALOE pipeline brain
        self.lifecycle = LifecycleManager(self.config, self.adapter)

        # ALOE lifecycle
        self.lifecycle = LifecycleManager(self.config, self.provider_adapter)

    async def process(self, request_dict: dict):
        """
        Main request handler.
        Validates → executes → builds response.
        """

        try:
            # Validate request
            request = ToronRequest(**request_dict)

            # Session context
            context = SessionContext(request_dict).as_dict()

            # Policy enforcement
            self.policy.validate(request_dict)

            # Run full ALOE pipeline
            result = await self.lifecycle.run(request_dict, context)

            # Error-style payload
            if result.get("status") == "error":
                return self.error_shaper.shape(result)

            latency_ms = (time.time() - start) * 1000
            self.telemetry.metric("EngineTotalLatency", latency_ms)
            self.telemetry.log(
                "ToronEngineCompleted",
                {
                    "session_id": context["session_id"],
                    "latency_ms": latency_ms,
                    "status": result.get("status", "ok"),
                },
            )

            return resp

        except Exception as e:
            self.telemetry.log(
                "ToronEngineError",
                {
                    "error": str(e),
                    "session_id": request.session_id,
                },
            )
            return self.errors.shape(e)


    def run_sync(self, request):
        return asyncio.run(self.run(request))


    async def health_check(self):
        return await self.health.status()
