"""
Validation Policy — final QGC scoring pass:

Composite Confidence =
  60% model consensus score
  40% web validation score
"""

class ValidationPolicy:
    def __init__(self, config):
        self.config = config

    async def evaluate(self, request: dict, result: dict, context: dict):
        model_score = result.get("model_consensus_score", 0.4)
        web_score = result.get("web_validation_score", 0.4)

        result["confidence"] = round(
            (model_score * 0.6) + (web_score * 0.4), 4
        )

        return result
