"""
ReplayStore — lightweight request/response recorder.
"""

import time
from typing import Any, Dict, List


class ReplayStore:
    def __init__(self):
        self.events: List[Dict[str, Any]] = []

    def record(self, request: Dict[str, Any], response: Dict[str, Any] | None = None):
        entry = {
            "timestamp": time.time(),
            "request": request,
            "response": response or {},
        }
        self.events.append(entry)
        return entry

    def emit(self):
        return list(self.events)

    def health(self):
        return {"status": "ok", "stored": len(self.events)}

    def serialize(self):
        return {
            "events": self.emit(),
        }
