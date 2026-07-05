# 04 — Requirements in EARS / Given-When-Then Format

**Project:** Lumiq — Live Commerce Moment Vault  
**Document ID:** `04-requirements-ears.md`  
**Status:** Draft v1  
**Audience:** product, engineering, QA, AI coding agents  
**Source of truth relationship:** This document converts the PRD and glossary into structured, testable requirements.

---

## 1. Purpose

This document defines functional, non-functional, safety, security, and workflow requirements for Lumiq using structured requirement language.

The goal is to make implementation deterministic for humans and AI coding agents.

Every requirement should be:

- uniquely identified,
- testable,
- traceable to product behavior,
- specific enough to implement,
- clear enough to validate with acceptance tests.

---

## 2. Requirement Style

### 2.1 EARS-style patterns

This document uses structured patterns inspired by EARS:

#### Ubiquitous Requirement

Applies always.

```txt
The system shall ...
```

#### Event-driven Requirement

Triggered by an event.

```txt
When <event> occurs, the system shall ...
```

#### State-driven Requirement

Applies while in a state.

```txt
While <state/condition>, the system shall ...
```

#### Optional Feature Requirement

Applies if a feature is enabled.

```txt
Where <feature> is enabled, the system shall ...
```

#### Unwanted Behavior Requirement

Handles failures/invalid cases.

```txt
If <invalid condition>, the system shall ...
```

### 2.2 Acceptance Criteria Format

Each section includes acceptance criteria in Given/When/Then form.

```txt
Given <context>
When <action/event>
Then <expected result>
```

---

## 3. Actors

### Human Actors

```txt
Owner
Admin
Editor
Reviewer
Viewer
Host
```

### Service Actors

```txt
Core API
Mastra Agent Service
Capture Worker
Signal Extraction Worker
Genblaze Worker
QA Worker
Publish Worker
Provenance Verifier
Search Indexing Worker
Audit Worker
```

### Agent Actors

```txt
Supervisor Agent
Signal Agent
Product Matcher Agent
Clip Boundary Agent
Enhancement Planner Agent
Caption/Copy Agent
QA Agent
Provenance Agent
```

---

## 4. Requirement Priority

| Priority | Meaning |
|---|---|
| P0 | Required for hackathon core path |
| P1 | Required for production beta |
| P2 | Important but can follow after beta |
| P3 | Future/enterprise |

---

# 5. Authentication and Authorization Requirements

## REQ-AUTH-001 — Clerk Authentication

**Priority:** P0  
**Type:** Ubiquitous

The system shall authenticate human users through Clerk.

### Acceptance Criteria

```txt
Given an unauthenticated visitor
When they access the app workspace
Then the system redirects them to authentication.

Given an authenticated Clerk user
When they access the app workspace
Then the system maps their Clerk identity to an internal user record.
```

## REQ-AUTH-002 — Internal Authorization

**Priority:** P0  
**Type:** Ubiquitous

The system shall use internal organization membership, role, and capability records to authorize app actions.

### Acceptance Criteria

```txt
Given a Clerk-authenticated user
When they request a sensitive action
Then the system checks internal organization membership and capability before executing the action.
```

## REQ-AUTH-003 — Capability Checks

**Priority:** P0  
**Type:** Ubiquitous

The system shall check exact capabilities for sensitive actions.

Sensitive actions include:

```txt
session:create
session:end
moment:approve
generation:run
generation:rerun
publish:approve
asset:download_raw
asset:delete
retention:change
billing:manage
audit:view
admin:recover
```

### Acceptance Criteria

```txt
Given a user with reviewer role
When they request asset deletion
Then the system denies the request unless asset:delete is explicitly granted.
```

## REQ-AUTH-004 — Service Identity Authentication

**Priority:** P0  
**Type:** Ubiquitous

The system shall authenticate internal services and workers using service identities.

### Acceptance Criteria

```txt
Given a worker request to an internal endpoint
When the request lacks a valid service identity
Then the system rejects the request.

Given a valid service identity
When it calls an allowed internal endpoint
Then the system checks service capabilities before accepting the request.
```

## REQ-AUTH-005 — Tenant Isolation

**Priority:** P0  
**Type:** Ubiquitous

The system shall enforce organization scope on all user, agent, worker, API, event, asset, and query operations.

### Acceptance Criteria

```txt
Given a user belongs to organization A
When they request a moment from organization B
Then the system denies the request.

Given a B2 object key is created
When the key is generated
Then it starts with tenants/{organization_id}/.
```

---

# 6. Workspace and Navigation Requirements

## REQ-UI-001 — Unified Workspace

**Priority:** P0  
**Type:** Ubiquitous

The system shall provide a unified workspace containing sections for Studio, Vault, Review, Catalog, Campaigns, Templates, Analytics, Admin, and Settings.

### Acceptance Criteria

```txt
Given an authenticated user
When they open the app
Then the workspace shell displays available sections according to their capabilities.
```

## REQ-UI-002 — Role-based Section Visibility

**Priority:** P1  
**Type:** Ubiquitous

The system shall hide or disable workspace sections that the user is not authorized to access.

### Acceptance Criteria

```txt
Given a viewer without admin capabilities
When they open the workspace
Then Admin and Recovery sections are not accessible.
```

## REQ-UI-003 — Dark-only Interface

**Priority:** P0  
**Type:** Ubiquitous

The system shall render the core app in dark mode only.

### Acceptance Criteria

```txt
Given any app screen
When it renders
Then the screen uses the Lumiq dark design tokens and does not expose a light mode toggle.
```

---

# 7. Session and Ingestion Requirements

## REQ-SESSION-001 — Create Session

**Priority:** P0  
**Type:** Event-driven

When a user with `session:create` starts a new session, the system shall create a session record with state `created`.

### Acceptance Criteria

