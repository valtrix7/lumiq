/**
 * Screen and entity type definitions for the Lumiq UI-only screen system.
 *
 * Source: specs/001-ui-screens/data-model.md and contracts/ui-screen-contract.md.
 *
 * These are UI/mock contracts ONLY. They are not database schemas, API DTOs, or
 * persistence models. They exist so every documented screen can render all of its
 * states (empty, loading, ready, blocked, failed, review-required, etc.) from
 * seeded frontend data with no backend calls.
 */

/* ------------------------------------------------------------------ *
 * Routing & screen-state primitives
 * ------------------------------------------------------------------ */

export type ScreenGroup =
  | "public"
  | "setup"
  | "workspace"
  | "studio"
  | "review"
  | "vault"
  | "commerce"
  | "publish"
  | "provenance"
  | "analytics"
  | "admin"
  | "settings";

export type ShellKind = "public" | "workspace" | "focused-studio" | "share";

export type ResponsiveMode =
  | "marketing"
  | "app-shell"
  | "media-control-room"
  | "dense-table"
  | "detail-tabs"
  | "share";

export type RolePreset =
  | "owner"
  | "admin"
  | "editor"
  | "reviewer"
  | "viewer"
  | "host";

/** A user-reachable route or nested screen. */
export interface ScreenRoute {
  id: string;
  path: string;
  group: ScreenGroup;
  title: string;
  description: string;
  shell: ShellKind;
  primaryStates: string[];
  requiredRolePresets: RolePreset[];
  responsiveMode: ResponsiveMode;
}

export type ScreenStateKind =
  | "empty"
  | "loading"
  | "ready"
  | "processing"
  | "blocked"
  | "failed"
  | "review-required"
  | "disabled"
  | "success"
  | "revoked"
  | "expired"
  | "access-denied";

export type Severity =
  | "neutral"
  | "info"
  | "processing"
  | "success"
  | "warning"
  | "danger";

/** A named UI state variant for a screen or component. */
export interface ScreenState {
  id: string;
  label: string;
  kind: ScreenStateKind;
  message: string;
  severity: Severity;
  availableActions: string[];
  disabledActions: DisabledAction[];
  requiredCapability?: string;
}

/** An action that renders disabled together with the reason it is disabled. */
export interface DisabledAction {
  action: string;
  reason: string;
  requiredCapability?: string;
}

/* ------------------------------------------------------------------ *
 * Organization, roles, commerce
 * ------------------------------------------------------------------ */

export type OrganizationPlan = "demo" | "starter" | "pro" | "enterprise";
export type SetupStatus = "empty" | "incomplete" | "ready" | "seeded-demo";
export type Readiness = "ready" | "mocked" | "missing" | "degraded";

export interface MockOrganization {
  organizationId: string;
  name: string;
  workspaceSlug: string;
  plan: OrganizationPlan;
  setupStatus: SetupStatus;
  catalogSnapshotId?: string;
  productCount: number;
  campaignCount: number;
  allowedClaimCount: number;
  providerReadiness: Readiness;
  storageReadiness: Readiness;
}

export interface MockRolePreset {
  role: RolePreset;
  label: string;
  capabilities: string[];
  hiddenSections: string[];
  disabledActions: DisabledAction[];
}

export type ClaimSource = "catalog" | "campaign" | "live-refresh" | "manual";
export type ClaimRisk = "low" | "medium" | "restricted";
export type ClaimStatus = "active" | "expired" | "blocked" | "review-required";

export interface AllowedClaim {
  claimId: string;
  claimText: string;
  source: ClaimSource;
  risk: ClaimRisk;
  supportingField: string;
  status: ClaimStatus;
}

export type ProductCompleteness =
  | "complete"
  | "missing-media"
  | "missing-claims"
  | "missing-url"
  | "draft";

export interface MockProduct {
  productId: string;
  organizationId: string;
  sku: string;
  name: string;
  productUrl: string;
  priceLabel: string;
  inventoryLabel: string;
  mediaRefs: string[];
  allowedClaims: AllowedClaim[];
  completeness: ProductCompleteness;
  snapshotIncluded: boolean;
}

export type CampaignStatus = "draft" | "scheduled" | "active" | "expired" | "archived";

export interface MockCampaign {
  campaignId: string;
  organizationId: string;
  name: string;
  status: CampaignStatus;
  activeProductIds: string[];
  offerTerms: string;
  startsAt: string;
  endsAt: string;
  allowedClaimIds: string[];
  publishDestinations: string[];
}

/* ------------------------------------------------------------------ *
 * Templates (safe typed step graphs + allowed creative controls)
 * ------------------------------------------------------------------ */

