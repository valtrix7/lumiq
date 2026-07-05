/**
 * Live Studio preflight panels (US3 — Live Studio and AI Moment Detection).
 *
 * Server-component safe: pure presentation, no hooks or handlers. Renders the readiness gates a
 * host confirms before going live: source, catalog snapshot + campaign, recording/automation
 * policy, budget caps, and provider/storage readiness. All data is UI-only seeded fixture data.
 *
 * Provenance: the catalog snapshot surfaces its B2 manifest key + sha256 in mono as proof of the
 * frozen commerce facts a session is grounded in. Dark-only, tokens only, no glow/blur/aura.
 */

import * as React from "react";
import {
  CalendarClock,
  FileBox,
  Gauge,
  Radio,
  ServerCog,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type {
  BudgetSummary,
  CatalogSnapshot,
  MockCampaign,
  MockOrganization,
  MockSession,
  Readiness,
  Severity,
} from "@/lib/screen-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonoMetadata, StateBanner, StatusBadge } from "@/components/common/status-primitives";

/* ------------------------------------------------------------------ *
 * Readiness mapping
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

function ReadinessBadge({ readiness }: { readiness: Readiness }) {
  return <StatusBadge label={READINESS_LABEL[readiness]} severity={READINESS_SEVERITY[readiness]} />;
}

const SOURCE_SEVERITY: Record<MockSession["sourceStatus"], Severity> = {
  ready: "success",
  buffering: "processing",
  missing: "danger",
  error: "danger",
};

/* ------------------------------------------------------------------ *
 * Small server-safe building blocks
 * ------------------------------------------------------------------ */

function PanelRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <span className="text-text-secondary text-sm">{label}</span>
      <span className="inline-flex items-center gap-2">{children}</span>
    </div>
  );
}

function BudgetBar({ budget }: { budget: BudgetSummary }) {
  const pct = budget.limitUsd === 0 ? 0 : Math.round((budget.usedUsd / budget.limitUsd) * 100);
  const barColor =
    budget.status === "danger"
      ? "bg-[color:var(--danger)]"
      : budget.status === "warning"
        ? "bg-[color:var(--warning)]"
        : "bg-primary";
  return (
    <div className="flex flex-col gap-1.5">
      <span aria-hidden className="h-1.5 overflow-hidden rounded-full bg-[color:var(--neutral-bg)]">
        <span className={cn("block h-full rounded-full", barColor)} style={{ width: `${pct}%` }} />
      </span>
      <div className="text-text-muted flex items-center justify-between text-xs tabular-nums">
        <span>${budget.usedUsd.toFixed(2)} used</span>
        <span>${budget.remainingUsd.toFixed(2)} of ${budget.limitUsd.toFixed(2)} remaining</span>
      </div>
    </div>
  );
}

function PreflightCard({
  icon: Icon,
  title,
  status,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  status?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Icon aria-hidden className="text-text-muted size-4" />
            {title}
          </CardTitle>
          {status}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2.5">{children}</CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ *
 * Preflight blocker
 * ------------------------------------------------------------------ */

export interface PreflightBlocker {
  title: string;
  message: string;
  severity: Severity;
}

/* ------------------------------------------------------------------ *
 * StudioPreflight
 * ------------------------------------------------------------------ */

export interface StudioPreflightProps {
  session: MockSession;
  org: MockOrganization;
  snapshot?: CatalogSnapshot;
  campaign?: MockCampaign;
  blocker?: PreflightBlocker;
  className?: string;
}

/** Preflight readiness gates a host confirms before a Live Studio session goes live. */
export function StudioPreflight({
  session,
  org,
  snapshot,
  campaign,
  blocker,
  className,
}: StudioPreflightProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {blocker ? (
        <StateBanner title={blocker.title} message={blocker.message} severity={blocker.severity} />
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Source */}
        <PreflightCard
          icon={Radio}
          title="Source"
          status={
            <StatusBadge
              label={session.sourceStatus}
              severity={SOURCE_SEVERITY[session.sourceStatus]}
            />
          }
        >
          <PanelRow label="Session">
            <span className="text-text-primary text-sm font-medium">{session.title}</span>
          </PanelRow>
          <PanelRow label="Source type">
            <MonoMetadata value={session.sourceType} />
          </PanelRow>
          <MonoMetadata label="session_id" value={session.sessionId} muted truncate />
        </PreflightCard>

        {/* Catalog snapshot + campaign */}
        <PreflightCard
          icon={FileBox}
          title="Catalog snapshot & campaign"
          status={
            snapshot ? (
              <StatusBadge
                label={snapshot.status}
                severity={snapshot.status === "ready" ? "success" : "warning"}
              />
            ) : (
              <StatusBadge label="missing" severity="danger" />
            )
          }
        >
          {campaign ? (
            <PanelRow label="Campaign">
              <span className="text-text-primary text-sm font-medium">{campaign.name}</span>
            </PanelRow>
          ) : null}
          {snapshot ? (
            <>
              <p className="text-text-muted text-xs">
                {snapshot.productCount} products · {snapshot.offerCount} offers ·{" "}
                {snapshot.claimCount} claims frozen
              </p>
              <MonoMetadata label="catalog_snapshot_id" value={snapshot.catalogSnapshotId} />
              <MonoMetadata label="b2_manifest_key" value={snapshot.manifestB2Key} muted truncate />
              <MonoMetadata label="sha256" value={snapshot.sha256} muted truncate />
            </>
          ) : (
            <p className="text-text-secondary text-sm">
              Freeze a catalog snapshot to lock commerce facts before going live.
            </p>
          )}
        </PreflightCard>

        {/* Recording & automation policy */}
        <PreflightCard icon={CalendarClock} title="Recording & automation policy">
          <PanelRow label="Recording policy">
            <MonoMetadata value={session.recordingPolicy} />
          </PanelRow>
          <div className="flex flex-col gap-1">
            <span className="text-text-secondary text-sm">Automation policy</span>
            <p className="text-text-muted text-xs">{session.automationPolicy}</p>
          </div>
        </PreflightCard>

        {/* Budget caps */}
        <PreflightCard
          icon={Wallet}
          title="Budget caps"
          status={
            <StatusBadge
              label={
                session.budgetSummary.status === "danger"
                  ? "Cap reached"
                  : session.budgetSummary.status === "warning"
                    ? "Near cap"
                    : "Within cap"
              }
              severity={session.budgetSummary.status}
            />
          }
        >
          <BudgetBar budget={session.budgetSummary} />
        </PreflightCard>

        {/* Provider / storage readiness */}
        <PreflightCard
          icon={ServerCog}
          title="Provider & storage readiness"
          status={<Gauge aria-hidden className="text-text-muted size-4" />}
        >
          <PanelRow label="Generation provider">
            <ReadinessBadge readiness={org.providerReadiness} />
          </PanelRow>
          <PanelRow label="Object storage">
            <ReadinessBadge readiness={org.storageReadiness} />
          </PanelRow>
          <p className="text-text-muted inline-flex items-center gap-1 text-xs">
            <ShieldCheck aria-hidden className="size-3" />
            Mocked providers — no real provider calls in this UI build.
          </p>
        </PreflightCard>
      </div>
    </div>
  );
}
