from __future__ import annotations

import pytest


pytestmark = pytest.mark.chaos


class BrokenDynamo:
    def put_item(self, *_, **__):
        raise ConnectionError("dynamo down")

    def get_item(self, *_ , **__):
        raise ConnectionError("dynamo down")


class MemoryEngine:
    def __init__(self, table):
        self.table = table

    def query(self, user_id: str) -> str:
        try:
            self.table.put_item(user_id, {"user": user_id})
        except Exception:
            pass

        try:
            _ = self.table.get_item(user_id)
        except Exception:
            return "fallback-response"

        return "success"


def test_query_survives_dynamo_outage():
    engine = MemoryEngine(BrokenDynamo())
    assert engine.query("abc") == "fallback-response"
