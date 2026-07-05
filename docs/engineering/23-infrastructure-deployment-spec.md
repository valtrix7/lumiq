# 23 — Infrastructure & Deployment Specification

**Project:** Lumiq — Live Commerce Moment Vault  
**Document ID:** `23-infrastructure-deployment-spec.md`  
**Status:** Draft v1  
**Audience:** infra/devops, backend engineers, AI engineers, media engineers, security, QA, AI coding agents  
**Depends on:** `00-spec-index.md`, `02-project-constitution.md`, `06-system-architecture-c4.md`, `07-service-decomposition.md`, `08-data-model-database-schema.md`, `09-api-contract-openapi.yaml`, `10-event-contract-asyncapi.yaml`, `14-b2-storage-provenance-spec.md`, `19-security-rbac-threat-model.md`, `21-privacy-retention-deletion-spec.md`, `22-observability-audit-cost-spec.md`

---

## 1. Purpose

This document defines Lumiq's infrastructure and deployment architecture.

It answers:

```txt
Which environments exist?
Which services run as containers?
How are Neon, NATS, Clerk, B2, Genblaze, and provider credentials separated?
How are secrets handled?
How does CI/CD validate specs, contracts, migrations, agents, workers, and media pipelines?
How should local development and preview environments work?
How do we deploy safely without breaking the golden demo path?
```

Lumiq is a media-heavy, event-driven, AI-agent product. It must not be deployed like a simple stateless website. Workers need long-running execution, media processing, provider polling, B2 upload/retry behavior, NATS consumers, and recovery tooling.

Core deployment rule:

```txt
Web can be edge/serverless-friendly.
Core API, Mastra Agent Service, and workers must be container-first.
Media workers must not rely on short-lived request lifetimes.
Every environment must have isolated database, storage, event, auth, and provider credentials.
```

---

## 2. Scope

This spec covers:

```txt
environment model
local development stack
preview/staging/prod separation
container inventory
runtime configuration
network and trust boundaries
NATS hosting and stream setup
Neon Postgres setup and migrations
Clerk environment separation
Backblaze B2 bucket/key/credential setup
secrets management
provider credentials
CI/CD pipelines
release gates
rollback strategy
backup and disaster recovery
operational readiness checklist
```

This spec does not cover:

```txt
database table definitions; see 08-data-model-database-schema.md
API contracts; see 09-api-contract-openapi.yaml
event schemas; see 10-event-contract-asyncapi.yaml
B2 object and provenance structure; see 14-b2-storage-provenance-spec.md
security threat model details; see 19-security-rbac-threat-model.md
runbook procedures; see 25-admin-recovery-runbooks.md
```

---

## 3. Locked Infrastructure Decisions

The following decisions are inherited from the constitution and architecture specs.

```yaml
locked_decisions:
  auth:
    provider: Clerk
    rule: Clerk authenticates humans; internal authorization decides capabilities.
  database:
    provider: Neon Postgres
    rule: Postgres is operational truth.
  object_storage:
    provider: Backblaze B2
    rule: B2 is canonical media/provenance object vault.
  event_backbone:
    provider: NATS JetStream
    rule: NATS transports events/jobs; Postgres remains truth.
  agent_runtime:
    framework: Mastra
    rule: Agents recommend through gateway tools only.
  media_orchestration:
    provider: Genblaze
    rule: Genblaze Worker executes approved media pipelines.
  deployment:
    model: containerized_services
    rule: Do not start Kubernetes-first and do not rely on pure serverless for media workers.
```

---

## 4. Infrastructure Principles

### 4.1 Environment isolation is mandatory

Every environment must isolate:

```txt
Clerk app / credentials
Neon database/project/branch
B2 buckets
B2 application keys
NATS account/cluster/streams
provider API keys and quotas
LLM provider keys and quotas
Genblaze credentials/config
secrets store entries
observability destination or labels
```

No staging service may read or write production media, events, auth state, or provider quota.

### 4.2 Containers own backend runtime

Containerized services:

```txt
core-api
mastra-agent-service
capture-worker
signal-extraction-worker
genblaze-worker
qa-worker
publish-worker
search-indexing-worker
audit-reconciliation-retention-worker
```

The web app may be deployed as:

```txt
Vercel-style frontend
containerized Next.js service
static/SSR hybrid host
```

