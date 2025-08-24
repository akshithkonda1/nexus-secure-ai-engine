# This file is called the Nexus.ai API Secrets file. This file contains the API keys and secrets required to access the Nexus.ai services. It will be encrypted using 256 bit encryption and all the API Calls will be logged for security purposes and billing purposes.
# At the end of each month a report will be generated. The report will contain the API usage, the cost of the API usage, and the number of requests made to each service. It will be sent to an AWS RDS Database where it will sit for 1 year.
# After 1 year it will be transferred to an AWS Glacier for long term storage. The cost will be calculated and sent to a finance team for billing purposes.
# There are API keys and secrets in this file, be careful when editing this file. Any and All API keys and secrets should be stored in here or a secure digital vault. When called by the user they will pull from here. Each key request will be encrypted with codes changing every 24 hours in order to prevent key leakage or hacking into the system.
# This file will also contain logging utilities to log all API calls, errors, and warnings as well as billing information.

import os
import requests
import uuid
import boto3
import base64
import json
import hashlib
import logging
from dotenv import load_dotenv
from datetime import datetime
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import padding as sym_padding

load_dotenv()

# -------------------- Logging Setup --------------------
logger = logging.getLogger("nexus_api")
logger.setLevel(logging.INFO)
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter(
        '{"time": "%(asctime)s", "level": "%(levelname)s", "message": "%(message)s"}'
    ))
    logger.addHandler(handler)

# -------------------- AWS Secrets Manager --------------------
secrets_client = boto3.client("secretsmanager", region_name=os.getenv("AWS_REGION", "us-east-1"))

def _aws_secret_fetch(secret_id: str) -> str:
    try:
        response = secrets_client.get_secret_value(SecretId=secret_id)
        logger.info(f"[SecretsManager] Retrieved secret: {secret_id}")
        return response["SecretString"]
    except Exception as e:
        logger.error(f"[SecretsManager] Error fetching secret '{secret_id}': {e}")
        raise

def get_secret(secret_id: str) -> str:
    local = os.getenv(secret_id.upper())
    if local:
        logger.info(f"[ENV] Loaded secret: {secret_id} from .env")
        return local
    return _aws_secret_fetch(secret_id)

# -------------------- AES Key Rotation --------------------
def generate_daily_key() -> bytes:
    salt = os.getenv("NEXUS_SECRET_SALT", "changeme")
    today = datetime.utcnow().strftime("%Y-%m-%d")
    return hashlib.sha256(f"{salt}-{today}".encode()).digest()

def aes_encrypt(plaintext: str, key: bytes) -> bytes:
    iv = os.urandom(16)
    padder = sym_padding.PKCS7(128).padder()
    padded = padder.update(plaintext.encode()) + padder.finalize()
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
    ct = cipher.encryptor().update(padded) + cipher.encryptor().finalize()
    return iv + ct

def aes_decrypt(ciphertext: bytes, key: bytes) -> str:
    iv, ct = ciphertext[:16], ciphertext[16:]
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
    padded = cipher.decryptor().update(ct) + cipher.decryptor().finalize()
    unpadder = sym_padding.PKCS7(128).unpadder()
    return unpadder.update(padded) + unpadder.finalize().decode()

def hybrid_encrypt(plaintext: str) -> dict:
    aes_key = generate_daily_key()
    encrypted_data = aes_encrypt(plaintext, aes_key)
    kms = boto3.client("kms")
    encrypted_key = kms.encrypt(KeyId=SECRETS["AWS_KMS_KEY_ID"], Plaintext=aes_key)["CiphertextBlob"]
    return {
        "data": base64.b64encode(encrypted_data).decode(),
        "key": base64.b64encode(encrypted_key).decode()
    }

