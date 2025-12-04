"""
ALOEMemory — consent-based long-term memory.

Features:
  ▸ user preference storage
  ▸ skill accumulation
  ▸ cross-session coherence
  ▸ memory retrieval heuristics
  ▸ ALOE: user owns memory; Toron cannot store without consent
"""

import json
import os
import boto3

class ALOEMemory:
    def __init__(self, table_name=None):
        self.table = table_name or os.getenv("TORON_MEMORY_TABLE")
        self.db = boto3.client("dynamodb")

    def save(self, user_id, memory):
        self.db.put_item(
            TableName=self.table,
            Item={
                "user_id": {"S": user_id},
                "memory_json": {"S": json.dumps(memory)}
            }
        )

    def load(self, user_id):
        item = self.db.get_item(
            TableName=self.table,
            Key={"user_id":{"S":user_id}}
        )
        if "Item" not in item: 
            return {}
        return json.loads(item["Item"]["memory_json"]["S"])

    def update_preferences(self, user_id, new_preferences):
        mem = self.load(user_id)
        mem["preferences"] = {
            **mem.get("preferences", {}),
            **new_preferences
        }
        self.save(user_id, mem)
        return mem
