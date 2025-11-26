def fuse_outputs(outputs):
    """
    Select output using weighted majority:
    Claude → best at reasoning
    GPT5 → best at creativity + structure
    Gemini → best factuality
    """

    weights = {
        "claude": 0.40,
        "gpt5": 0.30,
        "gemini": 0.20,
        "deepseek": 0.07,
        "qwen": 0.03
    }

    scored = []
    for k, v in outputs.items():
        scored.append((weights.get(k, 0), v))

    scored.sort(reverse=True)
    return scored[0][1]