export type TemplateStatus = "active" | "draft" | "deprecated" | "provider-unavailable";

export type TemplateStepKind =
  | "ingest"
  | "stabilize"
  | "reframe"
  | "color-grade"
  | "audio"
  | "caption"
  | "overlay"
  | "package";

/** One typed node in a template's safe step graph. */
export interface TemplateStep {
  stepId: string;
  label: string;
  kind: TemplateStepKind;
  detail: string;
  /** Whether this step is guaranteed not to alter product appearance/claims. */
  safe: boolean;
}

/** A creative control a template may or may not expose (appearance-affecting ones are locked). */
export interface CreativeControl {
  controlId: string;
  label: string;
  allowed: boolean;
  detail: string;
}

export interface MockTemplate {
  templateId: string;
  organizationId: string;
  name: string;
  version: string;
  status: TemplateStatus;
  category: string;
  description: string;
  stepGraphId: string;
  steps: TemplateStep[];
  allowedControls: CreativeControl[];
  provider: string;
  /** Human-readable provider policy summary (model, appearance lock, review routing). */
  providerPolicy: string;
  providerReadiness: Readiness;
  /** Template guarantees product color/material/shape are never altered. */
  appearanceLocked: boolean;
}

export type CatalogSnapshotStatus = "ready" | "missing" | "failed" | "stale";

export interface CatalogSnapshot {
  catalogSnapshotId: string;
  organizationId: string;
  createdAt: string;
  productCount: number;
  offerCount: number;
  claimCount: number;
  manifestAssetId: string;
  manifestB2Key: string;
  sha256: string;
  status: CatalogSnapshotStatus;
}

/* ------------------------------------------------------------------ *
 * Sessions, signals, moments
 * ------------------------------------------------------------------ */

export type SessionStatus =
  | "created"
  | "opening"
  | "live"
  | "closing"
  | "closed"
  | "error"
  | "reconciled";

export type SourceStatus = "ready" | "buffering" | "missing" | "error";

export type RecordingPolicy =
  | "moment-only"
  | "full-session"
  | "live-transformed-lineage";

export interface BudgetSummary {
  remainingUsd: number;
  usedUsd: number;
  limitUsd: number;
  status: Severity;
}

export interface MockSession {
  sessionId: string;
  organizationId: string;
  title: string;
  sourceType: string;
  status: SessionStatus;
  sourceStatus: SourceStatus;
  recordingPolicy: RecordingPolicy;
  automationPolicy: string;
  budgetSummary: BudgetSummary;
  catalogSnapshotId?: string;
  campaignId?: string;
}

export type SignalType =
  | "product_visible"
  | "offer_keyword"
  | "audio_energy"
  | "manual_marker"
  | "candidate_proposed"
  | "capture_authorized"
  | "generation_requested"
  | "qa_completed"
  | "publish_completed"
  | "budget_blocked"
  | "duplicate_suppressed";

export interface SignalEvent {
  signalId: string;
  sessionId: string;
  momentId?: string;
  type: SignalType;
  occurredAt: string;
  timelineMs: number;
  confidence: number;
  reason: string;
  severity: Severity;
  evidenceRefs: string[];
}

export type MomentState =
  | "candidate"
  | "capture_authorized"
  | "capturing"
  | "raw_uploaded"
  | "enhancement_pending"
  | "enhancing"
  | "qa_pending"
  | "review_pending"
  | "approved"
  | "canonical"
  | "published";

export type ProductFactStatus = "valid" | "changed" | "review-required" | "blocked";

export type QaStatus =
  | "not_started"
  | "running"
  | "passed"
  | "failed"
  | "review_required"
  | "remediated"
  | "terminal";

export type PublishState =
  | "draft"
  | "ready"
  | "review_pending"
  | "approved"
  | "published"
  | "revoked"
  | "failed"
  | "deleted";

export interface MockMoment {
  momentId: string;
  organizationId: string;
  sessionId: string;
  campaignId?: string;
  productId?: string;
  momentType: string;
  score: number;
  state: MomentState;
  startMs: number;
  endMs: number;
  rawCaptureStartMs: number;
  rawCaptureEndMs: number;
  selectionReason: string;
  aiExplanation: string;
  evidenceSummary: string;
  productFactStatus: ProductFactStatus;
  qaStatus: QaStatus;
  publishState: PublishState;
  assetIds: string[];
  generationRunIds: string[];
  canonicalAssetId?: string;
  publishPackageId?: string;
}

/* ------------------------------------------------------------------ *
 * Assets, generation runs, QA
 * ------------------------------------------------------------------ */

export type AssetRole =
  | "raw_source"
  | "raw_mezzanine"
  | "live_transformed"
  | "enhanced_master"
  | "publish_variant"
  | "thumbnail"
  | "captions"
  | "transcript"
  | "evidence"
  | "manifest"
  | "catalog_snapshot";

export type VerificationStatus = "unverified" | "verified" | "failed";
export type PreviewKind = "video" | "image" | "text" | "json" | "placeholder";

export interface AssetRef {
  assetId: string;
  organizationId: string;
  sessionId?: string;
  momentId?: string;
  role: AssetRole;
  bucket: string;
  objectKey: string;
  mimeType: string;
  bytes: number;
  sha256: string;
  verificationStatus: VerificationStatus;
  previewKind: PreviewKind;
}

export type GenerationRunStatus =
  | "queued"
  | "running"
  | "provider_pending"
  | "completed"
  | "failed"
  | "cancelled";

export interface GenerationRunRef {
  generationRunId: string;
  momentId: string;
  parentRunId?: string;
  runType: string;
  status: GenerationRunStatus;
  provider: string;
  model: string;
  templateId: string;
  templateVersion: string;
  stepGraphId: string;
  inputAssetId: string;
  outputAssetId?: string;
  manifestAssetId?: string;
  estimatedCostUsd: number;
  actualCostUsd?: number;
  startedAt: string;
  completedAt?: string;
  errorCode?: string;
  errorMessage?: string;
}

export type QaStage = "claim" | "caption" | "appearance" | "quality" | "moderation" | "publish";
export type QaFailureClass = "retryable" | "remediable" | "review_required" | "terminal";

export interface QaCheck {
  checkId: string;
  label: string;
  stage: QaStage;
  status: QaStatus;
  detail: string;
}

export interface QaSummary {
  qaResultId: string;
  momentId: string;
  stage: QaStage;
  status: QaStatus;
  failureClass?: QaFailureClass;
  checks: QaCheck[];
  blockers: string[];
}

/* ------------------------------------------------------------------ *
 * Review, provenance, publish, share
 * ------------------------------------------------------------------ */

export type ReviewView =
  | "global"
  | "by-session"
  | "by-campaign"
  | "by-product"
  | "publish-ready"
  | "needs-review"
  | "failed";

export interface ReviewItem {
  reviewItemId: string;
  momentId: string;
  priority: number;
  view: ReviewView;
  primaryAction: string;
  secondaryActions: string[];
  disabledActionReasons: DisabledAction[];
}

export type LineageNodeType =
  | "raw_source_asset"
  | "live_transformed_asset"
  | "raw_mezzanine_asset"
  | "generation_run"
  | "enhanced_master_asset"
  | "publish_variant_asset"
  | "publish_package";

export type DisclosureLevel = "normal" | "reviewer" | "admin";

export interface LineageNode {
  nodeId: string;
  nodeType: LineageNodeType;
  label: string;
  status: string;
  resourceId: string;
  shortId: string;
  createdAt: string;
  assetId?: string;
  generationRunId?: string;
  publishPackageId?: string;
  b2ObjectKey?: string;
  sha256?: string;
  manifestRef?: string;
  provider?: string;
  model?: string;
  disclosureLevel: DisclosureLevel;
}

export interface ReadinessCheck {
  checkId: string;
  label: string;
  status: "passed" | "failed" | "review-required" | "blocked" | "pending";
  detail: string;
}

export interface PublishPackage {
  publishPackageId: string;
  momentId: string;
  state: PublishState;
  title: string;
  description: string;
  hashtags: string[];
  productLinks: string[];
  videoAssetId: string;
  thumbnailAssetId: string;
  captionAssetId: string;
  variantAssetIds: string[];
  provenanceManifestAssetId: string;
  destinationMetadata: Record<string, string>;
  readinessChecks: ReadinessCheck[];
}

export type ShareVisibility = "private" | "public" | "unlisted";
export type SharePageStateKind =
  | "private"
  | "public"
  | "revoked"
  | "expired"
  | "access-denied"
  | "unavailable";

export interface SharePageState {
  shareSlug: string;
  publishPackageId: string;
  visibility: ShareVisibility;
  state: SharePageStateKind;
  expiresAt?: string;
  downloadAllowed: boolean;
  provenanceVisible: boolean;
}

/* ------------------------------------------------------------------ *
 * Admin recovery & analytics
 * ------------------------------------------------------------------ */

export type AdminRecoveryStatus = "open" | "retrying" | "recovered" | "terminal" | "skipped";

