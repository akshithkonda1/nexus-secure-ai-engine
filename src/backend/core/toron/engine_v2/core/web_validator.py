"""
Web Validator — LLM entailment of claims vs evidence.
"""

import time

from ..runtime.cloudwatch_telemetry import CloudWatchTelemetry


class WebValidator:
    def __init__(self, adapter):
        self.adapter = adapter
        self.telemetry = CloudWatchTelemetry()

    async def validate(self, context):
        start = time.time()
        facts = context.get("facts", [])
        evidence = context.get("web_results", [])

        if not facts:
            result = {
                "validation": False,
                "supported": [],
                "contradicted": [],
                "unknown": [],
                "confidence": 0.3
            }
        elif not evidence:
            result = {
                "validation": False,
                "supported": [],
                "contradicted": [],
                "unknown": facts,
                "confidence": 0.3
            }
        else:
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

            result = {
                "validation": True,
                "supported": supported,
                "contradicted": contradicted,
                "unknown": unknown,
                "confidence": round(conf, 4),
                "web_evidence": {e["url"]: e["snippet"] for e in evidence}
            }

        latency_ms = (time.time() - start) * 1000
        self.telemetry.metric("WebValidationLatency", latency_ms)
        self.telemetry.log(
            "WebValidationCompleted",
            {
                "supported": len(result.get("supported", [])),
                "contradicted": len(result.get("contradicted", [])),
                "unknown": len(result.get("unknown", [])),
                "latency_ms": latency_ms,
            },
        )

        return result

    def _extract(self, resp):
        if hasattr(resp, "content"):
            c = resp.content
            if isinstance(c, list):
                return c[0].text
            return c
        if isinstance(resp, dict):
            return resp.get("content", "")
        return str(resp)
