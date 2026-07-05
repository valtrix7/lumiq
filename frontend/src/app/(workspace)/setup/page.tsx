import type { Metadata } from "next";
import { WorkspaceContent, PageHeader } from "@/components/shell/layout-primitives";
import { StateSwitcher } from "@/components/common/state-switcher";
import { resolveStateParam } from "@/lib/state-param";
import { SetupActions } from "@/components/setup/setup-actions";
import {
  EmptyOrganizationState,
  ReadinessSummary,
  SeededWorkspaceCard,
  SetupBlockedState,
  SetupChecklist,
  buildSetupChecklist,
  deriveSetupBlockers,
} from "@/components/setup/setup-flow";
import {
  getCatalogSnapshot,
  getProduct,
  mockCampaigns,
  mockOrganizations,
} from "@/lib/mock-data";
import type { AllowedClaim, MockOrganization } from "@/lib/screen-types";

export const metadata: Metadata = {
  title: "Setup",
  description:
    "Inspect organization, catalog, campaign, allowed claims, budget, and provider/storage readiness before starting a Live Studio session. Seeded UI-only states.",
};

/* ------------------------------------------------------------------ *
 * Setup state variants — each maps to a seeded organization
 * ------------------------------------------------------------------ */

const SETUP_VARIANTS = [
  { value: "seeded-demo", label: "Seeded demo" },
  { value: "incomplete", label: "Incomplete" },
  { value: "empty", label: "Empty" },
] as const;

/** Resolve a seeded organization for the previewed setup variant. */
function resolveOrg(variant: string): MockOrganization {
  const byStatus = mockOrganizations.find((org) => org.setupStatus === variant);
  // Seeded demo is the default golden-path workspace.
  return byStatus ?? mockOrganizations[0];
}

/** Gather the unique allowed claims referenced by an organization's campaign products. */
function collectAllowedClaims(org: MockOrganization): AllowedClaim[] {
  const seen = new Map<string, AllowedClaim>();
  const productIds = mockCampaigns
    .filter((c) => c.organizationId === org.organizationId)
    .flatMap((c) => c.activeProductIds);

  for (const productId of productIds) {
    for (const claim of getProduct(productId)?.allowedClaims ?? []) {
      if (!seen.has(claim.claimId)) seen.set(claim.claimId, claim);
    }
  }
  return [...seen.values()];
}

interface SetupPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Setup and seeded session start (US2). Renders empty / incomplete / seeded-demo variants from
 * mock organizations via the `?state=` switcher. Blocked reasons (missing catalog, budget,
 * provider, storage) are derived from seeded data — UI-only, no backend, no mutation.
 */
export default async function SetupPage({ searchParams }: SetupPageProps) {
  const params = await searchParams;
  const variant = resolveStateParam(params, "state", "seeded-demo");

  const org = resolveOrg(variant);
  const snapshot = org.catalogSnapshotId ? getCatalogSnapshot(org.catalogSnapshotId) : undefined;
  const campaign = mockCampaigns.find(
    (c) => c.organizationId === org.organizationId && c.status === "active",
  );
  const allowedClaims = collectAllowedClaims(org);

  const checklist = buildSetupChecklist(org, snapshot, mockCampaigns.filter(
    (c) => c.organizationId === org.organizationId,
  ));
  const blockers = deriveSetupBlockers(org, snapshot);
  const ready = blockers.length === 0;
  const blockedReason =
    blockers.length > 0
      ? `${blockers[0].title}. ${blockers[0].message}`
      : undefined;

  const isEmpty = org.setupStatus === "empty";

  return (
    <WorkspaceContent>
      <PageHeader
        eyebrow="Seeded demo · no live services"
        title="Setup"
        description="Confirm commerce context and provider readiness before starting a Live Studio session."
        actions={
          <StateSwitcher
            options={[...SETUP_VARIANTS]}
            defaultValue="seeded-demo"
            label="Preview state"
          />
        }
      />

      {isEmpty ? <EmptyOrganizationState org={org} /> : null}

      {blockers.length > 0 ? <SetupBlockedState blockers={blockers} /> : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <SeededWorkspaceCard
            org={org}
            campaign={campaign}
            snapshot={snapshot}
            allowedClaims={allowedClaims}
            action={<SetupActions ready={ready} blockedReason={blockedReason} />}
          />
        </div>
        <div className="flex flex-col gap-6">
          <ReadinessSummary org={org} />
          <SetupChecklist items={checklist} />
        </div>
      </div>
    </WorkspaceContent>
  );
}
