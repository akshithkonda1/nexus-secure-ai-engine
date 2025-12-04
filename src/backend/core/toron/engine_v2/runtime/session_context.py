"""
Session Context Manager — attaches metadata to each request.
"""

import uuid


class SessionContext:
    def __init__(self, request):
        self.user_id = request.get("user_id", "anonymous")
        self.session_id = request.get("session_id", str(uuid.uuid4()))
        self.timestamp = request.get("timestamp", None)

    def as_dict(self):
        return {
            "user_id": self.user_id,
            "session_id": self.session_id,
            "timestamp": self.timestamp,
        }
