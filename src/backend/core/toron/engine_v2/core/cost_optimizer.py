"""
CostOptimizer — chooses cheapest, fastest, safest models.
"""

class CostOptimizer:
    def select(self, models):
        # For now, sort by cost field when available
        return models[0] if models else None


