from src.backend.core.toron.engine.debate_engine import DebateEngine
from src.backend.core.toron.engine.model_router import ModelRouter
from src.backend.core.toron.engine.orchestrator import Orchestrator
from src.backend.core.toron.engine.toron_engine import ToronEngine
from src.backend.rate_limit.concurrency_gate import ConcurrencyGate
from src.backend.rate_limit.global_rate_limiter import GlobalRateLimiter
from src.backend.rate_limit.user_rate_limiter import UserRateLimiter
from src.backend.telemetry.telemetry_aggregator import TelemetryAggregator


def test_toron_engine_process():
    telemetry = TelemetryAggregator()
    engine = ToronEngine(
        router=ModelRouter(),
        orchestrator=Orchestrator(telemetry),
        debate_engine=DebateEngine(reviewers=1),
        global_rate_limiter=GlobalRateLimiter(max_requests=10, window_seconds=1),
        user_rate_limiter=UserRateLimiter(max_requests=10, window_seconds=1),
        concurrency_gate=ConcurrencyGate(max_concurrent=2),
    )

    result = engine.process("hello", user_id="tester", context={"analysis": True})
    assert isinstance(result, str)
    assert "hello" in result

    tokens = list(engine.process("stream", user_id="tester", stream=True))
    assert tokens
    assert all(isinstance(token, str) for token in tokens)
