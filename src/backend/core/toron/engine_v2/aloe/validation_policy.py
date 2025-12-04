"""
Validation Policy — final stage reflection & confidence shaping.
"""


class ValidationPolicy:
    def __init__(self, config):
        self.config = config

    async def evaluate(self, request, result, context):
        """
        Final quality validation of the answered result.
        (Could later integrate guardrails, safety models, bias reduction.)
        """

        # If answer confidence is too low, add penalty
        conf = result.get("confidence", 0.0)
        if conf < 0.2:
            result["confidence"] = round(conf * 0.8, 4)

        # If unsafe or missing — fallback to "uncertain" wrapper
        answer = result.get("final_answer", "")
        if not answer or len(answer.strip()) == 0:
            result["final_answer"] = "I'm not fully confident, but here's what is most likely true."

        return result
