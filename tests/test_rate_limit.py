"""Validate token bucket refill and allowance behaviour."""

from toron.rate_limit import TokenBucket


def test_consumes_tokens_and_blocks_when_empty(fake_clock):
    """Token bucket should deplete and block until tokens refill."""

    limiter = TokenBucket(capacity=2, fill_rate=1, time_provider=fake_clock)
    assert limiter.allow()
    assert limiter.allow()
    assert limiter.tokens == 0
    assert not limiter.allow()
    fake_clock.advance(2)
    assert limiter.allow()


def test_partial_refill(fake_clock):
    """Partial elapsed time should refill a fraction of tokens."""

    limiter = TokenBucket(capacity=5, fill_rate=2, time_provider=fake_clock)
    limiter.allow(tokens=3)
    fake_clock.advance(0.5)
    assert limiter.tokens == 2.0
    assert limiter.allow(tokens=2)
