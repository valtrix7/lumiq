/**
 * Admin recovery browser (US7 — Admin/Recovery, T055).
 *
 * Groups seeded AdminRecoveryItems into nine operational sections (DLQ, stuck moments,
 * failed runs, B2 reconciliation, provider failures, budget anomalies, audit search,
 * retention queue, orphaned assets) rendered as dense, horizontally-scrollable tables.
 * Each row opens the RecoveryDetailSheet drawer. Sections with no items render an
 * explicit empty banner. B2 keys, checksums, and trace IDs are visible inline —
 * satisfying provenance-on-admin acceptance (SC-005).
 *
 * Presentational only — no fetch, no mutation, no provider calls. Dark-only, tokens only.
 */

"use client";

import * as React from "react";
import {
  AlertOctagon,
  Archive,
  ChevronRight,
  DatabaseZap,
  FileQuestion,
  ListX,
  PauseCircle,
  ScrollText,
  ServerCog,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { StateBanner, StatusBadge, MonoMetadata } from "@/components/common/status-primitives";
import { RecoveryDetailSheet } from "@/components/admin/recovery-detail";
import type {
  AdminRecoveryItem,
  AdminRecoverySection,
  AdminRecoveryStatus,
  RolePreset,
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

/** Map a recovery status to a badge severity, deferring to item severity where ambiguous. */
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
 * Section definitions (ordered)
 * ------------------------------------------------------------------ */

interface SectionDef {
  id: AdminRecoverySection;
  label: string;
  icon: LucideIcon;
  empty: string;
}

const SECTIONS: SectionDef[] = [
  {
    id: "dlq",
    label: "DLQ",
    icon: ListX,
    empty: "No dead-lettered events. Messages awaiting redrive would appear here.",
  },
  {
    id: "stuck-moment",
    label: "Stuck moments",
    icon: PauseCircle,
    empty: "No moments stuck in an intermediate state.",
  },
  {
    id: "failed-run",
    label: "Failed runs",
    icon: AlertOctagon,
    empty: "No failed generation runs.",
  },
  {
    id: "b2-reconciliation",
    label: "B2 reconciliation",
    icon: DatabaseZap,
    empty: "B2 inventory matches asset rows — no reconciliation gaps.",
  },
  {
    id: "provider-failure",
    label: "Provider failures",
    icon: ServerCog,
    empty: "No provider health failures or open circuits.",
  },
  {
    id: "budget-anomaly",
    label: "Budget anomalies",
    icon: Wallet,
    empty: "No budget anomalies detected.",
  },
  {
    id: "audit",
    label: "Audit search",
    icon: ScrollText,
    empty: "No audit events matched the current filter.",
  },
  {
    id: "retention",
    label: "Retention queue",
    icon: Archive,
    empty: "No assets awaiting retention review.",
  },
  {
    id: "orphaned-asset",
    label: "Orphaned assets",
    icon: FileQuestion,
    empty: "No orphaned B2 objects without asset rows.",
  },
];

/* ------------------------------------------------------------------ *
 * Section table
 * ------------------------------------------------------------------ */

interface SectionTableProps {
  items: AdminRecoveryItem[];
  onOpen: (itemId: string) => void;
}

function SectionTable({ items, onOpen }: SectionTableProps) {
  return (
    <div className="bg-surface-one overflow-x-auto rounded-lg border border-[color:var(--border-subtle)]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Resource</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Error summary</TableHead>
            <TableHead>Trace ID</TableHead>
            <TableHead>Retries</TableHead>
            <TableHead>Last attempt</TableHead>
            <TableHead className="text-right">
              <span className="sr-only">Open</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.itemId} className="hover:bg-surface-two/60">
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-text-muted text-xs">{item.resourceType}</span>
                  <span data-mono className="text-text-primary font-mono text-xs">
                    {item.resourceId}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge
                  label={item.status}
                  severity={statusSeverity(item.status, item.severity)}
                />
              </TableCell>
              <TableCell>
                <StatusBadge label={item.severity} severity={item.severity} />
              </TableCell>
              <TableCell className="max-w-[18rem]">
                <span
                  className="text-text-secondary line-clamp-1 text-xs"
                  title={item.errorSummary}
                >
                  {item.errorSummary}
                </span>
              </TableCell>
              <TableCell>
                <MonoMetadata value={item.traceId} muted truncate />
              </TableCell>
              <TableCell className="text-text-secondary font-mono text-xs tabular-nums">
                {item.retryCount}
              </TableCell>
              <TableCell>
                <span data-mono className="text-text-muted font-mono text-xs">
                  {formatUtc(item.lastAttemptAt)}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Open recovery detail for ${item.resourceType} ${item.resourceId}`}
                  onClick={() => onOpen(item.itemId)}
                >
                  <ChevronRight aria-hidden />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * AdminRecovery
 * ------------------------------------------------------------------ */

export interface AdminRecoveryProps {
  items: AdminRecoveryItem[];
  role: RolePreset;
}

export function AdminRecovery({ items, role }: AdminRecoveryProps) {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const handleOpen = React.useCallback((itemId: string) => {
    setSelectedId(itemId);
    setSheetOpen(true);
  }, []);

  const selected = React.useMemo(
    () => (selectedId ? items.find((item) => item.itemId === selectedId) ?? null : null),
    [items, selectedId],
  );

  // Group items by section id.
  const bySection = React.useMemo(() => {
    const map = new Map<AdminRecoverySection, AdminRecoveryItem[]>();
    for (const section of SECTIONS) map.set(section.id, []);
    for (const item of items) {
      const bucket = map.get(item.type);
      if (bucket) bucket.push(item);
    }
    return map;
  }, [items]);

  // Default to the first section that actually has items, else the first section.
  const defaultTab = React.useMemo(
    () => SECTIONS.find((section) => (bySection.get(section.id)?.length ?? 0) > 0)?.id ?? SECTIONS[0].id,
    [bySection],
  );

  if (items.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <StateBanner
          title="No recovery items"
          message="DLQ is empty, no moments or runs are stuck, B2 inventory reconciles, and no anomalies are queued. Switch to a seeded state to preview operational recovery."
          severity="neutral"
          icon={ListX}
        />
        <RecoveryDetailSheet
          item={selected}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Tabs defaultValue={defaultTab}>
        <TabsList className="flex h-auto flex-wrap">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            const count = bySection.get(section.id)?.length ?? 0;
            return (
              <TabsTrigger key={section.id} value={section.id} className="gap-1.5">
                <Icon aria-hidden className="size-3.5" />
                {section.label}
                <span className="text-text-muted ml-0.5 text-xs">· {count}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {SECTIONS.map((section) => {
          const sectionItems = bySection.get(section.id) ?? [];
          const Icon = section.icon;
          return (
            <TabsContent key={section.id} value={section.id} className="mt-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Icon aria-hidden className="text-text-muted size-4" />
                <h3 className="text-text-primary text-sm font-medium">{section.label}</h3>
                <span className="text-text-muted text-xs">
                  {sectionItems.length} item{sectionItems.length === 1 ? "" : "s"}
                </span>
              </div>
              {sectionItems.length === 0 ? (
                <StateBanner title={`${section.label} is empty`} message={section.empty} severity="neutral" />
              ) : (
                <SectionTable items={sectionItems} onOpen={handleOpen} />
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      <p className="text-text-muted text-xs">
        Recovery actions are presentational in this preview and shown for the{" "}
        <span className="text-text-secondary">{role}</span> role — no actions are performed.
        Enacting recovery requires an operator reason and audit event via Core API.
      </p>

      <RecoveryDetailSheet item={selected} open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
