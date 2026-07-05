# 11 — JSON Schemas & Validation Contract

**Project:** Lumiq — Live Commerce Moment Vault  
**Document ID:** `11-json-schemas.md`  
**Status:** Draft v1  
**Audience:** backend engineers, frontend engineers, AI/agent engineers, QA, coding agents  
**Machine-readable artifacts:** `/docs/contracts/schemas/*.json`

---

## 1. Purpose

This document defines Lumiq’s JSON Schema strategy and registry.

The schemas in this package validate data crossing the most important system boundaries: API command payloads, NATS event envelopes, Mastra agent tool calls, LLM structured outputs, Genblaze generation metadata, B2 provenance manifests, catalog snapshots, template step graphs, publish packages, and QA results.

The goal is to make Lumiq safer for humans and AI coding agents:

```txt
no unvalidated agent output
no ad-hoc event payloads
no malformed manifests
no unscoped tenant objects
no hidden ungrounded product claims
no drift between TypeScript, Python, persisted DB rows, and B2 JSON manifests
```

---

## 2. Standard and Dialect

Lumiq uses **JSON Schema Draft 2020-12**. Schema files should include:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://schemas.lumiq.app/<name>.schema.json"
}
```

Every schema in `/schemas` is intended to be used as both validation contract and developer documentation.

---

## 3. Design Principles

### 3.1 Validate at every boundary

Validate at:

```txt
browser → Core API
Mastra Agent Service → Core API tool gateway
Core API → NATS
NATS → workers
workers → Core API
workers → B2 manifests
Genblaze Worker → provider adapter
LLMProviderRouter → agent structured output
```

### 3.2 Schema validation is not authorization

JSON Schema validates shape. It does not prove permission.

Every accepted payload still needs:

```txt
authentication
authorization
tenant scope check
capability check
budget/policy check
state-machine check
audit logging
```

### 3.3 Strict by default

All schemas prefer:

```json
{ "additionalProperties": false }
```

Exceptions are allowed only for documented `metadata` or provider-specific extension objects.

### 3.4 Tenant scope is mandatory

Tenant-scoped objects include `organization_id`.

B2 object keys must start with:

```txt
tenants/{organization_id}/
```

### 3.5 IDs are stable

Important domain objects use ULID-style IDs:

```txt
organization_id
session_id
moment_id
asset_id
generation_run_id
publish_package_id
agent_tool_call_id
llm_run_id
manifest_id
```

### 3.6 LLM and agent outputs are untrusted until validated

Mastra and LLM outputs must be schema-validated before they can influence capture, template selection, product matching, caption text, QA decisions, or publish readiness.

### 3.7 No raw secrets or raw prompts in generic payloads

Schemas must not permit provider keys, B2 credentials, database credentials, or raw secrets.

Raw prompts and raw transcripts should be represented by evidence IDs, excerpt IDs, or hashes unless a dedicated sensitive-evidence spec explicitly allows otherwise.

---

## 4. Folder Structure

```txt
/docs/contracts
  11-json-schemas.md
  /schemas
    common.schema.json
    event-envelope.schema.json
    asset.schema.json
    moment.schema.json
    generation-run.schema.json
    provenance-manifest.schema.json
    agent-tool-call.schema.json
    template-step.schema.json
    catalog-snapshot.schema.json
    qa-result.schema.json
    publish-package.schema.json
    llm-run.schema.json
    nats-events.schema.json
