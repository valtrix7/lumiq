/**
 * Recovery detail sheet (US7 — Admin/Recovery, T056).
 *
 * A controlled right-hand Sheet that renders the full technical envelope of a single
 * AdminRecoveryItem: identity, event envelope, error + retry timeline, storage proof
 * (tenant-scoped B2 key + SHA-256), payload preview, related links, and eligible
 * (presentational) actions. Sensitive actions render disabled inside a DisabledReason
 * explaining they require an operator reason and audit event when enacted via Core API.
 *
 * Presentational only — no fetch, no mutation, no provider calls. Dark-only, tokens only.
 */

"use client";

import * as React from "react";
import {
  Ban,
  Clock,
  ExternalLink,
  Link2,
  type LucideIcon,
  PauseCircle,
  RotateCw,
  SkipForward,
  Terminal,
  Trash2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DisabledReason,
  MonoMetadata,
  StatusBadge,
} from "@/components/common/status-primitives";
import type {
  AdminRecoveryItem,
  AdminRecoveryStatus,
  Severity,
} from "@/lib/screen-types";

/* ------------------------------------------------------------------ *
 * Deterministic UTC formatting (no Date / locale → no hydration drift)
 * ------------------------------------------------------------------ */

/** Format an ISO timestamp as a fixed "YYYY-MM-DD HH:MM:SS UTC" label. */
function formatUtc(iso: string): string {
  const [date, rest] = iso.split("T");
  const time = (rest ?? "").slice(0, 8);
  return `${date} ${time} UTC`;
}

/* ------------------------------------------------------------------ *
 * Status → severity mapping (statuses are never color-only)
 * ------------------------------------------------------------------ */

/** Map an item's recovery status to a badge severity, deferring to item.severity where ambiguous. */
function statusSeverity(status: AdminRecoveryStatus, itemSeverity: Severity): Severity {
  switch (status) {
    case "open":
      return itemSeverity === "danger" ? "danger" : "warning";
    case "retrying":
      return "processing";
    case "recovered":
      return "success";
    case "terminal":
      return itemSeverity === "danger" ? "danger" : "neutral";
    case "skipped":
      return "neutral";
  }
}

/* ------------------------------------------------------------------ *
 * Eligible-action presentation metadata (presentational only)
 * ------------------------------------------------------------------ */

const ACTION_META: Record<string, { label: string; icon: LucideIcon }> = {
  retry: { label: "Retry", icon: RotateCw },
  requeue: { label: "Requeue", icon: RotateCw },
  "mark-terminal": { label: "Mark terminal", icon: Ban },
  skip: { label: "Skip", icon: SkipForward },
  "open-trace": { label: "Open trace", icon: ExternalLink },
  "open-resource": { label: "Open resource", icon: ExternalLink },
  link: { label: "Link asset", icon: Link2 },
  "delete-orphan": { label: "Delete orphan", icon: Trash2 },
  "raise-cap": { label: "Raise budget cap", icon: Clock },
  "pause-session": { label: "Pause session", icon: PauseCircle },
  "open-circuit": { label: "Open circuit", icon: Zap },
  "disable-template": { label: "Disable template", icon: Ban },
  "extend-retention": { label: "Extend retention", icon: Clock },
  "approve-purge": { label: "Approve purge", icon: Trash2 },
};

