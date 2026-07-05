# Product Requirements Document: Live Commerce Moment Vault

## 1. Product Summary

**Live Commerce Moment Vault** is an AI media operations platform for livestream sellers, ecommerce teams, and creator-commerce agencies. It watches live commerce sessions, detects high-value sales moments, captures the exact raw source segment, optionally captures the live AI-transformed version, generates polished commerce-ready clips through a controlled Genblaze-powered media pipeline, and stores every raw, transformed, generated, and published asset in Backblaze B2 with durable provenance.

The product is not a generic AI clipper. It is a **traceable AI media vault** for commerce moments.

The core product claim:

> Every polished clip can be traced back to the exact live moment, raw source, live-transformed output when available, product facts, AI run, template, QA gates, and publish package that produced it.

The system is designed around three principles:

1. **Capture truth first**  
   Raw source and lineage matter more than just generating a pretty output.

2. **Generate with controls**  
   AI enhancement is powerful, but product accuracy, catalog grounding, human review, and QA gates are mandatory for commerce trust.

3. **Store like a production media pipeline**  
   Backblaze B2 is the canonical media/provenance vault. Postgres is the operational source of truth. Genblaze is the generative media orchestration layer. Mastra is the agent orchestration layer.

---

## 2. Target Users

### 2.1 Primary Users

**Live commerce sellers**  
People selling products through live video who need shareable clips from their streams.

**Ecommerce marketing teams**  
Teams that want to turn live product demos into short-form product content.

**Creator-commerce agencies**  
Agencies managing live hosts, product launches, and post-live content production.

**Small brands running product livestreams**  
Brands that want social clips without manually scrubbing through long recordings.

### 2.2 Secondary Users

**Video editors**  
They review, tune, rerender, and export clips.

**Operations/admin users**  
They manage budgets, providers, failures, audit logs, and retention.

**Founders/judges/demo viewers**  
They need to understand the complete pipeline quickly: live input → detected moment → raw capture → AI enhancement → B2 provenance.

---

## 3. Problem

Live commerce streams contain valuable moments: product reveals, host reactions, offer announcements, feature demos, try-ons, and CTAs. But those moments are hard to capture, clip, polish, organize, and reuse.

Current solutions either:

- generate generic clips without commerce-specific grounding,
- lack product accuracy controls,
- do not preserve raw source provenance,
- do not store media in a production-ready vault,
- do not show how a polished clip was produced,
- or require manual editing after every stream.

For commerce, this is dangerous because AI can misstate prices, alter product appearance, invent claims, or generate clips that cannot be traced back to the real live moment.

---

## 4. Product Goals

### 4.1 Functional Goals

The product must:

1. Let a user start or simulate a live commerce session.
2. Detect candidate high-value moments during the session.
3. Capture the raw source clip for approved/high-confidence moments.
4. Capture live AI-transformed output when audience-visible or lineage-relevant.
5. Store raw, transformed, enhanced, thumbnail, caption, manifest, and publish assets in Backblaze B2.
6. Use Genblaze for generative media orchestration.
7. Use Mastra for supervisor/specialist AI agent orchestration.
8. Use OpenAI-first multi-provider LLM routing for agent reasoning, QA, copy, classification, and embeddings.
9. Generate polished commerce clips using template-driven step graphs.
10. Ground all product facts in a structured catalog/campaign snapshot.
11. Provide review UI with timeline and clip cards.
12. Allow controlled edit + rerender.
13. Produce canonical publish packages.
14. Expose provenance: raw source → transformed output → enhanced master → publish variants.
15. Enforce budgets, permissions, QA, and audit logging.

### 4.2 Hackathon Goals

The hackathon submission must clearly demonstrate:

1. Meaningful Backblaze B2 usage.
2. Meaningful Genblaze usage.
3. A working app URL.
4. A short demo video.
5. A real-world utility story.
6. Production-minded architecture.
7. Durable storage of media, metadata, manifests, logs, and provenance.
8. Agentic media workflows that generate, evaluate, retry, and store outputs.

### 4.3 Non-Goals

The first production design does **not** try to be:

- a full TikTok Live replacement,
- a full OBS platform,
- a complete CapCut/Premiere editor,
- a generic video generation toy,
- a social publishing suite from day one,
- a full livestream archive by default,
- a system where AI freely changes product appearance,
- or a system where agents directly mutate storage/provider state.

---

## 5. Positioning

### 5.1 Product Name

Working name:

**Live Commerce Moment Vault**

Possible short names:

- Moment Vault
- Commerce Vault
- LiveClip Vault
- GenVault
- ClipLineage

### 5.2 One-Liner

> An AI moment vault that detects high-converting live-shopping moments, generates polished product clips, and stores every raw and enhanced asset with complete B2-backed provenance.

### 5.3 Demo Pitch

> A host goes live and shows a product. The system detects the best sales moment, captures the raw clip, optionally captures the live AI-transformed version, sends it through a Genblaze enhancement pipeline, stores everything on Backblaze B2, and shows a traceable lineage graph proving exactly how the polished clip was made.

---

## 6. Core User Journey

### 6.1 Setup

The user creates an organization and enters the workspace.

Progressive onboarding asks for:

1. Brand name.
2. Optional product catalog or CSV.
3. Optional campaign/offer.
4. Optional brand style.
5. Optional provider setup.
6. Optional publish destinations later.

The user can start in **demo/generic mode** without a catalog, but commerce-grounded rendering requires product/catalog/campaign data.

### 6.2 Live Session

The user opens **Live Studio**.

Supported sources:

- webcam,
- screen share,
- uploaded video played as “live,”
- prerecorded-live simulator,
- future OBS/RTMP adapter,
- future third-party livestream adapter.

The system normalizes every source into the same internal contract:

```txt
LiveStreamSession
  timestamped audio chunks
  sampled frames
  rolling video segments
  source metadata
  session markers
  transcript chunks
  optional live-transformed track
```

### 6.3 Moment Detection

The system uses a hybrid signal stack.

Cheap realtime signals propose candidates:

- transcript keywords,
- audio energy,
- product mentions,
- product visibility,
- scene changes,
- host reactions,
- offer/discount keywords,
- manual markers,
- optional chat/activity spikes.

AI validation inspects promising windows:

- confirms product reveal,
- verifies likely SKU,
- refines boundaries,
- explains why moment matters,
- recommends template,
- scores publish potential.

### 6.4 Capture Authorization

Detection does not directly trigger capture.

Flow:

```txt
Signal Agent
  proposes candidate

Moment Ranker / Policy Service
  checks score, duplicate window, budget, privacy, retention, session caps

Capture Service
  captures raw clip if authorized

Core API
  records state transition and audit event
```

### 6.5 Raw Capture

Raw capture uses generous windows.

Example:

```txt
Candidate moment:
  00:14:32

Raw capture:
  00:14:12 → 00:14:52

Final trim:
  00:14:21 → 00:14:39
```

The raw vault stores context. The enhanced clip uses refined boundaries.

### 6.6 Enhancement

Accepted moments run through a template-driven step graph.

Example template:

```txt
clean_product_reveal_v1

Steps:
  1. select_trim_boundaries
  2. normalize_mezzanine
  3. detect_subject_and_product
  4. reframe_to_vertical
  5. generate_captions
  6. render_product_card_overlay
  7. burn_captions
  8. generate_thumbnail
  9. optional_ai_restyle_if_enabled
  10. run_quality_checks
  11. write_provenance_manifest
  12. create_publish_variants
```

### 6.7 Review

Reviewers see:

1. Session timeline.
2. Clip review cards.
3. Raw source clip.
4. Live-transformed clip if available.
5. Enhanced master.
6. Destination variants.
7. Detection explanation.
8. Product facts.
9. QA status.
10. Provenance trail.
11. Approve/reject/rerender controls.

### 6.8 Publish Package

A canonical `PublishPackage` includes:

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

The core system creates the package. Destination adapters handle export/download/share/social/ecommerce later.

---

## 7. Product Modes

### 7.1 Demo / Generic Mode

Allows the user to test the app without product catalog setup.

Allowed:

- live/prerecorded session,
- moment detection,
- raw capture,
- generic enhancement,
- internal vault storage,
- share/export.

Not allowed unless product data exists:

- factual product overlays,
- price/discount claims,
- availability claims,
- product-specific publish copy,
- auto-publish based on offers.

### 7.2 Commerce-Grounded Mode

Requires:

- product catalog snapshot,
- campaign or offer data if claims are used,
- allowed claims records,
- product links,
- product assets.

Enables:

- product cards,
- offer overlays,
- SKU matching,
- commerce-specific captions,
- publish packages with product links.

### 7.3 Full Session Recording Mode

Default is **moment-only storage**.

Optional per org/session:

```txt
full_session_recording_enabled = true
```

If enabled:

- store full session as session-level asset,
- link moments to full recording time ranges,
- require clear host consent,
- use stricter retention,
- display higher storage/cost warning.

---

## 8. Functional Requirements

## 8.1 Workspace

The app must provide a unified workspace with role-based sections:

- Live Studio
- Moment Vault
- Review Queue
- Product Catalog
- Campaigns
- Templates
- Publish Packages
- Share Pages
- Analytics
- Admin/Recovery
- Settings/Billing

Sections appear based on user role and capabilities.

---

## 8.2 Authentication and Authorization

Authentication:

- Clerk handles user authentication.
- Clerk handles user sessions and identity.

Authorization:

- Internal Postgres authorization decides what users can do.
- The app mirrors Clerk identity into internal tables.

Core internal tables:

```txt
users
organizations
memberships
roles
role_capabilities
capability_grants
service_identities
automation_policies
```

Base roles:

```txt
owner
admin
editor
reviewer
viewer
```

Scoped capabilities:

```txt
session:create
session:end
moment:view
moment:approve
moment:reject
generation:run
generation:rerun
publish:create
publish:approve
asset:view_enhanced
asset:download_raw
asset:delete
retention:change
billing:view
billing:manage
audit:view
admin:recover
```

Rule:

> Clerk answers “who is this?” Internal authorization answers “what can this actor do in this org/session/moment?”

---

## 8.3 Agent Orchestration

