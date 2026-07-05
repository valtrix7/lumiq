# 03 — Glossary & Domain Language

**Project:** Lumiq — Live Commerce Moment Vault  
**Document ID:** `03-glossary-domain-language.md`  
**Status:** Draft v1  
**Audience:** product, design, engineering, AI coding agents, QA, demo builders  
**Source of truth relationship:** This glossary defines the shared vocabulary used by the PRD, requirements, database schema, API contracts, event contracts, agent specs, storage specs, and implementation tasks.

---

## 1. Purpose

This document defines the domain language for Lumiq. It exists to prevent ambiguity when humans or coding agents implement the system.

Lumiq is a live-commerce AI media platform. It detects valuable moments inside live or prerecorded-live sessions, captures raw evidence, generates polished clips through Genblaze, and stores every source/output/manifest in Backblaze B2 with durable provenance.

Because the system crosses many domains — livestreaming, AI agents, media processing, product catalogs, event-driven workflows, storage lineage, review/publishing, and auditability — precise vocabulary is mandatory.

When there is a conflict between casual language and this document, this document wins.

---

## 2. Ubiquitous Language Rules

### 2.1 Use exact domain terms

Use:

- `session`, not “stream thing”
- `moment`, not “clip” when referring to the selected time interval
- `asset`, not “file” when referring to a tracked media/object record
- `generation_run`, not “AI job” when referring to a durable Genblaze/provider execution
- `publish_package`, not “export” when referring to the canonical output package
- `catalog_snapshot`, not “product data” when referring to the frozen product facts used during a session
- `provenance_manifest`, not “metadata JSON” when referring to lineage proof

### 2.2 Avoid overloaded words

The word **clip** is ambiguous. It can mean:

1. the raw captured segment,
2. the enhanced master,
3. the published output,
4. a video file,
5. a moment interval.

Prefer precise terms:

```txt
raw_source_asset
raw_mezzanine_asset
enhanced_master_asset
publish_variant_asset
moment
publish_package
```

### 2.3 Domain objects should have stable IDs

Every important object should have a stable ID:

```txt
organization_id
user_id
session_id
moment_id
asset_id
generation_run_id
manifest_id
catalog_snapshot_id
publish_package_id
agent_tool_call_id
llm_run_id
audit_event_id
```

Lumiq should use ULIDs for most primary IDs and short slugs for public share URLs.

### 2.4 Human-readable labels are not identifiers

A product name, session title, template name, or campaign name can change. IDs must not change.

---

## 3. Core Product Terms

### Lumiq

The app/product name. Lumiq is the AI media operations platform being built.

Visual meaning: luminous + unique + premium AI intelligence.

Product meaning: a system that finds valuable live-commerce moments and turns them into traceable media assets.

### Live Commerce Moment Vault

The product category and project concept. A system that captures, enhances, stores, and traces live-commerce sales moments.

### Workspace

The main authenticated app environment where users access Live Studio, Moment Vault, Review Queue, Catalog, Campaigns, Templates, Analytics, Admin, and Settings.

### Organization

A tenant/account representing a brand, seller, agency, or company.

An organization owns:

```txt
users
memberships
sessions
products
campaigns
moments
assets
generation_runs
catalog_snapshots
publish_packages
budgets
agent_memory_records
audit_events
```

### User

A human authenticated through Clerk and mirrored into Lumiq’s internal database.

### Member

A user belonging to an organization.

### Role

A coarse permission grouping assigned to an organization member.

Base roles:

```txt
owner
admin
editor
reviewer
viewer
```

### Capability

A specific action permission checked by the backend.

Examples:

```txt
session:create
moment:approve
generation:run
publish:approve
asset:download_raw
asset:delete
retention:change
billing:manage
audit:view
```

Roles grant default capability sets, but every sensitive command must check the exact capability.

### Service Identity

A non-human identity used by backend services, workers, and agents.

Examples:

```txt
mastra-agent-service
capture-worker
genblaze-worker
publish-worker
provenance-verifier
audit-worker
```

Service identities must be scoped and audited.

---

## 4. Live Session & Ingestion Terms

### Session

A live or prerecorded-live commerce event in Lumiq.

A session may come from:

```txt
browser camera
screen share
uploaded prerecorded video
prerecorded-live simulator
future OBS/RTMP adapter
future external livestream adapter
```

