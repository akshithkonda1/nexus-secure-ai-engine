"""
Integration tests for Ryuzen Telemetry system.

Tests the end-to-end telemetry pipeline including:
- Telemetry client emission
- LLM-based PII scrubbing
- Schema validation and migration
- Metrics emission
"""

import asyncio
import json
import os
from unittest.mock import MagicMock, patch, AsyncMock
import pytest

# Import components to test
from ryuzen.engine.telemetry_client import TelemetryClient, get_telemetry_client
from telemetry.scrubber.llm_scrubber import LLMScrubber, get_llm_scrubber
from telemetry.scrubber.scrubber import scrub_record
from telemetry.schema.schema_registry import (
    SchemaRegistry,
    validate_record,
    migrate_record,
    CURRENT_SCHEMA_VERSION,
)
from telemetry.monitoring.metrics import MetricsClient, get_metrics_client


# ============================================================================
# Test Fixtures
# ============================================================================

@pytest.fixture
def sample_telemetry_payload():
    """Sample telemetry payload for testing."""
    return {
        "telemetry_version": "1.0",
        "timestamp_utc": "2025-12-18T10:00:00Z",
        "query_id": "test_query_123",
        "prompt_hash": "abc123def456",
        "user_id": "user_test_001",
        "session_id": "session_test_001",
        "model_responses": [
            {
                "model_name": "ChatGPT-5.2",
                "model_version": "5.2",
                "category": "chat",
                "prompt_type": "explanation",
                "token_in": 50,
                "token_out": 150,
                "latency_ms": 280,
                "confidence_score": 0.85,
                "reasoning_depth_score": 0.7,
                "hallucination_flag": False,
                "safety_risk_flag": False,
            }
        ],
        "consensus_quality": "high",
        "agreement_count": 7,
        "total_responses": 8,
        "output_grade": "A",
        "semantic_diversity": 0.15,
        "source_weighted_confidence": 0.87,
        "calibrated_confidence": 0.83,
        "evidence_strength": "strong",
        "arbitration_source": "opus_primary",
        "arbitration_model": "Claude-Opus-4",
        "tier4_failsafe_triggered": False,
        "total_latency_ms": 1250,
        "cache_hit": False,
        "tier_retries": 0,
        "tier_timeouts": 0,
        "degradation_level": "none",
        "providers_failed": 1,
        "uncertainty_flags": [],
    }


@pytest.fixture
def pii_contaminated_data():
    """Sample data with PII for scrubbing tests."""
    return {
        "user_email": "john.doe@example.com",
        "phone": "555-123-4567",
        "company": "Acme Corp",
        "query": "What is the capital of France?",
        "ssn": "123-45-6789",
    }


# ============================================================================
# Test 1: Telemetry Client
# ============================================================================

@pytest.mark.asyncio
async def test_telemetry_client_singleton():
    """Test that telemetry client uses singleton pattern."""
    client1 = get_telemetry_client()
    client2 = get_telemetry_client()
    assert client1 is client2, "Telemetry client should be singleton"


@pytest.mark.asyncio
async def test_telemetry_client_disabled():
    """Test telemetry client when disabled."""
    with patch.dict(os.environ, {"TELEMETRY_ENABLED": "false"}):
        client = TelemetryClient()
        assert not client.enabled, "Client should be disabled"


@pytest.mark.asyncio
async def test_telemetry_client_api_key_fetch():
    """Test API key fetching from Secrets Manager."""
    mock_secrets_client = MagicMock()
    mock_secrets_client.get_secret_value.return_value = {
        "SecretString": json.dumps({"api_key": "test_api_key_123"})
    }

    with patch("boto3.client", return_value=mock_secrets_client):
        client = TelemetryClient()
        client.enabled = True
        client.api_url = "https://api.example.com/telemetry"

        api_key = await client._fetch_api_key()
        assert api_key == "test_api_key_123", "Should fetch API key correctly"