but it must still call Core API for privileged behavior.

### 4.3 Workers scale independently

Media generation, capture, QA, search indexing, and retention jobs have different resource profiles. They must scale independently.

Example:

```txt
Genblaze Worker:
  CPU/memory and provider-polling heavy

Capture Worker:
  media buffer, checksum, upload heavy

Search Indexing Worker:
  low-priority, batch-friendly

Core API:
  latency-sensitive, not media-heavy
```

### 4.4 Secrets never live in code or browser bundles

Forbidden:

```txt
B2 application keys in frontend code
provider API keys in frontend code
Genblaze provider secrets in Mastra prompts
DB connection strings in logs
long-lived CI secrets where OIDC is available
shared super-key across workers
```

### 4.5 Deployments must be spec-gated

Every deploy must validate:

```txt
OpenAPI contract
AsyncAPI contract
JSON schemas
DB migration compatibility
event compatibility
agent tool schemas
template step graph schemas
B2 manifest schema
security linting
worker contract tests
golden demo smoke test for staging/prod promotion
```

---

## 5. Environment Model

## 5.1 Environment registry

```yaml
environments:
  local:
    purpose: developer workstation, isolated experiments, provider mocks by default
    data_sensitivity: fake_or_seeded_only
    auth: clerk_dev_or_mock
    database: local_postgres_or_neon_dev_branch
    nats: local_nats_container
    b2: mock_or_dev_bucket
    providers: mocks_by_default
    deploy_gate: none

  dev:
    purpose: shared integration environment for engineers
    data_sensitivity: fake_seeded_or_explicit_dev_only
    auth: clerk_dev_app
    database: neon_dev
    nats: dev_streams
    b2: lumiq-dev-buckets
    providers: dev_limited_keys
    deploy_gate: main_or_dev_branch_ci

  preview:
    purpose: pull-request validation and design/product review
    data_sensitivity: fake_seeded_only
    auth: clerk_preview_or_dev_app
    database: neon_preview_branch_per_pr
    nats: ephemeral_or_shared_preview_namespace
    b2: preview_prefix_or_ephemeral_dev_bucket
    providers: mocks_or_strict_quota_keys
    deploy_gate: pr_ci

  staging:
    purpose: production-like validation and demo rehearsals
    data_sensitivity: non-production_only
    auth: clerk_staging_app
    database: neon_staging
    nats: staging_streams
    b2: lumiq-staging-buckets
    providers: staging_limited_keys
    deploy_gate: full_ci_plus_smoke_tests

  production:
    purpose: real users and real customer media
    data_sensitivity: production
    auth: clerk_production_app
    database: neon_production
    nats: production_streams
    b2: lumiq-production-buckets
    providers: production_keys_with_budgets
    deploy_gate: protected_release
```

## 5.2 Local development stack

Local development uses Docker Compose where possible.

Required local services:

```yaml
local_services:
  postgres:
    mode: local_or_neon_branch
    required_for: schema_migrations, api_tests
  nats:
    mode: local_container_with_jetstream
    required_for: event_worker_tests
  core_api:
    mode: container_or_local_node_python
  mastra_agent_service:
    mode: local_typescript_service
  workers:
    mode: local_container_or_process
  b2_mock:
    mode: optional_minio_or_filesystem_adapter
  provider_mocks:
    mode: required_default
```

Recommended Docker Compose profiles:

```yaml
compose_profiles:
  core:
    services: [postgres, nats, core-api]
  agents:
    services: [mastra-agent-service, llm-mock]
  media:
    services: [capture-worker, genblaze-worker, provider-mock, b2-mock]
  qa:
    services: [qa-worker]
  full:
    services: [all]
```

Local rule:

```txt
Default local runs must not call paid providers.
Real provider smoke tests require explicit opt-in environment variables.
```

## 5.3 Preview environments

Preview environments should support:

```txt
per-PR web deployment
per-PR Core API deployment where practical
per-PR Neon branch where practical
seeded demo data
mock providers
short-lived B2 prefixes or dev bucket namespace
short-lived NATS stream namespace or preview-local event bus
```

Preview object keys must include a preview namespace:

```txt
tenants/{organization_id}/previews/{preview_id}/...
```

or use a dedicated preview/dev bucket with lifecycle expiration.

## 5.4 Staging environment

Staging must be production-like enough to validate:

