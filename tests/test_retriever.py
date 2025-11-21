"""Exercise retriever logic with a fake HTTP session."""

import pytest

from toron.retriever import Retriever


def test_fetch_json_with_fake_session(fake_session):
    """JSON payloads should be returned directly from the fake session."""

    retriever = Retriever(session=fake_session)
    assert retriever.fetch_json("https://example.com") == {"message": "ok"}


def test_fetch_text_handles_error_status(fake_session):
    """HTTP errors should raise a runtime exception."""

    failing_session = type("FailingSession", (), {"get": lambda self, url, timeout=5: type("Resp", (), {"status_code": 500, "text": "boom"})()})()
    retriever = Retriever(session=failing_session)
    with pytest.raises(RuntimeError):
        retriever.fetch_text("https://example.com/error")
