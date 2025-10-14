# Nexus Frontend (Production Mode)

This frontend integrates with the Nexus Engine API when `VITE_NEXUS_API_BASE` is set.

## Configure
Copy `.env.example` to `.env` and set the API base URL for your deployment:

```bash
cp .env.example .env
# edit VITE_NEXUS_API_BASE=https://your-nexus-api.example
```

## Install & Build
Install dependencies and run the standard production checks:

```bash
pnpm install
pnpm typecheck
pnpm build
pnpm preview
```

## Behavior
- When `VITE_NEXUS_API_BASE` is unset the chat falls back to the local mock behavior.
- When configured, `Send` requests are sent to `POST /debate` on the Nexus Engine and the UI renders the response without visual changes.
- API metadata and sources are exposed on `window.__nexusMeta` and `window.__nexusSources` for future UI enhancements.
