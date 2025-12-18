"""
Schema versioning system for Ryuzen Telemetry.

Provides schema validation and migration capabilities to support
evolving telemetry data structures while maintaining backward compatibility.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

# Current schema version
CURRENT_SCHEMA_VERSION = "1.0"


# Schema definitions
SCHEMA_V1_0_FIELDS = {
    # Core identifiers
    "telemetry_version": str,
    "timestamp_utc": str,
    "query_id": str,
    "prompt_hash": str,
    "user_id": (str, type(None)),
    "session_id": (str, type(None)),

    # Model responses (list of dicts)
    "model_responses": list,

    # Consensus metadata
    "consensus_quality": str,
    "agreement_count": int,
    "total_responses": int,
    "output_grade": str,
    "semantic_diversity": float,
    "source_weighted_confidence": float,
    "calibrated_confidence": float,
    "evidence_strength": str,

    # Arbitration tracking
    "arbitration_source": str,
    "arbitration_model": (str, type(None)),
    "tier4_failsafe_triggered": bool,

    # Performance metrics
    "total_latency_ms": int,
    "cache_hit": bool,
    "tier_retries": int,
    "tier_timeouts": int,
    "degradation_level": str,
    "providers_failed": int,
    "uncertainty_flags": list,
}

SCHEMA_V1_1_FIELDS = {
    **SCHEMA_V1_0_FIELDS,  # Include all v1.0 fields

    # New fields in v1.1
    "reasoning_steps": int,  # Number of reasoning steps taken
    "source_citations": list,  # List of source citations
}

# Registry of all schema versions
SCHEMA_REGISTRY = {
    "1.0": SCHEMA_V1_0_FIELDS,
    "1.1": SCHEMA_V1_1_FIELDS,
}


class SchemaValidationError(Exception):
    """Raised when schema validation fails."""
    pass


class SchemaRegistry:
    """
    Schema registry for telemetry data validation and migration.

    Supports multiple schema versions and provides validation
    and migration capabilities.
    """

    def __init__(self):
        """Initialize schema registry."""
        self.schemas = SCHEMA_REGISTRY
        logger.info(f"Schema registry initialized with versions: {list(self.schemas.keys())}")

    def get_current_version(self) -> str:
        """Get current schema version."""
        return CURRENT_SCHEMA_VERSION

    def get_schema(self, version: str) -> Dict[str, Any]:
        """
        Get schema definition for a specific version.

        Args:
            version: Schema version string (e.g., "1.0")

        Returns:
            Schema definition dictionary

        Raises:
            ValueError: If version not found
        """
        if version not in self.schemas:
            raise ValueError(f"Unknown schema version: {version}")

        return self.schemas[version]

    def validate_record(self, record: Dict[str, Any], version: str = CURRENT_SCHEMA_VERSION) -> bool:
        """
        Validate a telemetry record against a schema version.

        Args:
            record: Telemetry record to validate
            version: Schema version to validate against

        Returns:
            True if valid, False otherwise
        """
        try:
            schema = self.get_schema(version)

            # Check required fields
            for field_name, field_type in schema.items():
                if field_name not in record:
                    # Allow optional fields (those with None in type tuple)
                    if isinstance(field_type, tuple) and type(None) in field_type:
                        continue
                    logger.error(f"Validation failed: Missing required field '{field_name}'")
                    return False

                # Validate type
                value = record[field_name]

                if isinstance(field_type, tuple):
                    # Multiple allowed types
                    if not isinstance(value, field_type):
                        logger.error(
                            f"Validation failed: Field '{field_name}' has type {type(value).__name__}, "
                            f"expected one of {field_type}"
                        )
                        return False
                else:
                    # Single type
                    if not isinstance(value, field_type):
                        logger.error(
                            f"Validation failed: Field '{field_name}' has type {type(value).__name__}, "
                            f"expected {field_type.__name__}"
                        )
                        return False

            logger.debug(f"Record validated successfully against schema {version}")
            return True

        except Exception as e:
            logger.exception(f"Error validating record: {e}")
            return False

    def migrate_record(
        self,
        record: Dict[str, Any],
        from_version: str,
        to_version: str
    ) -> Dict[str, Any]:
        """
        Migrate a telemetry record from one schema version to another.

        Args:
            record: Telemetry record to migrate
            from_version: Source schema version
            to_version: Target schema version

        Returns:
            Migrated record

        Raises:
            ValueError: If migration path not supported
        """
        if from_version == to_version:
            return record

        # Currently only support 1.0 -> 1.1
        if from_version == "1.0" and to_version == "1.1":
            return self._migrate_1_0_to_1_1(record)
        elif from_version == "1.1" and to_version == "1.0":
            return self._migrate_1_1_to_1_0(record)
        else:
            raise ValueError(f"Migration from {from_version} to {to_version} not supported")

    def _migrate_1_0_to_1_1(self, record: Dict[str, Any]) -> Dict[str, Any]:
        """
        Migrate record from v1.0 to v1.1.

        Adds new fields with default values.
        """
        migrated = record.copy()

        # Add new fields with defaults
        migrated["reasoning_steps"] = 0  # Default: no reasoning steps recorded
        migrated["source_citations"] = []  # Default: no citations

        # Update telemetry version
        migrated["telemetry_version"] = "1.1"

        logger.info(f"Migrated record from v1.0 to v1.1: query_id={record.get('query_id')}")
        return migrated

    def _migrate_1_1_to_1_0(self, record: Dict[str, Any]) -> Dict[str, Any]:
        """
        Migrate record from v1.1 to v1.0 (downgrade).

        Removes v1.1-specific fields.
        """
        migrated = record.copy()

        # Remove v1.1-only fields
        migrated.pop("reasoning_steps", None)
        migrated.pop("source_citations", None)

        # Update telemetry version
        migrated["telemetry_version"] = "1.0"

        logger.info(f"Migrated record from v1.1 to v1.0: query_id={record.get('query_id')}")
        return migrated

    def get_available_versions(self) -> List[str]:
        """Get list of available schema versions."""
        return sorted(self.schemas.keys())

    def is_version_supported(self, version: str) -> bool:
        """Check if a schema version is supported."""
        return version in self.schemas


# Convenience functions for common operations

def validate_record(record: Dict[str, Any], version: str = CURRENT_SCHEMA_VERSION) -> bool:
    """
    Validate a telemetry record against a schema version.

    Args:
        record: Telemetry record to validate
        version: Schema version to validate against (default: current)

    Returns:
        True if valid, False otherwise
    """
    registry = SchemaRegistry()
    return registry.validate_record(record, version)


def migrate_record(
    record: Dict[str, Any],
    from_version: str,
    to_version: str
) -> Dict[str, Any]:
    """
    Migrate a telemetry record between schema versions.

    Args:
        record: Telemetry record to migrate
        from_version: Source schema version
        to_version: Target schema version

    Returns:
        Migrated record
    """
    registry = SchemaRegistry()
    return registry.migrate_record(record, from_version, to_version)


def get_current_version() -> str:
    """Get current schema version."""
    return CURRENT_SCHEMA_VERSION


__all__ = [
    "SchemaRegistry",
    "SchemaValidationError",
    "validate_record",
    "migrate_record",
    "get_current_version",
    "CURRENT_SCHEMA_VERSION",
]
