# Ryuzen Toron v1.6 API Reference

This reference summarizes the primary ToronEngine endpoints and usage patterns for synchronous and streaming requests.

## Endpoints
- `POST /api/v1/ask` — synchronous request/response.
- `GET /api/v1/stream` — Server-Sent Events stream for token deltas.
- `GET /ws/stream` — WebSocket upgrade for bidirectional streaming.
- `GET /api/v1/models` — list connectors and available models.
- `GET /api/v1/connectors` — connector metadata and status.
- `GET /api/v1/telemetry/summary` — aggregated metrics snapshot.
- `GET /api/v1/health` — Kubernetes probes.

## Authentication
Include `X-Ryuzen-Key: <api_key>` on every request. For streaming, the header is required on the initial upgrade request.

## Request Encryption
Payloads can be envelope encrypted with a KMS-backed key. The body should include an `encryption` block:
```json
{
  "prompt": "Classify this log line",
  "encryption": {
    "key_id": "kms:projects/.../keys/telemetry",
    "nonce": "v1-169990",
    "algorithm": "XChaCha20-Poly1305",
    "payload": "<base64 ciphertext>"
  }
}
```
The backend decrypts inside ToronEngine, never persisting plaintext.

## Usage Examples

### Python
```python
import requests

API_KEY = "<api-key>"
BASE_URL = "https://api.ryuzen.example.com"

resp = requests.post(
    f"{BASE_URL}/api/v1/ask",
    headers={"X-Ryuzen-Key": API_KEY},
    json={"prompt": "Summarize zero trust", "model": "gpt-4o"},
)
resp.raise_for_status()
print(resp.json()["output"])
```

### TypeScript (fetch)
```ts
const res = await fetch("https://api.ryuzen.example.com/api/v1/ask", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Ryuzen-Key": process.env.RYUZEN_API_KEY!,
  },
  body: JSON.stringify({ prompt: "Generate audit report", stream: false }),
});
const body = await res.json();
console.log(body.output);
```

### React Native (Expo)
```js
const callToron = async () => {
  const res = await fetch("https://api.ryuzen.example.com/api/v1/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Ryuzen-Key": process.env.RYUZEN_API_KEY,
    },
    body: JSON.stringify({ prompt: "Draft an incident report" }),
  });
  const payload = await res.json();
  return payload.output;
};
```

### CLI (curl)
```bash
curl -H "X-Ryuzen-Key: $RYUZEN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"List models", "stream":false}' \
  https://api.ryuzen.example.com/api/v1/ask
```

### SSE Streaming Example
```bash
curl -N -H "Accept: text/event-stream" \
  -H "X-Ryuzen-Key: $RYUZEN_API_KEY" \
  "https://api.ryuzen.example.com/api/v1/stream?prompt=Hello+world&model=gpt-4o"
```
Each `data:` line is JSON containing `{ "token": "...", "index": 12 }` until `[DONE]`.

### WebSocket Streaming Example
```python
import websockets, json, asyncio

async def main():
    async with websockets.connect(
        "wss://api.ryuzen.example.com/ws/stream",
        extra_headers={"X-Ryuzen-Key": "<api-key>"},
    ) as ws:
        await ws.send(json.dumps({"prompt": "Stream me"}))
        async for message in ws:
            print(message)

asyncio.run(main())
```

## Best Practices
- Prefer `stream=true` for long-form generations to reduce tail latency.
- Send `metadata` with request IDs for correlation across traces and logs.
- Use TLS everywhere; never transmit tokens or secrets in query strings.
- Enable SSE backpressure by reading from the socket promptly; idle clients may be disconnected.
- Handle `429` responses by backing off exponentially and honoring `Retry-After` headers.
- Rotate API keys regularly; issue keys per service to improve blast-radius control.
- Avoid embedding PII in prompts; telemetry is redacted before export but should be treated as sensitive.

## Error Model
Errors follow `{ "status": "error", "error": "<message>" }` with HTTP status codes indicating the failure class.
