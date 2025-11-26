from typing import Awaitable, Callable, Dict


async def _unconfigured_provider(provider: str, prompt: str) -> str:
    """Fallback implementation when a provider client is not available."""

    return f"[{provider}] provider is not configured (prompt: {prompt})"


async def gpt5_generate(prompt: str) -> str:
    return await _unconfigured_provider("gpt5", prompt)


async def claude_generate(prompt: str) -> str:
    return await _unconfigured_provider("claude", prompt)


async def gemini_generate(prompt: str) -> str:
    return await _unconfigured_provider("gemini", prompt)


async def deepseek_generate(prompt: str) -> str:
    return await _unconfigured_provider("deepseek", prompt)


async def qwen_generate(prompt: str) -> str:
    return await _unconfigured_provider("qwen", prompt)


PROVIDER_ROUTER: Dict[str, Callable[[str], Awaitable[str]]] = {
    "gpt5": gpt5_generate,
    "claude": claude_generate,
    "gemini": gemini_generate,
    "deepseek": deepseek_generate,
    "qwen": qwen_generate,
}


async def call_model(provider: str, prompt: str) -> str:
    generator = PROVIDER_ROUTER.get(provider)
    if generator is None:
        return "MODEL_ERROR"

    return await generator(prompt)
