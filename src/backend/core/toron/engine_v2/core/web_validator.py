"""
Web Validator — LLM entailment of claims vs evidence.
"""


class WebValidator:
    def __init__(self, adapter):
        self.adapter = adapter

    async def validate(self, context):
        facts = context.get("facts", [])
        evidence = context.get("web_results", [])

        if not facts:
            return {
                "validation": False,
                "supported": [],
                "contradicted": [],
                "unknown": [],
                "confidence": 0.3
            }

        if not evidence:
            return {
                "validation": False,
                "supported": [],
                "contradicted": [],
                "unknown": facts,
                "confidence": 0.3
            }

        ev_text = "\n\n".join(
            f"{e['title']} — {e['snippet']}"
            for e in evidence[:5]
        )[:2000]

        supported = []
        contradicted = []
        unknown = []

        for f in facts[:5]:
            claim = f["claim"]

            prompt = f"""
Evaluate this claim against the evidence.

Claim: {claim}

Evidence:
{ev_text}

Answer one word: SUPPORT, CONTRADICT, UNKNOWN
"""

            messages = [{"role": "user", "content": prompt}]

            try:
                resp, _ = await self.adapter.dispatch(
                    messages,
                    "claude-3-5-haiku-20241022"
                )
                verdict = self._extract(resp).upper()

                if "SUPPORT" in verdict:
                    supported.append(f)
                elif "CONTRADICT" in verdict:
                    contradicted.append(f)
                else:
                    unknown.append(f)

            except Exception:
                unknown.append(f)

        total = len(supported) + len(contradicted) + len(unknown)
        conf = len(supported) / max(total, 1)

        return {
            "validation": True,
            "supported": supported,
            "contradicted": contradicted,
            "unknown": unknown,
            "confidence": round(conf, 4),
            "web_evidence": {e["url"]: e["snippet"] for e in evidence}
        }

    def _extract(self, resp):
        if hasattr(resp, "content"):
            c = resp.content
            if isinstance(c, list):
                return c[0].text
            return c
        if isinstance(resp, dict):
            return resp.get("content", "")
        return str(resp)
