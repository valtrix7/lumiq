# 02 — Project Constitution

**Project:** Lumiq — Live Commerce Moment Vault  
**Document ID:** `02-project-constitution.md`  
**Status:** Draft v1  
**Audience:** all contributors, AI coding agents, architects, QA, designers  
**Purpose:** Non-negotiable rules for building Lumiq safely and consistently.

---

## 1. Purpose

This constitution defines the rules that must govern Lumiq’s design and implementation.

It is intentionally strict. Lumiq combines AI agents, live media, commerce data, storage provenance, provider orchestration, and publishing workflows. A small implementation mistake can cause:

```txt
ungrounded product claims
misleading AI-restyled product appearance
lost raw source evidence
untraceable generated clips
duplicate provider costs
unsafe agent side effects
wrong tenant data exposure
broken B2 lineage
unaudited publishing
destructive deletion
```

This document exists to prevent those failures.

When this constitution conflicts with another document, this constitution wins unless explicitly amended.

---

## 2. Constitutional Summary

Lumiq must be built according to these principles:

```txt
1. Preserve source truth.
2. Agents recommend; backend authorizes; workers execute.
3. B2 is the canonical media/provenance vault.
4. Postgres is the operational source of truth.
5. Genblaze is the generative media orchestration layer.
6. Mastra is the agent orchestration layer.
7. Product facts must be grounded.
8. Generated media must preserve buyer trust.
9. Every important side effect must be audited.
10. Every event/worker action must be idempotent.
11. Canonical assets must never be overwritten.
12. Publishing requires human approval unless explicit policy allows automation.
13. Design tokens are mandatory.
14. Specs lead; code follows.
```

---

## 3. Source-of-Truth Rules

### RULE-SOT-001 — Specs Before Code

The system must be implemented from the specs, not from memory or ad-hoc decisions.

If a behavior is not specified, contributors must either:

1. ask for clarification,
2. add/update the relevant spec,
3. or mark the implementation as exploratory and isolated.

### RULE-SOT-002 — Source-of-Truth Hierarchy

When documents conflict, use this order:

```txt
1. 02-project-constitution.md
2. PRD.md
3. 04-requirements-ears.md
4. Domain-specific spec
5. API/event/schema contracts
6. Implementation tasks
7. Existing code
```

Existing code does not override the specs.

### RULE-SOT-003 — Glossary Terms Are Mandatory

Code, schemas, APIs, events, and UI copy should use the vocabulary in `03-glossary-domain-language.md`.

Do not invent parallel names for core objects.

Use:

```txt
session
moment
asset
generation_run
publish_package
catalog_snapshot
provenance_manifest
agent_tool_call
llm_run
```

Avoid ambiguous terms like:

```txt
clip
file
AI job
metadata
stream
```

unless qualified.

---

## 4. Architecture Rules

### RULE-ARCH-001 — Layered Responsibility

Lumiq must preserve this responsibility split:

```txt
Mastra:
  agent reasoning and structured recommendations

Core API:
  authorization, policy checks, state transitions, audit

NATS JetStream:
  event/job transport and async fan-out

Workers:
  execution of bounded async tasks

Genblaze:
  generative media orchestration and provider media pipeline execution

Backblaze B2:
  canonical media/provenance object storage

Neon Postgres:
  operational state, indexes, permissions, run records, audit metadata
```

No layer should quietly take over another layer’s job.

### RULE-ARCH-002 — Core API Owns State Transitions

Durable business state transitions must go through the Core API or approved state-transition service.

Workers and agents must not silently mutate major state directly unless explicitly allowed by a spec.

Examples of protected states:

```txt
session state
moment state
generation_run state
publish_package state
asset verification state
review approval state
deletion state
```

### RULE-ARCH-003 — Postgres Is Operational Truth

Postgres owns queryable operational truth:

```txt
organizations
users
memberships
sessions
moments
assets
generation_runs
catalog_snapshots
provenance_links
audit_events
budgets
agent_tool_calls
llm_runs
publish_packages
```

B2 owns media/provenance objects. The two must cross-reference each other.

