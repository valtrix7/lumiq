/**
 * Catalog screen (US6 — Commerce Catalog, Claims, Snapshots).
 *
 * Presentational, server-component safe (no hooks / event handlers). Renders product truth as a
 * dense table plus product media cards, the allowed-claims surface, incomplete-product states,
 * and catalog snapshot history with B2 manifest key + checksum as proof. All copy is grounded in
 * seeded catalog/campaign facts; unsupported/blocked claims render an explicit blocked state.
 *
 * UI-only — no fetch, no mutation. Dark-only, tokens only.
 */

import * as React from "react";
import {
  ExternalLink,
  FileBox,
  ImageOff,
  PackageX,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type {
  AllowedClaim,
  CatalogSnapshot,
  ClaimRisk,
  ClaimStatus,
  MockProduct,
  ProductCompleteness,
  Severity,
} from "@/lib/screen-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MediaPlaceholder } from "@/components/common/media-primitives";
import {
  MonoMetadata,
  StateBanner,
  StatusBadge,
} from "@/components/common/status-primitives";

/* ------------------------------------------------------------------ *
 * Completeness + claim mapping
 * ------------------------------------------------------------------ */

const COMPLETENESS_SEVERITY: Record<ProductCompleteness, Severity> = {
  complete: "success",
  "missing-media": "warning",
  "missing-claims": "warning",
  "missing-url": "warning",
  draft: "neutral",
};

const COMPLETENESS_LABEL: Record<ProductCompleteness, string> = {
  complete: "Complete",
  "missing-media": "Missing media",
  "missing-claims": "Missing claims",
  "missing-url": "Missing URL",
  draft: "Draft",
};

const CLAIM_STATUS_SEVERITY: Record<ClaimStatus, Severity> = {
  active: "success",
  expired: "neutral",
  blocked: "danger",
  "review-required": "warning",
};

const CLAIM_RISK_SEVERITY: Record<ClaimRisk, Severity> = {
  low: "success",
  medium: "warning",
  restricted: "danger",
};

const SNAPSHOT_SEVERITY: Record<CatalogSnapshot["status"], Severity> = {
  ready: "success",
  stale: "warning",
  missing: "danger",
  failed: "danger",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Deterministic UTC date label — avoids locale/timezone hydration drift. */
function formatDay(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${MONTHS[Number(m) - 1]} ${Number(d)}, ${y}`;
}

/* ------------------------------------------------------------------ *
 * Allowed claim row
 * ------------------------------------------------------------------ */

export function AllowedClaimRow({ claim }: { claim: AllowedClaim }) {
  const blocked = claim.status === "blocked";
  const Icon = blocked ? ShieldAlert : ShieldCheck;

  return (
    <li className="flex items-start gap-2">
      <Icon
        aria-hidden
        className={cn(
          "mt-0.5 size-3.5 shrink-0",
          blocked ? "text-[color:var(--danger)]" : "text-text-muted",
        )}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-text-secondary text-sm">{claim.claimText}</span>
          <StatusBadge label={claim.status} severity={CLAIM_STATUS_SEVERITY[claim.status]} />
          <StatusBadge label={`risk: ${claim.risk}`} severity={CLAIM_RISK_SEVERITY[claim.risk]} />
        </div>
        <MonoMetadata
          className="mt-0.5"
          label="source"
          value={`${claim.source} · ${claim.supportingField}`}
          muted
        />
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ *
 * Product table (dense product truth)
 * ------------------------------------------------------------------ */

export function CatalogTable({ products }: { products: MockProduct[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag aria-hidden className="text-text-muted size-4" />
          Products
        </CardTitle>
        <p className="text-text-muted text-xs">
          {products.length} product{products.length === 1 ? "" : "s"} · product truth is the source
          for all generated and published copy.
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Inventory</TableHead>
              <TableHead>Media</TableHead>
              <TableHead>Claims</TableHead>
              <TableHead>Link</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Snapshot</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.productId}>
                <TableCell className="font-medium text-text-primary">{product.name}</TableCell>
                <TableCell>
                  <span data-mono className="text-text-secondary font-mono text-xs">
                    {product.sku}
                  </span>
                </TableCell>
                <TableCell className="tabular-nums">{product.priceLabel}</TableCell>
                <TableCell className="text-text-secondary">{product.inventoryLabel}</TableCell>
                <TableCell className="tabular-nums">
                  {product.mediaRefs.length > 0 ? (
                    `${product.mediaRefs.length}`
                  ) : (
                    <span className="text-text-muted inline-flex items-center gap-1">
                      <ImageOff aria-hidden className="size-3.5" />0
                    </span>
                  )}
                </TableCell>
                <TableCell className="tabular-nums">{product.allowedClaims.length}</TableCell>
                <TableCell>
                  {product.productUrl ? (
                    <a
                      href={product.productUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary focus-visible:ring-ring/50 inline-flex items-center gap-1 rounded text-xs outline-none hover:underline focus-visible:ring-2"
                    >
                      Open
                      <ExternalLink aria-hidden className="size-3" />
                    </a>
                  ) : (
                    <span className="text-text-muted text-xs">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <StatusBadge
                    label={COMPLETENESS_LABEL[product.completeness]}
                    severity={COMPLETENESS_SEVERITY[product.completeness]}
                  />
                </TableCell>
                <TableCell>
                  {product.snapshotIncluded ? (
                    <StatusBadge label="Included" severity="success" />
                  ) : (
                    <StatusBadge label="Excluded" severity="neutral" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ *
 * Product media card — media, claims, incomplete reasons
 * ------------------------------------------------------------------ */

/** Human-readable incomplete reason for a product, or null when complete. */
function incompleteReason(product: MockProduct): string | null {
  switch (product.completeness) {
    case "missing-media":
      return "No product media references. Add at least one image or video before generating.";
    case "missing-claims":
      return "No allowed claims defined. Copy cannot be grounded until claims are added.";
    case "missing-url":
      return "No product URL. Share pages and publish copy cannot link to the product.";
    case "draft":
      return "Draft product — excluded from catalog snapshots and sessions until completed.";
    default:
      return null;
  }
}

export function ProductMediaCard({ product }: { product: MockProduct }) {
  const reason = incompleteReason(product);
  const hasMedia = product.mediaRefs.length > 0;

  return (
    <Card className="flex flex-col gap-0">
      <div className="px-(--card-spacing)">
        <MediaPlaceholder
          kind="image"
          aspect="4:5"
          label={`Product media — ${product.name}`}
          caption={hasMedia ? `${product.mediaRefs.length} media reference${product.mediaRefs.length === 1 ? "" : "s"}` : "No media"}
          className="mx-auto max-w-[14rem]"
        />
      </div>
      <CardContent className="flex flex-1 flex-col gap-3 pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-text-primary text-sm font-medium">{product.name}</span>
          <StatusBadge
            label={COMPLETENESS_LABEL[product.completeness]}
            severity={COMPLETENESS_SEVERITY[product.completeness]}
          />
        </div>
        <div className="text-text-muted flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <MonoMetadata label="sku" value={product.sku} />
          <span className="tabular-nums">{product.priceLabel}</span>
          <span>{product.inventoryLabel}</span>
        </div>

        {reason ? <StateBanner title="Incomplete product" message={reason} severity="warning" /> : null}

        <div className="flex flex-col gap-2">
          <span className="text-text-muted text-xs font-medium tracking-wide uppercase">
            Allowed claims
          </span>
          {product.allowedClaims.length > 0 ? (
            <ul className="flex flex-col gap-1.5">
              {product.allowedClaims.map((claim) => (
                <AllowedClaimRow key={claim.claimId} claim={claim} />
              ))}
            </ul>
          ) : (
            <p className="text-text-muted text-xs">
              No allowed claims — captions and overlays for this product would be blocked.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ *
 * Snapshot history (provenance proof)
 * ------------------------------------------------------------------ */

export function SnapshotHistory({ snapshots }: { snapshots: CatalogSnapshot[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileBox aria-hidden className="text-text-muted size-4" />
          Catalog snapshot history
        </CardTitle>
        <p className="text-text-muted text-xs">
          Frozen commerce facts per session. Each snapshot stores a manifest in B2 with a checksum.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {snapshots.length === 0 ? (
          <StateBanner
            title="No snapshots yet"
            message="Freeze a catalog snapshot to lock commerce facts for a session."
            severity="neutral"
          />
        ) : (
          snapshots.map((snapshot) => (
            <div
              key={snapshot.catalogSnapshotId}
              className="bg-surface-one/60 flex flex-col gap-1.5 rounded-lg border border-[color:var(--border-subtle)] p-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge
                  label={snapshot.status}
                  severity={SNAPSHOT_SEVERITY[snapshot.status]}
                />
                <span className="text-text-muted text-xs">{formatDay(snapshot.createdAt)}</span>
                <span className="text-text-muted text-xs">
                  {snapshot.productCount} products · {snapshot.offerCount} offers ·{" "}
                  {snapshot.claimCount} claims
                </span>
              </div>
              <MonoMetadata label="catalog_snapshot_id" value={snapshot.catalogSnapshotId} />
              <MonoMetadata label="b2_manifest_key" value={snapshot.manifestB2Key} muted truncate />
              <MonoMetadata label="sha256" value={snapshot.sha256} muted truncate />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ *
 * Empty catalog state
 * ------------------------------------------------------------------ */

export function CatalogEmptyState() {
  return (
    <StateBanner
      title="Catalog is empty"
      message="Import products to define the commerce truth Lumiq grounds every caption, overlay, and publish package against."
      severity="neutral"
      icon={PackageX}
    />
  );
}

/* ------------------------------------------------------------------ *
 * Composed screen
 * ------------------------------------------------------------------ */

export interface CatalogScreenProps {
  products: MockProduct[];
  snapshots: CatalogSnapshot[];
}

export function CatalogScreen({ products, snapshots }: CatalogScreenProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <CatalogEmptyState />
        <SnapshotHistory snapshots={snapshots} />
      </div>
    );
  }

  const incomplete = products.filter((p) => p.completeness !== "complete");

  return (
    <div className="flex flex-col gap-6">
      {incomplete.length > 0 ? (
        <StateBanner
          title={`${incomplete.length} product${incomplete.length === 1 ? " needs" : "s need"} attention`}
          message="Incomplete products are missing media, claims, or a URL, and are limited or excluded from snapshots until resolved."
          severity="warning"
        />
      ) : null}

      <CatalogTable products={products} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {products.map((product) => (
              <ProductMediaCard key={product.productId} product={product} />
            ))}
          </div>
        </div>
        <SnapshotHistory snapshots={snapshots} />
      </div>

      <Separator />
      <p className="text-text-muted text-xs">
        All product claims shown here are the only facts available to generation. Unsupported or
        changed claims render a blocked or review-required state downstream — Lumiq never invents
        prices, discounts, availability, or product attributes.
      </p>
    </div>
  );
}
