# Data Model: Lumiq Complete UI Screen System

This model defines UI-only TypeScript entities for mock data, route state, and component
contracts. These are not database entities and must not be treated as persistence schema.
They exist to let UI screens render all documented states without backend integration.

## Entity: ScreenRoute

Represents a user-reachable route or nested screen.

**Fields**

- `id`: stable screen identifier, e.g. `studio.control-room`.
- `path`: app route path, e.g. `/studio`, `/review/[momentId]`.
- `group`: `public`, `setup`, `workspace`, `studio`, `review`, `vault`, `commerce`,
  `publish`, `provenance`, `analytics`, `admin`, or `settings`.
- `title`: display title.
- `description`: one-sentence screen purpose.
- `shell`: `public`, `workspace`, `focused-studio`, or `share`.
- `primaryStates`: screen states that must be previewable.
- `requiredRolePresets`: mock roles that can access the screen.
- `responsiveMode`: `marketing`, `app-shell`, `media-control-room`, `dense-table`,
  `detail-tabs`, or `share`.

**Validation Rules**

- Public routes must not require workspace navigation.
- Workspace routes must render inside the app shell.
- Every route must include at least one ready state and one non-happy state.

## Entity: ScreenState

Represents a named UI state variant.

**Fields**

- `id`: state identifier.
- `label`: user-visible state label.
- `kind`: `empty`, `loading`, `ready`, `processing`, `blocked`, `failed`,
  `review-required`, `disabled`, `success`, `revoked`, `expired`, or `access-denied`.
- `message`: explanatory copy.
- `severity`: `neutral`, `info`, `processing`, `success`, `warning`, or `danger`.
- `availableActions`: list of action identifiers that render enabled.
- `disabledActions`: list of action identifiers that render disabled with reason.
- `requiredCapability`: optional capability for action visibility.

**Validation Rules**

- Blocked and failed states must include a user-facing reason.
- Disabled actions must include a reason.
- Status must include text, not color alone.

## Entity: MockOrganization

Represents seeded tenant/workspace state.

**Fields**

- `organizationId`: ULID-like ID.
- `name`: organization name.
- `workspaceSlug`: URL-safe slug.
- `plan`: `demo`, `starter`, `pro`, or `enterprise`.
- `setupStatus`: `empty`, `incomplete`, `ready`, or `seeded-demo`.
- `catalogSnapshotId`: optional snapshot ID.
- `productCount`: number.
- `campaignCount`: number.
- `allowedClaimCount`: number.
- `providerReadiness`: `ready`, `mocked`, `missing`, or `degraded`.
- `storageReadiness`: `ready`, `mocked`, `missing`, or `degraded`.

**Validation Rules**

- Seeded demo organizations must include catalog, campaign, budget, and provider/storage
  readiness summaries.
- Empty organizations must route to setup before Live Studio.

## Entity: MockRolePreset

Represents UI-only capability visibility.

**Fields**

- `role`: `owner`, `admin`, `editor`, `reviewer`, `viewer`, or `host`.
- `label`: display name.
- `capabilities`: list of Lumiq capability strings.
- `hiddenSections`: workspace sections hidden from navigation.
- `disabledActions`: actions shown disabled with explanation.

**Validation Rules**

- `viewer` must not expose admin recovery, delete, publish approve, retention change, or
  billing manage actions.
- `reviewer` can see Review and evidence but cannot mutate billing/retention/provider
  settings.

## Entity: MockProduct

Represents catalog product UI.

**Fields**

- `productId`, `organizationId`, `sku`, `name`, `productUrl`.
- `priceLabel`, `inventoryLabel`, `mediaRefs`.
- `allowedClaims`: array of `AllowedClaim`.
- `completeness`: `complete`, `missing-media`, `missing-claims`, `missing-url`, or
  `draft`.
- `snapshotIncluded`: boolean.

**Validation Rules**

- Product claims rendered in generated/publish copy must appear in `allowedClaims`.
- Missing claims must produce blocked/review-required UI when generated copy contains
  product assertions.

## Entity: AllowedClaim

Represents a verified product or campaign claim.

**Fields**

- `claimId`, `claimText`, `source`: `catalog`, `campaign`, `live-refresh`, or `manual`.
- `risk`: `low`, `medium`, or `restricted`.
- `supportingField`: product/campaign field or evidence reference.
- `status`: `active`, `expired`, `blocked`, or `review-required`.

**Validation Rules**

- Restricted claims such as discounts, limited stock, free shipping, warranty, authenticity,
  waterproofing, and expiry must show explicit support or blocked state.

## Entity: MockCampaign

Represents campaign/offer UI.

**Fields**