```txt
Given an editor has session:create capability
When they create a session
Then a session row exists with organization_id, source_type, state=created, and created_at.
```

## REQ-SESSION-002 — Browser-first Source

**Priority:** P0  
**Type:** Ubiquitous

The system shall support browser-based camera or prerecorded-live input as the canonical initial ingestion path.

### Acceptance Criteria

```txt
Given a user opens Live Studio
When they select browser camera or prerecorded-live source
Then the system can start a session using that source type.
```

## REQ-SESSION-003 — Source Adapter Contract

**Priority:** P1  
**Type:** Ubiquitous

The system shall normalize every ingestion source into the internal session contract.

The contract includes:

```txt
timestamped audio chunks
sampled frames
rolling video segments
source metadata
session markers
transcript chunks
optional transformed track
```

### Acceptance Criteria

```txt
Given any supported source adapter
When it emits session data
Then the emitted data conforms to the normalized session contract.
```

## REQ-SESSION-004 — Start Session

**Priority:** P0  
**Type:** Event-driven

When a valid session starts, the system shall transition the session state from `created` or `opening` to `live`.

### Acceptance Criteria

```txt
Given a session exists in created state
When the host starts the stream
Then the session state becomes live and a session.opened event is emitted.
```

## REQ-SESSION-005 — End Session

**Priority:** P0  
**Type:** Event-driven

When a host ends a live session, the system shall transition the session to `closing`, stop live capture, flush pending data, and then transition to `closed`.

### Acceptance Criteria

```txt
Given a live session
When the host ends the session
Then no new moments are authorized for capture and the session eventually becomes closed.
```

## REQ-SESSION-006 — Full Session Recording Optional

**Priority:** P1  
**Type:** Optional

Where full-session recording is enabled for an org/session, the system shall store the complete session recording as a session-level asset.

### Acceptance Criteria

```txt
Given full_session_recording_enabled=true
When the session ends
Then a full session recording asset exists or a failure is recorded.

Given full_session_recording_enabled=false
When the session ends
Then only authorized moment clips are stored by default.
```

---

# 8. Catalog and Product Grounding Requirements

## REQ-CATALOG-001 — Manual Product Creation

**Priority:** P0  
**Type:** Event-driven

When a user creates a product manually, the system shall store product records scoped to the organization.

### Acceptance Criteria

```txt
Given an editor opens Catalog
When they create a product with name and SKU
Then the product is stored with organization_id and product_id.
```

## REQ-CATALOG-002 — CSV Import

**Priority:** P1  
**Type:** Optional

Where CSV import is used, the system shall validate and import product records into the organization catalog.

### Acceptance Criteria

```txt
Given a CSV with valid product rows
When the user imports it
Then products are created or updated and import results are shown.
```

## REQ-CATALOG-003 — Catalog Snapshot Creation

**Priority:** P0  
**Type:** Event-driven

When a commerce-grounded session starts, the system shall create a catalog snapshot.

### Acceptance Criteria

```txt
Given a session is commerce-grounded
When the session starts
Then a catalog_snapshot_id is attached to the session.
```

## REQ-CATALOG-004 — B2 Snapshot Manifest

**Priority:** P0  
**Type:** Event-driven

When a catalog snapshot is created, the system shall write an immutable catalog snapshot manifest to B2.

### Acceptance Criteria

```txt
Given a catalog snapshot is created
When snapshot persistence completes
Then Postgres contains queryable snapshot rows and B2 contains catalog_snapshot.json.
```

## REQ-CATALOG-005 — Product Fact Grounding

**Priority:** P0  
**Type:** Ubiquitous

The system shall prevent generated overlays, captions, titles, and publish copy from using unverified product facts.

### Acceptance Criteria

```txt
Given an AI suggests "30% off"
When no active campaign offer supports the claim
Then the system rejects the claim or requires human correction.
```

## REQ-CATALOG-006 — Live Refresh Before Publish

**Priority:** P1  
**Type:** Event-driven

When an external publish action is requested, the system shall refresh critical product facts where an adapter supports refresh.

Critical facts include:

```txt
price
inventory
availability
offer validity
product URL
```

### Acceptance Criteria

```txt
Given a publish package contains a discount claim
When the offer has expired before publish
Then the system blocks auto-publish and requires human review.
```

---

# 9. Signal and Moment Detection Requirements

## REQ-SIGNAL-001 — Cheap Signal Detection

**Priority:** P0  
**Type:** State-driven

While a session is live, the system shall emit cheap detection signals for transcript keywords, product mentions, audio energy, scene changes, and manual markers where supported.

### Acceptance Criteria

```txt
Given a live session with transcript input
When the host mentions an offer keyword
Then the system emits a keyword or offer signal.
```

## REQ-SIGNAL-002 — Candidate Moment Proposal

**Priority:** P0  
**Type:** Event-driven

When sufficient signals occur within a time window, the system shall propose a candidate moment.

### Acceptance Criteria

```txt
Given product visibility and offer mention signals occur close together
When the candidate threshold is met
Then a moment.candidate.proposed event is emitted.
```

## REQ-SIGNAL-003 — AI Validation

**Priority:** P0  
**Type:** Event-driven

When a candidate moment is proposed, the Mastra agent service shall validate the candidate using available evidence and return structured output.

### Acceptance Criteria

```txt
Given a candidate moment with evidence refs
When the Supervisor Agent validates it
Then the response includes recommendation, confidence, reason, moment_type, and evidence_refs.
```

## REQ-SIGNAL-004 — Detector Cannot Capture Directly

**Priority:** P0  
**Type:** Ubiquitous

The system shall prevent detectors and agents from directly executing raw media capture.

### Acceptance Criteria

```txt
Given a Signal Agent proposes a moment
When capture is needed
Then the proposal must pass through MomentPolicyService before Capture Worker executes.
```

## REQ-SIGNAL-005 — Duplicate Candidate Handling

