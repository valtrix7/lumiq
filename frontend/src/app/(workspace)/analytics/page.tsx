/**
 * Analytics overview (US7 / T063).
 *
 * Renders operational health metrics (capture / generation / QA / provider / B2 /
 * DLQ / cost), media engagement metrics (published / shares / clicks), and a seeded
 * template-performance table. Charts use semantic status colors only — no decorative
 * gradients, glow, or blur. Sparklines are tiny inline SVGs (no external chart
 * dependency) and the numeric value is always present as the accessible representation.
 *
 * Role-sensitive visibility: the `host` role lacks `analytics.view` and sees a restricted
 * banner. A `?state=empty` variant renders the no-data state. UI-only — no backend,
 * no fetch, no mutation.
 */

import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";
import { WorkspaceContent, PageHeader, Section } from "@/components/shell/layout-primitives";
import {
  MonoMetadata,
  StateBanner,
  StatusBadge,
} from "@/components/common/status-primitives";
import { StateSwitcher } from "@/components/common/state-switcher";
import { resolveStateParam } from "@/lib/state-param";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CAPABILITIES,
  isSectionHidden,
  mockAnalyticsMetrics,
  mockTemplates,
  roleHasCapability,
} from "@/lib/mock-data";
import type {
  AnalyticsMetric,
  MetricSeriesPoint,
  RolePreset,
  Severity,
  TemplateStatus,
} from "@/lib/screen-types";

export const metadata: Metadata = {
  title: "Analytics",
  description:
    "Operational health (capture, generation, QA, provider, B2, DLQ, cost) and media engagement metrics with seeded template performance. Seeded UI-only · no live services.",
};

const STATE_VARIANTS = [
  { value: "metrics", label: "Metrics" },
  { value: "empty", label: "Empty state" },
] as const;

/* ------------------------------------------------------------------ *
 * Status → semantic chart color + label
 * ------------------------------------------------------------------ */

const STATUS_STROKE: Record<Severity, string> = {
  neutral: "var(--chart-2)",
  info: "var(--chart-1)",
  processing: "var(--chart-1)",
  success: "var(--chart-3)",
  warning: "var(--chart-4)",
  danger: "var(--chart-5)",
};

const STATUS_LABEL: Record<Severity, string> = {
  neutral: "Neutral",
  info: "Info",
  processing: "Processing",
  success: "Healthy",
  warning: "Watch",
  danger: "Alert",
};

const TEMPLATE_STATUS_SEVERITY: Record<TemplateStatus, Severity> = {
  active: "success",
  draft: "neutral",
  deprecated: "warning",
  "provider-unavailable": "danger",
};

function barColor(score: number): string {
  if (score >= 80) return "var(--chart-3)";
  if (score >= 60) return "var(--chart-4)";
  return "var(--chart-5)";
}

/* ------------------------------------------------------------------ *
 * Deterministic seeded template performance (no Math.random → SSR-safe)
 * ------------------------------------------------------------------ */

function deterministicScore(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return 40 + (hash % 61); // 40..100
}

function deterministicCount(id: string): number {
  let hash = 0;
  for (let i = id.length - 1; i >= 0; i -= 1) {
    hash = (hash * 17 + id.charCodeAt(i)) >>> 0;
  }
  return 5 + (hash % 40); // 5..44
}

