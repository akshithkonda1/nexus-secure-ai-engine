"""
Message Normalizer — converts messages to provider-specific format.
"""


class MessageNormalizer:

    @staticmethod
    def normalize_for_provider(messages, provider):
        if provider in ["openai", "azure", "mistral", "groq"]:
            return MessageNormalizer._openai(messages)
        if provider in ["anthropic", "aws-bedrock"]:
            return MessageNormalizer.to_anthropic_format(messages)
        if provider == "gcp-vertex":
            return MessageNormalizer._vertex(messages)
        return messages

    @staticmethod
    def _openai(messages):
        if not isinstance(messages, list):
            return []
        out = []
        for m in messages:
            if isinstance(m, dict) and "role" in m and "content" in m:
                out.append(m)
            elif isinstance(m, str):
                out.append({"role": "user", "content": m})
        return out

    @staticmethod
    def to_anthropic_format(messages):
        if isinstance(messages, tuple) and len(messages) == 2:
            return messages

        system = ""
        user_msgs = []
        for m in messages:
            if isinstance(m, dict):
                if m.get("role") == "system":
                    system = m.get("content", "")
                else:
                    user_msgs.append(m)
            elif isinstance(m, str):
                user_msgs.append({"role": "user", "content": m})
        return system, user_msgs

    @staticmethod
    def _vertex(messages):
        if isinstance(messages, str):
            return messages
        for m in reversed(messages):
            if isinstance(m, dict) and m.get("role") == "user":
                return m.get("content", "")
            if isinstance(m, str):
                return m
        return ""
