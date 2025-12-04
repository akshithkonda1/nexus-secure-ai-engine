"""
Dockerfile for Toron Engine v2.0
"""

FROM python:3.11-slim

WORKDIR /app

COPY ../../../../../../requirements.txt /app/requirements.txt
RUN pip install -r requirements.txt

COPY . /app

CMD ["python3", "-m", "engine_v2.api.toron_engine"]