- `campaignId`, `organizationId`, `name`, `status`.
- `activeProductIds`.
- `offerTerms`, `startsAt`, `endsAt`.
- `allowedClaimIds`.
- `publishDestinations`: mock destination labels.

**Validation Rules**

- Expired campaigns must block publish-readiness states for claims tied to the expired
  offer.
- Campaign detail must surface active products and allowed claims.

## Entity: CatalogSnapshot

Represents frozen commerce facts for a session.

**Fields**

- `catalogSnapshotId`, `organizationId`, `createdAt`.
- `productCount`, `offerCount`, `claimCount`.
- `manifestAssetId`, `manifestB2Key`, `sha256`.
- `status`: `ready`, `missing`, `failed`, or `stale`.

**Validation Rules**

- Commerce-grounded Live Studio and publish package screens must show snapshot readiness.
- B2 keys must begin with `tenants/{organization_id}/`.

## Entity: MockSession

Represents live/prerecorded session UI state.

**Fields**

- `sessionId`, `organizationId`, `title`, `sourceType`.
- `status`: `created`, `opening`, `live`, `closing`, `closed`, `error`, or `reconciled`.
- `sourceStatus`: `ready`, `buffering`, `missing`, `error`.
- `recordingPolicy`: `moment-only`, `full-session`, or `live-transformed-lineage`.
- `automationPolicy`: confidence-tiered policy summary.
- `budgetSummary`: remaining/used mock values.
- `catalogSnapshotId`, `campaignId`.

**Validation Rules**

- Live Studio cannot show commerce-grounded ready state without snapshot and campaign.
- Full-session recording state must show cost/retention warning.

## Entity: SignalEvent

Represents signal feed and timeline items.

**Fields**

- `signalId`, `sessionId`, `momentId?`.
- `type`: `product_visible`, `offer_keyword`, `audio_energy`, `manual_marker`,
  `candidate_proposed`, `capture_authorized`, `generation_requested`, `qa_completed`,
  `publish_completed`, `budget_blocked`, or `duplicate_suppressed`.
- `occurredAt`, `timelineMs`, `confidence`, `reason`.
- `severity`: semantic status.
- `evidenceRefs`: transcript, frame, product, policy, or budget references.

**Validation Rules**

- Candidate signals must include a human-readable reason.
- Timeline markers must have text equivalents.

## Entity: MockMoment

Represents candidate/captured/generated moment UI.

**Fields**

- `momentId`, `organizationId`, `sessionId`, `campaignId`, `productId`.
- `momentType`, `score`, `state`.
- `startMs`, `endMs`, `rawCaptureStartMs`, `rawCaptureEndMs`.
- `selectionReason`, `aiExplanation`.
- `evidenceSummary`, `productFactStatus`, `qaStatus`, `publishState`.
- `assetIds`, `generationRunIds`, `canonicalAssetId`, `publishPackageId`.

**Validation Rules**

- Moment cards must show media preview, moment type, product/campaign, QA, product facts,
  short AI explanation, lineage mini-chain, and actions.
- Published moments must link to publish package and provenance.

## Entity: AssetRef

Represents UI-only asset proof.

**Fields**

- `assetId`, `organizationId`, `sessionId?`, `momentId?`.
- `role`: `raw_source`, `raw_mezzanine`, `live_transformed`, `enhanced_master`,
  `publish_variant`, `thumbnail`, `captions`, `transcript`, `evidence`, `manifest`, or
  `catalog_snapshot`.
- `bucket`, `objectKey`, `mimeType`, `bytes`, `sha256`.
- `verificationStatus`: `unverified`, `verified`, or `failed`.
- `previewKind`: `video`, `image`, `text`, `json`, or `placeholder`.

**Validation Rules**

- Canonical mock object keys must be immutable-looking and tenant-scoped.
- Checksums must appear where technical proof is shown.

## Entity: GenerationRunRef

Represents Genblaze/provider run UI.

**Fields**

- `generationRunId`, `momentId`, `parentRunId?`.
- `runType`, `status`, `provider`, `model`.
- `templateId`, `templateVersion`, `stepGraphId`.
- `inputAssetId`, `outputAssetId`, `manifestAssetId`.
- `estimatedCostUsd`, `actualCostUsd`, `startedAt`, `completedAt`.
- `errorCode?`, `errorMessage?`.

**Validation Rules**

- Generated outputs must link to generation run and manifest.
- Failed runs must include error class and recovery/retry UI state where applicable.

## Entity: QaSummary

Represents QA state.

**Fields**

- `qaResultId`, `momentId`, `stage`.
- `status`: `not_started`, `running`, `passed`, `failed`, `review_required`,
  `remediated`, or `terminal`.
