import asyncio
from services.llmProviders import (
    gpt5_generate,
    claude_generate,
    gemini_generate,
    deepseek_generate,
    qwen_generate
)


async def call_model(provider, prompt):
    if provider == "gpt5": return await gpt5_generate(prompt)
    if provider == "claude": return await claude_generate(prompt)
    if provider == "gemini": return await gemini_generate(prompt)
    if provider == "deepseek": return await deepseek_generate(prompt)
    if provider == "qwen": return await qwen_generate(prompt)
    return "MODEL_ERROR"
