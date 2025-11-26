"""HTTP client wrapper enforcing scoped, read-only web access."""
from __future__ import annotations

import logging
from typing import Tuple
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)


class WebSandboxClient:
    """Fetch pages while enforcing strict domain and method constraints."""

    def __init__(self, timeout: int = 10) -> None:
        self.timeout = timeout

    def _validate_url(self, url: str) -> Tuple[str, str]:
        parsed = urlparse(url)
        if parsed.scheme not in {"http", "https"} or not parsed.netloc:
            raise ValueError("Invalid or unsupported URL")
        base_domain = parsed.netloc
        normalized = parsed.geturl()
        logger.debug("Validated URL %s with base domain %s", normalized, base_domain)
        return normalized, base_domain

    def _ensure_same_domain(self, target: str, base_domain: str) -> str:
        parsed_target = urlparse(target)
        if parsed_target.netloc and parsed_target.netloc != base_domain:
            raise ValueError("Redirect blocked outside of approved domain")
        if parsed_target.scheme and parsed_target.scheme not in {"http", "https"}:
            raise ValueError("Unsupported redirect scheme")
        normalized = parsed_target.geturl()
        logger.debug("Redirect validated to %s", normalized)
        return normalized

    def fetch_url(self, url: str) -> str:
        """Fetch a URL with domain binding and strip unsafe elements."""

        normalized, base_domain = self._validate_url(url)
        session = requests.Session()
        headers = {"User-Agent": "RyuzenWebSandbox/1.0"}
        current_url = normalized
        response = None

        for _ in range(3):
            response = session.get(current_url, headers=headers, timeout=self.timeout, allow_redirects=False)
            if 300 <= response.status_code < 400:
                location = response.headers.get("location")
                if not location:
                    break
                next_url = urljoin(current_url, location)
                current_url = self._ensure_same_domain(next_url, base_domain)
                continue
            break

        if response is None:
            raise RuntimeError("Failed to fetch URL")

        if response.status_code >= 400:
            raise ValueError(f"Failed to fetch resource: HTTP {response.status_code}")

        soup = BeautifulSoup(response.text, "html.parser")
        for tag in soup.find_all(["script", "iframe", "form", "embed", "object", "noscript", "style"]):
            tag.decompose()

        sanitized_html = soup.prettify()
        logger.info("Web sandbox fetched %s within domain %s", normalized, base_domain)
        return sanitized_html


def fetch_url(url: str) -> str:
    """Module-level helper to fetch a URL using the sandbox client."""

    client = WebSandboxClient()
    return client.fetch_url(url)
