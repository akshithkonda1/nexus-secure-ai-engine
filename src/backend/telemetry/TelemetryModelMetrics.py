from dataclasses import dataclass, field
from typing import Dict, Optional


@dataclass
class TelemetryModelMetrics:
    latency_ms: Optional[float] = None
    output_tokens: Optional[int] = None
    thinking_time: Optional[float] = None
    provider: Optional[str] = None
    model_name: Optional[str] = None
    safety_flags: Dict[str, bool] = field(default_factory=dict)
    hallucination_score: Optional[float] = None
    drift_flag: bool = False