@pytest.mark.asyncio
async def test_telemetry_emission_non_blocking(sample_telemetry_payload):
    """Test that telemetry emission doesn't block."""
    mock_response = AsyncMock()
    mock_response.status = 200

    mock_session = AsyncMock()
    mock_session.post.return_value.__aenter__.return_value = mock_response

    with patch.dict(os.environ, {
        "TELEMETRY_ENABLED": "true",
        "TELEMETRY_API_URL": "https://api.example.com/telemetry"
    }):
        client = TelemetryClient()
        client.api_key = "test_key"
        client.api_key_fetched = True
        client._session = mock_session

        # Create mock consensus and metrics objects
        mock_consensus = MagicMock()
        mock_consensus.consensus_quality.value = "high"
        mock_consensus.agreement_count = 7
        mock_consensus.total_responses = 8
        mock_consensus.output_grade.value = "A"
        mock_consensus.semantic_diversity = 0.15
        mock_consensus.source_weighted_confidence = 0.87
        mock_consensus.calibrated_confidence = 0.83
        mock_consensus.evidence_strength = "strong"
        mock_consensus.arbitration_source.value = "opus_primary"
        mock_consensus.arbitration_model = "Claude-Opus-4"
        mock_consensus.uncertainty_flags = []

        mock_metrics = MagicMock()
        mock_metrics.request_id = "test_123"
        mock_metrics.total_latency_ms = 1250
        mock_metrics.cache_hits = 0
        mock_metrics.tier_retries = 0
        mock_metrics.tier_timeouts = 0
        mock_metrics.degradation_level = "none"
        mock_metrics.providers_failed = 1
        mock_metrics.tier4_failsafe_triggered = False

        mock_response_obj = MagicMock()
        mock_response_obj.model = "ChatGPT-5.2"
        mock_response_obj.tokens_used = 150
        mock_response_obj.latency_ms = 280
        mock_response_obj.confidence = 0.85
        mock_response_obj.metadata = {}

        # Emission should return immediately (fire-and-forget)
        await client.emit_query_event(
            prompt="Test prompt",
            consensus=mock_consensus,
            metrics=mock_metrics,
            all_responses=[mock_response_obj],
            user_id="user_test",
            session_id="session_test",
        )

        # Test passes if no exception raised


# ============================================================================
# Test 2: LLM PII Scrubbing
# ============================================================================

@pytest.mark.asyncio
async def test_llm_scrubber_singleton():
    """Test that LLM scrubber uses singleton pattern."""
    scrubber1 = get_llm_scrubber()
    scrubber2 = get_llm_scrubber()
    assert scrubber1 is scrubber2, "LLM scrubber should be singleton"


def test_llm_scrubber_disabled():
    """Test LLM scrubber when disabled."""
    with patch.dict(os.environ, {"LLM_SCRUBBING_ENABLED": "false"}):
        scrubber = LLMScrubber()
        assert not scrubber.enabled, "Scrubber should be disabled"

        # Should return data unchanged
        test_data = {"key": "value"}
        result, violation = scrubber.scrub_sync(test_data)
        assert result == test_data
        assert not violation


def test_llm_scrubber_detects_pii(pii_contaminated_data):
    """Test that LLM scrubber detects contextual PII."""
    mock_bedrock = MagicMock()
    mock_response_body = {
        "content": [
            {
                "text": json.dumps({
                    "has_pii": True,
                    "scrubbed_data": {
                        "user_email": "[REDACTED]",
                        "phone": "[REDACTED]",
                        "company": "[REDACTED]",
                        "query": "What is the capital of France?",
                        "ssn": "[REDACTED]",
                    },
                    "violations": ["email", "phone", "company_name", "ssn"]
                })
            }
        ]
    }
    mock_bedrock.invoke_model.return_value = {
        "body": MagicMock(read=lambda: json.dumps(mock_response_body).encode())
    }

    with patch("boto3.client", return_value=mock_bedrock):
        with patch.dict(os.environ, {"LLM_SCRUBBING_ENABLED": "true"}):
            scrubber = LLMScrubber()
            scrubbed_data, violation = scrubber.scrub_sync(pii_contaminated_data)

            assert violation, "Should detect PII violation"
            assert scrubbed_data["user_email"] == "[REDACTED]"
            assert scrubbed_data["phone"] == "[REDACTED]"


# ============================================================================
# Test 3: Triple-Layer Scrubbing
# ============================================================================

def test_triple_layer_scrubbing(pii_contaminated_data):
    """Test that triple-layer scrubbing works together."""
    with patch.dict(os.environ, {"LLM_SCRUBBING_ENABLED": "false"}):
        # With LLM disabled, only regex should work
        scrubbed, violation = scrub_record(pii_contaminated_data)

        # Regex should catch email, phone, SSN
        assert violation, "Should detect PII via regex"
        assert "[REDACTED]" in str(scrubbed.get("user_email", ""))


# ============================================================================
# Test 4: Schema Validation
# ============================================================================

def test_schema_validation_valid_record(sample_telemetry_payload):
    """Test schema validation with valid record."""
    is_valid = validate_record(sample_telemetry_payload, "1.0")
    assert is_valid, "Valid record should pass validation"


