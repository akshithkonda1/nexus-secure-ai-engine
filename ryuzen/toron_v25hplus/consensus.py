"""Consensus scoring calibration utilities."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, List, Sequence, Tuple

import numpy as np


@dataclass
class ConsensusWeights:
    agreement_weight: float
    stability_weight: float
    evidence_weight: float
    opus_weight: float


DEFAULT_WEIGHTS = ConsensusWeights(
    agreement_weight=0.35,
    stability_weight=0.25,
    evidence_weight=0.25,
    opus_weight=0.15,
)


def fit_weights(features: Sequence[Sequence[float]], ground_truth: Sequence[float]) -> ConsensusWeights:
    """Fit consensus weights using linear regression.

    Args:
        features: sequence of feature vectors ``[agreement, stability, evidence, opus]``.
        ground_truth: human annotated scores to regress against.
    """

    matrix = np.array(features)
    y = np.array(ground_truth)
    coeffs, *_ = np.linalg.lstsq(matrix, y, rcond=None)
    return ConsensusWeights(
        agreement_weight=float(coeffs[0]),
        stability_weight=float(coeffs[1]),
        evidence_weight=float(coeffs[2]),
        opus_weight=float(coeffs[3]),
    )


def weighted_score(weights: ConsensusWeights, features: Sequence[float]) -> float:
    agreement, stability, evidence, opus = features
    raw = (
        weights.agreement_weight * agreement
        + weights.stability_weight * stability
        + weights.evidence_weight * evidence
        + weights.opus_weight * opus
    )
    return max(0.0, min(100.0, raw))

