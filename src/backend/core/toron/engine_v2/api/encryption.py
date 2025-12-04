"""
AES-GCM Encryption/Decryption for Toron API.
"""

import os
import json
import base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM


class ToronEncryptor:
    def __init__(self):
        key_env = os.getenv("TORON_AES_KEY")
        self.key = base64.b64decode(key_env) if key_env else os.urandom(32)
        self.aes = AESGCM(self.key)

    def encrypt(self, data: dict, aad: str) -> str:
        raw = json.dumps(data).encode()
        nonce = os.urandom(12)
        ciphertext = self.aes.encrypt(nonce, raw, aad.encode())
        blob = base64.b64encode(nonce + ciphertext).decode()
        return blob

    def decrypt(self, blob: str, aad: str) -> dict:
        raw = base64.b64decode(blob.encode())
        nonce = raw[:12]
        ciphertext = raw[12:]
        plaintext = self.aes.decrypt(nonce, ciphertext, aad.encode())
        return json.loads(plaintext.decode())
