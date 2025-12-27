"""Medical LLM connector using AWS Bedrock for specialized medical knowledge."""

import json
import logging
import os
from typing import List, Optional

from ..base import Tier3Connector, KnowledgeSnippet, SourceCategory

logger = logging.getLogger(__name__)

# Try to import boto3 for AWS Bedrock
try:
    import boto3
    from botocore.config import Config
    BOTO3_AVAILABLE = True
except ImportError:
    BOTO3_AVAILABLE = False
    logger.warning("boto3 not available - MedicalLLM Bedrock support disabled")


class MedicalLLMConnector(Tier3Connector):
    """
    Medical LLM connector using AWS Bedrock for domain-specific medical AI.

    Primary: AWS Bedrock with Claude for medical knowledge
    Fallback: HuggingFace medical models (BioGPT, ClinicalBERT)

    This connector enhances medical queries with specialized prompting
    and domain knowledge from medically-trained AI models.
    """

    # AWS Bedrock model IDs for medical use
    BEDROCK_MODELS = {
        "claude-sonnet": "anthropic.claude-3-sonnet-20240229-v1:0",
        "claude-haiku": "anthropic.claude-3-haiku-20240307-v1:0",
        "titan": "amazon.titan-text-express-v1",
    }

    # Hugging Face Inference API for medical models (fallback)
    HF_API_BASE = "https://api-inference.huggingface.co/models"
    HF_MODELS = {
        "biogpt": "microsoft/BioGPT-Large",
        "pubmedbert": "microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract",
    }

    def __init__(
        self,
        bedrock_region: Optional[str] = None,
        bedrock_model: str = "claude-sonnet",
        hf_token: Optional[str] = None,
    ):
        super().__init__(
            source_name="MedicalLLM",
            reliability=0.95,
            category=SourceCategory.MEDICAL,
            enabled=True,
            requires_api_key=True,
            rate_limit_per_minute=30
        )

        # AWS Bedrock configuration
        self.bedrock_region = bedrock_region or os.environ.get("AWS_REGION", "us-east-1")
        self.bedrock_model = bedrock_model
        self._bedrock_client = None

        # HuggingFace fallback
        self.hf_token = hf_token or os.environ.get("HUGGINGFACE_TOKEN")
        self._session = None

        # Check if Bedrock is available
        self.bedrock_available = BOTO3_AVAILABLE
        if not self.bedrock_available:
            logger.warning("MedicalLLM: AWS Bedrock not available, will use HuggingFace fallback")

    def _get_bedrock_client(self):
        """Get or create Bedrock runtime client."""
        if not BOTO3_AVAILABLE:
            return None

        if self._bedrock_client is None:
            try:
                config = Config(
                    region_name=self.bedrock_region,
                    retries={'max_attempts': 3, 'mode': 'adaptive'}
                )
                self._bedrock_client = boto3.client(
                    'bedrock-runtime',
                    config=config
                )
                logger.info(f"MedicalLLM: Bedrock client initialized (region={self.bedrock_region})")
            except Exception as e:
                logger.error(f"MedicalLLM: Failed to create Bedrock client: {e}")
                self._bedrock_client = None

        return self._bedrock_client

    def _create_medical_system_prompt(self) -> str:
        """Create medical-focused system prompt."""
        return """You are a medical knowledge assistant with expertise in clinical medicine,
pharmacology, and evidence-based healthcare. Your responses should:

1. Provide accurate, evidence-based medical information
2. Include relevant clinical considerations and differential diagnoses when applicable
3. Cite current medical guidelines and research when possible
4. Clearly distinguish between established medical facts and areas of ongoing research
5. Always recommend consulting a healthcare professional for personalized medical advice

Important: You are providing medical information, not medical advice.
Always encourage users to consult with qualified healthcare providers."""

    def _create_medical_prompt(self, query: str) -> str:
        """Create a medically-focused user prompt."""
        return f"""Please provide accurate, evidence-based medical information about the following query.
Include relevant clinical considerations, potential differential diagnoses if applicable,
and note when professional medical consultation is recommended.

Medical Query: {query}

Provide a concise, factual response based on current medical knowledge:"""

    async def _fetch_from_bedrock(self, query: str) -> Optional[KnowledgeSnippet]:
        """Fetch medical knowledge from AWS Bedrock."""
        client = self._get_bedrock_client()
        if not client:
            return None

        model_id = self.BEDROCK_MODELS.get(self.bedrock_model, self.BEDROCK_MODELS["claude-sonnet"])

        try:
            # Prepare request based on model type
            if "anthropic.claude" in model_id:
                request_body = {
                    "anthropic_version": "bedrock-2023-05-31",
                    "max_tokens": 1024,
                    "temperature": 0.3,  # Lower for factual medical responses
                    "system": self._create_medical_system_prompt(),
                    "messages": [
                        {
                            "role": "user",
                            "content": self._create_medical_prompt(query)
                        }
                    ]
                }
            elif "amazon.titan" in model_id:
                request_body = {
                    "inputText": f"{self._create_medical_system_prompt()}\n\n{self._create_medical_prompt(query)}",
                    "textGenerationConfig": {
                        "maxTokenCount": 1024,
                        "temperature": 0.3,
                        "topP": 0.9
                    }
                }
            else:
                logger.warning(f"MedicalLLM: Unknown model format for {model_id}")
                return None

            # Invoke Bedrock (synchronous call wrapped for async)
            import asyncio
            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: client.invoke_model(
                    modelId=model_id,
                    body=json.dumps(request_body),
                    contentType="application/json",
                    accept="application/json"
                )
            )

            # Parse response based on model type
            response_body = json.loads(response['body'].read())

            if "anthropic.claude" in model_id:
                generated_text = response_body.get("content", [{}])[0].get("text", "")
            elif "amazon.titan" in model_id:
                generated_text = response_body.get("results", [{}])[0].get("outputText", "")
            else:
                generated_text = ""

            if generated_text and len(generated_text) > 50:
                content_parts = [
                    f"Medical AI Analysis: {query[:100]}",
                    f"Source: AWS Bedrock ({self.bedrock_model.upper()})",
                    "",
                    generated_text.strip(),
                    "",
                    "⚠️ Disclaimer: This is AI-generated medical information. "
                    "Always consult a healthcare professional for medical advice."
                ]

                return KnowledgeSnippet(
                    source_name=self.source_name,
                    content="\n".join(content_parts)[:2000],
                    reliability=self.reliability,
                    category=self.category,
                    url="",
                    metadata={
                        "model": model_id,
                        "provider": "aws_bedrock",
                        "query": query,
                        "type": "medical_llm_response"
                    }
                )

        except Exception as e:
            logger.warning(f"MedicalLLM Bedrock error: {e}")

        return None

    async def _fetch_from_huggingface(self, query: str) -> Optional[KnowledgeSnippet]:
        """Fallback: Fetch from HuggingFace medical models."""
        if not self.hf_token:
            return None

        try:
            import aiohttp

            if self._session is None or self._session.closed:
                headers = {"Authorization": f"Bearer {self.hf_token}"}
                self._session = aiohttp.ClientSession(
                    timeout=aiohttp.ClientTimeout(total=60),
                    headers=headers
                )

            model_id = self.HF_MODELS["biogpt"]
            payload = {
                "inputs": self._create_medical_prompt(query),
                "parameters": {
                    "max_new_tokens": 500,
                    "temperature": 0.3,
                    "do_sample": True,
                    "return_full_text": False
                },
                "options": {"wait_for_model": True}
            }

            async with self._session.post(
                f"{self.HF_API_BASE}/{model_id}",
                json=payload
            ) as response:
                if response.status == 200:
                    data = await response.json()

                    if isinstance(data, list) and len(data) > 0:
                        generated_text = data[0].get("generated_text", "")

                        if generated_text and len(generated_text) > 50:
                            content_parts = [
                                f"Medical AI Analysis: {query[:100]}",
                                "Source: BioGPT (HuggingFace)",
                                "",
                                generated_text.strip(),
                                "",
                                "⚠️ Disclaimer: This is AI-generated medical information. "
                                "Always consult a healthcare professional for medical advice."
                            ]

                            return KnowledgeSnippet(
                                source_name=self.source_name,
                                content="\n".join(content_parts)[:1500],
                                reliability=self.reliability * 0.9,  # Slightly lower for fallback
                                category=self.category,
                                url="",
                                metadata={
                                    "model": model_id,
                                    "provider": "huggingface",
                                    "query": query,
                                    "type": "medical_llm_response"
                                }
                            )

        except Exception as e:
            logger.debug(f"MedicalLLM HuggingFace error: {e}")

        return None

    async def fetch(self, query: str, max_results: int = 3) -> List[KnowledgeSnippet]:
        """
        Fetch medical knowledge using AWS Bedrock (primary) or HuggingFace (fallback).

        Args:
            query: Medical query to process
            max_results: Maximum number of results (typically 1 for LLM responses)

        Returns:
            List containing the medical AI response
        """
        snippets = []

        try:
            # Primary: Try AWS Bedrock
            if self.bedrock_available:
                snippet = await self._fetch_from_bedrock(query)
                if snippet:
                    snippets.append(snippet)
                    self._record_success()
                    logger.debug(f"MedicalLLM: Got response from Bedrock ({self.bedrock_model})")
                    return snippets

            # Fallback: Try HuggingFace
            if self.hf_token:
                snippet = await self._fetch_from_huggingface(query)
                if snippet:
                    snippets.append(snippet)
                    self._record_success()
                    logger.debug("MedicalLLM: Got response from HuggingFace fallback")
                    return snippets

            # No results from either provider
            if not snippets:
                logger.debug("MedicalLLM: No API keys configured or all providers failed")
                self._record_error()

            return snippets

        except Exception as e:
            logger.error(f"MedicalLLM error: {e}")
            self._record_error()
            return []

    async def close(self):
        """Close any open connections."""
        if self._session and not self._session.closed:
            await self._session.close()
        # Bedrock client doesn't need explicit closing
