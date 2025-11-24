"""K-Means clustering utilities with graceful degradation."""
from __future__ import annotations

import math
from typing import List, Sequence

try:
    from sklearn.cluster import KMeans  # type: ignore
except Exception:  # pragma: no cover - optional dependency
    KMeans = None  # type: ignore[misc]


def auto_cluster(vectors: Sequence[Sequence[float]], max_clusters: int = 8) -> List[int]:
    if not vectors:
        return []
    n_samples = len(vectors)
    n_clusters = max(1, min(max_clusters, int(math.sqrt(n_samples)) or 1))

    if KMeans is None:
        # Fallback: assign round-robin cluster ids
        return [idx % n_clusters for idx in range(n_samples)]

    model = KMeans(n_clusters=n_clusters, n_init="auto")
    labels = model.fit_predict(vectors)
    return list(labels)
