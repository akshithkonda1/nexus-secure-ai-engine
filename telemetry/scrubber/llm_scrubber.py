"""
LLM-based PII scrubber using Claude Sonnet 4 via AWS Bedrock.

This module provides contextual PII detection that catches edge cases
missed by regex patterns, such as:
- Personal names in context
- Company names (excluding Fortune 500)
- Contextual identifying information
- Medical and financial data
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
from typing import Any, Dict, List, Optional, Tuple

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)

# Singleton instance
_llm_scrubber_instance: Optional[LLMScrubber] = None

# Fortune 500 companies (abbreviated list - expand in production)
FORTUNE_500_COMPANIES = {
    "apple", "microsoft", "amazon", "google", "alphabet", "meta", "facebook",
    "tesla", "nvidia", "berkshire hathaway", "jpmorgan chase", "johnson & johnson",
    "visa", "walmart", "exxon mobil", "unitedhealth", "procter & gamble",
    "mastercard", "home depot", "chevron", "pfizer", "abbvie", "merck",
    "costco", "pepsico", "coca-cola", "adobe", "netflix", "salesforce",
    "cisco", "intel", "ibm", "oracle", "qualcomm", "amd", "paypal",
    # Add more as needed
}


class LLMScrubber:
    """
    LLM-based PII scrubber using Claude Sonnet 4 via AWS Bedrock.

    Provides contextual PII detection beyond simple regex patterns.
    """

    def __init__(self):
        """Initialize LLM scrubber."""
        self.enabled = os.getenv("LLM_SCRUBBING_ENABLED", "true").lower() == "true"
        self.model_id = "anthropic.claude-sonnet-4-20250514"
        self.timeout = 30  # seconds
        self._bedrock_client: Optional[Any] = None

        if not self.enabled:
            logger.info("LLM scrubbing disabled via LLM_SCRUBBING_ENABLED=false")

    def _get_bedrock_client(self):
        """Get or create Bedrock runtime client."""
        if self._bedrock_client is None:
            # Configure with timeout
            config = Config(
                read_timeout=self.timeout,
                connect_timeout=10,
                retries={'max_attempts': 2}
            )
            self._bedrock_client = boto3.client(
                "bedrock-runtime",
                config=config
            )
            logger.debug("Created Bedrock runtime client")

        return self._bedrock_client

    def _build_prompt(self, data: Dict[str, Any]) -> str:
        """
        Build prompt for LLM PII detection.

        Args:
            data: Telemetry data to analyze

        Returns:
            Formatted prompt string
        """
        data_str = json.dumps(data, indent=2)

        prompt = f"""You are a privacy compliance assistant. Analyze this telemetry data and identify ANY personally identifiable information (PII), including:

- Personal names (full names, first names in context)
- Company names (unless Fortune 500 / widely known public companies)
- Email addresses
- Phone numbers
- Physical addresses (more specific than city/state)
- Social security numbers
- Medical information
- Financial account numbers
- IP addresses
- Device identifiers
- Any other identifying information

Fortune 500 companies like Apple, Microsoft, Amazon, Google, etc. are acceptable and should NOT be redacted.

Return a JSON object with:
1. "has_pii": boolean indicating if PII was found
2. "scrubbed_data": the data with ALL PII replaced with [REDACTED]
3. "violations": list of PII types found (e.g., ["personal_name", "email", "company_name"])

Telemetry data:
{data_str}

