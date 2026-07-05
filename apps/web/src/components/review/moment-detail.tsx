"use client";

/**
 * Moment Detail tab shell (US4).
 *
 * Client component: hosts the Preview / Compare / Evidence / Product facts / QA / Provenance /
 * Versions / Publish tabs and a UI-only action bar (approve, compare, rerender, reject) whose
 * disabled affordances always explain why. Receives a fully assembled, serializable moment
 * bundle from the server route. No fetch, no mutation, no backend — actions only toggle local
 * presentation. Provenance disclosure can be switched between normal/reviewer/admin to show the
 * tiered proof model.
 */

import * as React from "react";
import {
  Check,
  GitCompareArrows,
  RefreshCw,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { MomentBundle } from "@/lib/mock-data";
import type {
  DisabledAction,
  DisclosureLevel,
  ProductFactStatus,
  QaStatus,
  ReviewItem,
  Severity,
  SignalEvent,
} from "@/lib/screen-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MediaPlaceholder, TechnicalProof } from "@/components/common/media-primitives";
import {
  DisabledReason,
  MonoMetadata,
  StateBanner,
  StatusBadge,
} from "@/components/common/status-primitives";
import { LineageChain, ProvenanceGraph } from "@/components/provenance/provenance-components";
import { ComparePanel, type CompareMeta } from "@/components/review/compare-panel";
import { PublishPanel } from "@/components/review/publish-panel";

/* ------------------------------------------------------------------ *
 * Status → severity mapping
 * ------------------------------------------------------------------ */

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

const CLAIM_SEVERITY: Record<string, Severity> = {
  active: "success",
  expired: "neutral",
  blocked: "danger",
  "review-required": "warning",
};

function titleCase(value: string): string {
  return value.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatMs(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/* ------------------------------------------------------------------ *
 * Action bar
 * ------------------------------------------------------------------ */

const ACTION_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  approve: Check,
  compare: GitCompareArrows,
  rerender: RefreshCw,
  retry: RefreshCw,
  reject: X,
};

function ActionButton({
  action,
  variant = "outline",
}: {
  action: string;
  variant?: "default" | "outline";
}) {
  const Icon = ACTION_ICON[action];
  return (
    <Button type="button" variant={variant}>
      {Icon ? <Icon aria-hidden /> : null}
      {titleCase(action)}
    </Button>
  );
}

function ActionBar({ reviewItem }: { reviewItem?: ReviewItem }) {
  if (!reviewItem) return null;
  const disabled: DisabledAction[] = reviewItem.disabledActionReasons;

  return (
    <div className="flex flex-wrap items-end gap-3">
      <ActionButton action={reviewItem.primaryAction} variant="default" />
      {reviewItem.secondaryActions.map((action) => (
        <ActionButton key={action} action={action} />
      ))}
      {disabled.map((entry) => {
        const Icon = ACTION_ICON[entry.action];
        return (
          <DisabledReason key={entry.action} reason={entry.reason}>
            <Button disabled aria-disabled variant="outline">
              {Icon ? <Icon aria-hidden /> : null}
              {titleCase(entry.action)}
            </Button>
          </DisabledReason>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Tab panels
 * ------------------------------------------------------------------ */

function PreviewPanel({ bundle }: { bundle: MomentBundle }) {
  const { moment, assets, lineage, product, campaign } = bundle;
  const canonical =
    assets.find((a) => a.assetId === moment.canonicalAssetId) ??
    assets.find((a) => a.role === "enhanced_master") ??
    assets[0];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <MediaPlaceholder
          kind={canonical?.previewKind ?? "video"}
          aspect="16:9"
          label={`Enhanced preview — ${moment.momentType}`}
          caption={canonical?.role ?? "preview"}
        />
      </div>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Moment summary</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge label={titleCase(moment.momentType)} severity="info" />
            <span className="text-text-muted text-xs tabular-nums">
              {Math.round(moment.score * 100)}% score
            </span>
          </div>
          <p className="text-text-secondary text-sm">{moment.aiExplanation}</p>
          <Separator />
          <div className="flex flex-col gap-1 text-xs">
            {product ? <MonoMetadata label="product" value={product.name} /> : null}
            {campaign ? <MonoMetadata label="campaign" value={campaign.name} /> : null}
            <MonoMetadata label="clip" value={`${formatMs(moment.startMs)}–${formatMs(moment.endMs)}`} />
          </div>
          <Separator />
          <LineageChain nodes={lineage} />
        </CardContent>
      </Card>
    </div>
  );
}

function ComparePanelTab({ bundle }: { bundle: MomentBundle }) {
  const { moment, assets } = bundle;
  const raw =
    assets.find((a) => a.role === "raw_mezzanine") ?? assets.find((a) => a.role === "raw_source");
  const enhanced = assets.find((a) => a.role === "enhanced_master");
  const published = assets.find((a) => a.role === "publish_variant");

  const meta: CompareMeta = {
    duration: formatMs(moment.endMs - moment.startMs),
    sourceRange: `${formatMs(moment.rawCaptureStartMs)}–${formatMs(moment.rawCaptureEndMs)}`,
    finalTrim: `${formatMs(moment.startMs)}–${formatMs(moment.endMs)}`,
    captions: assets.some((a) => a.role === "captions") ? "Generated (grounded)" : "None",
    productCard: bundle.product?.name ?? "—",
    restyle: "None — product appearance preserved",
  };

  return <ComparePanel raw={raw} enhanced={enhanced} published={published} meta={meta} />;
}

function EvidencePanel({
  bundle,
  signals,
}: {
  bundle: MomentBundle;
  signals: SignalEvent[];
}) {
  const { moment } = bundle;
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Why this moment</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <p className="text-text-secondary text-sm">{moment.selectionReason}</p>
          <p className="text-text-muted text-xs">{moment.evidenceSummary}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Signals</CardTitle>
        </CardHeader>
        <CardContent>
          {signals.length === 0 ? (
            <p className="text-text-muted text-sm">No signal evidence recorded for this moment.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {signals.map((signal) => (
                <li key={signal.signalId} className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge
                      label={signal.type.replace(/_/g, " ")}
                      severity={signal.severity}
                    />
                    <span className="text-text-muted text-xs tabular-nums">
                      {Math.round(signal.confidence * 100)}% confidence
                    </span>
                  </div>
                  <p className="text-text-secondary text-xs">{signal.reason}</p>
                  <div className="flex flex-wrap gap-x-3">
                    {signal.evidenceRefs.map((ref) => (
                      <MonoMetadata key={ref} value={ref} muted />
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FactsPanel({ bundle }: { bundle: MomentBundle }) {
  const { moment, product } = bundle;
  return (
    <div className="flex flex-col gap-4">
      {moment.productFactStatus !== "valid" ? (
        <StateBanner
          title={`Product facts: ${titleCase(moment.productFactStatus)}`}
          message={
            moment.productFactStatus === "blocked"
              ? "Generated copy asserts a fact not supported by the catalog snapshot. Publishing is blocked until resolved."
              : "Generated copy contains a claim that needs review before publish."
          }
          severity={FACT_SEVERITY[moment.productFactStatus]}
        />
      ) : (
        <StateBanner
          title="Product facts valid"
          message="All on-screen and caption claims map to grounded catalog/campaign facts."
          severity="success"
        />
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Allowed claims</CardTitle>
        </CardHeader>
        <CardContent>
          {!product || product.allowedClaims.length === 0 ? (
            <p className="text-text-muted text-sm">No grounded claims for this product.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {product.allowedClaims.map((claim) => (
                <li key={claim.claimId} className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-text-secondary text-sm">{claim.claimText}</span>
                    <StatusBadge
                      label={titleCase(claim.status)}
                      severity={CLAIM_SEVERITY[claim.status] ?? "neutral"}
                    />
                  </div>
                  <MonoMetadata
                    label="source"
                    value={`${claim.source} · ${claim.supportingField} · risk:${claim.risk}`}
                    muted
                  />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function QaPanel({ bundle }: { bundle: MomentBundle }) {
  const { moment, qa } = bundle;
  if (!qa) {
    return (
      <StateBanner
        title="QA not started"
        message="No QA result has been recorded for this moment yet."
        severity="neutral"
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-sm">QA result</CardTitle>
            <StatusBadge label={titleCase(qa.status)} severity={QA_SEVERITY[qa.status]} />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {qa.blockers.length > 0 ? (
            <StateBanner
              title="Resolve before approval"
              message={qa.blockers.join(" ")}
              severity="warning"
            />
          ) : null}
          <ul className="flex flex-col gap-2">
            {qa.checks.map((check) => (
              <li key={check.checkId} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-text-secondary text-sm">{check.label}</p>
                  <p className="text-text-muted text-xs">{check.detail}</p>
                </div>
                <StatusBadge label={titleCase(check.status)} severity={QA_SEVERITY[check.status]} />
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {moment.qaStatus === "review_required" || moment.qaStatus === "failed" ? (
        <DisabledReason reason="QA review required — approval is disabled until QA passes or is overridden.">
          <Button disabled aria-disabled>
            <Check aria-hidden />
            Approve for publish
          </Button>
        </DisabledReason>
      ) : null}
    </div>
  );
}

function ProvenancePanel({ bundle }: { bundle: MomentBundle }) {
  const { lineage } = bundle;
  const [disclosure, setDisclosure] = React.useState<DisclosureLevel>("admin");
  const levels: DisclosureLevel[] = ["normal", "reviewer", "admin"];

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Compact lineage</CardTitle>
        </CardHeader>
        <CardContent>
          <LineageChain nodes={lineage} condensed={false} />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-1.5">
        <span className="text-text-muted text-xs font-medium">Disclosure level</span>
        <div
          role="group"
          aria-label="Provenance disclosure level"
          className="bg-surface-one inline-flex w-fit gap-1 rounded-lg border border-[color:var(--border-subtle)] p-1"
        >
          {levels.map((level) => {
            const selected = level === disclosure;
            return (
              <button
                key={level}
                type="button"
                aria-pressed={selected}
                onClick={() => setDisclosure(level)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors",
                  "focus-visible:ring-ring/50 outline-none focus-visible:ring-2",
                  selected
                    ? "bg-primary text-primary-foreground"
                    : "text-text-secondary hover:bg-surface-two hover:text-text-primary",
                )}
              >
                {level}
              </button>
            );
          })}
        </div>
        <p className="text-text-muted text-xs">
          Normal sees a summary; reviewers see asset/run IDs; admins also see B2 keys and checksums.
        </p>
      </div>

      <ProvenanceGraph nodes={lineage} disclosure={disclosure} />
    </div>
  );
}

function VersionsPanel({ bundle }: { bundle: MomentBundle }) {
  const { assets, generationRuns } = bundle;
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Generation runs</CardTitle>
        </CardHeader>
        <CardContent>
          {generationRuns.length === 0 ? (
            <p className="text-text-muted text-sm">No generation runs recorded.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {generationRuns.map((run) => (
                <li
                  key={run.generationRunId}
                  className="bg-surface-one/60 flex flex-col gap-1.5 rounded-lg border border-[color:var(--border-subtle)] p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-text-primary text-sm font-medium">
                      {titleCase(run.runType)} · {run.provider}
                    </span>
                    <StatusBadge
                      label={titleCase(run.status)}
                      severity={
                        run.status === "completed"
                          ? "success"
                          : run.status === "failed"
                            ? "danger"
                            : "processing"
                      }
                    />
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    <MonoMetadata label="id" value={run.generationRunId} muted truncate />
                    <MonoMetadata label="model" value={run.model} muted />
                    <MonoMetadata label="template" value={`${run.templateId}@${run.templateVersion}`} muted />
                    <MonoMetadata
                      label="cost"
                      value={`$${(run.actualCostUsd ?? run.estimatedCostUsd).toFixed(2)}`}
                    />
                  </div>
                  {run.errorMessage ? (
                    <p className="text-[color:var(--danger)] text-xs">{run.errorMessage}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Asset versions</CardTitle>
        </CardHeader>
        <CardContent>
          {assets.length === 0 ? (
            <p className="text-text-muted text-sm">No assets recorded for this moment.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {assets.map((asset) => (
                <TechnicalProof key={asset.assetId} asset={asset} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * MomentDetail
 * ------------------------------------------------------------------ */

const TABS = [
  { value: "preview", label: "Preview" },
  { value: "compare", label: "Compare" },
  { value: "evidence", label: "Evidence" },
  { value: "facts", label: "Product facts" },
  { value: "qa", label: "QA" },
  { value: "provenance", label: "Provenance" },
  { value: "versions", label: "Versions" },
  { value: "publish", label: "Publish" },
] as const;

export interface MomentDetailProps {
  bundle: MomentBundle;
  signals?: SignalEvent[];
  reviewItem?: ReviewItem;
  shareSlug?: string;
  className?: string;
}

export function MomentDetail({
  bundle,
  signals = [],
  reviewItem,
  shareSlug,
  className,
}: MomentDetailProps) {
  const { moment, publishPackage } = bundle;
  const factsChanged = moment.productFactStatus === "changed";

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <ActionBar reviewItem={reviewItem} />

      <Tabs defaultValue="preview">
        <div className="-mx-1 overflow-x-auto px-1">
          <TabsList variant="line" className="w-max">
            {TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="preview">
          <PreviewPanel bundle={bundle} />
        </TabsContent>
        <TabsContent value="compare">
          <ComparePanelTab bundle={bundle} />
        </TabsContent>
        <TabsContent value="evidence">
          <EvidencePanel bundle={bundle} signals={signals} />
        </TabsContent>
        <TabsContent value="facts">
          <FactsPanel bundle={bundle} />
        </TabsContent>
        <TabsContent value="qa">
          <QaPanel bundle={bundle} />
        </TabsContent>
        <TabsContent value="provenance">
          <ProvenancePanel bundle={bundle} />
        </TabsContent>
        <TabsContent value="versions">
          <VersionsPanel bundle={bundle} />
        </TabsContent>
        <TabsContent value="publish">
          <PublishPanel
            pkg={publishPackage}
            factsChanged={factsChanged}
            shareSlug={shareSlug}
            provenanceVisible
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
