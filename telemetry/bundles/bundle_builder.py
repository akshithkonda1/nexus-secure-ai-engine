"""Partner bundle builder for Ryuzen Telemetry."""
from __future__ import annotations

import io
import json
import logging
import os
import zipfile
from datetime import datetime
from hashlib import sha256
from typing import Dict, List

import boto3
import pandas as pd

from telemetry.audit import audit_logger
from telemetry.scrubber.certificate_generator import generate_certificate
from telemetry.bundles.manifest_validator import validate_manifest
from telemetry.monitoring.metrics import get_metrics_client
from telemetry.bundles.report_generator import get_report_generator

logger = logging.getLogger(__name__)


s3_client = boto3.client("s3")


def _analytics_bucket() -> str:
    return os.getenv("RYZN_ANALYTICS_BUCKET", "ryzn-analytics")


def _analytics_prefix() -> str:
    return os.getenv("RYZN_ANALYTICS_PREFIX", "analytics")


def _list_parquet_keys(month: str) -> List[str]:
    bucket = _analytics_bucket()
    prefix = f"{_analytics_prefix()}/{month}/"
    logger.info("Listing parquet files for month=%s bucket=%s prefix=%s", month, bucket, prefix)
    response = s3_client.list_objects_v2(Bucket=bucket, Prefix=prefix)
    contents = response.get("Contents", [])
    return [item["Key"] for item in contents if item["Key"].endswith(".parquet")]


def _load_dataframe(key: str) -> pd.DataFrame:
    bucket = _analytics_bucket()
    logger.debug("Loading parquet file s3://%s/%s", bucket, key)
    obj = s3_client.get_object(Bucket=bucket, Key=key)
    data = obj["Body"].read()
    return pd.read_parquet(io.BytesIO(data))


def _filter_partner(df: pd.DataFrame, partner: str) -> pd.DataFrame:
    for candidate in ("partner", "partner_id", "partner_name"):
        if candidate in df.columns:
            return df[df[candidate] == partner]
    # Fallback: assume mapping stub not present; return entire frame
    return df


def _compute_schema_hash(df: pd.DataFrame) -> str:
    schema_repr = json.dumps(sorted([(col, str(dtype)) for col, dtype in df.dtypes.items()]))
    return sha256(schema_repr.encode("utf-8")).hexdigest()


def _build_manifest(partner: str, month: str, record_count: int, schema_hash: str, certificate_ref: str, reports_generated: List[str] = None) -> Dict:
    manifest = {
        "partner": partner,
        "month": month,
        "telemetry_version": "1.0",
        "record_count": record_count,
        "schema_hash": schema_hash,
        "sanitized": True,
        "certificate_ref": certificate_ref,
        "reports_generated": reports_generated or [],
    }
    if not validate_manifest(manifest):
        raise ValueError("Generated manifest failed validation")
    return manifest


def _generate_executive_summary(reports: Dict[str, str], month: str) -> str:
    """
    Generate executive summary across all model reports.

    Args:
        reports: Dict of model_name -> report_text
        month: Month identifier

    Returns:
        Executive summary as Markdown string
    """
    summary_parts = [
        f"# Executive Summary: Multi-Model Performance Analysis",
        f"**Analysis Period:** {month}",
        f"**Models Analyzed:** {len(reports)}",
        f"**Generated:** {datetime.utcnow().isoformat()}",
        "",
        "## Overview",
        "",
        f"This bundle contains detailed AI self-analysis reports for {len(reports)} models:",
        "",
    ]

    for model_name in sorted(reports.keys()):
        safe_name = model_name.replace("/", "-").replace(" ", "_")
        summary_parts.append(f"- **{model_name}**: See `reports/{safe_name}_analysis.md`")

    summary_parts.extend([
        "",
        "## How to Use These Reports",
        "",
        "1. **Start with individual model reports** in the `reports/` folder",
        "2. **Look for High Priority recommendations** in each report",
        "3. **Compare findings across models** to identify systemic issues",
        "4. **Focus on actionable insights** - each report contains specific recommendations",
        "",
        "## Key Features",
        "",
        "- **AI Self-Analysis**: Each model analyzed its own performance data",
        "- **Data-Driven**: All findings backed by actual query statistics",
        "- **Actionable**: Specific recommendations for improvement",
        "- **Honest**: Models instructed to be candid about weaknesses",
        "",
        "## Next Steps",
        "",
        "Review the detailed reports and prioritize High Priority recommendations for implementation.",
    ])

    return "\n".join(summary_parts)


def build_bundle(partner: str, month: str) -> bytes:
    """Build a partner telemetry bundle ZIP as bytes.

    Args:
        partner: Partner identifier.
        month: Target month in YYYY-MM format.

    Returns:
        ZIP archive bytes containing telemetry.parquet, manifest.json, and a Zero-PII certificate.
    """

    logger.info("Building telemetry bundle for partner=%s month=%s", partner, month)
    parquet_keys = _list_parquet_keys(month)
    frames: List[pd.DataFrame] = []
    for key in parquet_keys:
        df = _load_dataframe(key)
        filtered = _filter_partner(df, partner)
        if not filtered.empty:
            frames.append(filtered)
    if frames:
        combined = pd.concat(frames, ignore_index=True)
    else:
        combined = pd.DataFrame()

    record_count = len(combined.index)
    schema_hash = _compute_schema_hash(combined) if not combined.empty else sha256(b"").hexdigest()

    parquet_buffer = io.BytesIO()
    combined.to_parquet(parquet_buffer, index=False)
    parquet_bytes = parquet_buffer.getvalue()

    certificate, certificate_ref = generate_certificate(partner, month)

    # Generate AI self-analysis reports
    logger.info("Generating AI self-analysis reports for partner=%s month=%s", partner, month)
    report_generator = get_report_generator()
    reports = {}  # model_name -> report_text

    if not combined.empty and "model_name" in combined.columns:
        # Get unique models in this dataset
        unique_models = combined["model_name"].unique()

        for model_name in unique_models:
            logger.info(f"Generating report for {model_name}")

            # Filter data for this model
            model_data = combined[combined["model_name"] == model_name]

            # Generate report
            report_text = report_generator.generate_report(
                model_name=model_name,
                telemetry_data=model_data,
                month=month,
            )

            reports[model_name] = report_text
    else:
        logger.warning("No model data available for report generation")

    # Build manifest with reports list
    manifest = _build_manifest(partner, month, record_count, schema_hash, certificate_ref, list(reports.keys()))

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, mode="w", compression=zipfile.ZIP_DEFLATED) as bundle_zip:
        bundle_zip.writestr("telemetry.parquet", parquet_bytes)
        bundle_zip.writestr("manifest.json", json.dumps(manifest, indent=2))
        bundle_zip.writestr("zero_pii_certificate.json", json.dumps(certificate, indent=2))

        # Add AI reports
        if reports:
            for model_name, report_text in reports.items():
                # Sanitize model name for filename
                safe_name = model_name.replace("/", "-").replace(" ", "_")
                report_filename = f"reports/{safe_name}_analysis.md"
                bundle_zip.writestr(report_filename, report_text)
                logger.info(f"Added report: {report_filename}")

            # Generate and add executive summary
            executive_summary = _generate_executive_summary(reports, month)
            bundle_zip.writestr("EXECUTIVE_SUMMARY.md", executive_summary)

    bundle_bytes = zip_buffer.getvalue()

    # Emit CloudWatch metrics
    metrics = get_metrics_client()
    metrics.emit_bundle_generated(
        partner=partner,
        record_count=record_count,
        size_bytes=len(bundle_bytes)
    )

    audit_logger.log_event(
        event_type="BUNDLE_CREATED",
        partner=partner,
        month=month,
        details={
            "record_count": record_count,
            "schema_hash": schema_hash,
            "reports_generated": list(reports.keys()),
            "generated_at": datetime.utcnow().isoformat(),
        },
    )
    logger.info(
        "Telemetry bundle built for partner=%s month=%s with %s records and %s reports",
        partner, month, record_count, len(reports)
    )
    return bundle_bytes


__all__ = ["build_bundle"]
