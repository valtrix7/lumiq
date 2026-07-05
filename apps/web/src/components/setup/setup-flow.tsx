/**
 * Setup-flow presentational components (US2 — Setup and Seeded Session Start).
 *
 * Server-component safe: pure presentation, no hooks or event handlers. These render the
 * setup completion checklist, readiness summary, blocked-state banner, and the seeded-demo
 * workspace card. All data is UI-only seeded fixture data — no backend, no mutation.
 *
 * Provenance: where a catalog_snapshot is shown, its B2 manifest key + sha256 render in mono
 * as proof. Allowed claims and readiness all trace to seeded data. Dark-only, tokens only.
 */

import * as React from "react";
import {
  Boxes,
  CheckCircle2,
  CircleDashed,
  FileBox,
  Megaphone,
  ShieldCheck,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type {
  AllowedClaim,
  CatalogSnapshot,
  MockCampaign,
  MockOrganization,
  Readiness,
  Severity,
} from "@/lib/screen-types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  MonoMetadata,
  StateBanner,
  StatusBadge,
} from "@/components/common/status-primitives";

/* ------------------------------------------------------------------ *
 * Readiness → severity / label mapping
 * ------------------------------------------------------------------ */

const READINESS_SEVERITY: Record<Readiness, Severity> = {
  ready: "success",
  mocked: "info",
  missing: "danger",
  degraded: "warning",
};

const READINESS_LABEL: Record<Readiness, string> = {
  ready: "Ready",
  mocked: "Mocked",
  missing: "Missing",
  degraded: "Degraded",
};

/** Map a Readiness value to a muted semantic status chip. */
export function ReadinessBadge({
  readiness,
  className,
}: {
  readiness: Readiness;
  className?: string;
}) {
  return (
    <StatusBadge
      label={READINESS_LABEL[readiness]}
      severity={READINESS_SEVERITY[readiness]}
      className={className}
    />
  );
}

/* ------------------------------------------------------------------ *
 * Setup completion checklist
 * ------------------------------------------------------------------ */

export interface SetupChecklistItem {
  id: string;
  label: string;
  detail: string;
  complete: boolean;
}

/**
 * Build the canonical setup checklist for an organization from seeded data. Covers catalog,
 * products, campaign, allowed claims, catalog snapshot, provider readiness, storage readiness,
 * and budget. Pure derivation — no side effects.
 */
export function buildSetupChecklist(
  org: MockOrganization,
  snapshot: CatalogSnapshot | undefined,
  campaigns: MockCampaign[],
): SetupChecklistItem[] {
  const hasSnapshot = Boolean(org.catalogSnapshotId && snapshot?.status === "ready");
  const providerReady = org.providerReadiness === "ready" || org.providerReadiness === "mocked";
  const storageReady = org.storageReadiness === "ready" || org.storageReadiness === "mocked";
  const activeCampaign = campaigns.some((c) => c.status === "active");
  // Budget readiness is a UI-only heuristic: seeded/ready demos have a configured cap.
  const budgetConfigured = org.setupStatus === "seeded-demo" || org.setupStatus === "ready";

  return [
    {
      id: "catalog",
      label: "Catalog connected",
      detail:
        org.productCount > 0
          ? `${org.productCount} product${org.productCount === 1 ? "" : "s"} imported`
          : "No products imported yet",
      complete: org.productCount > 0,
    },
    {
      id: "products",
      label: "Products complete",
      detail:
        org.productCount > 0
          ? "Products carry SKU, price, and media references"
          : "Add at least one complete product",
      complete: org.productCount > 0,
    },
    {
      id: "campaign",
      label: "Active campaign",
      detail: activeCampaign
        ? "A campaign is live with offer terms"
        : "No active campaign configured",
      complete: activeCampaign,
    },
    {
      id: "allowed-claims",
      label: "Allowed claims defined",
      detail:
        org.allowedClaimCount > 0
          ? `${org.allowedClaimCount} grounded claim${org.allowedClaimCount === 1 ? "" : "s"} available`
          : "Define grounded claims before generating copy",
      complete: org.allowedClaimCount > 0,
    },
    {
      id: "catalog-snapshot",
      label: "Catalog snapshot frozen",
      detail: hasSnapshot
        ? "Commerce facts are frozen for the session"
        : "Freeze a catalog snapshot to lock commerce facts",
      complete: hasSnapshot,
    },
    {
      id: "provider-readiness",
      label: "Provider readiness",
      detail: providerReady
        ? "Generation provider is reachable"
        : `Provider is ${READINESS_LABEL[org.providerReadiness].toLowerCase()}`,
      complete: providerReady,
    },
    {
      id: "storage-readiness",
      label: "Storage readiness",
      detail: storageReady
        ? "Object storage is reachable for raw and manifest writes"
        : `Storage is ${READINESS_LABEL[org.storageReadiness].toLowerCase()}`,
      complete: storageReady,
    },
    {
      id: "budget",
      label: "Session budget set",
      detail: budgetConfigured
        ? "A spending cap is configured for sessions"
        : "Configure a session budget cap",
      complete: budgetConfigured,
    },
  ];
}

