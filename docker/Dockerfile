# Toron engine container image
# Build: docker build -f docker/Dockerfile -t toron-engine:latest ..
# Push: docker push <registry>/toron-engine:latest

FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install build dependencies
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy source and runtime assets
COPY toron/ toron/
COPY src/ src/
COPY pytest.ini Makefile README.md ./

EXPOSE 8080

CMD ["python", "src/backend/server.py"]
