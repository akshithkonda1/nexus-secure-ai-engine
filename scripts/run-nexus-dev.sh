#!/usr/bin/env bash
set -euo pipefail
IMG="${1:-94e1f18e223d3bb91ee83e6c4711866641bec9c2130cd8288ae269dafc6c5f8c}"

if docker ps -a --format '{{.Names}}' | grep -Eq '^nexus-alpha$'; then
  docker rm -f nexus-alpha >/dev/null 2>&1 || true
fi

docker run -d --name nexus-alpha -p 8080:8080 \
  -e NEXUS_ENV=dev \
  -e NEXUS_ALLOW_ALL_MODELS=1 \
  -e NEXUS_ALLOW_THIRD_PARTY_SEARCH=0 \
  -e NEXUS_ENABLE_DDG=1 \
  -e NEXUS_SCRAPE_ALLOW_DOMAINS="wikipedia.org,arxiv.org,arxiv.org,bbc.co.uk,nytimes.com" \
  -e NEXUS_DATA_KEY_B64="$(openssl rand -base64 32)" \
  "$IMG"

echo "Waiting for readiness..."
for i in {1..30}; do
  if curl -fsS http://localhost:8080/readyz >/dev/null; then
    echo "Ready at http://localhost:8080"
    exit 0
  fi
  sleep 2
done

echo "Service not ready. Logs:"
docker logs nexus-alpha | tail -n 200
exit 1
