"""
ALOE Lifecycle Manager — 8-stage orchestrator for Toron Engine v2.0
Follows QGC (Quality, Growth, Cost) in every stage:

1. Signal Intake
2. Consent Evaluation
3. Execution Graph Planning
4. Model Routing
5. Context Assembly
6. Action Execution (DAG)
7. Validation & Reflection
8. State Persistence
"""

from .execution_graph import ExecutionGraph
from .consent_manager import ConsentManager
from .state_manager import StateManager
from .routing_policy import RoutingPolicy
from .validation_policy import ValidationPolicy


class LifecycleManager:
    def __init__(self, config, adapter):
        self.config = config
        self.adapter = adapter
        self.graph = ExecutionGraph()
        self.consent = ConsentManager()
        self.state = StateManager()
        self.routing = RoutingPolicy(config)
        self.validation = ValidationPolicy(config)

    async def run(self, request: dict, context: dict):
        # -----------------------------
        # Stage 1 — Signal Intake
        # -----------------------------
        context["raw_request"] = request
        context["prompt"] = request.get("prompt", "")
        context["adapter"] = self.adapter
        context["config"] = self.config

        # -----------------------------
        # Stage 2 — Consent Check
        # -----------------------------
        if not self.consent.allowed(request):
            return {
                "status": "error",
                "error_message": "User consent required.",
                "confidence": 0.0
            }

        # -----------------------------
        # Stage 3 — Build Execution Graph
        # -----------------------------
        self.graph.build(request, context, routing=self.routing)

        # -----------------------------
        # Stage 4 — Model Routing
        # -----------------------------
        context["selected_models"] = self.routing.select_models(request)

        # -----------------------------
        # Stage 5 — Context Assembly
        # -----------------------------
        context = self.state.attach_user_preferences(context)

        # -----------------------------
        # Stage 6 — Action Execution (DAG)
        # -----------------------------
        try:
            result = await self.graph.execute(context)
        except Exception as e:
            return {
                "status": "error",
                "error_message": f"DAG Execution failed: {str(e)}",
                "confidence": 0.0
            }

        # -----------------------------
        # Stage 7 — Validation & Reflection
        # -----------------------------
        validated = await self.validation.evaluate(request, result, context)

        # -----------------------------
        # Stage 8 — State Persistence
        # -----------------------------
        self.state.update_model_reliability(validated)
        self.state.update_preferences(context)

        return validated
