from dataclasses import dataclass


@dataclass
class AWSResourceConfig:
    region: str = "us-east-1"
    kms_key_alias: str = "alias/ryuzen-workspace"


def get_resource_config() -> AWSResourceConfig:
    return AWSResourceConfig()
