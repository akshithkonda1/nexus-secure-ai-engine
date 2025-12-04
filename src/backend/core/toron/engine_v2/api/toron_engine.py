"""
Toron Engine v2.0 — API entry point
Wires Bootstrap → ALOE → Cloud Providers → Runtime → ResponseBuilder
"""

import time
import asyncio

from ..bootstrap.engine_bootstrap import EngineBootstrap
from ..aloe.lifecycle_manager import LifecycleManager
from ..runtime.execution_policy import ExecutionPolicy
from ..runtime.response_builder import ResponseBuilder
from ..runtime.error_shaper import ErrorShaper
from ..runtime.session_context import SessionContext
from ..core.connectors.connector_factory import ConnectorFactory
from ..core.cloud_provider_adapter import CloudProviderAdapter
from ..core.debate_engine import DebateEngine
from ..core.fact_extractor import FactExtractor
from ..core.web_search import WebSearch
from ..core.web_validator import WebValidator
from ..core.consensus_integrator import ConsensusIntegrator
from ..runtime.cloudwatch_telemetry import CloudWatchTelemetry

from .response_schema import ToronResponse


class ToronEngine:

    def __init__(self):
        bootstrap = EngineBootstrap()
        self.providers = bootstrap.initialize()
        self.config = bootstrap.config
        self.telemetry = CloudWatchTelemetry()

        # Discover connectors
        connectors = ConnectorFactory.discover(self.providers)
        self.provider_adapter = CloudProviderAdapter(connectors, self.config)

        # Core Engines
        self.debate_engine = DebateEngine(self.provider_adapter)
        self.fact_extractor = FactExtractor(self.provider_adapter)
        self.web_search = WebSearch()
        self.validator = WebValidator(self.provider_adapter)
        self.consensus = ConsensusIntegrator()

        # Runtime
        self.policy = ExecutionPolicy(self.config)
        self.builder = ResponseBuilder()
        self.errors = ErrorShaper()

        # ALOE lifecycle
        self.lifecycle = LifecycleManager(self.config, self.provider_adapter)


    async def run(self, request):
        try:
            start = time.time()

            # Create per-request context
            context = {
                "config": self.config,
                "provider_adapter": self.provider_adapter,
                "debate_engine": self.debate_engine,
                "fact_extractor": self.fact_extractor,
                "web_search": self.web_search,
                "validator": self.validator,
                "consensus_engine": self.consensus,
                "user_id": request.user_id,
                "session_id": request.session_id or "sess-" + str(int(time.time()))
            }

            # Apply policy
            clean_req = self.policy.enforce(request.model_dump())

            # Run ALOE lifecycle
            result = await self.lifecycle.run(clean_req, context)

            # Build response
            resp = self.builder.build(result, context)

            resp["session_id"] = context["session_id"]
            resp["timestamp"] = str(time.time())

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


