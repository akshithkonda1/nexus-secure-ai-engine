from typing import Dict


def encrypt(payload: str, key_alias: str) -> Dict[str, str]:
    return {"ciphertext": f"enc:{payload}", "key_alias": key_alias}


def decrypt(ciphertext: str, key_alias: str) -> Dict[str, str]:
    return {"plaintext": ciphertext.replace("enc:", ""), "key_alias": key_alias}
