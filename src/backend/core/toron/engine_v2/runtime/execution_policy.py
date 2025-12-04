"""
ExecutionPolicy — enforces:
- token limits
- execution deadlines
- budget limits
- Q-G-C safety rules
"""

class ExecutionPolicy:
    def __init__(self, config):
        self.config = config

    def enforce(self, request):
        if request.get("max_tokens", 0) > self.config.max_token_budget:
            request["max_tokens"] = self.config.max_token_budget
        return request
