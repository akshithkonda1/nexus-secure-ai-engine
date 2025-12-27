"""Open Source Documentation connector."""

import logging
import re
from typing import List
import aiohttp

from ..base import Tier3Connector, KnowledgeSnippet, SourceCategory

logger = logging.getLogger(__name__)


class OpenSourceDocsConnector(Tier3Connector):
    """
    Open source project documentation aggregator.

    Uses DevDocs.io API for aggregated documentation search.
    Also searches Read the Docs when applicable.
    """

    DEVDOCS_BASE = "https://devdocs.io"
    DEVDOCS_DOCS = "https://documents.devdocs.io"

    # Popular documentation sources with their prefixes
    DOC_SOURCES = {
        "python": {"slug": "python~3.12", "name": "Python 3.12"},
        "javascript": {"slug": "javascript", "name": "JavaScript"},
        "typescript": {"slug": "typescript", "name": "TypeScript"},
        "react": {"slug": "react", "name": "React"},
        "vue": {"slug": "vue~3", "name": "Vue.js 3"},
        "node": {"slug": "node", "name": "Node.js"},
        "django": {"slug": "django~5.0", "name": "Django"},
        "flask": {"slug": "flask~3.0", "name": "Flask"},
        "rust": {"slug": "rust", "name": "Rust"},
        "go": {"slug": "go", "name": "Go"},
        "docker": {"slug": "docker", "name": "Docker"},
        "kubernetes": {"slug": "kubernetes", "name": "Kubernetes"},
        "postgresql": {"slug": "postgresql~16", "name": "PostgreSQL"},
        "redis": {"slug": "redis", "name": "Redis"},
        "css": {"slug": "css", "name": "CSS"},
        "html": {"slug": "html", "name": "HTML"},
    }

    def __init__(self):
        super().__init__(
            source_name="OpenSource-Docs",
            reliability=0.84,
            category=SourceCategory.TECHNICAL,
            enabled=True,
            requires_api_key=False
        )
        self._session = None
        self._doc_indices = {}

    async def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            headers = {
                "User-Agent": "TORON/2.5h+ Epistemic Engine (Documentation Research)",
                "Accept": "application/json"
            }
            self._session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=15),
                headers=headers
            )
        return self._session

    def _detect_doc_type(self, query: str) -> List[str]:
        """Detect which documentation sources are relevant for the query."""
        query_lower = query.lower()
        relevant = []

        # Check for explicit mentions
        for key, info in self.DOC_SOURCES.items():
            if key in query_lower or info["name"].lower() in query_lower:
                relevant.append(key)

        # If no explicit matches, try common patterns
        if not relevant:
            # Web development queries
            if any(w in query_lower for w in ["dom", "browser", "html", "element", "selector"]):
                relevant.extend(["javascript", "css", "html"])
            # Backend queries
            elif any(w in query_lower for w in ["api", "server", "http", "request"]):
                relevant.extend(["node", "python", "flask"])
            # Database queries
            elif any(w in query_lower for w in ["sql", "database", "query", "table"]):
                relevant.extend(["postgresql"])
            # Container queries
            elif any(w in query_lower for w in ["container", "image", "deploy"]):
                relevant.extend(["docker", "kubernetes"])
            # Default to general web dev docs
            else:
                relevant.extend(["javascript", "python"])

        return relevant[:3]  # Limit to 3 sources

    async def _load_doc_index(self, session: aiohttp.ClientSession, slug: str) -> dict:
        """Load the documentation index for a specific documentation."""
        if slug in self._doc_indices:
            return self._doc_indices[slug]

        try:
            async with session.get(f"{self.DEVDOCS_DOCS}/{slug}/index.json") as response:
                if response.status == 200:
                    data = await response.json()
                    self._doc_indices[slug] = data
                    return data
        except Exception:
            pass

        return {"entries": []}

    def _search_index(self, index: dict, query: str, max_results: int = 3) -> List[dict]:
        """Search within a documentation index."""
        query_terms = query.lower().split()
        entries = index.get("entries", [])
        results = []

        for entry in entries:
            name = entry.get("name", "").lower()
            path = entry.get("path", "").lower()
            entry_type = entry.get("type", "").lower()

            # Calculate relevance score
            score = 0
            for term in query_terms:
                if term in name:
                    score += 10 if name.startswith(term) else 5
                if term in path:
                    score += 2
                if term in entry_type:
                    score += 3

            if score > 0:
                results.append({**entry, "_score": score})

        # Sort by score and return top results
        results.sort(key=lambda x: x["_score"], reverse=True)
        return results[:max_results]

    async def fetch(self, query: str, max_results: int = 3) -> List[KnowledgeSnippet]:
        try:
            session = await self._get_session()
            snippets = []

            # Detect relevant documentation sources
            doc_types = self._detect_doc_type(query)

            for doc_type in doc_types:
                if len(snippets) >= max_results:
                    break

                doc_info = self.DOC_SOURCES.get(doc_type)
                if not doc_info:
                    continue

                slug = doc_info["slug"]
                doc_name = doc_info["name"]

                # Load and search the documentation index
                index = await self._load_doc_index(session, slug)
                results = self._search_index(index, query, max_results - len(snippets))

                for result in results:
                    name = result.get("name", "")
                    path = result.get("path", "")
                    entry_type = result.get("type", "")

                    # Build URL
                    url = f"{self.DEVDOCS_BASE}/{slug}/{path}" if path else ""

                    # Build content
                    content_parts = [f"{doc_name}: {name}"]
                    if entry_type:
                        content_parts.append(f"Type: {entry_type}")
                    content_parts.append(f"\nDocumentation for {name} in {doc_name}.")

                    # Try to fetch the actual documentation content
                    if path:
                        try:
                            # DevDocs stores content in HTML format
                            doc_url = f"{self.DEVDOCS_DOCS}/{slug}/{path.split('#')[0]}.html"
                            async with session.get(doc_url) as response:
                                if response.status == 200:
                                    html = await response.text()
                                    # Extract text from first paragraph
                                    p_match = re.search(r'<p[^>]*>(.*?)</p>', html, re.DOTALL)
                                    if p_match:
                                        text = re.sub(r'<[^>]+>', '', p_match.group(1))
                                        text = re.sub(r'\s+', ' ', text).strip()
                                        if text and len(text) > 20:
                                            content_parts.append(f"\n{text[:500]}")
                        except Exception:
                            pass

                    content = "\n".join(content_parts)

                    snippet = KnowledgeSnippet(
                        source_name=self.source_name,
                        content=content[:1500],
                        reliability=self.reliability,
                        category=self.category,
                        url=url,
                        metadata={
                            "doc_name": doc_name,
                            "entry_name": name,
                            "entry_type": entry_type,
                            "doc_slug": slug,
                            "type": "technical_documentation"
                        }
                    )
                    snippets.append(snippet)

            self._record_success()
            return snippets[:max_results]

        except Exception as e:
            logger.error(f"OpenSource Docs error: {e}")
            self._record_error()
            return []

    async def close(self):
        if self._session and not self._session.closed:
            await self._session.close()
