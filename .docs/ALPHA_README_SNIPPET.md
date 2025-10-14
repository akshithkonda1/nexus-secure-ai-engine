### Alpha Access
This is an **alpha** build running in production with guardrails (token gate, rate limits, 1MB request cap, timeouts, metrics).
- Health: `/healthz`, readiness: `/readyz`, metrics: `/metrics` (Prometheus).
- Send `X-Alpha-Token: <token>` header to access gated routes.
- Please avoid sending secrets or personal data; we log minimal performance telemetry.

### Local quickstart
```bash
export FLASK_APP=nexus_flask_app:app   # or your app module
export ALPHA_ACCESS_TOKEN=CHANGE_ME
gunicorn -c gunicorn.conf.py $FLASK_APP
```
