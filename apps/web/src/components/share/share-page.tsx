/**
 * Public share page states: public (media-first), private/access-denied, revoked, expired, and
 * unavailable. Rendered inside the share shell (no workspace nav). Media-first on every screen
 * size; provenance is surfaced whenever the publisher allows it.
 *
 * Dark-only; pure-black media canvas; technical identifiers in mono. UI-only seeded data —
 * no real media is decoded and no download is performed. Server-component safe.
 */

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DisabledReason,
  MonoMetadata,
  StateBanner,
  StatusBadge,
} from "@/components/common/status-primitives";
import { MediaPlaceholder } from "@/components/common/media-primitives";
import { LineageChain } from "@/components/provenance/provenance-components";
import type { SharePageState, SharePageStateKind, Severity } from "@/lib/screen-types";
import { getLineage, getPublishPackage } from "@/lib/mock-data";

/* ------------------------------------------------------------------ *
 * Visibility / state chip (also used in the share shell header)
 * ------------------------------------------------------------------ */

const STATE_CHIP: Record<SharePageStateKind | "unavailable", { label: string; severity: Severity }> = {
  public: { label: "Public", severity: "success" },
  private: { label: "Private", severity: "warning" },
  "access-denied": { label: "Private", severity: "warning" },
  revoked: { label: "Revoked", severity: "danger" },
  expired: { label: "Expired", severity: "warning" },
  unavailable: { label: "Unavailable", severity: "neutral" },
};

export function ShareStatusChip({ share }: { share?: SharePageState }) {
  const key = share?.state ?? "unavailable";
  const chip = STATE_CHIP[key] ?? STATE_CHIP.unavailable;
  return <StatusBadge label={chip.label} severity={chip.severity} />;
}

/* ------------------------------------------------------------------ *
 * Public (approved) share view
 * ------------------------------------------------------------------ */

function PublicShareView({ share }: { share: SharePageState }) {
  const pkg = getPublishPackage(share.publishPackageId);
  if (!pkg) {
    return (
      <StateBanner
        title="This moment is unavailable"
        message="The published package for this share link could not be found."
        severity="neutral"
      />
    );
  }

  const lineage = getLineage(pkg.momentId);
  const productLink = pkg.productLinks[0];

  return (
    <article className="flex flex-col gap-6">
      {/* Media-first */}
      <div className="bg-panel-black mx-auto w-full max-w-xs rounded-2xl border border-[color:var(--border-subtle)] p-3">
        <MediaPlaceholder
          kind="video"
          aspect="9:16"
          label={`Published video — ${pkg.title}`}
          caption="Approved publish variant"
          className="rounded-xl"
        />
      </div>

      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <ShareStatusChip share={share} />
          {share.provenanceVisible ? (
            <StatusBadge label="Provenance verified" severity="success" />
          ) : null}
        </div>
        <h1 className="text-text-primary text-2xl font-semibold tracking-tight text-balance">
          {pkg.title}
        </h1>
        <p className="text-text-secondary text-sm leading-relaxed text-pretty">{pkg.description}</p>
        {pkg.hashtags.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {pkg.hashtags.map((tag) => (
              <li
                key={tag}
                className="bg-surface-one text-text-secondary rounded-full border border-[color:var(--border-subtle)] px-2.5 py-0.5 text-xs"
              >
                {tag}
              </li>
            ))}
          </ul>
        ) : null}
      </header>

      <div className="flex flex-wrap items-center gap-3">
        {productLink ? (
          <Button asChild>
            <a href={productLink} target="_blank" rel="noopener noreferrer">
              Shop the product
              <ArrowUpRight aria-hidden />
            </a>
          </Button>
        ) : null}
        {share.downloadAllowed ? (
          <Button variant="outline">
            <Download aria-hidden />
            Download
          </Button>
        ) : (
          <DisabledReason reason="The publisher has not enabled downloads for this share link.">
            <Button variant="outline" disabled>
              <Download aria-hidden />
              Download
            </Button>
          </DisabledReason>
        )}
      </div>

      {/* Provenance — Lumiq surfaces lineage wherever published media appears */}
      {share.provenanceVisible ? (
        <section className="bg-surface-one/50 flex flex-col gap-3 rounded-lg border border-[color:var(--border-subtle)] p-4">
          <h2 className="text-text-secondary text-xs font-medium tracking-wide uppercase">
            Provenance
          </h2>
          <LineageChain nodes={lineage} />
          <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-[color:var(--border-subtle)] pt-3">
            <MonoMetadata label="package" value={pkg.publishPackageId} muted />
            <MonoMetadata label="manifest" value={pkg.provenanceManifestAssetId} muted truncate />
          </div>
        </section>
      ) : null}
    </article>
  );
}

/* ------------------------------------------------------------------ *
 * Non-public states
 * ------------------------------------------------------------------ */

const NON_PUBLIC_COPY: Record<
  Exclude<SharePageStateKind, "public"> | "unavailable",
  { title: string; message: string; severity: Severity }
> = {
  private: {
    title: "This share link is private",
    message: "You do not have access to this moment. Ask the publisher to grant access or make it public.",
    severity: "warning",
  },
  "access-denied": {
    title: "This share link is private",
    message: "You do not have access to this moment. Ask the publisher to grant access or make it public.",
    severity: "warning",
  },
  revoked: {
    title: "This share link was revoked",
    message: "The publisher revoked public access to this moment. It is no longer viewable here.",
    severity: "danger",
  },
  expired: {
    title: "This share link has expired",
    message: "The publisher set this link to expire. Request a new link to view the moment.",
    severity: "warning",
  },
  unavailable: {
    title: "Share link not found",
    message: "This link may be mistyped, or the moment was removed. Check the link and try again.",
    severity: "neutral",
  },
};

/* ------------------------------------------------------------------ *
 * Top-level share page
 * ------------------------------------------------------------------ */

export function SharePage({ share, slug }: { share?: SharePageState; slug: string }) {
  // Unknown slug → unavailable.
  if (!share) {
    const copy = NON_PUBLIC_COPY.unavailable;
    return (
      <div className="flex flex-col gap-4">
        <StateBanner title={copy.title} message={copy.message} severity={copy.severity} />
        <MonoMetadata label="slug" value={slug} muted />
        <Button asChild variant="outline" className="w-fit">
          <Link href="/">Back to Lumiq</Link>
        </Button>
      </div>
    );
  }

  if (share.state === "public") {
    return <PublicShareView share={share} />;
  }

  const copy = NON_PUBLIC_COPY[share.state];
  return (
    <div className="flex flex-col gap-4">
      <StateBanner
        title={copy.title}
        message={
          share.state === "expired" && share.expiresAt
            ? `${copy.message} Expired ${share.expiresAt}.`
            : copy.message
        }
        severity={copy.severity}
      />
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <MonoMetadata label="slug" value={share.shareSlug} muted />
        <MonoMetadata label="visibility" value={share.visibility} muted />
      </div>
      <Button asChild variant="outline" className="w-fit">
        <Link href="/">Back to Lumiq</Link>
      </Button>
    </div>
  );
}
