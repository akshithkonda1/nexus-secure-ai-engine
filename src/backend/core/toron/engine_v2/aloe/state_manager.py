"""
State Manager — tracks:

- User preferences
- Model reliability scores
- Drift accumulation
- QGC reinforcement signals
"""

class StateManager:
    def __init__(self):
        self.user_prefs = {}
        self.model_reliability = {}   # simple EWMA reliability

    def attach_user_preferences(self, context: dict):
        user = context.get("user_id")
        if not user:
            return context
        context["preferences"] = self.user_prefs.get(user, {})
        return context

    def update_preferences(self, context: dict):
        user = context.get("user_id")
        if not user:
            return
        prefs = context.get("preferences", {})
        self.user_prefs[user] = prefs

    def update_model_reliability(self, validated: dict):
        model = validated.get("model_used")
        if not model:
            return
        score = validated.get("confidence", 0.5)
        old = self.model_reliability.get(model, 0.5)
        self.model_reliability[model] = (old * 0.9) + (score * 0.1)
