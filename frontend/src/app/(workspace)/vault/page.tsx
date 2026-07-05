import type { Metadata } from "next";
import { WorkspaceContent, PageHeader } from "@/components/shell/layout-primitives";
import { StateSwitcher } from "@/components/common/state-switcher";
import { resolveStateParam } from "@/lib/state-param";
import { VaultBrowser } from "@/components/vault/vault-filters";
import type { VaultRow } from "@/components/vault/vault-views";
import {
  getCampaign,
  getGenerationRun,
  getLineage,
  getMomentAssets,
  getProduct,
  getPublishPackage,
  getPublishPackageByMoment,
  mockMoments,
  mockSessions,
} from "@/lib/mock-data";
import type { MockMoment } from "@/lib/screen-types";

export const metadata: Metadata = {
  title: "Moment Vault",
  description:
    "Browse, filter, and group captured, enhanced, reviewed, and published moments across grid, timeline, grouping, publish-package, and search views. Each moment links to full provenance. Seeded UI-only states.",
};

/* ------------------------------------------------------------------ *
 * Capture timestamps + reviewer attribution
 *
 * Page-local presentational data: the UI-only moment fixtures carry relative timeline offsets
 * but no absolute capture time or reviewer, so we attach deterministic seeded values here for
 * the date/timeline/reviewer facets. Clearly demo-only — never persisted, never fetched.
 * ------------------------------------------------------------------ */

const CAPTURE_TIMES: Record<string, string> = {
  mom_aster_reveal: "2026-06-27T15:12:10.000Z",
  mom_aster_offer_review: "2026-06-27T15:14:20.000Z",
  mom_aster_offer_failed: "2026-06-26T11:02:00.000Z",
  mom_aster_candidate_live: "2026-06-29T09:40:00.000Z",
};

/** Deterministic reviewer attribution from the moment's review/publish state. */
function reviewerFor(moment: MockMoment): string | undefined {
  if (moment.publishState === "published" || moment.state === "approved" || moment.state === "canonical") {
    return "Casey Lane";
  }
  if (moment.state === "review_pending" || moment.qaStatus === "review_required") {
    return "Unassigned";
  }
  return "Unassigned";
}

/** Join a moment with its commerce facts, session, template, lineage, assets, and package. */
function toVaultRow(moment: MockMoment): VaultRow {
  const session = mockSessions.find((s) => s.sessionId === moment.sessionId);
  const product = moment.productId ? getProduct(moment.productId) : undefined;
  const campaign = moment.campaignId ? getCampaign(moment.campaignId) : undefined;

  const run = moment.generationRunIds
    .map((runId) => getGenerationRun(runId))
    .find((r) => r?.templateId);

  const publishPackage = moment.publishPackageId
    ? getPublishPackage(moment.publishPackageId)
    : getPublishPackageByMoment(moment.momentId);

  return {
    momentId: moment.momentId,
    momentType: moment.momentType,
    state: moment.state,
    score: moment.score,
    qaStatus: moment.qaStatus,
    publishState: moment.publishState,
    productFactStatus: moment.productFactStatus,
    aiExplanation: moment.aiExplanation,
    evidenceSummary: moment.evidenceSummary,
    sessionId: moment.sessionId,
    sessionTitle: session?.title ?? moment.sessionId,
    productId: moment.productId,
    productName: product?.name,
    campaignId: moment.campaignId,
    campaignName: campaign?.name,
    templateId: run?.templateId,
    templateLabel: run ? `${run.templateId} · ${run.templateVersion}` : undefined,
    reviewer: reviewerFor(moment),
    capturedAt: CAPTURE_TIMES[moment.momentId],
    assetRoles: getMomentAssets(moment.momentId).map((asset) => asset.role),
    lineage: getLineage(moment.momentId),
    publishPackageId: publishPackage?.publishPackageId,
    publishPackageTitle: publishPackage?.title,
  };
}

const STATE_VARIANTS = [
  { value: "browse", label: "Seeded vault" },
  { value: "empty", label: "Empty (first run)" },
] as const;

interface VaultPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Moment Vault (US5 / T046). Renders the seeded moment library through the filter/view browser,
 * plus a first-run empty variant via the `?state=` switcher. Filtering, grouping, and view
 * switching all run client-side in `VaultBrowser` — UI-only, no backend, no mutation. Every
 * moment card links to Moment Detail where the full provenance graph lives.
 */
export default async function VaultPage({ searchParams }: VaultPageProps) {
  const params = await searchParams;
  const variant = resolveStateParam(params, "state", "browse");

  const rows = variant === "empty" ? [] : mockMoments.map(toVaultRow);

  return (
    <WorkspaceContent>
      <PageHeader
        eyebrow="Seeded moment vault · no live services"
        title="Vault"
        description="Search, filter, and group every captured, enhanced, reviewed, and published moment. Each card links to full provenance."
        actions={
          <StateSwitcher
            options={[...STATE_VARIANTS]}
            defaultValue="browse"
            label="Preview state"
          />
        }
      />
      <VaultBrowser rows={rows} />
    </WorkspaceContent>
  );
}
