"""MDN Web Docs connector."""

import logging
import re
from typing import List
import aiohttp

from ..base import Tier3Connector, KnowledgeSnippet, SourceCategory

logger = logging.getLogger(__name__)


class MDNDocsConnector(Tier3Connector):
    """
    MDN Web Docs connector for web development documentation.

    Uses MDN's public search and Yari content API.
    No API key required.
    """

    SEARCH_URL = "https://developer.mozilla.org/api/v1/search"
    CONTENT_URL = "https://developer.mozilla.org"

    def __init__(self):
        super().__init__(
            source_name="MDN-Web-Docs",
            reliability=0.90,
            category=SourceCategory.TECHNICAL,
            enabled=True,
            requires_api_key=False
        )
        self._session = None

    async def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            headers = {
                "User-Agent": "TORON/2.5h+ Epistemic Engine (Web Documentation Research)",
                "Accept": "application/json"
            }
            self._session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=15),
                headers=headers
            )
        return self._session

    async def fetch(self, query: str, max_results: int = 3) -> List[KnowledgeSnippet]:
        try:
            session = await self._get_session()

            # Search MDN
            params = {
                "q": query,
                "locale": "en-US",
                "size": min(max_results, 10)
            }

            async with session.get(self.SEARCH_URL, params=params) as response:
                if response.status != 200:
                    logger.warning(f"MDN search: {response.status}")
                    self._record_error()
                    return []

                data = await response.json()

            snippets = []
            documents = data.get("documents", [])

            for doc in documents[:max_results]:
                title = doc.get("title", "")
                slug = doc.get("mdn_url", "")
                summary = doc.get("summary", "") or ""
                highlight = doc.get("highlight", {})

                # Use highlighted content if available
                if highlight.get("body"):
                    # Clean HTML from highlights
                    body_highlights = highlight.get("body", [])
                    highlighted_text = " ... ".join(body_highlights[:3])
                    highlighted_text = re.sub(r'<[^>]+>', '', highlighted_text)
                else:
                    highlighted_text = ""

                # Build URL
                url = f"{self.CONTENT_URL}{slug}" if slug else ""

                # Fetch additional content from the page
                content_text = summary
                if url:
                    try:
                        # Try to get document content from Yari JSON endpoint
                        doc_url = f"{url}/index.json"
                        async with session.get(doc_url) as doc_response:
                            if doc_response.status == 200:
                                doc_data = await doc_response.json()
                                doc_info = doc_data.get("doc", {})

                                # Get the prose content
                                prose = doc_info.get("body", [])
                                if prose:
                                    for section in prose[:2]:
                                        if section.get("type") == "prose":
                                            content_html = section.get("value", {}).get("content", "")
                                            # Strip HTML tags
                                            clean_text = re.sub(r'<[^>]+>', '', content_html)
                                            clean_text = re.sub(r'\s+', ' ', clean_text).strip()
                                            if clean_text:
                                                content_text = clean_text[:800]
                                                break
                    except Exception:
                        pass

                # Build content
                content_parts = [title]
                if content_text:
                    content_parts.append(f"\n{content_text}")
                if highlighted_text and highlighted_text not in content_text:
                    content_parts.append(f"\n...{highlighted_text}...")

                content = "\n".join(content_parts)

                if content.strip():
                    snippet = KnowledgeSnippet(
                        source_name=self.source_name,
                        content=content[:1500],
                        reliability=self.reliability,
                        category=self.category,
                        url=url,
                        metadata={
                            "title": title,
                            "slug": slug,
                            "type": "web_documentation"
                        }
                    )
                    snippets.append(snippet)

            self._record_success()
            return snippets

        except Exception as e:
            logger.error(f"MDN Docs error: {e}")
            self._record_error()
            return []

    async def close(self):
        if self._session and not self._session.closed:
            await self._session.close()
