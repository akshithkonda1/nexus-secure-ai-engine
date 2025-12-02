from fastapi import Header, HTTPException


def verify_api_key(x_api_key: str | None = Header(default=None)):
    if not x_api_key:
        raise HTTPException(status_code=401, detail="Missing API key")
    return x_api_key
