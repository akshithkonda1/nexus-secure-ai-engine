"""S3 delivery pipeline for telemetry bundles."""
from __future__ import annotations

import logging
import os
from typing import Optional

import boto3

from telemetry.audit import audit_logger

logger = logging.getLogger(__name__)

s3_client = boto3.client("s3")
sns_client = boto3.client("sns")
ses_client = boto3.client("ses")


def _bundle_bucket() -> str:
    return os.getenv("RYZN_PARTNER_BUNDLE_BUCKET", "RYZN_PARTNER_BUNDLES")


def _bundle_key(partner: str, month: str) -> str:
    year, month_part = month.split("-")
    return f"{partner}/{year}/{month_part}/bundle.zip"


def upload_bundle(partner: str, month: str, bundle_bytes: bytes) -> str:
    """Upload bundle to S3 and return the object key."""
    bucket = _bundle_bucket()
    key = _bundle_key(partner, month)
    logger.info("Uploading telemetry bundle to s3://%s/%s", bucket, key)
    s3_client.put_object(Bucket=bucket, Key=key, Body=bundle_bytes)
    audit_logger.log_event(
        event_type="BUNDLE_DELIVERED",
        partner=partner,
        month=month,
        details={"s3_key": key},
    )
    return key


def generate_signed_url(partner: str, month: str) -> str:
    """Generate a presigned URL for bundle download."""
    bucket = _bundle_bucket()
    key = _bundle_key(partner, month)
    expiration = int(os.getenv("RYZN_BUNDLE_URL_TTL", "604800"))  # default 7 days
    logger.info("Generating presigned URL for s3://%s/%s", bucket, key)
    return s3_client.generate_presigned_url(
        ClientMethod="get_object", Params={"Bucket": bucket, "Key": key}, ExpiresIn=expiration
    )


def _resolve_contact(partner: str) -> Optional[str]:
    contacts = os.getenv("RYZN_PARTNER_CONTACTS")
    if contacts:
        mapping = {item.split(":", 1)[0]: item.split(":", 1)[1] for item in contacts.split(",") if ":" in item}
        return mapping.get(partner)
    return os.getenv("RYZN_PARTNER_NOTIFICATION_TOPIC")


def notify_partner(partner: str, month: str, signed_url: str) -> None:
    """Notify partner of bundle availability via SNS or SES."""
    contact = _resolve_contact(partner)
    message = f"Your monthly telemetry bundle for {month} is ready: {signed_url}"
    logger.info("Notifying partner=%s about bundle availability", partner)
    if contact and contact.startswith("arn:aws:sns"):
        sns_client.publish(TopicArn=contact, Message=message, Subject="Telemetry bundle ready")
    elif contact:
        ses_client.send_email(
            Source=os.getenv("RYZN_NOTIFICATION_SENDER", "no-reply@ryuzen.local"),
            Destination={"ToAddresses": [contact]},
            Message={
                "Subject": {"Data": "Telemetry bundle ready"},
                "Body": {"Text": {"Data": message}},
            },
        )
    else:
        logger.warning("No contact method configured for partner=%s; notification skipped", partner)


__all__ = ["upload_bundle", "generate_signed_url", "notify_partner"]
