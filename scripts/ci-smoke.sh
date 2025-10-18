#!/usr/bin/env bash
set -euo pipefail

SERVICE="nexus"
COMPOSE_FILE="docker-compose.ci.yml"
PORT="${PORT:-8080}"

echo "==> docker compose up -d"
docker compose -f "$COMPOSE_FILE" up -d "$SERVICE"

CID="$(docker compose -f "$COMPOSE_FILE" ps -q "$SERVICE")"
if [[ -z "$CID" ]]; then
  echo "Container ID not found; printing compose ps"
  docker compose -f "$COMPOSE_FILE" ps
  exit 1
fi

echo "==> waiting for health (compose healthcheck)"
for i in {1..30}; do
  STATUS="$(docker inspect --format='{{.State.Health.Status}}' "$CID" 2>/dev/null || echo "no-health")"
  UP="$(docker inspect --format='{{.State.Status}}' "$CID" 2>/dev/null || echo "unknown")"

  if [[ "$STATUS" == "healthy" ]]; then
    echo "Healthy ✅"
    break
  fi

  if [[ "$UP" != "running" ]]; then
    echo "Container is not running (state=$UP). Showing logs…"
    docker compose -f "$COMPOSE_FILE" logs --no-color "$SERVICE" || true
    exit 1
  fi

  echo "Still waiting (health=$STATUS)…"
  sleep 4

done

if [[ "$STATUS" != "healthy" ]]; then
  echo "Timed out waiting for healthy status; showing logs"
  docker compose -f "$COMPOSE_FILE" logs --no-color "$SERVICE" || true
  exit 1
fi

# Final readiness probe
echo "==> final readiness curl"
for path in /health /healthz /status /readyz /; do
  if curl -fsS "http://127.0.0.1:${PORT}${path}" >/dev/null; then
    echo "Ready at ${path}"
    exit 0
  fi
done

echo "Service did not respond successfully; showing logs:"
docker compose -f "$COMPOSE_FILE" logs --no-color "$SERVICE" || true
exit 1
