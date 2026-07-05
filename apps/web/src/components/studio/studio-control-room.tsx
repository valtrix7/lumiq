"use client";

/**
 * Live Studio control room (US3).
 *
 * Client component: holds local UI-only control state (pause/resume, manual capture). No fetch,
 * no mutation, no backend — controls only toggle local presentation. Receives plain seeded data
 * props from the server route. Layout is a desktop control room that collapses to a single
 * stacked column at narrow widths.
 *
 * Regions: pure-black video preview, status controls, live signal feed/rail, product context
 * (grounded allowed claims), and a budget/policy panel. Dark-only, royal-blue primary/live, no
 * glow/blur/aura. Disabled controls always explain why.
 */

import * as React from "react";
import { Circle, Hand, Pause, Play, Radio } from "lucide-react";
import { cn } from "@/lib/cn";
import type {
  AllowedClaim,
  BudgetSummary,
  MockProduct,
  MockSession,
  SignalEvent,
} from "@/lib/screen-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MediaPlaceholder } from "@/components/common/media-primitives";
import {
  DisabledReason,
  MonoMetadata,
  StatusBadge,
} from "@/components/common/status-primitives";

/* ------------------------------------------------------------------ *
 * Status controls (local UI-only state)
 * ------------------------------------------------------------------ */

function StatusControls({ disabledReason }: { disabledReason?: string }) {
  const [paused, setPaused] = React.useState(false);

  if (disabledReason) {
    return (
      <DisabledReason reason={disabledReason}>
        <div className="flex flex-wrap gap-2">
          <Button disabled aria-disabled>
            <Hand aria-hidden />
            Manual capture
          </Button>
          <Button disabled aria-disabled variant="outline">
            <Pause aria-hidden />
            Pause auto-capture
          </Button>
        </div>
      </DisabledReason>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button">
        <Hand aria-hidden />
        Manual capture
      </Button>
      <Button type="button" variant="outline" onClick={() => setPaused((p) => !p)}>
        {paused ? <Play aria-hidden /> : <Pause aria-hidden />}
        {paused ? "Resume auto-capture" : "Pause auto-capture"}
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Live signal feed
 * ------------------------------------------------------------------ */

function SignalFeed({ signals }: { signals: SignalEvent[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Radio aria-hidden className="text-text-muted size-4" />
          Signal feed
        </CardTitle>
      </CardHeader>
      <CardContent>
        {signals.length === 0 ? (
          <p className="text-text-muted text-sm">No signals detected yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {signals.map((signal) => (
              <li key={signal.signalId} className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge
                    label={signal.type.replace(/_/g, " ")}
                    severity={signal.severity}
                    spin={signal.severity === "processing"}
                  />
                  <span className="text-text-muted text-xs tabular-nums">
                    {Math.round(signal.confidence * 100)}% confidence
                  </span>
                </div>
                <p className="text-text-secondary text-xs">{signal.reason}</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ *
 * Product context (grounded claims)
 * ------------------------------------------------------------------ */

function ProductContext({
  product,
  claims,
}: {
  product?: MockProduct;
  claims: AllowedClaim[];
}) {
  const activeClaims = claims.filter((claim) => claim.status === "active");

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Product context</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {product ? (
          <div className="flex flex-col gap-1">
            <span className="text-text-primary text-sm font-medium">{product.name}</span>
            <div className="text-text-muted flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              <MonoMetadata label="sku" value={product.sku} />
              <span>{product.priceLabel}</span>
              <span>{product.inventoryLabel}</span>
            </div>
          </div>
        ) : (
          <p className="text-text-muted text-sm">No product locked to the live moment yet.</p>
        )}

        <Separator />

        <div className="flex flex-col gap-1.5">
          <span className="text-text-muted text-xs font-medium tracking-wide uppercase">
            Allowed claims
          </span>
          {activeClaims.length === 0 ? (
            <p className="text-text-muted text-xs">No grounded claims available.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {activeClaims.slice(0, 5).map((claim) => (
                <li key={claim.claimId} className="flex flex-col">
                  <span className="text-text-secondary text-xs">{claim.claimText}</span>
                  <MonoMetadata
                    label="source"
                    value={`${claim.source} · ${claim.supportingField}`}
                    muted
                  />
                </li>
              ))}
            </ul>
          )}
          <p className="text-text-muted mt-1 text-xs">
            Generated copy is restricted to these grounded claims.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ *
 * Budget / policy panel
 * ------------------------------------------------------------------ */

function BudgetPolicyPanel({ session }: { session: MockSession }) {
  const budget: BudgetSummary = session.budgetSummary;
  const pct = budget.limitUsd === 0 ? 0 : Math.round((budget.usedUsd / budget.limitUsd) * 100);
  const barColor =
    budget.status === "danger"
      ? "bg-[color:var(--danger)]"
      : budget.status === "warning"
        ? "bg-[color:var(--warning)]"
        : "bg-primary";

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm">Budget & policy</CardTitle>
          <StatusBadge
            label={
              budget.status === "danger"
                ? "Cap reached"
                : budget.status === "warning"
                  ? "Near cap"
                  : "Within cap"
            }
            severity={budget.status}
          />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <span
            aria-hidden
            className="h-1.5 overflow-hidden rounded-full bg-[color:var(--neutral-bg)]"
          >
            <span className={cn("block h-full rounded-full", barColor)} style={{ width: `${pct}%` }} />
          </span>
          <div className="text-text-muted flex items-center justify-between text-xs tabular-nums">
            <span>${budget.usedUsd.toFixed(2)} used</span>
            <span>${budget.remainingUsd.toFixed(2)} remaining</span>
          </div>
        </div>
        <Separator />
        <div className="flex flex-col gap-1">
          <MonoMetadata label="recording_policy" value={session.recordingPolicy} />
          <p className="text-text-muted text-xs">{session.automationPolicy}</p>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ *
 * StudioControlRoom
 * ------------------------------------------------------------------ */

export interface StudioControlRoomProps {
  session: MockSession;
  signals: SignalEvent[];
  product?: MockProduct;
  claims: AllowedClaim[];
  /** Whether the live source is actively detecting (drives the LIVE indicator). */
  live?: boolean;
  /** When set, status controls render disabled with this reason. */
  controlsDisabledReason?: string;
  className?: string;
}

/** Desktop control room that collapses to a single stacked column on mobile. */
export function StudioControlRoom({
  session,
  signals,
  product,
  claims,
  live = true,
  controlsDisabledReason,
  className,
}: StudioControlRoomProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 lg:grid-cols-3 lg:items-start", className)}>
      {/* Main column: preview + controls */}
      <div className="flex flex-col gap-4 lg:col-span-2">
        <div className="relative">
          <MediaPlaceholder
            kind="video"
            aspect="16:9"
            label={`Live source preview — ${session.title}`}
            caption={session.title}
          />
          <span className="absolute left-2 top-2 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white">
            <Circle
              aria-hidden
              className={cn(
                "size-2 fill-current",
                live ? "text-[color:var(--danger)] motion-safe:animate-pulse" : "text-text-muted",
              )}
            />
            {live ? "LIVE" : "Idle"}
          </span>
        </div>
        <StatusControls disabledReason={controlsDisabledReason} />
      </div>

      {/* Side rail: signals + product + budget/policy */}
      <div className="flex flex-col gap-4">
        <SignalFeed signals={signals} />
        <ProductContext product={product} claims={claims} />
        <BudgetPolicyPanel session={session} />
      </div>
    </div>
  );
}
