import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { WorkspaceContent, PageHeader } from "@/components/shell/layout-primitives";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/status-primitives";
import { MomentDetail } from "@/components/review/moment-detail";
import {
  getMomentBundle,
  mockMoments,
  mockReviewItems,
  mockSharePages,
  mockSignals,
} from "@/lib/mock-data";
import type { Severity } from "@/lib/screen-types";

interface MomentDetailPageProps {
  params: Promise<{ momentId: string }>;
}

/** Pre-render every seeded moment so the dynamic route is fully static (UI-only). */
export function generateStaticParams() {
  return mockMoments.map((moment) => ({ momentId: moment.momentId }));
}

export async function generateMetadata({ params }: MomentDetailPageProps): Promise<Metadata> {
  const { momentId } = await params;
  const bundle = getMomentBundle(momentId);
  if (!bundle) return { title: "Moment not found" };
  return {
    title: `Review · ${bundle.moment.momentType.replace(/_/g, " ")}`,
    description:
      "Moment detail: preview, raw/enhanced compare, evidence, product facts, QA, provenance, versions, and publish package. Seeded UI-only states.",
  };
}

const STATE_SEVERITY: Record<string, Severity> = {
  published: "success",
  approved: "info",
  canonical: "info",
  review_pending: "warning",
  enhancing: "processing",
  failed: "danger",
  candidate: "neutral",
};

function titleCase(value: string): string {
  return value.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Moment Detail (US4 / T042). Assembles the full moment bundle (assets, generation runs, QA,
 * lineage, publish package, product, campaign) from seeded lookups and renders the tabbed review
 * shell. Unknown moments return the framework 404. UI-only — no backend services.
 */
export default async function MomentDetailPage({ params }: MomentDetailPageProps) {
  const { momentId } = await params;
  const bundle = getMomentBundle(momentId);
  if (!bundle) notFound();

  const { moment, publishPackage } = bundle;
  const signals = mockSignals.filter((signal) => signal.momentId === momentId);
  const reviewItem = mockReviewItems.find((item) => item.momentId === momentId);
  const shareSlug = publishPackage
    ? mockSharePages.find(
        (share) =>
          share.publishPackageId === publishPackage.publishPackageId && share.state === "public",
      )?.shareSlug
    : undefined;

  return (
    <WorkspaceContent>
      <PageHeader
        eyebrow="Moment detail · seeded · no live services"
        title={titleCase(moment.momentType)}
        description={moment.selectionReason}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge
              label={titleCase(moment.state)}
              severity={STATE_SEVERITY[moment.state] ?? "neutral"}
            />
            <Button asChild variant="outline" size="sm">
              <Link href="/review">
                <ArrowLeft aria-hidden />
                Back to queue
              </Link>
            </Button>
          </div>
        }
      />
      <MomentDetail
        bundle={bundle}
        signals={signals}
        reviewItem={reviewItem}
        shareSlug={shareSlug}
      />
    </WorkspaceContent>
  );
}
