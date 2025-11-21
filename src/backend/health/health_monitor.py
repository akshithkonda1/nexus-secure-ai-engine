"""Health monitoring utilities."""
from __future__ import annotations

import socket
import time
from typing import Dict


class HealthMonitor:
    @staticmethod
    def status() -> Dict[str, str | float]:
        return {
            "status": "ok",
            "timestamp": time.time(),
            "hostname": socket.gethostname(),
        }
