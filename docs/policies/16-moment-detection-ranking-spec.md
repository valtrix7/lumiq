# 16 — Moment Detection & Ranking Specification

**Project:** Lumiq — Live Commerce Moment Vault  
**Document ID:** `16-moment-detection-ranking-spec.md`  
**Status:** Draft v1  
**Audience:** AI engineers, backend engineers, signal-processing engineers, Mastra developers, media engineers, QA, product, AI coding agents  
**Depends on:** `00-spec-index.md`, `01-product-requirements.md`, `02-project-constitution.md`, `03-glossary-domain-language.md`, `04-requirements-ears.md`, `05-user-flows-ux-spec.md`, `06-system-architecture-c4.md`, `07-service-decomposition.md`, `08-data-model-database-schema.md`, `09-api-contract-openapi.yaml`, `10-event-contract-asyncapi.yaml`, `11-json-schemas.md`, `12-agent-architecture-mastra.md`, `15-template-step-graph-spec.md`

---

## 1. Purpose

This document defines Lumiq's moment detection, signal scoring, AI validation, ranking, duplicate suppression, and capture policy architecture.

Lumiq must find valuable live-commerce moments without becoming an unsafe auto-capture/autopublish system. Cheap realtime signals propose candidates. Mastra agents validate promising windows. The Moment Ranker converts evidence into a normalized score. The MomentPolicyService decides whether raw capture and enhancement are allowed.

This document answers:

1. Which signals are emitted?
2. How are signals normalized and stored?
3. How are candidate windows created?
4. How does AI validation fit into the pipeline?
5. How is a moment score calculated?
6. What thresholds drive capture/enhancement/review behavior?
7. How does duplicate suppression work?
8. What capture policy checks are required?
9. How are evidence trails preserved?
10. What is P0 for the hackathon and P1/P2 for production?

---

## 2. Research and Source Notes

This spec combines Lumiq's internal documents with current public technical references available on **2026-06-26**.

Public references used:

```txt
OpenAI Speech to Text API:
https://developers.openai.com/api/docs/guides/speech-to-text

PySceneDetect detector documentation:
https://www.scenedetect.com/docs/latest/api/detectors.html

Google MediaPipe Object Detector task guide:
https://developers.google.com/edge/mediapipe/solutions/vision/object_detector

Google Cloud Video Intelligence shot change detection:
https://docs.cloud.google.com/video-intelligence/docs/feature-shot-change

TensorFlow Hub YAMNet tutorial:
https://www.tensorflow.org/hub/tutorials/yamnet
```

Key research facts used:

```txt
OpenAI's Audio API supports transcription and translation endpoints, with current transcription model snapshots including gpt-4o-mini-transcribe, gpt-4o-transcribe, and gpt-4o-transcribe-diarize.
PySceneDetect provides content, threshold, adaptive, histogram, and hash detectors for scene/shot-change style signals.
MediaPipe Object Detector can process images, decoded video frames, and live video feeds, returning detected categories, probability scores, and bounding boxes.
Google Cloud Video Intelligence shot change detection annotates video segments at abrupt visual changes.
YAMNet is a TensorFlow Hub audio classifier trained to predict many audio event classes; it may inform later host-reaction/audio-event detection but is not required for P0.
```

Important constraint:

```txt
This spec does not require any one external detector provider for P0.
P0 may use deterministic keyword/audio/scene heuristics and one LLM/multimodal validation path.
All provider/model choices remain routed through existing provider policies and LLMProviderRouter where applicable.
```

---

## 3. Source-of-Truth Constraints

This document inherits these Lumiq rules:

```txt
Detection is not capture.
Agents recommend; they do not execute capture.
Capture requires MomentPolicyService authorization.
Product facts must be grounded.
Raw source must be preserved before enhancement.
Events must be typed and idempotent.
Evidence must be preserved for accepted/captured moments.
```

Critical rule:

```txt
A signal emitter may propose a candidate. It may not capture media, request generation, or publish outputs.
```

---

## 4. Definitions

### 4.1 Signal

A **signal** is a low-level observation that may indicate a commercially valuable moment.

Examples:

```txt
product_visible
keyword_hit
offer_mention
audio_energy_peak
scene_change
manual_marker
chat_spike
product_closeup
host_reaction
cta_phrase
```

### 4.2 Signal Emitter

A **signal emitter** is code that observes one part of the live session and emits `signal.detected` or persists a `signals` row.

Examples:

```txt
Transcript Keyword Detector
Product Mention Detector
Offer/CTA Detector
Audio Energy Detector
Scene Change Detector
Product Visibility Detector
Manual Marker Detector
Chat Spike Detector later
```

### 4.3 Candidate Window

A **candidate window** is a time interval where multiple signals cluster strongly enough to justify AI validation or policy evaluation.

### 4.4 Candidate Moment

A **candidate moment** is a proposed moment domain object or event derived from one or more candidate windows.

### 4.5 Moment Ranker

The **Moment Ranker** combines normalized signal scores, AI validation, product match confidence, duplicate penalties, and policy context into a final normalized moment score.

### 4.6 MomentPolicyService

The **MomentPolicyService** authorizes or denies raw capture/enhancement based on score, session state, budget, privacy, retention, duplicate windows, and capture caps.

### 4.7 Evidence Trail

An **evidence trail** is the stored set of signal IDs, transcript excerpts, frame refs, product match outputs, AI validation outputs, policy decisions, and budget decisions supporting a moment decision.

---

## 5. End-to-End Detection Pipeline

```txt
Live/prerecorded source
  ↓
Normalized session contract
  ↓
Transcript chunks + sampled frames + audio chunks + markers
  ↓
Cheap signal emitters
  ↓
Signal Aggregator
  ↓
Candidate Window Builder
  ↓
Mastra AI validation for promising windows
  ↓
Moment Ranker
  ↓
MomentPolicyService
  ↓
Capture authorization or denial
  ↓
Capture Worker writes raw source to B2 if authorized
```

P0 golden path:

```txt
prerecorded-live session
  → transcript keyword/product mention/offer signal
  → scene or manual timestamp signal
  → candidate window
  → Supervisor Agent validates product reveal
  → score >= 0.90
  → capture authorized
  → raw clip captured
```

---

## 6. Runtime Ownership

## 6.1 Signal Extraction Worker owns

```yaml
signal_extraction_worker_owns:
  - reading_session_chunks_or_progress_markers
  - transcript_keyword_detection
  - product_mention_detection
  - offer_cta_detection
  - audio_energy_detection
  - scene_change_detection_where_supported
  - manual_marker_translation
  - signal_normalization
  - signal.detected_event_emission
```

## 6.2 Mastra Agent Service owns

```yaml
mastra_agent_service_owns:
  - candidate_validation
  - product_match_suggestion
  - moment_type_suggestion
  - clip_boundary_suggestion
  - template_recommendation
  - human_readable_reason
```

## 6.3 Core API / Moment Service owns

```yaml
core_api_moment_service_owns:
  - candidate_moment_persistence
  - moment_state_transitions
  - duplicate_suppression_policy
  - capture_authorization
  - policy_decision_records
  - audit_events
  - event_publication
```

## 6.4 MomentPolicyService owns

```yaml
moment_policy_service_owns:
  - score_threshold_checks
  - session_state_checks
  - duplicate_window_checks
  - budget_checks
  - privacy_checks
  - retention_policy_checks
  - per_session_capture_caps
  - full_session_recording_policy_checks
  - source_buffer_availability_checks
```

## 6.5 Capture Worker owns

```yaml
capture_worker_owns:
  - finalizing_raw_capture
  - writing_raw_source_to_b2
  - writing_mezzanine_when_possible
  - calculating_checksums
  - reporting_capture_completion
```

---

## 7. Time and Sampling Model

### 7.1 Canonical timebase

All detection and capture ranges use milliseconds from session start.

```txt
t_start_ms
t_end_ms
start_ms
end_ms
raw_capture_start_ms
raw_capture_end_ms
```

### 7.2 Clock rules

```txt
Session time starts at start_session transition.
Prerecorded-live simulator maps playback position to session time.
Uploaded media source time must be converted to session time.
Event occurred_at is wall-clock time and does not replace session time.
```

### 7.3 Recommended P0 sampling

```yaml
p0_sampling:
  transcript_chunk_size_seconds: 2_to_5
  frame_sample_interval_seconds: 1_to_2
  audio_energy_window_ms: 500_to_1000
  candidate_aggregation_window_seconds: 8_to_20
  minimum_candidate_duration_seconds: 6
  maximum_candidate_duration_seconds: 45
```

### 7.4 Recommended P1 sampling

```yaml
p1_sampling:
  transcript_chunk_size_seconds: 1_to_3
  frame_sample_interval_seconds: 0.5_to_1
  audio_energy_window_ms: 250_to_500
  visual_detection_frame_burst:
    around_signal_seconds: [-4, +6]
  candidate_aggregation_window_seconds: 6_to_18
```

---

## 8. Signal Registry

## 8.1 Signal event shape

```yaml
SignalDetected:
  signal_id: ulid
  organization_id: ulid
  session_id: ulid
  moment_id: ulid nullable
  signal_type: string
  emitter: string
  t_start_ms: integer
  t_end_ms: integer nullable
  score: number_0_to_1 nullable
  evidence_ref: string nullable
  summary: string nullable
  payload_json: object
  created_at: iso_datetime
```

### 8.2 `transcript_keyword`

Purpose:

```txt
Detect commerce-relevant words/phrases in transcript chunks.
```

Examples:

```txt
new arrival
just launched
limited time
today only
price drop
30% off
use code
link in bio
add to cart
checkout
```

Score factors:

```yaml
score_factors:
  phrase_strength: 0_to_1
  phrase_count: integer
  phrase_recency: 0_to_1
  transcript_confidence: 0_to_1
  context_match: 0_to_1
```

Rules:

```txt
Keyword signal alone should not auto-capture unless manual/demo policy allows it.
Offer/price phrases require product/campaign grounding before rendering claims.
```

### 8.3 `product_mention`

Purpose:

```txt
Detect references to product names, SKUs, catalog aliases, or campaign product terms.
```

Sources:

```txt
catalog snapshot product names
SKUs
manual aliases
campaign product groups
transcript text
```

Score factors:

```yaml
score_factors:
  exact_sku_match: high
  exact_product_name_match: high
  alias_match: medium
  fuzzy_name_match: medium_low
  transcript_confidence: modifier
```

Rules:

```txt
Fuzzy product mention does not equal verified product match.
Product Matcher Agent or backend validation must confirm product identity for product overlays.
```

### 8.4 `offer_mention`

Purpose:

```txt
Detect possible discounts, offers, or CTAs.
```

Examples:

```txt
30% off
buy one get one
free shipping
today only
limited stock
use code LIVE20
```

Rules:

```txt
Offer mention may increase candidate score.
Offer mention may not render offer overlay unless an active campaign offer or allowed claim supports it.
```

### 8.5 `audio_energy_peak`

Purpose:

```txt
Detect host excitement, audience excitement, or emphasis based on audio energy changes.
```

Score factors:

```yaml
score_factors:
  normalized_rms_delta: 0_to_1
  local_peak_ratio: 0_to_1
  sustained_energy: 0_to_1
  speech_presence: 0_to_1
```

Rules:

```txt
Audio energy is supporting evidence, not sufficient by itself for capture.
Background music spikes should be dampened where detected.
```

### 8.6 `scene_change`

Purpose:

```txt
Detect visual transitions, cuts, product reveal camera movements, or scene boundaries.
```

Potential implementations:

```txt
simple frame histogram delta
PySceneDetect-style content/adaptive detector
downstream provider shot-change detector later
```

Rules:

```txt
Scene change should help refine boundaries.
Scene change should not automatically imply commercial value.
Fast camera movement should be dampened by adaptive/local context logic where possible.
```

### 8.7 `product_visibility`

Purpose:

```txt
Detect whether a product-like object or matched product appears in sampled frames.
```

Potential implementations:

```txt
manual/demo bounding boxes for P0
multimodal model frame validation
MediaPipe/object detector class detection
catalog image similarity later
```

Score factors:

```yaml
score_factors:
  product_bbox_confidence: 0_to_1
  product_bbox_size_ratio: 0_to_1
  product_centering: 0_to_1
  product_frame_count: integer
  visual_product_match_confidence: 0_to_1 nullable
```

Rules:

```txt
Product visibility can strongly raise score.
A generic object detector result is not a verified SKU match.
Product-specific rendering requires catalog snapshot validation.
```

### 8.8 `product_closeup`

Purpose:

```txt
Detect when the product occupies a meaningful portion of frame and is visually reviewable.
```

Default heuristic:

```txt
bbox_area_ratio >= 0.12 and product_centering >= 0.55 for at least 2 sampled frames
```

P0 may simulate this from seeded demo markers.

### 8.9 `host_reaction`

Purpose:

```txt
Detect host excitement, surprise, laugh, applause, or emphatic speech around product moments.
```

P0 approach:

```txt
audio_energy_peak + transcript exclamation/positive phrase
```

P1 approach:

```txt
audio event classification
facial expression/pose where policy and privacy allow
```

### 8.10 `manual_marker`

Purpose:

```txt
Allow a host/editor to mark a moment manually during Live Studio.
```

Rules:

```txt
Manual marker can force candidate creation.
Manual marker does not bypass capture policy.
Manual marker reason should be stored in evidence.
```

### 8.11 `chat_spike`

Purpose:

```txt
Detect viewer activity spikes during future livestream integrations.
```

P0 status:

```txt
Not required.
```

---

## 9. Candidate Window Builder

### 9.1 Purpose

The Candidate Window Builder groups nearby signals into candidate windows.

### 9.2 Inputs

```txt
recent signals for session
transcript chunks
sampled frame refs
manual markers
existing moments for duplicate checks
active catalog/campaign context
```

### 9.3 Default grouping algorithm

```txt
1. Maintain rolling signal buffer per session.
2. Normalize every signal score to 0..1.
3. Group signals whose t_start_ms falls within candidate_aggregation_window.
4. Expand window to include earliest and latest relevant signal.
5. Apply min/max candidate duration.
6. Attach evidence refs.
7. Compute preliminary candidate score.
8. Propose candidate if score meets candidate_proposal_threshold or manual marker is present.
```

### 9.4 Default candidate window sizes

```yaml
default_windows:
  aggregation_window_ms: 15000
  min_candidate_duration_ms: 6000
  max_candidate_duration_ms: 45000
  pre_context_ms_for_validation: 5000
  post_context_ms_for_validation: 5000
```

### 9.5 Candidate proposal threshold

```yaml
candidate_proposal_thresholds:
  generic_demo: 0.55
  commerce_grounded: 0.60
  auto_ai_validation: 0.65
  manual_marker: 0.0
```

These are starting defaults and should be tuned with evaluation data.

---

## 10. AI Validation

### 10.1 When AI validation runs

Run AI validation when:

```txt
candidate preliminary score >= auto_ai_validation threshold
manual marker requests AI validation
candidate includes product mention + product visibility
candidate includes offer mention + product context
reviewer/admin manually requests validation
```

Do not run AI validation for every low-value signal by default.

### 10.2 AI validation agents

Primary agents:

```txt
Supervisor Agent
Signal/Moment Agent
Product Matcher Agent
Clip Boundary Agent
Enhancement Planner Agent
```

### 10.3 Inputs to AI validation

```yaml
ai_validation_inputs:
  - session_id
  - candidate_window
  - signal_ids
  - transcript_excerpt_refs
  - sampled_frame_refs
  - catalog_snapshot_summary
  - campaign_summary
  - budget_policy_summary
  - duplicate_context
  - source_type
```

### 10.4 Structured output

```yaml
candidate_validation_output:
  recommendation: capture_and_enhance | capture_only | queue_for_review | ignore
  confidence: number_0_to_1
  moment_type: product_reveal | offer_mention | try_on | feature_demo | host_reaction | before_after | limited_stock_cta | unknown
  product_match_confidence: number_0_to_1 nullable
  recommended_template_id: string nullable
  final_trim_start_ms: integer nullable
  final_trim_end_ms: integer nullable
  requires_human_review: boolean
  reason: string
  evidence_refs: string_array
```

### 10.5 AI validation rules

```txt
LLM output is untrusted until schema-validated.
AI can recommend capture but cannot authorize capture.
AI can suggest product matches but cannot verify product facts alone.
AI can suggest boundaries but raw capture remains generous.
AI can recommend template but Core API validates compatibility.
```

---

## 11. Moment Score Model

### 11.1 Score components

The ranker calculates a normalized score from components.

```yaml
score_components:
  product_visible_score: 0_to_1
  product_match_score: 0_to_1
  product_name_mentioned_score: 0_to_1
  offer_or_price_score: 0_to_1
  cta_score: 0_to_1
  host_energy_score: 0_to_1
  visual_change_score: 0_to_1
  manual_marker_score: 0_to_1
  chat_spike_score: 0_to_1
  ai_validation_score: 0_to_1
  duplicate_penalty: 0_to_1
  policy_penalty: 0_to_1
```

### 11.2 Default weighted formula

P0 default formula:

```txt
base_score =
  0.20 * product_visible_score +
  0.16 * product_match_score +
  0.14 * product_name_mentioned_score +
  0.12 * offer_or_price_score +
  0.10 * cta_score +
  0.08 * host_energy_score +
  0.06 * visual_change_score +
  0.06 * manual_marker_score +
  0.08 * ai_validation_score

final_score = clamp(base_score - duplicate_penalty - policy_penalty, 0, 1)
```

P1 should tune weights from labeled review outcomes.

### 11.3 Score interpretation

```yaml
score_tiers:
  auto_capture_auto_enhance:
    min_score: 0.90
    behavior: auto-capture raw; auto-enhance if budget/policy allow
  auto_capture_review_before_enhance:
    min_score: 0.70
    max_score: 0.89
    behavior: auto-capture raw; queue review or wait before enhancement
  candidate_only:
    min_score: 0.55
    max_score: 0.69
    behavior: store candidate/evidence; no capture unless manual/reviewer action
  signal_only:
    max_score: 0.54
    behavior: store lightweight signal only
```

These tiers align with existing PRD/requirements defaults.

### 11.4 Manual marker score

Manual marker should boost candidate creation but not bypass policy.

```yaml
manual_marker_behavior:
  creates_candidate: true
  default_manual_marker_score: 0.85
  can_auto_capture_without_policy: false
  requires_budget_check: true
```

### 11.5 Product match confidence gates

```yaml
product_match_gates:
  product_overlay_allowed:
    min_confidence: 0.80
  offer_overlay_allowed:
    min_confidence: 0.85
    requires_allowed_claim: true
  review_required:
    min_confidence: 0.60
    max_confidence: 0.79
  generic_only:
    max_confidence: 0.59
```

---

## 12. Moment Type Rules

## 12.1 `product_reveal`

Strong signals:

```txt
product_visible
product_closeup
product_mention
scene_change
host_energy_peak
```

Recommended template:

```txt
clean_product_reveal_v1
```

Capture behavior:

```txt
High confidence product reveal can auto-capture if source buffer and budget are available.
```

## 12.2 `offer_mention`

Strong signals:

```txt
offer_mention
product_mention
cta_phrase
product_visible
```

Hard rule:

```txt
Offer overlay or discount caption requires verified campaign/allowed claim.
```

## 12.3 `feature_demo`

Strong signals:

```txt
product_visible
feature keywords
sustained camera hold
transcript explanation verbs
```

Examples:

```txt
watch this
it opens like this
here's how it works
this pocket fits
waterproof claim if allowed
```

## 12.4 `try_on`

Strong signals:

```txt
product_visible
person/host visible
fit/try-on transcript phrases
before/after cue
```

Hard rule:

```txt
Any AI restyle or simulated try-on behavior requires product visual integrity policy and review.
```

## 12.5 `host_reaction`

Strong signals:

```txt
audio_energy_peak
positive/excited transcript
face/gesture signal later
manual marker
```

Default capture:

```txt
Queue for review unless accompanied by product context.
```

## 12.6 `limited_stock_cta`

Strong signals:

```txt
limited stock phrase
checkout/add-to-cart CTA
product mention
campaign/inventory context
```

Hard rule:

```txt
Limited stock claims cannot render unless backed by allowed claim or refreshed inventory context.
```

---

## 13. Duplicate Suppression

### 13.1 Duplicate window

Default:

```yaml
duplicate_moment_window_ms: 45000
allowed_range: 30000_to_60000
```

### 13.2 Duplicate fingerprint

Recommended fingerprint fields:

```txt
organization_id
session_id
moment_type
likely_product_id nullable
catalog_snapshot_id nullable
rounded_time_bucket
normalized_key_phrases
visual_scene_hash nullable
```

### 13.3 Duplicate penalty

```yaml
duplicate_penalty:
  exact_same_product_type_within_window: 0.35
  overlapping_time_window: 0.25
  same_transcript_phrase: 0.15
  same_manual_marker: 0.0
```

### 13.4 Duplicate outcomes

```txt
suppress_candidate
link_to_existing_moment
extend_existing_window
create_new_candidate_with_duplicate_warning
```

Rules:

```txt
Do not create duplicate auto-capture events for the same moment.
Manual marker can create a linked candidate even inside duplicate window.
Duplicate suppression decisions must be stored in moment_policy_decisions or evidence.
```

---

## 14. Capture Policy

### 14.1 Required checks

Capture authorization requires all mandatory checks:

```txt
session is live or valid prerecorded-live playback is active
capture enabled for session
candidate score meets policy threshold
candidate is not suppressed as duplicate
per-session capture cap not exceeded
auto-enhancement cap not exceeded if enhancement requested
cooldown between captures satisfied
tenant/session budget available
privacy policy allows capture
retention policy exists
source buffer available for raw window
catalog mode compatible with intended output
```

### 14.2 Confidence-tiered automation

```yaml
automation_tiers:
  high_confidence:
    score: ">=0.90"
    default_behavior:
      - auto_capture_raw
      - auto_enhance_if_budget_allows
  medium_confidence:
    score: "0.70-0.89"
    default_behavior:
      - auto_capture_raw
      - wait_for_review_before_enhancement
  low_confidence:
    score: "<0.70"
    default_behavior:
      - store_lightweight_signal_or_candidate_only
```

### 14.3 Capture caps

Recommended defaults:

```yaml
capture_caps:
  max_captures_per_session: 20
  max_auto_enhancements_per_session: 5
  max_auto_captures_per_10_minutes: 6
  cooldown_between_auto_enhancements_ms: 60000
  max_rerenders_per_moment: 3
```

These are recommended defaults, not pricing/plan commitments.

### 14.4 Raw capture window

Default raw capture expansion:

```yaml
raw_capture_window:
  pre_roll_ms: 15000
  post_roll_ms: 15000
  min_total_ms: 20000
  max_total_ms: 60000
```

Rules:

```txt
Use the source buffer limits if desired pre/post roll is unavailable.
Store actual raw_capture_start_ms and raw_capture_end_ms.
Final enhanced trim may be tighter than raw capture.
```

### 14.5 Capture denial reasons

```txt
session_not_live
capture_disabled
score_below_threshold
duplicate_suppressed
capture_cap_exceeded
enhancement_cap_exceeded
cooldown_active
budget_exhausted
privacy_policy_blocked
retention_policy_missing
source_buffer_unavailable
catalog_required_missing
product_match_uncertain
manual_review_required
```

---

## 15. Evidence Trail Requirements

Accepted/captured moments must store full evidence:

```txt
signal IDs
transcript excerpts
sampled frame refs
AI validation output hash/ref
product match result
moment score components
policy decision record
budget authorization record
capture window decision
selected/recommended template
```

Rejected/low-confidence candidates may store lightweight evidence:

```txt
summary
signal IDs
score
reason for suppression/denial
```

Evidence storage rules:

```txt
Do not store full raw transcripts in normal logs.
Use transcript_excerpt_id and evidence IDs.
Sensitive evidence retention is policy-controlled.
```

---

## 16. Events

### 16.1 `signal.detected`

Produced by:

```txt
signal_extraction_worker
```

Consumed by:

```txt
moment_service
mastra_agent_service_if_candidate_relevant
live_studio_realtime
```

Required payload fields:

```txt
session_id
signal_id
signal_type
t_start_ms
score
evidence_ref optional
summary optional
```

### 16.2 `moment.candidate.proposed`

Produced by:

```txt
core_api.moment_service or agent tool gateway after validation
```

Consumed by:

```txt
moment_ranker
live_studio_realtime
audit_worker
```

Required payload fields:

```txt
session_id
candidate_id
start_ms
end_ms
moment_type
confidence
reason
evidence_refs
agent_tool_call_id optional
```

### 16.3 `moment.capture.authorized`

Produced by:

```txt
core_api.moment_service / MomentPolicyService
```

Consumed by:

```txt
capture_worker
```

Required payload fields:

```txt
session_id
moment_id
raw_capture_start_ms
raw_capture_end_ms
authorization_id
policy_result
```

### 16.4 Event rules

```txt
All events use the standard envelope.
Events are organization-scoped.
Subjects are stable and do not include tenant/session IDs.
Consumers are idempotent.
DLQ is required after retry exhaustion.
```

---

## 17. Database Touchpoints

### 17.1 `signals`

Append-heavy; partition monthly.

Required:

```txt
signal_id
organization_id
session_id
moment_id nullable
signal_type
emitter
t_start_ms
t_end_ms nullable
score nullable
payload_json
created_at
```

### 17.2 `moments`

Moment rows are created for candidate or accepted moments.

Important fields:

```txt
moment_id
organization_id
session_id
catalog_snapshot_id
state
moment_type
start_ms
end_ms
raw_capture_start_ms
raw_capture_end_ms
score
selection_reason
moment_fingerprint
```

### 17.3 `moment_evidence`

Stores evidence trail records.

Evidence types:

```txt
signal
transcript_excerpt
frame_ref
agent_output
product_match
policy_decision
budget_decision
duplicate_check
```

### 17.4 `moment_policy_decisions`

Stores capture authorization/denial decisions.

Decision types:

```txt
candidate_proposal
ai_validation
ranking
capture_authorization
duplicate_suppression
enhancement_authorization
```

---

## 18. API Touchpoints

Relevant APIs:

```txt
GET /api/sessions/{session_id}/timeline
GET /api/moments/{moment_id}
GET /api/moments/{moment_id}/provenance
GET /api/review-queue
POST /internal/agent-tools/propose-moment-candidate
POST /internal/agent-tools/validate-product-match
POST /internal/agent-tools/suggest-boundaries
POST /internal/workers/capture-completed
```

Potential P1 APIs:

```txt
GET /api/sessions/{session_id}/signals
GET /api/moments/{moment_id}/score-breakdown
POST /api/moments/{moment_id}/manual-capture-request
POST /api/sessions/{session_id}/manual-marker
GET /api/admin/detection-evals
```

---

## 19. UX Requirements

Live Studio must show:

```txt
recent signals
candidate moment cards
score or confidence tier
short AI reason
capture status
budget/cap status
source buffer/capture state
```

Review UI must show:

```txt
why moment was captured
signal score breakdown
product match status
transcript excerpt
raw capture window
final trim recommendation
policy decision
QA status
```

Admin UI should show:

```txt
signal emitter failures
candidate suppression stats
capture denials by reason
score thresholds
false positive/false negative review labels later
```

---

## 20. Failure Handling

### 20.1 Signal emitter failure

```yaml
failure_behavior:
  retry: true
  store_worker_error: true
  continue_session: true
  user_visible_if_repeated: true
  dlq_after_retry_exhausted: true
```

### 20.2 AI validation failure

```yaml
failure_behavior:
  malformed_output: reject_and_retry_or_review
  timeout: fallback_or_queue_for_review
  budget_denied: no_validation_and_no_auto_enhance
  tool_denied: audit_and_fail_validation
```

### 20.3 Capture policy failure

```yaml
failure_behavior:
  no_capture: true
  policy_decision_record: required
  live_studio_explanation: required_for_user_relevant_failures
```

### 20.4 Source buffer unavailable

```txt
If the source buffer cannot produce the requested raw capture window, capture should fail or degrade to available range only if policy allows.
The actual captured range must be recorded.
```

---

## 21. Evaluation and Tuning

### 21.1 Evaluation fixtures

Required fixture scenarios:

```txt
high_confidence_product_reveal
product_reveal_without_product_mention
offer_mention_with_verified_campaign
offer_mention_without_allowed_claim
host_reaction_without_product_context
duplicate_product_reveal
manual_marker_low_signal
budget_blocked_candidate
source_buffer_missing
uncertain_product_match
```

### 21.2 Metrics

Detection/ranking metrics:

```txt
candidate_precision
candidate_recall_on_labeled_demo_sessions
auto_capture_precision
false_auto_capture_rate
missed_high_value_moment_rate
duplicate_suppression_rate
ai_validation_accept_rate
product_match_accuracy
capture_denial_rate_by_reason
cost_per_validated_candidate
time_to_first_candidate
time_to_capture_authorized
```

### 21.3 Labeling outcomes

Reviewer actions can provide feedback labels:

```txt
approved
rejected_not_commercially_valuable
rejected_bad_boundary
rejected_wrong_product
rejected_duplicate
rerender_requested
published
```

P1 ranker tuning should use these labels.

---

## 22. P0 Hackathon Slice

P0 must include:

```txt
prerecorded-live session progress
transcript keyword detector or seeded transcript markers
product mention detector from seeded catalog
manual marker fallback
audio energy or scene marker if feasible
candidate window builder
Mastra candidate validation
score calculation
confidence-tiered capture policy
moment.capture.authorized event
capture denial reasons
candidate card in Live Studio
evidence shown in Review UI
```

P0 may simplify:

```txt
product visibility from seeded frame refs or simple sampled-frame validation
chat spike omitted
advanced object detection omitted
learned score tuning omitted
complex duplicate fingerprint omitted
```

Minimum demo scenario:

```txt
At product reveal timestamp, product mention + offer keyword + visual marker cluster.
Candidate score >= 0.90.
Mastra validates product_reveal.
MomentPolicyService authorizes raw capture.
Live Studio and Review UI show why it happened.
```

---

## 23. Production Beta Scope

P1 should add:

```txt
better frame sampling
real product visibility model or multimodal validation
visual product-to-catalog matching
scene change detector integration
audio event classifier or refined host energy logic
review feedback labels
tuned weights per template/campaign/moment type
detection analytics dashboard
admin threshold controls with guardrails
```

---

## 24. Security and Privacy

Rules:

```txt
Do not log full transcripts in normal logs.
Do not expose raw sampled frames publicly.
Do not let transcript prompt injection affect agent instructions.
Do not use facial/emotion analysis without explicit policy and privacy review.
Do not auto-publish based on detection alone.
Do not create product claims from transcript alone.
```

Privacy-sensitive signals:

```txt
face/emotion detection
chat activity/usernames
full-session transcript
full-session recording
audience-visible transform comparison
```

These require stricter retention and policy controls.

---

## 25. AI Coding Agent Instructions

```txt
1. Do not make signal emitters authorize capture.
2. Do not let agents call capture worker directly.
3. Do not bypass MomentPolicyService.
4. Do not use ungrounded transcript claims in overlays or captions.
5. Do not hardcode model names where LLMProviderRouter belongs.
6. Do not create candidates without organization_id/session_id/time range/evidence.
7. Do not emit unversioned events.
8. Do not ignore duplicate windows.
9. Do not store full raw prompts/transcripts in normal logs.
10. Add tests for every score threshold and denial reason.
```

---

## 26. Open Questions

The following are intentionally not locked:

```txt
1. Exact first STT provider for production.
2. Exact first product visibility detector.
3. Exact first vision model for product-to-catalog matching.
4. Exact labeled evaluation dataset size before P1 tuning.
5. Whether detection weights are global, org-specific, campaign-specific, or template-specific in production.
6. Whether chat spike signals are supported before social/live-commerce platform integrations.
7. Whether face/gesture/host reaction models are allowed under privacy policy.
```

Recommended defaults:

```txt
P0 STT:
  seeded transcript or OpenAI transcription where file size/source path supports it

P0 product visibility:
  seeded frame refs or simple multimodal validation

P0 scene change:
  simple histogram/frame-delta or seeded marker

P0 thresholds:
  0.90 auto-capture + auto-enhance if budget allows
  0.70 auto-capture + review before enhancement
  below 0.70 signal/candidate only

P0 duplicate window:
  45 seconds
```
