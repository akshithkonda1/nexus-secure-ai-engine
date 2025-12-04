"""
Validation Policy — computes composite confidence
"""

class ValidationPolicy:
    def __init__(self, config):
        self.config = config

    async def evaluate(self, request, result, context):
        result["confidence"] = (
            result.get("model_consensus_score", 0) * 0.6 +
            result.get("web_validation_score", 0) * 0.4
        )
        return result
