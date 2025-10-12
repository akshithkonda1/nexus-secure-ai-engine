<!-- Repo Banner -->
<p align="center">
  <img src="assets/banner_nexus_suite.png" alt="Nexus Suite Banner" width="100%">
</p>

# nexus-secure-ai-engine

![Build](https://img.shields.io/badge/build-Passing-brightgreen)
![Python](https://img.shields.io/badge/python-3.10+-blue)
![License](https://img.shields.io/badge/license-CC%20BY--NC%204.0-orange)
![Status](https://img.shields.io/badge/status-Production%20Ready-brightgreen)

---

# Nexus — Secure, Scalable, Smart.

> **The AI debate engine that validates answers before they reach you** — combining multiple LLMs, real-time web intelligence, and enterprise-grade encryption.

---

## Quick Snapshot
| Category       | Details |
|----------------|---------|
| **Status**     | Production Ready — automated CI/CD, hardened dependencies, Dockerized deployment |
| **Tech Stack** | Python 3.10+, Flask, Terraform |
| **Cloud Stack**| **AWS** (S3, RDS, DynamoDB, Glacier, ECS, KMS), **Azure** (Blob Storage, Key Vault, Cosmos DB, AKS), **GCP** (GCS, Cloud SQL/Spanner, BigQuery, GKE, KMS) |
| **Core Focus** | Multi-cloud AI orchestration, secure data flow, scalable low-latency architecture |
| **License**    | CC BY-NC 4.0 — Non-commercial use only without written consent |

---

## What is Nexus?

Nexus is a security-focused AI engine that aggregates and analyzes responses from multiple AI models plus traditional search
engines and media to deliver a comprehensive and nuanced answer to user queries. It pairs live web retrieval and scraping with
strict schema guarantees and cryptographic isolation.

Nexus integrates 256-bit AES-GCM encryption for data at rest and in motion (with tenant/instance/user-scoped AAD), and uses
response aggregation policies—including model "debate" and consensus—to improve reliability. It’s horizontally scalable and
easily extensible: new models and data sources can be onboarded without rewriting the core engine.

Built for developers and researchers yet friendly to end users, Nexus focuses on clear, actionable insights verified against the
web.

Nexus was developed by Akshith Konda.

---

## Why It’s Different
Unlike most AI systems that simply generate output, Nexus:
1. Forces **multi-model debate** to reduce bias and hallucinations.
2. Validates answers against **real-time, authoritative sources**.
3. Embeds **production-grade security** from the first line of code.
4. Ships with **release-pipeline automation** so teams can promote builds confidently.
5. Integrates seamlessly into **existing enterprise ecosystems** without lock-in.

---

## Why It Matters
Unchecked AI can:
- Hallucinate or fabricate facts.
- Miss critical real-time updates.
- Expose sensitive information (especially critical in Government Environments).
- Introduce costly operational errors.

**Nexus mitigates these risks** by:
- Cross-verifying results across multiple models.
- Adding context from **live search and web intelligence**.
- Applying **AES-256 encryption** end-to-end.
- Scaling for **millions of secure, low-latency requests**.

---

## Core Features (With Impact)
- **Multi-Model AI Debate** — Truth-prioritized, bias-resistant outputs that converge on a consensus answer with ≥2 independent
  sources.
- **Live Context Injection** — Always relevant, always current.
- **Encryption by Default** — AES-256, KMS integration, TLS 1.3 enforcement.
- **Intelligent Ranking** — Noise-filtering algorithms to surface the best answer.
- **Horizontally Scalable** — Operates across AWS, Azure, and GCP without single-region bottlenecks.
- **Release automation included** — GitHub Actions builds, tests, and signs off artefacts on every change.
- **Compliance-Grade Logging** — Full audit trails with configurable TTL.

---

## <img src="assets/logo_infraops.png" alt="InfraOps Logo" width="180px"><br>

#  InfraOps Companion (Coming Soon)

**InfraOps Companion** is a **machine learning & LLM-powered operations manager** for real-time infrastructure observability and automated remediation across multi-cloud environments.

# Key Capabilities

* **Predictive Anomaly Detection** — Anticipates failures before they impact workloads.
* **Automated Incident Resolution** — Executes pre-defined or LLM-assisted remediation workflows to reduce MTTR.
* **Multi-Cloud Operational Dashboards** — Unified visibility across AWS, Azure, and GCP resources.
* **SIEM Integration Ready** — Hooks into enterprise security stacks for compliance and incident correlation.
* **Mission-Critical Resilience** — Designed for zero-downtime environments and distributed systems.

# Why It Matters

InfraOps Companion continuously ingests telemetry from distributed systems, applies **ML-based anomaly detection** and **semantic analysis**, then triggers **auto-remediation playbooks** or human-in-the-loop responses. The result:

* Lower operational overhead
* Faster root-cause analysis
* Higher uptime and resilience
* Reduced costs from outages and escalations

## <img src="assets/logo_loganalyzer.png" alt="LogAnalyzer.AI Logo" width="180px"><br>

# LogAnalyzer.AI (Coming Soon)

**LogAnalyzer.AI** is an **LLM-powered log intelligence platform** purpose-built for AI and multi-cloud ecosystems. It transforms raw logs into actionable insights with natural language, machine learning, and anomaly detection.

### Key Capabilities

* **Natural Language Queries** — Interrogate logs conversationally without complex syntax.
* **AI Hallucination & Drift Detection** — Monitor and surface unusual model behaviors in real time.
* **API Call Pattern Analysis** — Spot emerging systemic risks before they propagate.
* **Root Cause AI Insights** — Accelerate mean time to resolution (MTTR) with automated context and recommendations.

---

## Release Checklist

1. **Verify CI/CD status** — The `CI` GitHub Actions workflow executes `ruff`, `black`, `mypy`, `pytest`, `bandit`, and `pip-audit`. Branch protection should block merges unless the workflow is green.
2. **Tag the stable build** — `git tag -a v1.0.0 -m "Stable build: Nexus engine passes CI" && git push origin v1.0.0`.
3. **Promote artefacts** — Build the multi-stage container with `docker compose build` or via your CI registry publishing job. The provided `Dockerfile` emits a slim, non-root runtime image ready for production orchestrators.
4. **Run load validation** — Execute `k6 run tests/load/k6-smoke.js` against a staging environment and capture the latency histogram in your release notes.

### Why It Matters

Automated linting, security scanning, and dependency audits prevent regressions from landing in production. The container build paired with the load test script ensures parity between CI artefacts and deployed workloads while proving the performance envelope before every release.

## Operations & Security Playbooks

- [Security policy](SECURITY.md) — disclosure process, hardening checklist, and dependency management expectations.
- [Operations guide](docs/OPERATIONS.md) — deployment workflow, health probes, observability hooks, and backup guidance.
- [Health monitor runbook](docs/runbooks/health-monitor.md) — how to respond to failed background snapshots.
- [Rate limiter runbook](docs/runbooks/rate-limiter.md) — steps to diagnose 429 storms or Redis exhaustion.

These documents are the canonical source for SRE and security teams preparing a Nexus production rollout.



## System at a Glance  
**Design Principles:** **Safety, Scalability, Security**  

**Infrastructure Highlights:**  
- **Security:** AES-256, RBAC, multi-cloud KMS, network segmentation, audit logging.  
- **Containerization:** Isolated microservices for each tool, orchestrated via Kubernetes or ECS/AKS/GKE.  
- **Storage Strategy:**  
  - **Hot:** Low-latency object storage, distributed NoSQL.  
  - **Warm:** Relational DBs for transactional workloads.  
  - **Cold:** Long-term archival in cost-optimized storage.  
- **Compute:** Auto-scaling containerized workloads and VM clusters across all major clouds.  
- **Observability:** Cloud-native metrics, automated backups, tiered storage rollovers.

---

## Security Model
- **No hardcoded secrets** — uses `.env` or cloud secrets managers.  
- **Data encryption** — at rest and in transit.  
- **Granular API scopes** — least-privilege integrations.  
- **Attack surface reduction** — DoS mitigation, HTTPS-only endpoints.  
- **Controlled log retention** — compliance-aligned TTL.

---

## Author & Ownership
**Designed, architected, and implemented end-to-end by a single engineer**, showcasing the ability to:
- Deliver **multi-cloud, production-grade AI platforms**.  
- Integrate **security-first principles** into every layer.  
- Build modular systems for **scalable enterprise adoption**.

---

## Getting Started
```bash
# 1. Clone repository
git clone https://github.com/akshiththeindian/nexus-secure-ai-engine.git
cd nexus-secure-ai-engine

# 2. Create a local environment file
cp .env.example .env
# Edit .env with production values (API keys, trusted origins, Redis, DynamoDB, etc.).

# 3. Run the stack locally (Redis + Nexus gateway)
docker compose up --build

# 4. Run the contributor quality gates (optional)
pip install -r requirements-dev.txt
ruff check .
black --check .
pytest

# 5. Execute the load smoke test against a running stack
NEXUS_API_KEY=replace-with-key \
NEXUS_BASE_URL=https://localhost:8443 \
  k6 run tests/load/k6-smoke.js

# 4. Run the contributor quality gates (optional)
pip install -r requirements-dev.txt
ruff check .
black --check .
pytest

# 5. Execute the load smoke test against a running stack
NEXUS_API_KEY=replace-with-key \
NEXUS_BASE_URL=https://localhost:8443 \
  k6 run tests/load/k6-smoke.js
```

> **Note:** Leave `NEXUS_ALLOW_TEST_FALLBACKS` unset in production deployments. Setting it to `1` enables lightweight HTTP/crypto stubs that exist solely for offline unit tests.

```

> **Note:** Leave `NEXUS_ALLOW_TEST_FALLBACKS` unset in production deployments. Setting it to `1` enables lightweight HTTP/crypto stubs that exist solely for offline unit tests.

## Multi-Cloud Deployment Quickstart

Nexus modules are deployable to any major cloud using Terraform for infrastructure and Kubernetes for orchestration. Below are minimal, production-oriented examples that you can adapt to your environment.

### Prerequisites
- Terraform ≥ 1.5 installed
- kubectl ≥ 1.27 installed
- Docker or compatible OCI builder
- Cloud CLI configured (one or more): `aws` / `az` / `gcloud`
- A container registry (ECR/ACR/GCR/Artifact Registry) and a repository created

---

### 1) Containerize the Module (any module: `nexus`, `infra-ops`, or `log-analyzer`)
```bash
# From the module directory (e.g., ./nexus)
docker build -t <REGISTRY>/<PROJECT>/nexus:<TAG> .
docker push <REGISTRY>/<PROJECT>/nexus:<TAG>

```

---

## Frontend preview & static demo
The Nexus chat frontend lives in [`Frontend/`](Frontend/). To interact with it:

- **Full app (Vite dev server):** Follow the steps in [`Frontend/README.md`](Frontend/README.md) to install dependencies and run `npm run dev`.
- **Static snapshot:** Serve `Frontend/preview.html` over HTTP (for example `python3 -m http.server 4173`) and open `http://localhost:4173/preview.html` in your browser to explore the lazy-loaded UI without building the project.

Both options exercise the same React components, so you can verify layout, drawers, modals, and other surfaces even without network access to install dependencies.
