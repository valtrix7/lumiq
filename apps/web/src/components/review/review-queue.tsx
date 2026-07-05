"use client";

/**
 * Review Queue (US4).
 *
 * Client component: renders the seeded review rows for the active view and a lightweight
 * filter bar (text search + moment type) that narrows the visible cards in local state. Each
 * card carries the contract-required content — enhanced preview, moment type, product/campaign,
 * QA status, product fact status, short AI explanation, lineage mini-chain, and primary/
 * secondary actions with disabled reasons. UI-only — no fetch, no mutation. Cards link to the
 * Moment Detail route for the full tabbed review.
 */

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { cn } from "@/lib/cn";
import type {
  LineageNode,
  MockMoment,
  ProductFactStatus,
  QaStatus,
  ReviewItem,
  Severity,
} from "@/lib/screen-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MediaPlaceholder } from "@/components/common/media-primitives";
import {
  DisabledReason,
  MonoMetadata,
  StateBanner,
  StatusBadge,
} from "@/components/common/status-primitives";
import { LineageChain } from "@/components/provenance/provenance-components";

/* ------------------------------------------------------------------ *
 * Row model + status mapping
 * ------------------------------------------------------------------ */

export interface ReviewRow {
  item: ReviewItem;
  moment: MockMoment;
  productName?: string;
  campaignName?: string;
  lineage: LineageNode[];
}

const QA_SEVERITY: Record<QaStatus, Severity> = {
  not_started: "neutral",
  running: "processing",
  passed: "success",
  failed: "danger",
  review_required: "warning",
  remediated: "info",
  terminal: "danger",
};

const FACT_SEVERITY: Record<ProductFactStatus, Severity> = {
  valid: "success",
  changed: "warning",
  "review-required": "warning",
  blocked: "danger",
};

function titleCase(value: string): string {
  return value.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ------------------------------------------------------------------ *
 * Review card
 * ------------------------------------------------------------------ */

function ReviewCard({ row }: { row: ReviewRow }) {
  const { item, moment, productName, campaignName, lineage } = row;
  const href = `/review/${moment.momentId}`;

  return (
    <Card className="flex flex-col gap-0">
      <div className="px-(--card-spacing)">
        <MediaPlaceholder
          kind="video"
          aspect="16:9"
          label={`Enhanced preview — ${moment.momentType}`}
          caption={titleCase(moment.momentType)}
        />
      </div>
      <CardContent className="flex flex-1 flex-col gap-3 pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge label={titleCase(moment.momentType)} severity="info" />
          <StatusBadge label={`QA: ${titleCase(moment.qaStatus)}`} severity={QA_SEVERITY[moment.qaStatus]} />
          <StatusBadge
            label={`Facts: ${titleCase(moment.productFactStatus)}`}
            severity={FACT_SEVERITY[moment.productFactStatus]}
          />
          <span className="text-text-muted text-xs tabular-nums">
            {Math.round(moment.score * 100)}%
          </span>
        </div>

        <div className="text-text-muted flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          {productName ? <MonoMetadata label="product" value={productName} /> : null}
          {campaignName ? <MonoMetadata label="campaign" value={campaignName} /> : null}
        </div>

        <p className="text-text-secondary line-clamp-2 text-sm">{moment.aiExplanation}</p>

        <LineageChain nodes={lineage} />

        <div className="mt-auto flex flex-col gap-2 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild size="sm">
              <Link href={href}>
                Open detail
                <ArrowRight aria-hidden />
              </Link>
            </Button>
            <Button type="button" variant="outline" size="sm">
              {titleCase(item.primaryAction)}
            </Button>
            {item.secondaryActions.map((action) => (
              <Button key={action} type="button" variant="ghost" size="sm">
                {titleCase(action)}
              </Button>
            ))}
          </div>
          {item.disabledActionReasons.map((entry) => (
            <DisabledReason key={entry.action} reason={entry.reason}>
              <Button disabled aria-disabled variant="outline" size="sm">
                {titleCase(entry.action)}
              </Button>
            </DisabledReason>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ *
 * ReviewQueue
 * ------------------------------------------------------------------ */

export interface ReviewQueueProps {
  rows: ReviewRow[];
  className?: string;
}

export function ReviewQueue({ rows, className }: ReviewQueueProps) {
  const [query, setQuery] = React.useState("");
  const [type, setType] = React.useState("all");

  const types = React.useMemo(() => {
    const set = new Set(rows.map((row) => row.moment.momentType));
    return Array.from(set);
  }, [rows]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (type !== "all" && row.moment.momentType !== type) return false;
      if (!q) return true;
      const haystack = [
        row.moment.momentType,
        row.moment.aiExplanation,
        row.productName ?? "",
        row.campaignName ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [rows, query, type]);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            aria-hidden
            className="text-text-muted pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2"
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search moments, products, campaigns"
            aria-label="Search review queue"
            className="pl-8"
          />
        </div>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger aria-label="Filter by moment type" className="w-full sm:w-52">
            <SelectValue placeholder="Moment type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All moment types</SelectItem>
            {types.map((value) => (
              <SelectItem key={value} value={value}>
                {titleCase(value)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <StateBanner
          title="No moments match this view"
          message="Try clearing the search or moment-type filter, or switch to another review view."
          severity="neutral"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((row) => (
            <ReviewCard key={row.item.reviewItemId} row={row} />
          ))}
        </div>
      )}
    </div>
  );
}
