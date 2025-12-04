"""
ALOEMetaRouter — Predictive routing layer built on ALOE principles.
Integrates QGC, reliability scores, ALOE ethics rules, and chooses 
the best debate panel BEFORE debate begins.
"""

class ALOEMetaRouter:
    def __init__(self, reliability, qgc, config):
        self.reliability = reliability
        self.qgc = qgc
        self.config = config

    def predict_scores(self, models):
        out = {}
        for m in models:
            metrics = {
                "trust": self.reliability.score(m),
                "cost": 0.1,
                "contradictions": 0
            }
            out[m] = self.qgc.score_model(m, metrics)
        return out

    def recommend_panel(self, scored, request):
        budget = request.get("max_cost", 0.10)
        size = self.qgc.recommend_panel_size(budget)
        ranked = sorted(scored.items(), key=lambda x: x[1], reverse=True)
        chosen = [m for m,_ in ranked[:size]]

        # ALOE: filter unsafe / untrustworthy models
        cleaned = [m for m in chosen if self.reliability.score(m) > 0.5]
        return cleaned or [chosen[0]]
