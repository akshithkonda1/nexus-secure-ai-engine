from fastapi import APIRouter
from pydantic import BaseModel
from .sessionMemory import load_from_redis, save_to_redis, load_from_s3, sync_session
from src.backend.services.toronLLM import generate_toron_reply
import time

router = APIRouter()

class ToronRequest(BaseModel):
    sessionId: str
    message: str

@router.post("/api/v1/toron/ask")
async def ask_toron(req: ToronRequest):

    # Load memory whenever possible
    memory = load_from_redis(req.sessionId) or load_from_s3(req.sessionId)

    if not memory:
        memory = {
            "sessionId": req.sessionId,
            "messages": []
        }

    # Append user message
    memory["messages"].append({
        "sender": "user",
        "text": req.message,
        "timestamp": time.time()
    })

    # Generate reply using hybrid memory
    reply = await generate_toron_reply(memory)

    memory["messages"].append({
        "sender": "toron",
        "text": reply,
        "timestamp": time.time()
    })

    # Sync memory back to Redis + S3
    sync_session(req.sessionId, memory)

    return {
        "reply": reply,
        "sessionId": req.sessionId
    }
