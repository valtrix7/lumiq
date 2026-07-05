/**
 * Seeded organizations, role/capability presets, and capability-visibility data.
 *
 * UI-only mock data. No real tenants, auth, or persistence. These drive the setup,
 * workspace shell, role selector, and settings screens. See data-model.md.
 */

import type { MockOrganization, MockRolePreset, RolePreset } from "@/lib/screen-types";

/* ------------------------------------------------------------------ *
 * Capability vocabulary (UI-only labels; not authorization)
 * ------------------------------------------------------------------ */

export const CAPABILITIES = {
  studioRun: "studio.run",
  catalogManage: "catalog.manage",
  campaignManage: "campaign.manage",
  templateManage: "template.manage",
  reviewView: "review.view",
  reviewApprove: "review.approve",
  reviewReject: "review.reject",
  momentRerender: "moment.rerender",
  publishApprove: "publish.approve",
  shareManage: "share.manage",
  assetDownload: "asset.download",
  assetDelete: "asset.delete",
  vaultView: "vault.view",
  analyticsView: "analytics.view",
  adminRecovery: "admin.recovery",
  auditView: "audit.view",
  retentionManage: "retention.manage",
  providerManage: "provider.manage",
  budgetManage: "budget.manage",
  billingManage: "billing.manage",
  membersManage: "members.manage",
  rolesManage: "roles.manage",
} as const;

export type Capability = (typeof CAPABILITIES)[keyof typeof CAPABILITIES];

/* ------------------------------------------------------------------ *
 * Seeded organizations
 * ------------------------------------------------------------------ */

/** Primary seeded demo workspace used across the golden path. */
export const DEMO_ORGANIZATION_ID = "org_01aster_atelier";

export const mockOrganizations: MockOrganization[] = [
  {
    organizationId: DEMO_ORGANIZATION_ID,
    name: "Aster Atelier",
    workspaceSlug: "aster-atelier",
    plan: "demo",
    setupStatus: "seeded-demo",
    catalogSnapshotId: "snap_01aster_spring",
    productCount: 6,
    campaignCount: 2,
    allowedClaimCount: 14,
    providerReadiness: "mocked",
    storageReadiness: "mocked",
  },
  {
    organizationId: "org_01northwind_new",
    name: "Northwind Goods",
    workspaceSlug: "northwind-goods",
    plan: "starter",
    setupStatus: "empty",
    productCount: 0,
    campaignCount: 0,
    allowedClaimCount: 0,
    providerReadiness: "missing",
    storageReadiness: "missing",
  },
  {
    organizationId: "org_01lumen_partial",
    name: "Lumen Studio",
    workspaceSlug: "lumen-studio",
    plan: "pro",
    setupStatus: "incomplete",
    catalogSnapshotId: undefined,
    productCount: 3,
    campaignCount: 1,
    allowedClaimCount: 4,
    providerReadiness: "degraded",
    storageReadiness: "ready",
  },
];

/* ------------------------------------------------------------------ *
 * Role / capability presets (UI visibility only)
 * ------------------------------------------------------------------ */

