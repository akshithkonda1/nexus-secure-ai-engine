help:
@echo "Available commands:"
@echo "make run"
@echo "make docker"
@echo "make test"
@echo "make fmt"
@echo "make deploy"

run:
uvicorn src.backend.api.server:app --host 0.0.0.0 --port 8080

docker:
docker build -t ryuzen-engine:latest .

test:
pytest --html=reports/test_report.html --self-contained-html

fmt:
black src/**/*.py
isort src/**/*.py

deploy:
kubectl apply -f k8s/