def hybrid_decrypt(encrypted: dict) -> str:
    kms = boto3.client("kms")
    encrypted_key = base64.b64decode(encrypted["key"])
    aes_key = kms.decrypt(CiphertextBlob=encrypted_key)["Plaintext"]
    encrypted_data = base64.b64decode(encrypted["data"])
    return aes_decrypt(encrypted_data, aes_key)

# -------------------- GeoIP --------------------
def get_ip_info(ip: str) -> dict:
    try:
        r = requests.get(f"https://ipapi.co/{ip}/json", timeout=2)
        return r.json() if r.status_code == 200 else {}
    except Exception:
        return {}

# -------------------- AWS Client Helper --------------------
def get_boto_client(service: str):
    return boto3.client(service, region_name=os.getenv("AWS_REGION", "us-east-1"))

# -------------------- Secrets Map --------------------
SECRETS = {
    # === AI Services ===
    "OPENAI_API_KEY":        get_secret("openai-api-key"),
    "GOOGLE_API_KEY":        get_secret("google-api-key"),
    "GOOGLE_CX":             get_secret("google-cx"),
    "CLAUDE_API_KEY":        get_secret("claude-api-key"),
    "PERPLEXITY_API_KEY":    get_secret("perplexity-api-key"),

    # === AWS Infrastructure ===
    "AWS_ACCESS_KEY_ID":               get_secret("aws-access-key-id"),
    "AWS_SECRET_ACCESS_KEY":          get_secret("aws-secret-access-key"),
    "AWS_SESSION_TOKEN":              get_secret("aws-session-token"),
    "AWS_REGION":                     get_secret("aws-region"),
    "AWS_RDS_CONN_STRING":            get_secret("aws-rds-connection"),
    "AWS_S3_BACKUP_BUCKET":           get_secret("aws-s3-backup-bucket"),
    "AWS_GLACIER_VAULT":              get_secret("aws-glacier-vault-name"),
    "AWS_DYNAMODB_TABLE":             get_secret("aws-dynamodb-table"),
    "AWS_CLOUDWATCH_LOG_GROUP":       get_secret("aws-cloudwatch-log-group"),
    "AWS_CLOUDWATCH_LOG_STREAM":      get_secret("aws-cloudwatch-log-stream"),
    "AWS_CLOUDWATCH_DASHBOARD":       get_secret("aws-cloudwatch-dashboard"),
    "AWS_CLOUDFRONT_DISTRIBUTION":    get_secret("aws-cloudfront-distribution"),    
    "AWS_VPC_ID":                     get_secret("aws-vpc-id"),  
    "AWS_KMS_KEY_ID":                 get_secret("kms-key-id"),

    # === Misc ===
    "USER_AGENT": os.getenv("USER_AGENT", "Mozilla/5.0 Nexus.ai Infra Agent")
}

# SECRET PRESENCE CHECK
for key, val in SECRETS.items():
    if not val:
        logger.warning(f"[SECRETS] Missing value for: {key}")

# -------------------- Connector Builder --------------------
def get_model_connectors(ModelConnector):
    return {
        "ChatGPT": ModelConnector("ChatGPT", SECRETS["GPT_ENDPOINT"], headers={
            "Authorization": f"Bearer {SECRETS['OPENAI_API_KEY']}",
            "Content-Type": "application/json"
        }),
        "Claude": ModelConnector("Claude", SECRETS["CLAUDE_ENDPOINT"], headers={
            "Authorization": f"Bearer {SECRETS['CLAUDE_API_KEY']}",
            "Content-Type": "application/json"
        }),
        "Gemini": ModelConnector("Gemini", SECRETS["GEMINI_ENDPOINT"], headers={
            "Authorization": f"Bearer {SECRETS['GOOGLE_API_KEY']}",
            "Content-Type": "application/json"
        }),
        "Perplexity": ModelConnector("Perplexity", SECRETS["PERPLEXITY_ENDPOINT"], headers={
            "Authorization": f"Bearer {SECRETS['PERPLEXITY_API_KEY']}",
            "Content-Type": "application/json"
        })
    }