export const mockRolePresets: MockRolePreset[] = [
  {
    role: "owner",
    label: "Owner",
    capabilities: Object.values(CAPABILITIES),
    hiddenSections: [],
    disabledActions: [],
  },
  {
    role: "admin",
    label: "Admin",
    capabilities: [
      CAPABILITIES.studioRun,
      CAPABILITIES.catalogManage,
      CAPABILITIES.campaignManage,
      CAPABILITIES.templateManage,
      CAPABILITIES.reviewView,
      CAPABILITIES.reviewApprove,
      CAPABILITIES.reviewReject,
      CAPABILITIES.momentRerender,
      CAPABILITIES.publishApprove,
      CAPABILITIES.shareManage,
      CAPABILITIES.assetDownload,
      CAPABILITIES.assetDelete,
      CAPABILITIES.vaultView,
      CAPABILITIES.analyticsView,
      CAPABILITIES.adminRecovery,
      CAPABILITIES.auditView,
      CAPABILITIES.retentionManage,
      CAPABILITIES.providerManage,
      CAPABILITIES.budgetManage,
      CAPABILITIES.membersManage,
      CAPABILITIES.rolesManage,
    ],
    hiddenSections: [],
    disabledActions: [
      {
        action: "billing.manage",
        reason: "Only the organization owner can manage billing.",
        requiredCapability: CAPABILITIES.billingManage,
      },
    ],
  },
  {
    role: "editor",
    label: "Editor",
    capabilities: [
      CAPABILITIES.studioRun,
      CAPABILITIES.catalogManage,
      CAPABILITIES.campaignManage,
      CAPABILITIES.templateManage,
      CAPABILITIES.reviewView,
      CAPABILITIES.momentRerender,
      CAPABILITIES.assetDownload,
      CAPABILITIES.vaultView,
      CAPABILITIES.analyticsView,
    ],
    hiddenSections: ["admin"],
    disabledActions: [
      {
        action: "publish.approve",
        reason: "Editors can prepare publish packages but cannot approve external publish.",
        requiredCapability: CAPABILITIES.publishApprove,
      },
    ],
  },
  {
    role: "reviewer",
    label: "Reviewer",
    capabilities: [
      CAPABILITIES.reviewView,
      CAPABILITIES.reviewApprove,
      CAPABILITIES.reviewReject,
      CAPABILITIES.momentRerender,
      CAPABILITIES.vaultView,
      CAPABILITIES.analyticsView,
      CAPABILITIES.auditView,
    ],
    hiddenSections: ["admin", "settings.billing", "settings.providers", "settings.retention"],
    disabledActions: [
      {
        action: "provider.manage",
        reason: "Reviewers cannot change provider settings.",
        requiredCapability: CAPABILITIES.providerManage,
      },
      {
        action: "retention.manage",
        reason: "Reviewers cannot change retention policy.",
        requiredCapability: CAPABILITIES.retentionManage,
      },
      {
        action: "budget.manage",
        reason: "Reviewers cannot change budget caps.",
        requiredCapability: CAPABILITIES.budgetManage,
      },
    ],
  },
  {
    role: "viewer",
    label: "Viewer",
    capabilities: [CAPABILITIES.reviewView, CAPABILITIES.vaultView, CAPABILITIES.analyticsView],
    hiddenSections: ["admin", "settings"],
    disabledActions: [
      {
        action: "admin.recovery",
        reason: "Viewers cannot access operational recovery controls.",
        requiredCapability: CAPABILITIES.adminRecovery,
      },
      {
        action: "publish.approve",
        reason: "Viewers cannot approve publish.",
        requiredCapability: CAPABILITIES.publishApprove,
      },
      {
        action: "asset.delete",
        reason: "Viewers cannot delete assets.",
        requiredCapability: CAPABILITIES.assetDelete,
      },
      {
        action: "retention.manage",
        reason: "Viewers cannot change retention policy.",
        requiredCapability: CAPABILITIES.retentionManage,
      },
      {
        action: "billing.manage",
        reason: "Viewers cannot manage billing.",
        requiredCapability: CAPABILITIES.billingManage,
      },
    ],
  },
  {
    role: "host",
    label: "Host",
    capabilities: [CAPABILITIES.studioRun, CAPABILITIES.reviewView, CAPABILITIES.vaultView],
    hiddenSections: ["admin", "settings"],
    disabledActions: [
      {
        action: "publish.approve",
        reason: "Hosts run live sessions but cannot approve external publish.",
        requiredCapability: CAPABILITIES.publishApprove,
      },
    ],
  },
];

/* ------------------------------------------------------------------ *
 * Lookups
 * ------------------------------------------------------------------ */

export function getRolePreset(role: RolePreset): MockRolePreset {
  return mockRolePresets.find((preset) => preset.role === role) ?? mockRolePresets[0];
}

export function getDemoOrganization(): MockOrganization {
  return mockOrganizations[0];
}

export function getOrganization(organizationId: string): MockOrganization | undefined {
  return mockOrganizations.find((org) => org.organizationId === organizationId);
}

export function roleHasCapability(role: RolePreset, capability: Capability): boolean {
  return getRolePreset(role).capabilities.includes(capability);
}

export function isSectionHidden(role: RolePreset, sectionId: string): boolean {
  return getRolePreset(role).hiddenSections.some(
    (hidden) => sectionId === hidden || sectionId.startsWith(`${hidden}.`),
  );
}