Use **Mastra** as the AI agent orchestration framework.

Mastra owns:

```txt
supervisor agent
specialist agents
typed agent tools
structured agent outputs
agent reasoning flows
agent memory access
agent debugging/testing surface
```

Mastra does **not** own:

```txt
durable media workflow state
B2 writes/deletes
provider secret access
database mutations
publish actions
billing changes
retention changes
raw media deletion
```

The orchestration model:

```txt
Mastra
  agent brain layer

NATS JetStream
  event/job highway

Postgres
  source of truth for state

Python workers
  execution hands for media/AI jobs

Genblaze
  generative media pipeline runner

Backblaze B2
  media/provenance vault
```

Simple mental model:

```txt
Mastra = what should we do?
Core API = is this allowed?
NATS = who should do it?
Workers = do the work
Genblaze = generate/edit the media
B2 = store media and proof
Postgres = track everything
```

---

## 8.4 Agent Permissions

Agents use service identities.

They do not get:

- raw B2 credentials,
- Decart credentials,
- Genblaze provider secrets,
- direct DB write access,
- publish access,
- delete access,
- billing mutation access.

Agents call narrow internal gateway tools.

Each tool call includes:

```txt
tool_call_id
agent_id
organization_id
session_id
moment_id nullable
requested_by_user_id nullable
idempotency_key
trace_id
payload
```

Agent actions must be:

- scoped by organization,
- scoped by session/moment when applicable,
- authorized by service capability,
- checked against automation policy,
- checked against budget policy,
- audit logged.

---

## 8.5 Agent Architecture

Use a hybrid supervisor + specialist model.

Workflow engine/state machine owns execution truth.

Agents reason and recommend. Backend services execute.

Specialist agents:

```txt
Supervisor Agent
Signal Agent
Moment Detector Agent
Clip Boundary Agent
Product Matcher Agent
Moment Ranker Agent
Enhancement Planner Agent
Caption/Copy Agent
QA Agent
Provenance Agent
```

Backend services:

```txt
Core API / Control Plane
Session Service
Moment Service
Capture Service
Generation Service
Template Service
Catalog Service
QA Service
Publish Service
Provenance Service
Budget Service
Audit Service
Search Service
```

---

## 8.6 LLM Provider Strategy

Use a multi-provider LLM strategy.

Default stack:

```txt
Primary agent LLM:
  OpenAI

Secondary/fallback LLM:
  Anthropic Claude

Cheap high-volume validation:
  Google Gemini Flash-style model later

Embeddings:
  OpenAI embeddings by default, stored in Neon Postgres + pgvector

Media generation:
  Genblaze provider layer, not the normal LLM provider
```

Important separation:

```txt
OpenAI / Claude / Gemini:
  thinking
  classification
  writing
  QA reasoning
  product claim checking
  structured outputs
  embeddings

Genblaze / Decart / GMI / Runway:
  video/image/audio media generation and editing
```

### 8.6.1 LLMProviderRouter

Do not hardcode one provider everywhere.

Create an internal `LLMProviderRouter`.

```txt
LLMProviderRouter
  route(task_type, cost_policy, latency_policy, quality_policy)

Task types:
  supervisor_decision
  product_match
  moment_validation
  caption_generation
  qa_review
  provenance_explanation
  embedding
```

Example routing config:

```txt
supervisor_decision:
  primary: openai/frontier-reasoning
  fallback: anthropic/sonnet
  max_cost_usd: 0.10

moment_validation:
  primary: openai/fast-multimodal
  fallback: google/flash
  max_cost_usd: 0.02

caption_generation:
  primary: openai/fast
  fallback: anthropic/haiku-or-sonnet
  max_cost_usd: 0.03

qa_review:
  primary: anthropic/sonnet
  fallback: openai/frontier-reasoning
  max_cost_usd: 0.08

embeddings:
  primary: openai/embedding
```

For the hackathon build:

```txt
Primary LLM:
  OpenAI

Optional fallback:
  Claude if easy

Embeddings:
  OpenAI embeddings

Media:
  Genblaze + Decart/GMI/etc.

Framework:
  Mastra for agents
```

---

## 8.7 Live Studio

Live Studio must support:

- camera input,
- screen share,
- prerecorded-live simulation,
- uploaded video source,
- future OBS/RTMP source,
- future external livestream adapters.

Live Studio must show:

- source preview,
- live session status,
- detected signal indicators,
- candidate moment feed,
- capture status,
- budget/cost indicator,
- current product/campaign context,
- connection health,
- optional live-transformed preview.

---

## 8.8 Moment Detection

Detection must use hybrid signal architecture.

Cheap signal emitters:

```txt
Transcript Keyword Detector
Audio Energy Detector
Scene Change Detector
Product Mention Detector
Product Visibility Detector
Manual Marker Detector
Offer/CTA Detector
Optional Chat Spike Detector
```

AI validation:

```txt
validate_product_reveal
validate_reaction_moment
validate_offer_mention
refine_clip_boundaries
match_product_candidate
recommend_template
explain_moment_value
```

Candidate scoring includes:

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

---

## 8.9 Capture Policy

The detector may not directly capture raw media.

Capture requires authorization by `MomentPolicyService`.

Policy checks:

```txt
session is live
capture enabled
candidate confidence threshold
duplicate window
per-session capture cap
tenant budget
privacy policy
retention policy
full-session recording policy
source availability
```

Confidence-tiered automation:

```txt
score >= 0.90:
  auto-capture raw
  auto-run enhancement if budget allows

score 0.70–0.89:
  auto-capture raw
  wait for review before enhancement

score < 0.70:
  store lightweight signal only
```

Default caps:

```txt
max_auto_enhancements_per_session
max_captures_per_session
cooldown_between_auto_enhancements
duplicate_moment_window
max_rerenders_per_moment
```

---

## 8.10 Media Capture

For accepted/captured moments, store:

```txt
raw_source_clip
raw_mezzanine_clip
live_transformed_clip optional
transcript_excerpt
sampled_frame_refs
signal_evidence
capture_manifest
```

Raw clips are canonical evidence during their retention window.

Retention:

```txt
raw/source clips:
  30–90 days default

raw/mezzanine clips:
  90–180 days default

enhanced/published outputs:
  indefinite or until user deletion

provenance manifests:
  indefinite unless deletion policy requires removal

audit logs:
  90–365 days or plan policy
```

---

## 8.11 Live AI-Transformed Output

Capture transformed output only when lineage-relevant.

Rules:

```txt
If live AI transform is off:
  store raw_source only

If live AI transform is host-only preview:
  store transformed output only if used for enhancement/review/final lineage

If live AI transform is audience-visible:
  store transformed segment for every accepted/captured moment

If transformed output materially changes product appearance:
  require stronger provenance labeling and human review
```

---

## 8.12 Product Accuracy

AI may suggest product facts, but final assets must be grounded in structured product/catalog/campaign records.

AI can suggest:

```txt
possible SKU
likely product reveal
likely discount mention
caption copy
hook/title
possible product match
```

Backend must verify:

```txt
product name
SKU
price
discount
availability
product URL
allowed claims
campaign rules
offer validity
```

Final rendered overlays/captions cannot include ungrounded claims.

Restricted claims include:

```txt
30% off
limited stock
best-selling
waterproof
official
guaranteed
free shipping
expires today
```

unless backed by campaign/catalog records.

---

## 8.13 Catalog System

Use adapter model.

Initial adapters:

```txt
manual_catalog
csv_import
```

Future adapters:

```txt
Shopify
WooCommerce
custom API
live-commerce platform adapters
```

`CatalogAdapter` interface:

```txt
sync_products()
sync_product_assets()
sync_campaigns()
sync_inventory()
sync_offers()
resolve_product_by_sku()
resolve_product_by_url()
```

Every commerce-grounded session creates a catalog snapshot.

Snapshot rule:

```txt
At session start:
  create catalog_snapshot_id

During detection/rendering:
  use snapshot facts

Before external publish:
  refresh critical live facts

If material change:
  block auto-publish
  require human review
  optionally rerender overlay/caption
```

Catalog snapshots are stored in:

1. Postgres queryable rows.
2. B2 immutable JSON manifests.

---

## 8.14 Enhancement Templates

Enhancement is template-driven.

Templates are versioned config objects, not hardcoded worker logic.

Template examples:

```txt
clean_product_reveal
try_on_before_after
price_drop_flash
host_reaction_quote
feature_demo
limited_stock_cta
```

Template fields:

```txt
template_id
organization_id nullable
name
moment_type
output_format
operations_json
brand_rules_json
ai_restyle_policy
caption_policy
overlay_policy
product_card_policy
moderation_policy
version
is_system_template
is_active
```

Templates compile into typed step graphs.

---

## 8.15 Step Graph Registry

Use hybrid safe registry:

- step types are code-defined,
- template graphs are DB/config-defined,
- arbitrary code execution is not allowed.

Each step type defines:

```txt
step_type
input_schema
output_schema
permission_requirements
cost_estimate_function
executor
allowed_params
produced_asset_roles
retry_policy
qa_requirements
```

Forbidden:

```txt
arbitrary shell commands
arbitrary ffmpeg strings from user input
arbitrary provider calls
user-defined executable code
unvalidated prompt injection into workflow control
```

---

## 8.16 User Creative Controls

Use controlled prompt slots.

Allowed:

```txt
brand_tone
overlay_copy
hook_title
caption_style
ai_restyle_instruction optional
```

Slot constraints:

```txt
max length
moderation required
schema validation
system-owned prompt wrapper
stored in provenance
human review when needed
```

Not allowed:

```txt
raw user prompt controls full workflow
prompt bypasses QA
prompt bypasses product facts
prompt calls tools
prompt changes permissions
```

---

## 8.17 AI Restyling Policy

AI restyling is allowed only under strict product-accuracy constraints.

Allowed by default:

```txt
background cleanup
lighting normalization
framing/crop
denoise/sharpen
captions
product card overlays
host/background stylization if product remains faithful
```

Restricted / approval required:

```txt
product color changes
material/texture changes
packaging changes
size/proportion changes
added features
unrealistic fit/result changes
anything affecting buyer expectation
```

