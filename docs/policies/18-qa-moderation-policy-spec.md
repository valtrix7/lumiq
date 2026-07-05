# 18 — QA & Moderation Policy Specification

**Project:** Lumiq — Live Commerce Moment Vault  
**Document ID:** `18-qa-moderation-policy-spec.md`  
**Status:** Draft v1  
**Audience:** QA engineers, AI safety engineers, media engineers, backend engineers, product, reviewers, security, AI coding agents  
**Depends on:** `00-spec-index.md`, `01-product-requirements.md`, `02-project-constitution.md`, `03-glossary-domain-language.md`, `04-requirements-ears.md`, `05-user-flows-ux-spec.md`, `06-system-architecture-c4.md`, `07-service-decomposition.md`, `08-data-model-database-schema.md`, `09-api-contract-openapi.yaml`, `10-event-contract-asyncapi.yaml`, `11-json-schemas.md`, `12-agent-architecture-mastra.md`, `13-genblaze-media-pipeline.md`, `14-b2-storage-provenance-spec.md`, `15-template-step-graph-spec.md`, `16-moment-detection-ranking-spec.md`, `17-catalog-product-grounding-spec.md`.

---

## 1. Purpose

This document defines Lumiq's QA and moderation policy system.

Lumiq generates commerce media from live sessions. QA is required because generated media can fail in ways that directly affect buyer trust: wrong product, wrong price, false discount, misleading product restyle, caption drift, unsafe content, bad crop, missing disclosure, corrupted asset, broken lineage, or publish package mismatch.

This document answers:

1. What QA stages exist?
2. Which checks run before enhancement?
3. Which checks run after enhancement?
4. Which checks run before publish?
5. How is moderation applied to text, image, video, prompts, transcripts, and generated outputs?
6. How are failure classes assigned?
7. When should the system retry, remediate, route to review, or terminate?
8. How do QA results affect moment states, generation runs, publish packages, provenance, and UI?
9. What is P0 for the hackathon path and P1/P2 for production?

The goal is to make QA deterministic enough to protect commerce trust while still allowing controlled AI media generation.

---

## 2. Research and Source Notes

This spec combines Lumiq's internal documents with current public AI safety and moderation references available on **2026-06-26**.

Public references used:

```txt
OpenAI Moderation API guide:
https://developers.openai.com/api/docs/guides/moderation

OpenAI Safety Best Practices:
https://developers.openai.com/api/docs/guides/safety-best-practices

OWASP Top 10 for Large Language Model Applications:
https://owasp.org/www-project-top-10-for-large-language-model-applications/

NIST AI Risk Management Framework:
https://www.nist.gov/itl/ai-risk-management-framework
```

Key research facts used:

```txt
OpenAI's Moderation API can classify text and images and can be used to filter, route to review, or intervene based on application policy.
OpenAI safety guidance recommends moderation, adversarial testing, human oversight, and prompt engineering as deployment safety measures.
OWASP's LLM Top 10 identifies risks relevant to Lumiq, including prompt injection, insecure output handling, model denial of service, sensitive information disclosure, excessive agency, and overreliance.
NIST AI RMF provides a governance-oriented risk frame for AI systems.
```

Important constraint:

```txt
Moderation providers are policy adapters. This spec does not require one provider forever. OpenAI moderation is a recommended P0 path because OpenAI is already the primary LLM provider, but all moderation results must be wrapped in Lumiq QA records and cannot replace product grounding, human approval, or provenance.
```

---

## 3. Source-of-Truth Constraints

This document inherits these Lumiq rules:

```txt
QA is multi-stage.
QA failures must be classified.
Provider outputs are untrusted until validated.
Generated media must preserve product trust.
Ungrounded product claims must not pass.
Publishing requires human approval by default.
Sensitive actions require human approval.
Moderation must run before generation and before publish.
Every important QA result must be stored and auditable.
```

Relevant requirement IDs:

```txt
REQ-QA-001       Pre-enhancement QA
REQ-QA-002       Post-enhancement QA
REQ-QA-003       Pre-publish QA
REQ-QA-004       Failure Classification
REQ-QA-005       Product Appearance Integrity
REQ-CATALOG-005  Product Fact Grounding
REQ-GEN-002      Genblaze Output Storage
REQ-GEN-004      Policy-based Provider Fallback
REQ-PUBLISH-001  Publish Package Creation
REQ-PUBLISH-002  Human Approval Default
REQ-PROV-001     Dual-source Provenance
REQ-SEC-002      Prompt Injection Resistance
REQ-SEC-004      Human Approval for Sensitive Actions
REQ-AUDIT-001    Full Action Audit
```

