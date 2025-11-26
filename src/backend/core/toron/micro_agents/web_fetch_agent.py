"""Micro-agent for sandboxed web fetching."""
from __future__ import annotations

import logging
import os
from datetime import datetime

from src.backend.core.toron.web_sandbox import web_sandbox_client

LOG_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../logs/web_access.log"))


def _get_logger() -> logging.Logger:
    logger = logging.getLogger(__name__)
    if not logger.handlers:
        os.makedirs(os.path.dirname(LOG_PATH), exist_ok=True)
        handler = logging.FileHandler(LOG_PATH)
        formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
    return logger


def run_web_fetch(url: str) -> str:
    """Fetch sanitized HTML via the web sandbox."""

    logger = _get_logger()
    logger.info("web_fetch_agent start session for %s", url)
    html = web_sandbox_client.fetch_url(url)
    logger.info("web_fetch_agent completed for %s", url)
    return html


def describe_run(url: str) -> dict:
    return {
        "action": "web_fetch",
        "url": url,
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }
