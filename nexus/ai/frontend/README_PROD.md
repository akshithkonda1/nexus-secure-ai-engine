# Nexus Frontend (Production Mode)

This frontend integrates with the Nexus Engine API when `VITE_NEXUS_API_BASE` is set.

## Configure
Copy `.env.example` to `.env` and set:

```
VITE_NEXUS_API_BASE=https://your-nexus-api.example
```

> Do **not** put secrets in the browser. Your reverse proxy or API gateway should inject `X-API-Key` on the server side.

## Run
```
pnpm install
pnpm build
pnpm preview
```

## Behavior
- If `VITE_NEXUS_API_BASE` is set, the UI calls `POST ${VITE_NEXUS_API_BASE}/debate` and maps the response to the existing UI without changing visuals.
- If not set, it falls back to the original mock behavior so demos still work.

## Errors
- 429: alert with retry-after seconds
- 502 / verification_failed: alert that connectors/verification are down
- 504: alert to try a longer deadline
