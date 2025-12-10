from dataclasses import dataclass
from datetime import datetime
from typing import Dict, Any


@dataclass
class TestRunRecord:
    run_id: str
    status: str
    created_at: datetime
    updated_at: datetime


@dataclass
class TestResult:
    run_id: str
    result: Dict[str, Any]
    created_at: datetime
