/**
 * Moment Vault views (US5).
 *
 * Presentational renderers for the captured/enhanced/reviewed/published moment library:
 * grid, timeline, product/campaign grouping, publish-package, and search-result views. Each
 * card shows media preview, semantic status, product/campaign grounding, score, a compact
 * provenance lineage chain, and a link to the full Moment Detail (where the full graph lives).
 *
 * UI-only — no fetch, no mutation. Server-component safe (no hooks); the stateful filter shell
 * in `vault-filters.tsx` composes these with the seeded rows it narrows.
 */

import * as React from "react";
import Link from "next/link";
import { ArrowRight, CalendarClock } from "lucide-react";
import type {
  AssetRole,
  LineageNode,
  MomentState,
  ProductFactStatus,
  PublishState,
  QaStatus,
  Severity,
} from "@/lib/screen-types";
import { Card, CardContent } from "@/components/ui/card";
import { MediaPlaceholder } from "@/components/common/media-primitives";
import { MonoMetadata, StateBanner, StatusBadge } from "@/components/common/status-primitives";
import { LineageChain } from "@/components/provenance/provenance-components";

/* ------------------------------------------------------------------ *
 * Row model — assembled server-side, fully serializable
 * ------------------------------------------------------------------ */

export interface VaultRow {
  momentId: string;
  momentType: string;
  state: MomentState;
  score: number;
  qaStatus: QaStatus;
  publishState: PublishState;
  productFactStatus: ProductFactStatus;
  aiExplanation: string;
  evidenceSummary: string;
  sessionId: string;
  sessionTitle: string;
  productId?: string;
  productName?: string;
  campaignId?: string;
  campaignName?: string;
  templateId?: string;
  templateLabel?: string;
  reviewer?: string;
  /** ISO 8601 capture timestamp, or undefined for un-captured candidates. */
  capturedAt?: string;
  assetRoles: AssetRole[];
  lineage: LineageNode[];
  publishPackageId?: string;
  publishPackageTitle?: string;
}

export type VaultViewKind = "grid" | "timeline" | "grouped" | "package" | "search";
export type VaultGroupBy = "product" | "campaign";

/* ------------------------------------------------------------------ *
 * Status → severity maps + formatting
 * ------------------------------------------------------------------ */

const STATE_SEVERITY: Record<MomentState, Severity> = {
  candidate: "info",
  capture_authorized: "info",
  capturing: "processing",
  raw_uploaded: "info",
  enhancement_pending: "processing",
  enhancing: "processing",
  qa_pending: "processing",
  review_pending: "warning",
  approved: "success",
  canonical: "success",
  published: "success",
};

const QA_SEVERITY: Record<QaStatus, Severity> = {
  not_started: "neutral",
  running: "processing",
  passed: "success",
  failed: "danger",
  review_required: "warning",
  remediated: "info",
  terminal: "danger",
};

const PUBLISH_SEVERITY: Record<PublishState, Severity> = {
  draft: "neutral",
  ready: "info",
  review_pending: "warning",
  approved: "success",
  published: "success",
  revoked: "danger",
  failed: "danger",
  deleted: "neutral",
};