/** Pretty-print a payload JSON string, falling back to the raw value if it is not JSON. */
function prettyPayload(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

/* ------------------------------------------------------------------ *
 * Labeled block
 * ------------------------------------------------------------------ */

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-text-muted text-xs font-medium tracking-wide uppercase">
        {label}
      </span>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * RecoveryDetailSheet
 * ------------------------------------------------------------------ */

export interface RecoveryDetailSheetProps {
  item: AdminRecoveryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecoveryDetailSheet({ item, open, onOpenChange }: RecoveryDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto sm:max-w-xl"
      >
        <SheetHeader className="border-b border-[color:var(--border-subtle)]">
          <SheetTitle>
            {item ? `${item.resourceType} ${item.resourceId}` : "Recovery detail"}
          </SheetTitle>
          {item ? (
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge
                label={item.status}
                severity={statusSeverity(item.status, item.severity)}
              />
              <StatusBadge label={item.severity} severity={item.severity} />
            </div>
          ) : null}
        </SheetHeader>

        {item ? (
          <div className="flex flex-col gap-4 p-4">
            {/* Identity */}
            <Block label="Identity">
              <div className="flex flex-col gap-1">
                <MonoMetadata label="item_id" value={item.itemId} muted />
                <MonoMetadata
                  label="resource"
                  value={`${item.resourceType}:${item.resourceId}`}
                  muted
                />
                <MonoMetadata label="organization" value={item.organizationId} muted />
                {item.producer ? (
                  <MonoMetadata label="producer" value={item.producer} muted />
                ) : null}
                {item.actor ? (
                  <MonoMetadata label="actor" value={item.actor} muted />
                ) : null}
              </div>
            </Block>

            {/* Event envelope */}
            {item.eventType || item.schemaVersion || item.correlationId ? (
              <Block label="Event envelope">
                <div className="flex flex-col gap-1">
                  {item.eventType ? (
                    <MonoMetadata label="event_type" value={item.eventType} muted />
                  ) : null}
                  {item.schemaVersion ? (
                    <MonoMetadata label="schema_version" value={item.schemaVersion} muted />
                  ) : null}
                  <MonoMetadata label="trace_id" value={item.traceId} muted truncate />
                  {item.correlationId ? (
                    <MonoMetadata
                      label="correlation_id"
                      value={item.correlationId}
                      muted
                      truncate
                    />
                  ) : null}
                </div>
              </Block>
            ) : (
              <Block label="Trace">
                <MonoMetadata label="trace_id" value={item.traceId} muted truncate />
              </Block>
            )}

            {/* Error + retry timeline */}
            <Block label="Error">
              <p className="text-text-secondary text-sm">{item.errorSummary}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="text-text-muted text-xs">
                  retries:{" "}
                  <span data-mono className="text-text-secondary font-mono">
                    {item.retryCount}
                  </span>
                </span>
                <span className="text-text-muted text-xs">
                  last attempt:{" "}
                  <span data-mono className="text-text-secondary font-mono">
                    {formatUtc(item.lastAttemptAt)}
                  </span>
                </span>
              </div>
            </Block>

            {/* Storage proof (tenant-scoped B2 key + checksum) */}
            {item.b2ObjectKey || item.sha256 ? (
              <Block label="Storage proof">
                <div className="flex flex-col gap-1">
                  {item.b2ObjectKey ? (
                    <MonoMetadata label="B2 object key" value={item.b2ObjectKey} muted truncate />
                  ) : null}
                  {item.sha256 ? (
                    <MonoMetadata label="SHA-256" value={item.sha256} muted truncate />
                  ) : null}
                </div>
              </Block>
            ) : null}

            {/* Payload preview */}
            <Block label="Payload preview">
              <pre
                data-mono
                className="bg-surface-one text-text-secondary overflow-x-auto rounded-md border border-[color:var(--border-subtle)] p-3 font-mono text-xs leading-relaxed"
              >
                {prettyPayload(item.payloadPreview)}
              </pre>
            </Block>

            {/* Related links */}
            {item.relatedLinks.length > 0 ? (
              <Block label="Related links">
                <ul className="flex flex-wrap gap-1.5">
                  {item.relatedLinks.map((link) => (
                    <li
                      key={link}
                      data-mono
                      className="bg-surface-one text-text-muted rounded border border-[color:var(--border-subtle)] px-1.5 py-0.5 font-mono text-xs"
                    >
                      {link}
                    </li>
                  ))}
                </ul>
              </Block>
            ) : null}

            {/* Eligible actions (presentational only) */}
            {item.eligibleActions.length > 0 ? (
              <Block label="Eligible actions">
                <div className="flex flex-wrap items-start gap-2">
                  {item.eligibleActions.map((action) => {
                    const meta = ACTION_META[action];
                    const Icon = meta?.icon ?? Terminal;
                    const label = meta?.label ?? action;
                    if (item.requiresReason) {
                      return (
                        <DisabledReason
                          key={action}
                          reason="Requires an explicit operator reason and audit event (UI-only — no action performed)."
                        >
                          <Button type="button" variant="outline" size="sm" disabled>
                            <Icon aria-hidden />
                            {label}
                          </Button>
                        </DisabledReason>
                      );
                    }
                    return (
                      <Button key={action} type="button" variant="outline" size="sm">
                        <Icon aria-hidden />
                        {label}
                      </Button>
                    );
                  })}
                </div>
              </Block>
            ) : null}

            <Separator />

            <p className="text-text-muted text-xs">
              Recovery actions are UI-only and require an operator reason + audit event when
              enacted via Core API. No action is performed in this preview.
            </p>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