### RULE-ARCH-004 — B2 Is Media/Provenance Truth

Backblaze B2 must store canonical media and manifest objects:

```txt
raw source media
mezzanine media
live-transformed media where relevant
enhanced master media
publish variants
thumbnails
captions
catalog snapshot manifests
provenance manifests
Genblaze manifests
evidence bundles where required
```

B2 is not just a dump bucket. It is the durable vault.

### RULE-ARCH-005 — NATS Is Transport, Not Truth

NATS JetStream carries durable events and jobs, but it is not the business source of truth.

If NATS and Postgres conflict, Postgres state wins, and reconciliation must resolve the event flow.

### RULE-ARCH-006 — No Monolithic Agent

No single agent may own detection, product matching, template selection, generation, publishing, deletion, and billing.

Use supervisor + specialist agents, each with narrow tools and scoped permissions.

### RULE-ARCH-007 — Temporal-compatible State Machines

The first implementation may use NATS + Postgres state machines, but state transitions should be designed so they can migrate to Temporal later.

Do not bake queue-specific behavior into business logic.

---

## 5. Agent and AI Rules

### RULE-AGENT-001 — Agents Recommend, They Do Not Execute Side Effects Directly

Agents may analyze, classify, score, summarize, suggest, and explain.

Agents must not directly:

```txt
write to B2
delete from B2
call Decart directly
call Genblaze directly
mutate Postgres state
publish externally
change retention policies
increase budgets
hard delete assets
```

Agents must use typed internal tool gateways.

### RULE-AGENT-002 — Agents Must Use Service Identities

Every agent action must be attributable to a service identity.

Required metadata:

```txt
agent_id
service_identity
organization_id
session_id nullable
moment_id nullable
tool_name
idempotency_key
trace_id
policy_result
```

### RULE-AGENT-003 — Agent Tools Must Be Narrow

Agent tools must do one bounded action.

Good tools:

```txt
propose_moment_candidate
suggest_template
suggest_clip_boundaries
validate_product_match
generate_caption_options
explain_qa_result
read_session_context
read_catalog_snapshot
```

Bad tools:

```txt
execute_any_action
run_sql
call_provider
write_b2_object
publish_anywhere
delete_asset
```

### RULE-AGENT-004 — Structured Output Required

Agent outputs that affect product behavior must be structured and schema-validated.

Freeform text is allowed for explanation, not for control.

### RULE-AGENT-005 — Untrusted Inputs Must Stay Untrusted

Transcripts, user prompts, product descriptions, comments, chat messages, and media-derived text are untrusted.

Agents must not treat those inputs as system instructions.

### RULE-AGENT-006 — Agent Memory Cannot Override Truth

Agent memory may personalize recommendations, but it cannot override:

```txt
catalog snapshot facts
allowed claims
current explicit user settings
QA policy
moderation policy
budget policy
retention policy
human approval requirements
```

### RULE-AGENT-007 — LLM Calls Must Use LLMProviderRouter

Agents must not hardcode provider/model choices.

All LLM calls should route through `LLMProviderRouter`, which controls:

```txt
provider
model
cost policy
fallback policy
latency policy
quality policy
structured output schema
```

### RULE-AGENT-008 — LLM Runs Must Be Recorded

Every significant LLM call must produce an `llm_runs` record with:

```txt
provider
model
task_type
agent_id
input_hash
output_hash
schema_version
status
cost estimate
latency
trace_id
```

Do not store raw prompts or raw outputs in normal logs.

---

## 6. Genblaze and Media Pipeline Rules

### RULE-MEDIA-001 — Genblaze Owns Generative Media Orchestration

When Lumiq generates or edits media through AI providers, the operation must flow through the Genblaze media pipeline layer or an explicitly approved media worker abstraction.

Genblaze owns:

```txt
media provider orchestration
video/image/audio generation steps
media editing/generation pipeline execution
approved fallback chains
output asset creation
media run metadata
media manifests
parent_run_id lineage
B2 storage handoff
```

