"""
AI self-analysis report generator for Ryuzen Telemetry.

Uses Claude Opus 4 to generate comprehensive performance reports
where models analyze their own telemetry data.
"""

from __future__ import annotations

import json
import logging
from datetime import datetime
from typing import Dict, Optional

import boto3
import pandas as pd
from botocore.config import Config
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)


class ReportGenerator:
    """
    Generates AI self-analysis reports using Claude Opus 4.

    The model analyzes its own performance data and generates
    a comprehensive 2000+ word report with specific findings
    and actionable recommendations.
    """

    def __init__(self):
        """Initialize report generator."""
        self.model_id = "anthropic.claude-opus-4-20250514"
        self.timeout = 120  # 2 minutes for long report generation
        self._bedrock_client: Optional[any] = None

    def _get_bedrock_client(self):
        """Get or create Bedrock runtime client."""
        if self._bedrock_client is None:
            config = Config(
                read_timeout=self.timeout,
                connect_timeout=10,
                retries={"max_attempts": 2}
            )
            self._bedrock_client = boto3.client("bedrock-runtime", config=config)
            logger.debug("Created Bedrock runtime client for report generation")

        return self._bedrock_client

    def _compute_statistics(self, df: pd.DataFrame, model_name: str) -> Dict:
        """
        Compute comprehensive statistics from telemetry data.

        Args:
            df: Telemetry DataFrame for this model
            model_name: Name of the model

        Returns:
            Dict of computed statistics
        """
        stats = {
            "model_name": model_name,
            "total_queries": len(df),
            "date_range": {
                "start": df["timestamp_utc"].min() if len(df) > 0 else None,
                "end": df["timestamp_utc"].max() if len(df) > 0 else None,
            },
        }

        if len(df) == 0:
            logger.warning(f"No data for {model_name}, returning empty stats")
            return stats

        # Confidence metrics
        if "calibrated_confidence" in df.columns:
            stats["confidence"] = {
                "mean": float(df["calibrated_confidence"].mean()),
                "median": float(df["calibrated_confidence"].median()),
                "std": float(df["calibrated_confidence"].std()),
            }

        # Latency metrics
        if "total_latency_ms" in df.columns:
            stats["latency"] = {
                "p50": float(df["total_latency_ms"].quantile(0.50)),
                "p95": float(df["total_latency_ms"].quantile(0.95)),
                "p99": float(df["total_latency_ms"].quantile(0.99)),
                "mean": float(df["total_latency_ms"].mean()),
            }

        # Output grade distribution
        if "output_grade" in df.columns:
            grade_counts = df["output_grade"].value_counts()
            stats["output_grades"] = {
                grade: int(count) for grade, count in grade_counts.items()
            }

        # Consensus quality distribution
        if "consensus_quality" in df.columns:
            quality_counts = df["consensus_quality"].value_counts()
            stats["consensus_quality"] = {
                quality: int(count) for quality, count in quality_counts.items()
            }

        # Error rates
        stats["errors"] = {
            "tier_timeouts": int(df["tier_timeouts"].sum()) if "tier_timeouts" in df.columns else 0,
            "providers_failed": int(df["providers_failed"].sum()) if "providers_failed" in df.columns else 0,
            "cache_hit_rate": float(df["cache_hit"].mean()) if "cache_hit" in df.columns else 0.0,
        }

        # Failsafe triggers
        if "tier4_failsafe_triggered" in df.columns:
            stats["failsafe_triggered"] = int(df["tier4_failsafe_triggered"].sum())

        # Arbitration sources
        if "arbitration_source" in df.columns:
            arb_counts = df["arbitration_source"].value_counts()
            stats["arbitration_sources"] = {
                source: int(count) for source, count in arb_counts.items()
            }

        return stats

    def _build_analysis_prompt(self, model_name: str, month: str, stats: Dict) -> str:
        """
        Build prompt for Claude to analyze its own performance.

        Args:
            model_name: Name of the model being analyzed
            month: Month identifier (YYYY-MM)
            stats: Computed statistics dict

        Returns:
            Formatted prompt string
        """
        stats_json = json.dumps(stats, indent=2)

        prompt = f"""You are {model_name} analyzing your own performance data from {month}.

Your task is to write a comprehensive, honest, and insightful performance report analyzing YOUR OWN behavior and performance. This report will be used by your development team to improve you.

## Your Performance Data

{stats_json}

## Report Requirements

Write a 2000-2500 word report with the following structure:

### EXECUTIVE SUMMARY (3-5 paragraphs)
Synthesize the most critical findings. Be direct and honest about issues.

### PERFORMANCE METRICS
Present key statistics in context:
- Response quality (confidence, calibration, output grades)
- Latency analysis (P50, P95, P99)
- Error rates and failure modes

### DETAILED ANALYSIS

#### 1. Confidence Calibration
Analyze if your confidence scores accurately reflect your actual performance. Are you overconfident? Underconfident? On what types of queries?

#### 2. Reasoning Depth Patterns
Identify patterns in your reasoning quality. Do certain task types trigger deeper or shallower reasoning?

#### 3. Performance Degradation Triggers
What conditions cause your performance to degrade? High context utilization? Specific query types? Time of day?

#### 4. Comparative Performance
How do you stack up against other models in the system? Where do you excel? Where do you lag?

### RECOMMENDATIONS

Provide 5-7 specific, actionable recommendations prioritized as:
- **High Priority**: Critical issues requiring immediate attention
- **Medium Priority**: Important improvements that would significantly help
- **Low Priority**: Nice-to-have optimizations

Each recommendation must:
- Be specific (not "improve accuracy" but "add domain-specific uncertainty quantification for medical queries")
- Include reasoning (WHY this would help)
- Be actionable (development team can implement it)

### APPENDIX: DATA SUMMARY
Brief statistical tables if helpful.

## Writing Guidelines

- **Be honest**: Don't sugarcoat issues. The development team needs truth.
- **Be specific**: "Overconfident on medical queries by 13 percentage points" not "confidence needs work"
- **Think deeply**: You have unique insight into your own reasoning processes
- **Focus on actionable insights**: What can be fixed? How?
- **Use data**: Reference the statistics throughout

## Important

This is YOUR performance review of YOURSELF. Be introspective, honest, and insightful. The goal is to identify specific areas for improvement that will make you a better model.

Write the complete report now in Markdown format."""

        return prompt

    def generate_report(
        self,
        model_name: str,
        telemetry_data: pd.DataFrame,
        month: str,
    ) -> str:
        """
        Generate AI self-analysis report.

        Args:
            model_name: Name of model being analyzed
            telemetry_data: DataFrame of telemetry data for this model
            month: Month identifier (YYYY-MM)

        Returns:
            Generated report as Markdown string
        """
        logger.info(f"Generating AI self-analysis report for {model_name} ({month})")

        try:
            # Compute statistics
            stats = self._compute_statistics(telemetry_data, model_name)

            if stats["total_queries"] == 0:
                logger.warning(f"No data for {model_name}, generating placeholder report")
                return self._generate_placeholder_report(model_name, month)

            # Build prompt
            prompt = self._build_analysis_prompt(model_name, month, stats)

            # Call Claude Opus
            bedrock_client = self._get_bedrock_client()

            request_body = {
                "anthropic_version": "bedrock-2023-05-31",
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "max_tokens": 8000,  # Long report
                "temperature": 0.7,  # Some creativity for insights
            }

            response = bedrock_client.invoke_model(
                modelId=self.model_id,
                body=json.dumps(request_body),
                contentType="application/json",
                accept="application/json",
            )

            # Parse response
            response_body = json.loads(response["body"].read())
            content = response_body.get("content", [])

            if not content:
                logger.error("Empty content in Bedrock response")
                return self._generate_placeholder_report(model_name, month)

            report_text = content[0].get("text", "")

            if len(report_text) < 500:
                logger.warning(f"Report suspiciously short ({len(report_text)} chars)")

            logger.info(
                f"Generated report for {model_name}: {len(report_text)} characters"
            )

            return report_text

        except ClientError as e:
            error_code = e.response.get("Error", {}).get("Code", "Unknown")
            logger.error(f"Bedrock API error generating report: {error_code}")
            return self._generate_placeholder_report(model_name, month)

        except Exception as e:
            logger.exception(f"Unexpected error generating report: {e}")
            return self._generate_placeholder_report(model_name, month)

    def _generate_placeholder_report(self, model_name: str, month: str) -> str:
        """
        Generate placeholder report when AI generation fails or no data.

        Args:
            model_name: Name of model
            month: Month identifier

        Returns:
            Placeholder report as Markdown string
        """
        return f"""# Performance Report: {model_name}
**Analysis Period:** {month}
**Generated:** {datetime.utcnow().isoformat()}

## Notice

This report could not be generated due to insufficient data or a technical issue.

Please check:
- Telemetry data availability for this model and month
- AWS Bedrock API access and permissions
- Report generator logs for specific errors

A full AI self-analysis report will be generated once sufficient data is available.
"""


def get_report_generator() -> ReportGenerator:
    """
    Get report generator instance.

    Returns:
        ReportGenerator instance.
    """
    return ReportGenerator()


__all__ = ["ReportGenerator", "get_report_generator"]
