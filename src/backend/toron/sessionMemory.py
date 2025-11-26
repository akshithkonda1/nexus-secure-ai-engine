import redis
import json
import time
from datetime import datetime
import boto3
import uuid

# Redis for fast-access short-term memory
r = redis.Redis(host="localhost", port=6379, decode_responses=True)

s3 = boto3.client("s3")
BUCKET = "ryuzen-session-memory"

def save_to_redis(session_id, payload):
    r.setex(
        f"session:{session_id}",
        86400,  # 24 hours expiration
        json.dumps(payload)
    )

def load_from_redis(session_id):
    data = r.get(f"session:{session_id}")
    return json.loads(data) if data else None

def save_to_s3(session_id, payload):
    key = f"sessions/{session_id}.json"
    s3.put_object(
        Bucket=BUCKET,
        Key=key,
        Body=json.dumps(payload),
        ContentType="application/json"
    )

def load_from_s3(session_id):
    key = f"sessions/{session_id}.json"
    try:
        obj = s3.get_object(Bucket=BUCKET, Key=key)
        return json.loads(obj["Body"].read().decode('utf-8'))
    except:
        return None

def sync_session(session_id, memory):
    """Save latest memory to S3 while keeping Redis fresh."""
    save_to_redis(session_id, memory)
    save_to_s3(session_id, memory)