Required labels:

```txt
conceptual restyle
simulated try-on
AI-enhanced visualization
```

---

## 8.18 QA Pipeline

Use multi-stage QA.

Pre-enhancement QA:

```txt
raw moment usable
product match confident
offer/claim grounded
template allowed
budget/policy allowed
safe to process
```

Post-enhancement QA:

```txt
render succeeded
captions match transcript
product appearance preserved
overlays use approved facts
AI restyle did not misrepresent product
quality score acceptable
```

Pre-publish QA:

```txt
price/availability refreshed
publish approval exists
destination package valid
required labels/disclosures present
moderation still valid
```

QA failure classes:

```txt
retryable
remediable
review_required
terminal
```

Examples:

```txt
retryable:
  provider timeout
  network/B2 issue
  transient ffmpeg failure

remediable:
  caption timing drift
  bad crop
  weak thumbnail
  overlay safe-zone issue

review_required:
  uncertain product match
  questionable claim
  possible product appearance change
  borderline moderation

terminal:
  corrupted raw source
  missing required product facts
  disallowed content
  expired offer with no valid replacement
```

---

## 8.19 Review UI

Use dual review model.

Session timeline:

```txt
detected moments
signal peaks
accepted/rejected states
product mentions
transcript snippets
raw source markers
QA states
```

Clip review card:

```txt
raw clip
live-transformed clip if available
enhanced master
destination variants
detection explanation
product facts
QA results
provenance trail
approve/reject/rerender controls
```

Controlled edit + rerender supports:

```txt
trim start/end
selected template
caption text
hook/title
product card visibility
product card style
destination variants
AI restyle on/off if policy allows
```

Not supported:

```txt
full manual timeline editor
arbitrary layers
arbitrary effects stack
unsupported ffmpeg operations
ungrounded claims
```

---

## 8.20 Versioning

Every rerender creates a new immutable version.

Do not overwrite generated outputs.

Version states:

```txt
generated
qa_failed
qa_passed
review_pending
review_rejected
approved
canonical
published
archived
```

Only state-machine promotion can mark a version canonical.

Latest generated version is not automatically canonical.

---

## 8.21 Publishing

Publishing uses canonical `PublishPackage`.

Default:

```txt
generate
review queue
human approves
publish/export
```

Auto-publish is allowed only under explicit org policy:

```txt
auto_publish_enabled
allowed_destinations
min_quality_score
moderation_pass_required
max_auto_publishes_per_session
trusted_template_ids
campaign_scope
budget_cap
```

Publish adapters:

```txt
internal_library
download_zip
signed_share_link
shopify_media future
youtube_shorts future
tiktok_draft future
instagram_reels future
```

Core rule:

> The vault owns the canonical publishable asset. External destinations are adapters, not the source of truth.

---

## 8.22 Output Variants

Generate:

1. Enhanced master clip.
2. Destination-specific derivatives.

Provenance:

```txt
raw_source
  → live_transformed optional
  → raw_mezzanine
  → enhanced_master
  → publish_variant_tiktok
  → publish_variant_reels
  → publish_variant_shorts
  → shopify_square
  → thumbnail
  → captions
```

Enhanced master uses template-driven hybrid enhancement:

```txt
original/live moment preserved
intelligent trim
vertical framing/reframe
captions
product card
hook/title
audio normalization
thumbnail
optional AI restyle
```

---

## 8.23 Share Pages

Share pages are configurable per publish package.

Default:

- private review link,
- requires access or signed URL.

Optional:

- public/unlisted share page,
- download enabled/disabled,
- product links shown/hidden,
- provenance badge shown/hidden,
- expiry date,
- password/access control later.

Share page path:

```txt
/share/{share_slug}
```

---

## 8.24 Search and Retrieval

Use hybrid search.

Structured filters:

```txt
product_id
campaign_id
session_id
date
status
template
QA status
publish destination
score
reviewer
asset type
```

Semantic/multimodal search:

```txt
transcript excerpts
captions
moment summaries
product descriptions
frame descriptions
thumbnail visual embedding
representative frame embeddings
host/action labels
```

Search architecture:

```txt
Postgres full-text
pgvector
SearchIndexAdapter
future Qdrant/OpenSearch/Typesense
```

Embedding policy:

```txt
Accepted/captured moments:
  full embeddings

Rejected candidates:
  lightweight optional embeddings

Low-confidence/noisy signals:
  no embedding by default
```

---

## 8.25 Agent Memory

Use scoped typed memory.

Mastra may provide working/contextual memory for agent execution, but Postgres remains the governed memory source of truth.

Memory types:

```txt
brand_style_memory
review_memory
campaign_memory
template_memory
agent_decision_memory
```

Rules:

```txt
scoped by organization/campaign/session
permission checked
linked to source events/reviews
retention controlled
opt-out supported
never overrides catalog facts
never overrides safety policy
never overrides explicit user settings
```

---

## 8.26 Explanations

Use layered explanations.

Normal user:

```txt
Captured because the product was shown close-up and the host mentioned today’s offer.
```

Reviewer:

```txt
transcript excerpt
product match confidence
signal scores
selected template
QA status
blocking reasons
```

Admin/audit:

```txt
model outputs
prompt hashes
run IDs
agent identity
policy decisions
state transitions
manifest hashes
B2 object keys
```

---

## 9. Technical Architecture

## 9.1 Architecture Overview

Use:

```txt
Frontend:
  Next.js / TypeScript

Agent Framework:
  Mastra

Primary LLM:
  OpenAI

Fallback/Secondary LLM:
  Anthropic Claude

Cheap classifier later:
  Google Gemini Flash-style model

Auth:
  Clerk

Database:
  Neon Postgres

Event Backbone:
  NATS JetStream

Media/AI Workers:
  Python

Storage:
  Backblaze B2

Generative Media Pipeline:
  Genblaze

Media Provider APIs:
  Decart, GMI, Runway, OpenAI media models, others through Genblaze/provider adapters

Deployment:
  Containerized services

Observability:
  OpenTelemetry-style traces, metrics, logs
```

---

## 9.2 Service Split

Core API / Control Plane:

```txt
auth verification
tenant/org mapping
permissions
sessions
moments
assets
generation runs
review state
budget checks
agent tool gateways
audit log writes
```

Mastra Agent Service:

```txt
supervisor agent
specialist agents
structured outputs
agent memory retrieval
agent tool calls into Core API
LLMProviderRouter integration
```

Worker services:

```txt
ingestion worker
capture worker
signal extraction worker
AI validation worker
media processing worker
Genblaze generation worker
QA worker
provenance verifier
publish worker
retention/audit worker
search indexing worker
analytics worker
```

---

## 9.3 Internal Communication

Use:

```txt
HTTP/Core API:
  synchronous commands
  authorization
  state transitions
  signed URL generation
  review actions
  typed agent tool gateways

NATS JetStream:
  async events
  worker fan-out
  job dispatch
  retries
  dead-letter streams
  replay
```

---

## 9.4 NATS Subjects

Use stable domain subjects.

```txt
session.opened
session.closed
signal.detected
moment.candidate.proposed
moment.capture.authorized
moment.raw.uploaded
generation.requested
generation.completed
generation.failed
qa.completed
review.approved
review.rejected
publish.requested
publish.completed
asset.deleted
audit.recorded
```

Tenant/session IDs live inside payload, not subject paths.

---

## 9.5 Event Schema

Use strongly typed JSON schemas.

TypeScript:

```txt
Zod
```

Python:

```txt
Pydantic
```

Every event includes:

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

Every event schema is versioned.

Example naming:

```txt
moment.candidate.proposed.v1
generation.run.completed.v1
publish.completed.v1
```

---

## 9.6 Idempotency

Idempotency must exist at every boundary:

```txt
gateway APIs
agent tool calls
events
workers
DB writes
B2 object keys
provider calls
publish adapters
```

Example keys:

```txt
capture:{organization_id}:{session_id}:{moment_id}:{start_ms}:{end_ms}

generation:{moment_id}:{template_version}:{input_asset_sha256}

publish:{moment_id}:{canonical_asset_id}:{destination}
```

---

## 9.7 Dead-Letter Handling

Failed events/jobs follow:

```txt
event consumed
worker fails
retry with backoff
retry budget exhausted
publish to dlq.{event_type}
mark workflow step failed
show in admin recovery queue
```

Admin can:

```txt
inspect failure
retry
skip
mark terminal
rerun from step
reconcile assets
```

---

## 9.8 Workflow Model

Because the first implementation uses NATS/Postgres instead of Temporal, implement explicit state machines.

Design as Temporal-compatible later.

Session state machine:

```txt
created
opening
live
closing
closed
error
reconciled
```

Moment state machine:

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

Generation run state:

```txt
queued
running
provider_pending
completed
failed
cancelled
reconciled
```

---

## 9.9 Data Model

Use ULIDs for primary IDs.

Use short nanoid-style slugs for public share links.

Core tables:

```txt
users
organizations
memberships
roles
role_capabilities
service_identities
automation_policies

sessions
session_sources
session_recording_policies

products
product_assets
campaigns
campaign_offers
allowed_product_claims
catalog_snapshots
catalog_snapshot_products
catalog_snapshot_offers
catalog_snapshot_claims
catalog_snapshot_assets

moments
signals
moment_evidence
moment_policy_decisions
moment_versions

assets
generation_runs
provenance_links
manifest_records

enhancement_templates
template_versions
step_graphs
step_registry_metadata

qa_checks
qa_failures
review_actions

publish_packages
publish_variants
publish_adapters
share_pages

budgets
cost_ledger
provider_usage_records

audit_events
system_events
dead_letter_events

transcript_chunks
transcript_excerpts
captions

embeddings
search_index_jobs
agent_memory_records
agent_tool_calls
llm_runs
llm_provider_usage
```

---

## 9.10 High-Volume Table Partitioning

Partition early:

```txt
audit_events
system_events
signals
transcript_chunks
provider_usage_records
llm_provider_usage
dead_letter_events
```

Partition by:

```txt
month
organization_id where needed
```

Do not over-partition core tables initially.

---

