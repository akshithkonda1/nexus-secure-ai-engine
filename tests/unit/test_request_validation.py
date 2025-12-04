from __future__ import annotations

from typing import Any

import pytest


class ValidationError(Exception):
    pass


def validate_request(payload: dict[str, Any]) -> dict[str, Any]:
    if not isinstance(payload, dict):
        raise ValidationError("payload must be a dict")

    prompt = payload.get("prompt")
    if not prompt or not isinstance(prompt, str):
        raise ValidationError("prompt must be non-empty string")

    messages = payload.get("messages", [])
    if not isinstance(messages, list):
        raise ValidationError("messages must be a list")
    if len(messages) == 0:
        raise ValidationError("messages cannot be empty")
    if any(not isinstance(m, str) or len(m) == 0 for m in messages):
        raise ValidationError("messages must be non-empty strings")

    metadata = payload.get("metadata", {})
    if metadata is not None and not isinstance(metadata, dict):
        raise ValidationError("metadata must be dict")

    models = payload.get("models", [])
    if not isinstance(models, list) or any(not isinstance(m, str) or not m for m in models):
        raise ValidationError("models must be list of identifiers")
    if len(models) == 0:
        raise ValidationError("at least one model required")

    max_length = 2048
    if any(len(m) > max_length for m in messages):
        raise ValidationError("message too long")

    return payload


def test_valid_inputs():
    payload = {
        "prompt": "hello",
        "messages": ["hi", "there"],
        "metadata": {"tenant": "demo"},
        "models": ["gpt", "claude"],
    }
    assert validate_request(payload) == payload


def test_invalid_prompt():
    with pytest.raises(ValidationError):
        validate_request({"prompt": None, "messages": ["hi"], "models": ["gpt"]})


def test_empty_messages():
    with pytest.raises(ValidationError):
        validate_request({"prompt": "hi", "messages": [], "models": ["gpt"]})


def test_overlong_messages():
    long_message = "x" * 3000
    with pytest.raises(ValidationError):
        validate_request({"prompt": "hi", "messages": [long_message], "models": ["gpt"]})


def test_invalid_metadata():
    with pytest.raises(ValidationError):
        validate_request({"prompt": "hi", "messages": ["x"], "metadata": "oops", "models": ["gpt"]})


def test_invalid_model_list():
    with pytest.raises(ValidationError):
        validate_request({"prompt": "hi", "messages": ["x"], "models": ["", None]})
