"""
Debate Engine — Toron v2.0
Two-round multi-model debate:
  • Round 1: Parallel responses
  • Round 2: Mutual critique
Ultra-fast, ALOE/QGC compliant.
"""

import asyncio
import time

from ..runtime.cloudwatch_telemetry import CloudWatchTelemetry


class DebateEngine:
    def __init__(self, adapter):
        self.adapter = adapter
        self.telemetry = CloudWatchTelemetry()

    async def run(self, context):
        start = time.time()
        models = context["selected_models"]
        prompt = context["prompt"]

        messages = context.get(
            "messages",
            [{"role": "user", "content": prompt}]
        )

        # -----------------------------
        # ROUND 1 — PARALLEL RESPONSES
        # -----------------------------
        tasks = [
            self.adapter.dispatch(messages, model)
            for model in models
        ]

        results = await asyncio.gather(*tasks, return_exceptions=True)

        model_outputs = {}
        for model, result in zip(models, results):
            if isinstance(result, Exception):
                model_outputs[model] = f"[Error: {str(result)}]"
            else:
                output, meta = result
                model_outputs[model] = self._extract_text(output)

        # -----------------------------
        # ROUND 2 — CRITIQUE
        # -----------------------------
        critiques = {}

        for model in models:
            others = "\n\n".join([
                f"Model {m}:\n{txt}"
                for m, txt in model_outputs.items()
                if m != model
            ])

            critique_prompt = f"""
You are participating in a multi-model debate.

Review the following responses analytically and constructively.
Identify factual issues, unclear reasoning, and which segments appear strongest.

{others}

Summarize your critique clearly.
"""

            critique_messages = [
                {"role": "user", "content": critique_prompt}
            ]

            try:
                critique_output, _ = await self.adapter.dispatch(
                    critique_messages, model
                )
                critiques[model] = self._extract_text(critique_output)
            except Exception as e:
                critiques[model] = f"[Critique error: {str(e)}]"

        result = {
            "model_outputs": model_outputs,
            "critiques": critiques,
            "models_used": models
        }

        latency_ms = (time.time() - start) * 1000
        self.telemetry.metric("DebateLatency", latency_ms)
        self.telemetry.log(
            "DebateCompleted",
            {
                "models": models,
                "latency_ms": latency_ms,
                "prompt_length": len(prompt or ""),
            },
        )

        return result

    def _extract_text(self, resp):
        if hasattr(resp, "content"):
            c = resp.content
            if isinstance(c, list):
                return c[0].text
            return c
        if isinstance(resp, dict):
            return resp.get("content", str(resp))
        return str(resp)
