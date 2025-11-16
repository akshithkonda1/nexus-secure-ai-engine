from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, List


@dataclass
class TelemetryEventRecord:
    event_type: str
    payload: Dict
    timestamp: datetime


@dataclass
class TelemetryManager:
    events: List[TelemetryEventRecord] = field(default_factory=list)

    def log(self, enabled: bool, event_type: str, payload: Dict) -> bool:
        if not enabled:
            return False
        self.events.append(TelemetryEventRecord(event_type=event_type, payload=payload, timestamp=datetime.utcnow()))
        return True


telemetry_manager = TelemetryManager()
