# 25 — Admin & Recovery Runbooks

**Project:** Lumiq — Live Commerce Moment Vault  
**Document ID:** `25-admin-recovery-runbooks.md`  
**Status:** Draft v1  
**Audience:** admins, operators, backend engineers, infra/devops, media engineers, support, QA, AI coding agents  
**Depends on:** `02-project-constitution.md`, `06-system-architecture-c4.md`, `07-service-decomposition.md`, `08-data-model-database-schema.md`, `10-event-contract-asyncapi.yaml`, `14-b2-storage-provenance-spec.md`, `18-qa-moderation-policy-spec.md`, `19-security-rbac-threat-model.md`, `21-privacy-retention-deletion-spec.md`, `22-observability-audit-cost-spec.md`, `23-infrastructure-deployment-spec.md`, `24-testing-evaluation-spec.md`

---

## 1. Purpose

This document defines Lumiq's admin recovery and operational runbooks.

Lumiq must recover from failures without database surgery or untracked manual edits. Admins need clear procedures for:

```txt
DLQ replay
stuck sessions
stuck moments
failed Genblaze runs
B2 asset reconciliation
missing manifests
provider failures
budget anomalies
agent/tool failures
manual rerun
retention/deletion exceptions
share page revocation
rollback and incident response
```

Core recovery rule:

```txt
Recovery actions must go through the Core API/Admin Console, require capability checks, require an operator reason, be idempotent, and write audit events.
```

---

## 2. Recovery Principles

### 2.1 Do not repair by direct mutation first

Forbidden by default:

```txt
directly editing moment state in production database
directly deleting B2 canonical objects
directly replaying provider calls outside generation_run records
directly marking QA passed without QA result/audit
directly modifying publish_package state without Core API
```

Allowed:

```txt
read-only diagnostic queries
Core API admin recovery commands
approved migration/repair scripts with audit
B2 object inspection
NATS event inspection
reconciliation dry-runs
```

### 2.2 Postgres state wins over NATS

If NATS and Postgres conflict:

```txt
Postgres is operational truth.
NATS is event/job transport.
Reconciliation determines whether to replay, skip, mark terminal, or regenerate an event.
```

### 2.3 B2 objects are immutable evidence

Do not overwrite canonical B2 objects. Recovery creates new objects or new manifests when needed.

### 2.4 Every recovery action needs an audit trail

Required recovery audit fields:

```txt
admin_user_id or service_identity_id
action
resource_type
resource_id
before_state
after_state
reason
trace_id
idempotency_key
result
created_at
```

### 2.5 Prefer dry-run first

Any destructive or broad recovery must support dry-run.

Examples:

```txt
B2 reconciliation
retention sweep
bulk DLQ replay
orphan asset cleanup
share revocation sweep
```

---

# 3. Admin Capabilities

## 3.1 Required capabilities

```yaml
admin_capabilities:
  admin:recover:
    allows:
      - inspect_dlq
      - retry_dlq_event
      - mark_dlq_terminal
      - retry_failed_generation
      - request_reconciliation
  audit:view:
    allows:
      - view_audit_events
      - view_trace_links
  asset:view_metadata:
    allows:
      - inspect_asset_records
      - inspect_manifest_records
  asset:delete:
    allows:
      - schedule_asset_deletion
  retention:change:
    allows:
      - change_retention_policy
      - apply_legal_hold
  billing:manage:
    allows:
      - update_budget_caps
      - approve_budget_override
```

## 3.2 Recovery action requirements

Every admin recovery command must require:

```txt
authenticated admin user
organization scope
exact capability
reason text
idempotency key
state-machine validation
audit event
```

---

# 4. Admin Console Surfaces

```yaml
admin_console:
  dlq:
    purpose: inspect_and_retry_dead_letter_events
  stuck_moments:
    purpose: find_moments_not_progressing
  failed_runs:
    purpose: inspect_generation_and_provider_failures
  b2_reconciliation:
    purpose: compare_postgres_assets_to_b2_objects
  provider_failures:
    purpose: inspect_provider_outages_and_error_rates
  budget_anomalies:
    purpose: inspect_cost_overruns_or_incomplete_reconciliation
  audit_search:
    purpose: search_sensitive_actions_and_traces
  retention_queue:
    purpose: inspect_scheduled_deletions_and_holds
  orphaned_assets:
    purpose: find_unlinked_b2_or_db_asset_rows
  agent_tool_failures:
    purpose: inspect_denied_or_malformed_agent_tool_calls
```

---

# 5. Incident Severity

```yaml
severity_levels:
  SEV1:
    description: data exposure, destructive deletion, production outage, widespread failed capture/generation, unauthorized publish
    response: immediate_owner_admin_engineering_response
  SEV2:
    description: degraded generation/capture, provider outage, DLQ backlog blocking demo/users, share page access issue
    response: same_day_response
  SEV3:
    description: isolated failed run, single stuck moment, recoverable B2 mismatch, non-critical cost anomaly
    response: normal_triage
  SEV4:
    description: cosmetic admin issue, non-blocking warning, documentation mismatch
    response: backlog_or_next_iteration
```

SEV1 examples:

```txt
Cross-tenant data access detected.
Public share page exposes private package.
Raw source assets deleted unexpectedly.
Auto-publish occurs without approval/policy.
Provider runaway cost event.
```

---

# 6. Standard Recovery Workflow

All runbooks follow this workflow.

```txt
1. Identify affected organization/resource.
2. Open trace/audit context.
3. Confirm user/service permissions.
4. Classify failure type.
5. Run dry-run if available.
6. Choose recovery action: retry, rerun, skip, mark terminal, reconcile, revoke, restore.
7. Execute through Core API/Admin Console.
8. Verify state and B2/object/event consistency.
9. Confirm user-visible state.
10. Write incident note/postmortem if severity requires.
```

---

# 7. Runbook: DLQ Triage and Replay

## 7.1 Symptoms

```txt
Admin Console shows dead_letter_event.
Worker logs show retry exhaustion.
NATS consumer max deliveries reached.
Moment/generation/publish state is stuck.
```

## 7.2 Triage

Inspect:

```txt
dead_letter_event_id
event_type
schema_version
organization_id
resource IDs
trace_id
correlation_id
idempotency_key
retry_count
error_code
error_message
payload preview
worker/service name
current Postgres resource state
```

## 7.3 Decision tree

```yaml
dlq_decision_tree:
  invalid_schema:
    action: mark_terminal_or_migrate_payload
    notes: Do not replay malformed events blindly.
  transient_b2_or_provider_failure:
    action: retry_after_dependency_healthy
  duplicate_event_already_processed:
    action: mark_skipped_idempotent_duplicate
  missing_resource:
    action: reconcile_resource_or_mark_terminal
  state_machine_no_longer_allows_event:
    action: skip_or_create_compensating_action
  bug_in_worker:
    action: fix_worker_then_replay
```

## 7.4 Replay procedure

```txt
1. Open DLQ item in Admin Console.
2. Verify current resource state.
3. Confirm replay is safe and idempotency key is present.
4. Enter operator reason.
5. Click Retry.
6. Admin Console publishes retry through approved event path or creates a new recovery event.
7. Monitor trace until worker ACKs and Core API updates state.
8. Confirm audit event records retry result.
```

## 7.5 Success criteria

```txt
DLQ item status becomes retried/resolved.
Affected resource advances or terminal state is explicit.
No duplicate B2/provider side effects occur.
Audit event exists with reason and result.
```

---

# 8. Runbook: Stuck Session

## 8.1 Symptoms

```txt
session remains opening/live/closing longer than policy window
Live Studio shows inconsistent state
session.closed event missing
no new moments authorized after end request
```

## 8.2 Triage

Check:

```txt
sessions.status
started_at / ended_at
session_sources
session_recording_policies
recent system_events for session
worker health
NATS session stream
pending captures/generations for session
```

## 8.3 Recovery actions

```yaml
stuck_session_actions:
  opening_too_long:
    action: transition_to_error_or_retry_start
  live_but_source_disconnected:
    action: close_session_with_reason_source_disconnected
  closing_too_long:
    action: flush_pending_data_then_mark_closed
  closed_missing_event:
    action: emit_reconciliation_session_closed_event_if_state_closed
```

## 8.4 Procedure

```txt
1. Open session in Admin → Stuck Sessions.
2. Inspect timeline and pending jobs.
3. Choose recovery action.
4. Provide reason.
5. Execute Core API recovery command.
6. Verify no new capture authorizations occur after closed.
7. Run session reconciliation.
```

---

# 9. Runbook: Stuck Moment

## 9.1 Symptoms

```txt
moment remains capture_authorized/capturing/raw_uploaded/enhancing/qa_pending/review_pending beyond expected window
Review Queue does not show generated output
Lineage chain incomplete
```

## 9.2 Triage by state

