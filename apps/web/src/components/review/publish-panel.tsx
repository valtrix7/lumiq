/**
 * Publish package panel (US4).
 *
 * Presentational / server-component safe. Renders the canonical publish package: readiness
 * checks, title/description/hashtags/product links, thumbnail + caption + variant asset
 * references, destination variants, the provenance manifest reference, and a share-page
 * preview. When product facts changed since approval, the publish action is blocked and routed
 * back to review. UI-only — no real publishing, no external calls.
 */

import * as React from "react";
import Link from "next/link";
import { ExternalLink, ShieldCheck, Upload } from "lucide-react";
import { cn } from "@/lib/cn";
import type { PublishPackage, PublishState, ReadinessCheck, Severity } from "@/lib/screen-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MediaPlaceholder } from "@/components/common/media-primitives";
import {
  DisabledReason,
  MonoMetadata,
  StateBanner,
  StatusBadge,
} from "@/components/common/status-primitives";

/* ------------------------------------------------------------------ *
 * State mapping
 * ------------------------------------------------------------------ */

const PUBLISH_STATE_SEVERITY: Record<PublishState, Severity> = {
  draft: "neutral",
  ready: "info",
  review_pending: "warning",
  approved: "info",
  published: "success",
  revoked: "danger",
  failed: "danger",
  deleted: "danger",
};

const CHECK_SEVERITY: Record<ReadinessCheck["status"], Severity> = {
  passed: "success",
  failed: "danger",
  "review-required": "warning",
  blocked: "danger",
  pending: "neutral",
};

