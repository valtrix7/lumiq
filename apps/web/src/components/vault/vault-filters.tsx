"use client";

/**
 * Moment Vault filter bar + browser shell (US5).
 *
 * `VaultBrowser` is the stateful client container: it owns the filter state and the active view,
 * derives the facet option lists from the seeded rows, narrows them locally, and hands the
 * matching rows to the view renderers in `vault-views.tsx`. `VaultFilters` is the presentational
 * filter bar covering session, product, campaign, moment type, status, QA, publish state,
 * template, date, reviewer, score, and asset type.
 *
 * UI-only — filtering happens entirely in local state; there is no fetch and no mutation. The
 * seeded rows arrive fully assembled and serializable from the server route.
 */

import * as React from "react";
import { RotateCcw, Search } from "lucide-react";
import { cn } from "@/lib/cn";
import type { AssetRole } from "@/lib/screen-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  VaultFirstRunEmpty,
  VaultGrid,
  VaultGrouped,
  VaultNoMatch,
  VaultPackages,
  VaultSearchResults,
  VaultTimeline,
  formatDay,
  titleCase,
  type VaultGroupBy,
  type VaultRow,
  type VaultViewKind,
} from "@/components/vault/vault-views";

/* ------------------------------------------------------------------ *
 * Filter state
 * ------------------------------------------------------------------ */

const ALL = "all";

export interface VaultFilterState {
  query: string;
  session: string;
  product: string;
  campaign: string;
  momentType: string;
  status: string;
  qa: string;
  publishState: string;
  template: string;
  date: string;
  reviewer: string;
  score: string;
  assetType: string;
}

const INITIAL_FILTERS: VaultFilterState = {
  query: "",
  session: ALL,
  product: ALL,
  campaign: ALL,
  momentType: ALL,
  status: ALL,
  qa: ALL,
  publishState: ALL,
  template: ALL,
  date: ALL,
  reviewer: ALL,
  score: ALL,
  assetType: ALL,
};

const SCORE_THRESHOLDS = [
  { value: "0.9", label: "≥ 90%" },
  { value: "0.85", label: "≥ 85%" },
  { value: "0.8", label: "≥ 80%" },
] as const;

interface FacetOption {
  value: string;
  label: string;
}

interface VaultFacets {
  session: FacetOption[];
  product: FacetOption[];
  campaign: FacetOption[];
  momentType: FacetOption[];
  status: FacetOption[];
  qa: FacetOption[];
  publishState: FacetOption[];
  template: FacetOption[];
  date: FacetOption[];
  reviewer: FacetOption[];
  assetType: FacetOption[];
}

/** Build a sorted, de-duplicated facet list from a row accessor. */
function facet(
  rows: VaultRow[],
  pick: (row: VaultRow) => string | undefined,
  toLabel: (value: string) => string = titleCase,
): FacetOption[] {
  const set = new Set<string>();
  for (const row of rows) {
    const value = pick(row);
    if (value) set.add(value);
  }
  return [...set].sort().map((value) => ({ value, label: toLabel(value) }));
}

function deriveFacets(rows: VaultRow[]): VaultFacets {
  const assetRoles = new Set<AssetRole>();
  for (const row of rows) for (const role of row.assetRoles) assetRoles.add(role);

  const dates = new Set<string>();
  for (const row of rows) if (row.capturedAt) dates.add(row.capturedAt.slice(0, 10));

  return {
    session: facet(rows, (r) => r.sessionId, (v) => {
      const match = rows.find((r) => r.sessionId === v);
      return match?.sessionTitle ?? v;
    }),
    product: facet(rows, (r) => r.productName, (v) => v),
    campaign: facet(rows, (r) => r.campaignName, (v) => v),
    momentType: facet(rows, (r) => r.momentType),
    status: facet(rows, (r) => r.state),
    qa: facet(rows, (r) => r.qaStatus),
    publishState: facet(rows, (r) => r.publishState),
    template: facet(rows, (r) => r.templateLabel, (v) => v),
    date: [...dates].sort().reverse().map((value) => ({
      value,
      label: formatDay(`${value}T00:00:00.000Z`),
    })),
    reviewer: facet(rows, (r) => r.reviewer, (v) => v),
    assetType: [...assetRoles].sort().map((value) => ({ value, label: titleCase(value) })),
  };
}

/* ------------------------------------------------------------------ *
 * Matching
 * ------------------------------------------------------------------ */

