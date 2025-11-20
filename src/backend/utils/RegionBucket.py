"""Region inference utilities."""
from __future__ import annotations

import ipaddress
from typing import Optional


COUNTRY_FALLBACK = "ZZ"


def ip_to_region(ip: Optional[str]) -> str:
    if not ip:
        return COUNTRY_FALLBACK
    try:
        parsed = ipaddress.ip_address(ip)
        if parsed.is_private or parsed.is_loopback:
            return "PRV"
    except ValueError:
        return COUNTRY_FALLBACK
    # Lightweight heuristic: use first octet for IPv4, first block for IPv6
    if ":" in ip:
        return (ip.split(":", 1)[0] or COUNTRY_FALLBACK).upper()[:6]
    return (ip.split(".")[0] or COUNTRY_FALLBACK).upper()


def fallback_region(region: Optional[str]) -> str:
    return region or COUNTRY_FALLBACK


__all__ = ["ip_to_region", "fallback_region", "COUNTRY_FALLBACK"]