```yaml
moment_state_triage:
  capture_authorized:
    check: capture_worker_received_event
    likely_issue: event_delivery_or_source_buffer_missing
  capturing:
    check: B2_raw_upload_progress
    likely_issue: B2_upload_or_media_finalization
  raw_uploaded:
    check: generation_requested_event
    likely_issue: generation_dispatch_missing_or_pre_enhancement_block
  enhancing:
    check: generation_run_status
    likely_issue: Genblaze/provider_timeout
  qa_pending:
    check: qa_worker_event_and_result
    likely_issue: QA worker failure
  review_pending:
    check: review_queue_index
    likely_issue: read_model_or_ui_cache
```

## 9.3 Recovery options

```txt
retry capture
mark capture terminal failure
request generation from raw asset
retry generation run
run QA manually
repair review read model
archive/reject moment with reason
```

## 9.4 Procedure

```txt
1. Open moment in Admin → Stuck Moments.
2. Inspect state, assets, generation_runs, qa_checks, events.
3. Run dry-run diagnosis.
4. Select safe action.
5. Execute through Core API.
6. Verify state transition and provenance links.
```

---

# 10. Runbook: Failed Genblaze Run

## 10.1 Symptoms

```txt
generation_run.status = failed
generation.failed event emitted
no enhanced_master asset
provider error in metadata
review card shows generation failed
```

## 10.2 Failure classification

```yaml
generation_failure_classes:
  retryable:
    examples: [provider_timeout, network_error, temporary_b2_error]
    action: retry_same_run_or_new_attempt_policy
  remediable:
    examples: [bad_crop, caption_render_error, overlay_safe_zone]
    action: rerender_with_adjusted_params
  review_required:
    examples: [possible_product_misrepresentation, uncertain_provider_output]
    action: human_review_or_rerender_without_restyle
  terminal:
    examples: [corrupt_raw_source, missing_required_input_asset, disallowed_content]
    action: mark_terminal_and_notify_reviewer
```

## 10.3 Retry procedure

```txt
1. Open Admin → Failed Runs.
2. Select generation_run_id.
3. Verify input asset exists and checksum verified.
4. Verify budget authorization or request override.
5. Verify provider policy/fallback policy.
6. Choose Retry or Rerender.
7. If Retry: preserve generation_run lineage and attempt count.
8. If Rerender: create new generation_run and new output asset ID.
9. Monitor generation.started/completed/failed.
10. Verify B2 manifest and provenance if completed.
```

## 10.4 Do not

```txt
Do not overwrite old output asset.
Do not mark failed run completed manually.
Do not bypass QA.
Do not use fallback provider unless policy allows.
```

---

# 11. Runbook: B2 Asset Reconciliation

## 11.1 Symptoms

```txt
asset row exists but B2 object missing
B2 object exists but no asset row
checksum mismatch
manifest missing
signed URL fails
B2 upload latency/failure alert
```

## 11.2 Reconciliation modes

```yaml
reconciliation_modes:
  dry_run:
    description: compare Postgres and B2 without mutation
  targeted:
    description: reconcile one organization/session/moment/asset
  bucket_prefix:
    description: scan object prefix
  full_environment:
    description: scheduled/batched scan across environment
```

## 11.3 Procedure: asset row exists but B2 object missing

```txt
1. Open asset detail.
2. Verify bucket/object_key and retention class.
3. Check B2 object versions if available.
4. Check deletion jobs and audit events.
5. If object is expected deleted, update asset lifecycle via Core API.
6. If object should exist, mark asset verification failed.
7. If source asset missing, block downstream publish and notify reviewer.
8. If derived asset missing but raw exists, rerender from raw/mezzanine.
```

## 11.4 Procedure: B2 object exists but no asset row

```txt
1. Run B2 reconciliation dry-run for prefix.
2. Inspect object key for organization/session/moment/run IDs.
3. Check if upload callback failed.
4. If object is valid and expected, create asset record through reconciliation command.
5. If object is temp/orphan and eligible, schedule cleanup.
6. Record audit event.
```

## 11.5 Procedure: checksum mismatch

```txt
1. Mark asset verification_status=failed through Core API.
2. Block publish/share if asset is canonical or publish variant.
3. Recompute checksum from B2 object.
4. Compare with manifest_records and asset row.
5. If manifest wrong but object valid, create corrected manifest version.
6. If object corrupt and raw parent exists, regenerate derived output.
7. If raw source corrupt/missing, mark terminal and notify admin/reviewer.
```

---

# 12. Runbook: Missing Provenance Manifest

