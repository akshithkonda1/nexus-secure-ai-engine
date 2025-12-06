"""Glue catalog helpers for Ryuzen Telemetry."""

from __future__ import annotations

import logging
from typing import List

import boto3
from botocore.exceptions import BotoCoreError, ClientError

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

glue_client = boto3.client("glue")

DATABASE = "ryuzen_telemetry"
TABLE = "telemetry_events"


SCHEMA_COLUMNS: List[dict] = [
    {"Name": "telemetry_version", "Type": "string"},
    {"Name": "timestamp_utc", "Type": "timestamp"},
    {"Name": "model_name", "Type": "string"},
    {"Name": "model_version", "Type": "string"},
    {"Name": "category", "Type": "string"},
    {"Name": "prompt_type", "Type": "string"},
    {"Name": "token_in", "Type": "int"},
    {"Name": "token_out", "Type": "int"},
    {"Name": "latency_ms", "Type": "int"},
    {"Name": "confidence_score", "Type": "double"},
    {"Name": "reasoning_depth_score", "Type": "double"},
    {"Name": "hallucination_flag", "Type": "boolean"},
    {"Name": "safety_risk_flag", "Type": "boolean"},
    {"Name": "bias_vector", "Type": "array<double>"},
    {"Name": "disagreement_vector", "Type": "map<string,double>"},
    {"Name": "drift_signature", "Type": "string"},
    {"Name": "sanitized", "Type": "boolean"},
]

PARTITION_KEYS = [
    {"Name": "model_name", "Type": "string"},
    {"Name": "year", "Type": "string"},
    {"Name": "month", "Type": "string"},
    {"Name": "day", "Type": "string"},
]


def create_or_update_table(location: str) -> None:
    """Create or update the Glue table for telemetry events."""

    table_input = {
        "Name": TABLE,
        "StorageDescriptor": {
            "Columns": SCHEMA_COLUMNS,
            "Location": location,
            "InputFormat": "org.apache.hadoop.hive.ql.io.parquet.MapredParquetInputFormat",
            "OutputFormat": "org.apache.hadoop.hive.ql.io.parquet.MapredParquetOutputFormat",
            "SerdeInfo": {
                "SerializationLibrary": "org.apache.hadoop.hive.ql.io.parquet.serde.ParquetHiveSerDe",
            },
        },
        "PartitionKeys": PARTITION_KEYS,
        "TableType": "EXTERNAL_TABLE",
    }

    try:
        glue_client.get_table(DatabaseName=DATABASE, Name=TABLE)
        glue_client.update_table(DatabaseName=DATABASE, TableInput=table_input)
        logger.info("Updated Glue table %s.%s", DATABASE, TABLE)
    except glue_client.exceptions.EntityNotFoundException:
        glue_client.create_table(DatabaseName=DATABASE, TableInput=table_input)
        logger.info("Created Glue table %s.%s", DATABASE, TABLE)
    except (BotoCoreError, ClientError) as exc:  # pragma: no cover - AWS failures
        logger.error("Failed to create/update Glue table: %s", exc)
        raise


__all__ = ["create_or_update_table", "SCHEMA_COLUMNS", "PARTITION_KEYS"]
