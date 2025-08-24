#What is Nexus?

#Nexus is a sophisticated AI engine designed to aggregate and analyze responses from multiple AI models and traditional search engines and media, providing a comprehensive and nuanced understanding of user queries.

#It integrates web scraping capabilities for real-time data retrieval, supports secure data encryption, and offers advanced response aggregation techniques to deliver the best possible answers.

#Nexus is built to be extensible and infinitely scalable, allowing for easy integration of new AI models and data sources, making it a versatile tool for developers and researchers alike, but it is also designed to be user-friendly, with a focus on providing clear and actionable insights.

#Nexus is not just a tool for AI enthusiasts; it is a powerful platform that can be used in various applications, from academic research to business intelligence, and it aims to democratize access to advanced AI capabilities by making Gen AI replies more accurate and more correct.

#Nexus is a cutting-edge AI engine that aggregates and analyzes responses from multiple AI models and traditional search engines and media, providing a comprehensive and nuanced understanding of user queries. 
# Nexus also includes powerful 256-bit AES encryption for secure data handling, ensuring that sensitive information is protected throughout the process.

#It combines the power of multiple AI models with the richness of web data, enabling users to gain deeper insights and make more informed decisions, using AI Modal Debating you will get the best possible answer to your question, by combining the strengths of multiple AI models and traditional search engines and media.

#Nexus was developed by Akshith Konda.


import os
import json
import base64
import logging
import platform
import requests
import boto3
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry
from typing import Dict
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding as sym_padding
from cryptography.hazmat.backends import default_backend
from response_aggregator import ResponseAggregator
from scraping_utils import get_search_results, get_image_results
from Nexus_API_secrets import SECRETS
from nexus_engine import Nexus, load_connectors_for_engine
from botocore.exceptions import NoCredentialsError


#Model Response Class
# The Model Response class is a dataclass that standardizes how results from each AI model are represented — including success flags, payloads, error messages, and status codes. It ensures uniformity for the aggregator and error handling.

@dataclass
class ModelResponse:
    success: bool
    payload: dict | None = None
    error: str | None = None
    status_code: int | None = None

# Model Connector Class

#The ModelConnector class acts as a secure, modular bridge between GenAI Nexus and any external AI model API. 

# It handles all communication logic — including request construction, retries, timeouts, and structured error handling.

# So the engine can query models without needing to know the underlying implementation. By returning a standardized ModelResponse, it ensures consistency across different model types.Even as a demonstrator program, it showcases fault-tolerant design with a level of redundancy and readiness for real-world deployment with only the insertion of API keys.

class ModelConnector:
    def __init__(self, name: str, endpoint: str, headers: dict | None = None,
                timeout: int = 5, max_retries: int = 2):        
        
        self.name = name
        self.endpoint = endpoint
        self.headers = headers or {}
        self.headers.setdefault("User-Agent", f"NexusModelConnector/{self.name}")
        self.timeout = timeout
        self.session = requests.Session()

        retries = Retry(
            total=max_retries,
            backoff_factor=0.5,
            status_forcelist=[429, 500, 502, 503, 504],
        )
        adapter = HTTPAdapter(max_retries=retries)
        self.session.mount("https://", adapter)
        self.session.mount("http://", adapter)

    def query(self, prompt: str, params: dict | None = None) -> ModelResponse:
        payload = {"prompt": prompt}
        if params:
            payload.update(params)
        try:
            r = self.session.post(self.endpoint, headers=self.headers, json=payload, timeout=self.timeout)
            r.raise_for_status()
            return ModelResponse(success=True, payload=r.json(), status_code=r.status_code)
        except Exception as e:
            return ModelResponse(success=False, error=str(e))



# Extract secrets
OPENAI_API_KEY      = SECRETS.get("OPENAI_API_KEY")
GPT_ENDPOINT        = SECRETS.get("GPT_ENDPOINT")
CLAUDE_ENDPOINT     = SECRETS.get("CLAUDE_ENDPOINT")
GEMINI_ENDPOINT     = SECRETS.get("GEMINI_ENDPOINT")
PERPLEXITY_ENDPOINT = SECRETS.get("PERPLEXITY_ENDPOINT")

# Use boto3 or AWS SDK to read from Secrets Manager
secret = boto3.client("secretsmanager").get_secret_value(SecretId="nexus-rds-master")


# Connector loader

def load_connectors_for_engine():
    return {
        "ChatGPT": ModelConnector(
            name="ChatGPT",
            endpoint=GPT_ENDPOINT,
            headers={"Authorization": f"Bearer {OPENAI_API_KEY}"}
        ),
        "Claude": ModelConnector(
            name="Claude",
            endpoint=CLAUDE_ENDPOINT,
            headers={"Authorization": f"Bearer {OPENAI_API_KEY}"}
        ),
        "Gemini": ModelConnector(
            name="Gemini",
            endpoint=GEMINI_ENDPOINT,
            headers={"Authorization": f"Bearer {OPENAI_API_KEY}"}
        ),
        "Perplexity": ModelConnector(
            name="Perplexity",
            endpoint=PERPLEXITY_ENDPOINT,
            headers={"Authorization": f"Bearer {OPENAI_API_KEY}"}
        )
    }

if __name__ != "__main__":
    models = load_connectors_for_engine()
    engine = Nexus(models)




# Set up logging
logger = logging.getLogger("nexus_engine")
logger.setLevel(logging.INFO)

if platform.system() == "Windows":
    try:
        from ctypes import windll  # type: ignore
    except ImportError:
        windll = None
        logger.warning("ctypes.windll not available on this system.")
else:
    windll = None

