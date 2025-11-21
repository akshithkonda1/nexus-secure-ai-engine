# Ryuzen Toron v1.6 API Reference

This document describes the REST and streaming interfaces for the Ryuzen Toron v1.6 backend. All requests must include **either** `X-API-Key` or `Authorization: Bearer <token>` issued by the control plane.

## Base URLs
- Production: `https://api.ryuzen.example.com`
- Staging: `https://staging.api.ryuzen.example.com`
- Local dev: `http://localhost:8000`

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/v1/health` | Liveness/readiness probe. |
| GET | `/api/v1/models` | List available models/connectors. |
| POST | `/api/v1/ask` | Non-streaming completion. |
| POST | `/api/v1/stream` | Streaming completion via SSE. |
| GET | `/ws/stream` | Streaming completion via WebSocket. |
| GET | `/api/v1/connectors` | Retrieve connector states. |
| POST | `/api/v1/connectors` | Trigger connector sync. |
| GET | `/api/v1/telemetry/summary` | Operational metrics. |

---
## Request/Response Schemas

- **AskRequest**
  - `query` (string, required): Prompt.
  - `model` (string, optional): Explicit model/connector alias.
  - `connectors` (array<string>, optional): Connector list.
  - `stream` (boolean, optional): Prefer streaming response.
  - `temperature` (number, default `0.7`).
  - `metadata` (object, optional): Arbitrary audit metadata.
  - `encrypted_payload` (object, optional): Envelope `{key_id, iv, ciphertext, tag}` (AES-GCM recommended). Plaintext fields are ignored when this is present.

- **AskResponse**
  - `id` (string): Request id.
  - `answer` (string): Final completion text.
  - `model` (string): Model/connector used.
  - `latency_ms` (integer): Time to completion or first token.
  - `usage` (object): `{prompt_tokens, completion_tokens, total_tokens}`.
  - `finish_reason` (string): Model termination reason.
  - `trace_id` (string): Trace correlation id.

- **DeltaEvent** (streaming)
  - `event` (`delta` | `error` | `done`).
  - `data` (object): `{token?, usage?}`.
  - `done` (boolean): Sent with the final event.

---
## Usage Examples

### Non-Streaming Completion (Python)
```python
import requests

BASE = "https://api.ryuzen.example.com"
resp = requests.post(
    f"{BASE}/api/v1/ask",
    headers={"X-API-Key": "<api-key>"},
    json={"query": "Summarize the SOC2 controls for encryption at rest"},
    timeout=30,
)
resp.raise_for_status()
print(resp.json()["answer"])
```

### Non-Streaming Completion (TypeScript/JS)
```ts
import fetch from "node-fetch";

const base = "https://api.ryuzen.example.com";
const res = await fetch(`${base}/api/v1/ask`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": process.env.RYUZEN_API_KEY!,
  },
  body: JSON.stringify({ query: "Draft a BCP for multi-region failover" }),
});
const body = await res.json();
console.log(body.answer);
```

### Non-Streaming Completion (cURL)
```bash
curl -X POST "https://api.ryuzen.example.com/api/v1/ask" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $RYUZEN_API_KEY" \
  -d '{"query": "List the ISO27001 annex A controls"}'
```

### Non-Streaming Completion (CLI)
```bash
ryuzen ask \
  --endpoint https://api.ryuzen.example.com \
  --api-key "$RYUZEN_API_KEY" \
  --query "Generate an audit-ready change management policy"
```

### Streaming via SSE (Python)
```python
import requests

with requests.post(
    "https://api.ryuzen.example.com/api/v1/stream",
    headers={"X-API-Key": "<api-key>"},
    json={"query": "Simulate a tabletop incident response"},
    stream=True,
) as resp:
    resp.raise_for_status()
    for line in resp.iter_lines():
        if not line:
            continue
        decoded = line.decode("utf-8")
        if decoded.startswith("data:"):
            print(decoded.removeprefix("data:"))
