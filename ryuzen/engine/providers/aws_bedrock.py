"""
AWS Bedrock provider for TORON v2.5h+

Supports Claude, Llama, Mistral, Cohere, and other Bedrock-hosted models.
"""

from __future__ import annotations

import hashlib
import json
import logging
import time
from typing import Any, Dict, Optional

import boto3
from botocore.config import Config

from .base import BaseProvider, ProviderConfig, ProviderResponse

logger = logging.getLogger("ryuzen.providers.aws_bedrock")


class AWSBedrockProvider(BaseProvider):
    """
    AWS Bedrock provider supporting multiple foundation models.

    Supported models:
    - Claude (Anthropic): claude-3-5-sonnet, claude-3-opus, claude-3-haiku
    - Llama 3.2 (Meta): meta.llama3-2-*
    - Mistral Large: mistral.mistral-large-*
    - Cohere Command R+: cohere.command-r-plus-*
    """

    # Model ID mappings for Bedrock
    BEDROCK_MODEL_MAP = {
        "Claude-Sonnet-4.5": "anthropic.claude-3-5-sonnet-20241022-v2:0",
        "Claude-Opus-4": "anthropic.claude-3-opus-20240229-v1:0",
        "Meta-Llama-3.2": "meta.llama3-2-90b-instruct-v1:0",
        "Mistral-Large": "mistral.mistral-large-2407-v1:0",
        "Cohere-CommandR+": "cohere.command-r-plus-v1:0",
    }

    def __init__(self, config: ProviderConfig, boto_session: Optional[boto3.Session] = None):
        super().__init__(config)

        # Use provided session or create default
        self._session = boto_session or boto3.Session(region_name=config.region)

        # Configure client with retries and timeouts
        boto_config = Config(
            retries={"max_attempts": 3, "mode": "adaptive"},
            connect_timeout=5,
            read_timeout=config.timeout_seconds,
        )

        self._client = self._session.client("bedrock-runtime", config=boto_config)

    async def generate(self, prompt: str) -> ProviderResponse:
        """Generate response using AWS Bedrock."""
        start_time = time.time()

        try:
            # Build request body based on model type
            body = self._build_request_body(prompt)

            # Invoke model
            response = self._client.invoke_model(
                modelId=self.model_id,
                body=json.dumps(body),
                contentType="application/json",
                accept="application/json",
            )

            # Parse response
            response_body = json.loads(response["body"].read())
            content = self._extract_content(response_body)
            tokens_used = self._extract_token_count(response_body)

            latency_ms = int((time.time() - start_time) * 1000)
            self._record_success(latency_ms)

            # Compute fingerprint
            fingerprint = hashlib.sha256(content.encode()).hexdigest()[:16]

            # Estimate confidence based on model and response characteristics
            confidence = self._estimate_confidence(content, response_body)

            return ProviderResponse(
                model=self.model_name,
                content=content,
                confidence=confidence,
                latency_ms=latency_ms,
                tokens_used=tokens_used,
                fingerprint=fingerprint,
                metadata={
                    "provider": "aws_bedrock",
                    "model_id": self.model_id,
                    "region": self.config.region,
                },
            )

        except Exception as e:
            self._record_error()
            logger.error(f"Bedrock generation failed for {self.model_name}: {e}")
            raise RuntimeError(f"Bedrock generation failed: {e}") from e

    async def health_check(self) -> bool:
        """Check Bedrock connectivity."""
        try:
            # Simple list operation to verify connectivity
            self._client.list_foundation_models(byProvider="anthropic")
            return True
        except Exception as e:
            logger.warning(f"Bedrock health check failed: {e}")
            return False

    def _build_request_body(self, prompt: str) -> Dict[str, Any]:
        """Build model-specific request body."""
        if "anthropic" in self.model_id:
            return {
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": self.config.max_tokens,
                "temperature": self.config.temperature,
                "messages": [{"role": "user", "content": prompt}],
            }
        elif "meta.llama" in self.model_id:
            return {
                "prompt": f"<|begin_of_text|><|start_header_id|>user<|end_header_id|>\n\n{prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n",
                "max_gen_len": self.config.max_tokens,
                "temperature": self.config.temperature,
            }
        elif "mistral" in self.model_id:
            return {
                "prompt": f"<s>[INST] {prompt} [/INST]",
                "max_tokens": self.config.max_tokens,
                "temperature": self.config.temperature,
            }
        elif "cohere" in self.model_id:
            return {
                "message": prompt,
                "max_tokens": self.config.max_tokens,
                "temperature": self.config.temperature,
            }
        else:
            # Generic fallback
            return {
                "prompt": prompt,
                "max_tokens": self.config.max_tokens,
                "temperature": self.config.temperature,
            }

    def _extract_content(self, response_body: Dict[str, Any]) -> str:
        """Extract content from model-specific response."""
        if "content" in response_body:
            # Claude format
            content_list = response_body.get("content", [])
            if content_list and isinstance(content_list[0], dict):
                return content_list[0].get("text", "")
            return str(content_list)
        elif "generation" in response_body:
            # Llama/Mistral format
            return response_body["generation"]
        elif "text" in response_body:
            # Cohere format
            return response_body["text"]
        elif "outputs" in response_body:
            # Some models return outputs array
            outputs = response_body["outputs"]
            if outputs:
                return outputs[0].get("text", str(outputs[0]))
        return str(response_body)

    def _extract_token_count(self, response_body: Dict[str, Any]) -> int:
        """Extract token count from response."""
        if "usage" in response_body:
            usage = response_body["usage"]
            return usage.get("output_tokens", 0) + usage.get("input_tokens", 0)
        elif "token_count" in response_body:
            return response_body["token_count"]
        # Estimate based on content length
        content = self._extract_content(response_body)
        return len(content.split()) * 2  # Rough estimate

    def _estimate_confidence(self, content: str, response_body: Dict[str, Any]) -> float:
        """Estimate confidence based on response characteristics."""
        base_confidence = 0.85

        # Adjust based on response length (very short responses may be less reliable)
        word_count = len(content.split())
        if word_count < 10:
            base_confidence -= 0.1
        elif word_count > 200:
            base_confidence += 0.05

        # Adjust based on stop reason if available
        stop_reason = response_body.get("stop_reason", "")
        if stop_reason == "end_turn":
            base_confidence += 0.05
        elif stop_reason == "max_tokens":
            base_confidence -= 0.1

        return min(1.0, max(0.0, base_confidence))
