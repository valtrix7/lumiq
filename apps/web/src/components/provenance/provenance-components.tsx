/**
 * Reusable provenance primitives: a compact LineageChain and a full ProvenanceGraph.
 *
 * Provenance is Lumiq's differentiator and must appear wherever generated/published media
 * appears (moment cards, review detail, publish package, share page, admin). Disclosure is
 * tiered: normal users see a summary, reviewers see asset/run IDs, admins additionally see
 * B2 keys and checksums. Server-component safe.
 */

import * as React from "react";
import { ArrowRight, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import type { DisclosureLevel, LineageNode, LineageNodeType } from "@/lib/screen-types";
import { MonoMetadata, StatusBadge } from "@/components/common/status-primitives";

const DISCLOSURE_RANK: Record<DisclosureLevel, number> = {
  normal: 0,
  reviewer: 1,
  admin: 2,
};

/** A field is visible when the viewer's disclosure rank meets the field's required level. */
function canDisclose(viewer: DisclosureLevel, required: DisclosureLevel): boolean {
  return DISCLOSURE_RANK[viewer] >= DISCLOSURE_RANK[required];
}

/* ------------------------------------------------------------------ *
 * Compact lineage chain: Raw -> Transform -> Enhance -> Publish
 * ------------------------------------------------------------------ */

/** Condensed labels for the four-step human-readable chain. */
const COMPACT_LABEL: Partial<Record<LineageNodeType, string>> = {
  raw_source_asset: "Raw",
  live_transformed_asset: "Transform",
  raw_mezzanine_asset: "Mezzanine",
  generation_run: "Enhance",
  enhanced_master_asset: "Master",
  publish_variant_asset: "Variant",
  publish_package: "Publish",
};

export interface LineageChainProps {
  nodes: LineageNode[];
  /** Render only the canonical four-step summary (Raw → Transform → Enhance → Publish). */
  condensed?: boolean;
  className?: string;
}

/** Inline mini-chain for moment cards and review rows. */
export function LineageChain({ nodes, condensed = true, className }: LineageChainProps) {
  const steps = condensed
    ? nodes.filter((n) =>
        (["raw_source_asset", "generation_run", "enhanced_master_asset", "publish_package"] as LineageNodeType[]).includes(
          n.nodeType,
        ),
      )
    : nodes;

  if (steps.length === 0) {
    return <span className="text-text-muted text-xs">No lineage yet</span>;
  }

  return (
    <ol
      aria-label="Provenance lineage"
      className={cn("flex flex-wrap items-center gap-x-1.5 gap-y-1", className)}
    >
      {steps.map((node, index) => (
        <li key={node.nodeId} className="flex items-center gap-1.5">
          <span className="text-text-secondary inline-flex items-center gap-1 text-xs">
            <span
              aria-hidden
              className={cn(
                "size-1.5 rounded-full",
                node.status === "verified" || node.status === "completed" || node.status === "published"
                  ? "bg-[color:var(--success)]"
                  : "bg-[color:var(--neutral)]",
              )}
            />
            {COMPACT_LABEL[node.nodeType] ?? node.label}
          </span>
          {index < steps.length - 1 ? (
            <ArrowRight aria-hidden className="text-text-faint size-3" />
          ) : null}
        </li>
      ))}
    </ol>
  );
}

/* ------------------------------------------------------------------ *
 * Full provenance graph
 * ------------------------------------------------------------------ */

function nodeSeverity(status: string) {
  if (["verified", "completed", "published"].includes(status)) return "success" as const;
  if (["failed", "error"].includes(status)) return "danger" as const;
  if (["running", "pending"].includes(status)) return "processing" as const;
  return "neutral" as const;
}

export interface ProvenanceGraphProps {
  nodes: LineageNode[];
  /** Viewer disclosure level controls which technical fields are shown. */
  disclosure?: DisclosureLevel;
  /** Optional manifest link target (e.g. asset id) shown per node when available. */
  className?: string;
}

/**
 * Full raw → transformed → mezzanine → generation run → enhanced master → publish variant →
 * publish package graph. Each node shows role, status, short id, created time, provider/model,
 * and (by disclosure) checksum and B2 key.
 */
export function ProvenanceGraph({
  nodes,
  disclosure = "normal",
  className,
}: ProvenanceGraphProps) {
  if (nodes.length === 0) {
    return (
      <p className="text-text-muted text-sm">No provenance recorded for this moment yet.</p>
    );
  }

  return (
    <ol className={cn("flex flex-col gap-2", className)} aria-label="Full provenance graph">
      {nodes.map((node, index) => (
        <li key={node.nodeId} className="flex flex-col">
          <div className="bg-surface-one/60 flex flex-col gap-2 rounded-lg border border-[color:var(--border-subtle)] p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 flex-col">
                <span className="text-text-primary text-sm font-medium">{node.label}</span>
                <span className="text-text-muted text-xs">{node.nodeType}</span>
              </div>
              <StatusBadge label={node.status} severity={nodeSeverity(node.status)} />
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <MonoMetadata label="id" value={node.shortId} />
              <MonoMetadata label="at" value={node.createdAt} muted />
              {node.provider ? <MonoMetadata label="provider" value={node.provider} /> : null}
              {node.model ? <MonoMetadata label="model" value={node.model} muted /> : null}
            </div>

            {/* Reviewer+ disclosure: full resource id and manifest reference */}
            {canDisclose(disclosure, "reviewer") ? (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <MonoMetadata label="resource" value={node.resourceId} muted truncate />
                {node.manifestRef ? (
                  <MonoMetadata label="manifest" value={node.manifestRef} muted />
                ) : null}
              </div>
            ) : null}

            {/* Admin disclosure: B2 object key + checksum */}
            {canDisclose(disclosure, "admin") ? (
              <div className="flex flex-col gap-1 border-t border-[color:var(--border-subtle)] pt-2">
                {node.b2ObjectKey ? (
                  <MonoMetadata label="b2" value={node.b2ObjectKey} muted truncate />
                ) : null}
                {node.sha256 ? (
                  <MonoMetadata label="sha256" value={node.sha256} muted truncate />
                ) : null}
              </div>
            ) : null}
          </div>

          {index < nodes.length - 1 ? (
            <span aria-hidden className="text-text-faint flex justify-center py-0.5">
              <ChevronRight className="size-4 rotate-90" />
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
