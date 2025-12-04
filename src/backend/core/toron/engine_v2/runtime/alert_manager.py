"""
AlertManager — sends high-severity alerts when:
- SLO violations occur
- Circuit breakers trip
- Provider outage persists
- Cost guardrail triggered
- Model reliability degrades
"""

import boto3
import json
import os


class AlertManager:
    def __init__(self):
        topic_arn = os.getenv("TORON_SNS_TOPIC_ARN")
        self.sns = boto3.client("sns")
        self.topic_arn = topic_arn

    def alert(self, title: str, payload: dict):
        if not self.topic_arn:
            return

        message = {
            "title": title,
            "payload": payload
        }

        self.sns.publish(
            TopicArn=self.topic_arn,
            Subject=title,
            Message=json.dumps(message),
        )