## 12.1 Symptoms

```txt
enhanced_master exists but provenance panel incomplete
manifest_records missing
provenance manifest B2 object missing
generation.completed has output_asset_id but no manifest_asset_id
```

## 12.2 Procedure

```txt
1. Open moment provenance admin panel.
2. Verify assets and generation_run records.
3. Verify provenance_links rows.
4. Check B2 path for run manifest.
5. If Genblaze manifest exists but app provenance missing, run provenance manifest rebuild.
6. If both manifests missing, reconstruct from Postgres generation_runs/assets/provenance_links where possible and mark reconstructed=true.
7. If lineage cannot be proven, mark provenance_status=incomplete and require review before publish.
8. Audit recovery action.
```

## 12.3 Rule

Never claim provenance is verified if any required lineage component is missing.

---

# 13. Runbook: Provider Failure or Outage

## 13.1 Symptoms

```txt
provider timeout spike
Genblaze runs fail across organizations
cost ledger shows failed calls
provider returns invalid outputs
provider API auth failures
```

## 13.2 Triage

Check:

```txt
provider status/error code
Genblaze Worker logs
recent generation_failed events
cost_ledger/provider_usage_records
provider credentials expiry/rotation
budget caps
network egress issues
```

## 13.3 Actions

```yaml
provider_failure_actions:
  transient_timeout:
    action: pause_auto_enhance_or_allow_retry
  auth_failure:
    action: rotate_or_fix_provider_secret
  invalid_output:
    action: disable_provider_and_mark_runs_review_required
  cost_spike:
    action: enable_provider_kill_switch_and_budget_lock
  full_outage:
    action: disable_provider_and_queue_generation_requests
```

## 13.4 Procedure

```txt
1. Open Admin → Provider Failures.
2. Identify provider/model and affected templates.
3. Disable auto-enhancement if failures are widespread.
4. Apply provider kill switch if needed.
5. For allowed templates, enable fallback only if policy permits.
6. Retry failed runs after provider recovers.
7. Reconcile costs.
8. Write incident note if SEV2+.
```

---

# 14. Runbook: Budget or Cost Anomaly

## 14.1 Symptoms

```txt
actual_cost_usd unexpectedly high
provider usage records missing
generation runs without cost ledger
budget cap exceeded
duplicate provider charges suspected
```

## 14.2 Triage

```txt
Check cost_ledger by organization/session/moment/run.
Check provider_usage_records.
Check generation_run attempts and idempotency keys.
Check duplicate NATS delivery.
Check provider fallback attempts.
Check budget_authorizations.
```

## 14.3 Actions

```txt
pause auto-enhancement for org/session
apply provider daily cap
mark suspected duplicate records for reconciliation
request provider usage export if available
create budget override only with billing:manage capability
notify owner/admin for significant anomaly
```

## 14.4 Procedure

```txt
1. Open Admin → Budget Anomalies.
2. Select anomaly.
3. Compare estimated vs actual cost.
4. Inspect trace and idempotency keys.
5. If duplicate side effect occurred, mark as incident and prevent recurrence.
6. Reconcile ledger.
7. Audit outcome.
```

---

# 15. Runbook: Agent Tool Failure or Unsafe Delegation

## 15.1 Symptoms

```txt
agent_tool_call.status = denied or failed
agent attempted forbidden tool
agent output schema invalid
prompt injection eval or runtime guard triggered
```

## 15.2 Procedure

```txt
1. Open Admin → Agent Tool Failures.
2. Inspect agent_id, tool_name, organization_id, trace_id.
3. Verify denial reason.
4. Confirm no side effect occurred.
5. If schema issue, update agent output/parser/eval before retry.
6. If forbidden tool attempt, keep denied and create safety issue.
7. If prompt injection source identified, label evidence and add eval fixture.
8. Audit final disposition.
```

## 15.3 Safety rule

Do not manually execute a denied agent recommendation unless a human admin independently verifies the action, policy permits it, and the action goes through normal Core API commands.

---

# 16. Runbook: QA Failure Recovery

## 16.1 QA failure actions

```yaml
qa_failure_actions:
  retryable:
    examples: [temporary_model_error, transient_worker_error]
    action: rerun_qa
  remediable:
    examples: [caption_drift, bad_crop, overlay_safe_zone]
    action: rerender_or_adjust_controlled_fields
  review_required:
    examples: [uncertain_product_match, possible_restyle_issue]
    action: human_review
  terminal:
    examples: [corrupt_source, disallowed_content, missing_required_product_facts]
    action: block_publish_and_mark_terminal
```

