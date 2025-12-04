"""Deterministic, hardened web search utilities for Toron Engine."""
from __future__ import annotations

import asyncio
import json
import re
from typing import List
from urllib.parse import quote_plus

import httpx
from pydantic import BaseModel, field_validator


class WebDocument(BaseModel):
    """Normalized representation of a web search result."""

    title: str
    url: str
    snippet: str
    rank: int

    @field_validator("url")
    @classmethod
    def validate_url(cls, value: str) -> str:
        if not value.startswith("http"):
            raise ValueError("URL must be absolute")
        if " " in value or not re.match(r"^https?://[\w.-]+(/.*)?$", value):
            raise ValueError("URL contains invalid characters")
        return value

    @field_validator("title", "snippet")
    @classmethod
    def strip_invalid_chars(cls, value: str) -> str:
        cleaned = value.encode("utf-8", errors="ignore").decode("utf-8", errors="ignore")
        return re.sub(r"\s+", " ", cleaned).strip()


async def _fetch_duckduckgo(query: str, client: httpx.AsyncClient) -> List[WebDocument]:
    encoded_query = quote_plus(query)
    url = f"https://api.duckduckgo.com/?q={encoded_query}&format=json&no_redirect=1&no_html=1"
    response = await client.get(url)
    response.raise_for_status()
    payload = json.loads(response.text)
    results: List[WebDocument] = []
    related_topics = payload.get("RelatedTopics", [])
    for rank, item in enumerate(related_topics, start=1):
        if "FirstURL" not in item or "Text" not in item:
            continue
        try:
            results.append(
                WebDocument(
                    title=item.get("Text", "Untitled"),
                    url=item["FirstURL"],
                    snippet=item.get("Text", ""),
                    rank=rank,
                )
            )
        except Exception:
            continue
    return results


async def perform_web_search(query: str) -> List[WebDocument]:
    """Execute a resilient web search with strict safety controls.

    The search endpoint is kept intentionally simple to avoid external
    credentials while still providing deterministic ordering of results.
    Any errors are contained and result in an empty list rather than a
    raised exception.
    """

    sanitized_query = re.sub(r"\s+", " ", query).strip()
    sanitized_query = re.sub(r"[\x00-\x1f\x7f]", "", sanitized_query)
    if not sanitized_query:
        return []

    timeout = httpx.Timeout(1.5, read=1.5, write=1.0, connect=1.0)
    limits = httpx.Limits(max_connections=5, max_keepalive_connections=2)
    retries = 2
    results: List[WebDocument] = []

    async with httpx.AsyncClient(timeout=timeout, limits=limits, follow_redirects=False) as client:
        for attempt in range(retries):
            try:
                results = await _fetch_duckduckgo(sanitized_query, client)
                break
            except (httpx.HTTPError, json.JSONDecodeError):
                await asyncio.sleep(0.05)
                continue
            except Exception:
                break

    ordered = sorted(results, key=lambda doc: doc.rank)
    return ordered