### RULE-MEDIA-002 — Genblaze Does Not Own App State

Genblaze must not own:

```txt
auth
RBAC
review approval
catalog validation
budget policy
NATS topology
Postgres state machines
publish approval
deletion policy
```

### RULE-MEDIA-003 — Media Outputs Must Be Linked to Runs

Every generated output must be linked to a `generation_run`.

Required linkage:

```txt
generation_run_id
input_asset_id
output_asset_id
template_id
template_version
provider
model
manifest_asset_id
parent_run_id where applicable
```

### RULE-MEDIA-004 — Rerenders Create New Versions

Rerenders must never overwrite previous generated outputs.

A rerender creates:

```txt
new generation_run_id
new output_asset_id
new B2 object key
new manifest
new QA state
```

### RULE-MEDIA-005 — Provider Fallback Must Be Policy-based

Provider fallback may happen only if all are true:

```txt
template allows fallback
organization budget allows fallback
provider policy allows fallback
product-safety policy allows fallback
fallback does not weaken required QA gates
```

### RULE-MEDIA-006 — AI Restyling Must Preserve Product Trust

AI restyling must not materially alter:

```txt
product color
shape
size
texture
material
packaging
features
fit/result expectation
```

If a restyle changes product appearance, it must be blocked, labeled, or sent to human review.

---

## 7. Storage, Asset, and Provenance Rules

### RULE-STORAGE-001 — Canonical Assets Are Immutable

Canonical B2 objects must never be overwritten.

Allowed:

```txt
new object keys for new versions
soft delete state changes
lifecycle expiration for eligible temp assets
```

Forbidden:

```txt
overwrite raw source
overwrite enhanced master
overwrite provenance manifest
reuse object key for new output version
```

### RULE-STORAGE-002 — Every Important Asset Needs Postgres + B2

For important assets, both must exist:

```txt
Postgres asset row
B2 object or manifest
```

The Postgres row makes it queryable. B2 makes it durable and portable.

### RULE-STORAGE-003 — Checksums Required

Every canonical asset and manifest must include SHA-256 or equivalent approved checksum.

Required for:

```txt
raw source
mezzanine
live transformed
enhanced master
publish variants
thumbnails
captions
manifests
catalog snapshots
```

### RULE-STORAGE-004 — B2 Object Keys Must Include Tenant Scope

Every tenant-scoped object key must start with:

```txt
tenants/{organization_id}/...
```

### RULE-STORAGE-005 — Provenance Must Be Dual-source

Lumiq must maintain:

```txt
queryable provenance in Postgres
immutable provenance manifests in B2
```

### RULE-STORAGE-006 — Raw Source Must Be Preserved Before Enhancement

The system must not generate a polished output without preserving the raw source or recording a clear exception.

Raw capture should precede or occur in parallel with enhancement dispatch.

### RULE-STORAGE-007 — Catalog Snapshots Must Be Stored as Evidence

Commerce-grounded sessions must store catalog snapshots in both:

```txt
Postgres queryable rows
B2 catalog snapshot manifest
```

---

## 8. Product Accuracy and Commerce Rules

### RULE-COMMERCE-001 — Product Facts Must Be Grounded

AI may suggest product facts, but final rendered/published content must use only verified catalog/campaign facts.

Examples requiring verification:

```txt
product name
SKU
price
discount
availability
product URL
limited stock
best-selling
free shipping
waterproof
guaranteed
expires today
```

### RULE-COMMERCE-002 — No Ungrounded Claims

Generated captions, overlays, thumbnails, titles, descriptions, and hashtags must not contain ungrounded claims.

### RULE-COMMERCE-003 — Session Snapshot Required for Commerce-grounded Mode

If a session uses product facts in outputs, it must have a catalog snapshot.

### RULE-COMMERCE-004 — Refresh Critical Facts Before External Publish

Before external publishing, the system must refresh critical facts where possible:

```txt
price
inventory
availability
offer validity
product URL
```

If facts have materially changed, auto-publish must be blocked.

### RULE-COMMERCE-005 — Product Match Uncertainty Requires Review

If product match confidence is below policy threshold, the system must queue for review and must not auto-publish product claims.

---

## 9. Capture and Moment Rules

### RULE-MOMENT-001 — Detection Is Not Capture

Signal detection and moment proposal do not authorize raw capture.

Capture requires `MomentPolicyService` or equivalent policy gate.

### RULE-MOMENT-002 — Capture Requires Policy Checks

Capture requires checks for:

```txt
session state
score threshold
duplicate window
privacy policy
retention policy
session cap
tenant budget
source availability
```

### RULE-MOMENT-003 — Use Generous Raw Capture

Raw capture should include pre-roll and post-roll around the candidate where available.

The final enhanced clip may use a tighter trim.

### RULE-MOMENT-004 — Store Full Evidence for Accepted Moments

Accepted/captured moments should store full evidence trails.

Rejected candidates may store lightweight summaries.

### RULE-MOMENT-005 — Live-transformed Output Is Conditional

Store live-transformed output only when:

```txt
audience-visible
used in final lineage
needed for review
materially different from raw source
```

---

## 10. Review, QA, and Publishing Rules

### RULE-QA-001 — QA Is Multi-stage

Lumiq must support:

```txt
pre-enhancement QA
post-enhancement QA
pre-publish QA
```

### RULE-QA-002 — QA Failures Must Be Classified

Failure classes:

```txt
retryable
remediable
review_required
terminal
```

### RULE-QA-003 — Publishing Requires Approval by Default

External publishing requires human approval unless explicit organization policy allows automation.

### RULE-QA-004 — Sensitive Actions Require Human Approval

Human approval is required by default for:

```txt
external publish
hard delete
product fact override
major AI restyle
retention/legal policy change
billing cap increase
public share link creation if org requires it
```

### RULE-QA-005 — Publish Package Is Canonical

External destinations are adapters. Lumiq’s `publish_package` remains the canonical record.

### RULE-QA-006 — Share Links Must Be Revocable

Any share link must be revocable without requiring deletion of the canonical asset.

---

## 11. Event, Idempotency, and Workflow Rules

### RULE-EVENT-001 — All Events Must Use the Standard Envelope

Every event must include:

```txt
event_id
event_type
schema_version
organization_id
occurred_at
producer
idempotency_key
correlation_id
trace_id
payload
```

### RULE-EVENT-002 — Events Must Be Versioned

Every event schema must be versioned.

### RULE-EVENT-003 — NATS Subjects Must Be Stable

Use stable domain subjects:

```txt
moment.candidate.proposed
moment.capture.authorized
generation.requested
generation.completed
qa.completed
publish.completed
```

Do not put high-cardinality tenant/session IDs in subject names by default.

### RULE-EVENT-004 — Idempotency at Every Boundary

Every side-effect boundary must have idempotency:

```txt
API commands
agent tool calls
events
worker consumers
B2 object writes
provider calls
publish adapter calls
```

### RULE-EVENT-005 — Workers Ack Only After Durable State

Workers should acknowledge events only after durable state has been written or the step has been safely recorded.

### RULE-EVENT-006 — DLQ Required

After retry exhaustion, failed events/jobs must go to DLQ and be visible in Admin/Recovery.

---

## 12. Security Rules

### RULE-SEC-001 — No Shared Super-key

Services must not share one broad internal secret for all actions.

Use service identities and scoped permissions.

### RULE-SEC-002 — No Agent Access to Raw Secrets

Agents must not receive:

```txt
B2 application keys
provider API keys
database credentials
publish destination credentials
billing credentials
```

### RULE-SEC-003 — Logs Must Be Redacted

Normal logs must not include:

```txt
full raw transcripts
full prompts
full model outputs
private product data beyond IDs/hashes
customer secrets
provider credentials
```

### RULE-SEC-004 — Tenant Isolation Required Everywhere

Tenant isolation must apply to:

```txt
database rows
B2 object keys
NATS event payloads
agent memory
LLM runs
search indexes
audit events
provider usage records
```

