"""
AWS API Gateway Adapter — maps events to ToronEngine.
"""

import json
from .toron_engine import ToronEngine


class APIGatewayAdapter:
    def __init__(self):
        self.engine = ToronEngine()

    async def handle(self, event, context):
        try:
            body = event.get("body")
            if isinstance(body, str):
                body = json.loads(body)

            result = await self.engine.process(body)

            return {
                "statusCode": 200,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps(result),
            }

        except Exception as e:
            return {
                "statusCode": 500,
                "body": json.dumps({"error": str(e)}),
            }
