from __future__ import annotations

import asyncio
import uuid
from dataclasses import dataclass, field
from typing import Any, Dict

import pytest


class FakeRedis:
    def __init__(self):
        self.data: Dict[str, Any] = {}

    async def get(self, key: str) -> Any:
        await asyncio.sleep(0)
        return self.data.get(key)

    async def set(self, key: str, value: Any) -> None:
        await asyncio.sleep(0)
        self.data[key] = value


class FakeBucket:
    def __init__(self, name: str):
        self.name = name
        self.objects: Dict[str, Dict[str, Any]] = {}

    def put_object(self, key: str, body: Any, metadata: Dict[str, Any] | None = None) -> None:
        self.objects[key] = {
            "Body": body,
            "Metadata": metadata or {},
            "ServerSideEncryption": metadata.get("encryption", "aws:kms") if metadata else "aws:kms",
        }

    def get_object(self, key: str) -> Dict[str, Any]:
        return self.objects[key]


class FakeTable:
    def __init__(self, name: str):
        self.name = name
        self.items: Dict[str, Dict[str, Any]] = {}

    def put_item(self, key: str, item: Dict[str, Any]):
        self.items[key] = item

    def get_item(self, key: str) -> Dict[str, Any] | None:
        return self.items.get(key)

    def delete_item(self, key: str) -> None:
        self.items.pop(key, None)


@dataclass
class LocalstackResources:
    bucket: FakeBucket
    table: FakeTable
    secrets: Dict[str, str] = field(default_factory=dict)
    kms_keys: Dict[str, str] = field(default_factory=dict)


@pytest.fixture(scope="session")
def localstack_env(monkeypatch: pytest.MonkeyPatch) -> Dict[str, str]:
    env = {
        "AWS_ACCESS_KEY_ID": "test",
        "AWS_SECRET_ACCESS_KEY": "test",
        "AWS_DEFAULT_REGION": "us-east-1",
    }
    for key, value in env.items():
        monkeypatch.setenv(key, value)
    return env


@pytest.fixture(scope="session")
def localstack_resources(localstack_env: Dict[str, str]) -> LocalstackResources:
    bucket = FakeBucket(name=f"toron-test-{uuid.uuid4().hex}")
    table = FakeTable(name=f"toron-memory-{uuid.uuid4().hex}")
    secrets = {"toron/api_key": "dummy"}
    kms_keys = {"default": "kms-key-arn"}
    return LocalstackResources(bucket=bucket, table=table, secrets=secrets, kms_keys=kms_keys)


@pytest.fixture()
def fake_redis() -> FakeRedis:
    return FakeRedis()


@pytest.fixture()
def temp_bucket(localstack_resources: LocalstackResources):
    return localstack_resources.bucket


@pytest.fixture()
def temp_table(localstack_resources: LocalstackResources):
    return localstack_resources.table
