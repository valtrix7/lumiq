import type { Metadata } from "next";
import { WorkspaceContent, PageHeader } from "@/components/shell/layout-primitives";
import { StateSwitcher } from "@/components/common/state-switcher";
import { resolveStateParam } from "@/lib/state-param";
import { ReviewQueue, type ReviewRow } from "@/components/review/review-queue";
import {
  getCampaign,
  getLineage,
  getMoment,
  getProduct,
  mockReviewItems,
} from "@/lib/mock-data";
import type { ReviewView } from "@/lib/screen-types";

export const metadata: Metadata = {
  title: "Review Queue",
  description:
    "Review captured and enhanced moments: enhanced preview, QA, product facts, AI explanation, lineage, and approve/rerender/reject actions. Seeded UI-only states.",
};

/* ------------------------------------------------------------------ *
 * Views
 * ------------------------------------------------------------------ */

const VIEW_OPTIONS = [
  { value: "global", label: "Global" },
  { value: "publish-ready", label: "Publish ready" },
  { value: "needs-review", label: "Needs review" },
  { value: "failed", label: "Failed / remediable" },
] as const;

const VIEW_COPY: Record<string, string> = {
  global: "Every moment awaiting a review decision across the session.",
  "publish-ready": "Moments that passed QA and product-fact checks and are ready to approve.",
  "needs-review": "Moments with QA review-required or unsupported claims to resolve.",
  failed: "Moments whose generation failed and are eligible for retry or remediation.",
};

interface ReviewPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Build a review row by joining the review item with its moment, commerce facts, and lineage. */
function toRow(item: (typeof mockReviewItems)[number]): ReviewRow | undefined {
  const moment = getMoment(item.momentId);
  if (!moment) return undefined;
  return {
    item,
    moment,
    productName: moment.productId ? getProduct(moment.productId)?.name : undefined,
    campaignName: moment.campaignId ? getCampaign(moment.campaignId)?.name : undefined,
    lineage: getLineage(moment.momentId),
  };
}

/**
 * Review Queue (US4 / T038). Renders global, publish-ready, needs-review, and failed/remediable
 * views from seeded review items. The active view is a URL query param so the server can filter
 * the seeded rows — UI-only, no backend services.
 */
export default async function ReviewPage({ searchParams }: ReviewPageProps) {
  const params = await searchParams;
  const view = resolveStateParam(params, "view", "global") as ReviewView;

  const allRows = mockReviewItems
    .map(toRow)
    .filter((row): row is ReviewRow => Boolean(row));

  const rows = view === "global" ? allRows : allRows.filter((row) => row.item.view === view);

  return (
    <WorkspaceContent>
      <PageHeader
        eyebrow="Seeded review queue · no live services"
        title="Review"
        description={VIEW_COPY[view] ?? VIEW_COPY.global}
        actions={
          <StateSwitcher
            param="view"
            options={[...VIEW_OPTIONS]}
            defaultValue="global"
            label="View"
          />
        }
      />
      <ReviewQueue rows={rows} />
    </WorkspaceContent>
  );
}
