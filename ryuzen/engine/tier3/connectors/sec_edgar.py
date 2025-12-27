"""SEC EDGAR connector for financial filings."""

import logging
import re
from typing import List
import aiohttp

from ..base import Tier3Connector, KnowledgeSnippet, SourceCategory

logger = logging.getLogger(__name__)


class SECEdgarConnector(Tier3Connector):
    """
    SEC EDGAR API connector for regulatory filings.

    API docs: https://www.sec.gov/edgar/sec-api-documentation
    Free government API, no authentication required.
    Rate limit: 10 requests per second.
    """

    API_BASE = "https://efts.sec.gov/LATEST/search-index"
    SUBMISSIONS_API = "https://data.sec.gov/submissions"
    FULL_TEXT_SEARCH = "https://efts.sec.gov/LATEST/search-index"

    def __init__(self):
        super().__init__(
            source_name="SEC-EDGAR",
            reliability=0.97,
            category=SourceCategory.FINANCIAL,
            enabled=True,
            requires_api_key=False  # Free government API
        )
        self._session = None

    async def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            # SEC requires User-Agent with contact info
            headers = {
                "User-Agent": "TORON/2.5h+ research@toron.ai",
                "Accept": "application/json"
            }
            self._session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=20),
                headers=headers
            )
        return self._session

    async def fetch(self, query: str, max_results: int = 3) -> List[KnowledgeSnippet]:
        try:
            session = await self._get_session()
            snippets = []

            # Use full-text search API
            params = {
                "q": query,
                "dateRange": "custom",
                "startdt": "2020-01-01",
                "enddt": "2025-12-31",
                "forms": "10-K,10-Q,8-K,S-1,DEF 14A",
                "from": 0,
                "size": min(max_results * 2, 100)
            }

            async with session.get(self.FULL_TEXT_SEARCH, params=params) as response:
                if response.status != 200:
                    logger.warning(f"SEC EDGAR: {response.status}")
                    self._record_error()
                    return []

                data = await response.json()

            hits = data.get("hits", {}).get("hits", [])

            for hit in hits[:max_results]:
                source = hit.get("_source", {})

                company = source.get("display_names", [""])[0] if source.get("display_names") else ""
                cik = source.get("ciks", [""])[0] if source.get("ciks") else ""
                form_type = source.get("form", "")
                file_date = source.get("file_date", "")
                file_num = source.get("file_num", "")
                file_description = source.get("file_description", "") or ""

                # Get document URL
                accession_num = source.get("adsh", "")
                if accession_num and cik:
                    # Format accession number for URL
                    acc_formatted = accession_num.replace("-", "")
                    url = f"https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK={cik}&type={form_type}&dateb=&owner=include&count=40"
                else:
                    url = f"https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&company={company.replace(' ', '+')}"

                # Determine filing description
                form_descriptions = {
                    "10-K": "Annual Report",
                    "10-Q": "Quarterly Report",
                    "8-K": "Current Report (Material Event)",
                    "S-1": "Registration Statement",
                    "DEF 14A": "Proxy Statement",
                    "4": "Insider Trading Report",
                    "13F": "Institutional Holdings Report"
                }
                filing_type = form_descriptions.get(form_type, form_type)

                # Build content
                content_parts = [f"{company}"]
                content_parts.append(f"Filing: {form_type} - {filing_type}")
                if file_date:
                    content_parts.append(f"Date: {file_date}")
                if cik:
                    content_parts.append(f"CIK: {cik}")
                if file_description:
                    content_parts.append(f"\n{file_description[:600]}")
                else:
                    content_parts.append(f"\nSEC regulatory filing from {company}.")

                content = "\n".join(content_parts)

                snippet = KnowledgeSnippet(
                    source_name=self.source_name,
                    content=content[:1500],
                    reliability=self.reliability,
                    category=self.category,
                    url=url,
                    metadata={
                        "company": company,
                        "cik": cik,
                        "form_type": form_type,
                        "file_date": file_date,
                        "accession_number": accession_num,
                        "type": "sec_filing"
                    }
                )
                snippets.append(snippet)

            self._record_success()
            return snippets

        except Exception as e:
            logger.error(f"SEC EDGAR error: {e}")
            self._record_error()
            return []

    async def close(self):
        if self._session and not self._session.closed:
            await self._session.close()