Respond ONLY with valid JSON, no other text."""

        return prompt

    def _parse_llm_response(self, response_text: str) -> Tuple[Dict[str, Any], bool, List[str]]:
        """
        Parse LLM response and extract scrubbed data.

        Args:
            response_text: Raw response from LLM

        Returns:
            Tuple of (scrubbed_data, violation_flag, violations)
        """
        try:
            # Parse JSON response
            result = json.loads(response_text)

            has_pii = result.get("has_pii", False)
            scrubbed_data = result.get("scrubbed_data", {})
            violations = result.get("violations", [])

            return scrubbed_data, has_pii, violations

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM response as JSON: {e}")
            logger.debug(f"Raw response: {response_text[:500]}")
            # Conservative approach: mark as violation on parse error
            return {}, True, ["parse_error"]
        except Exception as e:
            logger.exception(f"Unexpected error parsing LLM response: {e}")
            return {}, True, ["parse_error"]

    async def scrub_async(self, data: Dict[str, Any]) -> Tuple[Dict[str, Any], bool]:
        """
        Async LLM-based PII scrubbing.

        Args:
            data: Telemetry data dictionary

        Returns:
            Tuple of (scrubbed_data, violation_flag)
        """
        if not self.enabled:
            return data, False

        try:
            # Build prompt
            prompt = self._build_prompt(data)

            # Prepare Bedrock request
            bedrock_client = self._get_bedrock_client()

            request_body = {
                "anthropic_version": "bedrock-2023-05-31",
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "max_tokens": 4096,
                "temperature": 0.0,  # Deterministic for consistency
            }

            # Invoke model (sync call in executor to avoid blocking)
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: bedrock_client.invoke_model(
                    modelId=self.model_id,
                    body=json.dumps(request_body),
                    contentType="application/json",
                    accept="application/json",
                )
            )

            # Parse response
            response_body = json.loads(response["body"].read())
            content = response_body.get("content", [])

            if not content:
                logger.error("Empty content in Bedrock response")
                return data, True  # Conservative: mark as violation

            # Extract text from first content block
            response_text = content[0].get("text", "")

            # Parse LLM response
            scrubbed_data, has_pii, violations = self._parse_llm_response(response_text)

            if has_pii:
                logger.warning(f"LLM detected PII: {violations}")
                return scrubbed_data, True
            else:
                logger.debug("LLM scrubbing: No PII detected")
                return data, False

        except ClientError as e:
            error_code = e.response.get("Error", {}).get("Code", "Unknown")
            logger.error(f"Bedrock API error: {error_code}")
            # Conservative: mark as violation on error
            return data, True

        except asyncio.TimeoutError:
            logger.error("LLM scrubbing timed out")
            return data, True

        except Exception as e:
            logger.exception(f"Unexpected error in LLM scrubbing: {e}")
            return data, True

    def scrub_sync(self, data: Dict[str, Any]) -> Tuple[Dict[str, Any], bool]:
        """
        Synchronous LLM-based PII scrubbing.

        Args:
            data: Telemetry data dictionary

        Returns:
            Tuple of (scrubbed_data, violation_flag)
        """
        if not self.enabled:
            return data, False

        try:
            # Build prompt
            prompt = self._build_prompt(data)

            # Prepare Bedrock request
            bedrock_client = self._get_bedrock_client()

            request_body = {
                "anthropic_version": "bedrock-2023-05-31",
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "max_tokens": 4096,
                "temperature": 0.0,
            }

            # Invoke model synchronously
            response = bedrock_client.invoke_model(
                modelId=self.model_id,
                body=json.dumps(request_body),
                contentType="application/json",
                accept="application/json",
            )

            # Parse response
            response_body = json.loads(response["body"].read())
            content = response_body.get("content", [])

            if not content:
                logger.error("Empty content in Bedrock response")
                return data, True

            response_text = content[0].get("text", "")

            # Parse LLM response
            scrubbed_data, has_pii, violations = self._parse_llm_response(response_text)

            if has_pii:
                logger.warning(f"LLM detected PII: {violations}")
                return scrubbed_data, True
            else:
                logger.debug("LLM scrubbing: No PII detected")
                return data, False

        except ClientError as e:
            error_code = e.response.get("Error", {}).get("Code", "Unknown")
            logger.error(f"Bedrock API error: {error_code}")
            return data, True

        except Exception as e:
            logger.exception(f"Unexpected error in LLM scrubbing: {e}")
            return data, True


def get_llm_scrubber() -> LLMScrubber:
    """
    Get singleton LLM scrubber instance.

    Returns:
        Global LLMScrubber instance.
    """
    global _llm_scrubber_instance

    if _llm_scrubber_instance is None:
        _llm_scrubber_instance = LLMScrubber()
        logger.info("Initialized singleton LLM scrubber")

    return _llm_scrubber_instance


__all__ = ["LLMScrubber", "get_llm_scrubber"]