```txt
Clerk auth
Neon migrations
NATS JetStream streams and consumers
B2 uploads and signed URLs
Genblaze pipeline integration
provider smoke tests with strict budgets
QA gates
review approval
publish package creation
share page access
provenance manifests
admin recovery views
```

Staging must not use production secrets or production buckets.

## 5.5 Production environment

Production requires:

```txt
protected deployment approvals
least-privilege service identities
separate B2 buckets by sensitivity
managed secrets
NATS durability and backup/recovery plan
Neon backup/restore plan
observability alerts
runbooks
budget caps
admin recovery access controls
```

---

# 6. Runtime Container Inventory

## 6.1 P0 containers

```yaml
containers:
  web_app:
    runtime: Next.js / TypeScript
    priority: P0
    deploy_target: frontend_host_or_container
    public_network: true
    secrets_allowed: public_client_config_only

  core_api:
    runtime: TypeScript_or_FastAPI_TBD
    priority: P0
    deploy_target: container
    public_network: true
    secrets_allowed:
      - clerk_backend_secret
      - postgres_connection
      - nats_credentials
      - b2_signed_url_key_scope
      - service_identity_verification_keys

  mastra_agent_service:
    runtime: TypeScript / Mastra
    priority: P0
    deploy_target: container
    public_network: false
    secrets_allowed:
      - openai_key
      - anthropic_key_later
      - service_identity_token
    forbidden_secrets:
      - b2_raw_write_key
      - postgres_admin_connection
      - publish_destination_secret

  signal_extraction_worker:
    runtime: Python_or_TypeScript
    priority: P0
    deploy_target: container
    consumes: [session.opened, media.chunk.available, transcript.chunk.created]

  capture_worker:
    runtime: Python
    priority: P0
    deploy_target: container
    consumes: [moment.capture.authorized]
    needs:
      - b2_raw_write_key
      - core_api_internal_url
      - nats_credentials

  genblaze_worker:
    runtime: Python
    priority: P0
    deploy_target: container
    consumes: [generation.requested]
    needs:
      - genblaze_config
      - provider_keys_or_genblaze_provider_config
      - b2_derived_write_key
      - b2_provenance_write_key
      - core_api_internal_url
      - nats_credentials

  qa_worker:
    runtime: Python_or_TypeScript
    priority: P0
    deploy_target: container
    consumes: [generation.completed, publish.requested]

  publish_worker:
    runtime: Python_or_TypeScript
    priority: P0
    deploy_target: container
    consumes: [review.approved, publish.requested]
```

## 6.2 P1 containers

```yaml
p1_containers:
  search_indexing_worker:
    consumes: [asset.created, generation.completed, publish.completed]
  audit_reconciliation_retention_worker:
    consumes: [retention.sweep, b2.reconcile.requested, audit.reconcile.requested]
  analytics_worker:
    consumes: [publish.completed, review.approved, generation.completed]
```

## 6.3 Runtime resource guidance

```yaml
resource_guidance:
  core_api:
    cpu: low_to_medium
    memory: medium
    scale_metric: request_latency_or_rps
  mastra_agent_service:
    cpu: low_to_medium
    memory: medium
    scale_metric: agent_run_queue_depth
  capture_worker:
    cpu: medium
    memory: medium_to_high
    disk: ephemeral_scratch_required
    scale_metric: capture_queue_depth
  genblaze_worker:
    cpu: medium_to_high
    memory: high_for_media
    disk: ephemeral_scratch_required
    scale_metric: generation_queue_depth
  qa_worker:
    cpu: medium
    memory: medium
    scale_metric: qa_queue_depth
```

Media workers must have bounded scratch paths and cleanup on success/failure.

---

# 7. Network and Trust Boundaries

## 7.1 Public surfaces

```yaml
public_surfaces:
  web_app:
    exposed_to: internet
    auth: Clerk browser session
  core_api_public:
    exposed_to: internet
    auth: Clerk bearer token
  share_page_api:
    exposed_to: internet
    auth: public_or_private_share_policy
```

## 7.2 Internal surfaces

