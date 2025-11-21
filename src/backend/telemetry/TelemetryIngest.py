import hashlib
import os
import time
from collections import defaultdict
from typing import DefaultDict, Dict, List

from .TelemetryModelMetrics import TelemetryModelMetrics


class TelemetryIngest:
    def __init__(self, salt_rotation_seconds: int = 3600) -> None:
        self.salt_rotation_seconds = salt_rotation_seconds
        self._store: DefaultDict[str, DefaultDict[int, List[Dict[str, object]]]] = defaultdict(
            lambda: defaultdict(list)
        )

    def _salt(self) -> str:
        epoch = int(time.time() // self.salt_rotation_seconds)
        secret = os.getenv("TELEMETRY_SALT", "telemetry")
        return hashlib.sha256(f"{secret}:{epoch}".encode()).hexdigest()

    def _hash_id(self, identifier: str) -> str:
        salted = f"{identifier}:{self._salt()}"
        return hashlib.sha256(salted.encode()).hexdigest()

    def ingest(self, region: str, identifier: str, metrics: TelemetryModelMetrics) -> None:
        # Only metrics are persisted; text/payloads are not accepted by design.
        hashed = self._hash_id(identifier)
        bucket = int(time.time() // 3600)
        self._store[region][bucket].append({"id": hashed, "metrics": metrics})

    def snapshot(self) -> Dict[str, Dict[int, List[Dict[str, object]]]]:
        return {region: dict(buckets) for region, buckets in self._store.items()}

