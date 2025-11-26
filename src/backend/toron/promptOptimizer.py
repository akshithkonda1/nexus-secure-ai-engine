def optimize_prompt(user_input, context):
    base = (
      "You are Toron, the adaptive multi-model engine of Ryuzen. "
      "Use precise, structured reasoning. Be concise. "
      "Here is conversation context:\n"
    )

    ctx = "\n".join([f"{m['sender']}: {m['text']}" for m in context])

    return f"{base}\n{ctx}\nUser: {user_input}\nToron:"