**Priority:** P0  
**Type:** Event-driven

When a candidate overlaps an existing candidate/moment within the duplicate window, the system shall deduplicate or suppress it according to policy.

### Acceptance Criteria

```txt
Given a candidate was captured 20 seconds ago
When a similar candidate is proposed within the duplicate window
Then the system suppresses or links it instead of creating a duplicate moment.
```

---

# 10. Capture Requirements

## REQ-CAPTURE-001 — Capture Authorization

**Priority:** P0  
**Type:** Event-driven

When a candidate passes score, duplicate, privacy, budget, retention, and session-cap checks, the system shall authorize raw capture.

### Acceptance Criteria

```txt
Given a candidate has score >= 0.90 and budget is available
When policy checks pass
Then a moment.capture.authorized event is emitted.
```

## REQ-CAPTURE-002 — Capture Denial

**Priority:** P0  
**Type:** Unwanted behavior

If capture policy checks fail, the system shall not capture raw media and shall record a policy decision.

### Acceptance Criteria

```txt
Given a candidate exceeds the session capture cap
When policy checks run
Then no capture is authorized and a rejection reason is stored.
```

## REQ-CAPTURE-003 — Generous Raw Capture Window

**Priority:** P0  
**Type:** Event-driven

When raw capture is authorized, the system shall capture a generous window around the candidate.

### Acceptance Criteria

```txt
Given a candidate from start_ms to end_ms
When capture is authorized
Then raw_capture_start_ms is earlier than start_ms where source buffer allows and raw_capture_end_ms is later than end_ms where source buffer allows.
```

## REQ-CAPTURE-004 — Raw Source Asset Write

**Priority:** P0  
**Type:** Event-driven

When the Capture Worker finalizes a raw clip, the system shall write a raw source asset to B2 and create an asset record in Postgres.

### Acceptance Criteria

```txt
Given capture is authorized
When the Capture Worker completes
Then a raw_source asset exists with bucket, object_key, bytes, sha256, and verification_status.
```

## REQ-CAPTURE-005 — Mezzanine Creation

**Priority:** P0  
**Type:** Event-driven

When a raw source asset is uploaded, the system shall create a normalized raw mezzanine asset where media processing succeeds.

### Acceptance Criteria

```txt
Given a raw_source asset exists
When media processing completes
Then a raw_mezzanine asset exists and is linked to the same moment.
```

## REQ-CAPTURE-006 — Live-transformed Capture

**Priority:** P1  
**Type:** Optional

Where live AI transform is audience-visible or lineage-relevant, the system shall capture the transformed segment for accepted/captured moments.

### Acceptance Criteria

```txt
Given live_transform_audience_visible=true
When a moment is captured
Then a live_transformed asset is stored or a failure is recorded.
```

---

# 11. Asset and B2 Storage Requirements

## REQ-ASSET-001 — B2 Canonical Media Storage

**Priority:** P0  
**Type:** Ubiquitous

The system shall store canonical media, manifests, catalog snapshots, evidence, and publish assets in Backblaze B2.

### Acceptance Criteria

```txt
Given a raw or generated asset is created
When persistence completes
Then the binary/object exists in B2 and a Postgres asset row references its bucket and object_key.
```

## REQ-ASSET-002 — Object Key Structure

**Priority:** P0  
**Type:** Ubiquitous

The system shall generate B2 object keys using organization, session, moment, run, and asset identifiers.

### Acceptance Criteria

```txt
Given an asset belongs to a moment
When its object key is generated
Then the key includes tenants/{organization_id}/sessions/{session_id}/moments/{moment_id}/.
```

## REQ-ASSET-003 — Immutable Canonical Objects

**Priority:** P0  
**Type:** Ubiquitous

The system shall never overwrite canonical asset objects.

### Acceptance Criteria

```txt
Given an enhanced master already exists
When a rerender is requested
Then a new asset object key is created instead of overwriting the old one.
```

## REQ-ASSET-004 — Checksums

**Priority:** P0  
**Type:** Ubiquitous

The system shall calculate and store SHA-256 checksums for all canonical assets and manifests.

### Acceptance Criteria

```txt
Given an asset upload completes
When verification runs
Then the system stores sha256 and marks verification_status accordingly.
```

## REQ-ASSET-005 — Upload Failure

**Priority:** P0  
**Type:** Unwanted behavior

If B2 upload fails, the system shall mark the relevant step failed, retry according to policy, and send the event to DLQ after retry exhaustion.

### Acceptance Criteria

```txt
Given B2 upload repeatedly fails
When retry budget is exhausted
Then the step is marked failed and an admin-recoverable DLQ record exists.
```

---

# 12. Mastra Agent Requirements

## REQ-AGENT-001 — Mastra Supervisor

**Priority:** P0  
**Type:** Ubiquitous

The system shall use a Mastra Supervisor Agent to coordinate specialist agent outputs for moment decisions.

### Acceptance Criteria

```txt
Given a candidate moment has evidence
When the Supervisor Agent runs
Then it returns a structured recommendation.
```

## REQ-AGENT-002 — Specialist Agents

**Priority:** P0  
**Type:** Ubiquitous

The system shall define specialist agents for moment detection, product matching, boundary selection, enhancement planning, caption/copy, QA, and provenance explanation.

### Acceptance Criteria

```txt
Given a workflow requires product matching
When the Supervisor Agent delegates
Then the Product Matcher Agent returns structured product match results.
```

## REQ-AGENT-003 — Gateway-only Tools

**Priority:** P0  
**Type:** Ubiquitous

The system shall require agents to use internal typed tool gateways for all side-effecting actions.

### Acceptance Criteria

```txt
Given an agent recommends capture
When it calls a tool
Then it calls propose_moment_candidate or equivalent gateway, not B2 or provider APIs directly.
```

## REQ-AGENT-004 — Tool Call Audit