function titleCase(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ------------------------------------------------------------------ *
 * Readiness checks
 * ------------------------------------------------------------------ */

function ReadinessChecks({ checks }: { checks: ReadinessCheck[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {checks.map((check) => (
        <li key={check.checkId} className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-text-secondary text-sm">{check.label}</p>
            <p className="text-text-muted text-xs">{check.detail}</p>
          </div>
          <StatusBadge
            label={check.status === "review-required" ? "review" : check.status}
            severity={CHECK_SEVERITY[check.status]}
          />
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ *
 * Share preview
 * ------------------------------------------------------------------ */

function SharePreview({
  pkg,
  shareSlug,
  provenanceVisible,
}: {
  pkg: PublishPackage;
  shareSlug?: string;
  provenanceVisible: boolean;
}) {
  return (
    <div className="bg-surface-one/60 flex flex-col gap-3 rounded-lg border border-[color:var(--border-subtle)] p-3 sm:flex-row sm:items-center">
      <MediaPlaceholder
        kind="video"
        aspect="9:16"
        label="Share page preview"
        caption="publish variant"
        className="w-24 shrink-0 sm:w-20"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-text-primary truncate text-sm font-medium">{pkg.title}</p>
        <p className="text-text-muted line-clamp-2 text-xs">{pkg.description}</p>
        {provenanceVisible ? (
          <span className="text-text-secondary mt-0.5 inline-flex items-center gap-1 text-xs">
            <ShieldCheck aria-hidden className="size-3 text-[color:var(--success)]" />
            Provenance badge visible to viewers
          </span>
        ) : null}
      </div>
      {shareSlug ? (
        <Button asChild variant="outline" size="sm" className="shrink-0">
          <Link href={`/share/${shareSlug}`}>
            Open share page
            <ExternalLink aria-hidden />
          </Link>
        </Button>
      ) : (
        <DisabledReason reason="No public share link until the package is published.">
          <Button disabled aria-disabled variant="outline" size="sm">
            Open share page
            <ExternalLink aria-hidden />
          </Button>
        </DisabledReason>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * PublishPanel
 * ------------------------------------------------------------------ */

export interface PublishPanelProps {
  pkg?: PublishPackage;
  /** Product facts changed since approval — blocks publish and routes back to review. */
  factsChanged?: boolean;
  shareSlug?: string;
  provenanceVisible?: boolean;
  className?: string;
}

export function PublishPanel({
  pkg,
  factsChanged = false,
  shareSlug,
  provenanceVisible = true,
  className,
}: PublishPanelProps) {
  if (!pkg) {
    return (
      <StateBanner
        title="No publish package yet"
        message="This moment has not produced a canonical publish package. Approve a canonical enhanced master to assemble one."
        severity="neutral"
        className={className}
      />
    );
  }

  const blocked = factsChanged || pkg.state === "failed" || pkg.state === "revoked";
  const published = pkg.state === "published";
  const destinations = Object.entries(pkg.destinationMetadata);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Header: state + primary publish action */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-sm">Publish package</CardTitle>
            <StatusBadge
              label={titleCase(pkg.state)}
              severity={PUBLISH_STATE_SEVERITY[pkg.state]}
            />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {factsChanged ? (
            <StateBanner
              title="Product facts changed before publish"
              message="The catalog snapshot changed after approval. Re-validate product facts and QA before this package can publish."
              severity="warning"
            />
          ) : null}

          {/* Package contents */}
          <div className="flex flex-col gap-2">
            <p className="text-text-primary text-sm font-medium">{pkg.title}</p>
            <p className="text-text-secondary text-sm">{pkg.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {pkg.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="bg-surface-two text-text-secondary rounded-full px-2 py-0.5 text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
            {pkg.productLinks.length > 0 ? (
              <ul className="flex flex-col gap-1">
                {pkg.productLinks.map((link) => (
                  <li key={link}>
                    <a
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary inline-flex items-center gap-1 text-xs hover:underline"
                    >
                      <ExternalLink aria-hidden className="size-3" />
                      <span className="truncate">{link}</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <Separator />

          {/* Asset references */}
          <div className="flex flex-col gap-1.5">
            <MonoMetadata label="video" value={pkg.videoAssetId} muted truncate />
            <MonoMetadata label="thumbnail" value={pkg.thumbnailAssetId} muted truncate />
            <MonoMetadata label="captions" value={pkg.captionAssetId} muted truncate />
            <MonoMetadata
              label="variants"
              value={pkg.variantAssetIds.join(", ") || "—"}
              muted
              truncate
            />
            <MonoMetadata
              label="manifest"
              value={pkg.provenanceManifestAssetId}
              muted
              truncate
            />
          </div>

          {/* Publish action (UI-only) */}
          <div>
            {published ? (
              <StatusBadge label="Published to all destinations" severity="success" />
            ) : blocked ? (
              <DisabledReason
                reason={
                  factsChanged
                    ? "Publish blocked: product facts changed — re-validate in review first."
                    : "Publish blocked: package is in a failed/revoked state."
                }
              >
                <Button disabled aria-disabled>
                  <Upload aria-hidden />
                  Publish package
                </Button>
              </DisabledReason>
            ) : (
              <Button type="button">
                <Upload aria-hidden />
                Publish package
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Readiness checks */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Publish readiness</CardTitle>
        </CardHeader>
        <CardContent>
          <ReadinessChecks checks={pkg.readinessChecks} />
        </CardContent>
      </Card>

      {/* Destinations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Destination variants</CardTitle>
        </CardHeader>
        <CardContent>
          {destinations.length === 0 ? (
            <p className="text-text-muted text-sm">No destinations configured.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {destinations.map(([destination, status]) => (
                <li key={destination} className="flex items-center justify-between gap-2">
                  <span className="text-text-secondary text-sm">{destination}</span>
                  <StatusBadge
                    label={status}
                    severity={status.toLowerCase() === "ready" ? "success" : "neutral"}
                  />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Share preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Share page</CardTitle>
        </CardHeader>
        <CardContent>
          <SharePreview pkg={pkg} shareSlug={shareSlug} provenanceVisible={provenanceVisible} />
        </CardContent>
      </Card>
    </div>
  );
}