def test_schema_validation_missing_field():
    """Test schema validation with missing required field."""
    incomplete_record = {
        "telemetry_version": "1.0",
        "timestamp_utc": "2025-12-18T10:00:00Z",
        # Missing other required fields
    }

    is_valid = validate_record(incomplete_record, "1.0")
    assert not is_valid, "Incomplete record should fail validation"


def test_schema_validation_wrong_type():
    """Test schema validation with wrong field type."""
    invalid_record = {
        "telemetry_version": "1.0",
        "timestamp_utc": "2025-12-18T10:00:00Z",
        "query_id": "test_123",
        "prompt_hash": "abc123",
        "user_id": None,
        "session_id": None,
        "model_responses": [],
        "consensus_quality": "high",
        "agreement_count": "seven",  # Wrong type: should be int
        "total_responses": 8,
        "output_grade": "A",
        "semantic_diversity": 0.15,
        "source_weighted_confidence": 0.87,
        "calibrated_confidence": 0.83,
        "evidence_strength": "strong",
        "arbitration_source": "opus_primary",
        "arbitration_model": None,
        "tier4_failsafe_triggered": False,
        "total_latency_ms": 1250,
        "cache_hit": False,
        "tier_retries": 0,
        "tier_timeouts": 0,
        "degradation_level": "none",
        "providers_failed": 1,
        "uncertainty_flags": [],
    }

    is_valid = validate_record(invalid_record, "1.0")
    assert not is_valid, "Record with wrong type should fail validation"


# ============================================================================
# Test 5: Schema Migration
# ============================================================================

def test_schema_migration_1_0_to_1_1(sample_telemetry_payload):
    """Test migration from schema v1.0 to v1.1."""
    migrated = migrate_record(sample_telemetry_payload, "1.0", "1.1")

    assert migrated["telemetry_version"] == "1.1"
    assert "reasoning_steps" in migrated
    assert "source_citations" in migrated
    assert migrated["reasoning_steps"] == 0  # Default value
    assert migrated["source_citations"] == []  # Default value


def test_schema_migration_1_1_to_1_0():
    """Test downgrade migration from v1.1 to v1.0."""
    v1_1_record = {
        "telemetry_version": "1.1",
        "timestamp_utc": "2025-12-18T10:00:00Z",
        "query_id": "test_123",
        "prompt_hash": "abc123",
        "user_id": None,
        "session_id": None,
        "model_responses": [],
        "reasoning_steps": 5,  # v1.1 field
        "source_citations": ["source1", "source2"],  # v1.1 field
        "consensus_quality": "high",
        "agreement_count": 7,
        "total_responses": 8,
        "output_grade": "A",
        "semantic_diversity": 0.15,
        "source_weighted_confidence": 0.87,
        "calibrated_confidence": 0.83,
        "evidence_strength": "strong",
        "arbitration_source": "opus_primary",
        "arbitration_model": None,
        "tier4_failsafe_triggered": False,
        "total_latency_ms": 1250,
        "cache_hit": False,
        "tier_retries": 0,
        "tier_timeouts": 0,
        "degradation_level": "none",
        "providers_failed": 1,
        "uncertainty_flags": [],
    }

    migrated = migrate_record(v1_1_record, "1.1", "1.0")

    assert migrated["telemetry_version"] == "1.0"
    assert "reasoning_steps" not in migrated
    assert "source_citations" not in migrated


# ============================================================================
# Test 6: Metrics Client
# ============================================================================

def test_metrics_client_singleton():
    """Test that metrics client uses singleton pattern."""
    client1 = get_metrics_client()
    client2 = get_metrics_client()
    assert client1 is client2, "Metrics client should be singleton"


def test_metrics_emission_graceful_failure():
    """Test that metrics emission handles errors gracefully."""
    mock_cloudwatch = MagicMock()
    mock_cloudwatch.put_metric_data.side_effect = Exception("CloudWatch error")

    with patch("boto3.client", return_value=mock_cloudwatch):
        client = MetricsClient()

        # Should not raise exception
        client.emit_bundle_generated(
            partner="test_partner",
            record_count=100,
            size_bytes=1024000,
        )


def test_metrics_pii_violation():
    """Test PII violation metric emission."""
    mock_cloudwatch = MagicMock()

    with patch("boto3.client", return_value=mock_cloudwatch):
        client = MetricsClient()
        client.emit_pii_violation(severity="high")

        # Verify CloudWatch was called
        assert mock_cloudwatch.put_metric_data.called


# ============================================================================
# Run Tests
# ============================================================================

if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
