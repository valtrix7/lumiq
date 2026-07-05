/**
 * Seeded Settings data (US8 — T059/T060/T061).
 *
 * Organization profile, members, role presets, capability groups, budgets,
 * automation policy, retention policies, providers, billing summary, and the
 * sensitive-action catalog. UI-only mock fixtures — no backend, no auth, no
 * real provider/billing calls. Mirrors the data-model.md contract shape so
 * every Settings state renders from seeded data.
 */

import { CAPABILITIES, DEMO_ORGANIZATION_ID } from "@/lib/mock-data/organization";
import type {
  AutomationPolicy,
  BillingSummary,
  BudgetPolicy,
  CapabilityGroup,
  MockMember,
  ProviderConfig,
  RetentionPolicy,
  SensitiveAction,
} from "@/lib/screen-types";

/* ------------------------------------------------------------------ *
 * Members
 * ------------------------------------------------------------------ */

export const mockMembers: MockMember[] = [
  {
    memberId: "mem_01aster_owner",
    organizationId: DEMO_ORGANIZATION_ID,
    displayName: "Imani Okafor",
    email: "imani@asteratelier.example",
    role: "owner",
    status: "active",
    addedAt: "2026-04-02T09:14:00Z",
    lastActiveAt: "2026-06-29T18:41:00Z",
  },
  {
    memberId: "mem_01aster_admin",
    organizationId: DEMO_ORGANIZATION_ID,
    displayName: "Theo Nakamura",
    email: "theo@asteratelier.example",
    role: "admin",
    status: "active",
    addedAt: "2026-04-11T13:02:00Z",
    lastActiveAt: "2026-06-30T07:55:00Z",
  },
  {
    memberId: "mem_01aster_editor",
    organizationId: DEMO_ORGANIZATION_ID,
    displayName: "Sana Rahman",
    email: "sana@asteratelier.example",
    role: "editor",
    status: "active",
    addedAt: "2026-05-03T16:20:00Z",
    lastActiveAt: "2026-06-28T22:10:00Z",
  },
  {
    memberId: "mem_01aster_reviewer",
    organizationId: DEMO_ORGANIZATION_ID,
    displayName: "Marcus Bell",
    email: "marcus@asteratelier.example",
    role: "reviewer",
    status: "active",
    addedAt: "2026-05-19T11:45:00Z",
    lastActiveAt: "2026-06-27T14:33:00Z",
  },
  {
    memberId: "mem_01aster_host_invite",
    organizationId: DEMO_ORGANIZATION_ID,
    displayName: "Priya Shah",
    email: "priya@asteratelier.example",
    role: "host",
    status: "invited",
    addedAt: "2026-06-24T08:30:00Z",
  },
  {
    memberId: "mem_01aster_editor_susp",
    organizationId: DEMO_ORGANIZATION_ID,
    displayName: "Daniela Rossi",
    email: "daniela@asteratelier.example",
    role: "editor",
    status: "suspended",
    addedAt: "2026-05-08T10:00:00Z",
    lastActiveAt: "2026-06-12T19:05:00Z",
  },
];

/* ------------------------------------------------------------------ *
 * Capability groups
 * ------------------------------------------------------------------ */

export const mockCapabilityGroups: CapabilityGroup[] = [
  {
    groupId: "produce",
    label: "Produce",
    description: "Run live sessions, capture moments, and browse the vault.",
    capabilities: [CAPABILITIES.studioRun, CAPABILITIES.momentRerender, CAPABILITIES.vaultView],
  },
  {
    groupId: "commerce",
    label: "Commerce",
    description: "Manage catalog, campaigns, templates, and download assets.",
    capabilities: [
      CAPABILITIES.catalogManage,
      CAPABILITIES.campaignManage,
      CAPABILITIES.templateManage,
      CAPABILITIES.assetDownload,
    ],
  },
  {
    groupId: "review-publish",
    label: "Review & Publish",
    description: "Review, approve, publish, share, and delete media.",
    capabilities: [
      CAPABILITIES.reviewView,
      CAPABILITIES.reviewApprove,
      CAPABILITIES.reviewReject,
      CAPABILITIES.publishApprove,
      CAPABILITIES.shareManage,
      CAPABILITIES.assetDelete,
    ],
  },
  {
    groupId: "operate",
    label: "Operate",
    description: "Observe analytics and inspect operational recovery and audit.",
    capabilities: [CAPABILITIES.analyticsView, CAPABILITIES.adminRecovery, CAPABILITIES.auditView],
  },
  {
    groupId: "admin-audit",
    label: "Admin & Audit",
    description: "Manage retention, providers, and budget caps.",
    capabilities: [
      CAPABILITIES.retentionManage,
      CAPABILITIES.providerManage,
      CAPABILITIES.budgetManage,
    ],
  },
  {
    groupId: "members-roles",
    label: "Members & Roles",
    description: "Invite members and assign role presets.",
    capabilities: [CAPABILITIES.membersManage, CAPABILITIES.rolesManage],
  },
  {
    groupId: "billing",
    label: "Billing",
    description: "Manage plan, payment method, and spend limits.",
    capabilities: [CAPABILITIES.billingManage],
  },
];

