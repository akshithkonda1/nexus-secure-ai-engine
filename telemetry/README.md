# Ryuzen Telemetry System

Ryuzen Telemetry is a neutral, ethical observability layer for large language models (LLMs). It focuses on short-term model performance events without storing user chat history. This directory contains schema definitions, sanitization utilities, ingestion pipelines, analytics helpers, and infrastructure scaffolding for the telemetry stack.

## Structure
- `schema/`: Pydantic data models for telemetry events.
- `scrubber/`: Triple-layer sanitization, certificate generation, and quarantine utilities.
- `ingestion/`: AWS Lambda handlers for ingesting, sanitizing, and preparing analytics data.
- `analytics/`: Glue catalog and Athena helpers for the data lakehouse.
- `sanitization/`, `bundles/`, `delivery/`, `audit/`, `cli/`, `terraform/`: Placeholders for future expansion.

> **Note:** User conversation history must never be captured or stored in this pipeline. Only model performance telemetry is processed.
