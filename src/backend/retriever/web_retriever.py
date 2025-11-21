"""HTTP retrieval utilities."""
from __future__ import annotations

from typing import Optional

import requests


class WebRetriever:
    """Fetch remote web content with safety guards."""

    def __init__(self, timeout: int = 5) -> None:
        self.timeout = timeout

    def fetch(self, url: str) -> str:
        response = requests.get(url, timeout=self.timeout)
        response.raise_for_status()
        return response.text

    def safe_preview(self, url: str, limit: int = 512) -> str:
        content = self.fetch(url)
        return content[:limit]