## 9.11 B2 Bucket Strategy

Use separate buckets by environment and sensitivity.

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

---

## 9.12 B2 Object Keys

Use human-readable hierarchy plus immutable IDs and checksums.

Example:

```txt
tenants/{organization_id}/sessions/{session_id}/moments/{moment_id}/runs/{run_id}/outputs/{asset_id}.mp4
```

Session layout:

```txt
tenants/{organization_id}/sessions/{session_id}/
  session_manifest.json
  catalog/catalog_snapshot.json
  catalog/catalog_snapshot_manifest.json
  moments/{moment_id}/
    raw/source/{asset_id}.webm
    raw/mezzanine/{asset_id}.mp4
    transformed/{asset_id}.mp4
    evidence/{evidence_id}.json
    transcripts/{transcript_excerpt_id}.json
    runs/{run_id}/
      inputs/{asset_id}.json
      outputs/{asset_id}.mp4
      manifest/genblaze_manifest.json
      provenance/provenance.json
    publish/{publish_package_id}/
      variants/{variant_id}.mp4
      captions/{caption_id}.vtt
      thumbnails/{thumbnail_id}.jpg
```

---

## 9.13 B2 Upload Strategy

Mixed strategy:

Browser/source clients:

```txt
upload temporary chunks or capture blobs through presigned URLs where safe
```

Backend workers:

```txt
verify chunks
normalize media
write canonical raw/mezzanine
write manifests
write derived assets
write publish packages
```

Canonical assets are never overwritten.

Temporary scratch may expire or overwrite.

---

## 9.14 Checksums

Calculate checksums before and after upload.

Required fields:

```txt
sha256
size_bytes
mime_type
duration_ms
frame_count
object_key
b2_file_id/version
calculated_at
verified_at
verification_status
```

Assets requiring checksums:

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

---

## 9.15 Provenance

Use dual-source model:

Postgres:

```txt
queryable operational metadata
```

B2:

```txt
immutable provenance manifests
```

Every important asset/run must exist in both.

App-level manifest format:

```txt
custom JSON with future C2PA compatibility fields
```

Manifest fields:

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
relationship
provider
model
template_id
template_version
step_graph_version
prompt_hashes
input_sha256
output_sha256
catalog_snapshot_id
catalog_snapshot_hash
actor_type
actor_id
created_at
qa_results
policy_results
b2_object_keys
canonical_hash
```

---

## 9.16 Retention and Deletion

Use hybrid app retention + B2 lifecycle rules.

Deletion flow:

```txt
delete requested
permission check
soft delete asset/moment
remove from search
revoke public links
schedule B2 deletion
preserve required audit/provenance records if policy requires
```

B2 lifecycle rules handle:

```txt
tmp/scratch expiration
staging cleanup
debug evidence expiration
old rejected candidate data
```

App retention handles:

```txt
business policy
user deletion
legal/audit exceptions
org retention settings
raw clip windows
published asset retention
```

---

## 9.17 Budget and Cost Controls

Use multi-level budgets.

Budget levels:

```txt
org_monthly_budget
campaign_budget
session_budget
max_auto_enhancements_per_session
max_rerenders_per_moment
provider_daily_cap
model_specific_cap
llm_daily_cap
auto_publish_cap
```

Cost records:

```txt
estimated_cost_usd
actual_cost_usd
cost_source
provider
model
seconds_generated
tokens_used
asset_duration_ms
budget_policy_result
reconciled_at
```

Every expensive action requires:

```txt
preflight cost estimate
budget authorization
post-run cost reconciliation
audit event
```

---

## 9.18 Provider Policy and Fallback

Use provider adapter layer + Genblaze as primary media orchestrator.

Provider policy checks:

```txt
allowed provider
allowed model
tenant budget
template compatibility
product-safety policy
estimated cost
fallback policy
```

Fallback is policy-based.

Example:

```txt
template.clean_product_reveal:
  fallback_allowed = true
  allowed_providers = [decart, runway, gmi]
  max_cost_usd = 2.00

template.product_accuracy_strict:
  fallback_allowed = false
```

---

## 9.19 Genblaze Usage

Genblaze is used for **generative media orchestration**, not general agent reasoning.

Genblaze owns:

```txt
media provider orchestration
AI video/image/audio generation steps
media editing/generation pipeline execution
fallback chains where approved
output asset creation
provider run metadata
media manifests
B2 storage handoff
parent_run_id lineage
```

Genblaze does not own:

```txt
auth
permissions
budgets
review UI
live studio UI
NATS events
Postgres state machine
catalog snapshots
product truth validation
manual approval
share pages
analytics dashboard
```

Simple split:

```txt
Mastra:
  decides/recommends what to do

Core API:
  validates whether it is allowed

NATS:
  dispatches the work

Genblaze Worker:
  runs the approved media generation/editing pipeline

B2:
  stores the resulting media and manifests
```

---

## 9.20 Observability

Use OpenTelemetry-style traces, metrics, and structured logs.

Trace tuple:

```txt
organization_id
session_id
moment_id
asset_id
run_id
event_id
trace_id
correlation_id
idempotency_key
```

Metrics:

```txt
raw_capture_success_rate
enhancement_success_rate
time_to_first_candidate
time_to_enhanced_clip
provider_failure_rate
B2_upload_failure_rate
dead_letter_rate
cost_per_accepted_clip
QA_failure_rate
publish_success_rate
LLM_cost_per_decision
agent_tool_failure_rate
```

Logging policy:

- Do not log full transcripts.
- Do not log full prompts.
- Do not log raw customer/product private data.
- Store sensitive evidence in governed evidence storage.

Good logs include:

```txt
moment_id
signal_type
score
transcript_excerpt_id
prompt_hash
model_output_id
trace_id
status
```

---

## 9.21 Admin and Recovery Console

Admin console includes:

```txt
failed events / DLQ
stuck moments
B2 asset reconciliation
provider job failures
LLM run failures
Mastra agent/tool failures
budget anomalies
audit log search
manual replay/rerun
orphaned assets
retention queue
```

Admin actions require:

```txt
admin capability
audit log
reason
idempotency key
state transition
```

---

## 10. Deployment and Infrastructure

## 10.1 Deployment Model

Use containerized services.

Recommended:

```txt
web:
  Vercel or containerized Next.js

api:
  containerized FastAPI/Node API

mastra-agent-service:
  containerized TypeScript service

workers:
  containerized Python workers

nats:
  managed NATS or small cluster

postgres:
  Neon

auth:
  Clerk

storage:
  Backblaze B2
```

Do not start Kubernetes-first.

Do not rely on pure serverless for workers because media processing, ffmpeg, NATS consumers, and provider polling need long-running containers.

---

## 10.2 GPU Strategy

Use provider APIs first.

Initial providers:

```txt
Decart
GMI Cloud
Runway
OpenAI
other Genblaze-supported providers
```

Future:

```txt
GPUWorkerProvider
RunPod
Modal
Replicate
self-hosted open models
```

---

## 10.3 Local Development

Use hybrid local stack.

Docker Compose:

```txt
nats
postgres or Neon branch
api
mastra-agent-service
workers
mock providers
```

Mock services:

```txt
Decart mock
Genblaze fake provider
LLM mock
provider latency simulator
provider failure simulator
B2 mock optional
```

Real staging:

```txt
B2 staging bucket
occasional provider smoke tests
OpenAI/Claude smoke tests with strict limits
```

---

## 10.4 Environment Separation

Separate dev/staging/prod resources.

Each environment gets:

```txt
separate database
separate B2 buckets
separate API keys
separate NATS streams
separate Clerk app
separate provider credentials/quotas
separate LLM provider keys/quotas
```

---

## 10.5 Secrets

Use:

```txt
local:
  .env with mock/staging-limited keys

staging/prod:
  managed secrets store
  rotated provider keys
  separate service identities
  no shared super-key
```

---

## 10.6 CI/CD

Use full gated CI/CD.

PR checks:

```txt
lint
typecheck
unit tests
event schema compatibility
DB migration check
worker contract tests
Mastra agent tool schema tests
template schema validation
step registry validation
LLM structured output contract tests
```

Main branch:

```txt
build containers
deploy staging
smoke test B2/NATS/DB
provider smoke test where safe
LLM smoke test with strict budget
manual/protected prod deploy
```

---

## 11. Analytics

Separate operational analytics from business/media analytics.

Operational analytics:

```txt
generation latency
provider failure rate
cost per clip
capture success rate
QA failure rate
B2 upload latency
NATS dead-letter rate
worker queue lag
LLM cost per task
agent decision latency
agent tool failure rate
```

Business/media analytics:

```txt
views
downloads
shares
product clicks
publish destination
conversion tags
top templates
clip approval rate
template performance
product performance
```

---

## 12. Security Requirements

### 12.1 Service Identities

Every service/worker has a separate identity.

Examples:

```txt
mastra-agent-service:
  agent:reason
  agent:tool_call
  moment:propose
  template:suggest
  qa:explain

genblaze-worker:
  generation:execute
  asset:write_derived
  manifest:write

publish-worker:
  publish:package
  asset:write_published

capture-worker:
  asset:write_raw
  capture:finalize

audit-worker:
  audit:read
  asset:read_metadata
```

No shared internal super-secret.

---

## 12.2 Tenant Isolation

Tenant isolation across:

```txt
Postgres rows
B2 object keys
NATS event payloads
search indexes
audit events
provider cost records
agent memory records
LLM run records
```

Every object includes:

```txt
organization_id
```

Every B2 key begins with:

```txt
tenants/{organization_id}/...
```

Every query/tool checks organization scope.

Enterprise later may support:

```txt
dedicated DB
dedicated buckets
dedicated provider keys
dedicated worker pools
SSO/SAML
```

---

## 12.3 Moderation

Use pre-generation + pre-publish moderation.

Pre-generation:

```txt
raw moment safety
template/prompt safety
product claim safety
```

Pre-publish:

```txt
output safety
caption/title safety
destination policy
required labels
```

---

## 12.4 Human Approval

Human approval required by default for:

```txt
external publish
hard delete
product fact override
major AI restyle
retention/legal policy change
billing cap increase
public share link creation if org requires
```

---

## 13. Data Export and Deletion

Support full data export/delete workflows.

Export package:

```txt
organization metadata
sessions
moments
assets manifest
B2 object manifest
generation runs
provenance links
audit summary
download links where allowed
catalog snapshots
template versions
publish packages
agent memory records where allowed
LLM run metadata where allowed
```

Deletion must respect:

```txt
user request
org retention
legal hold
audit requirements
B2 lifecycle rules
soft delete grace period
search index deletion
share link revocation
agent memory deletion
LLM evidence retention policy
```

---

## 14. Hackathon Build Strategy

The hackathon deliverable should focus on the most impressive end-to-end slice:

> Start a controlled live commerce session, detect a moment using Mastra-powered agents, capture raw source, generate enhanced clip through Genblaze, store raw/enhanced/manifests on Backblaze B2, and show the lineage in the vault UI.

### 14.1 What Must Be Real

Must be real:

```txt
Live Studio or prerecorded-live simulation
moment detection
Mastra agent recommendation
raw clip capture
B2 uploads
Genblaze pipeline usage
enhanced output creation
manifest/provenance writing
review UI
share/export package
B2 object/provenance display
```

### 14.2 What Can Be Simulated

Can be simulated or simplified:

```txt
external TikTok/Instagram publishing
Shopify integration
full RTMP/OBS ingestion
complex analytics
advanced provider fallback
full enterprise admin
full billing
deep agent memory
```

### 14.3 Demo Story

Demo script:

1. User starts a product livestream demo.
2. Host reveals product and mentions offer.
3. Cheap signals detect a candidate.
4. Mastra agent validates the moment and recommends capture/template.
5. Policy service authorizes capture.
6. Raw clip is saved to B2.
7. Genblaze runs enhancement template.
8. Enhanced master clip is generated.
9. Captions/product card/thumbnail are generated.
10. QA passes.
11. Review UI shows raw vs enhanced.
12. User approves canonical version.
13. Publish package/share page is created.
14. Provenance graph shows raw source → Genblaze run → generated output → publish package.
15. B2 object tree/manifests are shown.

### 14.4 Hackathon Success Criteria

The project succeeds if judges can see:

```txt
real app URL
working live/prerecorded session
detected moment
Mastra agent recommendation
raw clip stored in B2
enhanced clip generated through Genblaze
manifest/provenance stored in B2
review UI
share/export page
clear explanation of Mastra + Genblaze + B2 usage
production-minded architecture
```

---

## 15. Roadmap

### Phase 1 — Hackathon Core

```txt
workspace
Clerk auth
Neon Postgres schema
B2 storage integration
NATS events
Mastra agent service
OpenAI LLM integration
Live Studio / prerecorded-live
moment detection v1
capture service
Genblaze worker
template graph v1
review UI
provenance UI
share page
```

### Phase 2 — Production Beta

```txt
controlled rerender
catalog snapshots
CSV import
multi-stage QA
cost ledger
LLMProviderRouter
provider fallback policies
admin recovery console
search/pgvector
operational analytics
retention policies
```

### Phase 3 — Commerce Integrations

```txt
Shopify catalog adapter
OBS/RTMP ingestion
publish adapters
campaign analytics
team workflows
template customization
brand memory
Claude/Gemini fallback routing
```

### Phase 4 — Enterprise

```txt
SSO/SAML
dedicated buckets
object lock/legal hold
audit export
advanced retention
enterprise isolation
role customization
compliance workflows
```

---

## 16. Success Metrics

### Product Metrics

```txt
time_to_first_detected_moment
time_to_first_agent_recommendation
time_to_first_enhanced_clip
clip_approval_rate
rerender_rate
publish_package_creation_rate
search_success_rate
reviewer_time_saved
```

### Media Quality Metrics

```txt
QA pass rate
caption accuracy
product match accuracy
template success rate
thumbnail approval rate
product claim violation rate
```

### System Metrics

```txt
raw_capture_success_rate
B2_upload_success_rate
Genblaze_run_success_rate
provider_failure_rate
dead_letter_rate
cost_per_accepted_clip
cost_per_published_clip
LLM_cost_per_decision
Mastra_tool_call_success_rate
```

### Business Metrics

```txt
clips generated per session
clips approved per session
published clips per campaign
product clicks
downloads/shares
template performance
```

---

## 17. Key Product Decisions Locked

```txt
Cloud strategy:
  Backblaze B2 + best-fit managed services, cloud-agnostic by design

Ingestion:
  dual ingestion architecture, browser-first canonical path

Agent framework:
  Mastra for supervisor + specialist agent orchestration

LLM provider:
  OpenAI primary
  Anthropic Claude fallback/secondary
  Gemini Flash-style cheap validation later
  OpenAI embeddings + pgvector

Agents:
  supervisor + specialist agents
  workflow/state machine owns execution truth
  agents use typed gateways only

Provenance:
  Postgres operational state + B2 immutable manifests

Raw capture:
  canonical evidence with tiered retention

Lineage:
  raw source + live-transformed output when relevant

Automation:
  confidence-tiered moment automation with budget caps

Detection:
  cheap realtime signals first, AI validation second

Boundaries:
  generous raw capture, intelligent final trim

Workflow:
  session workflow + moment workflows
  queue/state-machine now, Temporal-compatible later

Events:
  NATS JetStream
  typed JSON schemas
  versioned events
  DLQ/recovery UI

Backend:
  modular core API + specialized Python workers

Auth:
  Clerk + internal capability authorization

Publishing:
  policy-based, human approval default
  canonical publish package + adapters

Enhancement:
  template-driven hybrid
  typed step graph
  safe step registry
  controlled prompt slots

Media generation:
  Genblaze as generative media orchestration layer

Product accuracy:
  all facts grounded in catalog/campaign snapshots

Search:
  structured + semantic/multimodal
  Postgres/pgvector first with adapter

Deployment:
  containerized services
  separate dev/staging/prod
  full CI/CD
```

---

## 18. Open Questions

The current PRD intentionally leaves these as implementation-level details:

1. Exact first AI media providers beyond Genblaze/Decart.
2. Exact STT provider.
3. Exact vision model for product/frame validation.
4. Exact hosted NATS provider.
5. Exact container hosting provider.
6. Exact media rendering stack for overlays.
7. Exact UI design system.
8. Exact pricing model numbers.
9. Exact retention defaults by plan.
10. Exact hackathon demo product/category.
11. Exact OpenAI model names to use at build time.
12. Exact Claude/Gemini fallback thresholds.

Recommended defaults:

```txt
STT:
  Whisper-style provider/API

Vision:
  OpenAI multimodal for first implementation
  cheap heuristics for proposals

Agent framework:
  Mastra

Primary LLM:
  OpenAI

Fallback:
  Claude later

Embeddings:
  OpenAI embeddings + pgvector

Rendering:
  ffmpeg + Remotion or Python/moviepy-style renderer

NATS:
  managed NATS if possible, otherwise containerized

Hosting:
  Render/Fly/Railway/Cloud Run style containers

Demo category:
  fashion/accessory/product reveal because visuals are easy to understand
```

---

# 19. Expanded Architecture Addendum

This addendum intentionally expands the PRD instead of replacing or compressing it. It preserves the same product scope and adds the missing depth around Mastra, LLM routing, Genblaze usage, service boundaries, event contracts, schemas, permissions, testing, risks, and implementation sequencing.

## 19.1 Final System Mental Model

The system is built as a layered AI media platform, not as one monolithic agent.

```txt
User-facing layer
  Next.js workspace
  Live Studio
  Review Queue
  Moment Vault
  Share Pages
  Admin Console

Agent reasoning layer
  Mastra supervisor agent
  Mastra specialist agents
  OpenAI primary LLM
  Claude fallback / QA secondary
  Gemini Flash-style cheap validation later
  typed internal agent tools

Control plane
  Core API
  Clerk auth verification
  internal RBAC/capability checks
  budget checks
  policy checks
  state-machine transitions
  audit log writes

Event and execution layer
  NATS JetStream
  typed versioned JSON events
  dead-letter streams
  idempotent consumers
  Python worker services

Media generation layer
  Genblaze worker
  provider adapter registry
  Decart / GMI / Runway / OpenAI media providers
  template step graph execution

Vault layer
  Backblaze B2 raw bucket
  Backblaze B2 derived bucket
  Backblaze B2 published bucket
  Backblaze B2 provenance-lock bucket
  B2 manifests and checksums

Operational truth layer
  Neon Postgres
  state machines
  asset index
  run records
  catalog snapshots
  audit logs
  budgets
  permissions
  search index metadata
