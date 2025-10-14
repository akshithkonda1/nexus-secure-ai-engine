# syntax=docker/dockerfile:1.6

FROM python:3.11-slim AS builder
ENV PIP_NO_CACHE_DIR=1
WORKDIR /app
COPY requirements.txt ./
COPY nexus.ai/requirements.txt nexus.ai/requirements.txt
RUN pip install --upgrade pip setuptools wheel \
    && pip wheel --wheel-dir /wheels -r requirements.txt

FROM python:3.11-slim AS runtime
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    UMASK=027

RUN addgroup --system nexus && adduser --system --ingroup nexus nexus
WORKDIR /app

COPY --from=builder /wheels /wheels
COPY . .
RUN pip install --no-index --find-links /wheels -r requirements.txt \
    && rm -rf /wheels

USER nexus
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD python -c "import sys, urllib.request; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8080/healthz', timeout=5).status == 200 else 1)"
CMD ["gunicorn", "-c", "gunicorn.conf.py", "nexus.ai.nexus_flask_app:app"]
