"""
AWS API Gateway & Lambda Adapter for Toron Engine v2.0
"""

import json
from .toron_engine import ToronEngine
from .request_schema import ToronRequest

engine = ToronEngine()

def handler(event, context):
    body = json.loads(event.get("body", "{}"))
    request = ToronRequest(**body)

    response = engine.run_sync(request)
    return {
        "statusCode": 200,
        "body": json.dumps(response)
    }


