import asyncio
from .modelRouter import call_model
from .semanticSearch import semantic_relevant_memory
from .safetyPipeline import sanitize_input, sanitize_output
from .promptOptimizer import optimize_prompt
from .fusionWeights import fuse_outputs


async def toron_fusion_process(user_input, session_memory):
    """Main Toron intelligence pipeline."""

    # 1. Sanitize input (PII removal, profanity, injection)
    clean_input = sanitize_input(user_input)

    # 2. Retrieve context window
    context = semantic_relevant_memory(session_memory, clean_input)

    # 3. Optimize prompt before sending to models
    optimized_prompt = optimize_prompt(clean_input, context)

    # 4. Call multiple LLMs in parallel
    model_tasks = await asyncio.gather(
        call_model("gpt5", optimized_prompt),
        call_model("claude", optimized_prompt),
        call_model("gemini", optimized_prompt),
        call_model("deepseek", optimized_prompt),
        call_model("qwen", optimized_prompt),
    )

    results = {
        "gpt5": model_tasks[0],
        "claude": model_tasks[1],
        "gemini": model_tasks[2],
        "deepseek": model_tasks[3],
        "qwen": model_tasks[4],
    }

    # 5. Fuse results using confidence scoring + semantic similarity
    fused = fuse_outputs(results)

    # 6. Final output sanitization
    safe = sanitize_output(fused)

    return safe
