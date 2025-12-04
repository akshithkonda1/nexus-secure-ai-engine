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
from ..runtime.session_context import SessionContext

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
        providers = bootstrap.initialize()

        connectors = ConnectorFactory.discover(providers)
        if not connectors:
            raise RuntimeError("No model providers available.")

        # Cloud orchestrator
        self.adapter = CloudProviderAdapter(connectors, self.config)

        # ALOE pipeline brain
        self.lifecycle = LifecycleManager(self.config, self.adapter)

        # Utilities
        self.response_builder = ResponseBuilder()
        self.error_shaper = ErrorShaper()
        self.policy = ExecutionPolicy(self.config)
        self.health = HealthCheck(self.adapter)

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

            # Build final response object
            return self.response_builder.build(result, context)

        except Exception as e:
            return self.error_shaper.shape({"error_message": str(e)})

    async def health_check(self):
        return await self.health.status()