### RULE-SEC-005 — Prompt Injection Must Be Treated as a Real Threat

User-provided text, transcripts, product descriptions, chat messages, and captions must never be treated as system instructions.

### RULE-SEC-006 — Public Access Must Be Explicit

Assets are private by default. Public share pages or published assets require explicit publish/share policy.

---

## 13. Privacy, Retention, and Deletion Rules

### RULE-PRIV-001 — Moment-only Storage by Default

Full session recording is optional. Default storage is selected/captured moments only.

### RULE-PRIV-002 — Transcript Retention Must Be Tiered

Full session transcript chunks should have shorter retention than accepted-moment excerpts and caption outputs.

### RULE-PRIV-003 — Soft Delete First

Delete requests should soft-delete first, remove from UI/search, revoke public access, and then schedule physical deletion according to policy.

### RULE-PRIV-004 — Provenance Retention Must Respect Policy

Some provenance may need to be retained for audit, but deletion/export/privacy policy must define what can remain and what must be removed.

### RULE-PRIV-005 — Data Export Must Be Supported

Organizations should be able to export their allowed data, manifests, and asset references.

---

## 14. Observability and Audit Rules

### RULE-OBS-001 — Every Important Action Must Be Audited

Audit these actions:

```txt
state transitions
agent tool calls
provider calls
asset writes
approval/rejection
publish package creation
share page creation
delete/revoke
budget policy decisions
retention changes
admin recovery actions
```

### RULE-OBS-002 — Trace IDs Required

API requests, events, agent tool calls, worker jobs, provider calls, and B2 writes should share trace/correlation context.

### RULE-OBS-003 — Cost Must Be Observable

Provider and LLM usage must be recorded in cost ledgers or usage records.

### RULE-OBS-004 — Admin Recovery Must Exist

The system must expose operational recovery for:

```txt
DLQ events
stuck moments
failed generation runs
B2 reconciliation anomalies
provider failures
budget anomalies
orphaned assets
```

---

## 15. Design Constitution

### RULE-DESIGN-001 — Dark-only Core App

The Lumiq app is dark-only.

### RULE-DESIGN-002 — Royal Blue for Action + Active Signal

Deep royal/cobalt blue is used for:

```txt
primary actions
selected navigation
active controls
current timeline segment
live detection markers
focus ring
```

### RULE-DESIGN-003 — Flat Gradients Only

Gradients are allowed only as flat linear gradients.

Forbidden:

```txt
glow gradients
blurred gradients
aura backgrounds
neon edges
animated rainbow haze
gradient shadows
```

### RULE-DESIGN-004 — Gradients Are Rare

Use gradients only for:

```txt
AI-active hairlines
small AI badges
onboarding/empty-state moments
lineage route highlights
rare marketing text
```

Do not use gradient primary buttons.

### RULE-DESIGN-005 — Use Tokens

Frontend implementations must use:

```txt
DESIGN.md
theme.css
variables.css
tokens.json
```

No arbitrary colors, radii, shadows, font families, or animation curves.

### RULE-DESIGN-006 — Mono for Technical Data

Run IDs, asset IDs, B2 keys, checksums, timestamps, JSON snippets, and manifest metadata should use the mono font.

### RULE-DESIGN-007 — Reduced Motion Required

Timeline pulses, processing loops, and panel animations must have reduced-motion alternatives.

---

## 16. Testing Constitution

### RULE-TEST-001 — Requirement IDs Must Map to Tests

Tests should reference requirement IDs where practical.

Examples:

```txt
REQ-CAPTURE-004
REQ-GEN-002
REQ-PROV-001
REQ-AGENT-003
```

### RULE-TEST-002 — Contract Tests Required for Boundaries

Contract tests are required for:

```txt
API payloads
event schemas
agent tool schemas
LLM structured outputs
manifest schemas
template step graphs
```

### RULE-TEST-003 — Failure Simulation Required

The system must test:

```txt
B2 upload failure
provider timeout
LLM malformed output
agent tool denial
NATS duplicate delivery
worker crash before ack
DLQ recovery
checksum mismatch
budget exhaustion
QA terminal failure
```

