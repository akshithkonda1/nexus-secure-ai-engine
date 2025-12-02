from typing import Dict


SECRET_PATH_TEMPLATE = "/ryuzen/users/{user_id}/{provider}"


def store_secret(user_id: str, provider: str, token: str) -> Dict[str, str]:
    return {"path": SECRET_PATH_TEMPLATE.format(user_id=user_id, provider=provider), "status": "stored"}


def read_secret(user_id: str, provider: str) -> Dict[str, str | None]:
    return {"path": SECRET_PATH_TEMPLATE.format(user_id=user_id, provider=provider), "token": None}
