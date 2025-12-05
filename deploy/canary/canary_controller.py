#!/usr/bin/env python3
"""
Canary controller for Toron Engine v2.0.
Gradually shifts traffic based on CloudWatch metrics and publishes SNS events.
"""

import json
import logging
import sys
import time
from dataclasses import dataclass
from typing import Dict, List

import boto3
yaml = __import__("yaml")

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")


@dataclass
class CanaryStep:
    percentage: int
    duration: int  # seconds


@dataclass
class RolloutPolicy:
    min_successful_requests: int
    success_score_threshold: float
    timeout_seconds: int
    protection_windows: int


class CanaryController:
    def __init__(self, config_path: str, policy_path: str):
        self.config = self._load_yaml(config_path)
        self.policy = self._load_policy(policy_path)
        self.cloudwatch = boto3.client("cloudwatch")
        self.sns = boto3.client("sns")
        self.route53 = boto3.client("route53")
        self.event_bus = boto3.client("events")
        self.start_time = time.time()
        self.metrics_namespace = self.config.get("metrics_namespace", "Toron/Service")
        self.sns_topic = self.config["sns_topic"]
        self.dns_record = self.config["route53_record"]
        self.zone_id = self.config["route53_zone_id"]
        self.weights = self._build_steps()

    @staticmethod
    def _load_yaml(path: str) -> Dict:
        with open(path, "r", encoding="utf-8") as handle:
            return yaml.safe_load(handle)

    def _build_steps(self) -> List[CanaryStep]:
        steps = []
        for pct, duration in zip(self.config["steps"], self.config["step_durations"]):
            steps.append(CanaryStep(percentage=int(pct), duration=int(duration)))
        return steps

    def _load_policy(self, path: str) -> RolloutPolicy:
        data = self._load_yaml(path)
        return RolloutPolicy(
            min_successful_requests=data["minimum_successful_requests"],
            success_score_threshold=float(data["success_score_threshold"]),
            timeout_seconds=int(data["canary_timeout_seconds"]),
            protection_windows=int(data["protection_windows"]),
        )

    def _health_score(self, environment: str) -> float:
        """Calculate composite health score using error rate and latency."""
        latency = self._get_metric("latency_p95", environment)
        error_rate = self._get_metric("error_rate", environment)
        availability = max(0.0, 1.0 - error_rate)
        latency_score = max(0.0, min(1.0, (self.config["latency_budget_ms"] / max(latency, 1)) ))
        score = round((availability * 0.6) + (latency_score * 0.4), 3)
        logging.info("Health score for %s: %s (latency=%sms error_rate=%s)", environment, score, latency, error_rate)
        return score

    def _get_metric(self, metric_name: str, environment: str) -> float:
        resp = self.cloudwatch.get_metric_statistics(
            Namespace=self.metrics_namespace,
            MetricName=metric_name,
            Dimensions=[{"Name": "Environment", "Value": environment}],
            StartTime=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(time.time() - 300)),
            EndTime=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            Period=60,
            Statistics=["Average"],
        )
        points = resp.get("Datapoints", [])
        if not points:
            return 0.0
        return float(sorted(points, key=lambda p: p["Timestamp"])[-1]["Average"])

    def _weighted_dns(self, canary_weight: int) -> None:
        """Push weighted record update for the canary."""
        stable_weight = 100 - canary_weight
        logging.info("Updating DNS weights: stable=%s canary=%s", stable_weight, canary_weight)
        change_batch = {
            "Comment": f"Toron canary shift to {canary_weight}%",
            "Changes": [
                {
                    "Action": "UPSERT",
                    "ResourceRecordSet": {
                        "Name": self.dns_record,
                        "Type": "A",
                        "SetIdentifier": "toron-stable",
                        "Weight": stable_weight,
                        "AliasTarget": self.config["stable_alias_target"],
                    },
                },
                {
                    "Action": "UPSERT",
                    "ResourceRecordSet": {
                        "Name": self.dns_record,
                        "Type": "A",
                        "SetIdentifier": "toron-canary",
                        "Weight": canary_weight,
                        "AliasTarget": self.config["canary_alias_target"],
                    },
                },
            ],
        }
        self.route53.change_resource_record_sets(HostedZoneId=self.zone_id, ChangeBatch=change_batch)

    def _publish_event(self, detail: Dict) -> None:
        message = json.dumps(detail)
        logging.info("Publishing SNS event: %s", message)
        self.sns.publish(TopicArn=self.sns_topic, Message=message, Subject="Toron canary update")
        self.event_bus.put_events(
            Entries=[
                {
                    "Source": "toron.canary",
                    "DetailType": detail.get("type", "canary-step"),
                    "Detail": message,
                }
            ]
        )

    def _rollback(self, reason: str) -> None:
        logging.error("Rollback triggered: %s", reason)
        self._weighted_dns(0)
        self._publish_event({"type": "rollback", "reason": reason})
        sys.exit(1)

    def _wait_for_requests(self, duration: int) -> None:
        logging.info("Holding at current weight for %s seconds", duration)
        deadline = time.time() + duration
        watchdog = time.time() + self.config.get("watchdog_interval_seconds", 120)
        while time.time() < deadline:
            if time.time() > watchdog:
                self._publish_event({"type": "watchdog", "timestamp": int(time.time())})
                watchdog = time.time() + self.config.get("watchdog_interval_seconds", 120)
            time.sleep(5)

    def run(self) -> None:
        canary_env = self.config.get("canary_environment", "green")
        total_requests = 0
        protection_breaches = 0

        for step in self.weights:
            self._weighted_dns(step.percentage)
            self._publish_event({"type": "shift", "percent": step.percentage})
            self._wait_for_requests(step.duration)

            score = self._health_score(canary_env)
            successful = self._get_metric("successful_requests", canary_env)
            total_requests += successful

            if score < self.policy.success_score_threshold:
                self._rollback(f"Health score {score} below threshold {self.policy.success_score_threshold}")

            if successful < self.policy.min_successful_requests:
                protection_breaches += 1
                logging.warning("Protection window breached; successful=%s", successful)
                if protection_breaches >= self.policy.protection_windows:
                    self._rollback("Protection window exceeded")

            if time.time() - self.start_time > self.policy.timeout_seconds:
                self._rollback("Canary exceeded timeout")

            error_rate = self._get_metric("error_rate", canary_env)
            latency = self._get_metric("latency_p95", canary_env)
            if error_rate > self.config["allowed_error_rate"] or latency > self.config["allowed_latency_ms"]:
                self._rollback("Live metrics outside thresholds")

        # promote to 100%
        self._weighted_dns(100)
        self._publish_event({"type": "promoted", "total_requests": total_requests})
        logging.info("Canary promotion complete")


def main() -> None:
    if len(sys.argv) < 3:
        print("Usage: canary_controller.py <config> <policy>", file=sys.stderr)
        sys.exit(2)
    controller = CanaryController(config_path=sys.argv[1], policy_path=sys.argv[2])
    controller.run()


if __name__ == "__main__":
    main()
