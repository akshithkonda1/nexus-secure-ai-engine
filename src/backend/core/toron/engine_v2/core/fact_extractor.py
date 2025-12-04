"""
Fact Extractor — LLM claim extraction.
Extracts structured, verifiable claims from debate output.
"""

import json
import re


class FactExtractor:
    def __init__(self, adapter):
        self.adapter = adapter

    async def extract(self, context):
        debate = context.get("debate_result") or {}
        outputs = debate.get("model_outputs", {})

        if not outputs:
            return {"facts": []}

        combined = "\n\n".join(
            f"Model {m}:\n{o}" for m, o in outputs.items()
        )[:3000]

        prompt = f"""
Extract factual claims from the following text.

Return ONLY a JSON array with objects like:
[
  {{"claim": "...", "source_model": "model", "confidence": 0.8}}
]

Text:
{combined}

JSON:
"""

        messages = [{"role": "user", "content": prompt}]

        try:
            resp, _ = await self.adapter.dispatch(messages, "gpt-4o-mini")
            text = self._extract_text(resp).strip()

            # Strip markdown fences
            if text.startswith("```"):
                text = text.split("```", 2)[1]

            facts = json.loads(text)

            valid = []
            for f in facts:
                if isinstance(f, dict) and "claim" in f:
                    valid.append({
                        "claim": f["claim"],
                        "source_model": f.get("source_model", "unknown"),
                        "confidence": float(f.get("confidence", 0.5))
                    })

            return {"facts": valid[:10]}

        except Exception:
            # fallback: naive sentence split
            sentences = re.split(r"[.!?]", combined)
            fallback = [
                {"claim": s.strip(), "source_model": "unknown", "confidence": 0.5}
                for s in sentences
                if len(s.strip()) > 30
            ]
            return {"facts": fallback[:10]}

    def _extract_text(self, resp):
        if hasattr(resp, "content"):
            c = resp.content
            if isinstance(c, list):
                return c[0].text
            return c
        if isinstance(resp, dict):
            return resp.get("content", str(resp))
        return str(resp)