```

### Streaming via SSE (cURL)
```bash
curl -N "https://api.ryuzen.example.com/api/v1/stream" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $RYUZEN_API_KEY" \
  -d '{"query": "Provide a mitigation plan for CVE-2024-1234", "stream": true}'
```

### Streaming via WebSocket (TypeScript)
```ts
const ws = new WebSocket("wss://api.ryuzen.example.com/ws/stream?model=toron-guard");
ws.onopen = () => {
  ws.send(JSON.stringify({ query: "Walk through the SOC escalation policy" }));
};
ws.onmessage = (event) => {
  const payload = JSON.parse(event.data);
  if (payload.done) ws.close();
  else console.log(payload.data?.token ?? event.data);
};
```

### Streaming via WebSocket (Python CLI)
```bash
python - <<'PY'
import json, websockets, asyncio

async def main():
    uri = "wss://api.ryuzen.example.com/ws/stream"
    async with websockets.connect(uri, extra_headers={"X-API-Key": "<api-key>"}) as ws:
        await ws.send(json.dumps({"query": "Outline Zero Trust milestones"}))
        async for msg in ws:
            data = json.loads(msg)
            if data.get("done"):
                break
            print(data.get("data", {}).get("token"))

asyncio.run(main())
PY
```

### Connector Sync (cURL)
```bash
curl -X POST "https://api.ryuzen.example.com/api/v1/connectors" \
  -H "X-API-Key: $RYUZEN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"connector": "sharepoint", "force_full_sync": true}'
```

---
## Streaming Guidelines

**SSE consumption**
- Set `Accept: text/event-stream` or use POST with `stream=True` (Python `requests`).
- Each event uses the `DeltaEvent` schema under `data:` lines. A `done` event signals completion.
- Reconnect using `Last-Event-ID` for idempotency where supported.

**WebSocket consumption**
- Perform a standard WebSocket upgrade to `/ws/stream` with `X-API-Key` header.
- First client message must be an `AskRequest`. Subsequent messages can adjust metadata or cancel.
- The server streams `DeltaEvent` frames; a final frame includes `done: true`.

---
## Encrypted Payload Structure

When transporting encrypted prompts:
1. Encrypt the serialized `AskRequest` with AES-256-GCM using a per-request IV.
2. Wrap the data as:
   ```json
   {
     "encrypted_payload": {
       "key_id": "arn:aws:kms:us-east-1:123456789012:key/abcd-1234",
       "iv": "<base64-iv>",
       "ciphertext": "<base64-ciphertext>",
       "tag": "<base64-gcm-tag>"
     }
   }
   ```
3. Do not send plaintext `query` when `encrypted_payload` is present.
4. The ToronEngine decrypts in-memory only; no decrypted data is written to disk or logs.

---
## Zero-Knowledge Guidelines
- Never transmit unencrypted secrets or PII; prefer encrypted payloads for sensitive prompts.
- Zero plaintext secrets in Git, Docker layers, or CI logs.
- Disable reflective logging for user prompts; rely on hashed trace identifiers.
- Use short-lived API keys and rotate regularly with your cloud KMS.
- Clients should wipe memory buffers after handling responses, especially in native apps.
- For regulated workloads, enable deterministic replay via `trace_id` without persisting raw content.

---
## Native App Guidance
- Use platform-native secure stores (Keychain, Keystore, DPAPI) for `X-API-Key`/JWT.
- Pin TLS certificates where possible to reduce MITM risk.
- Prefer WebSocket streaming on mobile to minimize battery/network overhead; fall back to SSE when proxies block WS.
- Guard background tasks with exponential backoff and jitter for reconnections.
- Keep payload sizes modest; compress request bodies when networks are lossy.

---
## Connector & Telemetry Notes
- `GET /api/v1/connectors` returns `ConnectorState` with last sync timestamps; polling cadence should respect provider rate limits.
- `POST /api/v1/connectors` is idempotent per connector and returns `202 Accepted` while the sync runs in the background.
- `GET /api/v1/telemetry/summary` is anonymized; avoid correlating to user identities to maintain zero-knowledge posture.

