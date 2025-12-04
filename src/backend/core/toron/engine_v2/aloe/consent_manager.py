"""
Consent Manager — ensures user explicitly allows:

- Web search
- Web scraping
- Memory usage
- Data storage

ALOE requires voluntary, explicit, revocable consent.
"""


class ConsentManager:
    REQUIRED = ["allow_web", "allow_memory", "allow_storage"]

    def allowed(self, request: dict) -> bool:
        for flag in self.REQUIRED:
            if flag not in request:
                return False
        return True