```yaml
internal_surfaces:
  core_api_internal_worker_callbacks:
    exposed_to: internal_network_or_service_auth_only
    auth: service_identity_token
  core_api_agent_tool_gateway:
    exposed_to: mastra_agent_service_only
    auth: service_identity_token_plus_agent_capability
  nats:
    exposed_to: internal_services_only
    auth: per_service_nats_credentials
  postgres:
    exposed_to: core_api_and_limited_workers_only
    auth: env_scoped_db_credentials
  b2:
    exposed_to: workers_and_core_api_signed_url_module
    auth: env_scoped_application_keys
```

## 7.3 Firewall / allowlist guidance

Minimum production posture:

```txt
Postgres: not public except controlled provider access or managed secure connection.
NATS: not exposed publicly.
Worker callback endpoints: not public, or public only with strong service auth and IP/rate protection.
B2 buckets: private by default.
Share pages: public only by explicit share policy.
Provider webhooks: validate signatures where used.
```

---

# 8. Neon Postgres Deployment

## 8.1 Environment setup

Recommended Neon structure:

```yaml
neon:
  production:
    project: lumiq-prod
    branch: main
    compute: production_sized
  staging:
    project: lumiq-staging
    branch: main
    compute: staging_sized
  dev:
    project: lumiq-dev
    branch: main
    compute: dev_sized
  preview:
    project: lumiq-dev_or_preview
    branch: pr_{number}_{short_sha}
```

If using one Neon project for multiple non-prod branches, production must still be isolated.

## 8.2 Branching strategy

Preview branches should be used for:

```txt
schema migration validation
API contract tests
seeded golden demo data
feature preview environments
AI coding agent PR validation
```

Preview branch lifecycle:

```txt
PR opened → create branch from dev/staging template
Migrations run → seed data loaded
Preview tests run → preview deployment references branch URL
PR closed/merged → branch deleted after retention grace period
```

## 8.3 Migration strategy

Migration rules:

```txt
Migrations must be idempotent where possible.
Migration files must be reviewed.
Breaking schema changes require compatibility plan.
Production migrations must run before app code that depends on new fields unless backwards-compatible.
Down migrations are preferred for non-destructive changes but are not a substitute for backups.
Partitioned table migrations require staging load validation.
```

Migration CI gates:

```yaml
migration_gates:
  - apply_migrations_to_empty_database
  - apply_migrations_to_seeded_database
  - run_schema_diff
  - run_required_indexes_check
  - validate_enum_values_against_specs
  - validate_rls_policy_if_enabled
```

## 8.4 Connection management

Core API should use pooled Postgres connections.

Workers should avoid unbounded parallel DB connections.

Guidance:

```txt
Core API owns normal DB writes.
Workers report through Core API where specified.
Direct worker DB access, if used for read-heavy internal jobs, must be explicitly scoped.
Long-running media workers must not hold DB transactions while calling providers or uploading to B2.
```

## 8.5 Backup and restore

Required production capabilities:

```txt
point-in-time restore strategy
restore drill in staging
migration rollback plan
export of schema and essential metadata
backup access restricted to owners/admin infra identities
```

---

# 9. Backblaze B2 Deployment

## 9.1 Bucket model

Production buckets:

```txt
moment-vault-prod-raw
moment-vault-prod-derived
moment-vault-prod-published
moment-vault-prod-provenance-lock
moment-vault-prod-logs
moment-vault-prod-backups
```

Staging buckets:

```txt
moment-vault-staging-raw
moment-vault-staging-derived
moment-vault-staging-published
moment-vault-staging-provenance-lock
moment-vault-staging-logs
moment-vault-staging-backups
```

Development buckets:

```txt
moment-vault-dev-raw
moment-vault-dev-derived
moment-vault-dev-published
moment-vault-dev-provenance
```

## 9.2 Application keys

Use separate B2 application keys per service and bucket role.

```yaml
b2_application_keys:
  capture_worker_raw_writer:
    buckets: [raw]
    capabilities: [writeFiles, readFiles]
  genblaze_worker_derived_writer:
    buckets: [derived, provenance-lock]
    capabilities: [writeFiles, readFiles]
  publish_worker_published_writer:
    buckets: [published]
    capabilities: [writeFiles, readFiles]
  core_api_signed_url_reader:
    buckets: [raw, derived, published, provenance-lock]
    capabilities: [readFiles]
  retention_worker_deleter:
    buckets: [raw, derived, published, logs]
    capabilities: [readFiles, deleteFiles]
    approval: restricted
```

Agents must receive none of these keys.

