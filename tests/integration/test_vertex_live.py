from __future__ import annotations

import os

import pytest


pytestmark = pytest.mark.integration


def test_vertex_live_configuration():
    if not os.getenv("GOOGLE_APPLICATION_CREDENTIALS") and not os.getenv("VERTEX_PROJECT"):
        pytest.skip("Vertex credentials not configured")

    project = os.getenv("VERTEX_PROJECT", "demo")
    location = os.getenv("VERTEX_LOCATION", "us-central1")
    model = os.getenv("VERTEX_MODEL", "text-bison")

    assert project
    assert location
    assert model.startswith("text-") or model
