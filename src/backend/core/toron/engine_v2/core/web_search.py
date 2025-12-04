"""
Web Search — DuckDuckGo Instant API (server-side, async).
"""

import httpx
from urllib.parse import quote_plus
import asyncio


class WebSearch:
    async def run(self, context):
        facts = context.get("facts", [])
        if not facts:
            return {"web_results": []}

        queries = [f["claim"][:100] for f in facts[:3]]

        async with httpx.AsyncClient(timeout=5.0) as client:
            tasks = [self._search(q, client) for q in queries]
            results = await asyncio.gather(*tasks, return_exceptions=True)

        combined = []
        for r in results:
            if not isinstance(r, Exception):
                combined.extend(r)

        return {"web_results": combined[:10]}

    async def _search(self, query, client):
        try:
            url = f"https://api.duckduckgo.com/?q={quote_plus(query)}&format=json&no_redirect=1&no_html=1"

            r = await client.get(url)
            r.raise_for_status()
            data = r.json()

            out = []

            for item in data.get("RelatedTopics", [])[:3]:
                if isinstance(item, dict) and "FirstURL" in item:
                    out.append({
                        "title": item.get("Text", "")[:100],
                        "url": item["FirstURL"],
                        "snippet": item.get("Text", "")[:300]
                    })

            if data.get("AbstractText"):
                out.append({
                    "title": data.get("Heading", ""),
                    "url": data.get("AbstractURL", ""),
                    "snippet": data.get("AbstractText", "")[:300]
                })

            return out
        except Exception:
            return []
