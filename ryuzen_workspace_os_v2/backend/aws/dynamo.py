from typing import Dict, Any


def put_item(table: str, item: Dict[str, Any]) -> Dict[str, Any]:
    return {"table": table, "item": item, "status": "queued"}


def get_items(table: str, user_id: str) -> Dict[str, Any]:
    return {"table": table, "user_id": user_id, "items": []}