---

## 4. QA Philosophy

QA in Lumiq is not one final check. It is a series of gates that protect different failure surfaces.

```txt
Pre-enhancement QA:
  Should we generate at all?

Post-enhancement QA:
  Did generation produce a faithful, usable, policy-compliant asset?

Pre-publish QA:
  Is this package still truthful, approved, safe, and destination-ready?
```

Core philosophy:

```txt
Prevent where possible.
Detect where prevention is not enough.
Route uncertain commerce/safety cases to humans.
Retry only when failure is likely transient.
Never hide missing lineage or unverified product facts.
```

---

## 5. QA Stage Overview

```yaml
qa_stages:
  pre_enhancement:
    trigger:
      - moment.raw_uploaded
      - generation.requested preflight
      - rerender requested
    goal: determine whether generation is allowed

  post_enhancement:
    trigger:
      - generation.completed
    goal: determine whether enhanced asset can enter review queue

  pre_publish:
    trigger:
      - publish.requested
      - publish_package approval
      - share_page creation if public/unlisted
    goal: determine whether publish package is safe and truthful

  admin_reconciliation:
    trigger:
      - scheduled reconciliation
      - DLQ recovery
      - manifest verification
    goal: detect broken or missing QA/provenance records
```

---

## 6. QA Result Contract

Every QA execution produces a `qa_checks` row and optionally one or more `qa_failures` rows.

```json
{
  "qa_check_id": "01H...",
  "organization_id": "01H...",
  "session_id": "01H...",
  "moment_id": "01H...",
  "asset_id": "01H...",
  "generation_run_id": "01H...",
  "qa_stage": "pre_enhancement | post_enhancement | pre_publish | admin_reconciliation",
  "status": "passed | failed | review_required | remediated | terminal",
  "score": 0.92,
  "summary": "Product facts verified and output passed visual/caption checks.",
  "checks": [
    {
      "check_name": "claims_grounded",
      "status": "pass | fail | uncertain | skipped",
      "severity": "info | warning | high | critical",
      "evidence_refs": ["claim_verification:01H..."],
      "reason": "All rendered claims are backed by allowed claims."
    }
  ],
  "recommended_action": "continue | retry | rerender | review | block_publish | terminate",
  "created_at": "2026-06-26T00:00:00Z",
  "completed_at": "2026-06-26T00:00:05Z"
}
```

Rules:

```txt
QA output must be schema-validated.
QA output must not contain raw provider secrets.
QA output should reference transcripts/prompts by IDs or hashes, not full raw text in normal records.
QA summaries may be human-readable but control fields must be structured.
```

---

## 7. Failure Classes

```yaml
failure_classes:
  retryable:
    meaning: The same inputs may succeed on retry.
    examples:
      - provider timeout
      - B2 transient upload failure
      - network failure
      - temporary moderation provider outage
      - NATS redelivery before durable state
    actions:
      - retry with backoff
      - preserve idempotency key
      - DLQ after retry budget exhausted

  remediable:
    meaning: The output can likely be fixed by deterministic adjustment or rerender.
    examples:
      - caption timing drift
      - overlay safe-zone issue
      - low thumbnail quality
      - crop misses product edge
      - audio normalization too low
    actions:
      - attempt remediation if policy allows
      - rerender
      - route to review if repeated

  review_required:
    meaning: Human judgment is needed before proceeding.
    examples:
      - uncertain product match
      - possible product appearance change
      - ambiguous claim
      - moderation borderline result
      - live refresh unavailable for high-risk claim
      - significant AI restyle
    actions:
      - queue review
      - disable auto-publish
      - show evidence and recommended action

  terminal:
    meaning: The workflow cannot safely proceed with these inputs.
    examples:
      - corrupted raw source
      - missing raw source for generated asset
      - unsupported or false product claim central to template
      - expired offer required by template
      - disallowed content
      - checksum mismatch
      - cross-tenant asset reference
    actions:
      - stop workflow
      - mark failed/terminal
      - expose in admin/recovery where relevant
```

---

## 8. Pre-enhancement QA

### 8.1 Purpose

Pre-enhancement QA decides whether an accepted/captured moment is safe and ready to send to the Genblaze media pipeline.

### 8.2 Required checks

```yaml
pre_enhancement_checks:
  raw_moment_usable:
    priority: P0
    inputs: [raw_source_asset, raw_mezzanine_asset optional]
    pass_criteria:
      - raw_source asset exists
      - B2 object exists
      - checksum verified or verification pending with allowed exception
      - duration within template limits
      - media can be probed/read

  product_match_confident:
    priority: P0 for commerce_grounded
    inputs: [product_match_result, catalog_snapshot]
    pass_criteria:
      - product_id exists in catalog snapshot
      - confidence meets template policy
      - uncertain matches route to review

  claim_grounding:
    priority: P0
    inputs: [planned captions, planned overlays, template fact policy]
    pass_criteria:
      - every high-risk claim has allowed source
      - unsupported claims removed/replaced or generation blocked

  template_allowed:
    priority: P0
    inputs: [template_id, template_version, step_graph]
    pass_criteria:
      - template active
      - step graph validated
      - requested operations safe-listed
      - template allowed for org/campaign/moment_type

  prompt_slot_safety:
    priority: P0 if user creative input exists
    inputs: [controlled_prompt_slots]
    pass_criteria:
      - length limits respected
      - schema valid
      - no tool instructions treated as control
      - moderation not blocking

  budget_allowed:
    priority: P0
    inputs: [budget_authorization]
    pass_criteria:
      - budget authorization exists
      - estimated cost within policy

  source_rights_and_privacy:
    priority: P1
    inputs: [session_policy, recording_policy]
    pass_criteria:
      - session capture policy permits processing
      - retention class set
      - full-session mode not implicitly enabled
```

### 8.3 Pre-enhancement outputs

```yaml
pre_enhancement_output:
  status: passed | failed | review_required
  generation_allowed: boolean
  blocking_reasons: array
  approved_fact_refs: array
  template_execution_context: object
  recommended_action: continue | review | block | rerender_input
```

---

## 9. Post-enhancement QA

### 9.1 Purpose

Post-enhancement QA determines whether generated output can enter the review queue or be promoted according to policy.

### 9.2 Required checks

```yaml
post_enhancement_checks:
  render_succeeded:
    priority: P0
    pass_criteria:
      - output_asset_id exists
      - B2 object exists
      - sha256 calculated
      - duration readable
      - manifest_asset_id exists

  lineage_complete:
    priority: P0
    pass_criteria:
      - generation_run linked to input_asset_id
      - output_asset_id linked to generation_run
      - provenance_links exist
      - provenance manifest exists in B2

  captions_match_transcript:
    priority: P0 when captions exist
    pass_criteria:
      - captions align with transcript excerpt within tolerance
      - generated captions do not add material unsupported claims
      - language matches expected language

  overlay_facts_grounded:
    priority: P0
    pass_criteria:
      - product card text matches approved facts
      - price/discount/inventory claims backed by claim verification
      - thumbnail text scanned if available

  product_appearance_preserved:
    priority: P0 if AI restyle or heavy enhancement
    pass_criteria:
      - no material color/shape/packaging/feature distortion
      - product remains recognizably same product
      - uncertain change routes to review

  output_quality_score:
    priority: P0
    pass_criteria:
      - not black/blank/corrupted
      - acceptable resolution and aspect ratio
      - audio not silent unless source silent
      - product/host not accidentally cropped out

  safe_zone_check:
    priority: P1
    pass_criteria:
      - important text not outside destination safe zones
      - captions not covering product-critical area unless template allows

  moderation_output:
    priority: P0
    pass_criteria:
      - generated visual/text content not disallowed
      - borderline content routes to review
```

### 9.3 Product appearance integrity

Product appearance must not materially change:

```txt
color
shape
size/proportion
texture/material
packaging
logos/labels
features/accessories
fit/result expectation
```

Allowed default enhancements:

```txt
crop/reframe
lighting normalization
denoise/sharpen
audio normalization
caption burn-in
product card overlay
background cleanup where product remains faithful
```

Restricted outputs:

```txt
product color changed
packaging logo modified
material appears upgraded/different
product size/proportion altered
try-on fit/result becomes misleading
added feature not present in raw source
```

Restricted outputs require:

```txt
block
or review_required with explicit AI-enhanced label
or rerender with stricter settings
```

---

## 10. Pre-publish QA

### 10.1 Purpose

Pre-publish QA determines whether a canonical asset and publish package are ready for share/export/external publish.

### 10.2 Required checks

```yaml
pre_publish_checks:
  canonical_asset_exists:
    priority: P0
    pass_criteria:
      - moment has canonical_asset_id
      - canonical asset is not deleted
      - canonical asset QA is passed or approved override exists

  human_approval_exists:
    priority: P0
    pass_criteria:
      - reviewer/admin approval exists for default policy
      - auto-publish policy exists if no human approval

  product_facts_current:
    priority: P0/P1 depending adapter
    pass_criteria:
      - high-risk claims refreshed where supported
      - expired/revoked facts block publish

  package_contents_valid:
    priority: P0
    pass_criteria:
      - media asset exists
      - thumbnail exists or allowed exception
      - captions exist or allowed exception
      - title/description/hashtags validated
      - product links valid where used
      - provenance manifest reference exists

  destination_policy_valid:
    priority: P1
    pass_criteria:
      - variant aspect ratio/duration within destination policy
      - metadata length within limits
      - required labels present

  moderation_current:
    priority: P0
    pass_criteria:
      - publish text moderated
      - thumbnail/text moderated
      - output visual safety already passed or rechecked as policy requires

  share_access_policy:
    priority: P0 for share pages
    pass_criteria:
      - visibility set
      - expiry/revocation state valid
      - public access explicitly allowed when public/unlisted
```

### 10.3 Publish blockers

```yaml
publish_blockers:
  - missing_canonical_asset
  - missing_human_approval
  - expired_offer
  - ungrounded_claim
  - revoked_claim
  - product_out_of_stock_when_claimed_available
  - missing_provenance_manifest
  - moderation_failed
  - destination_variant_missing
  - share_policy_denied
  - asset_deleted_or_soft_deleted
```

---

## 11. Moderation Policy

### 11.1 Moderation surfaces

```yaml
moderation_surfaces:
  pre_generation:
    - user creative prompt slots
    - transcript excerpts used for caption/copy
    - raw moment sample frames when needed
    - template-provided text
    - product/campaign text where user-provided

  post_generation:
    - enhanced master preview frames
    - generated captions
    - overlay text
    - thumbnail image/text
    - hook/title

  pre_publish:
    - title
    - description
    - hashtags
    - product link labels
    - share page text
    - publish variant preview frames if policy requires
```

### 11.2 Moderation provider model

```yaml
moderation_provider_policy:
  p0_default:
    provider: openai_or_internal_policy_adapter
    modalities: [text, image]
    note: Provider outputs are advisory until mapped to Lumiq policy.

  future:
    providers:
      - openai
      - provider_specific_safety_api
      - internal_classifier
      - human_moderation_queue
```

### 11.3 Moderation result contract

```json
{
  "moderation_result_id": "01H...",
  "organization_id": "01H...",
  "session_id": "01H...",
  "moment_id": "01H...",
  "asset_id": "01H...",
  "surface": "caption_text | thumbnail | output_frame | prompt_slot | publish_description",
  "provider": "openai | internal | human",
  "model": "string",
  "status": "passed | failed | review_required",
  "categories": [
    {
      "category": "violence | sexual | hate | harassment | self_harm | illicit | other",
      "score": 0.03,
      "decision": "allow | review | block"
    }
  ],
  "policy_version": "1.0.0",
  "created_at": "2026-06-26T00:00:00Z"
}
```

### 11.4 Moderation decisions

```yaml
moderation_decisions:
  allow:
    meaning: surface can proceed
  review:
    meaning: route to human review before generation/publish
  block:
    meaning: stop generation/publish for the surface
  redact_or_rewrite:
    meaning: remove/rewrite offending text where safe
```

### 11.5 Commerce-specific moderation

Lumiq must treat the following as policy-sensitive even when generic moderation does not block:

```txt
unsafe health/medical claims
misleading financial claims
defamatory claims about competitors
adult/regulated product categories if unsupported
counterfeit/official/authentic claims without evidence
illegal or restricted product promotion
age-restricted product promotion
```

P0 may block or route to review if such categories appear.

---

## 12. QA State Transitions

### 12.1 Moment state effects

```yaml
qa_to_moment_state:
  pre_enhancement_passed:
    next: enhancement_pending | enhancing
  pre_enhancement_review_required:
    next: review_pending
  pre_enhancement_failed_terminal:
    next: failed
  post_enhancement_passed:
    next: review_pending
  post_enhancement_remediable:
    next: qa_pending | enhancing after rerender
  post_enhancement_review_required:
    next: review_pending
  post_enhancement_terminal:
    next: failed
  pre_publish_passed:
    next: published or publish_ready depending policy
  pre_publish_review_required:
    next: approved or review_pending with blockers
  pre_publish_failed_terminal:
    next: failed or publish_package.failed
```

### 12.2 Generation run state effects

```yaml
qa_to_generation_run:
  qa_passed:
    generation_run_status: completed
    output_version_state: qa_passed
  qa_failed_retryable:
    generation_run_status: failed
    retry_allowed: true
  qa_failed_remediable:
    generation_run_status: completed
    output_version_state: qa_failed
    rerender_allowed: true
  qa_terminal:
    generation_run_status: failed
    output_version_state: qa_failed
```

---

## 13. Remediation Policy

### 13.1 Automatic remediation allowed

P0/P1 automatic remediation may be allowed for:

```txt
caption timing offset
caption style not matching template
safe-zone overlay position
thumbnail frame selection
volume normalization
aspect-ratio derivative regeneration
```

### 13.2 Automatic remediation forbidden

Automatic remediation must not silently change:

```txt
product facts
price/discount/availability claims
product match
major AI restyle
external publish approval
retention/deletion decisions
```

### 13.3 Remediation attempts

```yaml
remediation_policy:
  max_auto_attempts_per_check: 2
  max_rerenders_per_moment: org_policy
  after_repeated_failure: review_required
  always_record:
    - remediation_attempt_id
    - input_asset_id
    - output_asset_id if produced
    - qa_failure_id
    - action_taken
    - trace_id
```

---

## 14. Human Review and Override

### 14.1 Review required cases

```txt
uncertain product match
claim ambiguity
possible product appearance change
moderation borderline result
major AI restyle
provider fallback after policy uncertainty
publish with stale/unrefreshable high-risk claims
public share when org policy requires approval
```

### 14.2 Override requirements

Overrides require:

```txt
capability check
reviewer/admin identity
reason
before/after state
audit event
trace_id
QA record link
provenance note if output changes publish status
```

### 14.3 Overrides forbidden

Even an admin override should not be allowed for:

```txt
cross-tenant asset reference
missing raw source with no explicit exception record
known false product claim
known expired offer represented as active
checksum mismatch on canonical asset
missing publish media object
```

If business policy later allows emergency override, it must be a separate spec amendment.

---

## 15. QA Agent Integration

### 15.1 QA Agent may do

```txt
explain QA results
classify ambiguous failures
recommend retry/rerender/review/terminate
summarize evidence for reviewer
compare structured facts to generated text
flag possible product appearance changes
```

### 15.2 QA Agent must not do

```txt
approve publish
override failed QA
modify catalog facts
delete assets
call Genblaze directly
write B2 directly
change moment state directly
```

### 15.3 QA Agent output

```yaml
qa_agent_assessment:
  qa_status: passed | failed | review_required
  failure_class: retryable | remediable | review_required | terminal | null
  checks:
    - check_name: string
      status: pass | fail | uncertain
      reason: string
  recommended_action: approve_for_review | rerender | escalate_to_human | terminate
```

The backend validates and maps the recommendation to actual QA state.

---

## 16. QA Evidence Policy

QA evidence can include:

```txt
asset IDs
manifest IDs
sample frame refs
transcript_excerpt_id
caption_id
claim_verification_id
moderation_result_id
product_match_result_id
policy_decision_id
provider_job_ref
checksum values
safe-zone report
```

Normal logs must not include:

```txt
full raw transcript
full raw prompt
full raw model output
provider secret
B2 credentials
sensitive catalog dump
```

---

## 17. QA UI Requirements

Review card must show:

```txt
QA status
blocking failures
review-required reasons
claim verification status
product appearance status
moderation status
lineage status
primary recommended action
```

Moment detail QA tab must show:

```txt
stage-by-stage QA checks
pass/fail/uncertain chips
failure class
remediation options
human-readable explanation
technical IDs for users with audit:view
```

Admin Recovery must show:

```txt
failed QA jobs
retryable failures
terminal failures
DLQ links
trace_id
provider failures
B2 reconciliation issues
```

---

## 18. Observability and Audit

### 18.1 Metrics

```txt
pre_enhancement_qa_pass_rate
post_enhancement_qa_pass_rate
pre_publish_qa_pass_rate
qa_failure_rate_by_class
moderation_review_required_rate
product_claim_violation_rate
product_appearance_review_required_rate
caption_drift_rate
safe_zone_failure_rate
qa_latency_ms
rerender_after_qa_rate
publish_blocked_by_qa_rate
```

### 18.2 Audit events

Audit:

```txt
QA check completed
QA failure classified
moderation blocked
review override accepted/denied
publish blocked by QA
claim verification failed
product appearance changed
remediation attempted
QA rerender requested
```

---

## 19. P0 Hackathon Slice

P0 must implement:

```txt
pre-enhancement QA for raw usability, product match, claim grounding, template allowed, budget allowed
post-enhancement QA for render success, captions, overlay facts, basic quality, provenance manifest exists
pre-publish QA for approval exists, product facts valid, package assets exist, share policy valid
failure classes: retryable, remediable, review_required, terminal
basic moderation for prompt/caption/publish text and representative output frames where feasible
QA result rows and visible Review UI status
QA events/callbacks through Core API
QA included in provenance manifest
```

P0 may simplify:

```txt
manual visual product appearance review instead of fully automated visual diff
basic safe-zone checks only
local claim regex plus structured LLM extraction
no destination-specific social policy beyond generic variant checks
no full human moderation queue beyond Review Queue
```

---

## 20. P1 Production Beta

P1 should add:

```txt
automated visual diff for product appearance
OCR on generated frames and thumbnails
safe-zone validation per destination
moderation result table
claim verification table
fact refresh result integration
automatic remediation for caption/safe-zone issues
provider fallback QA comparisons
QA dashboards
red-team/adversarial QA fixtures
```

---

## 21. P2/P3 Future

P2/P3 may add:

```txt
destination-specific policy packs
brand-specific moderation policy
marketplace/compliance policy adapters
human moderation escalation queues
advanced product visual integrity models
multi-language claim extraction
quality scoring model trained on reviewer feedback
A/B QA evaluation for template performance
```

---

## 22. Test Fixtures

Required fixtures:

```txt
raw source corrupted
raw source missing B2 object
valid enhanced output passes QA
caption timing drift remediable
caption contains unsupported discount
product card uses wrong price
AI restyle changes product color
thumbnail contains ungrounded urgency claim
moderation blocks publish description
provider timeout retryable
B2 checksum mismatch terminal
publish package missing approval
expired offer before publish
uncertain product match review_required
safe-zone overlay issue remediable
```

Acceptance tests should map to:

```txt
REQ-QA-001
REQ-QA-002
REQ-QA-003
REQ-QA-004
REQ-QA-005
REQ-CATALOG-005
REQ-PUBLISH-002
REQ-PROV-001
REQ-SEC-002
REQ-AUDIT-001
```

---

## 23. AI Coding Agent Instructions

```txt
1. Do not skip QA gates for the happy path.
2. Do not treat provider success as QA success.
3. Do not pass captions/overlays unless product claims are verified.
4. Do not auto-publish review_required or terminal QA outputs.
5. Do not classify ambiguous product appearance changes as pass.
6. Do not store raw prompts/transcripts in normal logs.
7. Do not let QA Agent mutate state directly.
8. Always preserve qa_check_id and failure IDs in provenance/audit where relevant.
9. Always map QA failures to retryable, remediable, review_required, or terminal.
10. If a check is not implemented, mark it skipped with an explicit reason and policy impact.
```

---

## 24. Open Questions

```txt
1. Exact P0 moderation provider/model and threshold values.
2. Exact automated product visual integrity method for production beta.
3. Whether moderation_result should be a first-class table in P0 or stored in qa_checks.result_json.
4. Exact destination safe-zone specifications for TikTok/Reels/Shorts.
5. Exact policy for publishing when live refresh is unsupported.
6. Exact maximum remediation attempts by plan.
7. Exact human override matrix by role/capability.
8. Exact QA score weighting for overall pass/fail.
```
