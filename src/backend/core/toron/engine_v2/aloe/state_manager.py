"""
State Manager — stores user preferences and model reliability scores.
"""

import os
import json


class StateManager:
    def __init__(self):
        self.model_state_file = os.getenv(
            "TORON_MODEL_STATE", "./model_reliability.json"
        )
        self.user_pref_file = os.getenv(
            "TORON_USER_PREFS", "./user_preferences.json"
        )

        # Load or create
        self.model_state = self._load_json(self.model_state_file)
        self.user_prefs = self._load_json(self.user_pref_file)

    def _load_json(self, path):
        try:
            if os.path.exists(path):
                with open(path, "r") as f:
                    return json.load(f)
        except Exception:
            pass
        return {}

    def _save_json(self, path, data):
        try:
            with open(path, "w") as f:
                json.dump(data, f, indent=2)
        except Exception:
            pass

    # -----------------------------
    # USER PREFERENCE MANAGEMENT
    # -----------------------------
    def attach_user_preferences(self, context):
        uid = context.get("user_id", "anonymous")
        prefs = self.user_prefs.get(uid, {})
        context["user_prefs"] = prefs
        return context

    def update_preferences(self, context):
        uid = context.get("user_id")
        if not uid:
            return

        prefs = context.get("user_prefs", {})
        self.user_prefs[uid] = prefs
        self._save_json(self.user_pref_file, self.user_prefs)

    # -----------------------------
    # MODEL RELIABILITY UPDATES
    # -----------------------------
    def update_model_reliability(self, final_result):
        model = final_result.get("model_used")
        if not model:
            return

        score = final_result.get("confidence", 0.5)

        # Reliability grows slowly
        prev = self.model_state.get(model, 0.5)
        new_score = (prev * 0.8) + (score * 0.2)

        self.model_state[model] = round(new_score, 4)
        self._save_json(self.model_state_file, self.model_state)