A session owns candidate moments, raw captures, transformed outputs, transcript chunks, catalog snapshots, and review context.

### Live Studio

The workspace screen where a user starts or monitors a session.

Live Studio includes:

```txt
source preview
live status
right-side signal feed
candidate moment feed
product/campaign context
budget indicators
bottom timeline
connection health
optional live-transformed preview
```

### Source Adapter

A module that normalizes an input source into Lumiq’s internal session contract.

Examples:

```txt
browser_camera_adapter
screen_share_adapter
upload_prerecorded_adapter
obs_rtmp_adapter
external_livestream_adapter
```

All adapters must produce normalized session data:

```txt
timestamped audio chunks
sampled frames
rolling video segments
source metadata
session markers
transcript chunks
optional transformed track
```

### Browser-first Canonical Path

The primary ingestion path for the first implementation: user streams or simulates live video inside Lumiq’s browser app.

The architecture may later support OBS/RTMP and external streams, but browser-first defines the canonical session model.

### Prerecorded-live

An uploaded video played through the Live Studio as if it were live. Used for reliable demos and testing.

### Full Session Recording

A mode where the entire session is stored as a session-level asset.

Default behavior is **moment-only storage**. Full session recording is optional and requires explicit org/session policy.

### Source Track

A track within a session.

Common source tracks:

```txt
raw_input
live_transformed
mixed_room
screen_share
audio_only
```

### Raw Source

The original unenhanced video/audio segment captured from the host/session input.

### Live-transformed Output

A version of the session stream that has been transformed in realtime by a provider such as Decart.

It is stored only when audience-visible or lineage-relevant.

### Audience-visible Transform

A live AI transformation that viewers actually saw during the session.

If the audience-visible transform affects a captured moment, Lumiq should store the transformed segment as part of provenance.

---

## 5. Moment Terms

### Moment

A meaningful time interval within a session.

A moment is not automatically a file. It is a domain object with:

```txt
moment_id
session_id
start_ms
end_ms
score
reason
state
evidence
raw capture window
associated assets
generation runs
review state
publish state
```

### Candidate Moment

A proposed moment detected by cheap signals and/or AI validation.

A candidate is not yet necessarily captured or enhanced.

### Accepted Moment

A moment approved by policy or a human for capture, enhancement, or review.

### Captured Moment

A moment whose raw source segment has been captured and written to B2.

### Raw Capture Window

A generous source interval captured around a candidate moment.

Example:

```txt
candidate detected at 00:14:32
raw capture window: 00:14:12 → 00:14:52
```

### Final Trim

The tighter interval used for the enhanced master or publishable clip.

Example:

```txt
final trim: 00:14:21 → 00:14:39
```

### Moment Type

The detected commercial/creative category.

Examples:

```txt
product_reveal
offer_mention
try_on
feature_demo
host_reaction
before_after
limited_stock_cta
unknown
```

### Moment Score

A normalized score indicating how likely a candidate is to be worth capturing, enhancing, or reviewing.

The score may combine:

```txt
product_visible_score
product_name_mentioned_score
price_or_discount_score
host_energy_score
CTA_score
visual_change_score
chat_spike_score
duplicate_penalty
budget_policy_status
```

### Duplicate Window

A time range used to avoid creating multiple moments for the same live event.

Example:

```txt
duplicate_moment_window = 30–60 seconds
```

### Signal

A low-level observation emitted by a detector.

Examples:

```txt
product_visible
keyword_hit
offer_mention
audio_energy_peak
scene_change
manual_marker
chat_spike
```

### Evidence

The supporting material used to justify a moment decision.

Evidence can include:

```txt
signal IDs
transcript excerpts
sampled frame refs
model outputs
product match results
policy decision records
budget authorization
duplicate check result
```

### Evidence Trail

The set of evidence records linked to an accepted/captured moment.

Accepted moments store full evidence trails. Rejected candidates store lightweight summaries.

---

## 6. Asset & Media Terms

### Asset

A tracked media or metadata object stored in B2 and indexed in Postgres.

An asset has:

```txt
asset_id
organization_id
session_id
moment_id
asset_role
bucket
object_key
mime_type
bytes
sha256
duration_ms
width
height
verification_status
retention_class
```

### Asset Role

The functional type of an asset.

Common roles:

```txt
raw_source
raw_mezzanine
live_transformed
enhanced_master
publish_variant
thumbnail
captions
transcript
evidence
manifest
catalog_snapshot
```

### Raw Source Asset

The original captured media object for a moment.

### Raw Mezzanine Asset

A normalized processing copy of the raw source, usually easier for downstream generation, QA, and publish variants.

### Live-transformed Asset

A stored clip representing the audience-visible or lineage-relevant realtime-transformed output.

### Enhanced Master Asset

The primary polished creative output generated from the raw/mezzanine asset.

Only one version may be promoted to canonical at a time.

### Publish Variant Asset

A destination-specific derivative of the enhanced master.

Examples:

```txt
tiktok_9_16
reels_9_16
shorts_9_16
shopify_square
web_16_9
download_mp4
```

### Thumbnail Asset

A still image used for review, share pages, and publish packages.

### Caption Asset

A caption file such as:

```txt
captions.vtt
captions.srt
burned_caption_metadata.json
```

### Transcript Chunk

A time-aligned text segment from a session.

Full session transcript chunks may have shorter retention than accepted-moment transcript excerpts.

### Transcript Excerpt

The transcript portion attached to a captured/accepted moment.

### Media Card

A UI card whose primary content is a video/image preview.

### Moment Card

A review card that includes media preview plus decision metadata, evidence, product grounding, QA status, and lineage.

---

## 7. Generation & Genblaze Terms

### Generation Run

A durable record representing a media generation, editing, rendering, captioning, thumbnail, QA auxiliary, or publish-variant operation.

Fields include:

```txt
generation_run_id
parent_run_id
moment_id
input_asset_id
output_asset_id
template_id
provider
model
status
estimated_cost_usd
actual_cost_usd
manifest_asset_id
```

### Run

Short form for generation run when context is clear.

### Parent Run

The upstream run from which a run derives lineage.

Example:

```txt
capture_run → enhancement_run → publish_variant_run
```

### Genblaze

The generative media orchestration layer used by Lumiq for AI media generation/editing workflows.

Genblaze is responsible for:

```txt
media provider orchestration
media generation/editing steps
provider calls
media manifests
parent_run_id lineage
B2 output handoff
```

Genblaze is not responsible for:

```txt
auth
permissions
review UI
catalog validation
publishing approval
NATS state management
agent reasoning
```

### Genblaze Worker

A Python worker that consumes generation events, runs Genblaze pipelines, writes outputs/manifests to B2, and updates Lumiq state through the Core API.

### Provider

An external or internal model provider used for AI media, LLM, STT, embeddings, or vision.

Examples:

```txt
Decart
GMI Cloud
Runway
OpenAI
Anthropic
Google
```

### Media Provider

A provider used for video/image/audio generation or editing through Genblaze.

### LLM Provider

A provider used for agent reasoning, classification, copy, QA, or structured outputs.

### Model

A specific model identifier under a provider.

### Provider Adapter

An internal abstraction that maps Lumiq policy, cost estimation, provider capabilities, and parameter validation to a provider-specific implementation.

### Provider Fallback

Using an alternate provider/model when the primary fails or is not allowed.

Fallback must be policy-based.

### Template

A versioned configuration defining how a moment should be turned into an enhanced master or variant.

Examples:

```txt
clean_product_reveal
try_on_before_after
price_drop_flash
host_reaction_quote
feature_demo
limited_stock_cta
```

### Step Graph

An ordered graph of typed steps compiled from a template.

Steps may include:

```txt
trim
normalize
reframe
generate_captions
render_product_card
call_ai_video_provider
run_qa
write_manifest
create_publish_variant
```

### Step Registry

A code-defined safe list of allowed step types. Template configs may reference registered step types but may not execute arbitrary code.

### Rerender

A new generation run requested after editing a clip, changing a template option, fixing QA, or adjusting boundaries.

Rerenders never overwrite previous outputs.

### Version

An immutable output version of a moment or generated asset.

### Canonical Version

The approved main version of a moment’s enhanced master.

Latest generated version is not automatically canonical. Canonical promotion requires state-machine transition.

---

## 8. Agent & LLM Terms

### Mastra

The agent orchestration framework used for Lumiq’s supervisor and specialist agents.

Mastra owns agent reasoning, structured agent outputs, and typed agent tools. It does not own durable media workflow state.

### Agent

An AI reasoning component that analyzes context and returns structured recommendations through approved tools.

Agents do not directly mutate B2, provider APIs, or Postgres state.

### Supervisor Agent