## 9.3 Signed URL and upload model

```yaml
signed_url_strategy:
  browser_upload:
    allowed_for: temporary_chunks_or_source_blobs_where_safe
    generated_by: Core API
    scope: object_key_prefix_and_short_ttl
  worker_upload:
    allowed_for: canonical_assets_and_manifests
    generated_by: worker_b2_credentials_or_core_api_signed_url
    scope: service_identity
  browser_download_preview:
    allowed_for: authorized_preview_or_share_access
    generated_by: Core API
    ttl: short
```

## 9.4 Lifecycle and Object Lock

Lifecycle rules should handle:

```txt
tmp/scratch expiration
preview namespace cleanup
old debug evidence expiration
rejected candidate data expiration
non-canonical temporary renders
```

Object Lock / legal hold should be used only where policy requires it, especially for:

```txt
provenance manifests
legal hold assets
audit exports
enterprise retention commitments
```

Object Lock mode, default retention, and governance/compliance choice remain policy decisions and must not be hardcoded by workers.

## 9.5 B2 CORS guidance

If browsers upload or preview via B2 directly, CORS must be restricted by:

```txt
allowed origins per environment
allowed methods only as needed
short TTL signed URLs
no wildcard production origins
no public bucket listing
```

---

# 10. NATS JetStream Deployment

## 10.1 Hosting options

Allowed options:

```yaml
nats_hosting_options:
  local:
    mode: docker_container
    use: local_dev_and_tests
  managed_nats:
    mode: provider_hosted
    use: staging_and_production_preferred_if_available
  self_hosted_small_cluster:
    mode: containerized_or_vm_cluster
    use: acceptable_if_managed_not_available
```

Do not treat NATS as business truth.

## 10.2 Stream registry

The AsyncAPI contract defines subjects and streams. Infrastructure must create compatible streams.

```yaml
streams:
  LUMIQ_SESSION:
    subjects: [session.opened, session.closed]
  LUMIQ_SIGNAL:
    subjects: [signal.detected]
  LUMIQ_MOMENT:
    subjects: [moment.candidate.proposed, moment.capture.authorized, moment.raw.uploaded]
  LUMIQ_GENERATION:
    subjects: [generation.requested, generation.started, generation.completed, generation.failed]
  LUMIQ_QA:
    subjects: [qa.completed]
  LUMIQ_REVIEW:
    subjects: [review.approved, review.rejected]
  LUMIQ_PUBLISH:
    subjects: [publish.requested, publish.completed, publish.failed]
  LUMIQ_ASSET:
    subjects: [asset.deleted, asset.created]
  LUMIQ_AUDIT:
    subjects: [audit.recorded]
  LUMIQ_DLQ:
    subjects: [dead_letter.event.created, dlq.>]
```

## 10.3 Consumer registry

```yaml
consumers:
  capture_worker:
    stream: LUMIQ_MOMENT
    subjects: [moment.capture.authorized]
    durable: capture-worker
    ack_policy: explicit
    max_deliver: environment_policy
  genblaze_worker:
    stream: LUMIQ_GENERATION
    subjects: [generation.requested]
    durable: genblaze-worker
    ack_policy: explicit
    max_deliver: environment_policy
  qa_worker:
    stream: LUMIQ_GENERATION
    subjects: [generation.completed]
    durable: qa-worker
  publish_worker:
    stream: LUMIQ_REVIEW
    subjects: [review.approved]
    durable: publish-worker
  admin_recovery:
    stream: LUMIQ_DLQ
    subjects: [dead_letter.event.created]
    durable: admin-recovery
```

## 10.4 Retry and DLQ model

NATS redelivery is not enough by itself. Lumiq must record durable failure state.

Required behavior:

```txt
Worker receives event.
Worker checks idempotency.
Worker performs bounded work.
Worker reports success/failure to Core API.
On retryable failure, NACK or do not ACK according to client semantics.
On retry exhaustion/max deliveries, record a dead_letter_event in Postgres and publish dead_letter.event.created.
Admin Recovery shows the failed event and related resource.
```

DLQ records should contain enough payload preview and resource IDs for recovery without exposing secrets or full transcripts.

## 10.5 Event ordering assumptions

Workers must not rely on global event ordering.

Use:

```txt
resource state machine checks
idempotency keys
correlation IDs
trace IDs
versioned payloads
Postgres row locks or optimistic concurrency where needed
```

