"""
Consensus — TF-IDF scoring + validation boost/penalty.
"""

from collections import Counter
import math


class ConsensusIntegrator:
    async def integrate(self, context):
        debate = context.get("debate_result", {})
        validation = context.get("validation", {})

        outputs = debate.get("model_outputs", {})
        if not outputs:
            return {
                "final_answer": "No responses.",
                "model_consensus_score": 0.0,
                "web_validation_score": 0.0,
                "confidence": 0.0
            }

        tfidf = self._tfidf(outputs)
        web_score = validation.get("confidence", 0.5)

        supported_sources = {
            f["source_model"] for f in validation.get("supported", [])
        }
        contradicted_sources = {
            f["source_model"] for f in validation.get("contradicted", [])
        }

        for m in supported_sources:
            if m in tfidf:
                tfidf[m] *= 1.15

        for m in contradicted_sources:
            if m in tfidf:
                tfidf[m] *= 0.85

        winner = max(tfidf.items(), key=lambda x: x[1])[0]
        winner_score = min(tfidf[winner], 1.0)

        composite = (winner_score * 0.6) + (web_score * 0.4)

        return {
            "final_answer": outputs[winner],
            "model_used": winner,
            "model_consensus_score": round(winner_score, 4),
            "web_validation_score": round(web_score, 4),
            "confidence": round(composite, 4),
            "models_considered": list(outputs.keys()),
            "contradicting_models": list(contradicted_sources),
            "evidence_used": validation.get("web_evidence", {}),
            "reasoning_trace": {
                "tfidf_scores": {k: round(v, 4) for k, v in tfidf.items()},
                "supported_facts": len(validation.get("supported", [])),
                "contradicted_facts": len(validation.get("contradicted", [])),
                "unknown_facts": len(validation.get("unknown", [])),
            },
        }

    def _tfidf(self, outputs):
        tokens_all = []
        tokens_per = {}

        stop = {
            "the","a","an","and","or","in","on","of","at","to","is","are","was","were",
            "be","been","being","have","has","had","for","but","by","with","from"
        }

        for model, text in outputs.items():
            tokens = [
                t.lower() for t in text.split()
                if len(t) > 3 and t.isalnum() and t.lower() not in stop
            ]
            tokens_per[model] = tokens
            tokens_all.extend(set(tokens))

        df = Counter(tokens_all)
        N = len(outputs)
        scores = {}

        for model, toks in tokens_per.items():
            if not toks:
                scores[model] = 0
                continue
            tf = Counter(toks)
            s = 0
            for tok, freq in tf.items():
                tf_score = freq / len(toks)
                idf = math.log((N + 1) / (df[tok] + 1))
                s += tf_score * idf
            scores[model] = s / len(toks)

        max_s = max(scores.values()) if scores else 1
        return {m: v / max_s for m, v in scores.items()}