function formatValue(value: number): string {
  if (Number.isInteger(value)) {
    return value.toLocaleString("en-US");
  }
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

/* ------------------------------------------------------------------ *
 * Sparkline — self-contained inline SVG, semantic stroke
 * ------------------------------------------------------------------ */

function Sparkline({
  series,
  status,
}: {
  series: MetricSeriesPoint[];
  status: Severity;
}) {
  if (series.length === 0) return null;

  const width = 120;
  const height = 32;
  const pad = 2;
  const values = series.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const denom = series.length - 1 || 1;
  const stepX = (width - pad * 2) / denom;

  const coords = values.map((value, index) => {
    const x = pad + index * stepX;
    const y = pad + (height - pad * 2) * (1 - (value - min) / range);
    return [x, y] as const;
  });

  const linePoints = coords
    .map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`)
    .join(" ");
  const lastX = coords[coords.length - 1][0].toFixed(2);
  const baselineY = (height - pad).toFixed(2);
  const areaPoints = [
    `${pad.toFixed(2)},${baselineY}`,
    linePoints,
    `${lastX},${baselineY}`,
  ].join(" ");

  const stroke = STATUS_STROKE[status];

  return (
    <svg
      aria-hidden
      role="img"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="block w-full max-w-[120px]"
    >
      <polygon points={areaPoints} fill={stroke} fillOpacity={0.12} stroke="none" />
      <polyline
        points={linePoints}
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * MetricCard — value + status badge + trend + sparkline
 * ------------------------------------------------------------------ */

function MetricCard({ metric }: { metric: AnalyticsMetric }) {
  const trendGlyph = metric.trend === "up" ? "↑" : metric.trend === "down" ? "↓" : "→";

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-[color:var(--border-subtle)] bg-surface-one p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-text-secondary text-sm font-medium">{metric.label}</p>
        <StatusBadge severity={metric.status} label={STATUS_LABEL[metric.status]} />
      </div>

      <div className="flex items-end justify-between gap-2">
        <div className="flex items-baseline gap-1">
          <span className="text-text-primary text-2xl font-semibold tabular-nums">
            {formatValue(metric.value)}
          </span>
          {metric.unit ? <span className="text-text-muted text-sm">{metric.unit}</span> : null}
        </div>
        <span
          className="text-text-muted text-sm tabular-nums"
          aria-label={`trend ${metric.trend}`}
        >
          <span aria-hidden>{trendGlyph}</span>
          <span className="sr-only">trend {metric.trend}</span>
        </span>
      </div>

      {metric.series && metric.series.length > 0 ? (
        <Sparkline series={metric.series} status={metric.status} />
      ) : null}

      <div className="flex items-center justify-between gap-2">
        <MonoMetadata value={metric.metricId} muted />
        <span className="text-text-muted text-xs">last {metric.timeframe}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Page
 * ------------------------------------------------------------------ */

interface AnalyticsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const params = await searchParams;
  const role = resolveStateParam(params, "role", "owner") as RolePreset;
  const variant = resolveStateParam(params, "state", "metrics");

  const canView =
    roleHasCapability(role, CAPABILITIES.analyticsView) && !isSectionHidden(role, "analytics");

  if (!canView) {
    return (
      <WorkspaceContent>
        <StateBanner
          severity="danger"
          icon={BarChart3}
          title="Restricted"
          message={`The ${role} role cannot view analytics. Switch the role preset to owner, admin, editor, reviewer, or viewer to preview.`}
        />
      </WorkspaceContent>
    );
  }

  const operationalMetrics = mockAnalyticsMetrics.filter((metric) =>
    metric.metricId.startsWith("m_capture") ||
    metric.metricId.startsWith("m_generation") ||
    metric.metricId.startsWith("m_qa") ||
    metric.metricId.startsWith("m_provider") ||
    metric.metricId.startsWith("m_b2") ||
    metric.metricId.startsWith("m_dlq") ||
    metric.metricId.startsWith("m_cost"),
  );
  const mediaMetrics = mockAnalyticsMetrics.filter((metric) =>
    ["m_published", "m_shares", "m_clicks"].includes(metric.metricId),
  );

  const templateRows = mockTemplates.map((template) => ({
    template,
    score: deterministicScore(template.templateId),
    published: deterministicCount(template.templateId),
  }));

  const isEmpty = variant === "empty";

  return (
    <WorkspaceContent>
      <PageHeader
        eyebrow="Seeded analytics · no live services"
        title="Analytics"
        description="Operational and media performance metrics from seeded demo data."
        actions={
          <StateSwitcher
            options={[...STATE_VARIANTS]}
            defaultValue="metrics"
            label="Preview state"
          />
        }
      />

      {isEmpty ? (
        <StateBanner
          severity="neutral"
          icon={BarChart3}
          title="No analytics yet"
          message="Operational and media metrics will appear here once the workspace has captured, generated, and published moments. Switch to the Metrics preview to explore seeded demo data."
        />
      ) : (
        <>
          <Section
            title="Operational metrics"
            description="Capture, generation, QA, provider, B2, DLQ, and cost health."
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {operationalMetrics.map((metric) => (
                <MetricCard key={metric.metricId} metric={metric} />
              ))}
            </div>
          </Section>

          <Section
            title="Media metrics"
            description="Published output reach and engagement."
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {mediaMetrics.map((metric) => (
                <MetricCard key={metric.metricId} metric={metric} />
              ))}
            </div>
          </Section>

          <Section
            title="Template performance"
            description="Seeded publish performance per enhancement template."
          >
            <div className="rounded-lg border border-[color:var(--border-subtle)] bg-surface-one">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-text-muted">Template</TableHead>
                    <TableHead className="text-text-muted">Version</TableHead>
                    <TableHead className="text-text-muted">Provider</TableHead>
                    <TableHead className="text-text-muted">Status</TableHead>
                    <TableHead className="text-text-muted text-right">Published</TableHead>
                    <TableHead className="text-text-muted">Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templateRows.map(({ template, score, published }) => (
                    <TableRow key={template.templateId}>
                      <TableCell className="text-text-primary font-medium">
                        {template.name}
                      </TableCell>
                      <TableCell>
                        <span data-mono className="font-mono text-text-secondary text-xs">
                          {template.version}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span data-mono className="font-mono text-text-secondary text-xs">
                          {template.provider}
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          severity={TEMPLATE_STATUS_SEVERITY[template.status]}
                          label={template.status}
                        />
                      </TableCell>
                      <TableCell className="text-text-secondary text-right tabular-nums">
                        {published}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-two">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${score}%`, background: barColor(score) }}
                            />
                          </div>
                          <span className="text-text-secondary text-xs tabular-nums">
                            {score}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Section>

          <p className="text-text-muted text-xs">
            Seeded demo metrics · no live services · charts use semantic status colors only.
          </p>
        </>
      )}
    </WorkspaceContent>
  );
}
