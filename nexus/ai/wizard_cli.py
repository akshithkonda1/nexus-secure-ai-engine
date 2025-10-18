from __future__ import annotations
import sys, os

from .nexus_config import NexusConfig, save_config


def _input(prompt: str, default: str = "") -> str:
    try:
        v = input(f"{prompt}{f' [{default}]' if default else ''}: ").strip()
        return v or default
    except Exception:
        return default


def main():
    name = _input("Your name", os.getenv("NEXUS_USER_NAME", "user"))
    age = _input("Your age", os.getenv("NEXUS_USER_AGE", "12"))
    try:
        if int(age) < 10:
            print(f"Sorry {name}, you must be 10 or older.")
            sys.exit(1)
    except Exception:
        print("Invalid age")
        sys.exit(1)

    clouds = _input("Clouds (comma: aws,azure,gcp)", os.getenv("NEXUS_CLOUDS", "aws"))
    secret_providers = [c.strip().lower() for c in clouds.split(",") if c.strip()]
    memory_providers = secret_providers or ["memory"]

    mode = _input(
        "Engine mode (delegates|direct|mixed)", os.getenv("NEXUS_ENGINE_MODE", "mixed")
    ).lower()
    routing = _input(
        "Routing policy (reliability_weighted|round_robin|first_good)",
        os.getenv("NEXUS_ROUTING_POLICY", "reliability_weighted"),
    ).lower()

    secret_overrides = {}
    # Minimal prompts; can be expanded per provider as needed
    if mode in {"direct", "mixed"}:
        gpt_ep = _input("GPT HTTPS endpoint (optional)", os.getenv("GPT_ENDPOINT", ""))
        if gpt_ep:
            secret_overrides["GPT_ENDPOINT"] = gpt_ep
        openai_key = _input(
            "OPENAI_API_KEY secret id/value (optional)", os.getenv("OPENAI_API_KEY", "")
        )
        if openai_key:
            secret_overrides["OPENAI_API_KEY"] = openai_key

        use_bed = _input(
            "Use AWS Bedrock? (y/N)", os.getenv("NEXUS_USE_BEDROCK", "n")
        ).lower() in {"y", "yes", "1", "on"}
        if use_bed:
            br_region = _input("Bedrock region", os.getenv("BEDROCK_REGION", "us-east-1"))
            br_model = _input(
                "Bedrock model id",
                os.getenv("BEDROCK_MODEL_ID", "anthropic.claude-3-5-sonnet-20240620-v1:0"),
            )
            if br_region:
                secret_overrides["BEDROCK_REGION"] = br_region
            if br_model:
                secret_overrides["BEDROCK_MODEL_ID"] = br_model

        use_aoai = _input(
            "Use Azure OpenAI? (y/N)", os.getenv("NEXUS_USE_AZURE_OPENAI", "n")
        ).lower() in {"y", "yes", "1", "on"}
        if use_aoai:
            aoai_ep = _input(
                "Azure OpenAI endpoint (https://<resource>.openai.azure.com)",
                os.getenv("AZURE_OPENAI_ENDPOINT", ""),
            )
            aoai_dep = _input(
                "Azure OpenAI deployment name",
                os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4o-mini"),
            )
            aoai_key = _input("Azure OpenAI api-key", os.getenv("AZURE_OPENAI_API_KEY", ""))
            aoai_ver = _input(
                "Azure OpenAI api-version",
                os.getenv("AZURE_OPENAI_API_VERSION", "2024-07-01-preview"),
            )
            if aoai_ep:
                secret_overrides["AZURE_OPENAI_ENDPOINT"] = aoai_ep
            if aoai_dep:
                secret_overrides["AZURE_OPENAI_DEPLOYMENT"] = aoai_dep
            if aoai_key:
                secret_overrides["AZURE_OPENAI_API_KEY"] = aoai_key
            if aoai_ver:
                secret_overrides["AZURE_OPENAI_API_VERSION"] = aoai_ver

        use_aif = _input(
            "Use Azure AI Foundry (serverless/managed inference)? (y/N)",
            os.getenv("NEXUS_USE_AZURE_FOUNDRY", "n"),
        ).lower() in {"y", "yes", "1", "on"}
        if use_aif:
            aif_ep = _input(
                "Azure Inference endpoint URL", os.getenv("AZURE_INFERENCE_ENDPOINT", "")
            )
            aif_key = _input("Azure Inference api-key", os.getenv("AZURE_INFERENCE_API_KEY", ""))
            if aif_ep:
                secret_overrides["AZURE_INFERENCE_ENDPOINT"] = aif_ep
            if aif_key:
                secret_overrides["AZURE_INFERENCE_API_KEY"] = aif_key

        use_vertex = _input(
            "Use Google Vertex AI? (y/N)", os.getenv("NEXUS_USE_VERTEX", "n")
        ).lower() in {"y", "yes", "1", "on"}
        if use_vertex:
            gproj = _input("Google Cloud project id", os.getenv("GOOGLE_PROJECT", ""))
            vloc = _input(
                "Vertex location (e.g., us-central1)",
                os.getenv("VERTEX_LOCATION", "us-central1"),
            )
            vmod = _input(
                "Vertex model id (e.g., gemini-1.5-pro-002)",
                os.getenv("VERTEX_MODEL_ID", "gemini-1.5-pro-002"),
            )
            if gproj:
                secret_overrides["GOOGLE_PROJECT"] = gproj
            if vloc:
                secret_overrides["VERTEX_LOCATION"] = vloc
            if vmod:
                secret_overrides["VERTEX_MODEL_ID"] = vmod

    if mode in {"delegates", "mixed"}:
        gpt_del = _input(
            "GPT delegate (e.g., aws:lambda:fn@us-east-1 | gcp:run:https://...)",
            os.getenv("NEXUS_SECRET_GPT_DELEGATE", ""),
        )
        if gpt_del:
            secret_overrides["NEXUS_SECRET_GPT_DELEGATE"] = gpt_del

    cfg = NexusConfig(
        engine_mode=mode,
        routing_policy=routing,
        secret_providers=secret_providers or ["aws"],
        secret_overrides=secret_overrides,
        secret_ttl_seconds=int(os.getenv("NEXUS_SECRET_TTL", "600")),
        memory_providers=memory_providers or ["memory"],
        memory_fanout_writes=True,
        require_any_connector=True,
        max_context_messages=int(os.getenv("NEXUS_MAX_CTX", "12")),
        alpha_semantic=float(os.getenv("NEXUS_ALPHA", "0.7")),
        encrypt=os.getenv("NEXUS_ENCRYPT", "1") not in {"0", "false", "no"},
    )

    path = save_config(cfg, os.getenv("NEXUS_CONFIG_PATH"))
    print(f"Saved config -> {path}")


if __name__ == "__main__":
    # non-interactive fallback
    if not sys.stdin or not sys.stdin.isatty():
        os.environ.setdefault("NEXUS_USER_NAME", "user")
        os.environ.setdefault("NEXUS_USER_AGE", "12")
    main()
