"""Scale model forecaster for public beta readiness."""
from dataclasses import dataclass
from typing import Dict, List


@dataclass
class ScaleScenario:
    """Projection for a single DAU level."""

    daily_active_users: int
    cpu_projection: float
    rps_projection: float
    opus_load_share: float


@dataclass
class ScaleModelReport:
    """Aggregate projection across all scale scenarios."""

    scenarios: List[ScaleScenario]
    total_projected_rps: float

    def as_dict(self) -> Dict[str, object]:
        return {
            "scenarios": [scenario.__dict__ for scenario in self.scenarios],
            "total_projected_rps": self.total_projected_rps,
        }


class ScaleModelForecaster:
    """Produces deterministic forecasts for DAU growth scenarios."""

    def __init__(self, rps_per_user: float = 0.08, cpu_per_rps: float = 0.0025) -> None:
        self.rps_per_user = rps_per_user
        self.cpu_per_rps = cpu_per_rps
        self.dau_targets = (10_000, 50_000, 100_000)

    def _project(self, dau: int) -> ScaleScenario:
        rps_projection = round(dau * self.rps_per_user, 2)
        cpu_projection = round(rps_projection * self.cpu_per_rps, 2)
        opus_load_share = round(rps_projection * 0.35, 2)
        return ScaleScenario(
            daily_active_users=dau,
            cpu_projection=cpu_projection,
            rps_projection=rps_projection,
            opus_load_share=opus_load_share,
        )

    def forecast(self) -> ScaleModelReport:
        scenarios = [self._project(dau) for dau in self.dau_targets]
        total_projected_rps = round(sum(item.rps_projection for item in scenarios), 2)
        return ScaleModelReport(scenarios=scenarios, total_projected_rps=total_projected_rps)
