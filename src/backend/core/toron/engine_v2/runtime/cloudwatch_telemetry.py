import json
import os
import time
from typing import Iterable, List, Optional

import boto3


class CloudWatchTelemetry:
    """Lightweight CloudWatch metrics + structured logging helper.

    Metrics are grouped under the namespace defined by ``TORON_CW_NAMESPACE``
    (defaults to ``Ryuzen/Toron``). All telemetry interactions are best-effort
    so that observability never interrupts engine execution.
    """

    def __init__(self):
        self.namespace = os.getenv("TORON_CW_NAMESPACE", "Ryuzen/Toron")
        self.client = boto3.client(
            "cloudwatch",
            region_name=os.getenv("AWS_REGION", "us-east-1"),
        )

    # ---------------------------
    # METRICS
    # ---------------------------
    def metric(
        self,
        name: str,
        value: float,
        unit: str = "Milliseconds",
        dims: Optional[Iterable[dict]] = None,
    ) -> None:
        dimensions: List[dict] = list(dims or [])

        try:
            self.client.put_metric_data(
                Namespace=self.namespace,
                MetricData=[
                    {
                        "MetricName": name,
                        "Dimensions": dimensions,
                        "Value": float(value),
                        "Unit": unit,
                    }
                ],
            )
        except Exception:
            # Telemetry should never break engine execution.
            pass

    # ---------------------------
    # STRUCTURED LOGS
    # ---------------------------
    def log(self, name: str, payload: dict) -> None:
        cloudwatch_log = {
            "event": name,
            "timestamp": int(time.time() * 1000),
            "payload": payload,
        }

        # stdout is scraped by log shippers; keeping JSON makes it easy to parse.
        try:
            print(json.dumps(cloudwatch_log, ensure_ascii=False))
        except Exception:
            # Logging should also be non-fatal.
            pass