**Priority:** P0  
**Type:** Event-driven

When an agent calls a tool, the system shall persist an agent_tool_call record with status, agent_id, tool_name, scope, idempotency_key, and trace_id.

### Acceptance Criteria

```txt
Given an agent tool call occurs
When the call completes
Then agent_tool_calls contains the input/output hashes and final status.
```

## REQ-AGENT-005 — Invalid Structured Output

**Priority:** P0  
**Type:** Unwanted behavior

If an agent returns invalid structured output, the system shall reject the output and either retry or escalate according to policy.

### Acceptance Criteria

```txt
Given the Product Matcher Agent returns malformed JSON
When schema validation runs
Then the output is rejected and no downstream side effect occurs.
```

## REQ-AGENT-006 — Agent Memory Scope

**Priority:** P1  
**Type:** Ubiquitous

The system shall scope agent memory by organization and optionally by campaign/session.

### Acceptance Criteria

```txt
Given organization A has brand memory
When an agent runs for organization B
Then organization A memory is not available.
```

---

# 13. LLM Provider Requirements

## REQ-LLM-001 — LLMProviderRouter

**Priority:** P0  
**Type:** Ubiquitous

The system shall route LLM calls through an internal LLMProviderRouter.

### Acceptance Criteria

```txt
Given an agent requests a supervisor_decision task
When it needs an LLM call
Then the model/provider is selected by LLMProviderRouter, not hardcoded inside the agent.
```

## REQ-LLM-002 — OpenAI Primary

**Priority:** P0  
**Type:** Ubiquitous

The system shall support OpenAI as the primary LLM provider for the hackathon implementation.

### Acceptance Criteria

```txt
Given OpenAI credentials are configured
When a Mastra agent runs
Then it can complete a structured-output task through OpenAI.
```

## REQ-LLM-003 — LLM Run Records

**Priority:** P0  
**Type:** Event-driven

When an LLM call is made, the system shall create an `llm_runs` record.

### Acceptance Criteria

```txt
Given a Caption Agent generates copy
When the LLM call completes
Then llm_runs records provider, model, task_type, status, token counts where available, and cost estimate.
```

## REQ-LLM-004 — LLM Budget Checks

**Priority:** P1  
**Type:** Event-driven

Before an expensive LLM call, the system shall check relevant LLM budget policy.

### Acceptance Criteria

```txt
Given an org has exhausted its LLM budget
When an agent requests a non-critical QA explanation
Then the system denies or queues the call according to policy.
```

## REQ-LLM-005 — No Raw Prompt Logging

**Priority:** P0  
**Type:** Ubiquitous

The system shall not write full raw prompts or full raw model outputs to normal application logs.

### Acceptance Criteria

```txt
Given an LLM call occurs
When logs are emitted
Then logs contain IDs/hashes/statuses and not full prompt text.
```

---

# 14. Genblaze and Media Generation Requirements

## REQ-GEN-001 — Genblaze Worker

**Priority:** P0  
**Type:** Event-driven

When `generation.requested` is emitted, the Genblaze Worker shall execute the approved media pipeline.

### Acceptance Criteria

```txt
Given a generation.requested event
When the Genblaze Worker consumes it
Then it loads the input asset, template, provider policy, and budget authorization before executing.
```

## REQ-GEN-002 — Genblaze Output Storage

**Priority:** P0  
**Type:** Event-driven

When a Genblaze pipeline completes, the system shall store generated outputs and manifests in B2.

### Acceptance Criteria

```txt
Given a successful enhancement run
When the Genblaze Worker finishes
Then an enhanced_master asset and manifest asset exist in B2 and Postgres.
```

## REQ-GEN-003 — Generation Run State

**Priority:** P0  
**Type:** Ubiquitous

The system shall track generation run states through the allowed state machine.

Allowed states:

```txt
queued
running
provider_pending
completed
failed
cancelled
reconciled
```

### Acceptance Criteria

```txt
Given a generation run is queued
When a worker starts it
Then the state becomes running.
```

## REQ-GEN-004 — Policy-based Provider Fallback

**Priority:** P1  
**Type:** Unwanted behavior

If a provider fails, the system shall use fallback only when the template, provider policy, product-safety policy, and budget allow it.

### Acceptance Criteria

```txt
Given Decart fails and fallback_allowed=false
When the generation run handles failure
Then the run is marked failed and no fallback provider is called.
```

## REQ-GEN-005 — Rerender Creates New Version

**Priority:** P0  
**Type:** Event-driven

When a reviewer requests rerender, the system shall create a new generation run and output version without overwriting prior assets.

### Acceptance Criteria

```txt
Given enhanced_master_v1 exists
When the reviewer rerenders
Then enhanced_master_v2 is created with a distinct asset_id and object_key.
```

---

# 15. Template and Step Graph Requirements

## REQ-TEMPLATE-001 — Versioned Templates

**Priority:** P0  
**Type:** Ubiquitous

The system shall store enhancement templates as versioned configuration records.

### Acceptance Criteria

```txt
Given clean_product_reveal_v1 is used for a generation run
When the run is recorded
Then template_id and template_version are stored.
```

## REQ-TEMPLATE-002 — Safe Step Registry

**Priority:** P0  
**Type:** Ubiquitous

The system shall execute only code-defined, safe-listed step types.

### Acceptance Criteria

```txt
Given a template references an unknown step type
When validation runs
Then the template is rejected and cannot execute.
```

## REQ-TEMPLATE-003 — No Arbitrary Shell Commands

**Priority:** P0  
**Type:** Unwanted behavior

The system shall reject templates containing arbitrary shell commands, arbitrary ffmpeg strings, or user-defined executable code.

### Acceptance Criteria

```txt
Given a template includes an arbitrary shell command
When validation runs
Then the system rejects the template.
```

## REQ-TEMPLATE-004 — Controlled Prompt Slots