```

The most important architectural rule is:

> Agents recommend. The control plane authorizes. Workers execute. Genblaze generates media. B2 stores proof. Postgres tracks truth.

---

# 20. Locked Decision Log

The following decisions are considered locked for the current PRD and should be treated as architectural constraints unless explicitly reopened.

## 20.1 Cloud, Storage, and Platform Decisions

| # | Decision | Locked Choice |
|---:|---|---|
| 1 | Cloud strategy | Backblaze B2 + best-fit managed services, cloud-agnostic internal architecture |
| 2 | Primary storage | B2 is canonical media/provenance vault |
| 3 | Operational DB | Neon Postgres |
| 4 | Auth | Clerk auth + internal authorization layer |
| 5 | Event backbone | NATS JetStream |
| 6 | Deployment model | Containerized services, not pure serverless or Kubernetes-first |
| 7 | Environment separation | Separate dev/staging/prod resources |
| 8 | Secrets | Managed secrets store for staging/prod, `.env` only for local/mock keys |
| 9 | CI/CD | Full gated CI/CD |

## 20.2 Ingestion and Capture Decisions

| # | Decision | Locked Choice |
|---:|---|---|
| 10 | Ingestion model | Dual ingestion, browser-first canonical path |
| 11 | Live source support | Camera, screen share, prerecorded-live, upload, future OBS/RTMP |
| 12 | Full session recording | Default moment-only, optional full-session recording policy |
| 13 | Raw capture | Raw clips are canonical evidence with tiered retention |
| 14 | Live transformed output | Capture only when audience-visible or lineage-relevant |
| 15 | Clip boundaries | Generous raw capture first, intelligent trim second |

## 20.3 Agent and LLM Decisions

| # | Decision | Locked Choice |
|---:|---|---|
| 16 | Agent framework | Mastra |
| 17 | Agent architecture | Supervisor + specialist agents |
| 18 | Agent permissions | Agents use typed internal tool gateways only |
| 19 | Agent identity | Service identity + org/session scope + full audit |
| 20 | Primary LLM | OpenAI |
| 21 | Secondary/fallback LLM | Anthropic Claude |
| 22 | Cheap validation later | Gemini Flash-style model |
| 23 | Embeddings | OpenAI embeddings + pgvector |
| 24 | Agent memory | Mastra working memory + Postgres governed typed memory |

## 20.4 Genblaze and Media Decisions

| # | Decision | Locked Choice |
|---:|---|---|
| 25 | Genblaze role | Generative media orchestration layer inside backend workflows |
| 26 | Media providers | Decart/GMI/Runway/OpenAI media models through Genblaze/provider adapters |
| 27 | Provider fallback | Policy-based fallback only |
| 28 | Provider abstraction | Provider adapter layer + Genblaze as primary media orchestrator |
| 29 | Enhanced master | Template-driven hybrid enhancement |
| 30 | AI restyling | Optional and constrained by product accuracy policy |
| 31 | Output model | Canonical enhanced master + destination-specific variants |

## 20.5 Product Accuracy and Review Decisions

| # | Decision | Locked Choice |
|---:|---|---|
| 32 | Product facts | AI can suggest; backend must verify against catalog/campaign |
| 33 | Catalog ingestion | Manual/CSV baseline + adapter architecture |
| 34 | Catalog snapshots | Session snapshot + optional live refresh before publish |
| 35 | Snapshot storage | Postgres queryable rows + B2 immutable manifest |
| 36 | Review UI | Session timeline + individual clip cards |
| 37 | Reviewer editing | Controlled edit + rerender, not full video editor |
| 38 | Publishing | Policy-based, human approval by default |
| 39 | Publish architecture | Canonical publish package + destination adapters |

## 20.6 Data, Events, and Audit Decisions

| # | Decision | Locked Choice |
|---:|---|---|
| 40 | Provenance | Postgres operational state + B2 immutable manifests |
| 41 | Asset versioning | Immutable versions for every rerender |
| 42 | Canonical asset | Promoted through state machine, not latest by default |
| 43 | Event schema | Strongly typed versioned JSON |
| 44 | Subject taxonomy | Stable domain subjects, IDs inside payload |
| 45 | Dead-letter handling | DLQ + recovery UI |
| 46 | Idempotency | Every boundary |
| 47 | Audit logging | Full action audit |
| 48 | Search | Structured + semantic/multimodal |
| 49 | Embeddings | Tiered; full embeddings only for accepted/captured moments |

---

# 21. Mastra Agent Orchestration Specification

## 21.1 Why Mastra Is Used

Mastra is used because this product needs several reasoning-heavy agent tasks that should be structured, testable, and tool-bound:

- deciding whether a live moment is worth capturing,
- validating whether a product appears in the clip,
- matching a visual product to a catalog snapshot,
- selecting the right enhancement template,
- generating hooks/captions/copy within constraints,
- checking whether a generated clip misrepresents the product,
- explaining why a QA gate failed,
- producing structured outputs that the backend can validate.

Mastra is not being used as the durable workflow engine. The backend state machine, Postgres, and NATS are responsible for durable execution.

## 21.2 Mastra Service Boundary

The Mastra service is a TypeScript service with a limited set of responsibilities.

```txt
mastra-agent-service
  exposes internal agent endpoints
  owns agent definitions
  owns tool schemas
  owns structured output schemas
  calls Core API tool gateway
  uses LLMProviderRouter
  reads governed context/memory through APIs
  emits recommendations, not direct side effects
```

It may call only approved internal tools:

```txt
get_session_context()
get_candidate_evidence()
get_catalog_snapshot()
get_org_brand_memory()
validate_product_claim()
propose_moment_candidate()
suggest_template()
suggest_clip_boundaries()
generate_caption_options()
explain_qa_result()
```

It may not call:

```txt
b2_delete_object()
b2_write_canonical_asset()
provider_generate_video_directly()
run_genblaze_directly()
publish_external_directly()
update_billing_budget()
change_retention_policy()
hard_delete_asset()
```

## 21.3 Agent Roster

### 21.3.1 Supervisor Agent

Purpose:

- coordinate specialist agents,
- combine evidence,
- choose final recommendation,
- decide whether a candidate should be captured, queued, enhanced, or ignored.

Inputs:

```txt
session context
candidate evidence
cheap signal scores
catalog snapshot summary
budget/policy summary
org memory summary
```

Output schema:

```json
{
  "recommendation": "capture_and_enhance | capture_only | queue_for_review | ignore",
  "confidence": 0.0,
  "moment_type": "product_reveal | offer_mention | try_on | feature_demo | host_reaction | unknown",
  "recommended_template_id": "string | null",
  "requires_human_review": true,
  "reason": "string",
  "evidence_refs": ["string"]
}
```

### 21.3.2 Signal/Moment Agent

Purpose:

- convert cheap signal bursts into candidate moment proposals,
- explain why the moment may matter,
- identify the strongest evidence.

Output schema:

```json
{
  "start_ms": 0,
  "end_ms": 0,
  "moment_type": "string",
  "confidence": 0.0,
  "reason": "string",
  "evidence_refs": ["transcript_excerpt_id", "frame_ref_id", "signal_id"]
}
```

### 21.3.3 Product Matcher Agent

Purpose:

- match candidate frames/transcript to product snapshot records,
- return possible SKUs with confidence,
- avoid inventing facts.

Output schema:

```json
{
  "matches": [
    {
      "product_id": "string",
      "sku": "string",
      "confidence": 0.0,
      "evidence_refs": ["string"],
      "uncertainty_reason": "string | null"
    }
  ],
  "needs_human_review": true
}
```

### 21.3.4 Clip Boundary Agent

Purpose:

- refine the final trim boundaries inside a generous raw capture window.

Output schema:

```json
{
  "recommended_start_ms": 0,
  "recommended_end_ms": 0,
  "hook_start_ms": 0,
  "cta_end_ms": 0,
  "confidence": 0.0,
  "reason": "string"
}
```

### 21.3.5 Enhancement Planner Agent

Purpose:

- select a template,
- decide whether AI restyle is allowed/recommended,
- choose caption/product-card behavior.

Output schema:

```json
{
  "template_id": "clean_product_reveal_v1",
  "template_version": "1.0.0",
  "ai_restyle_enabled": false,
  "product_card_enabled": true,
  "caption_style": "clean_bold",
  "requires_human_review": false,
  "reason": "string"
}
```

### 21.3.6 Caption and Copy Agent

Purpose:

- generate captions, hooks, titles, descriptions, hashtags, and publish text.

Constraints:

- must use only verified product facts,
- must not invent offers,
- must obey brand memory,
- must obey destination constraints.

Output schema:

```json
{
  "hook_title": "string",
  "caption_text": "string",
  "short_description": "string",
  "hashtags": ["string"],
  "claims_used": ["claim_id"],
  "requires_review": false
}
```

### 21.3.7 QA Agent

Purpose:

- inspect generated assets and metadata,
- classify failures,
- decide whether the clip is safe to review/publish.

Output schema:

```json
{
  "qa_status": "passed | failed | review_required",
  "failure_class": "retryable | remediable | review_required | terminal | null",
  "checks": [
    {
      "check_name": "product_appearance_preserved",
      "status": "pass | fail | uncertain",
      "reason": "string"
    }
  ],
  "recommended_action": "approve_for_review | rerender | escalate_to_human | terminate"
}
```

### 21.3.8 Provenance Explainer Agent

Purpose:

- turn technical lineage into human-readable explanations.

Output examples:

```txt
This clip was generated from raw moment m_01H..., captured from 00:14:12 to 00:14:52. The enhanced master was created with clean_product_reveal_v1 using Genblaze run r_01H..., and published as variant p_01H....
```

## 21.4 Agent Tool Envelope

Every Mastra tool call must include a common envelope.

```json
{
  "tool_call_id": "tc_01H...",
  "agent_id": "enhancement-planner-v1",
  "organization_id": "org_01H...",
  "session_id": "sess_01H...",
  "moment_id": "mom_01H...",
  "requested_by_user_id": null,
  "idempotency_key": "agent-tool:...",
  "trace_id": "trace_...",
  "payload": {}
}
```

The Core API validates:

```txt
agent identity
agent capability
organization scope
session/moment state
budget policy
automation policy
schema validity
idempotency key
audit requirement
```

## 21.5 Agent Memory Governance

Mastra can use working memory during agent runs, but durable memory is stored in Postgres.

Governed memory record fields:

```txt
memory_id
organization_id
campaign_id nullable
session_id nullable
memory_type
source_type
source_id
summary
embedding_id nullable
confidence
created_by_actor_type
created_by_actor_id
valid_from
valid_until nullable
retention_policy
is_active
created_at
updated_at
```

Memory cannot override:

```txt
catalog snapshot facts
allowed claims
product accuracy policy
moderation policy
explicit user settings
budget policy
retention policy
```

---

# 22. LLM Provider and Routing Specification

## 22.1 Provider Roles

LLM providers are divided by task type.

```txt
OpenAI:
  primary reasoning and structured-output provider
  supervisor decisions
  product matching
  moment validation
  caption/copy generation
  embeddings

Anthropic Claude:
  secondary/fallback reasoning
  careful QA/review style tasks
  policy reasoning
  long-form explanations

Google Gemini Flash-style model later:
  cheap/high-volume classification
  low-cost validation
  frame/transcript triage

Genblaze media providers:
  video/image/audio generation and editing
  not normal LLM reasoning