## 16.2 Procedure

```txt
1. Open moment QA tab.
2. Inspect failed qa_check and qa_failures.
3. Confirm failure_class.
4. Choose allowed recovery action.
5. If remediable, create rerender with controlled fields.
6. If review_required, route to reviewer with explanation.
7. If terminal, block publish and mark terminal.
8. Audit action.
```

---

# 17. Runbook: Share Page Revocation Incident

## 17.1 Symptoms

```txt
private package accessible publicly
revoked share page still serves media
wrong package shown
signed URL lifetime too long
```

## 17.2 Immediate actions

```txt
1. Revoke share page through Admin.
2. Revoke/expire signed URL if possible.
3. Disable public share creation if widespread.
4. Inspect audit events and access logs.
5. Confirm B2 bucket is not public.
6. Notify owner/admin if exposure occurred.
```

## 17.3 Verification

```txt
Old share URL returns revoked/unavailable.
Unauthorized user cannot access private package.
Signed URL no longer works after expiry/revocation window.
Audit event records revocation.
```

---

# 18. Runbook: Retention and Deletion Recovery

## 18.1 Symptoms

```txt
deletion job stuck
asset soft-deleted but still visible in search
physical delete blocked by legal hold
provenance retained unexpectedly
share page not revoked after deletion
```

## 18.2 Procedure: stuck deletion job

```txt
1. Open Admin → Retention Queue.
2. Inspect deletion_job_id, asset_id, retention_class, legal_hold status.
3. Verify asset soft-deleted and removed from search.
4. Verify share links revoked.
5. If eligible, retry physical deletion.
6. If legal hold/audit exception applies, mark blocked_by_policy.
7. Audit outcome.
```

## 18.3 Procedure: accidental deletion request

```txt
1. Check whether only soft delete occurred.
2. If soft-deleted, restore visibility through approved Core API restore command if policy allows.
3. If physical deletion executed, verify B2 object versions/backup if available.
4. Restore only if legal/policy allows and object integrity can be verified.
5. Audit action and notify owner/admin.
```

---

# 19. Runbook: Manual Rerun from Raw Asset

## 19.1 Use when

```txt
derived/enhanced asset missing
manifest missing but raw source exists
QA remediable issue requires rerender
provider failed after raw capture
reviewer requests adjusted template/caption/trim
```

## 19.2 Preconditions

```txt
raw_source or raw_mezzanine asset exists
asset checksum verified
moment is not deleted/archived terminal unless admin override allows
budget authorization exists or override approved
template version is active/allowed
product claims are grounded
```

## 19.3 Procedure

```txt
1. Open moment detail in Admin or Review.
2. Select source asset: raw_mezzanine preferred, raw_source fallback.
3. Choose template/version and controlled parameters.
4. Run pre-enhancement QA.
5. Create new generation_run through Core API.
6. Emit generation.requested.
7. Monitor Genblaze Worker.
8. Verify new enhanced_master asset and manifests.
9. Run post-enhancement QA.
10. Route to Review Queue.
```

## 19.4 Rule

Manual rerun must create a new generation_run and output asset. It must not overwrite previous outputs.

---

# 20. Runbook: NATS Consumer Lag or Event Delivery Issue

## 20.1 Symptoms

```txt
queue lag growing
workers idle but events pending
messages redelivering repeatedly
max delivery advisories
expected worker not consuming
```

## 20.2 Triage

```txt
Check NATS stream health.
Check durable consumer status.
Check worker service health.
Check recent deploys.
Check event schema compatibility.
Check Core API worker callback failures.
Check DLQ count.
```

## 20.3 Actions

```txt
restart unhealthy worker
scale worker replicas
pause high-volume automation if backlog risks cost/user impact
fix schema mismatch and redeploy
replay DLQ after worker fix
mark poison messages terminal if invalid
```

---

# 21. Runbook: Deployment Rollback

## 21.1 Use when

```txt
production deployment causes elevated failures
API incompatible with workers
migrations cause query failures
frontend blocks golden path
agent/service config causes unsafe behavior
```

## 21.2 Procedure

```txt
1. Declare incident severity.
2. Disable risky feature flags if possible.
3. Roll back web/app containers to previous known-good image.
4. Roll back worker containers if event compatibility requires.
5. Do not roll back DB blindly after destructive migrations.
6. If migration issue, apply forward fix or restore from backup according to DB plan.
7. Run smoke tests.
8. Monitor DLQ and error rates.
9. Write incident report.
```

