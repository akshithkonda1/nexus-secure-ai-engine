"""Simple HTML scraper used by the retriever."""
from __future__ import annotations

from bs4 import BeautifulSoup

from src.backend.retriever.web_retriever import WebRetriever


class SiteScraper:
    """Scrape and sanitize HTML content."""

    def __init__(self, retriever: WebRetriever | None = None) -> None:
        self.retriever = retriever or WebRetriever()

    def scrape_text(self, url: str) -> str:
        html = self.retriever.fetch(url)
        soup = BeautifulSoup(html, "html.parser")
        return soup.get_text(" ", strip=True)
