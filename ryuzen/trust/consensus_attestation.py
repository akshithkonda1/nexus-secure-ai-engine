"""Consensus attestation shim with graceful degradation."""
from __future__ import annotations

import importlib
import logging
from typing import Dict, List

_consensus_spec = importlib.util.find_spec("enterprise.trust.consensus_attestation")
_ConsensusAttestation = None
if _consensus_spec:
    _ConsensusAttestation = importlib.import_module("enterprise.trust.consensus_attestation").ConsensusAttestation

logger = logging.getLogger(__name__)


class ConsensusAttestation:
    def __init__(self):
        self._impl = _ConsensusAttestation() if _ConsensusAttestation else None

    def attest(self, outputs: List[str], rationales: List[str] | None = None, scores: List[float] | None = None, vectors: List[List[float]] | None = None) -> Dict[str, object]:
        rationales = rationales or []
        scores = scores or []
        vectors = vectors or []
        if self._impl:
            return self._impl.attest(outputs, rationales, scores, vectors)

        logger.debug("Consensus attestation unavailable; returning unsigned payload")
        return {
            "outputs": outputs,
            "reasons_for_disagreement": rationales,
            "confidence": 0.0,
            "divergence": 0.0,
            "signature": None,
            "public_key": None,
        }
