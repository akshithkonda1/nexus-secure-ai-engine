"""Hardened asynchronous web scraping utilities."""
from __future__ import annotations

import asyncio
import re
from typing import Iterable, List, Sequence

import httpx
from bs4 import BeautifulSoup
from pydantic import BaseModel, field_validator
from typing import Literal


class ScrapedPage(BaseModel):
    """Normalized scraped page payload."""

    url: str
    content: str
    status: Literal["success", "error"]

    @field_validator("url")
    @classmethod
    def validate_https(cls, value: str) -> str:
        if not value.startswith("https://"):
            raise ValueError("Only HTTPS endpoints are allowed")
        return value

    @field_validator("content")
    @classmethod
    def normalize_content(cls, value: str) -> str:
        text = value.encode("utf-8", errors="ignore").decode("utf-8", errors="ignore")
        text = re.sub(r"\s+", " ", text).strip()
        return text[:60000]


def _sanitize_urls(urls: Sequence[str]) -> List[str]:
    unique: List[str] = []
    for url in urls:
        if not url.startswith("https://"):
            continue
        if ".." in url or " " in url:
            continue
        if url not in unique:
            unique.append(url)
        if len(unique) >= 3:
            break
    return unique


async def _fetch_content(url: str, client: httpx.AsyncClient, timeout_seconds: float) -> ScrapedPage:
    timeout = httpx.Timeout(timeout_seconds, read=timeout_seconds, write=timeout_seconds, connect=timeout_seconds)
    response = await client.get(url, timeout=timeout)
    if response.status_code >= 500:
        return ScrapedPage(url=url, content="", status="error")

    content_type = response.headers.get("content-type", "").lower()
    if "text" not in content_type and "html" not in content_type:
        return ScrapedPage(url=url, content="", status="error")

    html = response.text
    soup = BeautifulSoup(html, "html.parser")
    for script_tag in soup(["script", "style"]):
        script_tag.decompose()

    text = soup.get_text(separator=" ")
    if re.search(r"captcha|forbidden|access denied", text, flags=re.IGNORECASE):
        return ScrapedPage(url=url, content="", status="error")
    return ScrapedPage(url=url, content=text, status="success")


async def scrape_pages(urls: Sequence[str]) -> List[ScrapedPage]:
    """Scrape up to three pages with strict limits and deterministic ordering."""

    sanitized = _sanitize_urls(urls)
    if not sanitized:
        return []

    results: List[ScrapedPage] = []
    limits = httpx.Limits(max_connections=5, max_keepalive_connections=3)
    async with httpx.AsyncClient(limits=limits, follow_redirects=False) as client:
        tasks: List[asyncio.Task[ScrapedPage]] = []
        for url in sanitized:
            task = asyncio.create_task(_fetch_with_retries(url, client))
            tasks.append(task)

        completed: Iterable[ScrapedPage] = await asyncio.gather(*tasks, return_exceptions=False)
        results.extend(completed)

    ordered: List[ScrapedPage] = []
    for url in sanitized:
        for page in results:
            if page.url == url:
                ordered.append(page)
                break
    return ordered


async def _fetch_with_retries(url: str, client: httpx.AsyncClient) -> ScrapedPage:
    attempts = [2.0, 1.0]
    for timeout_seconds in attempts:
        try:
            return await asyncio.wait_for(_fetch_content(url, client, timeout_seconds), timeout=timeout_seconds + 0.25)
        except (asyncio.TimeoutError, httpx.HTTPError):
            continue
        except Exception:
            break
    return ScrapedPage(url=url, content="", status="error")
