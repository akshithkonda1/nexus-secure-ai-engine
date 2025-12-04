"""
ALOE Lifecycle Manager — Toron Engine v2.0
Handles 8 lifecycle states with Q-G-C logic.
"""

from .execution_graph import ExecutionGraph
from .consent_manager import ConsentManager
from .state_manager import StateManager
from .routing_policy import RoutingPolicy
from .validation_policy import ValidationPolicy

class LifecycleManager:
    def __init__(self, config):
        self.config = config
        self.graph = ExecutionGraph()
        self.consent = ConsentManager()
        self.state = StateManager()
        self.routing = RoutingPolicy(config)
        self.validation = ValidationPolicy(config)

    async def run(self, request, context):
        # 1. Signal Intake
        context["raw_request"] = request

        # 2. Consent Evaluation
        if not self.consent.allowed(request):
            return {"status": "error", "error_message": "User consent required."}

        # 3. Execution Graph
        self.graph.build(request, context, routing=self.routing)

        # 4. Model Routing
        context["selected_models"] = self.routing.select_models(request)

        # 5. Context Assembly
        context = self.state.attach_user_preferences(context)

        # 6. Action Execution
        result = await self.graph.execute(context)

        # 7. Validation & Reflection
        validated = await self.validation.evaluate(request, result, context)

        # 8. State Persistence
        self.state.update_model_reliability(validated)
        self.state.update_preferences(context)

        return validated
