"""
Consent Manager — human-first consent framework for ALOE.

Controls:
- Web search (allow_web)
- Web scraping (allow_web)
- Memory (allow_memory)
- Storage (allow_storage)
- Multi-model debate (always safe)
"""


class ConsentManager:
    REQUIRED = ["allow_web", "allow_memory", "allow_storage"]

    def allowed(self, request: dict) -> bool:
        # If the request does not include consent fields, allow minimal usage
        for field in self.REQUIRED:
            if field not in request:
                continue

            if request[field] is False:
                # They denied this action — block features that use it
                return False

        return True