**Priority:** P1  
**Type:** Ubiquitous

The system shall allow user prompt input only through controlled prompt slots.

### Acceptance Criteria

```txt
Given a user enters overlay copy
When the template uses it
Then the input is length-limited, moderated, schema-validated, and stored in provenance.
```

---

# 16. QA and Moderation Requirements

## REQ-QA-001 — Pre-enhancement QA

**Priority:** P0  
**Type:** Event-driven

Before enhancement begins, the system shall run pre-enhancement QA checks.

### Acceptance Criteria

```txt
Given a moment is ready for enhancement
When pre-enhancement QA runs
Then raw usability, product match, claim grounding, template policy, and budget policy are checked.
```

## REQ-QA-002 — Post-enhancement QA

**Priority:** P0  
**Type:** Event-driven

After an enhanced asset is generated, the system shall run post-enhancement QA.

### Acceptance Criteria

```txt
Given an enhanced master asset exists
When QA runs
Then it checks render success, caption alignment, product appearance, overlay facts, and quality score.
```

## REQ-QA-003 — Pre-publish QA

**Priority:** P0  
**Type:** Event-driven

Before publishing, the system shall run pre-publish QA.

### Acceptance Criteria

```txt
Given a publish package is requested
When pre-publish QA runs
Then product facts, approval, destination package validity, labels, and moderation status are checked.
```

## REQ-QA-004 — Failure Classification

**Priority:** P0  
**Type:** Ubiquitous

The system shall classify QA failures as retryable, remediable, review_required, or terminal.

### Acceptance Criteria

```txt
Given caption timing drift is detected
When QA classifies the failure
Then the failure_class is remediable.
```

## REQ-QA-005 — Product Appearance Integrity

**Priority:** P0  
**Type:** Ubiquitous

The system shall prevent AI restyling from materially misrepresenting product appearance unless explicitly labeled and approved.

### Acceptance Criteria

```txt
Given AI restyle changes product color
When QA detects the change
Then the system blocks publish or requires human review and labeling.
```

---

# 17. Review and Approval Requirements

## REQ-REVIEW-001 — Review Queue

**Priority:** P0  
**Type:** Event-driven

When a moment is ready for human review, the system shall show it in the Review Queue.

### Acceptance Criteria

```txt
Given a moment reaches review_pending
When a reviewer opens the queue
Then the moment appears with media preview, evidence, QA status, and actions.
```

## REQ-REVIEW-002 — Session Timeline Review

**Priority:** P0  
**Type:** Ubiquitous

The system shall provide a session timeline view showing detected moments, signal markers, accepted/rejected states, and transcript snippets where available.

### Acceptance Criteria

```txt
Given a session has moments and signals
When a reviewer opens the session timeline
Then markers and moment states are visible.
```

## REQ-REVIEW-003 — Raw vs Enhanced Compare

**Priority:** P0  
**Type:** Ubiquitous

The system shall allow reviewers to compare raw source and enhanced master outputs.

### Acceptance Criteria

```txt
Given a moment has raw_source and enhanced_master assets
When the reviewer opens the moment
Then the UI provides raw/enhanced comparison.
```

## REQ-REVIEW-004 — Controlled Edit

**Priority:** P1  
**Type:** Optional

Where controlled editing is available, reviewers shall be able to adjust approved fields only.

Allowed fields:

```txt
trim boundaries
template choice
caption text
hook/title
product card visibility
destination variants
AI restyle toggle where policy allows
```

### Acceptance Criteria

```txt
Given a reviewer edits a hook title
When they request rerender
Then the system validates claims and creates a new generation run.
```

## REQ-REVIEW-005 — Canonical Promotion

**Priority:** P0  
**Type:** Event-driven

When a reviewer approves a version as canonical, the system shall promote it through the state machine.

### Acceptance Criteria

```txt
Given multiple enhanced versions exist
When a reviewer promotes version 2
Then version 2 becomes canonical and version 1 remains stored but non-canonical.
```

---

# 18. Publishing Requirements

## REQ-PUBLISH-001 — Publish Package Creation

**Priority:** P0  
**Type:** Event-driven

When a canonical enhanced master is approved for publishing, the system shall create a publish package.

### Acceptance Criteria

```txt
Given a canonical enhanced master exists
When publish package creation is requested
Then the package includes media, thumbnail, captions, title, product links, and provenance reference.
```

## REQ-PUBLISH-002 — Human Approval Default

**Priority:** P0  
**Type:** Ubiquitous

The system shall require human approval before external publishing unless explicit organization auto-publish policy allows otherwise.

### Acceptance Criteria

```txt
Given no auto-publish policy exists
When a publish package is ready
Then the system waits for human approval before external publish.
```

## REQ-PUBLISH-003 — Publish Adapters

**Priority:** P1  
**Type:** Ubiquitous

The system shall treat external destinations as publish adapters, not as sources of truth.

### Acceptance Criteria

```txt
Given a publish package is sent to a destination adapter
When delivery completes
Then the Lumiq publish package remains the canonical record.
```

## REQ-PUBLISH-004 — Share Page

**Priority:** P0  
**Type:** Event-driven

When a share page is created, the system shall generate a share_slug and render a page for the publish package according to visibility policy.

### Acceptance Criteria

```txt
Given a private share page is created
When an unauthorized user opens it
Then access is denied.
```

## REQ-PUBLISH-005 — Revocation

**Priority:** P1  
**Type:** Event-driven

When a share page or publish package is revoked, the system shall remove public access without deleting canonical assets unless deletion is requested.

### Acceptance Criteria

```txt
Given a share page is public
When an admin revokes it
Then the share URL no longer serves the asset.
```

---

# 19. Provenance and Manifest Requirements

## REQ-PROV-001 — Dual-source Provenance

**Priority:** P0  
**Type:** Ubiquitous