The Mastra agent that coordinates specialist agents and produces final recommendations.

### Specialist Agent

An agent focused on one domain task.

Examples:

```txt
Signal Agent
Moment Detector Agent
Product Matcher Agent
Clip Boundary Agent
Enhancement Planner Agent
Caption/Copy Agent
QA Agent
Provenance Agent
```

### Agent Tool

A narrow, typed internal operation an agent may call.

Examples:

```txt
propose_moment_candidate
suggest_template
suggest_boundaries
validate_product_match
generate_caption_options
explain_qa_result
```

### Tool Gateway

The Core API boundary that validates agent tool calls.

It checks:

```txt
service identity
agent capability
organization scope
state
budget
automation policy
schema
idempotency
audit requirements
```

### Agent Tool Call

A persisted record of an agent calling a tool.

### Structured Output

A machine-validated response object returned by an LLM or agent.

### LLMProviderRouter

Internal routing layer that chooses provider/model based on task type, cost policy, quality policy, latency policy, and fallback policy.

### LLM Run

A persisted record of an LLM call.

### Agent Memory

Longer-term context that can personalize decisions.

Types:

```txt
brand_style_memory
review_memory
campaign_memory
template_memory
agent_decision_memory
```

Durable agent memory lives in Postgres. Mastra may use working memory during execution.

---

## 9. Commerce & Catalog Terms

### Product

An item being sold or demonstrated.

Fields may include:

```txt
product_id
name
sku
price
description
product_url
images
inventory
allowed_claims
```

### SKU

Stock Keeping Unit. A stable merchant/product identifier.

### Campaign

A commerce initiative tied to one or more products and offers.

### Offer

A price, discount, promotion, or time-bound deal.

### Allowed Claim

A verified product or campaign statement allowed to appear in overlays, captions, titles, or publish copy.

Examples:

```txt
30% off
limited stock
waterproof
free shipping
best-selling
```

### Product Grounding

The process of ensuring all product facts in generated outputs come from structured catalog/campaign data.

AI may suggest facts; backend must verify them.

### Catalog Adapter

An integration or import path that syncs product/campaign data into Lumiq.

Examples:

```txt
manual_catalog
csv_import
Shopify future
WooCommerce future
custom_api future
```

### Catalog Snapshot

A frozen copy of product/campaign facts for a session.

Stored in:

```txt
Postgres queryable rows
B2 immutable JSON manifest
```

### Live Refresh

A pre-publish check against current product/offer availability, price, and validity.

If facts have materially changed, auto-publish is blocked and review is required.

---

## 10. QA, Moderation & Safety Terms

### QA Gate

A validation step that can pass, fail, request review, or trigger remediation.

### Pre-enhancement QA

Checks before generating/enhancing media.

Examples:

```txt
raw moment usable
product match confident
claim grounded
template allowed
budget allowed
safe to process
```

### Post-enhancement QA

Checks after enhanced output is created.

Examples:

```txt
render succeeded
captions match transcript
product appearance preserved
overlays use approved facts
AI restyle allowed
quality score acceptable
```

### Pre-publish QA

Checks before a clip is published/exported externally.

Examples:

```txt
price still valid
availability still valid
approval exists
destination package valid
required labels present
moderation still current
```

### Failure Class

QA/system failure category.

Allowed values:

```txt
retryable
remediable
review_required
terminal
```

### Product Visual Integrity

The requirement that AI enhancement must not misrepresent product appearance, color, size, material, packaging, features, or buyer expectation.

### AI Restyle

A generative transformation of video appearance. It is optional and constrained by product-accuracy policy.

### Moderation

Safety checking for raw moments, prompts/templates, generated outputs, captions, titles, and publish packages.

---

## 11. Provenance, Manifest & B2 Terms

### Provenance

The traceable lineage of an asset from source to output.

Example:

```txt
raw_source_asset → raw_mezzanine_asset → Genblaze run → enhanced_master_asset → publish_variant_asset
```

### Lineage Graph

The visual and data representation of provenance.

### Lineage Chain

A compact UI representation of provenance steps.

### Manifest

A JSON record describing an asset, run, catalog snapshot, or provenance relationship.

### Provenance Manifest

A manifest specifically describing source assets, derived assets, runs, checksums, models, templates, and relationships.

### App-level Manifest

Lumiq’s own manifest format, designed to be future-compatible with provenance standards.

