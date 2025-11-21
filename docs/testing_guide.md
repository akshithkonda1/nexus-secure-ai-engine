# Testing Guide

## Running pytest
Install dependencies and run the suite with coverage and HTML output:
```bash
pip install -r requirements-dev.txt
pytest
```
Reports are emitted to `reports/report.html` and coverage HTML is stored under `htmlcov/`.

## Coverage thresholds
Tests fail if coverage drops below 90% due to `--cov-fail-under=90` in `pytest.ini`.

## Additional targets
A Makefile shortcut is available:
```bash
make test
```
