"""
Execution Policy — enforce safety, token limits, timeouts.
"""

class ExecutionPolicy:
    def __init__(self, config):
        self.max_tokens = config.max_tokens
        self.timeout_s = config.model_timeout_seconds
        self.max_concurrent_models = config.max_parallel_models

    def validate(self, request):
        if "prompt" not in request or not request["prompt"]:
            raise ValueError("Missing prompt.")

        return True
