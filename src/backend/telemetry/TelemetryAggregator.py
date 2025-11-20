import math
from collections import defaultdict
from statistics import mean
from typing import DefaultDict, Dict, Iterable, List

from .TelemetryModelMetrics import TelemetryModelMetrics


class TelemetryAggregator:
    def __init__(self) -> None:
        self._latency: DefaultDict[str, List[float]] = defaultdict(list)
        self._usage: DefaultDict[str, int] = defaultdict(int)
        self._errors: DefaultDict[str, int] = defaultdict(int)
        self._drift: DefaultDict[str, int] = defaultdict(int)

    def add(self, metrics: TelemetryModelMetrics) -> None:
        model = metrics.model_name or "unknown"
        if metrics.latency_ms is not None:
            self._latency[model].append(metrics.latency_ms)
        if metrics.output_tokens is not None:
            self._usage[model] += metrics.output_tokens
        if metrics.safety_flags.get("error"):
            self._errors[model] += 1
        if metrics.drift_flag:
            self._drift[model] += 1

    def aggregate(self) -> Dict[str, Dict[str, float]]:
        return {
            "latency_ms": {m: mean(v) for m, v in self._latency.items() if v},
            "token_usage": dict(self._usage),
            "error_rate": self._compute_error_rate(),
            "drift_index": self._compute_drift_index(),
        }

    def _compute_error_rate(self) -> Dict[str, float]:
        result: Dict[str, float] = {}
        for model, err_count in self._errors.items():
            total = max(len(self._latency.get(model, [])), 1)
            result[model] = err_count / total
        return result

    def _compute_drift_index(self) -> Dict[str, float]:
        index: Dict[str, float] = {}
        for model, drift_events in self._drift.items():
            tokens = max(self._usage.get(model, 1), 1)
            index[model] = min(1.0, drift_events / tokens)
        return index

    def divergence_score(self, metrics: Iterable[TelemetryModelMetrics]) -> float:
        latencies = [m.latency_ms for m in metrics if m.latency_ms]
        if not latencies:
            return 0.0
        mu = mean(latencies)
        variance = mean((x - mu) ** 2 for x in latencies)
        return math.sqrt(variance)

