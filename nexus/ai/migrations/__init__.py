"""Migration helpers for ensuring persistence infrastructure exists.

Each helper in this module is idempotent and safe to invoke at process
startup. The audit log schema is versioned so downstream consumers can
perform backwards-compatible upgrades when new attributes are added.
"""
from __future__ import annotations

import logging
from typing import Any

AUDIT_LOG_SCHEMA_VERSION = 1

_log = logging.getLogger("nexus.migrations")
if not _log.handlers:
    _handler = logging.StreamHandler()
    _handler.setFormatter(
        logging.Formatter(
            '{"ts":"%(asctime)s","lvl":"%(levelname)s","logger":"%(name)s","msg":"%(message)s"}'
        )
    )
    _log.addHandler(_handler)
_log.setLevel(logging.INFO)


def ensure_audit_table_exists(ddb_resource: Any, *, table_name: str, ttl_attribute: str = "ttl") -> None:
    """Ensure the DynamoDB audit table exists with the expected schema.

    The audit log table stores structured security events with the following
    contract:

    * Partition key: ``user_id`` (string)
    * Sort key: ``timestamp`` (ISO 8601 string)
    * TTL attribute: configurable (defaults to ``ttl``)
    * Payload attribute ``schema_version`` indicating :data:`AUDIT_LOG_SCHEMA_VERSION`

    The function creates the table if it does not already exist and enables TTL
    on the configured attribute. The operation is safe to call concurrently from
    multiple processes.
    """

    if ddb_resource is None:
        raise ValueError("ddb_resource must not be None")
    if not table_name:
        raise ValueError("table_name must be provided")

    client = ddb_resource.meta.client  # type: ignore[attr-defined]
    try:
        table = ddb_resource.Table(table_name)
        table.load()
    except client.exceptions.ResourceNotFoundException:  # type: ignore[attr-defined]
        _log.info("creating_dynamodb_table name=%s", table_name)
        table = ddb_resource.create_table(
            TableName=table_name,
            KeySchema=[
                {"AttributeName": "user_id", "KeyType": "HASH"},
                {"AttributeName": "timestamp", "KeyType": "RANGE"},
            ],
            AttributeDefinitions=[
                {"AttributeName": "user_id", "AttributeType": "S"},
                {"AttributeName": "timestamp", "AttributeType": "S"},
            ],
            BillingMode="PAY_PER_REQUEST",
        )
        table.wait_until_exists()
        _log.info("dynamodb_table_ready name=%s", table_name)
    desc = client.describe_table(TableName=table_name)
    key_schema = desc.get("Table", {}).get("KeySchema", [])
    expected_schema = [
        {"AttributeName": "user_id", "KeyType": "HASH"},
        {"AttributeName": "timestamp", "KeyType": "RANGE"},
    ]
    if key_schema != expected_schema:
        raise RuntimeError(
            f"Audit table '{table_name}' has unexpected key schema: {key_schema}"
        )
    ttl_desc = client.describe_time_to_live(TableName=table_name)
    ttl_info = ttl_desc.get("TimeToLiveDescription", {})
    if ttl_info.get("AttributeName") != ttl_attribute or ttl_info.get("TimeToLiveStatus") != "ENABLED":
        _log.info("enabling_dynamodb_ttl name=%s attribute=%s", table_name, ttl_attribute)
        client.update_time_to_live(
            TableName=table_name,
            TimeToLiveSpecification={"Enabled": True, "AttributeName": ttl_attribute},
        )