### Genblaze Manifest

A manifest generated or managed by Genblaze for media generation runs.

### B2

Backblaze B2 Cloud Storage, the canonical media/provenance vault.

### B2 Bucket

A storage container in B2.

Planned buckets:

```txt
moment-vault-prod-raw
moment-vault-prod-derived
moment-vault-prod-published
moment-vault-prod-provenance-lock
moment-vault-prod-logs
moment-vault-prod-backups
```

### Object Key

The path/name of an object in B2.

Example:

```txt
tenants/{organization_id}/sessions/{session_id}/moments/{moment_id}/runs/{run_id}/outputs/{asset_id}.mp4
```

### Checksum

A cryptographic hash used to verify file integrity.

Default:

```txt
sha256
```

### Object Lock

A B2 feature for preventing deletion/mutation for retention/compliance. Used for locked provenance buckets where required.

### Retention Class

A category defining how long an asset should be kept.

Examples:

```txt
tmp
raw_active
mezzanine
derived
published
provenance_locked
audit
```

### Soft Delete

A logical deletion state that removes data from UI/search but delays physical object deletion.

### Hard Delete

Physical removal of B2 objects and/or database records where policy allows.

---

## 12. Publishing Terms

### Publish Package

A canonical package containing all assets and metadata needed for a destination/export.

Includes:

```txt
mp4_clip
thumbnail
captions
title
description
hashtags
product links
source moment ID
provenance manifest
destination metadata
```

### Publish Adapter

A module that transforms a publish package for a destination.

Examples:

```txt
internal_library
download_zip
signed_share_link
Shopify future
YouTube Shorts future
TikTok Draft future
Instagram Reels future
```

### Share Page

A page showing a publish package, usually with a video player, title, product links, download controls, and optional provenance badge.

### Public Share Link

A share page accessible to anyone with the link, if explicitly enabled.

### Private Review Link

A share/review page that requires authentication or signed access.

### Auto-publish

A policy-controlled process where a publish package is created or sent without manual approval.

Default is human approval before external publishing.

---

## 13. Events, Workflow & Operations Terms

### Core API

The backend control plane responsible for authz, state transitions, budgets, policy checks, agent tool gateways, and audit writes.

### Worker

A service that performs async work.

Examples:

```txt
capture-worker
signal-extraction-worker
genblaze-worker
qa-worker
publish-worker
provenance-verifier
search-indexing-worker
```

### NATS JetStream

The event backbone used for durable event transport, worker fan-out, replay, and dead-letter streams.

### Event

A typed message emitted when something happens or work is requested.

### Event Envelope

The common wrapper for all events.

Fields:

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

### Subject

The NATS message topic.

Examples:

```txt
session.opened
moment.candidate.proposed
moment.capture.authorized
generation.requested
generation.completed
qa.completed
publish.completed
```

### Idempotency Key

A stable key used to prevent duplicate side effects.

### Dead-letter Stream / DLQ

A stream where failed events/jobs are stored after retry exhaustion.

### State Machine

A controlled set of valid states and transitions.

Examples:

```txt
session state machine
moment state machine
generation run state machine
publish package state machine
```

### Audit Event

A durable log entry for sensitive or meaningful actions.

### Recovery Console

Admin UI for DLQ, stuck jobs, failed runs, B2 reconciliation, and manual replay.

---

## 14. Search, Analytics & Observability Terms

### Search Index

A structured and/or semantic index used for finding sessions, moments, assets, products, captions, transcripts, and summaries.

### Embedding

A vector representation used for semantic search.

### pgvector

Postgres extension used for early vector search.

### Operational Analytics

Metrics about system behavior.

Examples:

```txt
generation latency
provider failure rate
capture success rate
B2 upload latency
dead-letter rate
cost per clip
```

### Business/Media Analytics

Metrics about published content performance.

Examples:

```txt
views
downloads
shares
product clicks
publish destination
template performance
```

### Trace

A distributed observability record linking actions across API, agents, NATS, workers, B2, and providers.

### Correlation ID

A shared ID linking related events/actions across the system.

---

## 15. UI Domain Terms

### App Shell

The main product layout consisting of topbar + sidebar + workspace.

### Topbar

Global/session controls at the top of the app.

### Sidebar

Primary app section navigation.

### Creator Control Room

The design pattern for Live Studio: big video preview, right-side signals, bottom timeline.

### Signal Feed

