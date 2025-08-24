# load_model_connectors.py
#Developed by Akshith Konda 

from Nexus_API_secrets import SECRETS, get_model_connectors
from model_connector import ModelConnector  # Your actual connector class

def load_connectors() -> List[ModelConnector]:
    from Nexus_API_secrets import SECRETS
    return [
        ModelConnector(name, creds["key"], creds["endpoint"])
        for name, creds in SECRETS.items()
    ]


