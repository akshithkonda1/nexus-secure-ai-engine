from __future__ import annotations

import pytest

from .conftest import LocalstackResources


pytestmark = pytest.mark.integration


def test_memory_save_and_load(temp_table):
    temp_table.put_item("session-1", {"memory": "hello"})
    retrieved = temp_table.get_item("session-1")
    assert retrieved == {"memory": "hello"}


def test_memory_overwrite(temp_table):
    temp_table.put_item("session-2", {"memory": "first"})
    temp_table.put_item("session-2", {"memory": "second"})
    assert temp_table.get_item("session-2") == {"memory": "second"}


def test_memory_deletion(temp_table):
    temp_table.put_item("session-3", {"memory": "content"})
    temp_table.delete_item("session-3")
    assert temp_table.get_item("session-3") is None
