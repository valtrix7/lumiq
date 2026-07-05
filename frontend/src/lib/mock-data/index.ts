/**
 * Aggregate mock-data exports and cross-entity lookup helpers.
 *
 * Single import surface for UI screens: `import { mockMoments, getMomentBundle } from "@/lib/mock-data"`.
 * All data is UI-only and seeded — no backend, credentials, or persistence. See data-model.md.
 */

export * from "@/lib/mock-data/organization";
export * from "@/lib/mock-data/commerce";
export * from "@/lib/mock-data/workflow";
export * from "@/lib/mock-data/settings";

import type {
  AssetRef,
  GenerationRunRef,
  LineageNode,
  MockMoment,
  PublishPackage,
  QaSummary,
  SharePageState,
} from "@/lib/screen-types";
import { getCampaign, getProduct } from "@/lib/mock-data/commerce";
import {
  mockAssets,
  mockGenerationRuns,
  mockLineage,
  mockMoments,
  mockPublishPackages,
  mockQaSummaries,
  mockSharePages,
} from "@/lib/mock-data/workflow";

/* ------------------------------------------------------------------ *
 * Single-entity lookups
 * ------------------------------------------------------------------ */

export function getMoment(momentId: string): MockMoment | undefined {
  return mockMoments.find((m) => m.momentId === momentId);
}

export function getAsset(assetId: string): AssetRef | undefined {
  return mockAssets.find((a) => a.assetId === assetId);
}

export function getGenerationRun(runId: string): GenerationRunRef | undefined {
  return mockGenerationRuns.find((r) => r.generationRunId === runId);
}

export function getQaSummary(momentId: string): QaSummary | undefined {
  return mockQaSummaries.find((q) => q.momentId === momentId);
}

export function getPublishPackage(packageId: string): PublishPackage | undefined {
  return mockPublishPackages.find((p) => p.publishPackageId === packageId);
}

export function getPublishPackageByMoment(momentId: string): PublishPackage | undefined {
  return mockPublishPackages.find((p) => p.momentId === momentId);
}

export function getLineage(momentId: string): LineageNode[] {
  return mockLineage[momentId] ?? [];
}

export function getSharePage(shareSlug: string): SharePageState | undefined {
  return mockSharePages.find((s) => s.shareSlug === shareSlug);
}

export function getMomentAssets(momentId: string): AssetRef[] {
  const moment = getMoment(momentId);
  if (!moment) return [];
  return moment.assetIds
    .map((assetId) => getAsset(assetId))
    .filter((asset): asset is AssetRef => Boolean(asset));
}

/* ------------------------------------------------------------------ *
 * Composite bundle for review/detail/provenance/publish screens
 * ------------------------------------------------------------------ */

export interface MomentBundle {
  moment: MockMoment;
  assets: AssetRef[];
  generationRuns: GenerationRunRef[];
  qa?: QaSummary;
  lineage: LineageNode[];
  publishPackage?: PublishPackage;
  product?: ReturnType<typeof getProduct>;
  campaign?: ReturnType<typeof getCampaign>;
}

/** Assemble everything a Moment Detail / provenance / publish screen needs. */
export function getMomentBundle(momentId: string): MomentBundle | undefined {
  const moment = getMoment(momentId);
  if (!moment) return undefined;

  return {
    moment,
    assets: getMomentAssets(momentId),
    generationRuns: moment.generationRunIds
      .map((runId) => getGenerationRun(runId))
      .filter((run): run is GenerationRunRef => Boolean(run)),
    qa: getQaSummary(momentId),
    lineage: getLineage(momentId),
    publishPackage: moment.publishPackageId
      ? getPublishPackage(moment.publishPackageId)
      : getPublishPackageByMoment(momentId),
    product: moment.productId ? getProduct(moment.productId) : undefined,
    campaign: moment.campaignId ? getCampaign(moment.campaignId) : undefined,
  };
}
