import asyncio
from typing import List, Dict, Any


class DebateEngine:
    def __init__(self, providers: List[Any], rounds: int = 2):
        self.providers = providers
        self.rounds = max(1, rounds)

    async def _gather_round(self, prompt: str) -> List[Dict[str, Any]]:
        tasks = [provider.generate(prompt) for provider in self.providers]
        return await asyncio.gather(*tasks)

    async def run(self, prompt: str) -> Dict[str, Any]:
        responses: List[Dict[str, Any]] = []
        prior_outputs: List[str] = []

        for round_index in range(self.rounds):
            if round_index == 0:
                round_prompt = prompt
            else:
                round_prompt = (
                    f"Rebuttal round {round_index}: refine considering prior outputs: {prior_outputs}"
                )

            round_responses = await self._gather_round(round_prompt)
            for resp in round_responses:
                resp["round"] = round_index + 1
            responses.extend(round_responses)

            prior_outputs = [resp.get("output", "") for resp in round_responses if resp]

        return {"responses": responses}