/** Server-safe progress bar (no Radix client primitive). */
function ChecklistProgress({ done, total }: { done: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-[color:var(--neutral-bg)]"
      >
        <span
          className="block h-full rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </span>
      <span className="text-text-secondary shrink-0 text-xs font-medium tabular-nums">
        {done}/{total} complete
      </span>
    </div>
  );
}

const CHECKLIST_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  catalog: ShoppingBag,
  products: Boxes,
  campaign: Megaphone,
  "allowed-claims": ShieldCheck,
  "catalog-snapshot": FileBox,
  "provider-readiness": ShieldCheck,
  "storage-readiness": FileBox,
  budget: Wallet,
};

export function SetupChecklist({ items }: { items: SetupChecklistItem[] }) {
  const done = items.filter((item) => item.complete).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Setup completion checklist</CardTitle>
        <ChecklistProgress done={done} total={items.length} />
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-2.5">
          {items.map((item) => {
            const Icon = item.complete ? CheckCircle2 : CHECKLIST_ICONS[item.id] ?? CircleDashed;
            return (
              <li key={item.id} className="flex items-start gap-3">
                <Icon
                  aria-hidden
                  className={cn(
                    "mt-0.5 size-4 shrink-0",
                    item.complete
                      ? "text-[color:var(--success)]"
                      : "text-text-muted",
                  )}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-text-primary text-sm font-medium">{item.label}</span>
                    <StatusBadge
                      label={item.complete ? "Complete" : "Incomplete"}
                      severity={item.complete ? "success" : "warning"}
                    />
                  </div>
                  <p className="text-text-muted mt-0.5 text-xs">{item.detail}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ *
 * Readiness summary
 * ------------------------------------------------------------------ */

export function ReadinessSummary({ org }: { org: MockOrganization }) {
  const rows: Array<{ id: string; label: string; readiness: Readiness }> = [
    { id: "provider", label: "Provider readiness", readiness: org.providerReadiness },
    { id: "storage", label: "Storage readiness", readiness: org.storageReadiness },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Readiness summary</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {rows.map((row) => (
          <div key={row.id} className="flex items-center justify-between gap-3">
            <span className="text-text-secondary text-sm">{row.label}</span>
            <ReadinessBadge readiness={row.readiness} />
          </div>
        ))}
        <Separator />
        <div className="flex items-center justify-between gap-3">
          <span className="text-text-secondary text-sm">Setup status</span>
          <StatusBadge
            label={SETUP_STATUS_LABEL[org.setupStatus]}
            severity={SETUP_STATUS_SEVERITY[org.setupStatus]}
          />
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ *
 * Setup-status mapping
 * ------------------------------------------------------------------ */

const SETUP_STATUS_LABEL: Record<MockOrganization["setupStatus"], string> = {
  empty: "Empty",
  incomplete: "Incomplete",
  ready: "Ready",
  "seeded-demo": "Seeded demo",
};

const SETUP_STATUS_SEVERITY: Record<MockOrganization["setupStatus"], Severity> = {
  empty: "neutral",
  incomplete: "warning",
  ready: "success",
  "seeded-demo": "info",
};

/* ------------------------------------------------------------------ *
 * Blocked-state banner
 * ------------------------------------------------------------------ */

export interface SetupBlocker {
  id: string;
  title: string;
  message: string;
  severity: Severity;
}

/** Derive blocking reasons that prevent starting a session, from seeded data. */
export function deriveSetupBlockers(
  org: MockOrganization,
  snapshot: CatalogSnapshot | undefined,
): SetupBlocker[] {
  const blockers: SetupBlocker[] = [];

  if (org.productCount === 0) {
    blockers.push({
      id: "catalog",
      title: "Catalog is empty",
      message: "Import products before a session can reference grounded commerce facts.",
      severity: "warning",
    });
  }

  if (!org.catalogSnapshotId || snapshot?.status !== "ready") {
    blockers.push({
      id: "catalog-snapshot",
      title: "Missing catalog snapshot",
      message: "Freeze a catalog snapshot so commerce facts are locked for the session.",
      severity: "warning",
    });
  }

  if (org.providerReadiness === "missing" || org.providerReadiness === "degraded") {
    blockers.push({
      id: "provider",
      title:
        org.providerReadiness === "missing"
          ? "Provider not configured"
          : "Provider degraded",
      message:
        org.providerReadiness === "missing"
          ? "Connect a generation provider before starting a session."
          : "The generation provider is degraded; resolve it before relying on a session.",
      severity: org.providerReadiness === "missing" ? "danger" : "warning",
    });
  }

  if (org.storageReadiness === "missing") {
    blockers.push({
      id: "storage",
      title: "Storage not configured",
      message: "Object storage must be reachable to persist raw source and manifests.",
      severity: "danger",
    });
  }

  // Budget is a UI-only heuristic mirroring the checklist derivation.
  if (org.setupStatus !== "seeded-demo" && org.setupStatus !== "ready") {
    blockers.push({
      id: "budget",
      title: "No session budget set",
      message: "Configure a spending cap so generation cost stays bounded.",
      severity: "warning",
    });
  }

  return blockers;
}

/** Highest severity present in a set of blockers (danger > warning > others). */
export function highestBlockerSeverity(blockers: SetupBlocker[]): Severity {
  if (blockers.some((b) => b.severity === "danger")) return "danger";
  if (blockers.some((b) => b.severity === "warning")) return "warning";
  return blockers[0]?.severity ?? "neutral";
}

export function SetupBlockedState({ blockers }: { blockers: SetupBlocker[] }) {
  if (blockers.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {blockers.map((blocker) => (
        <StateBanner
          key={blocker.id}
          title={blocker.title}
          message={blocker.message}
          severity={blocker.severity}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Empty-organization state
 * ------------------------------------------------------------------ */

export function EmptyOrganizationState({ org }: { org: MockOrganization }) {
  return (
    <StateBanner
      title={`${org.name} has not been set up yet`}
      message="This organization has no products, campaigns, allowed claims, or catalog snapshot. Import a catalog and freeze a snapshot to begin."
      severity="neutral"
      icon={Boxes}
    />
  );
}

/* ------------------------------------------------------------------ *
 * Seeded-demo workspace card
 * ------------------------------------------------------------------ */

export interface SeededWorkspaceCardProps {
  org: MockOrganization;
  campaign?: MockCampaign;
  snapshot?: CatalogSnapshot;
  allowedClaims: AllowedClaim[];
  /** The Start Demo Session action slot (client component). */
  action?: React.ReactNode;
}

function MetricStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-one flex flex-col gap-0.5 rounded-lg border border-[color:var(--border-subtle)] p-3">
      <span className="text-text-primary text-lg font-semibold tracking-tight tabular-nums">
        {value}
      </span>
      <span className="text-text-muted text-xs">{label}</span>
    </div>
  );
}

export function SeededWorkspaceCard({
  org,
  campaign,
  snapshot,
  allowedClaims,
  action,
}: SeededWorkspaceCardProps) {
  const activeClaims = allowedClaims.filter((claim) => claim.status === "active");

  return (
    <Card>
      <CardHeader className="border-b">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[color:var(--border-subtle)] px-3 py-1">
          <span
            aria-hidden
            className="size-1.5 rounded-full"
            style={{ background: "var(--gradient-spectral-pastel)" }}
          />
          <span className="text-text-secondary text-xs font-medium tracking-wide">
            Seeded demo workspace
          </span>
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-lg">{org.name}</CardTitle>
          <StatusBadge label={`${org.plan} plan`} severity="neutral" />
        </div>
        <MonoMetadata label="organization_id" value={org.organizationId} muted />
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        {/* Counts */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <MetricStat label="Products" value={String(org.productCount)} />
          <MetricStat label="Campaigns" value={String(org.campaignCount)} />
          <MetricStat label="Allowed claims" value={String(org.allowedClaimCount)} />
          <MetricStat label="Active claims" value={String(activeClaims.length)} />
        </div>

        {/* Campaign */}
        {campaign ? (
          <div className="flex flex-col gap-2">
            <span className="text-text-muted text-xs font-medium tracking-wide uppercase">
              Campaign
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <Megaphone aria-hidden className="text-text-muted size-4" />
              <span className="text-text-primary text-sm font-medium">{campaign.name}</span>
              <StatusBadge
                label={campaign.status}
                severity={campaign.status === "active" ? "success" : "neutral"}
              />
            </div>
            <p className="text-text-secondary text-xs">{campaign.offerTerms}</p>
          </div>
        ) : null}

        {/* Readiness */}
        <div className="flex flex-col gap-2">
          <span className="text-text-muted text-xs font-medium tracking-wide uppercase">
            Readiness
          </span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="inline-flex items-center gap-2 text-sm">
              <span className="text-text-secondary">Provider</span>
              <ReadinessBadge readiness={org.providerReadiness} />
            </span>
            <span className="inline-flex items-center gap-2 text-sm">
              <span className="text-text-secondary">Storage</span>
              <ReadinessBadge readiness={org.storageReadiness} />
            </span>
          </div>
        </div>

        {/* Catalog snapshot (provenance) */}
        {snapshot ? (
          <div className="flex flex-col gap-2">
            <span className="text-text-muted text-xs font-medium tracking-wide uppercase">
              Catalog snapshot
            </span>
            <div className="bg-surface-one flex flex-col gap-1.5 rounded-lg border border-[color:var(--border-subtle)] p-3">
              <div className="flex flex-wrap items-center gap-2">
                <FileBox aria-hidden className="text-text-muted size-4" />
                <StatusBadge
                  label={snapshot.status}
                  severity={snapshot.status === "ready" ? "success" : "warning"}
                />
                <span className="text-text-muted text-xs">
                  {snapshot.productCount} products · {snapshot.offerCount} offers ·{" "}
                  {snapshot.claimCount} claims
                </span>
              </div>
              <MonoMetadata label="catalog_snapshot_id" value={snapshot.catalogSnapshotId} />
              <MonoMetadata label="b2_manifest_key" value={snapshot.manifestB2Key} muted truncate />
              <MonoMetadata label="sha256" value={snapshot.sha256} muted truncate />
            </div>
          </div>
        ) : null}

        {/* Allowed claims (grounded) */}
        {activeClaims.length > 0 ? (
          <div className="flex flex-col gap-2">
            <span className="text-text-muted text-xs font-medium tracking-wide uppercase">
              Allowed claims
            </span>
            <ul className="flex flex-col gap-1.5">
              {activeClaims.slice(0, 4).map((claim) => (
                <li key={claim.claimId} className="flex items-start gap-2">
                  <ShieldCheck aria-hidden className="text-text-muted mt-0.5 size-3.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="text-text-secondary text-sm">{claim.claimText}</span>
                    <MonoMetadata
                      className="ml-2"
                      label="source"
                      value={`${claim.source} · ${claim.supportingField}`}
                      muted
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {action ? <div className="pt-1">{action}</div> : null}
      </CardContent>
    </Card>
  );
}