- `failureClass?`: `retryable`, `remediable`, `review_required`, or `terminal`.
- `checks`: list of claim, caption, product appearance, quality, moderation, and publish
  readiness checks.
- `blockers`: list of blocking issues.

**Validation Rules**

- Review-required QA must disable or qualify approve actions.
- QA status must appear on review cards and detail.

## Entity: ReviewItem

Combines moment, assets, QA, facts, lineage, and actions for Review Queue.

**Fields**

- `reviewItemId`, `momentId`, `priority`.
- `view`: `global`, `by-session`, `by-campaign`, `by-product`, `publish-ready`,
  `needs-review`, or `failed`.
- `primaryAction`, `secondaryActions`.
- `disabledActionReasons`.

**Validation Rules**

- Review cards must support compare, evidence, provenance, edit, approve, reject, and
  rerender visual affordances.

## Entity: LineageNode

Represents compact or full provenance graph node.

**Fields**

- `nodeId`, `nodeType`, `label`, `status`.
- `resourceId`, `shortId`, `createdAt`.
- `assetId?`, `generationRunId?`, `publishPackageId?`.
- `b2ObjectKey?`, `sha256?`, `manifestRef?`.
- `provider?`, `model?`.
- `disclosureLevel`: `normal`, `reviewer`, or `admin`.

**Validation Rules**

- Normal users see summary lineage.
- Reviewers see asset IDs, QA, product facts, versions.
- Admins see B2 keys, checksums, manifests, events, runs, trace IDs.

## Entity: PublishPackage

Represents canonical publish package UI.

**Fields**

- `publishPackageId`, `momentId`, `state`.
- `title`, `description`, `hashtags`, `productLinks`.
- `videoAssetId`, `thumbnailAssetId`, `captionAssetId`.
- `variantAssetIds`, `provenanceManifestAssetId`.
- `destinationMetadata`, `readinessChecks`.

**Validation Rules**

- Publish-ready state requires canonical enhanced master, QA pass/override, valid product
  facts, and approval.
- Changed facts must show blocked/review-required state.

## Entity: SharePageState

Represents share page UI state.

**Fields**

- `shareSlug`, `publishPackageId`, `visibility`.
- `state`: `private`, `public`, `revoked`, `expired`, `access-denied`, or `unavailable`.
- `expiresAt?`, `downloadAllowed`, `provenanceVisible`.

**Validation Rules**

- Revoked and expired states must not look like active shares.
- Private access-denied state must be explicit and accessible.

## Entity: AdminRecoveryItem

Represents admin table rows.

**Fields**

- `itemId`, `type`, `resourceType`, `resourceId`.
- `status`, `severity`, `eventType?`, `schemaVersion?`.
- `organizationId`, `producer?`, `traceId`, `correlationId?`.
- `errorSummary`, `retryCount`, `lastAttemptAt`.
- `payloadPreview`, `relatedLinks`, `eligibleActions`.

**Validation Rules**

- Recovery actions must show required reason/audit warning.
- Viewer/non-admin roles must not access recovery action controls.

## Entity: AnalyticsMetric

Represents operational and media metrics.

**Fields**

- `metricId`, `label`, `value`, `unit`.
- `trend`, `timeframe`, `status`.
- `series`: optional chart data.

**Validation Rules**

- Operational charts use semantic status colors.
- Spectral gradient is reserved for lineage/AI paths, not cost/error charts.

## State Transitions Displayed by UI

These transitions are visual only and do not mutate durable backend state.

```text
Setup: empty -> incomplete -> ready -> seeded-demo
Session: created -> opening -> live -> closing -> closed/error
Moment: candidate -> capture_authorized -> capturing -> raw_uploaded
  -> enhancement_pending -> enhancing -> qa_pending -> review_pending
  -> approved -> canonical -> published
GenerationRun: queued -> running -> provider_pending -> completed/failed/cancelled
QA: not_started -> running -> passed/failed/review_required/remediated/terminal
PublishPackage: draft -> ready -> review_pending -> approved -> published/revoked/failed
SharePage: private -> public -> revoked/expired/access-denied/unavailable
AdminRecoveryItem: open -> retrying -> recovered/terminal/skipped
```

## Mock Data Naming Rules

- ULID-like IDs should use readable prefixes for UI clarity, e.g. `org_01...`,
  `sess_01...`, `mom_01...`, `asset_01...`, `run_01...`.
- B2 object keys must begin with `tenants/{organization_id}/`.
- Checksums must be SHA-256-like strings.
- Templates use lower snake case and version suffix, e.g. `clean_product_reveal_v1`.
- Event types use dotted names, e.g. `moment.capture.authorized`.
- Asset roles use lower snake case from the glossary.
