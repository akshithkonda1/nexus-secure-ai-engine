from collections import defaultdict
from typing import List, Dict, Any
from ryuzen.engine.fusion_utils import FusionUtils


class ConsensusIntegrator:
    """
    Toron Fusion Consensus v3.0
    - clustering
    - majority vote
    - confidence weighting
    - trust weighting
    - fallback safety selection
    """

    HASH_SIZE = 16

    def cluster(self, responses: List[Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
        clusters: Dict[str, Dict[str, Any]] = defaultdict(
            lambda: {"members": [], "avg_conf": 0.0, "tfidf": 0.0, "trust": 0.0}
        )

        for response in responses:
            fp = FusionUtils.fingerprint(response.get("output", ""), size=self.HASH_SIZE)
            response.setdefault("reliability", response.get("confidence", 0.7))
            clusters[fp]["members"].append(response)

        for fp, block in clusters.items():
            if not block["members"]:
                continue
            block["avg_conf"] = sum(m.get("confidence", 0.7) for m in block["members"]) / len(
                block["members"]
            )
            block["tfidf"] = sum(
                FusionUtils.tfidf_score(block["members"][0].get("output", ""), m.get("output", ""))
                for m in block["members"]
            )
            block["trust"] = sum(m.get("reliability", block["avg_conf"]) for m in block["members"])

        return clusters

    def pick_cluster(self, clusters: Dict[str, Dict[str, Any]]):
        best_fp = None
        best = None

        for fp, block in clusters.items():
            if best is None:
                best_fp, best = fp, block
                continue

            # Rule 1: majority membership
            if len(block["members"]) > len(best["members"]):
                best_fp, best = fp, block
                continue

            # Rule 2: higher trust weighting
            if len(block["members"]) == len(best["members"]):
                if block.get("trust", 0.0) > best.get("trust", 0.0):
                    best_fp, best = fp, block
                    continue

            # Rule 3: higher confidence
            if block.get("avg_conf", 0.0) > best.get("avg_conf", 0.0):
                best_fp, best = fp, block
                continue

            # Rule 4: TF-IDF alignment
            if block.get("tfidf", 0.0) > best.get("tfidf", 0.0):
                best_fp, best = fp, block
                continue

        return best_fp, best

    def integrate(self, responses: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not responses:
            return {
                "fingerprint": None,
                "agreement_count": 0,
                "agreement_models": [],
                "avg_confidence": 0.0,
                "representative_output": "",
                "representative_model": None,
                "trust_weight": 0.0,
            }

        clusters = self.cluster(responses)
        fp, block = self.pick_cluster(clusters)

        representative = max(
            block["members"], key=lambda member: member.get("reliability", member.get("confidence", 0.7))
        )

        return {
            "fingerprint": fp,
            "agreement_count": len(block["members"]),
            "agreement_models": [member.get("model") for member in block["members"]],
            "avg_confidence": block.get("avg_conf", 0.0),
            "representative_output": representative.get("output"),
            "representative_model": representative.get("model"),
            "trust_weight": block.get("trust", 0.0),
        }