```

---

## 5. Schema Registry

```yaml
schema_registry:
  dialect: "https://json-schema.org/draft/2020-12/schema"
  base_id: "https://schemas.lumiq.app"
  policy:
    additional_properties_default: false
    metadata_extensions_allowed: true
    raw_secret_fields_allowed: false
    raw_prompt_logging_allowed: false
    tenant_scope_required: true
    schema_version_required_for_events: true
  schemas:
    - file: common.schema.json
      owner: platform
      consumers: [api, web, mastra, workers, tests]
      purpose: Shared IDs, timestamps, checksums, metadata, and primitives.
    - file: event-envelope.schema.json
      owner: eventing
      consumers: [api, workers, tests]
      purpose: Standard NATS event envelope.
    - file: asset.schema.json
      owner: storage
      consumers: [api, web, workers, provenance]
      purpose: B2-backed asset object contract.
    - file: moment.schema.json
      owner: moments
      consumers: [api, web, mastra, workers]
      purpose: Moment domain object contract.
    - file: generation-run.schema.json
      owner: media
      consumers: [api, genblaze-worker, web, qa]
      purpose: Durable Genblaze/media generation run contract.
    - file: provenance-manifest.schema.json
      owner: provenance
      consumers: [api, genblaze-worker, b2, web, audit]
      purpose: B2 app-level lineage manifest.
    - file: agent-tool-call.schema.json
      owner: ai
      consumers: [mastra, api, audit]
      purpose: Mastra agent tool call envelope.
    - file: template-step.schema.json
      owner: media
      consumers: [api, genblaze-worker, tests]
      purpose: Safe template step graph item.
    - file: catalog-snapshot.schema.json
      owner: commerce
      consumers: [api, b2, mastra, qa]
      purpose: Frozen catalog/campaign facts for commerce grounding.
    - file: qa-result.schema.json
      owner: qa
      consumers: [qa-worker, api, web, provenance]
      purpose: Multi-stage QA result and failure classification.
    - file: publish-package.schema.json
      owner: publishing
      consumers: [api, publish-worker, web]
      purpose: Canonical publish package contract.
    - file: llm-run.schema.json
      owner: ai
      consumers: [mastra, api, observability]
      purpose: LLM call audit/usage contract.
    - file: nats-events.schema.json
      owner: eventing
      consumers: [api, workers, tests]
      purpose: Event validation entry point and routing docs.
```

---

## 6. Validation Surfaces

### Core API

The Core API validates public command payloads, internal worker reports, agent tool calls, publish package input, controlled edit input, and catalog import rows.

### Mastra Agent Service

The Mastra Agent Service validates agent tool call envelopes, structured outputs, LLMProviderRouter responses, memory retrieval payloads, and tool result payloads.

### NATS producers and consumers

Before publishing or consuming an event, services validate envelope, event type, schema version, organization scope, trace ID, and idempotency key.

### B2 manifest writers

B2 manifest writers validate provenance manifests, catalog snapshots, Genblaze manifest wrappers, and asset sidecar metadata before upload.

---

## 7. TypeScript / Python Usage

Recommended TypeScript path:

```txt
AJV or compatible validator for Draft 2020-12
Zod for ergonomic app-level schemas
json-schema-to-ts or equivalent if generated types are desired
```

Recommended Python path:

```txt
jsonschema for Draft 2020-12 validation
Pydantic models for internal worker ergonomics
JSON schemas remain the cross-language contract
```

Do not let Pydantic and Zod drift away from the canonical JSON schemas.

---

## 8. Schema Compatibility Rules

Backward-compatible changes:

```txt
add optional field
add description
add metadata annotation
add optional enum only if all consumers tolerate it
```

Breaking changes:

```txt
remove field
rename field
change required fields
narrow enum
change type
change state-machine value
change ID format
```

Breaking changes require a major version update and migration plan.

---

## 9. Security Rules

Schemas must not permit:

```txt
provider API keys
B2 credentials
raw secret values
raw prompts in normal logs
full raw transcripts in generic event payloads
arbitrary shell commands
arbitrary ffmpeg strings
arbitrary SQL
```

Dangerous generic fields are forbidden unless explicitly justified:

```txt
execute
command
script
sql
provider_key
secret
```

---

## 10. Event Payload Expansion Plan

The current package includes `event-envelope.schema.json` and `nats-events.schema.json`. Future versions should add event-specific payload schemas:

```txt
session.opened.payload.schema.json
signal.detected.payload.schema.json
moment.candidate.proposed.payload.schema.json
moment.capture.authorized.payload.schema.json
moment.raw.uploaded.payload.schema.json
generation.requested.payload.schema.json
generation.completed.payload.schema.json
qa.completed.payload.schema.json
publish.completed.payload.schema.json
```

The envelope must remain stable; payload schemas can evolve by event type and version.

---

## 11. AI Coding Agent Instructions

```txt
1. Do not create ad-hoc payload shapes.
2. Use schemas from /docs/contracts/schemas.
3. Validate payloads at API, event, worker, and agent boundaries.
4. If a field is missing from a schema, update the spec before using it.
5. Do not add additionalProperties unless explicitly justified.
6. Do not pass raw secrets, prompts, or transcripts through metadata.
7. Preserve organization_id on every tenant-scoped object.
8. Preserve idempotency_key on every side-effecting command/event/tool call.
```

---

## 12. Change Log

| Version | Change |
|---|---|
| v1 | Created JSON Schema registry and initial schema package |