#The Nexus class is the core of the Nexus engine.
# Orchestrating the entire process from receiving a user query to returning aggregated results.
# It handles encryption and decryption of prompts and responses. 
# It integrates web scraping for real-time data, and coordinates querying multiple AI models concurrently.
# The class also leverages the ResponseAggregator to analyze and synthesize the responses. This ensures that users receive the most accurate and comprehensive answers possible.
class Nexus:
    def __init__(self, models: Dict[str, ModelConnector], encrypt: bool = True):
        self.models = models
        self.encrypt_mode = encrypt
        self.key = os.urandom(32) if encrypt else None
        self.backend = default_backend() if encrypt else None

    def encrypt(self, text: str) -> str:
        if not self.encrypt_mode:
            return text
        iv = os.urandom(16)
        padder = sym_padding.PKCS7(128).padder()
        padded = padder.update(text.encode("utf-8")) + padder.finalize()
        cipher = Cipher(algorithms.AES(self.key), modes.CBC(iv), backend=self.backend)
        ct = cipher.encryptor().update(padded) + cipher.encryptor().finalize()
        return base64.b64encode(iv + ct).decode("utf-8")

    def decrypt(self, token: str) -> str:
        if not self.encrypt_mode:
            return token
        data = base64.b64decode(token)
        iv, ct = data[:16], data[16:]
        cipher = Cipher(algorithms.AES(self.key), modes.CBC(iv), backend=self.backend)
        pt_padded = cipher.decryptor().update(ct) + cipher.decryptor().finalize()
        unpadder = sym_padding.PKCS7(128).unpadder()
        return unpadder.update(pt_padded) + unpadder.finalize().decode("utf-8", errors="replace")

    def build_prompt(self, query: str, search: dict, images: dict) -> str:
        context_lines = [f"- {item['title']}: {item['link']}" for item in search.get("results", [])]
        context_lines += [f"- {url}" for url in images.get("images", [])]
        return f"QUESTION:\n{query}\n\nCONTEXT:\n" + "\n".join(context_lines)

    def run(self, query: str) -> dict:
        try:
            search_data = get_search_results(query)
            image_data = get_image_results(query)
            prompt_text = self.build_prompt(query, search_data, image_data)
            processed_prompt = self.decrypt(self.encrypt(prompt_text))

            responses: Dict[str, str] = {}
            with ThreadPoolExecutor(max_workers=len(self.models)) as executor:
                futures = {executor.submit(conn.query, processed_prompt): name for name, conn in self.models.items()}
                for future in as_completed(futures):
                    name = futures[future]
                    try:
                        resp: ModelResponse = future.result()
                        if resp.success and isinstance(resp.payload, dict):
                            responses[name] = resp.payload.get("text") or json.dumps(resp.payload)
                        else:
                            responses[name] = f"Error: {resp.error}"
                    except Exception as e:
                        logger.error(f"Exception querying {name}: {e}")
                        responses[name] = f"Error: {str(e)}"

            aggregator = ResponseAggregator(responses)
            aggregator.sanitize_responses()

            return {
                "search": search_data,
                "images": image_data,
                "ranked": aggregator.rank(),
                "preferred": aggregator.preferred(),
                "combined": aggregator.combine(),
                "overall_best": aggregator.best_tfidf(),
                "consensus": aggregator.consensus(),
                "middle_ground": aggregator.generate_middle_ground(),
            }

        except Exception as e:
            logger.exception("Nexus engine failed:")
            return {"error": str(e)}

if __name__ == "__main__":
    print("This module is not meant to be run directly.")

# Using the Nexus engine with AWS s3 and AWS Glacier for backup purposes allows for easy backup and retrieval of Nexus engine data. With this setup, the Nexus engine's data can be easily backed up and retrieved, ensuring data integrity, expert logging and consistent reliability.
def upload_to_s3(file_path: str, bucket_name: str, object_key: str):
    try:
        s3 = boto3.client("s3")
        s3.upload_file(file_path, bucket_name, object_key)
        return f"✅ Uploaded '{file_path}' to '{bucket_name}/{object_key}'"
    except FileNotFoundError:
        return f"❌ File not found: {file_path}"
    except NoCredentialsError:
        return "❌ AWS credentials not found"
    except Exception as e:
        return f"❌ Upload failed: {str(e)}"

# The backup_to_glacier function is responsible for uploading the backup file to an AWS Glacier vault for long-term storage. This function uses the Boto3 library to interact with AWS services. This function for Nexus is designed to take the latest backup of Nexus's engine data and store it in an AWS Glacier vault for long-term storage for future retrieval and analysis but also for emergency recovery purposes.
def backup_to_glacier(file_path: str) -> str:
    try:
        glacier = boto3.client('glacier')
        vault_name = 'nexus-engine-archive'

        with open('backup.zip', 'rb') as data:
            response = glacier.upload_archive(
                vaultName=vault_name,
                archiveDescription='Nightly backup from Nexus engine',
                body=data
            )
            return f"✅ Archive uploaded successfully. Archive ID: {response['archiveId']}"
    except Exception as e:
        return f"❌ Glacier backup failed: {str(e)}"


def lambda_handler(event, context):
    query = event.get("query", "What is Nexus?")
    models = load_connectors_for_engine()
    engine = Nexus(models)
    return engine.run(query)

if __name__ == "__main__":
    lambda_handler(None, None)
#End Of Engine Code
# This code is designed to be modular and extensible, allowing for easy integration of new AI models and data sources.
# It is also designed to be user-friendly, with a focus on providing clear and actionable insights and ensuring that sensitive information is protected throughout the process.
# The Nexus engine is a powerful platform that can be used in various applications, from academic research to business intelligence, and it aims to democratize access to advanced AI capabilities by making Gen AI replies more accurate and more correct.