---

# 22. Read-only Diagnostic Query Guidance

Direct production SQL should be read-only unless an approved repair script is used.

Safe diagnostic examples:

```sql
-- Find stuck moments by state and age
SELECT organization_id, session_id, moment_id, state, updated_at
FROM moments
WHERE state IN ('capture_authorized', 'capturing', 'enhancing', 'qa_pending')
  AND updated_at < now() - interval '15 minutes'
ORDER BY updated_at ASC;
```

```sql
-- Find failed generation runs
SELECT organization_id, generation_run_id, moment_id, status, error_code, updated_at
FROM generation_runs
WHERE status = 'failed'
ORDER BY updated_at DESC
LIMIT 100;
```

```sql
-- Find asset rows with failed verification
SELECT organization_id, asset_id, asset_role, bucket, object_key, verification_status
FROM assets
WHERE verification_status = 'failed'
ORDER BY updated_at DESC
LIMIT 100;
```

Mutation guidance:

```txt
Do not run manual UPDATE/DELETE for business state.
Use Core API admin commands or approved migration/repair scripts.
```

---

# 23. Audit Requirements for Runbooks

Each runbook action must write an audit event.

```yaml
recovery_audit_event:
  actor_type: user
  actor_id: admin_user_id
  action: admin.recovery.<action_name>
  resource_type: moment|asset|generation_run|event|publish_package|share_page|provider|budget
  resource_id: string
  organization_id: ulid
  before_state: string_or_null
  after_state: string_or_null
  reason: string
  trace_id: string
  idempotency_key: string
  metadata_json:
    dry_run: boolean
    result: succeeded|failed|skipped|terminal
    related_ids: array
```

---

# 24. Admin Notification Rules

Notify organization owner/admin when:

```txt
raw source asset is terminally unavailable
publish package was exposed incorrectly
provider cost anomaly exceeds threshold
manual recovery changes published/share state
legal hold blocks deletion
repeated failures affect a campaign/session
```

Notification content must not include raw secrets, full transcripts, or private media URLs unless access-controlled.

---

# 25. Post-incident Checklist

For SEV1/SEV2:

```txt
1. Timeline created.
2. Root cause identified.
3. Affected organizations/resources identified.
4. Customer/admin impact documented.
5. Data exposure/deletion assessment completed.
6. Recovery actions audited.
7. Tests added or updated.
8. Runbook updated.
9. Monitoring alert added or tuned.
10. Follow-up owner assigned.
```

---

# 26. Acceptance Criteria

```txt
Given an event fails after retries
When an admin opens DLQ
Then they can inspect trace, payload preview, resource state, error, and retry/terminal options.

Given a generation run fails due to provider timeout
When an admin retries it
Then the retry goes through Core API, preserves idempotency, writes audit, and does not overwrite old assets.

Given an asset row exists but B2 object is missing
When B2 reconciliation runs
Then the system marks the discrepancy and offers safe recovery actions.

Given a share page is revoked
When an unauthenticated user opens the old link
Then the media is no longer served.

Given an admin performs any recovery action
When the action completes
Then an audit event includes actor, reason, before/after state, trace_id, and result.
```

---

# 27. Open Questions

```yaml
open_questions:
  admin_console_depth:
    question: Which recovery actions are available in P0 hackathon UI vs CLI/admin-only scripts?
    default: DLQ inspect/retry, failed generation inspect/retry, B2 object tree view for P0

  recovery_slo:
    question: What response and resolution targets apply by plan?
    required_before: production_beta

  direct_repair_scripts:
    question: Which approved scripts may perform controlled mutations outside normal API?
    default: none until explicitly reviewed

  provider_status_integration:
    question: Should provider status pages be integrated or manually checked?
    default: manual for P0, integrated later

  legal_hold_ui:
    question: Does enterprise require full legal hold workflow in Admin Console?
    default: P3 unless required earlier
```

---

# 28. Research References

```txt
NATS JetStream consumers and max delivery advisories:
  https://docs.nats.io/using-nats/developer/develop_jetstream/consumers

NATS JetStream concepts:
  https://docs.nats.io/nats-concepts/jetstream

Backblaze B2 S3-compatible API and Object Lock:
  https://www.backblaze.com/docs/cloud-storage-s3-compatible-api
  https://www.backblaze.com/docs/cloud-storage-enable-object-lock-with-the-s3-compatible-api

OpenTelemetry:
  https://opentelemetry.io/
```