---

# 11. Clerk Deployment

## 11.1 Environment separation

```yaml
clerk:
  dev:
    app: lumiq-dev
  staging:
    app: lumiq-staging
  production:
    app: lumiq-prod
```

Each Clerk app must have separate:

```txt
publishable keys
secret keys
redirect URLs
webhook signing secrets
JWT templates if used
organization settings
allowed origins
```

## 11.2 Auth responsibilities

Clerk provides:

```txt
human authentication
session tokens
user identity
organization identity where used
webhook source for user/org sync
```

Lumiq provides:

```txt
internal user records
organization membership mirror
role/capability checks
service identities
worker auth
agent auth
API authorization
```

## 11.3 Webhook handling

Clerk webhook events should be consumed through a Core API endpoint that:

```txt
validates webhook signature
maps external Clerk IDs to internal IDs
uses idempotency
updates users/organizations/memberships
writes audit events for relevant membership changes
never grants privileged internal capabilities without policy
```

## 11.4 Session validation

Core API must validate Clerk-issued session tokens for public API requests and then load internal authorization context.

Do not use Clerk role metadata alone as final authorization for sensitive Lumiq operations.

---

# 12. Secrets Management

## 12.1 Secret classes

```yaml
secret_classes:
  auth:
    - clerk_secret_key
    - clerk_webhook_secret
  database:
    - postgres_url_core_api
    - postgres_url_migration
    - postgres_url_readonly_optional
  eventing:
    - nats_credentials_core_api
    - nats_credentials_worker_specific
  storage:
    - b2_key_raw_writer
    - b2_key_derived_writer
    - b2_key_published_writer
    - b2_key_reader
    - b2_key_retention_worker
  ai:
    - openai_key
    - anthropic_key_later
    - google_key_later
  media:
    - genblaze_key_or_config
    - provider_keys
  internal_auth:
    - service_identity_signing_key_or_jwks
```

## 12.2 Secret rules

```txt
Use managed secrets for staging and production.
Use .env only for local/mock/staging-limited keys.
Never commit .env files.
Never echo secrets in CI logs.
Prefer short-lived deploy credentials or OIDC where supported.
Rotate provider and B2 keys on incident or staff/service changes.
Separate read/write/delete keys.
```

## 12.3 Service identity token strategy

Internal service calls should use service identity tokens.

Required claims/fields:

```txt
service_identity_id
service_name
environment
allowed_capabilities
iat
exp
issuer
audience
key_id
```

Core API validates:

```txt
token signature
expiration
environment
service identity active status
capability scope
organization scope where applicable
```

---

# 13. Provider and Genblaze Configuration

## 13.1 Provider key separation

Provider keys must be separated by environment.

```yaml
providers:
  openai:
    dev: limited_or_mock
    staging: limited_budget
    production: production_budgeted
  anthropic:
    dev: optional
    staging: optional_limited
    production: fallback_when_enabled
  genblaze:
    dev: mock_or_limited
    staging: smoke_test_limited
    production: production_budgeted
  media_providers:
    dev: mock_default
    staging: limited_budget_smoke
    production: policy_controlled
```

## 13.2 Provider smoke tests

Smoke tests should verify:

```txt
credentials valid
provider reachable
minimal request succeeds
cost ceiling enforced
failure path visible
logs redacted
```

Smoke tests must not generate expensive media by default.

## 13.3 Provider kill switches

Production must support environment/config kill switches:

```yaml
kill_switches:
  generation_auto_enhance_enabled: false
  provider_decarta_enabled: false
  provider_runway_enabled: false
  provider_openai_media_enabled: false
  agent_auto_capture_recommendations_enabled: false
  external_publish_enabled: false
```

Kill switch changes must be audited.

---

# 14. CI/CD Specification

## 14.1 Pipeline overview

```mermaid
flowchart LR
  PR[Pull Request]
  Lint[Lint + Typecheck]
  Unit[Unit Tests]
  Schema[Schema + Contract Validation]
  Migration[DB Migration Test]
  Worker[Worker Contract Tests]
  Agent[Agent Tool/Output Tests]
  Media[Media Pipeline Mock Test]
  E2E[Golden Path E2E]
  Build[Container Build]
  Deploy[Deploy Preview/Staging]

  PR --> Lint --> Unit --> Schema --> Migration --> Worker --> Agent --> Media --> E2E --> Build --> Deploy
```

