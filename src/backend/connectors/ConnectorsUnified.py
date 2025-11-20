import asyncio
import random
import time
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

from .ConnectorHealth import (
    compute_health,
    detect_outage_patterns,
    detect_rate_limit_pressure,
    detect_slow_sync,
    detect_token_expiry,
)
from .ConnectorState import ConnectorState


@dataclass
class BaseConnector:
    name: str
    region: str
    token: str
    refresh_token: Optional[str] = None
    endpoint_map: Dict[str, str] = field(default_factory=dict)
    throttle_window: float = 60.0
    last_sync: Optional[float] = None
    state: ConnectorState = field(default_factory=ConnectorState)

    async def validate_token(self) -> bool:
        self.state.token_age = time.time() - (self.state.last_sync or time.time())
        return bool(self.token and len(self.token) > 10)

    async def refresh(self) -> None:
        if self.refresh_token:
            self.token = f"refreshed-{int(time.time())}"
            self.state.token_age = 0

    async def metadata(self) -> List[Dict[str, Any]]:
        now = time.time()
        seed = hash((self.name, int(now // self.throttle_window))) & 0xFFFFFFFF
        rng = random.Random(seed)
        items = []
        for idx in range(rng.randint(2, 5)):
            items.append(
                {
                    "id": f"{self.name}-{idx}",
                    "title": f"{self.name} item {idx}",
                    "updated_at": now - idx * 60,
                    "size": rng.randint(1_000, 10_000),
                }
            )
        return items

    async def sync(self) -> Dict[str, Any]:
        start = time.time()
        self.state.status = "syncing"
        try:
            if not await self.validate_token():
                await self.refresh()
            meta = await self.metadata()
            await asyncio.sleep(random.uniform(0.05, 0.2))
            self.state.items_indexed = len(meta)
            self.state.last_sync = start
            self.state.status = "connected"
            self.state.metadata.update({"sync_latency_ms": int((time.time() - start) * 1000)})
            self.state.health_score = compute_health(self.state)
            return {"source": self.name, "region": self.region, "metadata": meta}
        except Exception as exc:  # pragma: no cover - defensive
            self.state.status = "error"
            self.state.error_count += 1
            self.state.metadata["last_error"] = str(exc)
            self.state.health_score = compute_health(self.state)
            return {"source": self.name, "region": self.region, "metadata": []}

    @property
    def endpoint(self) -> Optional[str]:
        return self.endpoint_map.get(self.region) or self.endpoint_map.get("global")


class ConnectorsUnified:
    def __init__(self, region: str = "global") -> None:
        self.region = region
        self.connectors: Dict[str, BaseConnector] = {
            "google_drive": self._connector("google_drive", "https://www.googleapis.com"),
            "google_calendar": self._connector("google_calendar", "https://www.googleapis.com"),
            "outlook": self._connector("outlook", "https://graph.microsoft.com"),
            "microsoft_calendar": self._connector("microsoft_calendar", "https://graph.microsoft.com"),
            "icloud": self._connector("icloud", "https://icloud.com"),
            "notion": self._connector("notion", "https://api.notion.com"),
            "slack": self._connector("slack", "https://slack.com/api"),
            "canvas": self._connector("canvas", "https://canvas.instructure.com"),
            "github": self._connector("github", "https://api.github.com"),
            "onedrive": self._connector("onedrive", "https://graph.microsoft.com"),
            "custom_enterprise": self._connector("custom_enterprise", "https://enterprise.example.com"),
        }

    def _connector(self, name: str, endpoint: str) -> BaseConnector:
        token = f"token-{name}-{int(time.time())}"
        endpoints = {
            "us-east": endpoint,
            "eu": endpoint.replace("https://", "https://eu-"),
            "apac": endpoint.replace("https://", "https://ap-"),
            "global": endpoint,
        }
        return BaseConnector(name=name, region=self.region, token=token, endpoint_map=endpoints)

    async def sync_all(self) -> Dict[str, Any]:
        results: Dict[str, Any] = {}
        for name in self.connectors:
            method = getattr(self, f"sync_{name}", None)
            if callable(method):
                results[name] = await method()
        return results

    async def _sync_with_health(self, name: str) -> Dict[str, Any]:
        connector = self.connectors[name]
        payload = await connector.sync()
        state = connector.state
        state.health_score = compute_health(state)
        state.metadata["rate_limit_pressure"] = detect_rate_limit_pressure(state)
        state.metadata["token_expired"] = detect_token_expiry(state)
        state.metadata["outage_pattern"] = detect_outage_patterns(state)
        state.metadata["slow_sync"] = detect_slow_sync(state)
        payload["health"] = {
            "score": state.health_score,
            "status": state.status,
            "last_sync": state.last_sync,
            "signals": {
                "rate_limit": state.metadata.get("rate_limit_pressure"),
                "token_expired": state.metadata.get("token_expired"),
                "outage": state.metadata.get("outage_pattern"),
                "slow": state.metadata.get("slow_sync"),
            },
        }
        payload["metadata"] = [self._sanitize(item) for item in payload.get("metadata", [])]
        return payload

    def _sanitize(self, item: Dict[str, Any]) -> Dict[str, Any]:
        allowed_keys = {"id", "title", "updated_at", "size"}
        return {k: v for k, v in item.items() if k in allowed_keys}

    async def sync_google_drive(self) -> Dict[str, Any]:
        return await self._sync_with_health("google_drive")

    async def sync_google_calendar(self) -> Dict[str, Any]:
        return await self._sync_with_health("google_calendar")

    async def sync_outlook(self) -> Dict[str, Any]:
        return await self._sync_with_health("outlook")

    async def sync_microsoft_calendar(self) -> Dict[str, Any]:
        return await self._sync_with_health("microsoft_calendar")

    async def sync_icloud(self) -> Dict[str, Any]:
        return await self._sync_with_health("icloud")

    async def sync_notion(self) -> Dict[str, Any]:
        return await self._sync_with_health("notion")

    async def sync_slack(self) -> Dict[str, Any]:
        return await self._sync_with_health("slack")

    async def sync_canvas(self) -> Dict[str, Any]:
        return await self._sync_with_health("canvas")

    async def sync_github(self) -> Dict[str, Any]:
        return await self._sync_with_health("github")

    async def sync_onedrive(self) -> Dict[str, Any]:
        return await self._sync_with_health("onedrive")

    async def sync_custom_enterprise(self) -> Dict[str, Any]:
        return await self._sync_with_health("custom_enterprise")

