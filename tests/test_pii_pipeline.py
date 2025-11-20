"""Test redaction and masking behaviours for the PII pipeline."""

from toron.pii import PIIPipeline


def test_redacts_emails_and_phones(pii_pipeline):
    """Emails and phone numbers should be replaced with the redaction token."""

    body = "Email me at alice@example.com or +1 555-111-2222"
    redacted = pii_pipeline.redact(body)
    assert redacted.count(pii_pipeline.redaction_token) == 2


def test_masks_names_preserving_boundaries():
    """Names should be masked but length preserved for readability."""

    pipeline = PIIPipeline(redaction_token="[MASK]")
    masked = pipeline.mask_names("Alice and Bob are collaborating")
    assert "A***e" in masked
    assert "B*b" in masked


def test_pipeline_combines_operations(pii_pipeline):
    """Composite pipeline applies both redaction and masking."""

    combined = pii_pipeline.pipeline("Charlie emailed charlie@example.com")
    assert pii_pipeline.redaction_token in combined
    assert combined.startswith("C***e")
