from __future__ import annotations

import pytest

from .conftest import LocalstackResources


pytestmark = pytest.mark.integration


def test_store_and_retrieve_object(temp_bucket):
    temp_bucket.put_object("key", b"payload", metadata={"encryption": "aws:kms", "meta": "x"})
    obj = temp_bucket.get_object("key")
    assert obj["Body"] == b"payload"
    assert obj["Metadata"]["meta"] == "x"
    assert obj["ServerSideEncryption"] == "aws:kms"


def test_metadata_preservation(temp_bucket):
    meta = {"author": "toron", "encryption": "aws:kms"}
    temp_bucket.put_object("meta-key", "value", metadata=meta)
    stored = temp_bucket.get_object("meta-key")
    assert stored["Metadata"]["author"] == "toron"
    assert stored["ServerSideEncryption"] == "aws:kms"