```

## 22.2 LLMProviderRouter Requirements

The app must not hardcode a model in agent logic. All model selection goes through `LLMProviderRouter`.

Router inputs:

```txt
task_type
organization_id
agent_id
quality_policy
latency_policy
cost_policy
fallback_policy
input_modality
output_schema
```

Router outputs:

```txt
provider
model
max_tokens
temperature
structured_output_schema
timeout_ms
max_cost_usd
fallback_chain
```

## 22.3 LLM Run Records

Every LLM call should create an `llm_runs` record.

Fields:

```txt
llm_run_id
organization_id
session_id nullable
moment_id nullable
agent_id
task_type
provider
model
input_hash
output_hash
prompt_template_id
prompt_template_version
structured_output_schema_version
status
estimated_cost_usd
actual_cost_usd nullable
latency_ms
input_tokens nullable
output_tokens nullable
created_at
completed_at nullable
error_code nullable
```

Do not store raw prompt or raw output in normal logs. Store governed evidence separately if needed.

## 22.4 Recommended Initial Routing

Hackathon routing:

```txt
supervisor_decision:
  OpenAI primary

moment_validation:
  OpenAI fast multimodal

product_match:
  OpenAI multimodal

caption_generation:
  OpenAI fast text model

qa_review:
  OpenAI primary, Claude optional if easy

embeddings:
  OpenAI embeddings
```

Production routing:

```txt
supervisor_decision:
  OpenAI primary
  Claude fallback

moment_validation:
  OpenAI fast multimodal primary
  Gemini Flash-style fallback/cheap path

product_match:
  OpenAI multimodal primary
  Gemini fallback later

caption_generation:
  OpenAI primary
  Claude fallback

qa_review:
  Claude primary for careful review
  OpenAI fallback

provenance_explanation:
  OpenAI fast text model

embeddings:
  OpenAI embeddings primary
  future adapter optional
```

## 22.5 LLM Budget Controls

LLM calls must be budgeted separately from media generation calls.

Budget levels:

```txt
org_monthly_llm_budget
campaign_llm_budget
session_llm_budget
agent_daily_cap
model_daily_cap
max_llm_cost_per_moment
max_llm_cost_per_published_clip
```

Budget checks run before:

```txt
agent supervisor calls
vision validation calls
caption generation
QA review calls
embeddings generation
large context explanations
```

---

# 23. Genblaze Usage Specification

## 23.1 What Genblaze Does

Genblaze is the media-generation orchestration layer. It is used when the system needs to create, edit, transform, enhance, or produce media outputs.

Genblaze handles:

```txt
provider orchestration
media pipeline steps
AI video/image/audio provider calls
fallback chains where policy allows
asset output generation
manifest creation
run metadata
parent_run_id lineage
B2 storage handoff
```

## 23.2 What Genblaze Does Not Do

Genblaze does not own:

```txt
Clerk auth
RBAC permissions
agent orchestration
Mastra memory
NATS event streams
Postgres state machines
review UI
billing/budget ledger
catalog snapshots
product fact validation
publish approval
share page permissions
hard delete policy
```

## 23.3 Genblaze Worker Boundary

The Genblaze worker is a Python worker.

Input event:

```txt
generation.requested.v1
```

Inputs:

```txt
generation_run_id
organization_id
moment_id
input_asset_id
template_id
template_version
step_graph_id
product_snapshot_refs
provider_policy
budget_authorization_id
```

Worker responsibilities:

```txt
load generation run
load input asset metadata
fetch raw/mezzanine media from B2
execute approved template step graph
call provider through Genblaze/provider adapter
write outputs to B2 derived bucket
write Genblaze manifest
write app-level provenance sidecar
update generation run through Core API
emit generation.completed or generation.failed
```

## 23.4 Genblaze in the Moment Workflow

```txt
Moment accepted
  ↓
Raw clip captured and normalized
  ↓
Enhancement Planner Agent suggests template
  ↓
Core API checks budget/policy/product facts
  ↓
Generation run created
  ↓
generation.requested event emitted
  ↓
Genblaze worker executes media pipeline
  ↓
Enhanced master + manifests written to B2
  ↓
QA worker validates output
  ↓
Review UI receives ready clip
```

## 23.5 Genblaze Run Provenance

Every Genblaze run must produce or be associated with:

```txt
run_id
parent_run_id
input_asset_id
output_asset_id
provider
model
template_id
template_version
step_graph_version
input_sha256
output_sha256
prompt_hashes if applicable
provider_job_ref
cost estimate
created_at
completed_at
manifest_b2_key
```

## 23.6 Genblaze Step Graph Examples

### Clean Product Reveal

```txt
1. load_raw_mezzanine
2. trim_final_boundaries
3. reframe_vertical
4. generate_captions
5. render_product_card
6. burn_captions
7. generate_thumbnail
8. write_enhanced_master
9. write_manifest
10. emit_output_asset
```

### AI Restyle Product Demo

```txt
1. load_raw_mezzanine
2. verify_restyle_policy
3. mask/protect product region if supported
4. call AI video provider
5. compare product appearance before/after
6. render disclosure label if required
7. write_enhanced_master
8. write_manifest
9. emit_output_asset
```

### Publish Variant Generation

```txt
1. load_enhanced_master
2. render destination crop
3. apply safe zones
4. burn or attach captions
5. package MP4
6. create thumbnail
7. write publish manifest
```

---

# 24. Detailed Data Schema Addendum

This section provides more detailed table-level requirements. Names may change during implementation, but the data captured should remain equivalent.

## 24.1 `sessions`

```txt
session_id ULID PK
organization_id ULID not null
host_user_id ULID nullable
source_type enum(browser_camera, screen_share, upload_prerecorded, obs_rtmp, external_adapter)
status enum(created, opening, live, closing, closed, error, reconciled)
started_at timestamptz nullable
ended_at timestamptz nullable
catalog_snapshot_id ULID nullable
full_session_recording_enabled boolean default false
live_transform_enabled boolean default false
live_transform_audience_visible boolean default false
region text nullable
metadata jsonb
created_at timestamptz
updated_at timestamptz
```

## 24.2 `moments`

```txt
moment_id ULID PK
organization_id ULID not null
session_id ULID not null
state enum(candidate, capture_authorized, capturing, raw_uploaded, enhancement_pending, enhancing, qa_pending, review_pending, approved, canonical, published, rejected, failed, archived, deleted)
start_ms bigint not null
end_ms bigint not null
duration_ms bigint not null
raw_capture_start_ms bigint nullable
raw_capture_end_ms bigint nullable
moment_type text
score numeric
selection_reason text
is_human_confirmed boolean default false
canonical_asset_id ULID nullable
catalog_snapshot_id ULID nullable
created_at timestamptz
updated_at timestamptz
```

## 24.3 `assets`

```txt
asset_id ULID PK
organization_id ULID not null
session_id ULID nullable
moment_id ULID nullable
asset_role enum(raw_source, raw_mezzanine, live_transformed, enhanced_master, publish_variant, thumbnail, captions, transcript, evidence, manifest, catalog_snapshot)
bucket text not null
object_key text not null
mime_type text
bytes bigint
sha256 text
width integer nullable
height integer nullable
duration_ms bigint nullable
frame_count bigint nullable
codec_video text nullable
codec_audio text nullable
retention_class text
verification_status enum(unverified, verified, failed)
created_at timestamptz
updated_at timestamptz
```

## 24.4 `generation_runs`

```txt
generation_run_id ULID PK
organization_id ULID not null
session_id ULID nullable
moment_id ULID nullable
parent_run_id ULID nullable
run_type enum(enhancement, restyle, thumbnail, captions, publish_variant, qa_auxiliary)
status enum(queued, running, provider_pending, completed, failed, cancelled, reconciled)
provider text nullable
model text nullable
template_id ULID nullable
template_version text nullable
step_graph_id ULID nullable
input_asset_id ULID nullable
output_asset_id ULID nullable
manifest_asset_id ULID nullable
provider_job_ref text nullable
estimated_cost_usd numeric nullable
actual_cost_usd numeric nullable
started_at timestamptz nullable
completed_at timestamptz nullable
error_code text nullable
error_message text nullable
metadata jsonb
created_at timestamptz
updated_at timestamptz
```

## 24.5 `agent_tool_calls`

```txt
agent_tool_call_id ULID PK
organization_id ULID not null
session_id ULID nullable
moment_id ULID nullable
agent_id text not null
tool_name text not null
requested_by_user_id ULID nullable
idempotency_key text not null
trace_id text nullable
input_hash text
output_hash text
status enum(started, succeeded, failed, denied)
policy_result jsonb
started_at timestamptz
completed_at timestamptz nullable
error_code text nullable
```

## 24.6 `llm_runs`

```txt
llm_run_id ULID PK
organization_id ULID not null
session_id ULID nullable
moment_id ULID nullable
agent_id text nullable
task_type text not null
provider text not null
model text not null
input_hash text not null
output_hash text nullable
prompt_template_id text nullable
prompt_template_version text nullable
schema_version text nullable
status enum(queued, running, succeeded, failed, cancelled)
estimated_cost_usd numeric nullable
actual_cost_usd numeric nullable
input_tokens integer nullable
output_tokens integer nullable
latency_ms integer nullable
created_at timestamptz
completed_at timestamptz nullable
error_code text nullable
```

## 24.7 `audit_events`

```txt
audit_event_id ULID PK
organization_id ULID not null
actor_type enum(user, service_agent, worker, system)
actor_id text not null
action text not null
resource_type text
resource_id text
session_id ULID nullable
moment_id ULID nullable
asset_id ULID nullable
generation_run_id ULID nullable
before_state text nullable
after_state text nullable
policy_result jsonb nullable
idempotency_key text nullable
request_id text nullable
trace_id text nullable
metadata jsonb
created_at timestamptz
```

---

# 25. Detailed API Addendum

## 25.1 Public/User-Facing API

Use REST/RPC commands plus typed query endpoints.

### Sessions

```txt
POST /api/sessions
GET /api/sessions
GET /api/sessions/{session_id}
POST /api/sessions/{session_id}/start
POST /api/sessions/{session_id}/end
GET /api/sessions/{session_id}/timeline
GET /api/sessions/{session_id}/review-summary
```

### Moments

```txt
GET /api/moments/{moment_id}
POST /api/moments/{moment_id}/approve
POST /api/moments/{moment_id}/reject
POST /api/moments/{moment_id}/rerender
POST /api/moments/{moment_id}/promote-canonical
GET /api/moments/{moment_id}/provenance
GET /api/moments/{moment_id}/evidence
```

### Assets

```txt
GET /api/assets/{asset_id}
GET /api/assets/{asset_id}/signed-url
POST /api/assets/{asset_id}/delete
GET /api/assets/{asset_id}/manifest
```

### Catalog

```txt
POST /api/catalog/products
GET /api/catalog/products
POST /api/catalog/import-csv
POST /api/catalog/snapshots
GET /api/catalog/snapshots/{catalog_snapshot_id}
```

### Publish

```txt
POST /api/publish-packages
GET /api/publish-packages/{publish_package_id}
POST /api/publish-packages/{publish_package_id}/approve
POST /api/publish-packages/{publish_package_id}/create-share-page
GET /api/share/{share_slug}
```

### Review

```txt
GET /api/review-queue
GET /api/review-queue/by-session/{session_id}
GET /api/review-queue/by-campaign/{campaign_id}
```

## 25.2 Internal Agent Tool APIs

These APIs are called by Mastra tools through the Core API.

```txt
POST /internal/agent-tools/propose-moment-candidate
POST /internal/agent-tools/suggest-template
POST /internal/agent-tools/suggest-boundaries
POST /internal/agent-tools/validate-product-match
POST /internal/agent-tools/generate-caption-options
POST /internal/agent-tools/explain-qa-result
POST /internal/agent-tools/read-session-context
POST /internal/agent-tools/read-catalog-snapshot
POST /internal/agent-tools/read-moment-evidence
```

Each endpoint requires:

```txt
service identity token
agent_id
organization scope
capability check
idempotency key
schema validation
audit log
```

## 25.3 Internal Worker APIs

Workers update durable state through Core API instead of writing DB state directly where practical.

```txt
POST /internal/workers/capture-completed
POST /internal/workers/generation-started
POST /internal/workers/generation-completed
POST /internal/workers/generation-failed
POST /internal/workers/qa-completed
POST /internal/workers/publish-completed
POST /internal/workers/asset-verified
POST /internal/workers/dlq-recorded
```

---

# 26. Detailed Event Contract Addendum

## 26.1 Standard Event Envelope

```json
{
  "event_id": "evt_01H...",
  "event_type": "moment.capture.authorized",
  "schema_version": "1.0.0",
  "organization_id": "org_01H...",
  "occurred_at": "2026-06-25T12:00:00.000Z",
  "producer": "core-api",
  "idempotency_key": "capture:org:sess:mom:start:end",
  "correlation_id": "corr_01H...",
  "trace_id": "trace_abc",
  "payload": {}
}
```

## 26.2 `moment.candidate.proposed.v1`

```json
{
  "session_id": "sess_01H...",
  "candidate_id": "cand_01H...",
  "start_ms": 842000,
  "end_ms": 858000,
  "moment_type": "product_reveal",
  "confidence": 0.91,
  "reason": "Product shown close-up and offer mentioned.",
  "evidence_refs": ["sig_01H...", "tr_01H...", "frame_01H..."]
}
```

## 26.3 `moment.capture.authorized.v1`

```json
{
  "session_id": "sess_01H...",
  "moment_id": "mom_01H...",
  "raw_capture_start_ms": 822000,
  "raw_capture_end_ms": 878000,
  "authorization_id": "authz_01H...",
  "policy_result": {
    "budget_allowed": true,
    "duplicate_check": "passed",
    "capture_policy": "allowed"
  }
}
```

## 26.4 `generation.requested.v1`

```json
{
  "generation_run_id": "run_01H...",
  "session_id": "sess_01H...",
  "moment_id": "mom_01H...",
  "input_asset_id": "asset_01H...",
  "template_id": "tpl_clean_product_reveal",
  "template_version": "1.0.0",
  "provider_policy_id": "pp_01H...",
  "budget_authorization_id": "ba_01H..."
}
```

## 26.5 `generation.completed.v1`

```json
{
  "generation_run_id": "run_01H...",
  "moment_id": "mom_01H...",
  "output_asset_id": "asset_01H...",
  "manifest_asset_id": "asset_manifest_01H...",
  "provider": "decart",
  "model": "lucy-2.1",
  "actual_cost_usd": 0.38,
  "duration_ms": 9500
}
```

---

# 27. Testing and Quality Plan

## 27.1 Unit Tests

Required unit test areas:

```txt
permission checks
capability mapping
idempotency key generation
event schema validation
state machine transitions
budget preflight checks
catalog fact validation
template graph validation
step registry validation
agent structured output schemas
B2 object key generation
checksum validation logic
```

## 27.2 Integration Tests

Required integration tests:

```txt
Clerk token → internal user/org mapping
Core API command → Postgres state transition → NATS event
NATS event → worker execution → Core API update
B2 upload → checksum verification → asset row update
Mastra agent tool call → Core API gateway validation
LLMProviderRouter → mocked provider output
Genblaze worker → mocked provider → B2 manifest write
review approval → canonical version promotion
publish package → share page creation
```

## 27.3 Contract Tests

Contract tests must cover:

```txt
Zod event schemas
Pydantic event schemas
agent tool inputs/outputs
worker API payloads
Genblaze worker input contract
B2 manifest schema
app-level provenance manifest schema
LLM structured output schemas
```

## 27.4 End-to-End Demo Test

The critical E2E test is:

```txt
1. create org
2. create product/catalog snapshot
3. start prerecorded-live session
4. detect product reveal candidate
5. Mastra recommends capture/template
6. policy authorizes capture
7. raw clip uploaded to B2
8. generation requested
9. Genblaze worker creates enhanced output
10. QA passes
11. reviewer approves canonical version
12. publish package created
13. share page loads
14. provenance graph shows complete lineage
```

## 27.5 Failure Simulation Tests

The system must simulate:

```txt
B2 upload failure
provider timeout
LLM structured output invalid
agent tool denied by policy
NATS duplicate event
worker crash before ack
DLQ event recovery
checksum mismatch
budget exhausted
duplicate moment candidate
QA remediable failure
QA terminal failure
```

---

# 28. Risk Register

## 28.1 Technical Risks

| Risk | Severity | Mitigation |
|---|---:|---|
| Realtime video plumbing takes too long | High | Use prerecorded-live simulator and browser-first capture first |
| Provider API latency/cost spikes | High | Budget caps, fallback policy, cost estimates, short clips |
| AI output misrepresents product | High | Product accuracy QA, catalog grounding, human review |
| Agent produces invalid actions | High | Typed tools, schema validation, gateway-only side effects |
| B2 object lineage becomes inconsistent | High | Immutable keys, checksums, reconciliation worker |
| Event duplicate causes double generation | Medium | Idempotency at every boundary |
| NATS worker failure loses job | Medium | JetStream durable consumers + DLQ |
| Review UI becomes too complex | Medium | Controlled edit, not full editor |
| Full catalog integration slows build | Medium | Manual/CSV baseline |
| LLM cost grows too fast | Medium | LLMProviderRouter, cheap models later, budgets |

## 28.2 Product Risks

| Risk | Severity | Mitigation |
|---|---:|---|
| Users do not understand provenance value | Medium | Make lineage graph visible and demo-friendly |
| Too much setup before first value | High | Progressive onboarding and demo mode |
| Product feels like generic clipper | Medium | Emphasize B2 vault, catalog grounding, live commerce templates |
| Generated clips are not good enough | High | Templates, controlled rerender, review UI |
| Judges miss Genblaze usage | High | Show Genblaze run/manifests directly in UI/demo |

---

# 29. Implementation Sequence

## 29.1 First End-to-End Slice

Build one complete path first:

```txt
prerecorded-live session
  → cheap signal detection
  → Mastra moment recommendation
  → policy-approved capture
  → B2 raw upload
  → Genblaze enhancement
  → B2 derived output + manifest
  → QA pass
  → review approval
  → share page
  → provenance graph
```

## 29.2 Build Order

1. Repository structure and environment config.
2. Clerk + org/user sync.
3. Neon schema for sessions/moments/assets/runs/audit.
4. B2 buckets and object key utilities.
5. NATS JetStream setup and event schema package.
6. Live Studio/prerecorded-live UI.
7. Capture worker and B2 raw upload.
8. Mastra agent service with OpenAI provider.
9. Moment recommendation tool gateway.
10. Genblaze worker with one template.
11. Review UI.
12. Provenance manifest and graph.
13. Share page.
14. Admin/DLQ minimal console.
15. Demo polish.

## 29.3 Hackathon Cut Line

If time is constrained, these must remain:

```txt
B2 raw/derived storage
Genblaze generation
Mastra agent recommendation
review UI
provenance graph
share page
```

These may be simplified:

```txt
multi-provider fallback
advanced QA
Shopify integration
OBS/RTMP
full analytics
enterprise admin
```

---

# 30. Final Architecture Summary

The final product architecture is:

```txt
Next.js Workspace
  Live Studio
  Review UI
  Moment Vault
  Share Pages

Clerk
  Authentication

Core API
  Authorization
  State transitions
  Budgets
  Policy checks
  Agent tool gateway

Mastra Agent Service
  Supervisor Agent
  Specialist Agents
  OpenAI primary LLM
  Claude fallback later
  Structured recommendations

NATS JetStream
  Durable event transport
  Worker fan-out
  DLQ/replay

Python Workers
  Capture
  Media processing
  Genblaze execution
  QA
  Provenance
  Publishing

Genblaze
  Media generation orchestration
  Provider calls
  Media manifests

Backblaze B2
  Raw clips
  Enhanced clips
  Published variants
  Catalog snapshots
  Provenance manifests

Neon Postgres
  Operational truth
  Permissions
  State machines
  Asset index
  Run records
  Audit logs
  Search metadata
```

The strongest sentence for the product is:

> Live Commerce Moment Vault uses Mastra agents to decide which live-shopping moments matter, Genblaze to generate polished media from those moments, and Backblaze B2 to store every raw, generated, and published asset with durable provenance.
