"""Mock compliance suite for simulation."""
from __future__ import annotations

from typing import Iterable


class MockComplianceSuite:
    """Simulated compliance checks for HIPAA, PII, and GovCloud rules."""

    pii_markers = {"ssn", "social security", "passport", "credit card"}
    hipaa_markers = {"patient", "medical record", "diagnosis"}
    govcloud_markers = {"export", "classification", "federal"}

    def _has_marker(self, text: str, markers: Iterable[str]) -> bool:
        lower = text.lower()
        return any(marker in lower for marker in markers)

    def hipaa(self, text: str) -> bool:
        return not self._has_marker(text, self.hipaa_markers)

    def pii(self, text: str) -> bool:
        return not self._has_marker(text, self.pii_markers)

    def govcloud(self, text: str) -> bool:
        return not self._has_marker(text, self.govcloud_markers)
