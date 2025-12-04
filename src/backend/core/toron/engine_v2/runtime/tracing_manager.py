"""
TracingManager — minimal tracing store for Toron Engine.
"""

import time
from typing import Any, Dict, List


class TracingManager:
    def __init__(self):
        self.traces: List[Dict[str, Any]] = []

    def record(self, event: str, payload: Dict[str, Any] | None = None):
        entry = {
            "event": event,
            "payload": payload or {},
            "timestamp": time.time(),
        }
        self.traces.append(entry)
        return entry

    def emit(self):
        return list(self.traces)

    def health(self):
        return {"status": "ok", "trace_depth": len(self.traces)}

    def serialize(self):
        return {
            "events": self.emit(),
        }
