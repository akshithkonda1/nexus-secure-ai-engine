"""
ALOE Lifecycle Manager — executes the 8-stage request pipeline.
"""

from .execution_graph import ExecutionGraph
from .consent_manager import ConsentManager
from .state_manager import StateManager
from .routing_policy import RoutingPolicy
from .validation_policy import ValidationPolicy

from ..core.debate_engine import DebateEngine
from ..core.fact_extractor import FactExtractor
from ..core.web_search import WebSearch
from ..core.web_validator import WebValidator
from ..core.consensus_integrator import ConsensusIntegrator


class LifecycleManager:
    def __init__(self, config, adapter):
        self.config = config
        self.adapter = adapter

        self.consent = ConsentManager()
        self.state = StateManager()
        self.routing = RoutingPolicy(config)
        self.validation = ValidationPolicy(config)

    async def run(self, request, context):
        # 1. Intake
        context["prompt"] = request.get("prompt", "")
        context["adapter"] = self.adapter

        # 2. Consent
        if not self.consent.allowed(request):
            return {
                "status": "error",
                "error_message": "User consent required.",
                "confidence": 0.0,
            }

        # 3. Routing
        selected = self.routing.select_models(request)
        context["selected_models"] = selected
        if not context["selected_models"]:
            context["selected_models"] = ["gpt-4o-mini"]

        # 4. Prepare sub-engines
        context["debate_engine"] = DebateEngine(self.adapter)
        context["fact_extractor"] = FactExtractor(self.adapter)
        context["web_search"] = WebSearch()
        context["validator"] = WebValidator(self.adapter)
        context["consensus_engine"] = ConsensusIntegrator()

        # 5. Attach state
        context = self.state.attach_user_preferences(context)

        # 6. Graph Execution
        graph = ExecutionGraph()
        graph.build(request, context, self.routing)
        try:
            result = await graph.execute(context)
        except Exception as e:
            import traceback
            return {
                "status": "error",
                "error_message": str(e),
                "traceback": traceback.format_exc(),
                "confidence": 0.0
            }

        # 7. Final validation
        result = await self.validation.evaluate(request, result, context)

        # 8. Persistence
        self.state.update_model_reliability(result)
        self.state.update_preferences(context)

        return result
