"""Structured extraction utilities for sandboxed HTML."""
from __future__ import annotations

import json
from datetime import datetime
from typing import Any, Dict, List

from bs4 import BeautifulSoup

from . import html_parser


class SafeExtractor:
    """Extract safe, structured content from sanitized HTML."""

    def __init__(self, dom_parser=html_parser.parse_html):
        self.dom_parser = dom_parser

    def extract(self, html: str) -> Dict[str, Any]:
        soup = self.dom_parser(html)
        normalized = html_parser.normalize_dom(soup)
        return {
            "headings": self._extract_headings(normalized),
            "paragraphs": self._extract_paragraphs(normalized),
            "tables": self._extract_tables(normalized),
            "links": self._extract_links(normalized),
            "extracted_at": datetime.utcnow().isoformat() + "Z",
        }

    def _extract_headings(self, soup: BeautifulSoup) -> List[Dict[str, str]]:
        headings: List[Dict[str, str]] = []
        for level in range(1, 7):
            for tag in soup.find_all(f"h{level}"):
                text = tag.get_text(strip=True)
                if text:
                    headings.append({"level": f"h{level}", "text": text})
        return headings

    def _extract_paragraphs(self, soup: BeautifulSoup) -> List[str]:
        paragraphs: List[str] = []
        for p in soup.find_all("p"):
            text = p.get_text(" ", strip=True)
            if text:
                paragraphs.append(text)
        return paragraphs

    def _extract_tables(self, soup: BeautifulSoup) -> List[List[List[str]]]:
        tables: List[List[List[str]]] = []
        for table in soup.find_all("table"):
            rows: List[List[str]] = []
            for row in table.find_all("tr"):
                cells = [cell.get_text(" ", strip=True) for cell in row.find_all(["th", "td"])]
                if cells:
                    rows.append(cells)
            if rows:
                tables.append(rows)
        return tables

    def _extract_links(self, soup: BeautifulSoup) -> List[Dict[str, str]]:
        links: List[Dict[str, str]] = []
        for link in soup.find_all("a"):
            href = link.get("href")
            text = link.get_text(" ", strip=True)
            if href and text:
                links.append({"href": href, "text": text})
        return links

    @staticmethod
    def to_json(data: Dict[str, Any]) -> str:
        return json.dumps(data, indent=2)


def extract(html: str) -> Dict[str, Any]:
    """Convenience wrapper to extract structured content."""

    extractor = SafeExtractor()
    return extractor.extract(html)
