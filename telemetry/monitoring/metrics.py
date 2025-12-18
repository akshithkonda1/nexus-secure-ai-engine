"""
CloudWatch metrics client for Ryuzen Telemetry system.

Provides methods to emit key performance and operational metrics
to AWS CloudWatch for monitoring and alerting.
"""

from __future__ import annotations

import logging
from typing import Optional

import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)

# Singleton instance
_metrics_client_instance: Optional[MetricsClient] = None

# CloudWatch namespace
NAMESPACE = "Ryuzen/Telemetry"


class MetricsClient:
    """
    CloudWatch metrics client for telemetry system.

    Provides methods to emit operational metrics for monitoring.
    All methods handle errors gracefully (log but don't raise).
    """

    def __init__(self):
        """Initialize metrics client."""
        self._cloudwatch = boto3.client("cloudwatch")
        logger.info("Initialized CloudWatch metrics client")

    def _put_metric(
        self,
        metric_name: str,
        value: float,
        unit: str = "None",
        dimensions: Optional[list] = None,
    ) -> None:
        """
        Put a single metric to CloudWatch.

        Args:
            metric_name: Name of the metric
            value: Metric value
            unit: CloudWatch unit (Count, Bytes, Milliseconds, etc.)
            dimensions: List of dimension dicts [{Name: ..., Value: ...}]
        """
        try:
            metric_data = {
                "MetricName": metric_name,
                "Value": value,
                "Unit": unit,
            }

            if dimensions:
                metric_data["Dimensions"] = dimensions

            self._cloudwatch.put_metric_data(
                Namespace=NAMESPACE,
                MetricData=[metric_data],
            )

            logger.debug(f"Emitted metric: {metric_name}={value} {unit}")

        except ClientError as e:
            error_code = e.response.get("Error", {}).get("Code", "Unknown")
            logger.error(f"Failed to emit metric {metric_name}: {error_code}")
        except Exception as e:
            logger.exception(f"Unexpected error emitting metric {metric_name}: {e}")

    def emit_bundle_generated(
        self,
        partner: str,
        record_count: int,
        size_bytes: int,
    ) -> None:
        """
        Emit metrics for bundle generation.

        Args:
            partner: Partner identifier
            record_count: Number of records in bundle
            size_bytes: Bundle size in bytes
        """
        dimensions = [{"Name": "Partner", "Value": partner}]

        # Bundle creation count
        self._put_metric(
            metric_name="BundlesGenerated",
            value=1.0,
            unit="Count",
            dimensions=dimensions,
        )

        # Record count
        self._put_metric(
            metric_name="BundleRecordCount",
            value=float(record_count),
            unit="Count",
            dimensions=dimensions,
        )

        # Bundle size
        self._put_metric(
            metric_name="BundleSizeBytes",
            value=float(size_bytes),
            unit="Bytes",
            dimensions=dimensions,
        )

        logger.info(
            f"Emitted bundle metrics: partner={partner}, "
            f"records={record_count}, size={size_bytes}"
        )

    def emit_pii_violation(self, severity: str = "medium") -> None:
        """
        Emit PII violation detected metric.

        Args:
            severity: Violation severity (low, medium, high, critical)
        """
        dimensions = [{"Name": "Severity", "Value": severity}]

        self._put_metric(
            metric_name="PIIViolations",
            value=1.0,
            unit="Count",
            dimensions=dimensions,
        )

        logger.warning(f"Emitted PII violation metric: severity={severity}")

    def emit_scrubbing_latency(self, latency_ms: float, layer: str) -> None:
        """
        Emit scrubbing latency metric.

        Args:
            latency_ms: Scrubbing latency in milliseconds
            layer: Scrubbing layer (regex, llm, field_filter)
        """
        dimensions = [{"Name": "Layer", "Value": layer}]

        self._put_metric(
            metric_name="ScrubbingLatencyMs",
            value=latency_ms,
            unit="Milliseconds",
            dimensions=dimensions,
        )

        logger.debug(f"Emitted scrubbing latency: layer={layer}, latency={latency_ms}ms")

    def emit_delivery_status(self, partner: str, success: bool) -> None:
        """
        Emit bundle delivery status metric.

        Args:
            partner: Partner identifier
            success: Whether delivery succeeded
        """
        dimensions = [{"Name": "Partner", "Value": partner}]

        metric_name = "DeliverySuccess" if success else "DeliveryFailure"

        self._put_metric(
            metric_name=metric_name,
            value=1.0,
            unit="Count",
            dimensions=dimensions,
        )

        status = "success" if success else "failure"
        logger.info(f"Emitted delivery status: partner={partner}, status={status}")

    def emit_lambda_error(self, function_name: str, error_type: str) -> None:
        """
        Emit Lambda function error metric.

        Args:
            function_name: Name of Lambda function
            error_type: Type of error encountered
        """
        dimensions = [
            {"Name": "FunctionName", "Value": function_name},
            {"Name": "ErrorType", "Value": error_type},
        ]

        self._put_metric(
            metric_name="LambdaErrors",
            value=1.0,
            unit="Count",
            dimensions=dimensions,
        )

        logger.error(
            f"Emitted Lambda error metric: function={function_name}, "
            f"error={error_type}"
        )

    def emit_api_latency(self, endpoint: str, latency_ms: float) -> None:
        """
        Emit API endpoint latency metric.

        Args:
            endpoint: API endpoint name
            latency_ms: Request latency in milliseconds
        """
        dimensions = [{"Name": "Endpoint", "Value": endpoint}]

        self._put_metric(
            metric_name="APILatencyMs",
            value=latency_ms,
            unit="Milliseconds",
            dimensions=dimensions,
        )

        logger.debug(f"Emitted API latency: endpoint={endpoint}, latency={latency_ms}ms")

    def emit_record_processed(self, source: str, success: bool) -> None:
        """
        Emit telemetry record processing metric.

        Args:
            source: Processing source (ingestion, sanitization, analytics)
            success: Whether processing succeeded
        """
        dimensions = [
            {"Name": "Source", "Value": source},
            {"Name": "Status", "Value": "success" if success else "failure"},
        ]

        self._put_metric(
            metric_name="RecordsProcessed",
            value=1.0,
            unit="Count",
            dimensions=dimensions,
        )

        logger.debug(
            f"Emitted record processing metric: source={source}, "
            f"success={success}"
        )


def get_metrics_client() -> MetricsClient:
    """
    Get singleton metrics client instance.

    Returns:
        Global MetricsClient instance.
    """
    global _metrics_client_instance

    if _metrics_client_instance is None:
        _metrics_client_instance = MetricsClient()

    return _metrics_client_instance


__all__ = ["MetricsClient", "get_metrics_client"]