The system shall maintain queryable provenance in Postgres and immutable manifest records in B2.

### Acceptance Criteria

```txt
Given an enhanced master is generated
When persistence completes
Then Postgres contains provenance links and B2 contains a provenance manifest.
```

## REQ-PROV-002 — Lineage Chain

**Priority:** P0  
**Type:** Ubiquitous

The system shall expose lineage from raw source to publish package for every generated/published clip.

### Acceptance Criteria

```txt
Given a published clip
When a reviewer opens provenance
Then the UI shows raw source, generation run, enhanced master, and publish variant/package.
```

## REQ-PROV-003 — Manifest Fields

**Priority:** P0  
**Type:** Ubiquitous

The system shall include essential lineage fields in app-level provenance manifests.

Required fields include:

```txt
schema_version
manifest_id
organization_id
session_id
moment_id
asset_id
run_id
parent_run_id
source_asset_ids
derived_asset_ids
provider
model
template_id
input_sha256
output_sha256
created_at
b2_object_keys
```

### Acceptance Criteria

```txt
Given a provenance manifest is written
When schema validation runs
Then all required fields are present.
```

## REQ-PROV-004 — Provenance UI

**Priority:** P0  
**Type:** Ubiquitous

The system shall provide a visual lineage chain or graph for generated moments.

### Acceptance Criteria

```txt
Given a moment has generated outputs
When the user opens details
Then the UI displays a compact chain and a detailed provenance panel.
```

---

# 20. Search and Retrieval Requirements

## REQ-SEARCH-001 — Structured Search

**Priority:** P0  
**Type:** Ubiquitous

The system shall support structured filtering over sessions, moments, assets, products, campaigns, status, QA, templates, and publish state.

### Acceptance Criteria

```txt
Given moments exist across multiple sessions
When the user filters by product_id and status
Then matching moments are returned.
```

## REQ-SEARCH-002 — Semantic Search

**Priority:** P1  
**Type:** Optional

Where embeddings exist, the system shall support semantic search across accepted/captured moments.

### Acceptance Criteria

```txt
Given accepted moments have embeddings
When the user searches "host mentions discount"
Then semantically relevant moments are returned.
```

## REQ-SEARCH-003 — Tiered Embeddings

**Priority:** P1  
**Type:** Ubiquitous

The system shall generate full embeddings for accepted/captured moments and avoid embedding low-confidence/noisy signals by default.

### Acceptance Criteria

```txt
Given a low-confidence rejected signal
When indexing runs
Then no full embedding is created unless debug sampling is enabled.
```

---

# 21. Budget and Cost Requirements

## REQ-COST-001 — Media Generation Budget

**Priority:** P0  
**Type:** Event-driven

Before media generation starts, the system shall estimate cost and check applicable budgets.

### Acceptance Criteria

```txt
Given a generation request
When budget is insufficient
Then generation is denied or queued according to policy.
```

## REQ-COST-002 — LLM Budget

**Priority:** P1  
**Type:** Event-driven

Before non-trivial LLM tasks, the system shall check LLM budget policy.

### Acceptance Criteria

```txt
Given org_monthly_llm_budget is exhausted
When an agent requests caption generation
Then the call is denied or requires approval.
```

## REQ-COST-003 — Cost Reconciliation

**Priority:** P1  
**Type:** Event-driven

After provider calls complete, the system shall reconcile estimated and actual costs where actual cost data is available.

### Acceptance Criteria

```txt
Given a provider returns actual usage
When the run completes
Then cost_ledger stores actual_cost_usd.
```

## REQ-COST-004 — Budget Visibility

**Priority:** P1  
**Type:** Ubiquitous

The system shall expose budget and cost status in Live Studio and Admin views.

### Acceptance Criteria

```txt
Given a session is live
When auto-enhancement budget is near its cap
Then the UI shows a warning state.
```

---

# 22. Event and Workflow Requirements

## REQ-EVENT-001 — Typed Event Envelope

**Priority:** P0  
**Type:** Ubiquitous

All NATS events shall use the standard event envelope.

### Acceptance Criteria

```txt
Given any event is emitted
When schema validation runs
Then event_id, event_type, schema_version, organization_id, occurred_at, producer, idempotency_key, correlation_id, trace_id, and payload exist.
```

## REQ-EVENT-002 — Versioned Event Schemas

**Priority:** P0  
**Type:** Ubiquitous

The system shall version every event schema.

### Acceptance Criteria

```txt
Given a consumer receives an event
When it parses the event
Then it uses schema_version to validate the payload.
```

## REQ-EVENT-003 — Stable NATS Subjects

**Priority:** P0  
**Type:** Ubiquitous

The system shall use stable domain-specific NATS subjects and keep organization/session IDs inside payloads.

### Acceptance Criteria

```txt
Given a moment capture is authorized
When the event is emitted
Then the subject is moment.capture.authorized and organization_id is inside the event payload/envelope.
```

## REQ-EVENT-004 — Idempotent Consumers

**Priority:** P0  
**Type:** Ubiquitous

Workers shall be idempotent and shall not produce duplicate side effects for duplicate events.

### Acceptance Criteria

```txt
Given the same generation.requested event is delivered twice
When the Genblaze Worker handles both deliveries
Then only one generation run side effect is created.
```

## REQ-EVENT-005 — Dead-letter Handling

**Priority:** P0  
**Type:** Unwanted behavior

If an event cannot be processed after retry budget is exhausted, the system shall write it to a DLQ and expose it in the recovery console.

### Acceptance Criteria

```txt
Given a worker fails repeatedly on an event
When retries are exhausted
Then the event appears in the DLQ and can be inspected by an admin.
```

---

# 23. Audit and Observability Requirements

## REQ-AUDIT-001 — Full Action Audit

**Priority:** P0  
**Type:** Ubiquitous

The system shall audit every meaningful state transition, sensitive action, agent tool call, provider call, asset write, approval, publish, deletion, and policy decision.

