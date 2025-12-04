"""
Base Connector Interface — All model providers must implement this.
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, List


class BaseConnector(ABC):
    """Abstract base class for all async model connectors."""

    @abstractmethod
    async def infer(self, messages: List[Dict[str, str]], model: str, **kwargs) -> Any:
        pass

    @abstractmethod
    async def stream(self, messages: List[Dict[str, str]], model: str, **kwargs):
        """Async generator for streaming responses."""
        pass

    @abstractmethod
    async def list_models(self) -> List[Dict[str, str]]:
        pass

    @abstractmethod
    async def health_check(self) -> bool:
        pass
