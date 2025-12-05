# Phase 5 — Refactored Cloud-Sorted Codex Generation Prompt

The following prompt is the fully rewritten, cloud-sorted, production-ready Phase 5 Codex prompt for generating multi-cloud, multi-region infrastructure for Toron Engine v2.0. Paste it into GPT-4o or Codex exactly as-is.

---

## 🔥 PHASE 5 — REFACTORED CLOUD-SORTED CODEX GENERATION PROMPT

```
You are Codex.
Generate **Phase 5: Multi-Cloud Global Resilience & Disaster Recovery Infrastructure** for *Toron Engine v2.0*.

All Terraform, DR, autoscaling, and failover logic must be separated cleanly by cloud vendor:

* **AWS**
* **GCP**
* **Azure**

Global resources must be placed under a top-level **global/shared** folder rather than mixed with cloud-specific folders.

No placeholders.
No TODOs.
All files must be complete and production-ready.

---

# **1. DIRECTORY STRUCTURE**

Generate the following complete structure:

```
infra/
    terraform/
        global/
            shared/
                kms_multi_region_keys.tf
                iam_cross_cloud_roles.tf
                monitoring_global.tf
                route53_global_traffic.tf
                cloudfront_global_distribution.tf

        aws/
            global/
                dynamodb_global_tables.tf
                s3_global_replication.tf
                aws_failover_controller.tf

            us_east_1/
                eks_cluster.tf
                rds_ha.tf
                redis_ha.tf
                autoscaling_policies.tf
                bedrock_endpoints.tf

            us_west_2/
                eks_cluster.tf
                rds_ha.tf
                redis_ha.tf
                autoscaling_policies.tf

            eu_central_1/
                eks_cluster.tf
                redis_ha.tf
                autoscaling_policies.tf

        gcp/
            global/
                gcs_global_replication.tf
                gcp_global_network.tf
                gcp_global_iam.tf

            us_central_1/
                gke_cluster.tf
                redis_enterprise.tf
                autoscaling_policies.tf
                vertex_endpoints.tf

        azure/
            global/
                azure_frontdoor_global.tf
                azure_monitor_global.tf

            eu_west/
                aks_cluster.tf
                cosmosdb_global_replication.tf
                redis_cache.tf
                autoscaling_policies.tf

multi_region_failover/
    health_probes/
        global_health_lambda.py
        regional_probe_config.yaml

    failover_controller/
        failover_state_machine.asl.json
        failover_handler.py
        failback_handler.py

    replication/
        s3_replication_rules.json
        dynamodb_stream_replicator.py

autoscaling/
    model_latency_autoscaler.py
    queue_depth_autoscaler.py
    cpu_memory_autoscaler.py
    autoscaling_config.yaml

dr/
    runbooks/
        region_failure.md
        global_outage.md
        database_corruption.md
        cloud_provider_outage.md
        redis_cluster_failure.md
        kubernetes_cluster_failure.md

    procedures/
        warm_standby_strategy.md
        async_replication_strategy.md
        backup_restore.md
        s3_versioning_strategy.md
        kms_key_recovery.md
        secrets_rotation_protocol.md

    recovery_scripts/
        promote_standby_rds.py
        rebuild_eks_nodegroup.sh
        rehydrate_cache.py

traffic/
    global_routing_policies/
        weighted_routing.yaml
        latency_based_routing.yaml
        failover_routing.yaml
    cloudfront/
        edge_health_checks.json
        lambda_at_edge_failover.js
        caching_policies.json