### Acceptance Criteria

```txt
Given a reviewer approves a moment
When the approval succeeds
Then an audit_event exists with actor, action, before_state, after_state, moment_id, and trace_id.
```

## REQ-AUDIT-002 — Trace Correlation

**Priority:** P0  
**Type:** Ubiquitous

The system shall correlate API, agent, event, worker, provider, and B2 operations using trace_id and correlation_id.

### Acceptance Criteria

```txt
Given a moment is generated
When an admin inspects the run
Then related API calls, events, worker logs, provider calls, and asset writes share trace/correlation context.
```

## REQ-AUDIT-003 — Redacted Logs

**Priority:** P0  
**Type:** Ubiquitous

The system shall avoid logging raw transcripts, raw prompts, raw model outputs, and sensitive customer data in normal logs.

### Acceptance Criteria

```txt
Given a transcript excerpt is used for QA
When logs are emitted
Then logs reference transcript_excerpt_id instead of full text.
```

## REQ-AUDIT-004 — Operational Metrics

**Priority:** P1  
**Type:** Ubiquitous

The system shall collect operational metrics for capture success, generation success, provider failure, B2 upload failure, DLQ rate, QA failure, and cost per clip.

### Acceptance Criteria

```txt
Given system metrics are enabled
When generation runs complete
Then dashboard data can show generation success rate and cost per accepted clip.
```

---

# 24. Retention, Deletion, and Export Requirements

## REQ-RETENTION-001 — Tiered Retention

**Priority:** P1  
**Type:** Ubiquitous

The system shall support tiered retention for raw, mezzanine, enhanced, published, transcript, evidence, audit, and provenance assets.

### Acceptance Criteria

```txt
Given raw_source retention is 90 days
When the retention window expires
Then the asset becomes eligible for deletion according to policy.
```

## REQ-RETENTION-002 — Soft Delete First

**Priority:** P0  
**Type:** Event-driven

When a user deletes a moment or asset, the system shall soft delete it before physical deletion unless policy requires immediate hard delete.

### Acceptance Criteria

```txt
Given a user deletes a moment
When deletion is accepted
Then the moment disappears from normal UI/search and physical deletion is scheduled.
```

## REQ-RETENTION-003 — Share Link Revocation

**Priority:** P0  
**Type:** Event-driven

When a published/share asset is deleted or revoked, the system shall revoke public access.

### Acceptance Criteria

```txt
Given a share page exists
When the publish package is revoked
Then the share page no longer serves the media.
```

## REQ-RETENTION-004 — Data Export

**Priority:** P1  
**Type:** Event-driven

When an authorized user requests export, the system shall generate an export package containing allowed organization/session/moment data and asset manifests.

### Acceptance Criteria

```txt
Given an owner requests data export
When export completes
Then the package includes sessions, moments, assets manifest, generation runs, provenance links, catalog snapshots, and audit summary where allowed.
```

---

# 25. Security and AI Safety Requirements

## REQ-SEC-001 — No Direct Agent Secrets

**Priority:** P0  
**Type:** Ubiquitous

The system shall not expose raw B2 credentials, provider API keys, database write access, or publish/delete privileges to agents.

### Acceptance Criteria

```txt
Given an agent runs
When it needs an action
Then it calls an internal tool gateway instead of using direct credentials.
```

## REQ-SEC-002 — Prompt Injection Resistance

**Priority:** P1  
**Type:** Ubiquitous

The system shall treat user-provided prompts, transcripts, product copy, and media-derived text as untrusted input.

### Acceptance Criteria

```txt
Given transcript text contains "ignore all previous instructions"
When an agent processes it
Then the instruction is treated as content, not a system command.
```

## REQ-SEC-003 — Tool Permission Boundaries

**Priority:** P0  
**Type:** Ubiquitous

Agent tools shall have narrow schemas and capability requirements.

### Acceptance Criteria

```txt
Given a Caption Agent tool call attempts to request asset deletion
When schema validation runs
Then the request is rejected because the tool schema does not allow deletion.
```

## REQ-SEC-004 — Human Approval for Sensitive Actions

**Priority:** P0  
**Type:** Ubiquitous

The system shall require human approval by default for external publish, hard delete, product fact override, major AI restyle, retention policy change, and billing cap increase.

### Acceptance Criteria

```txt
Given an agent recommends major AI restyle
When policy requires approval
Then the system waits for human approval before proceeding.
```

---

# 26. Admin and Recovery Requirements

## REQ-ADMIN-001 — Recovery Console

**Priority:** P1  
**Type:** Ubiquitous

The system shall provide an admin recovery console for DLQ events, stuck moments, failed runs, B2 reconciliation, provider failures, and budget anomalies.

### Acceptance Criteria

```txt
Given an event is in DLQ
When an admin opens recovery console
Then they can inspect the event, error, trace_id, and retry options.
```

## REQ-ADMIN-002 — Manual Replay

**Priority:** P1  
**Type:** Event-driven

When an admin manually replays a failed event, the system shall audit the action and preserve idempotency.

### Acceptance Criteria

```txt
Given a failed generation event exists
When an admin clicks replay
Then an audit event is written and duplicate side effects are prevented.
```

## REQ-ADMIN-003 — B2 Reconciliation

**Priority:** P1  
**Type:** Ubiquitous

The system shall support reconciliation between Postgres asset records and B2 objects/manifests.

### Acceptance Criteria

```txt
Given an asset row references a missing B2 object
When reconciliation runs
Then the system records an anomaly and exposes it in Admin.
```

---

# 27. Design System Requirements

## REQ-DESIGN-001 — Lumiq Tokens

**Priority:** P0  
**Type:** Ubiquitous

The UI shall use Lumiq design tokens from `DESIGN.md`, `tokens.json`, `theme.css`, and `variables.css`.

