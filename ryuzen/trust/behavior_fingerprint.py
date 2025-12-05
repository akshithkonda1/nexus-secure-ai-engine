"""Behavior fingerprint facade that can fall back to lightweight hashes."""
from __future__ import annotations

import hashlib
import importlib
import logging
from typing import List

_fingerprint_spec = importlib.util.find_spec("enterprise.trust.behavior_fingerprint")
_BehavioralFingerprintEngine = None
_BehaviorSignature = None  # type: ignore
if _fingerprint_spec:
    module = importlib.import_module("enterprise.trust.behavior_fingerprint")
    _BehavioralFingerprintEngine = getattr(module, "BehavioralFingerprintEngine", None)
    _BehaviorSignature = getattr(module, "BehaviorSignature", None)

logger = logging.getLogger(__name__)


class BehavioralFingerprintEngine:
    def __init__(self, provider: str = "", model: str = "", baseline=None):
        self._impl = (
            _BehavioralFingerprintEngine(provider, model, baseline)
            if _BehavioralFingerprintEngine
            else None
        )
        self.provider = provider
        self.model = model

    def analyze(self, tokens: List[str], text: str, embeddings: List[List[float]] | None = None, errors: List[str] | None = None, outputs: List[str] | None = None):
        embeddings = embeddings or []
        errors = errors or []
        outputs = outputs or []
        if self._impl:
            return self._impl.analyze(tokens, text, embeddings, errors, outputs)

        hasher = hashlib.blake2b(digest_size=16)
        hasher.update(" ".join(tokens).encode())
        hasher.update(text.encode())
        return {
            "signature": hasher.hexdigest(),
            "provider_vector": f"{self.provider}:{self.model}",
        }


BehaviorSignature = _BehaviorSignature or dict