## 14.2 Pull request checks

Required checks:

```yaml
pr_checks:
  code_quality:
    - lint_typescript
    - lint_python
    - format_check
    - typecheck
  specs_contracts:
    - validate_openapi
    - validate_asyncapi
    - validate_json_schemas
    - validate_requirement_ids_referenced
  database:
    - apply_migrations_empty
    - apply_migrations_seeded
    - schema_drift_check
  tests:
    - unit_tests
    - integration_tests_with_mocks
    - worker_contract_tests
    - agent_tool_schema_tests
    - template_step_graph_validation_tests
  security:
    - dependency_scan
    - secret_scan
    - container_scan
    - workflow_permission_check
```

## 14.3 Main branch checks

Main branch adds:

```txt
build all containers
push signed/tagged images to registry
run staging deploy
run staging smoke tests
run B2/NATS/DB connectivity tests
run minimal provider smoke tests with strict budget
run golden demo path smoke test
```

## 14.4 Production deployment gate

Production deploy requires:

```txt
main branch green
staging smoke green
migration risk reviewed
release notes generated
rollback plan documented
feature flags reviewed
admin runbooks available
approval by owner/admin release role
```

## 14.5 Container build policy

```yaml
container_policy:
  base_images:
    - pinned_or_digest_locked_where_practical
  builds:
    - reproducible_where_practical
    - no_secrets_in_layers
    - non_root_user_preferred
    - minimal_system_packages
  artifacts:
    - sbom_preferred
    - vulnerability_scan_required_for_prod
```

## 14.6 Deployment order

Safe default order:

```txt
1. Apply backwards-compatible DB migrations.
2. Deploy Core API.
3. Deploy Mastra Agent Service.
4. Deploy workers with compatible event schemas.
5. Deploy Web App.
6. Run smoke tests.
7. Enable feature flags/automation gradually.
```

Breaking changes require a two-phase rollout or migration plan.

---

# 15. Feature Flags and Runtime Config

Feature flags should control high-risk behavior.

```yaml
feature_flags:
  session:
    browser_camera_enabled: true
    prerecorded_live_enabled: true
    obs_rtmp_enabled: false
  automation:
    auto_capture_enabled: true
    auto_enhance_enabled: true
    auto_publish_enabled: false
  generation:
    genblaze_enabled: true
    provider_fallback_enabled: false
    ai_restyle_enabled: false
  storage:
    full_session_recording_enabled: false
    b2_object_lock_enabled: policy_controlled
  safety:
    strict_product_claims_enabled: true
    prompt_injection_guardrails_enabled: true
  admin:
    dlq_replay_enabled: true
```

Feature flag changes must be audited in production.

---

# 16. Observability Deployment

All environments should emit structured logs with environment labels.

Production must emit:

```txt
traces
metrics
structured logs
audit events
cost events
provider usage records
NATS consumer lag metrics
B2 upload latency/failure metrics
DB migration/deploy markers
```

Trace context must propagate through:

```txt
web request
Core API command
NATS event
worker job
provider call
B2 object write
Core API worker callback
audit event
```

See `22-observability-audit-cost-spec.md` for metric names and log rules.

---

# 17. Backup, Restore, and Disaster Recovery

## 17.1 Backup inventory

```yaml
backup_inventory:
  postgres:
    source: Neon backups/PITR/export
    contains: operational_truth
  b2:
    source: B2 versioning/object_lock/lifecycle_policy
    contains: media_manifests_provenance
  specs:
    source: git
    contains: contract_truth
  secrets:
    source: managed_secrets_store
    contains: runtime_credentials
  nats:
    source: JetStream persistence + Postgres system_events/outbox
    contains: event_transport_state
```

## 17.2 Restore priority

```txt
1. Restore Postgres operational truth.
2. Verify B2 object availability against assets/manifest_records.
3. Recreate NATS streams/consumers from AsyncAPI and infra templates.
4. Replay/reconcile pending outbox/system events where safe.
5. Run B2/Postgres reconciliation.
6. Run golden demo smoke test.
```

## 17.3 Disaster recovery drills

Staging drills should include:

