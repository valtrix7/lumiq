# 15 — Template Step Graph Specification

**Project:** Lumiq — Live Commerce Moment Vault  
**Document ID:** `15-template-step-graph-spec.md`  
**Status:** Draft v1  
**Audience:** media engineers, backend engineers, Genblaze Worker developers, template authors, QA, AI coding agents  
**Depends on:** `00-spec-index.md`, `01-product-requirements.md`, `02-project-constitution.md`, `03-glossary-domain-language.md`, `04-requirements-ears.md`, `06-system-architecture-c4.md`, `07-service-decomposition.md`, `08-data-model-database-schema.md`, `09-api-contract-openapi.yaml`, `10-event-contract-asyncapi.yaml`, `11-json-schemas.md`, `12-agent-architecture-mastra.md`, `13-genblaze-media-pipeline.md`, `14-b2-storage-provenance-spec.md`

---

## 1. Purpose

This document defines Lumiq's enhancement template and step graph system.

Lumiq does not hardcode media workflows directly into workers. It uses versioned enhancement templates that compile into safe, typed step graphs. Those step graphs tell the Genblaze Worker and supporting media workers how to convert an accepted live-commerce moment into an enhanced master, thumbnail, captions, publish variants, QA artifacts, and provenance manifests.

This document answers:

1. What is an enhancement template?
2. What is a template version?
3. What is a step graph?
4. Which step types are allowed?
5. Which operations are forbidden?
6. What are the input and output contracts for each step type?
7. How are templates validated, compiled, versioned, approved, and deprecated?
8. How do template steps interact with Genblaze, FFmpeg-style deterministic processing, Remotion-style rendering, Mastra agents, QA, B2, and Postgres?
9. How do controlled prompt slots work without giving users arbitrary workflow control?
10. What is P0 for the hackathon path and what is P1/P2 for production?

The goal is to make template execution deterministic enough for implementation while still allowing reusable creative workflows.

---

## 2. Research and Source Notes

This spec combines Lumiq's internal documents with current public media-pipeline references available on **2026-06-26**.

Public references used:

```txt
Genblaze GitHub repository:
https://github.com/backblaze-labs/genblaze

FFmpeg filters documentation:
https://ffmpeg.org/ffmpeg-filters.html

Remotion website/docs:
https://www.remotion.dev/
```

Key research facts used:

```txt
Genblaze is an open-source Python SDK by Backblaze for orchestrating generative AI media workflows across video, image, and audio providers.
Genblaze exposes a unified Pipeline / Step API, provider adapters, manifests, storage integration, and SHA-256-backed provenance behavior when bytes are available or transferred into durable object storage.
FFmpeg filter graphs support multiple inputs and outputs through libavfilter; Lumiq must not expose arbitrary FFmpeg strings to users or templates.
Remotion supports programmatic video rendering with React, parameterized video props, previews, and MP4 rendering; Lumiq may use Remotion-style rendering for overlays/product cards, but rendering must be schema-driven and token-compliant.
```

Important constraint:

```txt
This spec does not lock an exact renderer implementation.
P0 may use FFmpeg-only rendering, Remotion-only rendering, or a small controlled renderer, as long as the step contracts, B2 outputs, QA, and provenance rules are preserved.
```

---

## 3. Source-of-Truth Constraints

This document inherits these locked Lumiq rules:

```txt
Agents recommend.
Core API authorizes.
NATS dispatches.
Workers execute.
Genblaze generates media.
B2 stores media and proof.
Postgres tracks operational truth.
```

Template-specific consequences:

```txt
Templates do not grant permission.
Templates do not bypass product fact grounding.
Templates do not bypass QA.
Templates do not execute arbitrary code.
Templates do not create untracked assets.
Templates do not overwrite existing outputs.
Templates compile into typed step graphs validated before execution.
```

---

## 4. Definitions

### 4.1 Enhancement Template

An **enhancement template** is a reusable creative/media workflow definition for a class of live-commerce moment.

Examples:

```txt
clean_product_reveal
feature_demo
price_drop_flash
host_reaction_quote
try_on_before_after
limited_stock_cta
```

A template is a business/media concept. It may have many immutable versions.

### 4.2 Template Version

A **template version** is an immutable versioned configuration object.

It defines:

```txt
moment_type compatibility
output formats
step graph source config
brand rule slots
caption policy
overlay policy
product card policy
AI restyle policy
moderation policy
QA requirements
provider/fallback constraints
controlled prompt slots
```

A template version is never mutated after activation. Changes create a new version.

### 4.3 Step Graph

A **step graph** is a directed acyclic graph of safe, registered step instances.

A step graph defines:

```txt
nodes: step instances
edges: data dependencies
inputs: required asset/context references
outputs: produced asset roles or metadata records
conditions: safe policy-gated branches
retry rules: bounded retry behavior
qa requirements: gates that must run before promotion
```

For P0, step graphs should be simple linear chains with optional gated branches. Production may support richer DAGs.

### 4.4 Step Type

A **step type** is a code-defined safe operation registered in the Step Registry.

Examples:

```txt
load_input_asset
select_trim_boundaries
normalize_mezzanine
reframe_vertical
render_product_card_overlay
generate_captions_from_transcript
burn_captions
generate_thumbnail
call_genblaze_provider
run_post_enhancement_qa
write_provenance_manifest
create_publish_variant
```

### 4.5 Step Instance

A **step instance** is a configured use of a step type inside a specific graph.

Example:

```yaml
step_id: reframe_vertical_01
step_type: reframe_vertical
params:
  aspect_ratio: "9:16"
  safe_zone_profile: "tiktok_reels_shorts_v1"
inputs:
  media_asset_ref: "steps.normalize_mezzanine_01.outputs.mezzanine_asset"
outputs:
  reframed_media_ref: "reframed_media"
```

### 4.6 Step Registry

The **Step Registry** is the code-owned allowlist of executable step types. Template config can reference registry entries, but cannot create new executable behavior.

### 4.7 Controlled Prompt Slot

A **controlled prompt slot** is a user- or agent-provided text field that can influence copy or stylistic choices only within a schema-limited, moderated, provenance-recorded template field.

Examples:

```txt
brand_tone
overlay_copy
hook_title
caption_style
ai_restyle_instruction_optional
```

A controlled prompt slot never controls tool access, state transitions, permissions, provider credentials, arbitrary code, or arbitrary workflow steps.

---

## 5. Ownership Boundaries

## 5.1 Core API owns

```yaml
core_api_owns:
  - template_crud
  - template_version_state
  - template_validation_request
  - active_template_selection
  - generation_run_creation
  - product_fact_validation
  - budget_authorization
  - provider_policy_authorization
  - audit_event_writes
  - state_machine_transitions
```

## 5.2 Template Service owns

The Template Service may be a Core API module at P0.

```yaml
template_service_owns:
  - template_registry_queries
  - template_version_validation
  - step_graph_compilation
  - step_registry_metadata_exposure
  - template_compatibility_checks
  - controlled_prompt_slot_validation
  - template_test_fixture_registry
```

## 5.3 Genblaze Worker owns

```yaml
genblaze_worker_owns:
  - loading_approved_generation_run
  - loading_compiled_step_graph
  - executing_safe_step_instances
  - calling_genblaze_for_provider_steps
  - running_deterministic_media_steps_where_assigned
  - writing_outputs_and_manifests_to_b2
  - reporting_results_to_core_api
```

## 5.4 Mastra Agent Service owns

```yaml
mastra_agent_service_owns:
  - recommending_template
  - suggesting_boundaries
  - suggesting_caption_options
  - explaining_qa_or_provenance
```

Mastra does not execute templates or mutate template state directly.

## 5.5 QA Worker owns

```yaml
qa_worker_owns:
  - pre_enhancement_qa
  - post_enhancement_qa
  - pre_publish_qa
  - failure_classification
  - product_visual_integrity_checks
```

---

## 6. Template Lifecycle

### 6.1 Template entity lifecycle

```txt
created
active
inactive
archived
```

The template entity is a stable container. Template versions hold executable configuration.

### 6.2 Template version lifecycle

```txt
draft
validating
valid
active
deprecated
archived
invalid
```

### 6.3 Lifecycle rules

```yaml
lifecycle_rules:
  draft:
    allowed_actions: [edit, validate, archive]
    executable: false
  validating:
    allowed_actions: [complete_validation, mark_invalid]
    executable: false
  valid:
    allowed_actions: [activate, edit_by_new_version, archive]
    executable: false
  active:
    allowed_actions: [deprecate, archive_by_admin]
    executable: true
  deprecated:
    allowed_actions: [archive]
    executable_for_new_runs: false
    executable_for_existing_reruns: policy_dependent
  archived:
    executable: false
  invalid:
    executable: false
```

### 6.4 Activation requirements

A template version can become `active` only if all are true:

```txt
step graph validates
all step types exist in Step Registry
all required input contracts are satisfied
all output asset roles are allowed
controlled prompt slots are valid
provider policy is valid
cost estimate policy exists
QA requirements exist
moderation policy exists
product fact policy exists
schema hash is recorded
sample fixture run passes or is explicitly waived by admin for non-P0 templates
```

---

## 7. Template Data Model

The database schema already defines:

```txt
enhancement_templates
template_versions
step_graphs
step_registry_metadata
```

This spec adds detailed semantic expectations.

### 7.1 `enhancement_templates`

```yaml
table: enhancement_templates
purpose: Stable template family record.
required_fields:
  - template_id
  - organization_id nullable
  - name
  - slug
  - moment_type nullable
  - is_system_template
  - is_active
  - created_at
  - updated_at
rules:
  - System templates have organization_id=null.
  - Organization templates are scoped to one organization.
  - Slug uniqueness is scoped by organization_id, with system templates treated separately.
```

### 7.2 `template_versions`

```yaml
table: template_versions
purpose: Immutable executable config snapshot.
required_fields:
  - template_version_id
  - template_id
  - version
  - operations_json
  - brand_rules_json
  - ai_restyle_policy_json
  - caption_policy_json
  - overlay_policy_json
  - product_card_policy_json
  - moderation_policy_json
  - status
  - created_at
rules:
  - Active versions are immutable.
  - Any edit to active behavior creates a new version.
  - Version strings should use semver where practical.
```

### 7.3 `step_graphs`

```yaml
table: step_graphs
purpose: Compiled graph representation.
required_fields:
  - step_graph_id
  - template_version_id
  - graph_json
  - graph_hash
  - validation_status
  - created_at
rules:
  - graph_hash must be calculated from canonicalized graph_json.
  - graph_hash is included in generation run metadata and provenance manifests.
  - Unknown step types invalidate the graph.
```

### 7.4 `step_registry_metadata`

```yaml
table: step_registry_metadata
purpose: Queryable metadata for code-defined step types.
required_fields:
  - step_type
  - description
  - input_schema_ref
  - output_schema_ref
  - executor_name
  - allowed
  - cost_estimate_policy_json
  - created_at
rules:
  - Database rows describe registered code; they do not create executable code.
  - allowed=false blocks new template validation.
```

---

## 8. Step Graph Contract

### 8.1 Graph envelope

Every compiled graph must use a stable envelope.

```json
{
  "schema_version": "1.0.0",
  "step_graph_id": "01J...",
  "template_id": "tpl_clean_product_reveal",
  "template_version": "1.0.0",
  "graph_type": "enhancement",
  "input_contract": {},
  "nodes": [],
  "edges": [],
  "output_contract": {},
  "qa_requirements": {},
  "cost_policy": {},
  "created_at": "2026-06-26T00:00:00.000Z"
}
```

### 8.2 Node contract

```json
{
  "step_id": "reframe_vertical_01",
  "step_type": "reframe_vertical",
  "executor": "media_processing_worker",
  "priority": "P0",
  "params": {},
  "inputs": {},
  "outputs": {},
  "retry_policy": {
    "max_attempts": 2,
    "backoff": "exponential",
    "retry_on": ["transient_worker_error"]
  },
  "on_failure": "fail_run",
  "requires": {
    "capabilities": ["generation:execute"],
    "asset_roles": ["raw_mezzanine"],
    "qa_before": [],
    "qa_after": []
  }
}
```

### 8.3 Edge contract

```json
{
  "from": "normalize_mezzanine_01.outputs.mezzanine_asset_ref",
  "to": "reframe_vertical_01.inputs.media_asset_ref"
}
```

### 8.4 Input contract

Every enhancement graph must declare the required generation context.

```yaml
required_graph_inputs:
  - organization_id
  - session_id
  - moment_id
  - generation_run_id
  - input_asset_id
  - input_asset_role
  - template_id
  - template_version
  - catalog_snapshot_id nullable
  - product_match_result nullable
  - verified_claim_refs array
  - budget_authorization_id
  - provider_policy_id nullable
  - trace_id
```

### 8.5 Output contract

Every graph must declare expected outputs.

```yaml
required_graph_outputs:
  - output_asset_roles
  - manifest_asset_roles
  - generated_metadata
  - provenance_links
  - qa_pending_or_completed_status
```

For P0 `clean_product_reveal_v1`, outputs must include:

```txt
enhanced_master
thumbnail
captions or caption_metadata
provenance_manifest
genblaze_manifest if provider step ran
```

---

## 9. Common Data Contracts

### 9.1 `AssetRef`

```yaml
AssetRef:
  asset_id: ulid
  organization_id: ulid
  session_id: ulid nullable
  moment_id: ulid nullable
  asset_role: raw_source | raw_mezzanine | live_transformed | enhanced_master | publish_variant | thumbnail | captions | manifest
  bucket: string
  object_key: string
  sha256: string nullable
  mime_type: string nullable
  duration_ms: integer nullable
  width: integer nullable
  height: integer nullable
  verification_status: unverified | verified | failed
```

### 9.2 `TimelineRange`

```yaml
TimelineRange:
  start_ms: integer
  end_ms: integer
  source: candidate | raw_capture | agent_boundary | reviewer_edit | policy_default
  confidence: number_0_to_1 nullable
  reason: string nullable
```

### 9.3 `ProductFactBundle`

```yaml
ProductFactBundle:
  catalog_snapshot_id: ulid
  product_id: ulid nullable
  sku: string nullable
  product_name: string nullable
  product_url: string nullable
  approved_claim_refs: string_array
  blocked_claims: string_array
  snapshot_hash: string
  facts_verified_at: iso_datetime
```

Rules:

```txt
The graph may consume ProductFactBundle.
The graph may not invent ProductFactBundle.
The graph may not render claims absent from ProductFactBundle.approved_claim_refs.
```

### 9.4 `RenderPlan`

```yaml
RenderPlan:
  output_format: mp4 | webm | jpg | png | vtt | srt | json
  aspect_ratio: "9:16" | "1:1" | "16:9"
  width: integer
  height: integer
  fps: integer
  safe_zone_profile: string
  overlay_layers: array
  caption_policy_ref: string nullable
  product_card_policy_ref: string nullable
```

### 9.5 `CaptionTrack`

```yaml
CaptionTrack:
  caption_id: ulid nullable
  source: transcript_excerpt | stt | manual_edit | agent_suggestion
  format: vtt | srt | json
  language: string
  segments:
    - start_ms: integer
      end_ms: integer
      text: string
      confidence: number_0_to_1 nullable
```

### 9.6 `StepResult`

```yaml
StepResult:
  step_id: string
  status: succeeded | failed | skipped | review_required
  started_at: iso_datetime
  completed_at: iso_datetime nullable
  output_refs: object
  metrics: object
  error_code: string nullable
  error_message: string nullable
```

---

## 10. Step Registry — Allowed Step Types

## 10.1 Registry principles

```txt
Step types are code-defined.
Step instances are config-defined.
Unknown step types are rejected.
User-defined executable code is forbidden.
Provider calls must go through Genblaze/provider adapters.
Every step must declare input schema, output schema, permissions, cost estimate, retry policy, and produced asset roles.
```

## 10.2 P0 step types

```yaml
p0_step_types:
  load_input_asset:
    category: input
    executor: genblaze_worker
    inputs: [generation_run_id, input_asset_id]
    outputs: [AssetRef]

  verify_input_asset:
    category: preflight
    executor: genblaze_worker
    inputs: [AssetRef]
    outputs: [verification_result]

  select_trim_boundaries:
    category: planning
    executor: genblaze_worker
    inputs: [moment, raw_capture_range, boundary_recommendation_optional]
    outputs: [TimelineRange]

  normalize_mezzanine:
    category: deterministic_media
    executor: media_processing_worker_or_genblaze_worker
    inputs: [AssetRef]
    outputs: [raw_mezzanine_asset_or_working_ref]

  reframe_vertical:
    category: deterministic_media
    executor: media_processing_worker_or_genblaze_worker
    inputs: [AssetRef, TimelineRange]
    outputs: [working_media_ref]

  generate_captions_from_transcript:
    category: captions
    executor: genblaze_worker_or_caption_worker
    inputs: [transcript_excerpt, TimelineRange]
    outputs: [CaptionTrack]

  render_product_card_overlay:
    category: deterministic_render
    executor: renderer
    inputs: [working_media_ref, ProductFactBundle, RenderPlan]
    outputs: [working_media_ref]

  burn_captions:
    category: deterministic_render
    executor: renderer
    inputs: [working_media_ref, CaptionTrack]
    outputs: [working_media_ref]

  normalize_audio:
    category: deterministic_media
    executor: media_processing_worker_or_genblaze_worker
    inputs: [working_media_ref]
    outputs: [working_media_ref]

  generate_thumbnail:
    category: deterministic_media
    executor: media_processing_worker_or_genblaze_worker
    inputs: [working_media_ref, thumbnail_policy]
    outputs: [thumbnail_asset]

  write_enhanced_master:
    category: storage
    executor: genblaze_worker
    inputs: [working_media_ref]
    outputs: [enhanced_master_asset]

  write_provenance_manifest:
    category: provenance
    executor: genblaze_worker
    inputs: [generation_context, step_results, asset_refs]
    outputs: [manifest_asset]

  run_post_enhancement_qa:
    category: qa
    executor: qa_worker_or_genblaze_worker_delegate
    inputs: [enhanced_master_asset, ProductFactBundle, step_results]
    outputs: [qa_result]
```

## 10.3 P1 step types

```yaml
p1_step_types:
  call_genblaze_provider:
    category: generative_media
    executor: genblaze_worker
    policy_required: true
    outputs: [working_media_ref_or_asset_ref, provider_metadata]

  detect_subject_and_product:
    category: vision_analysis
    executor: qa_worker_or_genblaze_worker
    outputs: [subject_bbox, product_bbox, confidence]

  product_region_protect_mask:
    category: product_integrity
    executor: media_processing_worker_or_genblaze_worker
    outputs: [mask_ref]

  ai_background_cleanup:
    category: generative_media
    executor: genblaze_worker
    policy_required: true

  ai_restyle_background_only:
    category: generative_media
    executor: genblaze_worker
    policy_required: true
    human_review_required_when_uncertain: true

  render_destination_variant:
    category: publish_variant
    executor: publish_worker
    outputs: [publish_variant_asset]

  attach_sidecar_captions:
    category: captions
    executor: publish_worker
    outputs: [caption_asset]

  create_publish_package_manifest:
    category: publish
    executor: publish_worker
    outputs: [publish_manifest_asset]
```

## 10.4 P2/P3 step types

```yaml
future_step_types:
  shopify_square_variant:
    category: commerce_adapter
  external_social_safe_zone_pack:
    category: publish_adapter
  multilingual_caption_translation:
    category: localization
  object_lock_manifest_write:
    category: enterprise_provenance
  c2pa_assertion_embed:
    category: provenance_future
  live_transform_compare:
    category: product_integrity
```

---

## 11. Forbidden Step Types and Parameters

Forbidden in every template:

```txt
arbitrary shell command
arbitrary FFmpeg string from template config or user input
arbitrary SQL
arbitrary HTTP request
arbitrary provider API call
arbitrary filesystem path
raw provider credential
raw B2 credential
raw database credential
unbounded loop
user-defined executable code
unvalidated prompt injection into workflow control
step that deletes assets
step that publishes externally
step that changes budget or retention policy
step that overrides product facts
step that marks QA passed without checks
```

Dangerous field names are disallowed unless explicitly defined in a schema:

```txt
command
script
shell
sql
exec
eval
provider_key
secret
credential
raw_prompt
raw_transcript
```

---

## 12. Deterministic Media Operations

Deterministic media operations may use FFmpeg/libavfilter, Remotion, Python media libraries, or a controlled renderer.

Rules:

```txt
The operation must be selected by step_type.
Parameters must be schema-validated.
The worker must generate any FFmpeg command/filter graph internally from safe parameters.
User/template config may not provide raw FFmpeg strings.
Every output must be written as a tracked AssetRef or working reference.
Every canonical output must get sha256 before being marked verified.
```

Allowed deterministic operations:

```txt
trim
remux
transcode
scale
crop
pad
reframe
normalize_audio
extract_thumbnail
extract_frame_refs
render_static_overlay
render_product_card
burn_captions
attach_sidecar_caption
package_mp4
package_zip_later
```

Recommended P0 renderer approach:

```txt
Use FFmpeg/movie pipeline for basic trim, crop, audio normalization, caption burn, and thumbnail extraction.
Use a small controlled overlay renderer or Remotion-style renderer for product card overlays if time allows.
Keep all renderer props schema-based and derived from tokens/product facts.
```

---

## 13. Generative Media Operations

Generative operations are only allowed through `call_genblaze_provider` or a named Genblaze-compatible step type.

Required preconditions:

```txt
generation_run exists
input asset is verified or explicit exception is recorded
budget authorization exists
provider policy exists
template permits provider step
product safety policy permits provider step
AI restyle policy permits provider step
moderation policy permits provider step
fallback policy is known
trace_id exists
```

Required outputs:

```txt
provider
model
provider_job_ref nullable
input_asset_ids
output_asset_ids or temporary refs
input_sha256 where available
output_sha256 where available
prompt_hashes where applicable
provider_metadata_json
cost estimate and actual cost where available
Genblaze manifest ref
```

Generative product restyling must default to `review_required` unless the output is clearly limited to non-product regions or the QA policy explicitly allows auto-review.

---

## 14. Controlled Prompt Slots

### 14.1 Allowed slots

```yaml
controlled_prompt_slots:
  brand_tone:
    max_length: 120
    allowed_source: org_brand_memory_or_user_setting
    affects: copy_style
  overlay_copy:
    max_length: 80
    allowed_source: reviewer_or_caption_agent
    affects: rendered_overlay_text
  hook_title:
    max_length: 90
    allowed_source: reviewer_or_caption_agent
    affects: title_card_or_publish_copy
  caption_style:
    enum: [clean_bold, minimal, creator_casual, premium_editorial]
    affects: caption_rendering
  ai_restyle_instruction:
    max_length: 200
    allowed_source: reviewer
    affects: provider_prompt_modifier
    requires_policy: ai_restyle_allowed
    human_review_required: true
```

### 14.2 Slot validation

Every slot must pass:

```txt
schema validation
length validation
moderation where required
product claim validation where text is rendered or published
prompt injection filtering as untrusted content
provenance recording with input_hash
human review when policy requires
```

### 14.3 Slot anti-patterns

Forbidden slot behavior:

```txt
slot chooses arbitrary step_type
slot disables QA
slot chooses provider credentials
slot changes capture policy
slot writes B2 keys
slot changes product facts
slot requests ungrounded claims
slot bypasses moderation
```

---

## 15. Template Compatibility Rules

A template version declares compatibility with:

```txt
moment_type
asset_role input
source_type optional
catalog mode
product fact requirements
AI restyle policy
output aspect ratios
destination types
```

### 15.1 Moment type compatibility

```yaml
moment_type_template_map:
  product_reveal:
    default_templates: [clean_product_reveal_v1, product_card_showcase_v1]
  offer_mention:
    default_templates: [price_drop_flash_v1, offer_callout_v1]
  feature_demo:
    default_templates: [feature_demo_v1]
  try_on:
    default_templates: [try_on_before_after_v1]
  host_reaction:
    default_templates: [host_reaction_quote_v1]
  limited_stock_cta:
    default_templates: [limited_stock_cta_v1]
```

### 15.2 Catalog requirements

```yaml
catalog_requirement_levels:
  none:
    allowed_mode: demo_generic
    product_overlay_allowed: false
  product_identity:
    required: [product_id, product_name]
    product_overlay_allowed: true
  offer_claim:
    required: [product_id, approved_claim_refs, campaign_offer]
    product_overlay_allowed: true
    offer_overlay_allowed: true
  publish_ready:
    required: [product_url, refreshed_critical_facts]
```

### 15.3 Restyle compatibility

```yaml
restyle_policy:
  default: disabled
  allowed_without_review:
    - lighting_normalization
    - denoise
    - background_cleanup_without_product_change
  review_required:
    - background_style_change
    - host_style_change
    - simulated_try_on
  forbidden_or_terminal:
    - product_color_change
    - product_shape_change
    - product_material_change
    - added_features
    - packaging_change
```

---

## 16. Default System Templates

## 16.1 `clean_product_reveal_v1`

Purpose:

```txt
Turn a high-confidence product reveal into a clean vertical commerce clip with captions, product card, thumbnail, QA, and provenance.
```

Required inputs:

```txt
raw_mezzanine or raw_source
moment_id
raw_capture_range
final_trim_recommendation optional
catalog_snapshot optional for generic mode, required for product card
verified product facts if product card enabled
```

Graph:

```yaml
template_id: clean_product_reveal
template_version: 1.0.0
graph_type: enhancement
nodes:
  - step_id: load_input_01
    step_type: load_input_asset
  - step_id: verify_input_01
    step_type: verify_input_asset
  - step_id: trim_01
    step_type: select_trim_boundaries
  - step_id: mezzanine_01
    step_type: normalize_mezzanine
  - step_id: reframe_01
    step_type: reframe_vertical
    params:
      aspect_ratio: "9:16"
      preserve_product_bbox: true
  - step_id: captions_01
    step_type: generate_captions_from_transcript
  - step_id: product_card_01
    step_type: render_product_card_overlay
    condition: product_fact_bundle.present
  - step_id: burn_captions_01
    step_type: burn_captions
  - step_id: audio_01
    step_type: normalize_audio
  - step_id: thumbnail_01
    step_type: generate_thumbnail
  - step_id: master_01
    step_type: write_enhanced_master
  - step_id: manifest_01
    step_type: write_provenance_manifest
  - step_id: qa_01
    step_type: run_post_enhancement_qa
outputs:
  - enhanced_master
  - thumbnail
  - captions
  - provenance_manifest
```

P0 status:

```txt
Required for hackathon golden path.
```

## 16.2 `price_drop_flash_v1`

Purpose:

```txt
Highlight a verified offer or discount mention with an offer-safe overlay.
```

Hard gates:

```txt
campaign_offer must exist
allowed claim must exist
offer must not be expired at generation time
pre-publish refresh required before external publish
```

If no verified offer exists:

```txt
Do not render price/discount overlay.
Fall back to generic product reveal or queue for review.
```

## 16.3 `feature_demo_v1`

Purpose:

```txt
Show a feature demonstration while preserving source truth and avoiding unsupported claims.
```

Hard gates:

```txt
feature claim must be in allowed_product_claims if rendered as text
caption text may quote host transcript but cannot turn host speculation into verified claim
```

## 16.4 `host_reaction_quote_v1`

Purpose:

```txt
Create a short reaction/quote clip with transcript-backed caption emphasis.
```

Hard gates:

```txt
quote must come from transcript excerpt or manual reviewer edit
no product claims added unless grounded
```

## 16.5 `publish_variant_9_16_v1`

Purpose:

```txt
Convert an approved enhanced master into a destination-safe vertical variant.
```

Hard gates:

```txt
canonical enhanced master exists
QA passed or reviewer override exists
publish package exists or is being created
```

---

## 17. Template Selection

Template selection happens before generation_run creation.

Sources:

```txt
Enhancement Planner Agent recommendation
moment_type defaults
reviewer selection
organization preferred template
campaign template policy
```

Selection gates:

```txt
template is active
template compatible with moment_type
template compatible with input asset role
template compatible with catalog/product facts
template budget estimate is allowed
template provider policy is allowed
template output destination is allowed
```

Template selection is not final until Core API validates it.

---

## 18. Compilation and Validation

### 18.1 Compile process

```txt
Template version config
  ↓
Schema validation
  ↓
Step type registry validation
  ↓
Input/output contract validation
  ↓
Policy compatibility validation
  ↓
Cost estimate validation
  ↓
QA requirement validation
  ↓
Canonical graph_json generation
  ↓
graph_hash calculation
  ↓
step_graphs row creation
```

### 18.2 Validation failures

Validation failure classes:

```txt
schema_invalid
unknown_step_type
forbidden_param
missing_input_contract
invalid_output_role
unsafe_prompt_slot
missing_qa_gate
missing_cost_policy
provider_policy_invalid
product_claim_policy_invalid
cycle_detected
```

### 18.3 DAG rules

```yaml
dag_rules:
  - graph_must_be_acyclic
  - every_required_output_must_have_producer
  - every_node_input_must_be_satisfied_by_graph_input_or_previous_output
  - no_node_may_reference_future_output
  - conditional_branches_must_have_safe_static_conditions
  - runtime_condition_must_be_policy_or_context_field_not_freeform_expression
```

Forbidden condition examples:

```txt
eval(user_input)
run shell command
call HTTP URL
dynamic import
unbounded while loop
```

Allowed condition examples:

```txt
product_fact_bundle.present
ai_restyle_policy.enabled
live_transformed_asset.present
publish_destination == "internal_library"
qa_status == "passed"
```

---

## 19. Execution Semantics

### 19.1 Run start

When Genblaze Worker consumes `generation.requested`:

```txt
1. Deduplicate by generation_run_id and idempotency_key.
2. Load generation_run through Core API.
3. Verify run status allows execution.
4. Load input asset metadata.
5. Load template_version and compiled step_graph.
6. Verify graph_hash matches generation_run metadata.
7. Load provider policy and budget authorization.
8. Start step execution.
```

### 19.2 Step status

Recommended in-memory and persisted step statuses:

```txt
pending
running
succeeded
skipped
failed
retrying
review_required
cancelled
```

P0 may store step statuses inside generation_run `metadata_json`; P1 should introduce a `generation_run_steps` table if detailed recovery is needed.

### 19.3 Worker acknowledgement

A worker may acknowledge `generation.requested` only after one of these durable outcomes exists:

```txt
generation_run marked completed through Core API
generation_run marked failed through Core API
step failure recorded and DLQ/retry policy owns next attempt
```

### 19.4 Idempotency

Recommended idempotency keys:

```txt
template-compile:{template_version_id}:{graph_hash}
step:{generation_run_id}:{step_id}:{input_hash}
asset-write:{organization_id}:{generation_run_id}:{step_id}:{asset_role}:{output_hash}
manifest-write:{organization_id}:{generation_run_id}:{manifest_type}:{graph_hash}
```

---

## 20. Cost Estimation

Every step type has a cost estimate function.

Cost categories:

```txt
cpu_media_processing
storage_write
llm_reasoning
stt
vision_analysis
generative_video
generative_image
generative_audio
rendering
qa
```

Example estimate envelope:

```json
{
  "step_id": "call_provider_01",
  "step_type": "call_genblaze_provider",
  "estimated_cost_usd": 0.42,
  "estimated_duration_ms": 18000,
  "cost_source": "provider_policy_v1",
  "confidence": 0.65
}
```

Rules:

```txt
Core API checks budget before generation_run creation.
Genblaze Worker re-checks policy context before expensive provider calls where practical.
Actual cost is reconciled after provider response where available.
```

---

## 21. QA Requirements in Templates

Templates declare mandatory QA gates.

### 21.1 Pre-enhancement QA

Required before generation starts:

```txt
raw_moment_usable
input_asset_verified_or_exception_recorded
product_match_confident_or_review_required
claims_grounded
template_allowed
budget_allowed
provider_policy_allowed
```

### 21.2 Post-enhancement QA

Required after enhanced master creation:

```txt
render_succeeded
asset_checksum_verified
captions_match_transcript
overlays_use_approved_facts
product_appearance_preserved
safe_zone_acceptable
quality_score_acceptable
provenance_manifest_valid
```

### 21.3 Pre-publish QA

Required before external publish:

```txt
canonical_asset_exists
approval_exists
price_availability_refreshed_where_supported
offer_validity_current
required_labels_present
publish_package_valid
share_policy_valid
```

---

## 22. Provenance Requirements

Every template execution must record:

```txt
template_id
template_version
step_graph_id
graph_hash
step_results
input_asset_ids
output_asset_ids
prompt_slot_hashes
provider/model refs
policy results
qa results
catalog_snapshot_id and hash where applicable
b2_object_keys
created_at
trace_id
```

B2 objects written by template execution:

```txt
runs/{generation_run_id}/inputs/input_manifest.json
runs/{generation_run_id}/outputs/{asset_id}.mp4
runs/{generation_run_id}/outputs/{thumbnail_asset_id}.jpg
runs/{generation_run_id}/captions/{caption_id}.vtt
runs/{generation_run_id}/manifest/genblaze_manifest.json
runs/{generation_run_id}/provenance/provenance.json
```

---

## 23. API and Event Touchpoints

### 23.1 API endpoints

Relevant existing/expected endpoints:

```txt
POST /api/moments/{moment_id}/rerender
POST /internal/workers/generation-started
POST /internal/workers/generation-completed
POST /internal/workers/generation-failed
POST /internal/agent-tools/suggest-template
```

Potential P1 endpoints:

```txt
GET /api/templates
POST /api/templates
GET /api/templates/{template_id}
POST /api/templates/{template_id}/versions
POST /api/template-versions/{template_version_id}/validate
POST /api/template-versions/{template_version_id}/activate
GET /api/step-registry
```

### 23.2 Events

Relevant NATS subjects:

```txt
generation.requested
generation.started
generation.completed
generation.failed
qa.completed
review.approved
publish.requested
```

Template-specific payload fields should appear in `generation.requested` or be loadable by `generation_run_id`:

```txt
template_id
template_version
step_graph_id
graph_hash
provider_policy_id
budget_authorization_id
controlled_prompt_slot_hashes
```

---

## 24. P0 Hackathon Slice

P0 must implement at least:

```txt
one active system template: clean_product_reveal_v1
safe step registry metadata for P0 steps
compiled step graph JSON for clean_product_reveal_v1
generation.requested consumption by Genblaze Worker
raw/mezzanine input loading
deterministic trim/reframe/caption/product-card/thumbnail steps where feasible
enhanced_master asset write
provenance manifest write
QA pass/fail handoff
review UI can show template_id/template_version/step_graph_id
```

P0 can simplify:

```txt
provider fallback
advanced AI restyle
Remotion rendering
multilingual captions
destination-specific social variants
step-level persisted table
full template authoring UI
```

---

## 25. Production Beta Scope

P1 should add:

```txt
template authoring UI for admins/editors
controlled edit + rerender UI
step-level run records
more templates
provider fallback policies
AI restyle with product protection
destination variants
template validation test fixtures
cost estimation dashboard
template performance analytics
```

---

## 26. Testing Requirements

### 26.1 Unit tests

```txt
template schema validation
unknown step rejection
forbidden parameter rejection
DAG cycle rejection
input/output contract validation
controlled prompt slot validation
cost estimate function returns bounded result
step registry allowed=false blocks validation
```

### 26.2 Integration tests

```txt
template version validates and compiles
generation.requested loads correct graph
Genblaze Worker executes P0 graph with mock media
output asset row and B2 object are created
provenance manifest contains template and graph fields
rerender creates new asset/version
provider step failure respects fallback policy
```

### 26.3 Fixture templates

```txt
valid_clean_product_reveal
invalid_unknown_step
invalid_shell_command_param
invalid_missing_output
invalid_ungrounded_offer_overlay
valid_generic_demo_template_without_product_card
valid_offer_template_with_claim
```

---

## 27. Metrics

Operational metrics:

```txt
template_validation_success_rate
template_validation_failure_count_by_reason
generation_success_rate_by_template
generation_latency_by_template
qa_failure_rate_by_template
rerender_rate_by_template
cost_per_template_run
provider_failure_rate_by_template
step_failure_rate
```

Product/media metrics:

```txt
clip_approval_rate_by_template
publish_package_creation_rate_by_template
thumbnail_approval_rate
caption_correction_rate
product_claim_violation_rate
```

---

## 28. AI Coding Agent Instructions

```txt
1. Do not add template behavior without registering a safe step type.
2. Do not put raw FFmpeg strings, shell commands, or provider calls inside template JSON.
3. Do not let templates create or mutate B2 keys directly.
4. Do not let templates bypass product fact grounding.
5. Do not let templates disable QA.
6. Do not overwrite generated outputs during rerender.
7. Do not hardcode provider model IDs inside templates unless policy explicitly allows it.
8. Do not store raw prompts or full transcripts in template metadata.
9. Update JSON schemas before adding new graph fields.
10. Add tests for every new step type.
```

---

## 29. Open Questions

The following are intentionally not locked in this document:

```txt
1. Exact renderer stack for product cards: FFmpeg-only, Remotion, custom canvas, or hybrid.
2. Exact first STT provider for captions when transcript is unavailable.
3. Exact first media provider for optional AI restyle.
4. Whether P1 introduces a generation_run_steps table or keeps step details in metadata_json.
5. Exact template authoring UI scope.
6. Exact destination safe-zone profiles for TikTok, Reels, Shorts, Shopify, and internal share pages.
7. Exact versioning format for organization-specific templates.
```

Recommended defaults:

```txt
P0 renderer:
  FFmpeg + simple controlled overlay renderer

P0 template:
  clean_product_reveal_v1 only

P0 captions:
  transcript-derived VTT or burned captions

P0 product card:
  render only name/SKU/product URL if grounded; no discount unless allowed claim exists

P0 restyle:
  off by default
```
