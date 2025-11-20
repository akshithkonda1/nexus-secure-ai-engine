from dataclasses import dataclass, field
from typing import Optional


@dataclass
class ConnectorState:
    status: str = "connected"  # "connected" | "syncing" | "error"
    last_sync: Optional[float] = None
    items_indexed: int = 0
    region: str = "global"
    token_age: float = 0.0
    error_count: int = 0
    health_score: float = 100.0
    metadata: dict = field(default_factory=dict)
