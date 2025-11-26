"""HTML parser that strips unsafe tags and normalizes DOM."""
from __future__ import annotations

import logging
from typing import Iterable

from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

UNSAFE_TAGS: Iterable[str] = ["script", "style", "iframe", "form", "embed", "object", "noscript"]


def parse_html(html: str) -> BeautifulSoup:
    """Parse HTML into a BeautifulSoup DOM and remove unsafe elements."""

    soup = BeautifulSoup(html, "html.parser")
    removed = 0
    for tag in soup.find_all(UNSAFE_TAGS):
        tag.decompose()
        removed += 1
    logger.debug("Parsed HTML with %s removed unsafe tags", removed)
    return soup


def normalize_dom(soup: BeautifulSoup) -> BeautifulSoup:
    """Normalize DOM by stripping unsafe tags again as a safeguard."""

    for tag in soup.find_all(UNSAFE_TAGS):
        tag.decompose()
    return soup
