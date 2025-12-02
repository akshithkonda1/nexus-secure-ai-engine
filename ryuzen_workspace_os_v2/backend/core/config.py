from pydantic import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Ryuzen Workspace OS V2"
    environment: str = "local"
    aws_region: str = "us-east-1"


settings = Settings()
