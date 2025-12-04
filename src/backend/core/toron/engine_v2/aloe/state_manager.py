"""
State Manager — supports growth tracking & reliability evolution
"""

class StateManager:
    def __init__(self):
        self.model_reliability = {}
        self.user_preferences = {}

    def attach_user_preferences(self, context):
        user = context.get("user_id")
        context["preferences"] = self.user_preferences.get(user, {})
        return context

    def update_preferences(self, context):
        user = context.get("user_id")
        if user:
            self.user_preferences[user] = context.get("preferences", {})

    def update_model_reliability(self, result):
        model = result.get("model_used")
        score = result.get("confidence", 0.5)
        if model:
            prev = self.model_reliability.get(model, 0.5)
            self.model_reliability[model] = prev * 0.9 + score * 0.1
