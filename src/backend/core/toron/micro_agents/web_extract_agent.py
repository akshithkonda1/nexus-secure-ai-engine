"""Micro-agent for structured extraction from sanitized HTML."""
from __future__ import annotations

import logging
import os
from datetime import datetime
from typing import Any, Dict

from src.backend.core.toron.web_sandbox import safe_extractor

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


def run_web_extract(html: str) -> Dict[str, Any]:
    """Extract structured data from sanitized HTML."""

    logger = _get_logger()
    logger.info("web_extract_agent start")
    data = safe_extractor.extract(html)
    logger.info("web_extract_agent completed")
    return data


def describe_run() -> dict:
    return {
        "action": "web_extract",
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }
