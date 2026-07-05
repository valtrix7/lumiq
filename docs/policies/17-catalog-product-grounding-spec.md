# 17 — Catalog & Product Grounding Specification

**Project:** Lumiq — Live Commerce Moment Vault  
**Document ID:** `17-catalog-product-grounding-spec.md`  
**Status:** Draft v1  
**Audience:** commerce engineers, backend engineers, AI engineers, catalog/integrations engineers, QA, product, reviewers, AI coding agents  
**Depends on:** `00-spec-index.md`, `01-product-requirements.md`, `02-project-constitution.md`, `03-glossary-domain-language.md`, `04-requirements-ears.md`, `05-user-flows-ux-spec.md`, `06-system-architecture-c4.md`, `07-service-decomposition.md`, `08-data-model-database-schema.md`, `09-api-contract-openapi.yaml`, `10-event-contract-asyncapi.yaml`, `11-json-schemas.md`, `12-agent-architecture-mastra.md`, `14-b2-storage-provenance-spec.md`, `15-template-step-graph-spec.md`, `16-moment-detection-ranking-spec.md`, `18-qa-moderation-policy-spec.md` when created.

---

## 1. Purpose

This document defines Lumiq's catalog, campaign, allowed-claims, snapshot, and product-grounding system.

Lumiq generates commerce media. That means the system must never treat AI-written product facts as truth. Every product name, SKU, price, discount, inventory statement, shipping statement, availability statement, product URL, campaign claim, and product-card overlay must be backed by structured catalog/campaign data.

This document answers:

1. What is the catalog system?
2. What data does a product need?
3. What is a campaign and offer?
4. What is an allowed claim?
5. How are catalog snapshots created and stored?
6. How do agents use catalog facts without inventing claims?
7. How are AI-suggested product matches verified?
8. How are product facts refreshed before publish?
9. Which claims are blocked, review-required, or allowed?
10. How does product grounding integrate with templates, QA, B2 provenance, and publish packages?
11. What is P0 for the hackathon path and P1/P2 for production?

The goal is to make commerce grounding deterministic for humans and AI coding agents.

---

## 2. Source-of-Truth Constraints

This document inherits these Lumiq rules:

```txt
Product facts must be grounded.
Catalog snapshots are required for commerce-grounded outputs.
AI may suggest facts, but backend must verify facts.
Final captions, overlays, titles, thumbnails, and publish copy cannot contain ungrounded claims.
Catalog snapshots must exist in Postgres queryable rows and B2 immutable manifests.
Agents cannot override catalog facts.
Critical facts must be refreshed before external publish where an adapter supports refresh.
If facts materially changed, auto-publish is blocked.
```

Relevant requirement IDs:

```txt
REQ-CATALOG-001  Manual Product Creation
REQ-CATALOG-002  CSV Import
REQ-CATALOG-003  Catalog Snapshot Creation
REQ-CATALOG-004  B2 Snapshot Manifest
REQ-CATALOG-005  Product Fact Grounding
REQ-CATALOG-006  Live Refresh Before Publish
REQ-SIGNAL-003   AI Validation
REQ-QA-001       Pre-enhancement QA
REQ-QA-002       Post-enhancement QA
REQ-QA-003       Pre-publish QA
REQ-PUBLISH-001  Publish Package Creation
REQ-PROV-001     Dual-source Provenance
REQ-PROV-003     Manifest Fields
REQ-SEC-002      Prompt Injection Resistance
```

---

## 3. Research and Source Notes

This spec primarily derives from Lumiq's internal PRD, glossary, requirements, data model, API contract, event contract, Mastra agent architecture, B2 provenance spec, template step graph spec, and moment detection spec.

External commerce provider behavior changes frequently. This document intentionally does **not** lock Shopify, WooCommerce, TikTok Shop, Amazon, or marketplace-specific schema details. Those belong in future adapter specs.

Stable implementation stance:

```txt
P0 catalog sources:
  manual_catalog
  seeded_demo_catalog

P1 catalog sources:
  csv_import

P2/P3 catalog sources:
  Shopify
  WooCommerce
  custom API
  live-commerce platform adapters
  marketplace adapters
```

Important constraint:

```txt
Product facts used in a session must come from the session's catalog_snapshot, not from live mutable product rows, unless a pre-publish refresh explicitly updates or blocks the publish package.
```

---

## 4. Definitions

### Product

A product is a sellable item represented by a stable `product_id` and organization-scoped merchant fields.

Minimum P0 product fields:

```txt
product_id
organization_id
sku
name
product_url optional
price_amount optional
price_currency optional
description optional
inventory_status optional
product_assets optional
allowed_claims optional
source_adapter
external_ref optional
created_at
updated_at
```

### Campaign

A campaign is a structured commerce context for a session, launch, sale, event, or collection.

Minimum fields:

```txt
campaign_id
organization_id
name
status
starts_at nullable
ends_at nullable
products
campaign_offers
allowed_product_claims
metadata_json
```

### Offer

An offer is a structured price/promotion statement that may be used in overlays, captions, and publish copy only while valid.

Examples:

```txt
20% off
Buy one get one
Free shipping
Launch price $49
Limited-time bundle
```

### Allowed Claim

An allowed claim is a product or campaign statement approved for generated media.

Allowed claims must be explicit and typed:

```txt
claim_id
claim_text
claim_type
product_id nullable
campaign_id nullable
evidence_ref nullable
valid_from nullable
valid_until nullable
approval_status
created_by_user_id
```

### Catalog Snapshot

A catalog snapshot is a frozen, session-bound copy of product, offer, claim, and product-asset facts.

Stored in:

```txt
Postgres queryable rows
B2 immutable catalog snapshot manifest
```

### Product Grounding

Product grounding is the process of verifying that any product fact in a generated output comes from the catalog snapshot or an approved live refresh.

---

## 5. Non-Negotiable Product Grounding Rules

```yaml
rules:
  CAT-GROUND-001:
    title: AI suggestions are not product truth
    rule: >
      Agent, LLM, transcript, and vision outputs may suggest product facts, but
      final generated media may use only facts verified against catalog snapshot
      rows or approved live refresh results.

  CAT-GROUND-002:
    title: Commerce-grounded output requires snapshot
    rule: >
      Any output containing product-specific facts, product cards, prices,
      discounts, availability, shipping, superlatives, claims, or product links
      requires catalog_snapshot_id.

  CAT-GROUND-003:
    title: Snapshot is the render source
    rule: >
      Generation, templates, captions, product cards, and publish packages must
      read frozen facts from catalog_snapshot_id, not mutable product rows.

  CAT-GROUND-004:
    title: No ungrounded claim fallback
    rule: >
      If a requested claim cannot be verified, the system must remove it,
      rewrite it, block generation, or route to human review. It must not silently
      render the claim.

  CAT-GROUND-005:
    title: Critical facts refresh before external publish
    rule: >
      Where an adapter supports refresh, price, availability, offer validity,
      inventory status, product URL, and claim validity must be refreshed before
      external publish.

  CAT-GROUND-006:
    title: Material fact changes block auto-publish
    rule: >
      If a critical fact changes materially after generation, auto-publish must
      be blocked and the package must require review or rerender.

  CAT-GROUND-007:
    title: Agents cannot override catalog facts
    rule: >
      Agent memory, transcripts, user prompts, or product descriptions cannot
      override catalog_snapshot facts or allowed_claims.
```

---

## 6. Product Data Model

### 6.1 Product fields

```yaml
product_contract:
  required_p0:
    product_id: ULID
    organization_id: ULID
    sku: string
    name: string
    source_adapter: manual_catalog | seeded_demo_catalog | csv_import | shopify | woocommerce | custom_api
    created_at: ISODateTime
    updated_at: ISODateTime
  optional_p0:
    description: string
    product_url: uri
    price_amount: number
    price_currency: ISO_4217_string
    inventory_status: in_stock | low_stock | out_of_stock | preorder | unknown
    metadata_json: object
  optional_p1:
    compare_at_price_amount: number
    category: string
    brand: string
    variant_options: object
    product_media_refs: array
    external_ref: string
    barcode: string
    tax_category: string
  forbidden_for_ai_freeform:
    - unverified_best_seller_rank
    - fake_inventory_count
    - fake_shipping_promise
    - fake_guarantee
```

### 6.2 Product asset fields

Product assets are reference media used for product matching, cards, and review.

```yaml
product_asset_contract:
  product_asset_id: ULID
  organization_id: ULID
  product_id: ULID
  asset_id: ULID nullable
  external_url: string nullable
  role: primary | gallery | reference | packaging | color_reference | lifestyle | demo_video
  sort_order: integer
  created_at: ISODateTime
```

Rules:

```txt
Product reference media may help product matching.
Product reference media is not proof of a live moment by itself.
Product reference media must be organization-scoped.
External URLs must be copied to B2 if used as durable evidence for a session snapshot or generated asset.
```

---

## 7. Campaign and Offer Model

### 7.1 Campaign states

```yaml
campaign_status:
  values:
    - draft
    - active
    - paused
    - ended
    - archived
```

### 7.2 Offer fields

```yaml
campaign_offer_contract:
  campaign_offer_id: ULID
  organization_id: ULID
  campaign_id: ULID
  product_id: ULID nullable
  offer_type: percent_discount | fixed_discount | sale_price | bundle | free_shipping | gift_with_purchase | other
  offer_text: string
  price_amount: number nullable
  price_currency: string nullable
  discount_percent: number nullable
  valid_from: ISODateTime nullable
  valid_until: ISODateTime nullable
  is_active: boolean
  evidence_ref: string nullable
  created_at: ISODateTime
```

### 7.3 Offer validity rules

```yaml
offer_validity_rules:
  valid:
    - is_active=true
    - now >= valid_from if valid_from exists
    - now <= valid_until if valid_until exists
    - product_id is null or matches output product
  expired:
    - now > valid_until
  scheduled:
    - now < valid_from
  ambiguous:
    - no valid_from and no valid_until but claim implies urgency
```

Examples:

```txt
"20% off" requires active discount_percent=20 or equivalent approved claim.
"Ends tonight" requires campaign/offer valid_until and timezone.
"Limited stock" requires an approved inventory claim or live inventory status.
"Free shipping" requires active offer or allowed shipping claim.
```

---

## 8. Allowed Claim System

### 8.1 Claim types

```yaml
claim_types:
  discount:
    examples: ["20% off", "$10 off", "launch price"]
    grounding_source: campaign_offer
    risk: high

  inventory:
    examples: ["limited stock", "only 5 left", "back in stock"]
    grounding_source: product_inventory_or_claim
    risk: high

  feature:
    examples: ["water-resistant", "vegan leather", "machine washable"]
    grounding_source: allowed_product_claim
    risk: medium_high

  shipping:
    examples: ["free shipping", "ships today", "2-day delivery"]
    grounding_source: campaign_offer_or_shipping_policy_claim
    risk: high

  social_proof:
    examples: ["best-selling", "customer favorite", "5-star rated"]
    grounding_source: approved_claim_with_evidence
    risk: high

  guarantee:
    examples: ["lifetime warranty", "money-back guarantee"]
    grounding_source: approved_claim_with_evidence
    risk: high

  identity:
    examples: ["official", "authentic", "licensed"]
    grounding_source: approved_claim_with_evidence
    risk: high

  product_identity:
    examples: ["SKU", "product name", "variant color"]
    grounding_source: catalog_snapshot_product
    risk: medium

  generic_creative:
    examples: ["new drop", "fan favorite style", "watch the reveal"]
    grounding_source: policy_or_review
    risk: low_medium
```

### 8.2 Claim decisions

```yaml
claim_decision:
  allow:
    meaning: Claim may appear in final asset without extra review.
    requirements:
      - backed_by_snapshot_or_refresh
      - within_validity_window
      - not contradicted by current facts
      - template destination allows claim

  rewrite:
    meaning: Claim intent is acceptable but wording is too strong or unsupported.
    example:
      input: "best waterproof bag ever"
      output: "water-resistant everyday bag" only if water-resistant claim is approved

  remove:
    meaning: Claim is not required for asset and lacks support.

  block_generation:
    meaning: Claim is central to requested template and unsupported.

  review_required:
    meaning: Claim may be true but evidence is ambiguous, stale, or high-risk.
```

### 8.3 Restricted claim list

Claims in this list require explicit support:

```txt
percent discount
fixed discount
sale price
free shipping
limited stock
only X left
expires today
best-selling
#1
official
authentic
licensed
guaranteed
waterproof
water-resistant
hypoallergenic
medical/health claims
sustainability claims
warranty claims
fast shipping
same-day shipping
```

### 8.4 Claim grounding example

```yaml
candidate_caption:
  text: "Get 30% off this waterproof tote before it sells out."

claim_extraction:
  - claim_text: "30% off"
    claim_type: discount
    required_source: campaign_offer
  - claim_text: "waterproof"
    claim_type: feature
    required_source: allowed_product_claim
  - claim_text: "before it sells out"
    claim_type: inventory
    required_source: inventory_claim_or_live_inventory

result:
  if_all_supported: allow
  if_discount_only_supported: rewrite_to_remove_waterproof_and_inventory
  if_no_discount_supported: block_or_review_required
```

---

## 9. Catalog Snapshot Lifecycle

### 9.1 Snapshot creation trigger

Snapshots are created when:

```txt
commerce-grounded session starts
publish package requires refreshed facts snapshot
manual admin export requested
catalog snapshot explicitly requested for testing/demo
```

P0 trigger:

```txt
POST /api/catalog/snapshots
session start preflight attaches catalog_snapshot_id
```

### 9.2 Snapshot inputs

```yaml
snapshot_inputs:
  organization_id: required
  campaign_id: nullable
  session_id: nullable at creation, required when attached to session
  product_ids: optional subset
  include_active_offers: true
  include_allowed_claims: true
  include_product_assets: true
  created_by_user_id: nullable
  idempotency_key: required
```

### 9.3 Snapshot output records

Postgres records:

```txt
catalog_snapshots
catalog_snapshot_products
catalog_snapshot_offers
catalog_snapshot_claims
catalog_snapshot_assets
assets row for manifest asset
manifest_records row
```

B2 objects:

```txt
tenants/{organization_id}/catalog/snapshots/{catalog_snapshot_id}/catalog_snapshot.json
tenants/{organization_id}/catalog/snapshots/{catalog_snapshot_id}/catalog_snapshot_manifest.json
```

Session-local copy for readability:

```txt
tenants/{organization_id}/sessions/{session_id}/catalog/catalog_snapshot.json
tenants/{organization_id}/sessions/{session_id}/catalog/catalog_snapshot_manifest.json
```

### 9.4 Snapshot immutability

```txt
Snapshots are immutable.
If product facts change, create a new snapshot or refresh result.
Do not update existing snapshot rows except operational fields such as verification status.
Do not overwrite B2 snapshot objects.
```

### 9.5 Snapshot hash

Snapshot hash covers:

```txt
schema_version
organization_id
campaign_id
product list
product facts
offer list
offer facts
allowed claims
product asset refs
created_at
```

Recommended hash:

```txt
snapshot_hash = sha256(canonical_json(snapshot_payload))
```

---

## 10. Catalog Snapshot Manifest

### 10.1 Manifest path

```txt
tenants/{organization_id}/sessions/{session_id}/catalog/catalog_snapshot.json
```

If snapshot exists before session attachment:

```txt
tenants/{organization_id}/catalog/snapshots/{catalog_snapshot_id}/catalog_snapshot.json
```

### 10.2 Manifest schema

```json
{
  "schema_version": "1.0.0",
  "manifest_type": "catalog_snapshot",
  "catalog_snapshot_id": "01H...",
  "organization_id": "01H...",
  "campaign_id": "01H...",
  "session_id": "01H...",
  "created_at": "2026-06-26T00:00:00Z",
  "created_by_actor": {
    "actor_type": "user | worker | system",
    "actor_id": "01H..."
  },
  "source_adapter": "manual_catalog",
  "snapshot_hash": "sha256:...",
  "products": [
    {
      "product_id": "01H...",
      "sku": "SKU-001",
      "name": "Example Product",
      "description": "Short approved description",
      "product_url": "https://example.com/products/sku-001",
      "price_amount": 49.0,
      "price_currency": "USD",
      "inventory_status": "in_stock",
      "assets": [
        {
          "product_asset_id": "01H...",
          "role": "primary",
          "asset_id": "01H...",
          "external_url": null,
          "sha256": "sha256:..."
        }
      ]
    }
  ],
  "offers": [
    {
      "campaign_offer_id": "01H...",
      "product_id": "01H...",
      "offer_type": "percent_discount",
      "offer_text": "20% off",
      "discount_percent": 20,
      "valid_from": "2026-06-01T00:00:00Z",
      "valid_until": "2026-06-30T23:59:59Z"
    }
  ],
  "allowed_claims": [
    {
      "claim_id": "01H...",
      "product_id": "01H...",
      "campaign_id": "01H...",
      "claim_text": "water-resistant",
      "claim_type": "feature",
      "valid_from": null,
      "valid_until": null,
      "evidence_ref": "brand-approved-spec-sheet"
    }
  ]
}
```

### 10.3 Manifest validation rules

```txt
Manifest must validate against catalog-snapshot.schema.json.
Manifest must include organization_id.
Manifest object key must include tenants/{organization_id}/.
Manifest must have sha256 stored in assets and manifest_records.
Manifest must not contain provider credentials, secrets, raw prompts, or unrelated customer data.
```

---

## 11. Product Match Grounding

### 11.1 Product match sources

Product matching may use:

```txt
transcript excerpts
host product name mention
SKU mention
on-screen text OCR later
sampled frame references
product reference images
campaign context
manual reviewer selection
```

### 11.2 Product Matcher Agent output

The Product Matcher Agent may return candidates:

```yaml
product_match_result:
  matches:
    - product_id: ULID
      sku: string
      confidence: number_0_to_1
      evidence_refs: array
      uncertainty_reason: string_or_null
  needs_human_review: boolean
```

### 11.3 Backend validation

Backend must verify:

```txt
product_id exists in catalog_snapshot_products
sku matches snapshot product
product belongs to organization_id
claim/caption/product-card content uses facts from snapshot
confidence meets policy threshold for automation
```

### 11.4 Product match confidence policy

```yaml
product_match_policy:
  high_confidence:
    threshold: ">= 0.90"
    allowed_behavior:
      - use product name in review UI
      - use product card if other facts are grounded
      - auto-enhance if budget/template policy allows
    caveat: no external publish without publish policy

  medium_confidence:
    threshold: "0.70 - 0.89"
    allowed_behavior:
      - capture raw
      - queue for review
      - show suggested product
    blocked_behavior:
      - auto-publish product claims

  low_confidence:
    threshold: "< 0.70"
    allowed_behavior:
      - store signal or lightweight candidate
      - ask reviewer to choose product
    blocked_behavior:
      - product-specific overlays
      - product-specific publish copy
```

---

## 12. Fact Verification Pipeline

### 12.1 Verification stages

```txt
1. Extract claims from proposed caption/overlay/title/product card.
2. Classify each claim by type and risk.
3. Resolve candidate product and campaign scope.
4. Search catalog_snapshot_products/offers/claims.
5. Decide allow/rewrite/remove/block/review_required.
6. Store verification result.
7. Pass only verified facts to render/publish steps.
8. Include claims_used in provenance manifest.
```

### 12.2 Fact source priority

```yaml
fact_source_priority:
  1_catalog_snapshot_product:
    uses:
      - product_id
      - sku
      - name
      - product_url
      - price_at_snapshot
      - inventory_status_at_snapshot

  2_catalog_snapshot_offer:
    uses:
      - discount
      - campaign price
      - valid offer text
      - validity window

  3_catalog_snapshot_allowed_claim:
    uses:
      - feature claims
      - shipping claims
      - warranty claims
      - social proof claims
      - official/authentic claims

  4_live_refresh_result:
    uses:
      - pre_publish updated price
      - inventory
      - offer validity
      - product URL availability
    limitations:
      - must not rewrite old manifest silently
      - must create refresh record / publish QA evidence

  forbidden:
    - transcript only
    - LLM memory only
    - user freeform prompt only
    - visual inference only
```

### 12.3 Verification result contract

```json
{
  "verification_id": "01H...",
  "organization_id": "01H...",
  "session_id": "01H...",
  "moment_id": "01H...",
  "catalog_snapshot_id": "01H...",
  "input_ref": {
    "source_type": "caption | overlay | title | description | hashtag | thumbnail_text | product_card",
    "source_id": "01H..."
  },
  "claims": [
    {
      "claim_text": "20% off",
      "claim_type": "discount",
      "decision": "allow",
      "source_ref_type": "catalog_snapshot_offer",
      "source_ref_id": "01H...",
      "risk": "high",
      "reason": "Active campaign offer supports 20% discount"
    }
  ],
  "overall_status": "passed | failed | review_required",
  "created_at": "2026-06-26T00:00:00Z"
}
```

---

## 13. Claim Extraction Rules

### 13.1 Surfaces to scan

```txt
caption_text
burned_caption_segments
hook_title
overlay_copy
product_card_fields
thumbnail_text
description
hashtags
share_page_title
publish_package_metadata
```

### 13.2 Extraction approach

P0:

```txt
regex/keyword extraction for known claim patterns
catalog exact string matching
campaign offer matching
LLM structured extraction through LLMProviderRouter where needed
```

P1:

```txt
claim taxonomy classifier
claim-risk model
language-specific extraction
OCR extraction from rendered thumbnail/output frames
```

### 13.3 Example patterns

```yaml
patterns:
  discount_percent:
    regex: "\\b([0-9]{1,2})\\s?%\\s?(off|discount)\\b"
    claim_type: discount
  fixed_discount:
    regex: "\\$[0-9]+\\s?off"
    claim_type: discount
  urgency:
    examples: ["today only", "ends tonight", "last chance"]
    claim_type: limited_time
  inventory:
    examples: ["only", "limited stock", "selling out", "back in stock"]
    claim_type: inventory
  shipping:
    examples: ["free shipping", "ships today", "2-day shipping"]
    claim_type: shipping
```

---

## 14. Template Integration

Templates must declare required fact scopes.

```yaml
template_fact_policy:
  clean_product_reveal_v1:
    required:
      - product_name
    optional:
      - product_url
      - price
    forbidden_without_claim:
      - discount
      - limited_stock
      - best_selling

  price_drop_flash_v1:
    required:
      - product_name
      - active_offer
      - discount_or_sale_price
    pre_enhancement_qa_required: true
    pre_publish_refresh_required: true

  limited_stock_cta_v1:
    required:
      - product_name
      - inventory_claim
    requires_human_review: true
    pre_publish_refresh_required: true
```

A template cannot render a field unless:

```txt
field exists in catalog snapshot
field is allowed by template policy
field passes claim verification
QA validates final rendered output
```

---

## 15. Agent Integration

### 15.1 Agents may do

```txt
suggest possible product matches
suggest likely offer mentions
extract possible claims
suggest safer copy alternatives
explain why a claim was blocked
recommend human review when uncertain
```

### 15.2 Agents must not do

```txt
create approved claims
modify catalog facts
invent SKU, price, offer, inventory, or product URL
authorize product fact override
bypass claim verification
publish ungrounded product copy
```

### 15.3 Agent tool gateway endpoints

Relevant tools:

```txt
read_catalog_snapshot
validate_product_match
validate_product_claim
generate_caption_options
explain_qa_result
explain_provenance
```

Tool outputs must include:

```txt
organization_id
catalog_snapshot_id
source evidence refs
structured claim refs
confidence
requires_human_review
```

---

## 16. Live Refresh Before Publish

### 16.1 Refresh trigger

Refresh runs when:

```txt
external publish requested
public share page created if org policy requires current facts
publish package includes price/discount/availability/limited-time claim
admin manually requests refresh
adapter reports catalog update after generation
```

### 16.2 Refresh fields

```txt
price_amount
price_currency
inventory_status
availability
product_url reachable/valid
offer validity
allowed claim validity
campaign status
```

### 16.3 Refresh outcomes

```yaml
refresh_outcomes:
  unchanged:
    publish_behavior: continue
  non_material_change:
    publish_behavior: continue_with_note
    examples:
      - description punctuation
      - product image sort order
  material_change:
    publish_behavior: block_auto_publish
    examples:
      - price changed
      - offer expired
      - product out of stock
      - product URL invalid
      - claim revoked
      - campaign ended
  adapter_unavailable:
    publish_behavior: review_required_if_high_risk_claims_else_warn
  unsupported_adapter:
    publish_behavior: rely_on_snapshot_with_disclosure_policy
```

### 16.4 Refresh record

```json
{
  "refresh_id": "01H...",
  "organization_id": "01H...",
  "publish_package_id": "01H...",
  "catalog_snapshot_id": "01H...",
  "adapter": "manual_catalog | shopify | custom_api",
  "status": "unchanged | non_material_change | material_change | failed | unsupported",
  "changed_fields": ["price_amount", "inventory_status"],
  "blocking": true,
  "reason": "Offer expired before external publish",
  "created_at": "2026-06-26T00:00:00Z"
}
```

---

## 17. Catalog Adapter Interface

### 17.1 Interface

```typescript
interface CatalogAdapter {
  adapterName: string;
  syncProducts(input: SyncProductsInput): Promise<SyncProductsResult>;
  syncProductAssets(input: SyncProductAssetsInput): Promise<SyncProductAssetsResult>;
  syncCampaigns(input: SyncCampaignsInput): Promise<SyncCampaignsResult>;
  syncInventory(input: SyncInventoryInput): Promise<SyncInventoryResult>;
  syncOffers(input: SyncOffersInput): Promise<SyncOffersResult>;
  resolveProductBySku(input: ResolveProductBySkuInput): Promise<ProductResolutionResult>;
  resolveProductByUrl(input: ResolveProductByUrlInput): Promise<ProductResolutionResult>;
  refreshCriticalFacts(input: RefreshCriticalFactsInput): Promise<RefreshCriticalFactsResult>;
}
```

### 17.2 Adapter rules

```txt
Adapters must be organization-scoped.
Adapters must not bypass Core API.
Adapters must not mutate generated assets.
Adapters must write audit events for sync and refresh.
Adapters must not expose external provider secrets to agents or browser.
Adapters must normalize data into Lumiq product/campaign/claim model.
```

### 17.3 P0 manual catalog behavior

P0 manual catalog supports:

```txt
create product
edit product
add allowed claims
create campaign
create offer
create snapshot
manual refresh from current local rows
```

P0 manual catalog does not support:

```txt
real inventory sync
external marketplace sync
automatic price refresh from storefront
variant matrix import
multi-currency live pricing
```

---

## 18. CSV Import Policy

CSV import is P1.

### 18.1 Required columns

```txt
sku
name
```

### 18.2 Optional columns

```txt
description
product_url
price_amount
price_currency
inventory_status
claim_text
claim_type
claim_valid_until
image_url
campaign_name
offer_text
offer_type
offer_valid_until
```

### 18.3 Validation rules

```txt
Reject rows without SKU or name.
Validate product_url format.
Validate price is numeric and non-negative.
Validate currency is 3-letter code.
Validate claim_type against enum.
Do not auto-approve high-risk claims unless org policy allows trusted import.
Report per-row errors.
Create import job and audit event.
```

### 18.4 CSV import result

```json
{
  "import_job_id": "01H...",
  "organization_id": "01H...",
  "status": "completed | completed_with_errors | failed",
  "created_count": 10,
  "updated_count": 4,
  "skipped_count": 2,
  "error_rows": [
    {
      "row_number": 5,
      "error_code": "missing_sku",
      "message": "SKU is required"
    }
  ]
}
```

---

## 19. API Integration

Relevant existing endpoints:

```txt
GET  /api/catalog/products
POST /api/catalog/products
GET  /api/catalog/products/{product_id}
PATCH /api/catalog/products/{product_id}
POST /api/catalog/import-csv
POST /api/catalog/snapshots
GET  /api/catalog/snapshots/{catalog_snapshot_id} future
POST /api/campaigns
GET  /api/campaigns
POST /api/sessions/{session_id}/preflight
POST /api/sessions/{session_id}/start
POST /api/publish-packages
```

Recommended future endpoints:

```txt
POST /api/catalog/products/{product_id}/claims
PATCH /api/catalog/claims/{claim_id}
POST /api/catalog/snapshots/{catalog_snapshot_id}/verify-claim
POST /api/publish-packages/{publish_package_id}/refresh-facts
GET  /api/catalog/snapshots/{catalog_snapshot_id}/manifest
```

---

## 20. Event Integration

P0 events affected:

```txt
session.opened
moment.candidate.proposed
moment.capture.authorized
generation.requested
generation.completed
qa.completed
review.approved
publish.requested
publish.completed
```

Recommended future events:

```yaml
catalog.snapshot.created:
  producer: core-api.catalog-service
  consumers: [audit-worker, b2-provenance-verifier]

catalog.claim.verification.completed:
  producer: qa-worker | catalog-service
  consumers: [review-queue-updater, generation-service]

catalog.facts.refresh.completed:
  producer: catalog-service
  consumers: [publish-service, qa-worker, audit-worker]

catalog.import.completed:
  producer: catalog-service
  consumers: [web-notifications, audit-worker]
```

All events must use the standard event envelope.

---

## 21. Database Integration

Tables owned or heavily used:

```txt
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
assets
manifest_records
qa_checks
qa_failures
publish_packages
audit_events
```

Recommended future tables:

```yaml
claim_verifications:
  purpose: Persist per-surface claim validation results.
  primary_key: claim_verification_id
  key_columns:
    - organization_id
    - session_id
    - moment_id
    - catalog_snapshot_id
    - source_type
    - source_id
    - status
    - result_json

fact_refresh_results:
  purpose: Persist pre-publish live refresh outcomes.
  primary_key: fact_refresh_id
  key_columns:
    - organization_id
    - publish_package_id
    - catalog_snapshot_id
    - adapter
    - status
    - changed_fields_json
    - blocking
    - created_at

catalog_import_jobs:
  purpose: Persist CSV/import adapter jobs.
  primary_key: catalog_import_job_id
  key_columns:
    - organization_id
    - source_adapter
    - status
    - row_count
    - result_json
    - created_at
```

---

## 22. QA Integration

Product grounding feeds all QA stages.

### 22.1 Pre-enhancement QA

Checks:

```txt
catalog_snapshot_id exists for commerce-grounded generation
product match confidence sufficient
requested template fact requirements satisfied
caption/overlay proposed claims verified
campaign/offer valid at snapshot time
budget/policy permits generation
```

### 22.2 Post-enhancement QA

Checks:

```txt
rendered overlay text matches verified facts
captions do not introduce unverified claims
thumbnail text is verified
product card uses snapshot product URL/name/price
AI restyle did not misrepresent product appearance
```

### 22.3 Pre-publish QA

Checks:

```txt
critical facts refreshed where supported
no expired offers
no revoked claims
product URL valid where required
product availability acceptable
publish metadata claims verified
required disclosures/labels present
```

---

## 23. UI Requirements

Catalog UI must show:

```txt
product table
product detail card
SKU
price/currency
inventory status
product media
allowed claims
claim status
campaign membership
snapshot history
```

Review UI must show:

```txt
matched product
match confidence
catalog_snapshot_id
claims used
blocked claims
product facts tab
pre-publish refresh status
```

Publish UI must show:

```txt
product links
offer validity
claim verification status
refresh status
publish blockers
```

Admin UI must show:

```txt
snapshot manifest path
snapshot hash
B2 manifest verification
claim verification failures
fact refresh failures
adapter sync failures
```

---

## 24. Failure Handling

```yaml
failure_cases:
  missing_catalog_snapshot:
    class: terminal_for_commerce_grounded_generation
    action: block_generation

  product_match_uncertain:
    class: review_required
    action: queue_for_reviewer_product_selection

  unsupported_claim:
    class: remediable
    action: rewrite_or_remove_claim

  expired_offer:
    class: terminal_for_auto_publish
    action: block_publish_and_require_review

  adapter_refresh_failed:
    class: review_required
    action: block_high_risk_claim_publish_or_warn_for_low_risk

  snapshot_manifest_upload_failed:
    class: retryable
    action: retry_then_dlq

  snapshot_hash_mismatch:
    class: terminal_until_reconciled
    action: block_use_of_snapshot_and_open_admin_recovery

  cross_tenant_product_ref:
    class: security_failure
    action: deny_and_audit
```

---

## 25. Security and Privacy

```txt
Catalog data is organization-scoped.
Catalog snapshots may contain commercially sensitive product/campaign information.
Agents receive only scoped, minimized catalog context.
Do not log full catalog snapshots in normal logs.
Do not store provider credentials or storefront tokens in catalog metadata.
Do not allow cross-tenant product IDs in prompt context.
Do not expose unapproved claims in public share pages.
```

Public share pages may show only facts included in approved publish package metadata.

---

## 26. Provenance Requirements

Every generated output that uses product facts must record:

```txt
catalog_snapshot_id
catalog_snapshot_hash
claims_used
claim_verification_result_ids
product_id
campaign_id optional
offer_ids optional
fact_refresh_id optional
```

Provenance manifest must allow reviewers/admins to answer:

```txt
Which product facts were used?
Which snapshot supplied them?
Which claims were rendered?
Were those claims valid at render time?
Were they refreshed before publish?
Did any facts change?
Who approved the package?
```

---

## 27. P0 Hackathon Slice

P0 must implement:

```txt
manual/seeded product catalog
manual/seeded campaign and offer
allowed claims records
catalog snapshot creation at session start
B2 catalog snapshot manifest write
Product Matcher Agent reads snapshot context
claim verification for captions/product card/offer overlay
pre-enhancement QA checks grounding
post-enhancement QA checks overlay/caption facts
pre-publish QA checks offer still valid in local data
publish package includes product links and provenance refs
Review UI shows product facts and claims used
```

P0 may simplify:

```txt
no live external commerce adapter
no real-time inventory sync
no multi-currency conversion
no OCR claim extraction from final video
no advanced claim classifier beyond regex/structured LLM extraction
```

---

## 28. P1 Production Beta

P1 should add:

```txt
CSV import
claim verification table
fact refresh result table
snapshot diff UI
catalog import job UI
pre-publish refresh flow
claim extraction from all publish metadata surfaces
claim rewrite suggestions
catalog snapshot integrity reconciliation
semantic product search/matching
per-org claim approval workflow
```

---

## 29. P2/P3 Future

P2/P3 may add:

```txt
Shopify adapter
WooCommerce adapter
custom API adapter
variant matrix support
multi-currency pricing
storefront availability checks
inventory thresholds
marketplace-specific publish policy
automatic product media ingestion
product feed versioning
claim evidence attachment management
```

---

## 30. Test Fixtures

Required fixtures:

```txt
valid product reveal with product match
valid offer claim backed by campaign offer
caption suggests unsupported discount
caption suggests unsupported best-selling claim
expired offer before publish
product match confidence below threshold
snapshot manifest upload failure
snapshot hash mismatch
cross-tenant product_id injection attempt
CSV with invalid SKU and bad price
allowed claim revoked after generation
product URL removed before publish
```

Acceptance tests should map to:

```txt
REQ-CATALOG-001
REQ-CATALOG-003
REQ-CATALOG-004
REQ-CATALOG-005
REQ-CATALOG-006
REQ-QA-001
REQ-QA-002
REQ-QA-003
REQ-PROV-001
REQ-PUBLISH-001
REQ-SEC-002
```

---

## 31. AI Coding Agent Instructions

```txt
1. Do not generate product claims from transcript alone.
2. Do not treat LLM product matches as verified facts.
3. Always require catalog_snapshot_id for commerce-grounded outputs.
4. Validate claims before render, after render, and before publish.
5. Store snapshot manifests in B2 and asset/manifest rows in Postgres.
6. Do not overwrite catalog snapshots.
7. Do not use live product rows directly for a session render.
8. Preserve product_id, claim_id, offer_id, and catalog_snapshot_hash in provenance.
9. If unsure whether a claim is grounded, route to review or remove it.
10. Never invent commerce adapter behavior. Add an adapter spec first.
```

---

## 32. Open Questions

```txt
1. Exact CSV schema for first import template.
2. Exact claim approval workflow for non-owner users.
3. Whether P0 should support product variants or single-SKU products only.
4. Whether product media must be copied into B2 before snapshot creation.
5. Exact product categories used in hackathon demo.
6. Exact pre-publish refresh behavior for manual catalog source.
7. Exact claim thresholds for auto-rewrite vs review-required.
8. Whether to store claim_verifications as first-class table in P0 or inside qa_checks.result_json.
```
