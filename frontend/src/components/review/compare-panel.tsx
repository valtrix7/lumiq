"use client";

/**
 * Responsive raw/enhanced/published compare (US4).
 *
 * Client component: holds the segmented-variant state used by the narrow single-player
 * layout. Desktop renders raw source/mezzanine and enhanced master side-by-side; mobile/tight
 * collapses to a single pure-black player with a Raw / Enhanced / Published segmented control.
 * A shared metadata row (duration, source range, final trim, captions, product card, restyle)
 * sits below both layouts. UI-only — no media is decoded, no backend calls.
 */

import * as React from "react";
import { cn } from "@/lib/cn";
import type { AssetRef, PreviewKind } from "@/lib/screen-types";
import { MediaPlaceholder } from "@/components/common/media-primitives";
import { MonoMetadata } from "@/components/common/status-primitives";

export interface CompareMeta {
  duration: string;
  sourceRange: string;
  finalTrim: string;
  captions: string;
  productCard: string;
  restyle: string;
}

export type CompareVariant = "raw" | "enhanced" | "published";

export interface ComparePanelProps {
  raw?: AssetRef;
  enhanced?: AssetRef;
  published?: AssetRef;
  meta: CompareMeta;
  className?: string;
}

const VARIANT_LABEL: Record<CompareVariant, string> = {
  raw: "Raw",
  enhanced: "Enhanced",
  published: "Published",
};

const VARIANT_ASPECT: Record<CompareVariant, "16:9" | "9:16"> = {
  raw: "16:9",
  enhanced: "16:9",
  published: "9:16",
};

function previewKind(asset?: AssetRef): PreviewKind {
  return asset?.previewKind ?? "video";
}

function shortId(asset?: AssetRef): string {
  return asset?.assetId ?? "—";
}

/** Single labelled player tile (pure-black canvas). */
function Player({
  variant,
  asset,
  label,
}: {
  variant: CompareVariant;
  asset?: AssetRef;
  label: string;
}) {
  return (
    <figure className="flex min-w-0 flex-col gap-2">
      <figcaption className="flex items-center justify-between gap-2">
        <span className="text-text-secondary text-xs font-medium">{label}</span>
        <MonoMetadata value={shortId(asset)} muted truncate />
      </figcaption>
      {asset ? (
        <MediaPlaceholder
          kind={previewKind(asset)}
          aspect={VARIANT_ASPECT[variant]}
          label={`${label} — ${asset.role}`}
          caption={asset.role}
        />
      ) : (
        <div className="bg-canvas-black text-text-muted flex aspect-video items-center justify-center rounded-lg border border-[color:var(--border-subtle)] text-xs">
          No {label.toLowerCase()} asset
        </div>
      )}
    </figure>
  );
}

/** Shared metadata row shown under both the desktop and mobile compare layouts. */
function MetadataRow({ meta }: { meta: CompareMeta }) {
  const fields: { label: string; value: string }[] = [
    { label: "duration", value: meta.duration },
    { label: "source range", value: meta.sourceRange },
    { label: "final trim", value: meta.finalTrim },
    { label: "captions", value: meta.captions },
    { label: "product card", value: meta.productCard },
    { label: "restyle", value: meta.restyle },
  ];

  return (
    <dl className="bg-surface-one/60 grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg border border-[color:var(--border-subtle)] p-3 sm:grid-cols-3">
      {fields.map((field) => (
        <div key={field.label} className="flex min-w-0 flex-col">
          <dt className="text-text-muted text-[11px] tracking-wide uppercase">{field.label}</dt>
          <dd className="text-text-secondary truncate text-xs">{field.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Raw vs enhanced side-by-side on desktop; segmented single player on mobile. */
export function ComparePanel({ raw, enhanced, published, meta, className }: ComparePanelProps) {
  const available = React.useMemo<CompareVariant[]>(() => {
    const list: CompareVariant[] = [];
    if (raw) list.push("raw");
    if (enhanced) list.push("enhanced");
    if (published) list.push("published");
    return list.length > 0 ? list : ["enhanced"];
  }, [raw, enhanced, published]);

  const [active, setActive] = React.useState<CompareVariant>(
    available.includes("enhanced") ? "enhanced" : available[0],
  );

  const activeAsset = active === "raw" ? raw : active === "published" ? published : enhanced;

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Desktop: raw + enhanced side-by-side */}
      <div className="hidden gap-4 lg:grid lg:grid-cols-2">
        <Player variant="raw" asset={raw} label="Raw source / mezzanine" />
        <Player variant="enhanced" asset={enhanced} label="Enhanced master" />
      </div>

      {/* Mobile / tight: single player with a Raw / Enhanced / Published segmented control */}
      <div className="flex flex-col gap-3 lg:hidden">
        <div
          role="group"
          aria-label="Compare variant"
          className="bg-surface-one inline-flex w-full gap-1 rounded-lg border border-[color:var(--border-subtle)] p-1"
        >
          {available.map((variant) => {
            const selected = variant === active;
            return (
              <button
                key={variant}
                type="button"
                aria-pressed={selected}
                onClick={() => setActive(variant)}
                className={cn(
                  "flex-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  "focus-visible:ring-ring/50 outline-none focus-visible:ring-2",
                  selected
                    ? "bg-primary text-primary-foreground"
                    : "text-text-secondary hover:bg-surface-two hover:text-text-primary",
                )}
              >
                {VARIANT_LABEL[variant]}
              </button>
            );
          })}
        </div>
        <Player variant={active} asset={activeAsset} label={VARIANT_LABEL[active]} />
      </div>

      <MetadataRow meta={meta} />
    </div>
  );
}
