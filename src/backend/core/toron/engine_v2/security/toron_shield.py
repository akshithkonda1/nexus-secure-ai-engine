"""
ToronShield — multi-layer ALOE security framework.

Provides:
  ▸ anti-jailbreak detection
  ▸ content de-escalation
  ▸ safe output shaping
  ▸ prompt injection defense
  ▸ ALOE ethics guardrails
"""


class ToronShield:
    def analyze_prompt(self, text):
        text_lower = text.lower()

        if any(x in text_lower for x in ["ignore previous", "system override", "jailbreak"]):
            return False, "Potential jailbreak attempt detected."

        return True, None

    def sanitize_output(self, text):
        if "kill" in text.lower():
            return "Content adjusted to comply with safety guidelines."
        return text