export function titleCase(value: string): string {
  return value.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Deterministic day label from an ISO string — avoids locale/timezone hydration drift. */
export function formatDay(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${MONTHS[Number(m) - 1]} ${Number(d)}, ${y}`;
}

/** Deterministic UTC time-of-day label from an ISO string. */
export function formatTime(iso: string): string {
  return `${iso.slice(11, 16)} UTC`;
}

/* ------------------------------------------------------------------ *
 * VaultCard — shared moment card (grid + grouped views)
 * ------------------------------------------------------------------ */

export function VaultCard({ row }: { row: VaultRow }) {
  const href = `/review/${row.momentId}`;

  return (
    <Card className="flex flex-col gap-0">
      <div className="px-(--card-spacing)">
        <MediaPlaceholder
          kind="video"
          aspect="16:9"
          label={`Moment preview — ${row.momentType}`}
          caption={titleCase(row.momentType)}
        />
      </div>
      <CardContent className="flex flex-1 flex-col gap-3 pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge label={titleCase(row.state)} severity={STATE_SEVERITY[row.state]} />
          <StatusBadge label={`QA: ${titleCase(row.qaStatus)}`} severity={QA_SEVERITY[row.qaStatus]} />
          <StatusBadge
            label={`Publish: ${titleCase(row.publishState)}`}
            severity={PUBLISH_SEVERITY[row.publishState]}
          />
          <span className="text-text-muted text-xs tabular-nums">{Math.round(row.score * 100)}%</span>
        </div>

        <div className="text-text-muted flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          {row.productName ? <MonoMetadata label="product" value={row.productName} /> : null}
          {row.campaignName ? <MonoMetadata label="campaign" value={row.campaignName} /> : null}
          {row.capturedAt ? (
            <span className="inline-flex items-center gap-1">
              <CalendarClock aria-hidden className="size-3" />
              {formatDay(row.capturedAt)}
            </span>
          ) : null}
        </div>

        <p className="text-text-secondary line-clamp-2 text-sm">{row.aiExplanation}</p>

        <LineageChain nodes={row.lineage} />

        <div className="mt-auto pt-1">
          <Link
            href={href}
            className="text-primary inline-flex items-center gap-1 text-sm font-medium hover:underline focus-visible:ring-ring/50 rounded outline-none focus-visible:ring-2"
          >
            Open moment
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ *
 * Empty states
 * ------------------------------------------------------------------ */

/** First-run empty: the vault has no captured moments at all. */
export function VaultFirstRunEmpty() {
  return (
    <StateBanner
      title="No moments captured yet"
      message="Start a Live Studio session to detect and capture commerce moments. Captured, enhanced, reviewed, and published moments will appear here with full provenance."
      severity="neutral"
    />
  );
}

/** No-match empty: rows exist but the active filters exclude all of them. */
export function VaultNoMatch({ onClear }: { onClear?: React.ReactNode }) {
  return (
    <StateBanner
      title="No moments match these filters"
      message="Try clearing the search or relaxing a filter — for example widen the date, score, or status, or switch back to all sessions."
      severity="neutral"
      action={onClear}
    />
  );
}

/* ------------------------------------------------------------------ *
 * Grid view
 * ------------------------------------------------------------------ */

export function VaultGrid({ rows }: { rows: VaultRow[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {rows.map((row) => (
        <VaultCard key={row.momentId} row={row} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Timeline view — grouped by capture day, newest first, with text time markers
 * ------------------------------------------------------------------ */

export function VaultTimeline({ rows }: { rows: VaultRow[] }) {
  // ISO strings sort lexically; undated rows fall to the end under "Undated".
  const sorted = [...rows].sort((a, b) => (b.capturedAt ?? "").localeCompare(a.capturedAt ?? ""));

  const groups = new Map<string, VaultRow[]>();
  for (const row of sorted) {
    const key = row.capturedAt ? formatDay(row.capturedAt) : "Undated";
    const bucket = groups.get(key) ?? [];
    bucket.push(row);
    groups.set(key, bucket);
  }

  return (
    <div className="flex flex-col gap-6">
      {[...groups.entries()].map(([day, dayRows]) => (
        <section key={day} className="flex flex-col gap-3">
          <h3 className="text-text-muted flex items-center gap-2 text-xs font-medium tracking-wide uppercase">
            <CalendarClock aria-hidden className="size-3.5" />
            {day}
          </h3>
          <ol className="border-border-subtle flex flex-col gap-3 border-l pl-4">
            {dayRows.map((row) => (
              <li key={row.momentId} className="relative">
                <span
                  aria-hidden
                  className="bg-surface-two border-background absolute top-1.5 -left-[1.3125rem] size-2 rounded-full border-2"
                />
                <Link
                  href={`/review/${row.momentId}`}
                  className="bg-surface-one/60 hover:bg-surface-two focus-visible:ring-ring/50 flex flex-col gap-2 rounded-lg border border-[color:var(--border-subtle)] p-3 outline-none transition-colors focus-visible:ring-2"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-text-muted text-xs tabular-nums">
                      {row.capturedAt ? formatTime(row.capturedAt) : "—"}
                    </span>
                    <span className="text-text-primary text-sm font-medium">
                      {titleCase(row.momentType)}
                    </span>
                    <StatusBadge label={titleCase(row.state)} severity={STATE_SEVERITY[row.state]} />
                    <StatusBadge
                      label={`QA: ${titleCase(row.qaStatus)}`}
                      severity={QA_SEVERITY[row.qaStatus]}
                    />
                  </div>
                  <div className="text-text-muted flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    {row.productName ? <MonoMetadata label="product" value={row.productName} /> : null}
                    {row.campaignName ? <MonoMetadata label="campaign" value={row.campaignName} /> : null}
                    <span className="tabular-nums">{Math.round(row.score * 100)}%</span>
                  </div>
                  <LineageChain nodes={row.lineage} />
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Grouped view — product or campaign sections
 * ------------------------------------------------------------------ */

export function VaultGrouped({ rows, groupBy }: { rows: VaultRow[]; groupBy: VaultGroupBy }) {
  const groups = new Map<string, VaultRow[]>();
  const unlabeled = groupBy === "product" ? "No product" : "No campaign";

  for (const row of rows) {
    const key = (groupBy === "product" ? row.productName : row.campaignName) ?? unlabeled;
    const bucket = groups.get(key) ?? [];
    bucket.push(row);
    groups.set(key, bucket);
  }

  return (
    <div className="flex flex-col gap-6">
      {[...groups.entries()].map(([label, groupRows]) => (
        <section key={label} className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-text-primary text-sm font-semibold tracking-tight">{label}</h3>
            <span className="text-text-muted text-xs tabular-nums">
              {groupRows.length} {groupRows.length === 1 ? "moment" : "moments"}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {groupRows.map((row) => (
              <VaultCard key={row.momentId} row={row} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Publish-package view — only moments with a publish package
 * ------------------------------------------------------------------ */

export function VaultPackages({ rows }: { rows: VaultRow[] }) {
  const packaged = rows.filter((row) => row.publishPackageId);

  if (packaged.length === 0) {
    return (
      <StateBanner
        title="No publish packages in this view"
        message="Moments become publish packages after QA passes and a reviewer approves them. Approve a moment in Review to assemble its package."
        severity="neutral"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {packaged.map((row) => (
        <Card key={row.momentId} className="flex flex-col gap-0">
          <div className="px-(--card-spacing)">
            <MediaPlaceholder
              kind="video"
              aspect="9:16"
              label={`Publish variant — ${row.momentType}`}
              caption="Publish variant · 9:16"
              className="mx-auto max-w-[16rem]"
            />
          </div>
          <CardContent className="flex flex-1 flex-col gap-3 pt-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge
                label={`Publish: ${titleCase(row.publishState)}`}
                severity={PUBLISH_SEVERITY[row.publishState]}
              />
              <StatusBadge label={`QA: ${titleCase(row.qaStatus)}`} severity={QA_SEVERITY[row.qaStatus]} />
            </div>
            <p className="text-text-primary text-sm font-medium">
              {row.publishPackageTitle ?? titleCase(row.momentType)}
            </p>
            <div className="text-text-muted flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              <MonoMetadata label="package" value={row.publishPackageId!} muted truncate />
              {row.campaignName ? <MonoMetadata label="campaign" value={row.campaignName} /> : null}
            </div>
            <LineageChain nodes={row.lineage} />
            <div className="mt-auto pt-1">
              <Link
                href={`/review/${row.momentId}`}
                className="text-primary focus-visible:ring-ring/50 inline-flex items-center gap-1 rounded text-sm font-medium outline-none hover:underline focus-visible:ring-2"
              >
                Open package
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Search-result view — compact list rows
 * ------------------------------------------------------------------ */

export function VaultSearchResults({ rows }: { rows: VaultRow[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {rows.map((row) => (
        <li key={row.momentId}>
          <Link
            href={`/review/${row.momentId}`}
            className="bg-surface-one/60 hover:bg-surface-two focus-visible:ring-ring/50 flex flex-col gap-2 rounded-lg border border-[color:var(--border-subtle)] p-3 outline-none transition-colors focus-visible:ring-2 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-text-primary text-sm font-medium">{titleCase(row.momentType)}</span>
                <StatusBadge label={titleCase(row.state)} severity={STATE_SEVERITY[row.state]} />
                <span className="text-text-muted text-xs tabular-nums">{Math.round(row.score * 100)}%</span>
              </div>
              <p className="text-text-muted line-clamp-1 text-xs">{row.aiExplanation}</p>
              <div className="text-text-muted flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                {row.productName ? <MonoMetadata label="product" value={row.productName} /> : null}
                {row.sessionTitle ? <MonoMetadata label="session" value={row.sessionTitle} /> : null}
              </div>
            </div>
            <div className="shrink-0">
              <LineageChain nodes={row.lineage} />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
