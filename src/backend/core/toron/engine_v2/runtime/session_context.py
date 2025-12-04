"""
SessionContext — holds per-request state.
"""

class SessionContext:
    def __init__(self):
        self.data = {}

    def set(self, key, val):
        self.data[key] = val

    def get(self, key):
        return self.data.get(key)