function matches(row: VaultRow, f: VaultFilterState): boolean {
  if (f.session !== ALL && row.sessionId !== f.session) return false;
  if (f.product !== ALL && row.productName !== f.product) return false;
  if (f.campaign !== ALL && row.campaignName !== f.campaign) return false;
  if (f.momentType !== ALL && row.momentType !== f.momentType) return false;
  if (f.status !== ALL && row.state !== f.status) return false;
  if (f.qa !== ALL && row.qaStatus !== f.qa) return false;
  if (f.publishState !== ALL && row.publishState !== f.publishState) return false;
  if (f.template !== ALL && row.templateLabel !== f.template) return false;
  if (f.date !== ALL && row.capturedAt?.slice(0, 10) !== f.date) return false;
  if (f.reviewer !== ALL && row.reviewer !== f.reviewer) return false;
  if (f.score !== ALL && row.score < Number(f.score)) return false;
  if (f.assetType !== ALL && !row.assetRoles.includes(f.assetType as AssetRole)) return false;

  const q = f.query.trim().toLowerCase();
  if (q) {
    const haystack = [
      row.momentType,
      row.aiExplanation,
      row.evidenceSummary,
      row.productName ?? "",
      row.campaignName ?? "",
      row.sessionTitle,
      row.publishPackageTitle ?? "",
    ]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  return true;
}

/* ------------------------------------------------------------------ *
 * Filter bar
 * ------------------------------------------------------------------ */

interface FilterSelectProps {
  label: string;
  value: string;
  options: FacetOption[];
  allLabel: string;
  onChange: (value: string) => void;
}

function FilterSelect({ label, value, options, allLabel, onChange }: FilterSelectProps) {
  if (options.length === 0) return null;
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label} size="sm" className="w-full">
        <SelectValue placeholder={allLabel} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{allLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface VaultFiltersProps {
  filters: VaultFilterState;
  facets: VaultFacets;
  onChange: (patch: Partial<VaultFilterState>) => void;
  onReset: () => void;
  resultCount: number;
  totalCount: number;
  dirty: boolean;
}

export function VaultFilters({
  filters,
  facets,
  onChange,
  onReset,
  resultCount,
  totalCount,
  dirty,
}: VaultFiltersProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            aria-hidden
            className="text-text-muted pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2"
          />
          <Input
            type="search"
            value={filters.query}
            onChange={(event) => onChange({ query: event.target.value })}
            placeholder="Search moments, products, campaigns, sessions"
            aria-label="Search the moment vault"
            className="pl-8"
          />
        </div>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <span className="text-text-muted text-xs tabular-nums" aria-live="polite">
            {resultCount} of {totalCount}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onReset}
            disabled={!dirty}
            aria-disabled={!dirty}
          >
            <RotateCcw aria-hidden />
            Clear filters
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        <FilterSelect label="Filter by session" allLabel="All sessions" value={filters.session} options={facets.session} onChange={(v) => onChange({ session: v })} />
        <FilterSelect label="Filter by product" allLabel="All products" value={filters.product} options={facets.product} onChange={(v) => onChange({ product: v })} />
        <FilterSelect label="Filter by campaign" allLabel="All campaigns" value={filters.campaign} options={facets.campaign} onChange={(v) => onChange({ campaign: v })} />
        <FilterSelect label="Filter by moment type" allLabel="All types" value={filters.momentType} options={facets.momentType} onChange={(v) => onChange({ momentType: v })} />
        <FilterSelect label="Filter by status" allLabel="All statuses" value={filters.status} options={facets.status} onChange={(v) => onChange({ status: v })} />
        <FilterSelect label="Filter by QA status" allLabel="All QA" value={filters.qa} options={facets.qa} onChange={(v) => onChange({ qa: v })} />
        <FilterSelect label="Filter by publish state" allLabel="All publish states" value={filters.publishState} options={facets.publishState} onChange={(v) => onChange({ publishState: v })} />
        <FilterSelect label="Filter by template" allLabel="All templates" value={filters.template} options={facets.template} onChange={(v) => onChange({ template: v })} />
        <FilterSelect label="Filter by capture date" allLabel="Any date" value={filters.date} options={facets.date} onChange={(v) => onChange({ date: v })} />
        <FilterSelect label="Filter by reviewer" allLabel="Any reviewer" value={filters.reviewer} options={facets.reviewer} onChange={(v) => onChange({ reviewer: v })} />
        <FilterSelect label="Filter by asset type" allLabel="All asset types" value={filters.assetType} options={facets.assetType} onChange={(v) => onChange({ assetType: v })} />
        <Select value={filters.score} onValueChange={(v) => onChange({ score: v })}>
          <SelectTrigger aria-label="Filter by minimum score" size="sm" className="w-full">
            <SelectValue placeholder="Any score" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Any score</SelectItem>
            {SCORE_THRESHOLDS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * View switcher
 * ------------------------------------------------------------------ */

const VIEW_OPTIONS: { value: VaultViewKind; label: string }[] = [
  { value: "grid", label: "Grid" },
  { value: "timeline", label: "Timeline" },
  { value: "grouped", label: "Grouped" },
  { value: "package", label: "Publish packages" },
  { value: "search", label: "Search results" },
];

function ViewSwitcher({
  view,
  onView,
  groupBy,
  onGroupBy,
}: {
  view: VaultViewKind;
  onView: (view: VaultViewKind) => void;
  groupBy: VaultGroupBy;
  onGroupBy: (groupBy: VaultGroupBy) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div
        role="group"
        aria-label="Vault view"
        className="bg-surface-one inline-flex w-fit flex-wrap gap-1 rounded-lg border border-[color:var(--border-subtle)] p-1"
      >
        {VIEW_OPTIONS.map((option) => {
          const selected = option.value === view;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onView(option.value)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                "focus-visible:ring-ring/50 outline-none focus-visible:ring-2",
                selected
                  ? "bg-primary text-primary-foreground"
                  : "text-text-secondary hover:bg-surface-two hover:text-text-primary",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {view === "grouped" ? (
        <Select value={groupBy} onValueChange={(v) => onGroupBy(v as VaultGroupBy)}>
          <SelectTrigger aria-label="Group moments by" size="sm" className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="product">Group by product</SelectItem>
            <SelectItem value="campaign">Group by campaign</SelectItem>
          </SelectContent>
        </Select>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * VaultBrowser — stateful container
 * ------------------------------------------------------------------ */

export interface VaultBrowserProps {
  rows: VaultRow[];
  className?: string;
}

export function VaultBrowser({ rows, className }: VaultBrowserProps) {
  const [filters, setFilters] = React.useState<VaultFilterState>(INITIAL_FILTERS);
  const [view, setView] = React.useState<VaultViewKind>("grid");
  const [groupBy, setGroupBy] = React.useState<VaultGroupBy>("product");

  const facets = React.useMemo(() => deriveFacets(rows), [rows]);
  const filtered = React.useMemo(() => rows.filter((row) => matches(row, filters)), [rows, filters]);

  const dirty = React.useMemo(
    () => (Object.keys(filters) as (keyof VaultFilterState)[]).some((key) => filters[key] !== INITIAL_FILTERS[key]),
    [filters],
  );

  const patch = React.useCallback((next: Partial<VaultFilterState>) => {
    setFilters((prev) => ({ ...prev, ...next }));
  }, []);
  const reset = React.useCallback(() => setFilters(INITIAL_FILTERS), []);

  // First-run: the vault is genuinely empty (no captured moments at all).
  if (rows.length === 0) {
    return (
      <div className={cn("flex flex-col gap-4", className)}>
        <VaultFirstRunEmpty />
      </div>
    );
  }

  const noMatch = filtered.length === 0;

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <VaultFilters
        filters={filters}
        facets={facets}
        onChange={patch}
        onReset={reset}
        resultCount={filtered.length}
        totalCount={rows.length}
        dirty={dirty}
      />

      <ViewSwitcher view={view} onView={setView} groupBy={groupBy} onGroupBy={setGroupBy} />

      {noMatch ? (
        <VaultNoMatch
          onClear={
            <Button type="button" variant="outline" size="sm" onClick={reset}>
              <RotateCcw aria-hidden />
              Clear filters
            </Button>
          }
        />
      ) : view === "grid" ? (
        <VaultGrid rows={filtered} />
      ) : view === "timeline" ? (
        <VaultTimeline rows={filtered} />
      ) : view === "grouped" ? (
        <VaultGrouped rows={filtered} groupBy={groupBy} />
      ) : view === "package" ? (
        <VaultPackages rows={filtered} />
      ) : (
        <VaultSearchResults rows={filtered} />
      )}
    </div>
  );
}
