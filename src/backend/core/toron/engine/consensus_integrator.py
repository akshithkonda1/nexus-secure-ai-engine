"""Consensus integration across model outputs and web validation."""
from __future__ import annotations

import math
from collections import Counter, defaultdict
from typing import Any, Dict, List

from pydantic import BaseModel, field_validator

from src.backend.core.toron.engine.web_validator import ValidationResult


class ToronConsensus(BaseModel):
    """Final consensus payload returned by the Toron engine."""

    final_answer: str
    model_consensus_score: float
    web_validation_score: float
    composite_confidence: float
    evidence_used: Dict[str, str]
    contradicting_models: List[str]
    reasoning_trace: Dict[str, Any]

    @field_validator("model_consensus_score", "web_validation_score", "composite_confidence")
    @classmethod
    def clamp_score(cls, value: float) -> float:
        return max(0.0, min(1.0, round(value, 4)))

    @field_validator("final_answer")
    @classmethod
    def normalize_answer(cls, value: str) -> str:
        return value.strip()


def _tfidf_scores(model_outputs: Dict[str, str]) -> Dict[str, float]:
    corpus_tokens: List[List[str]] = []
    for content in model_outputs.values():
        tokens = [tok.lower() for tok in content.split() if len(tok) > 2]
        corpus_tokens.append(tokens)

    df: Counter = Counter()
    for tokens in corpus_tokens:
        df.update(set(tokens))

    scores: Dict[str, float] = {}
    total_docs = len(corpus_tokens) or 1
    for model, content in model_outputs.items():
        tokens = [tok.lower() for tok in content.split() if len(tok) > 2]
        tf = Counter(tokens)
        tfidf = sum((freq / max(len(tokens), 1)) * math.log(total_docs / (1 + df[token])) for token, freq in tf.items())
        scores[model] = tfidf
    return scores


def _semantic_similarity(reference: str, candidate: str) -> float:
    ref_tokens = Counter(reference.lower().split())
    cand_tokens = Counter(candidate.lower().split())
    common = set(ref_tokens.keys()) & set(cand_tokens.keys())
    numerator = sum(ref_tokens[t] * cand_tokens[t] for t in common)
    denom = math.sqrt(sum(v * v for v in ref_tokens.values()) * sum(v * v for v in cand_tokens.values()))
    if denom == 0:
        return 0.0
    return numerator / denom


def integrate_consensus(
    model_outputs: Dict[str, str],
    validation: ValidationResult,
    model_reliability: Dict[str, float] | None = None,
) -> ToronConsensus:
    """Blend model outputs, validation signals, and reliability history into a single answer."""

    model_reliability = model_reliability or defaultdict(lambda: 0.5)
    tfidf_scores = _tfidf_scores(model_outputs)

    consensus_scores: Dict[str, float] = {}
    baseline = next(iter(model_outputs.values()), "")
    for model, content in model_outputs.items():
        reliability = model_reliability.get(model, 0.5)
        similarity = _semantic_similarity(baseline, content)
        tfidf = tfidf_scores.get(model, 0.0)
        validation_bonus = 0.0
        for fact in validation.supported:
            if fact.fact.source_model == model:
                validation_bonus += fact.confidence * 0.1
        hallucination_penalty = sum(1 for fact in validation.contradicted if fact.fact.source_model == model) * 0.05
        score = max(0.0, reliability * 0.5 + similarity * 0.3 + tfidf * 0.1 + validation_bonus - hallucination_penalty)
        consensus_scores[model] = round(score, 4)

    ranked_models = sorted(consensus_scores.items(), key=lambda item: item[1], reverse=True)
    top_model = ranked_models[0][0] if ranked_models else ""
    final_answer = model_outputs.get(top_model, next(iter(model_outputs.values()), ""))

    contradiction_sources = list({fact.fact.source_model for fact in validation.contradicted})
    web_score = validation.confidence
    model_score = sum(consensus_scores.values()) / max(len(consensus_scores), 1)
    composite = min(1.0, (model_score * 0.6) + (web_score * 0.4))

    reasoning_trace: Dict[str, Any] = {
        "model_scores": consensus_scores,
        "tfidf": tfidf_scores,
        "web_validation": validation.model_dump(),
    }

    return ToronConsensus(
        final_answer=final_answer,
        model_consensus_score=model_score,
        web_validation_score=web_score,
        composite_confidence=composite,
        evidence_used=validation.web_evidence,
        contradicting_models=contradiction_sources,
        reasoning_trace=reasoning_trace,
    )
