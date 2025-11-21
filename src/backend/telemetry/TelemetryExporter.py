import json
from typing import Any, Dict


class TelemetryExporter:
    def __init__(self, redact_keys: bool = True) -> None:
        self.redact_keys = redact_keys

    def _sanitize(self, data: Dict[str, Any]) -> Dict[str, Any]:
        if not self.redact_keys:
            return data
        return {k: v for k, v in data.items() if "user" not in k and "email" not in k}

    def to_console(self, aggregates: Dict[str, Any]) -> None:
        print(json.dumps(self._sanitize(aggregates), indent=2))

    def to_json_log(self, aggregates: Dict[str, Any]) -> str:
        return json.dumps(self._sanitize(aggregates), ensure_ascii=False)

    def to_external_dashboard(self, aggregates: Dict[str, Any]) -> Dict[str, Any]:
        payload = self._sanitize(aggregates)
        payload["pii"] = False
        return payload