/** Section a recovery item belongs to — drives the Admin tab grouping. */
export type AdminRecoverySection =
  | "dlq"
  | "stuck-moment"
  | "failed-run"
  | "b2-reconciliation"
  | "provider-failure"
  | "budget-anomaly"
  | "audit"
  | "retention"
  | "orphaned-asset";

export interface AdminRecoveryItem {
  itemId: string;
  type: AdminRecoverySection;
  resourceType: string;
  resourceId: string;
  status: AdminRecoveryStatus;
  severity: Severity;
  eventType?: string;
  schemaVersion?: string;
  organizationId: string;
  producer?: string;
  traceId: string;
  correlationId?: string;
  errorSummary: string;
  retryCount: number;
  lastAttemptAt: string;
  payloadPreview: string;
  relatedLinks: string[];
  eligibleActions: string[];
  /** Tenant-scoped B2 object key, where the item references stored media/proof. */
  b2ObjectKey?: string;
  /** SHA-256 checksum, where the item references a canonical object. */
  sha256?: string;
  /** Whether eligible actions require an explicit operator reason (sensitive recovery). */
  requiresReason?: boolean;
  /** Audit actor (for audit-event rows). */
  actor?: string;
}

export interface MetricSeriesPoint {
  label: string;
  value: number;
}

export interface AnalyticsMetric {
  metricId: string;
  label: string;
  value: number;
  unit: string;
  trend: "up" | "down" | "flat";
  timeframe: string;
  status: Severity;
  series?: MetricSeriesPoint[];
}

/* ------------------------------------------------------------------ *
 * Settings (US8) — organization, members, roles, budgets, automation,
 * retention, providers, billing, and sensitive-action confirmation.
 * ------------------------------------------------------------------ */

export type MemberStatus = "active" | "invited" | "suspended";

export interface MockMember {
  memberId: string;
  organizationId: string;
  displayName: string;
  email: string;
  role: RolePreset;
  status: MemberStatus;
  /** ISO timestamp the membership was created. */
  addedAt: string;
  /** ISO timestamp of last activity, if any. */
  lastActiveAt?: string;
}

/** A labelled bucket of capability strings (drives the capabilities section). */
export interface CapabilityGroup {
  groupId: string;
  label: string;
  description: string;
  /** Capability strings from the CAPABILITIES vocabulary. */
  capabilities: string[];
}

export type BudgetScope = "organization" | "session" | "campaign";
export type BudgetEnforce = "block" | "warn";

export interface BudgetPolicy {
  budgetId: string;
  scope: BudgetScope;
  period: "daily" | "monthly";
  limitUsd: number;
  spentUsd: number;
  status: Severity;
  /** Soft-cap threshold as a percent of the limit (0..100). */
  softCapPct: number;
  /** Hard-cap threshold as a percent of the limit (0..100). */
  hardCapPct: number;
  enforce: BudgetEnforce;
  detail: string;
}

export type AutomationRestyleRouting = "block" | "review" | "allow-with-review";
export type AutomationClaimRouting = "block" | "review";

export interface AutomationPolicy {
  policyId: string;
  label: string;
  description: string;
  /** Auto-capture confidence threshold (0..1). */
  confidenceThreshold: number;
  autoApproveHighConfidence: boolean;
  routeAppearanceRestyleTo: AutomationRestyleRouting;
  routeClaimRiskTo: AutomationClaimRouting;
  detail: string;
}

export type RetentionAction = "archive" | "delete" | "tier-down";

export interface RetentionPolicy {
  policyId: string;
  /** Human-readable asset role label (e.g. "raw_source"). */
  assetRole: string;
  retentionDays: number;
  action: RetentionAction;
  legalHold: boolean;
  status: Severity;
  detail: string;
}

export type ProviderCategory = "generation" | "storage" | "llm" | "publish";

export interface ProviderConfig {
  providerId: string;
  name: string;
  category: ProviderCategory;
  status: Readiness;
  connected: boolean;
  capabilitiesSummary: string;
  /** ISO timestamp of the last health check. */
  lastHealthCheck: string;
  /** Masked mock key reference, e.g. "lum_sk••••3f2a". */
  apiKeyRef: string;
  detail: string;
}

export interface BillingSummary {
  plan: OrganizationPlan;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  spendUsd: number;
  limitUsd: number;
  status: Severity;
  /** Invoice references (mono). */
  invoiceRefs: string[];
  paymentMethodLabel: string;
}

export interface SensitiveAction {
  actionId: string;
  label: string;
  description: string;
  severity: Severity;
  /** Capability string required to perform the action. */
  requiredCapability: string;
  /** Whether an explicit operator reason is required before confirmation. */
  requiresReason: boolean;
  /** Whether the action is destructive / irreversible. */
  destructive: boolean;
}
