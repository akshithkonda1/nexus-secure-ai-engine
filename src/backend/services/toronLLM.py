import random
import asyncio

async def fake_stream(text):
    """Simulate token streaming."""
    for t in text.split(" "):
        yield t + " "
        await asyncio.sleep(0.02)

async def generate_toron_reply(memory):
    """Eventually: call GPT-5, Claude, DeepSeek, Gemini, Qwen via Toron Fusion."""
    
    full_context = "\n".join(
        f"{m['sender']}: {m['text']}"
        for m in memory["messages"][-10:]  # last 10 messages only (safety)
    )

    # Stub logic for now
    base = random.choice([
        "Understood. Here's what I found:",
        "Let's continue:",
        "Here's the next step:",
        "Breaking it down:"
    ])

    return f"{base} Based on your last message, here's what matters → {memory['messages'][-1]['text']}"
