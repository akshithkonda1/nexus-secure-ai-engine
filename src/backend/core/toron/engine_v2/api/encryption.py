"""
AES-GCM Encryption for Toron Engine v2.0
"""

import base64
import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

class EncryptionEngine:
    def __init__(self, key: bytes = None):
        self.key = key or AESGCM.generate_key(bit_length=256)
        self.aes = AESGCM(self.key)

    def encrypt(self, plaintext: bytes, aad: bytes) -> dict:
        nonce = os.urandom(12)
        ciphertext = self.aes.encrypt(nonce, plaintext, aad)
        return {
            "nonce": base64.b64encode(nonce).decode(),
            "ciphertext": base64.b64encode(ciphertext).decode()
        }

    def decrypt(self, nonce: str, ciphertext: str, aad: bytes) -> bytes:
        nonce_bytes = base64.b64decode(nonce)
        cipher_bytes = base64.b64decode(ciphertext)
        return self.aes.decrypt(nonce_bytes, cipher_bytes, aad)


