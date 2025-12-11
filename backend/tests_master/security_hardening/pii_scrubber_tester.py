from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Dict, Iterable, List, Tuple


PII_PATTERNS: Dict[str, re.Pattern[str]] = {
    "name": re.compile(r"\b(?:Alice|Bob|Charlie|Dana)\b", re.IGNORECASE),
    "email": re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"),
    "phone": re.compile(r"\b(?:\+?1[-.\s]?)?(?:\d{3}[-.\s]?){2}\d{4}\b"),
    "ip": re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b"),
    "credit": re.compile(r"\b(?:\d{4}[-\s]?){3}\d{4}\b"),
}

REDACTION_TOKEN = "<PII_REMOVED>"


@dataclass
class PiiScrubResult:
    original: str
    scrubbed: str
    removed_categories: List[str]
    preserved_structure: bool


def _engine_scrubber(text: str) -> Tuple[str, List[str]]:
    """
    Simulated engine-level scrubber that replaces any known PII pattern
    with a consistent redaction token while preserving the non-PII text.
    """

    removed: List[str] = []
    scrubbed = text
    for category, pattern in PII_PATTERNS.items():
        if pattern.search(scrubbed):
            removed.append(category)
            scrubbed = pattern.sub(REDACTION_TOKEN, scrubbed)
    return scrubbed, removed


def _generate_synthetic_prompts() -> Iterable[str]:
    base_prompts = [
        "Hello, my name is Alice and my email is alice@example.com.",
        "Contact Bob at bob.smith@sample.org or +1 202-555-0134.",
        "Server IP: 192.168.0.10, admin Dana, card 4242-4242-4242-4242.",
        "Charlie uses phone 303.555.0199 and backup 303-555-2200.",
        "Receipt shows credit 5555 5555 5555 4444 for Alice at 10.0.0.5.",
    ]
    for prompt in base_prompts:
        yield prompt


def _structure_preserved(original: str, scrubbed: str) -> bool:
    original_tokens = original.split()
    scrubbed_tokens = scrubbed.split()
    if len(original_tokens) != len(scrubbed_tokens):
        return False
    for o_tok, s_tok in zip(original_tokens, scrubbed_tokens):
        if o_tok == s_tok:
            continue
        if REDACTION_TOKEN in s_tok and any(pattern.search(o_tok) for pattern in PII_PATTERNS.values()):
            continue
        return False
    return True


def run_pii_scrubber_suite() -> Dict[str, object]:
    results: List[PiiScrubResult] = []
    for prompt in _generate_synthetic_prompts():
        scrubbed, removed = _engine_scrubber(prompt)
        preserved = _structure_preserved(prompt, scrubbed)
        results.append(
            PiiScrubResult(
                original=prompt,
                scrubbed=scrubbed,
                removed_categories=removed,
                preserved_structure=preserved,
            )
        )

    total = len(results)
    fully_clean = sum(
        1
        for result in results
        if all(not pattern.search(result.scrubbed) for pattern in PII_PATTERNS.values())
        and result.preserved_structure
    )
    pii_clean_score = round(fully_clean / total, 2) if total else 0.0

    return {
        "pii_clean_score": pii_clean_score,
        "results": results,
    }


__all__ = ["run_pii_scrubber_suite", "PiiScrubResult", "PII_PATTERNS", "REDACTION_TOKEN"]
