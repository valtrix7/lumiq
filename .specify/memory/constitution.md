<!--
Sync Impact Report
Version change: template -> 1.0.0
Modified principles:
- [PRINCIPLE_1_NAME] -> I. Specs and Domain Language Lead
- [PRINCIPLE_2_NAME] -> II. Provenance and Storage Are Non-Negotiable
- [PRINCIPLE_3_NAME] -> III. Agents Recommend, Core API Authorizes, Workers Execute
- [PRINCIPLE_4_NAME] -> IV. Commerce Claims and Media Integrity Must Be Grounded
- [PRINCIPLE_5_NAME] -> V. Idempotent, Audited, Contract-Validated Workflows
Added sections:
- Lumiq Architecture Boundaries
- Development Workflow and Quality Gates
Removed sections:
- Placeholder SECTION_2_NAME
- Placeholder SECTION_3_NAME
Templates requiring updates:
- updated: .specify/templates/plan-template.md
- updated: .specify/templates/spec-template.md
- updated: .specify/templates/tasks-template.md
- pending: .specify/templates/commands/*.md unavailable; commands directory does not exist
Runtime guidance reviewed:
- reviewed: README.md
- reviewed: AGENTS.md
- reviewed: docs/00-spec-index.md
- reviewed: docs/architecture/02-project-constitution.md
- reviewed: docs/product/PRD.md as the product requirements source
- reviewed: docs/product/03-glossary-domain-language.md
- reviewed: docs/product/04-requirements-ears.md
Follow-up TODOs:
- None.
-->

# Lumiq Constitution

## Core Principles

### I. Specs and Domain Language Lead
All implementation MUST start from the current Lumiq specs and glossary. Existing code,
agent memory, generated plans, and convenience assumptions do not override the specs.
Major behavior MUST reference requirement IDs from `docs/product/04-requirements-ears.md`
or an explicitly updated successor document. New domain concepts MUST be added to
`docs/product/03-glossary-domain-language.md` before becoming widespread in code,
contracts, events, schemas, or UI copy.

Rationale: Lumiq crosses live media, AI agents, commerce claims, provenance, and
publishing. Precise source documents prevent architectural drift, hallucinated behavior,
and ambiguous domain language.

### II. Provenance and Storage Are Non-Negotiable
Every generated or published commerce asset MUST remain traceable to the exact source
moment, raw source asset, catalog snapshot, generation run, QA result, publish package,
and provenance manifest that produced it. Backblaze B2 is the canonical media and
provenance vault. Neon Postgres is the operational source of truth. Important assets
MUST have both a Postgres record and a B2 object or manifest, cross-referenced by IDs,
object keys, checksums, and lineage records. Canonical B2 objects MUST NOT be overwritten;
rerenders MUST create new generation runs, asset IDs, object keys, manifests, and QA state.
Tenant-scoped B2 keys MUST start with `tenants/{organization_id}/`.

Rationale: Lumiq's product promise is proof. Lost raw evidence, overwritten assets, or
broken lineage invalidate the platform.

### III. Agents Recommend, Core API Authorizes, Workers Execute
Mastra agents MAY reason, classify, score, recommend, and explain through structured,
schema-validated outputs. Agents MUST NOT directly mutate Postgres, write or delete B2
objects, call Genblaze or media providers directly, publish externally, change budgets,
change retention policy, hard-delete assets, or override catalog facts. All side-effecting
agent work MUST pass through typed Core API tool gateways with service identity, tenant
scope, capability checks, schema validation, idempotency, policy checks, and audit logging.
Workers execute bounded async tasks only after Core API authorization and MUST report
durable state transitions back through approved APIs or state-transition services.

Rationale: AI recommendations are useful only when privileged actions remain controlled,
audited, tenant-scoped, and policy-bound.

### IV. Commerce Claims and Media Integrity Must Be Grounded
Generated overlays, captions, titles, descriptions, thumbnails, publish copy, and product
cards MUST use verified catalog or campaign facts, not freeform AI claims. Commerce-grounded
sessions MUST have a `catalog_snapshot_id`, and catalog snapshots MUST be stored as
queryable Postgres rows plus immutable B2 manifests. Restricted claims such as discounts,
availability, free shipping, waterproofing, warranty, authenticity, limited stock, or
expiry MUST be explicitly supported. AI restyling MUST NOT materially alter product color,
shape, size, texture, material, packaging, features, fit, or buyer expectation without
blocking, labeling, or human review.

Rationale: Lumiq serves commerce teams. Misstated claims or altered product appearance
damage buyer trust and create publish risk.

### V. Idempotent, Audited, Contract-Validated Workflows
Every important side-effect boundary MUST be idempotent and audited, including API
commands, agent tool calls, NATS events, worker consumers, B2 writes, provider calls,
publish adapter calls, approvals, deletes, policy decisions, and recovery actions. Events
MUST use the standard envelope with `event_id`, `event_type`, `schema_version`,
`organization_id`, `occurred_at`, `producer`, `idempotency_key`, `correlation_id`,
`trace_id`, and `payload`. API payloads, event payloads, agent tool calls, LLM structured
outputs, manifests, and template step graphs MUST be schema-validated before controlling
state or side effects.

Rationale: Duplicate deliveries, provider failures, malformed model outputs, and worker
crashes are normal operating conditions. The system must remain recoverable and explainable.

## Lumiq Architecture Boundaries

Lumiq MUST preserve this responsibility split:

- Mastra recommends.
- Core API authorizes, enforces policy, owns state transitions, and writes audit records.
- NATS JetStream dispatches durable events and jobs; it is transport, not truth.
- Workers execute bounded async work and acknowledge only after durable state is recorded.
- Genblaze owns generative media orchestration and provider media pipeline execution.
- Backblaze B2 stores media objects, manifests, evidence bundles, and provenance.
- Neon Postgres stores operational truth, permissions, state machines, indexes, and audits.
- Clerk authenticates humans; Lumiq internal RBAC and capabilities authorize actions.

Sensitive actions require human approval by default unless an explicit organization policy
allows automation. Sensitive actions include external publish, hard delete, product fact
override, major AI restyle, retention or legal policy change, billing cap increase, and
public share access where the organization requires approval.

The core app MUST use the Lumiq design system: dark-only interface, approved tokens, flat
gradients only, no glow or blur aura, Inter for UI, mono font for IDs, B2 keys, checksums,
timestamps, JSON snippets, and manifest metadata. Provenance MUST be visible in relevant
review, vault, publish, and share workflows.

## Development Workflow and Quality Gates

Before implementation, feature plans MUST pass a Constitution Check covering:

- requirement IDs and relevant specs read;
- real repo paths under `apps/*`, `packages/*`, `infra/*`, `tests/*`, or `docs/*`;
- Core API state-transition ownership;
- agent, worker, Genblaze, B2, Postgres, and NATS boundaries;
- tenant scope, RBAC/capability checks, service identity, and secret handling;
- product grounding and catalog snapshot behavior;
- immutable B2 keys, checksums, manifests, and provenance graph requirements;
- event envelope, schema versioning, idempotency, audit, DLQ, and recovery behavior;
- contract/schema validation for API, events, tools, LLM outputs, manifests, and templates;
- design-token compliance for frontend work;
- test coverage or explicit manual evaluation criteria for risky behavior.

Tests or validation tasks MUST cover behavior that creates media, changes state, spends
money, publishes content, exposes data, deletes assets, influences product claims, or
executes provider/LLM work. Required validation categories include static checks, schema
and contract validation, tenant isolation, service identity, worker duplicate handling,
retry/DLQ behavior, B2 checksum and no-overwrite behavior, structured AI output, prompt
injection fixtures, UI empty/loading/error states, provenance visibility, and the seeded
golden path when affected.

Local development MUST use mock providers by default. Real provider calls, real publish
destinations, and non-local credentials require explicit opt-in and must never expose
secrets to browsers, prompts, logs, or agent memory.

## Governance

This constitution supersedes implementation plans, task lists, generated code, and local
agent assumptions when they conflict. The only higher-priority project document is a later,
explicitly ratified version of this constitution.

Amendments MUST include:

- the changed principle or section;
- affected rule IDs or requirement IDs where applicable;
- migration impact on specs, contracts, tests, and existing code;
- risk assessment for provenance, security, product claims, publishing, and tenant data;
- updated templates or runtime guidance when the change affects future Spec Kit output.

Versioning follows semantic versioning:

- MAJOR for removed or redefined non-negotiable boundaries.
- MINOR for new principles, new governance sections, or materially expanded rules.
- PATCH for clarifications, typo fixes, or non-semantic wording changes.

Every feature plan, PR, or agent task MUST review constitution compliance before design
work and again before implementation. Violations are allowed only through a documented
exception that names the affected rule, reason, risk, mitigation, owner approval, spec
update, and test update. Temporary hackathon shortcuts MUST be labeled
`HACKATHON_SHORTCUT` and state what is simulated, what is real, and what must be replaced.

**Version**: 1.0.0 | **Ratified**: 2026-06-27 | **Last Amended**: 2026-06-27