/* ------------------------------------------------------------------ *
 * Budget policies
 * ------------------------------------------------------------------ */

export const mockBudgetPolicies: BudgetPolicy[] = [
  {
    budgetId: "bud_01aster_org_monthly",
    scope: "organization",
    period: "monthly",
    limitUsd: 500,
    spentUsd: 148.2,
    status: "success",
    softCapPct: 70,
    hardCapPct: 90,
    enforce: "block",
    detail:
      "Organization-wide monthly generation + storage spend. Healthy; well under the soft cap.",
  },
  {
    budgetId: "bud_01aster_session_daily",
    scope: "session",
    period: "daily",
    limitUsd: 25,
    spentUsd: 19.4,
    status: "warning",
    softCapPct: 70,
    hardCapPct: 90,
    enforce: "warn",
    detail:
      "Per live-session daily cap. Approaching the soft cap — new enhancements warn before billing.",
  },
  {
    budgetId: "bud_01aster_campaign",
    scope: "campaign",
    period: "monthly",
    limitUsd: 60,
    spentUsd: 55.6,
    status: "danger",
    softCapPct: 70,
    hardCapPct: 90,
    enforce: "block",
    detail:
      "Campaign-scoped monthly cap. At the hard cap — new enhancement jobs are blocked pending a cap change.",
  },
];

/* ------------------------------------------------------------------ *
 * Automation policy
 * ------------------------------------------------------------------ */

export const mockAutomationPolicy: AutomationPolicy = {
  policyId: "pol_01aster_automation",
  label: "Default capture + routing policy",
  description:
    "Controls auto-capture confidence, high-confidence auto-approval, appearance restyle routing, and commerce claim risk routing.",
  confidenceThreshold: 0.82,
  autoApproveHighConfidence: true,
  routeAppearanceRestyleTo: "review",
  routeClaimRiskTo: "block",
  detail:
    "Candidate moments above the confidence threshold are auto-captured. Appearance restyles route to review; commerce claim risks are blocked. Changes route through Core API and emit an audit event.",
};

/* ------------------------------------------------------------------ *
 * Retention policies
 * ------------------------------------------------------------------ */

export const mockRetentionPolicies: RetentionPolicy[] = [
  {
    policyId: "ret_01aster_raw_source",
    assetRole: "raw_source",
    retentionDays: 1095,
    action: "archive",
    legalHold: false,
    status: "success",
    detail: "Raw source retained for 3 years, then archived to cold storage.",
  },
  {
    policyId: "ret_01aster_raw_mezzanine",
    assetRole: "raw_mezzanine",
    retentionDays: 365,
    action: "archive",
    legalHold: false,
    status: "success",
    detail: "Mezzanine retained for 1 year, then archived.",
  },
  {
    policyId: "ret_01aster_enhanced_master",
    assetRole: "enhanced_master",
    retentionDays: 730,
    action: "archive",
    legalHold: false,
    status: "success",
    detail: "Enhanced masters retained for 2 years before archival.",
  },
  {
    policyId: "ret_01aster_publish_variant",
    assetRole: "publish_variant",
    retentionDays: 2555,
    action: "archive",
    legalHold: false,
    status: "success",
    detail: "Publish variants retained for 7 years for compliance.",
  },
  {
    policyId: "ret_01aster_evidence",
    assetRole: "evidence",
    retentionDays: 90,
    action: "delete",
    legalHold: true,
    status: "warning",
    detail: "Evidence deleted after 90 days unless a legal hold is active. Hold currently engaged.",
  },
  {
    policyId: "ret_01aster_transcript",
    assetRole: "transcript",
    retentionDays: 180,
    action: "tier-down",
    legalHold: false,
    status: "neutral",
    detail: "Transcripts tiered down to cold storage after 180 days.",
  },
];

/* ------------------------------------------------------------------ *
 * Providers
 * ------------------------------------------------------------------ */

export const mockProviders: ProviderConfig[] = [
  {
    providerId: "prov_genblaze",
    name: "Genblaze",
    category: "generation",
    status: "mocked",
    connected: true,
    capabilitiesSummary: "Video enhancement, reframing, captions (mock generation).",
    lastHealthCheck: "2026-06-30T08:00:00Z",
    apiKeyRef: "lum_sk••••3f2a",
    detail:
      "Generation provider connected in mock mode. Real generation requires ALLOW_REAL_PROVIDER_CALLS=true and Core API authorization.",
  },
  {
    providerId: "prov_backblaze_b2",
    name: "Backblaze B2",
    category: "storage",
    status: "ready",
    connected: true,
    capabilitiesSummary: "Tenant-scoped object storage for media and proof.",
    lastHealthCheck: "2026-06-30T08:00:00Z",
    apiKeyRef: "b2_k••••a91c",
    detail: "Storage bucket reachable. All objects tenant-scoped under tenants/{organization_id}/.",
  },
  {
    providerId: "prov_mastrallm",
    name: "Mastra LLM",
    category: "llm",
    status: "mocked",
    connected: true,
    capabilitiesSummary: "Recommendation + structured routing via LLMProviderRouter (mock).",
    lastHealthCheck: "2026-06-30T08:00:00Z",
    apiKeyRef: "mastra••••77be",
    detail:
      "LLM provider router attached in mock mode. No live model calls; outputs are schema-validated fixtures.",
  },
  {
    providerId: "prov_publish_adapter",
    name: "Publish adapter",
    category: "publish",
    status: "mocked",
    connected: true,
    capabilitiesSummary: "External publish destinations (mock delivery).",
    lastHealthCheck: "2026-06-30T08:00:00Z",
    apiKeyRef: "pub_••••e4d2",
    detail:
      "Publish adapter connected in mock mode. External publish requires explicit approval and policy.",
  },
];

/* ------------------------------------------------------------------ *
 * Billing summary
 * ------------------------------------------------------------------ */

export const mockBilling: BillingSummary = {
  plan: "demo",
  currentPeriodStart: "2026-06-01T00:00:00Z",
  currentPeriodEnd: "2026-06-30T23:59:59Z",
  spendUsd: 38.4,
  limitUsd: 100,
  status: "success",
  invoiceRefs: ["inv_2026_05_aster", "inv_2026_04_aster"],
  paymentMethodLabel: "Visa ending 4242 (seeded)",
};

/* ------------------------------------------------------------------ *
 * Sensitive actions
 * ------------------------------------------------------------------ */

export const mockSensitiveActions: SensitiveAction[] = [
  {
    actionId: "sa_delete_asset",
    label: "Delete asset",
    description:
      "Permanently remove a canonical asset. Requires an explicit reason and routes to review before Core API deletion.",
    severity: "danger",
    requiredCapability: CAPABILITIES.assetDelete,
    requiresReason: true,
    destructive: true,
  },
  {
    actionId: "sa_revoke_share",
    label: "Revoke share link",
    description:
      "Revoke a published share page. Existing viewers lose access immediately once the Core API records the revocation.",
    severity: "danger",
    requiredCapability: CAPABILITIES.shareManage,
    requiresReason: false,
    destructive: true,
  },
  {
    actionId: "sa_change_retention",
    label: "Change retention policy",
    description:
      "Adjust the retention window or action for an asset role. Shorter windows may trigger earlier archival or deletion.",
    severity: "warning",
    requiredCapability: CAPABILITIES.retentionManage,
    requiresReason: false,
    destructive: false,
  },
  {
    actionId: "sa_rotate_provider_key",
    label: "Rotate provider key",
    description:
      "Rotate the API key reference for a provider. Existing jobs continue; the previous key reference is invalidated.",
    severity: "warning",
    requiredCapability: CAPABILITIES.providerManage,
    requiresReason: false,
    destructive: true,
  },
  {
    actionId: "sa_change_budget_hard_cap",
    label: "Change budget hard cap",
    description:
      "Raise or lower the hard cap for a budget policy. Lowering may immediately block queued jobs.",
    severity: "warning",
    requiredCapability: CAPABILITIES.budgetManage,
    requiresReason: false,
    destructive: false,
  },
  {
    actionId: "sa_remove_member",
    label: "Remove member",
    description:
      "Revoke a membership. Sessions and tokens issued to the member are invalidated by Core API on confirmation.",
    severity: "danger",
    requiredCapability: CAPABILITIES.membersManage,
    requiresReason: false,
    destructive: true,
  },
  {
    actionId: "sa_transfer_ownership",
    label: "Transfer ownership",
    description:
      "Transfer organization ownership to another member. Irreversible without a support-verified flow.",
    severity: "danger",
    requiredCapability: CAPABILITIES.rolesManage,
    requiresReason: true,
    destructive: true,
  },
];
