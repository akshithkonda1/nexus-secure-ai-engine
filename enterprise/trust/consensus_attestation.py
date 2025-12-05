"""
Consensus attestation engine computing divergence and signing outputs.
"""
from __future__ import annotations

import json
import numpy as np
from typing import List, Dict

from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from cryptography.hazmat.primitives import serialization


class ConsensusAttestation:
    def __init__(self):
        self.key = Ed25519PrivateKey.generate()

    def compute_confidence(self, scores: List[float]) -> float:
        if not scores:
            return 0.0
        return float(np.mean(scores) * (1 - np.std(scores)))

    def divergence(self, vectors: List[List[float]]) -> float:
        if len(vectors) < 2:
            return 0.0
        matrix = np.array(vectors)
        mean = matrix.mean(axis=0)
        return float(np.mean(np.linalg.norm(matrix - mean, axis=1)))

    def attest(self, outputs: List[str], rationales: List[str], scores: List[float], vectors: List[List[float]]) -> Dict[str, object]:
        confidence = self.compute_confidence(scores)
        divergence_score = self.divergence(vectors)
        reasons = [r for r in rationales if r]
        payload = {
            "outputs": outputs,
            "reasons_for_disagreement": reasons,
            "confidence": confidence,
            "divergence": divergence_score,
        }
        signature = self.key.sign(json.dumps(payload, sort_keys=True).encode()).hex()
        return {**payload, "signature": signature, "public_key": self.public_key()}

    def public_key(self) -> str:
        return (
            self.key.public_key()
            .public_bytes(encoding=serialization.Encoding.PEM, format=serialization.PublicFormat.SubjectPublicKeyInfo)
            .decode()
        )
