import hashlib
from typing import List


class FusionUtils:
    @staticmethod
    def normalize(text: str) -> str:
        return (
            text.lower()
            .replace(",", "")
            .replace(".", "")
            .replace("the ", "")
            .replace(" a ", " ")
            .replace(" an ", " ")
            .strip()
        )

    @staticmethod
    def fingerprint(text: str, size: int = 16) -> str:
        return hashlib.sha256(FusionUtils.normalize(text).encode()).hexdigest()[:size]

    @staticmethod
    def tfidf_score(query: str, candidate: str) -> float:
        """Lightweight TF-IDF style overlap for offline scoring."""
        query_tokens = set(FusionUtils.normalize(query).split())
        cand_tokens = set(FusionUtils.normalize(candidate).split())
        if not query_tokens or not cand_tokens:
            return 0.0
        overlap = len(query_tokens & cand_tokens)
        return overlap / len(query_tokens)

    @staticmethod
    def disagreement_vector(outputs: List[str]) -> float:
        """Compute pairwise disagreement ratio across outputs."""
        if len(outputs) < 2:
            return 0.0
        mismatches = 0
        comparisons = 0
        for i in range(len(outputs)):
            for j in range(i + 1, len(outputs)):
                if FusionUtils.normalize(outputs[i]) != FusionUtils.normalize(outputs[j]):
                    mismatches += 1
                comparisons += 1
        return mismatches / max(comparisons, 1)

    @staticmethod
    def hallucination_score(output: str, prompt: str) -> float:
        """Simple heuristic: lower TF-IDF implies higher hallucination risk."""
        tfidf = FusionUtils.tfidf_score(prompt, output)
        return max(0.0, min(1.0, 1.0 - tfidf))

    @staticmethod
    def update_reliability(
        base_confidence: float, alignment_score: float, hallucination_risk: float
    ) -> float:
        """Update reliability using confidence, alignment, and hallucination risk."""
        adjusted = base_confidence
        adjusted *= 0.6 + 0.4 * alignment_score
        adjusted *= 1.0 - 0.5 * hallucination_risk
        return max(0.0, min(1.0, adjusted))
