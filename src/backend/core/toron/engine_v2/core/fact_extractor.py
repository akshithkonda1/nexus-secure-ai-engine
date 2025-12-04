"""
Fact Extractor — extracts verifiable claims from debate output
"""

class FactExtractor:
    async def extract(self, context):
        debate = context["debate_result"]
        return {"facts": ["placeholder fact"]}