A feed of realtime detections and candidate moments.

### Timeline Pulse

A visual marker indicating a detected signal or candidate moment.

### Gradient Hairline

A 1px flat gradient border used only for selected/AI-active/provenance elements. It must not glow.

### Provenance Badge

A UI indicator showing that lineage/proof exists for a clip or package.

### Technical Panel

An expandable UI section containing IDs, B2 keys, checksums, manifests, provider refs, and audit info.

---

## 16. State Enumerations

### Session State

```txt
created
opening
live
closing
closed
error
reconciled
```

### Moment State

```txt
candidate
capture_authorized
capturing
raw_uploaded
enhancement_pending
enhancing
qa_pending
review_pending
approved
canonical
published
rejected
failed
archived
deleted
```

### Generation Run State

```txt
queued
running
provider_pending
completed
failed
cancelled
reconciled
```

### QA Status

```txt
not_started
running
passed
failed
review_required
remediated
terminal
```

### Publish Package State

```txt
draft
ready
review_pending
approved
published
failed
revoked
deleted
```

### Asset Verification Status

```txt
unverified
verified
failed
```

---

## 17. Naming Conventions

### IDs

Use lower snake-case names in database columns:

```txt
session_id
moment_id
asset_id
generation_run_id
catalog_snapshot_id
publish_package_id
```

Use ULID-like values for generated IDs.

### Event Types

Use dot-separated event names:

```txt
moment.candidate.proposed
generation.requested
qa.completed
publish.completed
```

### File/Object Keys

Use hierarchical B2 keys:

```txt
tenants/{organization_id}/sessions/{session_id}/moments/{moment_id}/...
```

### Asset Roles

Use lower snake-case:

```txt
raw_source
raw_mezzanine
enhanced_master
publish_variant
```

### Templates

Use lower snake-case with versioning:

```txt
clean_product_reveal_v1
price_drop_flash_v1
```

---

## 18. Glossary Quick Table

| Term | Short Definition |
|---|---|
| Lumiq | The AI live-commerce moment vault app |
| Organization | Tenant/account owning data |
| Session | A live or prerecorded-live commerce event |
| Source Adapter | Normalizes input streams into Lumiq’s session contract |
| Moment | Meaningful time interval inside a session |
| Candidate Moment | Proposed moment before capture/enhancement |
| Captured Moment | Moment with raw source stored in B2 |
| Signal | Low-level detection observation |
| Evidence | Data supporting a moment decision |
| Asset | Tracked B2 object indexed in Postgres |
| Raw Source Asset | Original captured media |
| Mezzanine Asset | Normalized processing copy |
| Enhanced Master | Main polished generated clip |
| Publish Variant | Destination-specific derivative |
| Generation Run | Durable media generation/edit/render job |
| Genblaze | Generative media pipeline orchestration layer |
| Mastra | Agent orchestration framework |
| Agent Tool | Typed internal function an agent may call |
| LLMProviderRouter | Chooses LLM provider/model by task and policy |
| Catalog Snapshot | Frozen product/campaign facts for a session |
| Product Grounding | Verifying output facts against catalog/campaign data |
| Provenance | Traceable lineage from raw input to final output |
| Manifest | JSON record describing asset/run/provenance |
| Publish Package | Canonical set of assets/metadata for publishing |
| NATS JetStream | Durable event backbone |
| DLQ | Dead-letter stream for failed events/jobs |
| Idempotency Key | Stable key preventing duplicate side effects |
| Audit Event | Durable record of an action/state transition |
| Recovery Console | Admin UI for failures/replay/reconciliation |

---

## 19. Forbidden Ambiguities

Do not use these terms without qualification:

| Ambiguous Term | Use Instead |
|---|---|
| clip | moment, raw source asset, enhanced master, publish variant |
| AI job | generation run, LLM run, agent tool call |
| metadata | asset metadata, provenance manifest, catalog snapshot, audit event |
| publish | create publish package, approve publish package, create share page, send via adapter |
| file | asset, B2 object |
| stream | session, source track, live transformed output |
| user data | organization data, session data, asset data, transcript data |

---

## 20. Agent Instruction

When implementing Lumiq:

1. Read this glossary before implementing domain objects.
2. Use these terms in code, API names, event names, schema names, and comments.
3. Do not invent alternate vocabulary unless a spec update is made.
4. If a new concept appears, add it to this glossary before using it widely.
