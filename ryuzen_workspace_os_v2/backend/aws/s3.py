from typing import Dict


BUCKETS = {
    "pages": "ryuzen-workspace-pages",
    "notes": "ryuzen-workspace-notes",
    "boards": "ryuzen-workspace-boards",
    "flows": "ryuzen-workspace-flows",
}


def put_object(bucket_key: str, key: str, body: str) -> Dict[str, str]:
    bucket_name = BUCKETS.get(bucket_key, bucket_key)
    return {"bucket": bucket_name, "key": key, "status": "uploaded"}
