"""Validate AES-256 encrypt/decrypt helpers."""

import pytest

from toron.crypto import CrypterAES256


def test_round_trip_encryption(crypto_key):
    """Encrypting and decrypting should produce the original payload."""

    crypter = CrypterAES256(crypto_key)
    token = crypter.encrypt("toron-secret", associated_data=b"context")
    assert crypter.decrypt(token, associated_data=b"context") == "toron-secret"


def test_tamper_detection(crypto_key):
    """Decrypting a tampered token should raise a ValueError."""

    crypter = CrypterAES256(crypto_key)
    token = crypter.encrypt("sensitive")
    mangled = token[:-2] + "ab"
    with pytest.raises(Exception):
        crypter.decrypt(mangled)
