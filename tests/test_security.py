from src.backend.security.aes256_engine import AES256Engine
from src.backend.security.pii_sanitizer import PiiSanitizer


def test_aes_round_trip():
    crypto = AES256Engine()
    token = crypto.encrypt("secret")
    assert crypto.decrypt(token) == "secret"


def test_pii_sanitizer_masks_email_and_phone():
    sanitizer = PiiSanitizer()
    payload = {"prompt": "Contact me at test@example.com or +1 555 123 4567"}
    sanitized = sanitizer.sanitize(payload)
    assert "[redacted-email]" in sanitized["prompt"]
    assert "[redacted-phone]" in sanitized["prompt"]
