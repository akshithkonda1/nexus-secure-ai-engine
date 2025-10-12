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
    PYTHONDONTWRITEBYTECODE=1

RUN addgroup --system nexus && adduser --system --ingroup nexus nexus
WORKDIR /app

COPY --from=builder /wheels /wheels
COPY . .
RUN pip install --no-index --find-links /wheels -r requirements.txt \
    && rm -rf /wheels

USER nexus
EXPOSE 8443
CMD ["gunicorn", "-c", "gunicorn.conf.py", "nexus.ai.nexus_flask_app:app"]