### Acceptance Criteria

```txt
Given a new component is implemented
When design review runs
Then it uses approved colors, spacing, radius, typography, and semantic variables.
```

## REQ-DESIGN-002 — No Glow Gradients

**Priority:** P0  
**Type:** Ubiquitous

The UI shall not use glowing, blurred, aura, or neon gradients.

### Acceptance Criteria

```txt
Given a selected AI-active card
When it renders
Then it may use a flat gradient hairline but not a glow or blurred gradient.
```

## REQ-DESIGN-003 — Dark-only Core App

**Priority:** P0  
**Type:** Ubiquitous

The core workspace shall be dark-only.

### Acceptance Criteria

```txt
Given any authenticated app route
When it renders
Then it uses the dark Lumiq theme and does not expose a light-mode switch.
```

## REQ-DESIGN-004 — Reduced Motion

**Priority:** P1  
**Type:** Ubiquitous

The UI shall support reduced-motion behavior for pulses, loading loops, and panel transitions.

### Acceptance Criteria

```txt
Given prefers-reduced-motion is enabled
When Live Studio displays detected markers
Then animation is replaced by static state indicators.
```

---

# 28. Hackathon End-to-End Requirements

## REQ-DEMO-001 — Demo Session

**Priority:** P0  
**Type:** Ubiquitous

The hackathon demo shall support a controlled live or prerecorded-live session.

### Acceptance Criteria

```txt
Given the demo environment is opened
When the user starts the demo session
Then Live Studio shows video input and session status.
```

## REQ-DEMO-002 — Moment Detection Demo

**Priority:** P0  
**Type:** Event-driven

When the demo product reveal occurs, the system shall detect or simulate a candidate moment and show it in the UI.

### Acceptance Criteria

```txt
Given the demo video reaches the product reveal
When the signal threshold is met
Then a candidate moment appears in the signal feed or timeline.
```

## REQ-DEMO-003 — Mastra Recommendation Visible

**Priority:** P0  
**Type:** Event-driven

When the candidate moment is validated, the demo shall show the Mastra agent recommendation.

### Acceptance Criteria

```txt
Given a candidate is proposed
When Mastra validation completes
Then the UI can show recommendation, confidence, moment type, and reason.
```

## REQ-DEMO-004 — B2 Storage Visible

**Priority:** P0  
**Type:** Event-driven

When raw and generated assets are created, the demo shall show B2-backed object references or manifest paths.

### Acceptance Criteria

```txt
Given raw/enhanced assets exist
When the reviewer opens provenance
Then B2 object keys or manifest references are visible.
```

## REQ-DEMO-005 — Genblaze Usage Visible

**Priority:** P0  
**Type:** Event-driven

When enhancement completes, the demo shall show a Genblaze generation run or manifest reference.

### Acceptance Criteria

```txt
Given an enhanced clip is generated
When provenance details are opened
Then the Genblaze run and generated output are visible.
```

## REQ-DEMO-006 — Provenance Graph

**Priority:** P0  
**Type:** Ubiquitous

The demo shall show a visual lineage from raw source to enhanced output to publish package.

### Acceptance Criteria

```txt
Given the publish package exists
When provenance graph is opened
Then it shows raw source → Genblaze run → enhanced master → publish package.
```

---

# 29. Non-functional Requirements

## REQ-NFR-001 — Reliability

**Priority:** P1  
**Type:** Ubiquitous

The system shall preserve raw captured assets and manifests even if downstream generation fails.

### Acceptance Criteria

```txt
Given raw capture succeeds and generation fails
When the moment is opened
Then raw asset and failure status remain available.
```

## REQ-NFR-002 — Latency Visibility

**Priority:** P1  
**Type:** Ubiquitous

The system shall show user-visible progress for long-running generation, QA, and publishing steps.

### Acceptance Criteria

```txt
Given an enhancement run is active
When the user views the moment
Then the UI shows the current step and status.
```

## REQ-NFR-003 — Scalability Boundary

**Priority:** P1  
**Type:** Ubiquitous

The system shall support independent scaling of Core API, Mastra Agent Service, Capture Worker, Genblaze Worker, QA Worker, and Publish Worker.

### Acceptance Criteria

```txt
Given generation workload increases
When workers scale
Then Genblaze Worker can scale without scaling the Core API.
```

## REQ-NFR-004 — Data Integrity

**Priority:** P0  
**Type:** Ubiquitous

The system shall maintain consistency between Postgres asset records, B2 objects, and provenance manifests.

### Acceptance Criteria

```txt
Given an asset is marked verified
When reconciliation runs
Then the corresponding B2 object and checksum match the asset record.
```

## REQ-NFR-005 — Accessibility

**Priority:** P1  
**Type:** Ubiquitous

The system shall provide accessible labels, keyboard navigation, focus rings, and non-color-only status indicators.

### Acceptance Criteria

```txt
Given a status chip uses color
When viewed by a user relying on text
Then the status is also represented by label text or icon.
```

---

# 30. Implementation Traceability

Every implemented feature should map to:

```txt
requirement_id
source spec
API contract if applicable
event contract if applicable
database tables if applicable
test cases
```

Coding agents must not implement major behavior that lacks a requirement ID unless explicitly instructed.

---

# 31. Requirement Coverage Checklist

Before implementation begins, ensure the following are covered:

```txt
[ ] Auth and org authorization
[ ] Live/prerecorded session path
[ ] Moment detection and candidate proposal
[ ] Mastra agent validation
[ ] Capture policy and raw B2 upload
[ ] Genblaze generation run
[ ] Asset records and manifests
[ ] QA gates
[ ] Review queue
[ ] Canonical promotion
[ ] Publish package
[ ] Share page
[ ] Provenance graph
[ ] Audit logs
[ ] DLQ/recovery
[ ] Design tokens
[ ] Hackathon demo path
```
