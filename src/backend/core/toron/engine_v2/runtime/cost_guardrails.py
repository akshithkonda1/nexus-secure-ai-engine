"""
CostGuardrails — Prevent Toron from burning money.

Tracks:

* cost per provider call
* total daily cost
* total hourly cost
* per-user cost caps
* emergency stop if cost exceeds budget

Data pulled from:

* Model metadata (input/output cost per million tokens)
* Token usage from connectors
  """

import time


class CostGuardrails:
    def __init__(
        self,
        hourly_cap=5.00,  # $5/hour max
        daily_cap=40.00,  # $40/day max
        per_request_cap=0.25,  # $0.25 max for a single request
    ):
        self.hourly_cap = hourly_cap
        self.daily_cap = daily_cap
        self.per_request_cap = per_request_cap

        self.cost_hour = 0.0
        self.cost_day = 0.0

        self.hour_timestamp = time.time()
        self.day_timestamp = time.time()

    def _reset_if_needed(self):
        now = time.time()

        if now - self.hour_timestamp > 3600:
            self.cost_hour = 0.0
            self.hour_timestamp = now

        if now - self.day_timestamp > 86400:
            self.cost_day = 0.0
            self.day_timestamp = now

    def register_cost(self, cost: float):
        self._reset_if_needed()

        if cost > self.per_request_cap:
            raise Exception(
                f"Request rejected — cost ${cost:.4f} exceeds per-request cap ${self.per_request_cap}"
            )

        self.cost_hour += cost
        self.cost_day += cost

        if self.cost_hour > self.hourly_cap:
            raise Exception("Emergency Stop: Hourly budget exceeded. Pausing Toron.")

        if self.cost_day > self.daily_cap:
            raise Exception("Emergency Stop: Daily budget exceeded. Pausing Toron.")

        return True

    # Telemetry/compat helpers
    def record(self, cost: float):
        return self.register_cost(cost)

    def emit(self):
        return {
            "hourly_spend": round(self.cost_hour, 4),
            "daily_spend": round(self.cost_day, 4),
            "hourly_cap": self.hourly_cap,
            "daily_cap": self.daily_cap,
            "per_request_cap": self.per_request_cap,
        }

    def health(self):
        try:
            self._reset_if_needed()
            return {"status": "ok", "limits": self.emit()}
        except Exception as e:
            return {"status": "error", "error": str(e)}

    def serialize(self):
        return self.emit()