```txt
restore database branch from backup
recreate NATS streams
validate B2 manifest/object references
replay a DLQ event
rerun failed generation from raw asset
verify share link revocation
```

---

# 18. Infrastructure as Code

Infrastructure definitions should be checked into the repository where possible.

Recommended structure:

```txt
/infra
  /environments
    local
    dev
    staging
    production
  /nats
    streams.yaml
    consumers.yaml
  /b2
    buckets.yaml
    lifecycle-rules.yaml
    cors.yaml
  /database
    neon.md
    migrations/
  /secrets
    secret-registry.md
  /ci
    github-actions.md
```

Secrets values must not be committed.

---

# 19. Operational Readiness Checklist

Before production launch:

```yaml
production_readiness:
  auth:
    - clerk_prod_app_configured
    - webhook_signature_validated
    - internal_authz_seeded
  database:
    - neon_prod_ready
    - migrations_applied
    - backup_restore_tested
  storage:
    - b2_prod_buckets_created
    - lifecycle_rules_reviewed
    - object_lock_policy_decided
    - application_keys_scoped
  eventing:
    - nats_prod_streams_created
    - durable_consumers_created
    - dlq_flow_tested
  services:
    - containers_built_and_scanned
    - health_checks_configured
    - autoscale_policy_defined
  observability:
    - traces_enabled
    - metrics_enabled
    - alert_routes_configured
    - log_redaction_tested
  security:
    - secrets_in_managed_store
    - no_agent_raw_secrets
    - service_identities_scoped
  demo:
    - golden_path_smoke_green
    - seeded_demo_assets_available
    - rollback_plan_documented
```

---

# 20. Acceptance Criteria

```txt
Given a staging deployment
When the golden demo smoke test runs
Then it can start a prerecorded-live session, detect a candidate, capture raw, generate through Genblaze, write B2 assets/manifests, run QA, approve, create a publish package, and show provenance.

Given a production deployment
When a service starts
Then it uses environment-scoped secrets and cannot access staging or dev resources.

Given a PR opens
When CI runs
Then OpenAPI, AsyncAPI, JSON schemas, DB migrations, worker contracts, agent schemas, and template step graphs are validated.

Given a worker receives duplicate events
When it processes the event
Then idempotency prevents duplicate B2/provider side effects.

Given B2 upload repeatedly fails
When retry budget is exhausted
Then the failure is visible in Admin/Recovery and no worker silently drops the failure.
```

---

# 21. Open Questions

```yaml
open_questions:
  hosting_provider:
    question: Which container hosting provider should be used first?
    options: [Render, Fly.io, Railway, Cloud Run, ECS, other]
    default_recommendation: choose fastest reliable container deployment for hackathon, not Kubernetes-first

  managed_nats:
    question: Which NATS hosting provider or self-hosting approach will be used?
    required_before: production_beta

  core_api_runtime:
    question: TypeScript or Python/FastAPI for Core API?
    note: Existing specs allow TBD; choose before implementation tasks.

  b2_object_lock_policy:
    question: Which buckets require Object Lock and which retention mode?
    required_before: enterprise_or_compliance_launch

  secrets_store:
    question: Which managed secrets store will be used for staging/prod?
    required_before: staging

  observability_backend:
    question: Which vendor/backend receives OpenTelemetry traces/metrics/logs?
    required_before: production
```

---

# 22. Research References

These references informed this infrastructure spec and should be checked again before implementation because vendor features can change.

```txt
NATS JetStream documentation:
  https://docs.nats.io/nats-concepts/jetstream
  https://docs.nats.io/using-nats/developer/develop_jetstream/consumers

Neon branching documentation:
  https://neon.tech/docs/introduction/branching
  https://neon.tech/docs/guides/branching-github-actions

Clerk session token and backend documentation:
  https://clerk.com/docs/guides/sessions/session-tokens
  https://clerk.com/docs/reference/backend-api

Backblaze B2 documentation:
  https://www.backblaze.com/docs/cloud-storage-s3-compatible-api
  https://www.backblaze.com/docs/cloud-storage-enable-object-lock-with-the-s3-compatible-api

Docker Compose profiles:
  https://docs.docker.com/compose/how-tos/profiles/

GitHub Actions secrets and OIDC:
  https://docs.github.com/actions/security-guides/using-secrets-in-github-actions
  https://docs.github.com/en/actions/concepts/security/openid-connect
```
