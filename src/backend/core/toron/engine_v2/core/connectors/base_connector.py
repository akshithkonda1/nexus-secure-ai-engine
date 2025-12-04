"""
BaseConnector — all provider connectors inherit from this.
Supports async inference, streaming, health checks, and
unified metadata for Q-G-C optimization.
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any

class BaseConnector(ABC):

    @abstractmethod
    async def infer(self, messages: List[Dict[str, Any]], model: str, **kwargs):
        pass

    @abstractmethod
    async def stream(self, messages: List[Dict[str, Any]], model: str, **kwargs):
        pass

    @abstractmethod
    async def list_models(self) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    async def health_check(self) -> bool:
        pass
