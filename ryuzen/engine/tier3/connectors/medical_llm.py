"""Medical LLM connector for specialized medical knowledge."""

import logging
import os
from typing import List, Optional
import aiohttp

from ..base import Tier3Connector, KnowledgeSnippet, SourceCategory

logger = logging.getLogger(__name__)


class MedicalLLMConnector(Tier3Connector):
    """
    Medical LLM connector for domain-specific medical AI.

    Supports multiple medical AI backends:
    - OpenAI with medical prompt engineering
    - Hugging Face medical models (BioGPT, ClinicalBERT)
    - Custom medical LLM endpoints

    This connector enhances medical queries with specialized prompting
    and domain knowledge.
    """

    # Hugging Face Inference API for medical models
    HF_API_BASE = "https://api-inference.huggingface.co/models"

    # Medical model options
    MODELS = {
        "biogpt": "microsoft/BioGPT-Large",
        "pubmedbert": "microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract",
        "biobert": "dmis-lab/biobert-v1.1",
    }

    def __init__(
        self,
        hf_token: Optional[str] = None,
        openai_key: Optional[str] = None,
        preferred_model: str = "biogpt"
    ):
        super().__init__(
            source_name="MedicalLLM",
            reliability=0.95,
            category=SourceCategory.MEDICAL,
            enabled=True,
            requires_api_key=True
        )
        self.hf_token = hf_token or os.environ.get("HUGGINGFACE_TOKEN")
        self.openai_key = openai_key or os.environ.get("OPENAI_API_KEY")
        self.preferred_model = preferred_model
        self._session = None

        if not self.hf_token and not self.openai_key:
            logger.warning("MedicalLLM: No API keys configured, connector will return empty results")

    async def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            headers = {}
            if self.hf_token:
                headers["Authorization"] = f"Bearer {self.hf_token}"
            self._session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=60),  # LLMs can be slow
                headers=headers
            )
        return self._session

    def _create_medical_prompt(self, query: str) -> str:
        """Create a medically-focused prompt."""
        return f"""As a medical knowledge assistant, provide accurate, evidence-based information about the following medical query. Include relevant clinical considerations, potential differential diagnoses if applicable, and note when professional medical consultation is recommended.

Query: {query}

Provide a concise, factual response based on current medical knowledge:"""

    async def fetch(self, query: str, max_results: int = 3) -> List[KnowledgeSnippet]:
        if not self.hf_token and not self.openai_key:
            logger.debug("MedicalLLM: No API keys configured")
            return []

        try:
            session = await self._get_session()
            snippets = []

            # Try Hugging Face medical models first
            if self.hf_token:
                model_id = self.MODELS.get(self.preferred_model, self.MODELS["biogpt"])

                payload = {
                    "inputs": self._create_medical_prompt(query),
                    "parameters": {
                        "max_new_tokens": 500,
                        "temperature": 0.3,  # Lower for factual responses
                        "do_sample": True,
                        "return_full_text": False
                    },
                    "options": {
                        "wait_for_model": True
                    }
                }

                try:
                    async with session.post(
                        f"{self.HF_API_BASE}/{model_id}",
                        json=payload
                    ) as response:
                        if response.status == 200:
                            data = await response.json()

                            if isinstance(data, list) and len(data) > 0:
                                generated_text = data[0].get("generated_text", "")

                                if generated_text and len(generated_text) > 50:
                                    # Clean up the response
                                    generated_text = generated_text.strip()

                                    content_parts = [f"Medical AI Analysis: {query[:100]}"]
                                    content_parts.append(f"Model: {self.preferred_model.upper()}")
                                    content_parts.append(f"\n{generated_text}")
                                    content_parts.append("\n\n⚠️ Disclaimer: This is AI-generated medical information. Always consult a healthcare professional for medical advice.")

                                    content = "\n".join(content_parts)

                                    snippet = KnowledgeSnippet(
                                        source_name=self.source_name,
                                        content=content[:1500],
                                        reliability=self.reliability,
                                        category=self.category,
                                        url="",
                                        metadata={
                                            "model": model_id,
                                            "query": query,
                                            "type": "medical_llm_response"
                                        }
                                    )
                                    snippets.append(snippet)

                        elif response.status == 503:
                            logger.debug(f"MedicalLLM: Model {model_id} is loading")
                        else:
                            logger.debug(f"MedicalLLM HF: {response.status}")

                except Exception as e:
                    logger.debug(f"MedicalLLM HF error: {e}")

            # Fallback to OpenAI if available and no results yet
            if not snippets and self.openai_key:
                try:
                    openai_headers = {
                        "Authorization": f"Bearer {self.openai_key}",
                        "Content-Type": "application/json"
                    }

                    payload = {
                        "model": "gpt-4o-mini",
                        "messages": [
                            {
                                "role": "system",
                                "content": "You are a medical knowledge assistant. Provide accurate, evidence-based medical information. Always recommend consulting healthcare professionals for medical advice."
                            },
                            {
                                "role": "user",
                                "content": query
                            }
                        ],
                        "max_tokens": 500,
                        "temperature": 0.3
                    }

                    async with session.post(
                        "https://api.openai.com/v1/chat/completions",
                        json=payload,
                        headers=openai_headers
                    ) as response:
                        if response.status == 200:
                            data = await response.json()
                            choices = data.get("choices", [])

                            if choices:
                                message = choices[0].get("message", {})
                                generated_text = message.get("content", "")

                                if generated_text:
                                    content_parts = [f"Medical AI Analysis: {query[:100]}"]
                                    content_parts.append("Model: GPT-4o-mini (Medical Mode)")
                                    content_parts.append(f"\n{generated_text}")
                                    content_parts.append("\n\n⚠️ Disclaimer: This is AI-generated medical information. Always consult a healthcare professional.")

                                    content = "\n".join(content_parts)

                                    snippet = KnowledgeSnippet(
                                        source_name=self.source_name,
                                        content=content[:1500],
                                        reliability=self.reliability,
                                        category=self.category,
                                        url="",
                                        metadata={
                                            "model": "gpt-4o-mini",
                                            "query": query,
                                            "type": "medical_llm_response"
                                        }
                                    )
                                    snippets.append(snippet)

                except Exception as e:
                    logger.debug(f"MedicalLLM OpenAI error: {e}")

            self._record_success()
            return snippets[:max_results]

        except Exception as e:
            logger.error(f"MedicalLLM error: {e}")
            self._record_error()
            return []

    async def close(self):
        if self._session and not self._session.closed:
            await self._session.close()
