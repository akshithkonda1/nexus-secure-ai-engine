"""
Async telemetry emission client for Ryuzen TORON Engine.

This client captures comprehensive telemetry data from TORON query executions
and emits them to the telemetry API Gateway endpoint in a fire-and-forget pattern.

Features:
- Fetches API key from AWS Secrets Manager
- Non-blocking emission (fire-and-forget)
- Graceful error handling (logs errors, doesn't raise)
- Singleton aiohttp session for efficiency
- Comprehensive telemetry payload construction
"""

from __future__ import annotations

import asyncio
import hashlib
import json
import logging
import os
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import aiohttp
import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)

# Singleton instance
_telemetry_client_instance: Optional[TelemetryClient] = None


class TelemetryClient:
    """
    Async telemetry client for emitting TORON query events.

    Uses fire-and-forget pattern to avoid blocking query execution.
    Fetches API key from AWS Secrets Manager on first use.
    """

    def __init__(self):
        """Initialize telemetry client."""
        self.enabled = os.getenv("TELEMETRY_ENABLED", "false").lower() == "true"
        self.api_url = os.getenv("TELEMETRY_API_URL", "")
        self.api_key: Optional[str] = None
        self.api_key_fetched = False
        self._session: Optional[aiohttp.ClientSession] = None
        self._session_lock = asyncio.Lock()

        if not self.enabled:
            logger.info("Telemetry disabled via TELEMETRY_ENABLED=false")
        elif not self.api_url:
            logger.warning("TELEMETRY_API_URL not set, telemetry will be disabled")
            self.enabled = False

    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create singleton aiohttp session."""
        if self._session is None or self._session.closed:
            async with self._session_lock:
                if self._session is None or self._session.closed:
                    timeout = aiohttp.ClientTimeout(total=10)
                    self._session = aiohttp.ClientSession(timeout=timeout)
                    logger.debug("Created new aiohttp session for telemetry")
        return self._session

    async def _fetch_api_key(self) -> Optional[str]:
        """
        Fetch telemetry API key from AWS Secrets Manager.

        Returns:
            API key string, or None if fetch fails.
        """
        if self.api_key_fetched:
            return self.api_key

        try:
            secrets_client = boto3.client("secretsmanager")
            secret_name = "ryuzen/telemetry/telemetry-api-key"

            logger.debug(f"Fetching API key from Secrets Manager: {secret_name}")
            response = secrets_client.get_secret_value(SecretId=secret_name)

            if "SecretString" in response:
                secret = json.loads(response["SecretString"])
                self.api_key = secret.get("api_key")
            else:
                logger.error("Secret does not contain SecretString")
                self.api_key = None

            self.api_key_fetched = True

            if self.api_key:
                logger.info("Successfully fetched telemetry API key")
            else:
                logger.error("API key not found in secret")

            return self.api_key

        except ClientError as e:
            error_code = e.response.get("Error", {}).get("Code", "Unknown")
            logger.error(f"Failed to fetch API key from Secrets Manager: {error_code}")
            self.api_key_fetched = True
            self.api_key = None
            return None
        except Exception as e:
            logger.exception(f"Unexpected error fetching API key: {e}")
            self.api_key_fetched = True
            self.api_key = None
            return None

    def _build_payload(
        self,
        prompt: str,
        consensus: Any,
        metrics: Any,
        all_responses: List[Any],
        user_id: Optional[str],
        session_id: Optional[str],
    ) -> Dict[str, Any]:
        """
        Build comprehensive telemetry payload from TORON query results.

        Args:
            prompt: Original query prompt
            consensus: ConsensusResult object
            metrics: ExecutionMetrics object
            all_responses: List of ModelResponse objects
            user_id: Optional user identifier
            session_id: Optional session identifier

        Returns:
            Complete telemetry payload dictionary.
        """
        # Generate query ID
        query_id = metrics.request_id

        # Generate prompt hash
        prompt_hash = hashlib.sha256(prompt.encode()).hexdigest()[:16]

        # Build per-model breakdown
        model_responses = []
        for response in all_responses:
            model_data = {
                "model_name": response.model,
                "model_version": "unknown",  # Extract from metadata if available
                "category": self._categorize_model(response.model),
                "prompt_type": self._categorize_prompt(prompt),
                "token_in": len(prompt.split()),  # Approximate
                "token_out": response.tokens_used,
                "latency_ms": response.latency_ms,
                "confidence_score": response.confidence,
                "reasoning_depth_score": response.metadata.get("reasoning_depth", 0.5),
                "hallucination_flag": response.metadata.get("hallucination_flag", False),
                "safety_risk_flag": response.metadata.get("safety_risk_flag", False),
            }
            model_responses.append(model_data)

        # Consensus metadata
        consensus_quality = consensus.consensus_quality.value
        agreement_count = consensus.agreement_count
        total_responses = consensus.total_responses
        output_grade = consensus.output_grade.value
        semantic_diversity = consensus.semantic_diversity
        source_weighted_confidence = consensus.source_weighted_confidence
        calibrated_confidence = consensus.calibrated_confidence
        evidence_strength = consensus.evidence_strength

        # Arbitration tracking
        arbitration_source = consensus.arbitration_source.value
        arbitration_model = consensus.arbitration_model
        tier4_failsafe_triggered = metrics.tier4_failsafe_triggered

        # Performance metrics
        total_latency_ms = int(metrics.total_latency_ms)
        cache_hit = metrics.cache_hits > 0
        tier_retries = metrics.tier_retries
        tier_timeouts = metrics.tier_timeouts
        degradation_level = metrics.degradation_level
        providers_failed = metrics.providers_failed
        uncertainty_flags = consensus.uncertainty_flags if consensus.uncertainty_flags else []

        # Build complete payload
        payload = {
            "telemetry_version": "1.0",
            "timestamp_utc": datetime.now(timezone.utc).isoformat(),
            "query_id": query_id,
            "prompt_hash": prompt_hash,
            "user_id": user_id,
            "session_id": session_id,

            # Per-model breakdown
            "model_responses": model_responses,

            # Consensus metadata
            "consensus_quality": consensus_quality,
            "agreement_count": agreement_count,
            "total_responses": total_responses,
            "output_grade": output_grade,
            "semantic_diversity": semantic_diversity,
            "source_weighted_confidence": source_weighted_confidence,
            "calibrated_confidence": calibrated_confidence,
            "evidence_strength": evidence_strength,

            # Arbitration tracking
            "arbitration_source": arbitration_source,
            "arbitration_model": arbitration_model,
            "tier4_failsafe_triggered": tier4_failsafe_triggered,

            # Performance metrics
            "total_latency_ms": total_latency_ms,
            "cache_hit": cache_hit,
            "tier_retries": tier_retries,
            "tier_timeouts": tier_timeouts,
            "degradation_level": degradation_level,
            "providers_failed": providers_failed,
            "uncertainty_flags": uncertainty_flags,
        }

        return payload

    def _categorize_model(self, model_name: str) -> str:
        """Categorize model by type."""
        model_lower = model_name.lower()

        if "search" in model_lower or "google" in model_lower or "bing" in model_lower:
            return "search"
        elif "reasoning" in model_lower or "thinking" in model_lower or "deepseek" in model_lower or "kimi" in model_lower:
            return "reasoning"
        elif "medical" in model_lower or "pubmed" in model_lower or "clinical" in model_lower:
            return "medical"
        elif "opus" in model_lower:
            return "judicial"
        else:
            return "chat"

    def _categorize_prompt(self, prompt: str) -> str:
        """Categorize prompt by type."""
        prompt_lower = prompt.lower()

        if any(word in prompt_lower for word in ["explain", "what is", "describe", "define"]):
            return "explanation"
        elif any(word in prompt_lower for word in ["write", "create", "generate", "compose"]):
            return "generation"
        elif any(word in prompt_lower for word in ["how to", "steps", "procedure"]):
            return "instruction"
        elif any(word in prompt_lower for word in ["analyze", "compare", "evaluate"]):
            return "analysis"
        else:
            return "query"

    async def _emit_async(self, payload: Dict[str, Any]) -> None:
        """
        Async emission of telemetry event to API Gateway.

        This is the actual network call. Logs errors but doesn't raise.
        """
        try:
            api_key = await self._fetch_api_key()
            if not api_key:
                logger.warning("Cannot emit telemetry: API key unavailable")
                return

            session = await self._get_session()
            headers = {
                "Content-Type": "application/json",
                "X-API-Key": api_key,
            }

            async with session.post(
                self.api_url,
                json=payload,
                headers=headers,
            ) as response:
                if response.status == 200:
                    logger.debug(f"Telemetry emitted successfully: query_id={payload['query_id']}")
                else:
                    text = await response.text()
                    logger.error(
                        f"Telemetry emission failed: status={response.status}, "
                        f"body={text[:200]}"
                    )

        except asyncio.TimeoutError:
            logger.error("Telemetry emission timed out")
        except aiohttp.ClientError as e:
            logger.error(f"Telemetry emission network error: {e}")
        except Exception as e:
            logger.exception(f"Unexpected error emitting telemetry: {e}")

    async def emit_query_event(
        self,
        prompt: str,
        consensus: Any,
        metrics: Any,
        all_responses: List[Any],
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
    ) -> None:
        """
        Emit a query event to telemetry API (fire-and-forget).

        This is the public interface called by TORON engine.
        Returns immediately without blocking.

        Args:
            prompt: Original query prompt
            consensus: ConsensusResult object
            metrics: ExecutionMetrics object
            all_responses: List of ModelResponse objects
            user_id: Optional user identifier
            session_id: Optional session identifier
        """
        if not self.enabled:
            return

        try:
            payload = self._build_payload(
                prompt=prompt,
                consensus=consensus,
                metrics=metrics,
                all_responses=all_responses,
                user_id=user_id,
                session_id=session_id,
            )

            # Fire-and-forget: schedule emission but don't await
            # This ensures we don't block the caller
            asyncio.create_task(self._emit_async(payload))

            logger.info(f"Telemetry event scheduled: query_id={payload['query_id']}")

        except Exception as e:
            # Catch all errors to ensure telemetry never crashes the caller
            logger.exception(f"Error scheduling telemetry emission: {e}")

    async def close(self) -> None:
        """Close the aiohttp session."""
        if self._session and not self._session.closed:
            await self._session.close()
            logger.debug("Closed telemetry client session")


def get_telemetry_client() -> TelemetryClient:
    """
    Get singleton telemetry client instance.

    Returns:
        Global TelemetryClient instance.
    """
    global _telemetry_client_instance

    if _telemetry_client_instance is None:
        _telemetry_client_instance = TelemetryClient()
        logger.info("Initialized singleton telemetry client")

    return _telemetry_client_instance


__all__ = ["TelemetryClient", "get_telemetry_client"]
