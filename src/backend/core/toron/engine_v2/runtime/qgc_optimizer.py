"""
QGCOptimizer — Quality/Growth/Cost tri-objective optimizer.
Used by ALOE Meta-Router to tune debate panel selection, debate rounds,
cost boundaries, and dynamic debate scaling.
"""

class QGCOptimizer:
    def __init__(self):
        self.weights = {
            "quality": 0.55,
            "growth": 0.25,
            "cost": 0.20
        }

    def score_model(self, model: str, metrics: dict):
        q = max(0, metrics["trust"] - metrics["contradictions"] * 0.1)
        g = metrics["trust"]
        c = max(0, 1 - metrics["cost"])
        return round(
            q*self.weights["quality"] +
            g*self.weights["growth"] +
            c*self.weights["cost"], 4
        )

    def recommend_rounds(self, avg_trust):
        if avg_trust > 0.85: return 1
        if avg_trust > 0.7:  return 2
        return 3

    def recommend_panel_size(self, budget):
        if budget < 0.05: return 2
        if budget < 0.15: return 3
        return 4