### RULE-TEST-004 — E2E Demo Path Must Stay Green

The core hackathon demo path must be protected by an E2E test or scripted smoke test:

```txt
prerecorded-live session
candidate detection
Mastra recommendation
policy capture authorization
B2 raw upload
Genblaze enhancement
QA pass
review approval
publish package
provenance graph
share page
```

---

## 17. Environment and Deployment Rules

### RULE-ENV-001 — Separate Environments

Use separate dev/staging/prod resources for:

```txt
database
B2 buckets
NATS streams
Clerk apps
provider credentials
LLM keys
secrets
```

### RULE-ENV-002 — Containerized Services

Core API, Mastra Agent Service, and workers should run as containers.

Do not rely on pure serverless for long-running media workers.

### RULE-ENV-003 — Managed Secrets

Use managed secrets for staging/prod.

Local `.env` may be used only for local/mock/staging-limited keys.

### RULE-ENV-004 — CI/CD Gates

CI/CD must check:

```txt
lint
typecheck
unit tests
schema validation
DB migration checks
agent tool schema tests
template validation
worker contract tests
```

---

## 18. Forbidden Implementation Patterns

The following patterns are forbidden unless explicitly approved by a spec update.

### 18.1 Backend

```txt
agents writing directly to Postgres
agents calling B2 directly
workers changing business state without audit
provider calls without generation_run records
events without schema_version
side effects without idempotency_key
hard deletes without policy checks
overwriting canonical B2 keys
```

### 18.2 AI

```txt
raw transcript treated as instruction
user prompt overriding system/policy
unstructured model output controlling side effects
LLM provider hardcoded in random modules
agent memory overriding catalog facts
AI-generated product claim without grounding
```

### 18.3 Media

```txt
enhancement without raw source reference
generated output without manifest
rerender overwriting previous asset
AI restyle changing product appearance without review
provider fallback without policy authorization
```

### 18.4 Frontend

```txt
light mode in core app
glow gradients
random colors outside tokens
gradient primary CTA
hiding provenance entirely
technical IDs rendered in normal sans text where mono is required
status conveyed by color alone
```

---

## 19. Exceptions Process

An exception to this constitution requires:

```txt
1. explicit reason
2. affected rule IDs
3. risk assessment
4. proposed mitigation
5. owner approval
6. spec update
7. test update where applicable
```

Temporary hackathon shortcuts must be labeled:

```txt
HACKATHON_SHORTCUT
```

and must include:

```txt
what is simulated
what is real
what must be replaced later
```

---

## 20. Pull Request Checklist

Every PR should answer:

```txt
[ ] Which requirement IDs does this implement?
[ ] Which specs were read?
[ ] Are any specs updated?
[ ] Are domain terms from the glossary used correctly?
[ ] Are state transitions going through approved paths?
[ ] Are agent tools narrow and schema-validated?
[ ] Are side effects idempotent?
[ ] Are audit events created?
[ ] Are B2 object keys immutable and tenant-scoped?
[ ] Are product claims grounded?
[ ] Are tests included?
[ ] Are design tokens used?
[ ] Are no-glow gradient rules followed?
```

---

## 21. Coding Agent Startup Prompt

When assigning an AI coding agent, include this instruction:

```txt
You are working on Lumiq. Before coding, read:
1. /docs/00-spec-index.md
2. /docs/architecture/02-project-constitution.md
3. /docs/product/03-glossary-domain-language.md
4. /docs/product/PRD.md
5. /docs/product/04-requirements-ears.md
6. Any domain-specific spec relevant to the task.

Do not invent architecture. Do not bypass the Core API for state transitions. Do not give agents direct B2/provider/DB access. Do not add ungrounded product claims. Do not overwrite canonical assets. Use design tokens. If a behavior is unspecified, stop and request a spec update.
```

---

## 22. Constitution Change Log

| Version | Date | Change |
|---|---|---|
| v1 | Initial draft | Created project constitution from PRD, glossary, EARS requirements, and design decisions |