```

Codex must now generate **every file** with full content.

---

# **2. TERRAFORM — GLOBAL/SHARED MODULES**

### Folder: `infra/terraform/global/shared/`

Generate:

### **kms_multi_region_keys.tf**

Defines:

* Multi-Region KMS keys
* Replication config
* Automatic rotation

### **iam_cross_cloud_roles.tf**

Defines IAM roles/policies enabling:

* AWS ↔ GCP secure cross-cloud traffic
* replication access
* cross-cloud monitoring

### **monitoring_global.tf**

Defines:

* Global CloudWatch metric streams
* OpenTelemetry collector endpoints

### **route53_global_traffic.tf**

Defines:

* Latency-based routing
* Weighted routing
* Failover routing
* Health checks referencing Lambda probes

### **cloudfront_global_distribution.tf**

Defines:

* Edge caching configuration
* Origin failover
* Global CDN for Toron

---

# **3. TERRAFORM — AWS STACK**

### **aws/global/**

* DynamoDB global tables
* S3 CRR replication
* Failover controller infrastructure

### **aws/<region>/**

Each region must generate:

* eks_cluster.tf
* rds_ha.tf
* redis_ha.tf
* autoscaling_policies.tf

And where applicable:

* bedrock_endpoints.tf

All Terraform must include valid providers and modules.

---

# **4. TERRAFORM — GCP STACK**

### **gcp/global/**

Generate:

* GCS cross-region replication
* GCP global networking
* Central IAM roles

### **gcp/us_central_1/**

Generate:

* GKE cluster (multi-AZ)
* Redis Enterprise HA
* Vertex Model Endpoints
* autoscaling policies

---

# **5. TERRAFORM — AZURE STACK**

### **azure/global/**

Generate:

* Azure FrontDoor global routing config
* Azure Monitor global telemetry

### **azure/eu_west/**

Generate:

* AKS cluster
* CosmosDB global replication
* Azure Redis
* autoscaling policies

---

# **6. MULTI-REGION FAILOVER SYSTEM**

Codex must generate:

## **global_health_lambda.py**

A fully functioning Lambda that:

* Probes `/health` endpoints in all regions
* Aggregates health scores
* Publishes metrics
* Writes into DynamoDB health table
* Emits CloudWatch metrics

## **regional_probe_config.yaml**

Contains thresholds for:

* latency
* error percentage
* jitter
* soft vs hard failover

## **failover_state_machine.asl.json**

AWS Step Function implementing:

* health evaluation
* decision tree
* failover path
* fallback path
* notifications

## **failover_handler.py**

Implements controlled cutover:

* modify Route53 weights
* validate regional warm-up
* perform safe shift of 0→50→100% traffic

## **failback_handler.py**

Handles:

* gradual restoration
* verifying provider/model health
* cache rehydration

## **dynamodb_stream_replicator.py**

Python consumer resolving cross-region conflicts.

---

# **7. AUTOSCALING LAYER**

Codex must generate complete Python modules for:

* **model_latency_autoscaler.py**
* **queue_depth_autoscaler.py**
* **cpu_memory_autoscaler.py**

Autoscaler logic must integrate with:

* CloudWatch metrics
* K8s HPA
* Regional failover logic

---

# **8. DISASTER RECOVERY FRAMEWORK**

Codex must generate full markdown documents:

### **runbooks/**

* region_failure.md
* global_outage.md
* database_corruption.md
* cloud_provider_outage.md
* redis_cluster_failure.md
* kubernetes_cluster_failure.md

### **procedures/**

* warm_standby_strategy.md
* async_replication_strategy.md
* backup_restore.md
* s3_versioning_strategy.md
* kms_key_recovery.md
* secrets_rotation_protocol.md

### **recovery_scripts/**

* promote_standby_rds.py
* rebuild_eks_nodegroup.sh
* rehydrate_cache.py

Each script must be functional.

---

# **9. GLOBAL TRAFFIC MANAGEMENT**

### Folder: `traffic/global_routing_policies/`

Generate:

* weighted_routing.yaml
* latency_based_routing.yaml
* failover_routing.yaml

### Folder: `traffic/cloudfront/`

Generate:

* edge_health_checks.json
* lambda_at_edge_failover.js
* caching_policies.json

---

# **10. CODING RULES FOR CODEX**

1. All Terraform must be syntactically valid.
2. All Python must run under Python 3.11.
3. All YAML must be valid.
4. All markdown docs must be complete.
5. No TODOs or placeholders.
6. Every file must render in a code block.
7. Output must include the **entire folder tree** with full file content.
```

---

If you need Phase 6 (Billing, Stripe, Enterprise Permissions, Audit Logs) or a unified prompt for Phases 1–5, ask for the corresponding prompt pack.
