import asyncio
import json
import random
import re
import time
from typing import Any, AsyncGenerator, Dict, List, Optional
from urllib.parse import urljoin, urlparse

import httpx

from .Normalizer import (
    detect_language,
    normalize_html,
    normalize_json,
    normalize_pdf,
    normalize_text,
    safe_truncate,
)
from .SessionPool import SessionPool

try:
    from bs4 import BeautifulSoup  # type: ignore
except Exception:  # pragma: no cover - optional dependency
    BeautifulSoup = None  # type: ignore


class WebRetrieverUnified:
    def __init__(
        self,
        session_pool: Optional[SessionPool] = None,
        default_region: str = "global",
        max_retries: int = 3,
        base_timeout: float = 12.0,
    ) -> None:
        self.pool = session_pool or SessionPool()
        self.default_region = default_region
        self.max_retries = max_retries
        self.base_timeout = base_timeout
        self.user_agents: List[str] = [
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:119.0) Gecko/20100101 Firefox/119.0",
        ]

    # -----------------------------
    # Public API
    # -----------------------------
    async def get(self, url: str, *, region: Optional[str] = None) -> Dict[str, Any]:
        region = region or self._region_from_url(url)
        jitter = random.uniform(0.01, 0.15)
        await asyncio.sleep(jitter)

        try:
            response = await self._fetch_async(url, region)
        except Exception:
            response = await asyncio.to_thread(self._fetch_sync, url, region)

        return await self._normalize_response(response, url)

    async def stream(self, url: str, *, region: Optional[str] = None) -> AsyncGenerator[bytes, None]:
        region = region or self._region_from_url(url)
        client = await self.pool.acquire(region=region, asynchronous=True)
        headers = self._headers()
        try:
            async with client.stream("GET", url, headers=headers, timeout=self.base_timeout) as resp:
                resp.raise_for_status()
                async for chunk in resp.aiter_bytes():
                    yield chunk
        finally:
            self.pool.release(region, client)

    async def scrape(self, url: str, *, region: Optional[str] = None) -> Dict[str, Any]:
        payload = await self.get(url, region=region)
        links = await self.extract_links(url, region=region)
        payload["links"] = links
        return payload

    async def extract_links(self, url: str, *, region: Optional[str] = None) -> List[str]:
        region = region or self._region_from_url(url)
        response = await self._fetch_async(url, region, allow_redirects=True)
        content_type = response.headers.get("content-type", "")
        if "html" not in content_type:
            return []
        html = response.text
        links: List[str] = []
        if BeautifulSoup:
            soup = BeautifulSoup(html, "html.parser")
            for tag in soup.find_all("a", href=True):
                href = tag.get("href")
                if href:
                    links.append(urljoin(url, href))
        else:
            for match in re.findall(r"href=\"([^\"]+)\"", html):
                links.append(urljoin(url, match))
        return list(dict.fromkeys(links))

    async def fetch_and_normalize(self, url: str, *, region: Optional[str] = None) -> Dict[str, Any]:
        return await self.get(url, region=region)

    # -----------------------------
    # Internal helpers
    # -----------------------------
    async def _fetch_async(
        self,
        url: str,
        region: str,
        allow_redirects: bool = True,
    ) -> httpx.Response:
        client = await self.pool.acquire(region=region, asynchronous=True)
        headers = self._headers()
        last_exc: Optional[Exception] = None
        try:
            for attempt in range(self.max_retries):
                try:
                    response = await client.get(
                        url,
                        headers=headers,
                        follow_redirects=allow_redirects,
                        timeout=self.base_timeout * (1 + 0.2 * attempt),
                    )
                    response.raise_for_status()
                    return response
                except Exception as exc:
                    last_exc = exc
                    await asyncio.sleep(min(0.5 * (2 ** attempt), 3.0))
            assert last_exc is not None
            raise last_exc
        finally:
            self.pool.release(region, client)

    def _fetch_sync(self, url: str, region: str, allow_redirects: bool = True) -> httpx.Response:
        client = self.pool.acquire_sync(region=region, timeout=self.base_timeout)
        headers = self._headers()
        try:
            attempt = 0
            last_exc: Optional[Exception] = None
            while attempt < self.max_retries:
                try:
                    response = client.get(
                        url,
                        headers=headers,
                        follow_redirects=allow_redirects,
                        timeout=self.base_timeout * (1 + 0.2 * attempt),
                    )
                    response.raise_for_status()
                    return response
                except Exception as exc:
                    last_exc = exc
                    time.sleep(min(0.5 * (2 ** attempt), 3.0))
                    attempt += 1
            if last_exc:
                raise last_exc
            raise RuntimeError("unable to fetch url")
        finally:
            self.pool.release(region, client)

    async def _normalize_response(self, response: httpx.Response, url: str) -> Dict[str, Any]:
        content_type = response.headers.get("content-type", "").lower()
        data: Dict[str, Any] = {
            "url": str(response.url),
            "status": response.status_code,
            "headers": dict(response.headers),
            "content_type": content_type,
        }

        if "application/pdf" in content_type:
            body = response.content
            text = normalize_pdf(body)
        elif "application/json" in content_type or response.text.startswith("{"):
            try:
                parsed = response.json()
                data["json"] = parsed
                text = normalize_json(parsed)
            except Exception:
                text = normalize_text(response.text)
        elif "html" in content_type:
            html = response.text
            text = self._extract_text_from_html(html)
            data["meta"] = self._parse_meta(html)
        else:
            text = normalize_text(response.text)

        data["text"] = safe_truncate(text, 20000)
        data["language"] = detect_language(text)
        data["resolved_url"] = str(response.url)
        data["links"] = data.get("links", [])
        return data

    def _extract_text_from_html(self, html: str) -> str:
        if BeautifulSoup:
            soup = BeautifulSoup(html, "html.parser")
            for script in soup(["script", "style"]):
                script.extract()
            text = soup.get_text(separator=" ")
            return normalize_text(text)
        return normalize_html(html)

    def _parse_meta(self, html: str) -> Dict[str, Any]:
        meta: Dict[str, Any] = {}
        if BeautifulSoup:
            soup = BeautifulSoup(html, "html.parser")
            title = soup.title.string.strip() if soup.title and soup.title.string else None
            if title:
                meta["title"] = title
            for tag in soup.find_all("meta"):
                name = tag.get("name") or tag.get("property")
                if name:
                    content = tag.get("content")
                    if content:
                        meta[name.lower()] = normalize_text(content)
        return meta

    def _headers(self) -> Dict[str, str]:
        return {
            "user-agent": random.choice(self.user_agents),
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.8",
        }

    def _region_from_url(self, url: str) -> str:
        parsed = urlparse(url)
        host = parsed.hostname or ""
        if host.endswith(".eu"):
            return "eu"
        if host.endswith(".ap") or host.endswith(".asia"):
            return "apac"
        if host.endswith(".us") or host.endswith(".com"):
            return "us-east"
        return self.default_region

