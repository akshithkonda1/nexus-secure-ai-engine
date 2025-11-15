# syntax=docker/dockerfile:1.6

FROM python:3.11-slim AS builder

ENV PIP_NO_CACHE_DIR=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

RUN apt-get update \
    && apt-get install --no-install-recommends -y build-essential gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
COPY requirements/ requirements/
COPY nexus/ai/requirements.txt nexus/ai/requirements.txt

RUN pip install --upgrade pip setuptools wheel \
    && pip wheel --wheel-dir /wheels -r requirements.txt

FROM python:3.11-slim AS runtime

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    UMASK=027 \
    APP_HOME=/app

WORKDIR ${APP_HOME}

RUN addgroup --system nexus \
    && adduser --system --ingroup nexus nexus

COPY --from=builder /wheels /tmp/wheels
COPY requirements.txt ./

RUN pip install --no-index --find-links /tmp/wheels -r requirements.txt \
    && rm -rf /tmp/wheels

COPY --chown=nexus:nexus nexus ./nexus
COPY --chown=nexus:nexus api ./api
COPY --chown=nexus:nexus gunicorn.conf.py ./
COPY --chown=nexus:nexus engine.py ./engine.py
COPY --chown=nexus:nexus requirements/ ./requirements

USER nexus

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD python -c "import sys, urllib.request; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8080/healthz', timeout=5).status == 200 else 1)"

CMD ["gunicorn", "--bind", "0.0.0.0:8080", "--config", "gunicorn.conf.py", "nexus.ai.nexus_flask_app:app"]
