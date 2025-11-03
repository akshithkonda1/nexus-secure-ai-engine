"""Service layer for coordinating large language model debates."""
from __future__ import annotations

import hashlib
import json
import statistics
from dataclasses import dataclass
from typing import Iterable, List, Optional, Protocol

from pydantic import BaseModel, Field, ValidationError
from tenacity import RetryError, retry, stop_after_attempt, wait_exponential


class DebateRequest(BaseModel):
    """Pydantic model describing the expected request payload."""

    query: str = Field(..., min_length=1, max_length=8192)


class DebateResponseModel(BaseModel):
    """Internal representation of the debate response."""

    model: str
    text: str
    score: float = Field(..., ge=0.0, le=1.0)


class DebateResponse(BaseModel):
    """Shape of the API response."""

    responses: List[DebateResponseModel]
    consensus: str
    overall_score: float = Field(..., ge=0.0, le=1.0)
    query_hash: str


class ProviderClient(Protocol):
    """Protocol representing an LLM provider client."""

    name: str

    def generate(self, prompt: str) -> str:  # pragma: no cover - interface
        """Generate a completion from the provider."""


@dataclass
class ProviderResult:
    """Wraps responses from providers along with their computed scores."""

    model: str
    text: str
    score: float


class DebateService:
    """Encapsulates orchestration logic for multi-model debates."""

    CACHE_TTL_SECONDS = 600

    class DebateServiceError(RuntimeError):
        """Base error for the debate service."""

    class RetriableProviderError(DebateServiceError):
        """Raised when a provider call fails after retries."""

    def __init__(
        self,
        redis_client,
        llm_clients: Optional[Iterable[ProviderClient]] = None,
    ) -> None:
        self._redis = redis_client
        self._llm_clients = list(llm_clients) if llm_clients is not None else self._default_clients()

    def _default_clients(self) -> List[ProviderClient]:
        """Return a minimal set of default clients for development environments."""

        class EchoClient:
            name = "echo"

            def generate(self, prompt: str) -> str:
                return f"Echoing: {prompt}"

        class ReverseClient:
            name = "reverse"

            def generate(self, prompt: str) -> str:
                return f"Reverse: {prompt[::-1]}"

        return [EchoClient(), ReverseClient()]

    def hash_query(self, query: str) -> str:
        """Return a deterministic SHA-256 hash for the input query."""

        return hashlib.sha256(query.encode("utf-8")).hexdigest()

    def run_debate(self, query: str, beta_unlimited: bool) -> DebateResponse:
        """Execute a debate across multiple providers.

        Args:
            query: Original user query.
            beta_unlimited: Flag indicating beta unlimited mode (currently informational).
        """

        cache_key = f"debate:cache:{self.hash_query(query)}"
        cached_payload = self._redis.get(cache_key)
        if cached_payload:
            try:
                return DebateResponse.model_validate_json(cached_payload)
            except ValidationError:
                # Cached payload invalid, fall through to recompute.
                pass

        provider_results: List[ProviderResult] = []
        errors = []
        for client in self._llm_clients:
            try:
                text = self._call_with_retry(client, query)
                provider_results.append(ProviderResult(client.name, text, 0.0))
            except RetryError as exc:
                errors.append((client.name, exc))
                self._redis.lpush(
                    "debate:errors",
                    json.dumps(
                        {
                            "model": client.name,
                            "query_hash": self.hash_query(query),
                            "error": str(exc),
                        }
                    ),
                )
                self._redis.expire("debate:errors", self.CACHE_TTL_SECONDS)

        if len(provider_results) < 2:
            error_messages = ", ".join(name for name, _ in errors) or "unknown"
            raise self.RetriableProviderError(f"Unable to reach quorum across providers: {error_messages}")

        consensus_text, scored_results = self._score_results(provider_results)
        overall_score = statistics.mean(result.score for result in scored_results)

        response = DebateResponse(
            responses=[
                DebateResponseModel(model=result.model, text=result.text, score=result.score)
                for result in scored_results
            ],
            consensus=consensus_text,
            overall_score=overall_score,
            query_hash=self.hash_query(query),
        )

        cache_ttl = self.CACHE_TTL_SECONDS * (2 if beta_unlimited else 1)
        self._redis.setex(cache_key, cache_ttl, response.model_dump_json())
        return response

    def _call_with_retry(self, client: ProviderClient, prompt: str) -> str:
        """Call a provider with retry semantics."""

        @retry(wait=wait_exponential(multiplier=0.2, max=2), stop=stop_after_attempt(3))
        def _call() -> str:
            return client.generate(prompt)

        return _call()

    def _score_results(self, results: List[ProviderResult]) -> tuple[str, List[ProviderResult]]:
        """Compute consensus and confidence scores for provider results."""

        consensus_scores = {}
        for result in results:
            normalized = result.text.strip().lower()
            consensus_scores.setdefault(normalized, []).append(result)

        consensus_text = max(consensus_scores.items(), key=lambda item: len(item[1]))[1][0].text
        for result in results:
            normalized = result.text.strip().lower()
            agreement_count = len(consensus_scores.get(normalized, []))
            result.score = agreement_count / len(results)

        return consensus_text, results
