/**
 * Judge-facing demo proof modules: Mastra recommendation, Genblaze generation run, Backblaze
 * B2 storage proof, product-claim grounding, QA, and the full provenance graph for the golden
 * -path moment. Every claim is backed by seeded contract-shaped fixtures — no live services.
 *
 * Dark-only; technical identifiers render in mono. Disclosure is set to "admin" here on purpose:
 * this is a proof surface meant to expose B2 keys, checksums, and trace/run IDs to a reviewer.
 * Server-component safe; scroll motion isolated to <Reveal>.
 */

import * as React from "react";
import {
  Boxes,
  CircleDollarSign,
  FileCheck2,
  Sparkles,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  MonoMetadata,
  StatusBadge,
} from "@/components/common/status-primitives";
import { MediaPlaceholder, TechnicalProof } from "@/components/common/media-primitives";
import {
  LineageChain,
  ProvenanceGraph,
} from "@/components/provenance/provenance-components";
import { Reveal } from "@/components/marketing/reveal";
import type { AllowedClaim, QaStatus, Severity, SignalEvent } from "@/lib/screen-types";
import {
  ASTER_CROSSBODY_CLAIMS,
  DEMO_MOMENT_ID,
  DEMO_SESSION_ID,
  getAsset,
  getMomentBundle,
  mockQaSummaries,
  mockSignals,
} from "@/lib/mock-data";

/* ------------------------------------------------------------------ *
 * Module shell
 * ------------------------------------------------------------------ */

function DemoModule({
  index,
  title,
  summary,
  children,
}: {
  index: number;
  title: string;
  summary: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-[color:var(--border-subtle)] py-12 first:border-t-0 first:pt-0">
      <Reveal>
        <div className="flex items-baseline gap-3">
          <span className="text-text-faint font-mono text-xs" data-mono>
            {String(index).padStart(2, "0")}
          </span>
          <div>
            <h2 className="text-text-primary text-xl font-semibold tracking-tight">{title}</h2>
            <p className="text-text-muted mt-1.5 max-w-2xl text-sm leading-relaxed">{summary}</p>
          </div>
        </div>
      </Reveal>
      <Reveal y={16} delay={0.05} className="mt-6">
        {children}
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Status mapping helpers
 * ------------------------------------------------------------------ */

function qaSeverity(status: QaStatus): Severity {
  switch (status) {
    case "passed":
    case "remediated":
      return "success";
    case "failed":
    case "terminal":
      return "danger";
    case "review_required":
      return "warning";
    case "running":
      return "processing";
    default:
      return "neutral";
  }
}

function claimSeverity(claim: AllowedClaim): Severity {
  if (claim.status === "blocked") return "danger";
  if (claim.status === "review-required") return "warning";
  if (claim.status === "expired") return "neutral";
  return claim.risk === "restricted" ? "info" : "success";
}

function claimLabel(claim: AllowedClaim): string {
  if (claim.status === "blocked") return "Blocked";
  if (claim.status === "review-required") return "Review";
  if (claim.status === "expired") return "Expired";
  return "Allowed";
}

/* ------------------------------------------------------------------ *
 * Overview — the moment this story is about
 * ------------------------------------------------------------------ */

function DemoOverview() {
  const bundle = getMomentBundle(DEMO_MOMENT_ID);
  if (!bundle) return null;

  return (
    <Reveal>
      <div className="bg-panel-black grid gap-6 rounded-2xl border border-[color:var(--border-subtle)] p-5 sm:grid-cols-[200px_1fr] sm:p-6">
        <MediaPlaceholder
          kind="video"
          aspect="9:16"
          label="Published vertical variant — Aster Crossbody"
          caption="Spring Drop reveal"
        />
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge label="Published" severity="info" />
            <StatusBadge label="QA passed" severity="success" />
            <StatusBadge label="Provenance verified" severity="success" />
          </div>
          <div>
            <h3 className="text-text-primary text-base font-semibold">
              {bundle.publishPackage?.title ?? "Aster Crossbody — Spring Drop reveal"}
            </h3>
            <p className="text-text-muted mt-1.5 text-sm leading-relaxed">
              {bundle.moment.aiExplanation}
            </p>
          </div>
          <LineageChain nodes={bundle.lineage} />
          <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-[color:var(--border-subtle)] pt-3">
            <MonoMetadata label="moment" value={bundle.moment.momentId} muted />
            <MonoMetadata label="session" value={DEMO_SESSION_ID} muted />
            <MonoMetadata label="score" value={bundle.moment.score.toFixed(2)} muted />
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ *
 * 01 — Mastra recommendation (signal feed → candidate)
 * ------------------------------------------------------------------ */

function SignalRow({ signal }: { signal: SignalEvent }) {
  return (
    <li className="flex items-start justify-between gap-3 border-b border-[color:var(--border-subtle)] py-3 last:border-b-0">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-text-primary text-sm font-medium">
            {signal.type.replace(/_/g, " ")}
          </span>
          <StatusBadge label={`conf ${signal.confidence.toFixed(2)}`} severity={signal.severity} />
        </div>
        <p className="text-text-muted mt-1 text-sm leading-relaxed">{signal.reason}</p>
      </div>
      <MonoMetadata value={`${(signal.timelineMs / 1000).toFixed(0)}s`} muted className="shrink-0" />
    </li>
  );
}

export function DemoMastraModule() {
  const signals = mockSignals.filter(
    (s) => s.sessionId === DEMO_SESSION_ID && s.momentId === DEMO_MOMENT_ID,
  );

  return (
    <DemoModule
      index={1}
      title="Mastra recommends — it never publishes"
      summary="A supervisor agent proposes candidate moments from co-occurring signals. The
      recommendation is advisory; Core API still authorizes the capture."
    >
      <div className="bg-surface-one/50 rounded-lg border border-[color:var(--border-subtle)] p-4 sm:p-5">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles aria-hidden className="text-text-secondary size-4" />
          <span className="text-text-secondary text-xs font-medium tracking-wide uppercase">
            Signal feed
          </span>
        </div>
        <ul>
          {signals.map((signal) => (
            <SignalRow key={signal.signalId} signal={signal} />
          ))}
        </ul>
      </div>
    </DemoModule>
  );
}

/* ------------------------------------------------------------------ *
 * 02 — Genblaze generation run
 * ------------------------------------------------------------------ */

export function DemoGenblazeModule() {
  const bundle = getMomentBundle(DEMO_MOMENT_ID);
  const run = bundle?.generationRuns[0];
  if (!run) return null;

  const rows: Array<{ label: string; value: string }> = [
    { label: "provider", value: run.provider },
    { label: "model", value: run.model },
    { label: "template", value: `${run.templateId} · ${run.templateVersion}` },
    { label: "step graph", value: run.stepGraphId },
    { label: "input", value: run.inputAssetId },
    { label: "output", value: run.outputAssetId ?? "—" },
  ];

  return (
    <DemoModule
      index={2}
      title="Genblaze generates inside a typed step graph"
      summary="A safe, typed generation run produces a polished master. The run records its
      template, model, cost, and the exact input and output assets — the source is never overwritten."
    >
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="bg-surface-one/50 flex flex-col gap-3 rounded-lg border border-[color:var(--border-subtle)] p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-text-primary inline-flex items-center gap-2 text-sm font-medium">
              <Wand2 aria-hidden className="text-text-secondary size-4" />
              Generation run
            </span>
            <StatusBadge label={run.status} severity="success" />
          </div>
          <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {rows.map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-3">
                <dt className="text-text-muted text-xs">{row.label}</dt>
                <dd>
                  <MonoMetadata value={row.value} muted truncate />
                </dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-wrap items-center gap-4 border-t border-[color:var(--border-subtle)] pt-3">
            <span className="text-text-secondary inline-flex items-center gap-1.5 text-sm">
              <CircleDollarSign aria-hidden className="text-text-muted size-4" />
              Est. ${run.estimatedCostUsd.toFixed(2)} · Actual $
              {(run.actualCostUsd ?? 0).toFixed(2)}
            </span>
            <MonoMetadata label="run" value={run.generationRunId} muted />
          </div>
        </div>
      </div>
    </DemoModule>
  );
}

/* ------------------------------------------------------------------ *
 * 03 — Backblaze B2 storage proof
 * ------------------------------------------------------------------ */

export function DemoB2Module() {
  const assetIds = [
    "asset_raw_aster_reveal",
    "asset_enhanced_aster_reveal",
    "asset_publish_aster_reveal_vertical",
    "asset_manifest_aster_reveal",
  ];
  const assets = assetIds.map((id) => getAsset(id)).filter((a): a is NonNullable<typeof a> => Boolean(a));

  return (
    <DemoModule
      index={3}
      title="Backblaze B2 stores media and proof"
      summary="Every canonical object lives under a tenant-scoped key with a SHA-256 checksum and a
      verification status. B2 holds media and manifests; Postgres tracks the truth that points to them."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {assets.map((asset) => (
          <div key={asset.assetId} className="flex flex-col gap-2">
            <MonoMetadata label="asset" value={asset.assetId} muted />
            <TechnicalProof asset={asset} />
          </div>
        ))}
      </div>
    </DemoModule>
  );
}

/* ------------------------------------------------------------------ *
 * 04 — Product-claim grounding
 * ------------------------------------------------------------------ */

export function DemoGroundingModule() {
  return (
    <DemoModule
      index={4}
      title="Product claims are grounded in allowed facts"
      summary="Captions and overlays may only use claims traceable to the catalog or campaign.
      An unsupported claim — like 'waterproof' — is blocked before it can ever publish."
    >
      <ul className="grid gap-2 sm:grid-cols-2">
        {ASTER_CROSSBODY_CLAIMS.map((claim) => (
          <li
            key={claim.claimId}
            className={cn(
              "bg-surface-one/50 flex items-start justify-between gap-3 rounded-lg border border-[color:var(--border-subtle)] p-4",
            )}
          >
            <div className="min-w-0">
              <p className="text-text-primary text-sm font-medium">{claim.claimText}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                <MonoMetadata label="source" value={claim.source} muted />
                <MonoMetadata label="field" value={claim.supportingField} muted />
              </div>
            </div>
            <StatusBadge label={claimLabel(claim)} severity={claimSeverity(claim)} className="shrink-0" />
          </li>
        ))}
      </ul>
    </DemoModule>
  );
}

/* ------------------------------------------------------------------ *
 * 05 — QA grounded in catalog snapshot
 * ------------------------------------------------------------------ */

export function DemoQaModule() {
  const passed = mockQaSummaries.find((q) => q.momentId === DEMO_MOMENT_ID);
  const review = mockQaSummaries.find((q) => q.status === "review_required");

  return (
    <DemoModule
      index={5}
      title="QA checks every claim, caption, and appearance"
      summary="A moment only becomes publish-ready when QA passes. When a check fails — like an
      unsupported claim — the moment is routed to review instead of published."
    >
      <div className="grid gap-3 lg:grid-cols-2">
        {passed ? (
          <div className="bg-surface-one/50 flex flex-col gap-3 rounded-lg border border-[color:var(--border-subtle)] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-text-primary inline-flex items-center gap-2 text-sm font-medium">
                <FileCheck2 aria-hidden className="text-text-secondary size-4" />
                Publish-ready moment
              </span>
              <StatusBadge label="passed" severity="success" />
            </div>
            <ul className="flex flex-col gap-2">
              {passed.checks.map((check) => (
                <li key={check.checkId} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-text-secondary text-sm">{check.label}</p>
                    <p className="text-text-muted text-xs">{check.detail}</p>
                  </div>
                  <StatusBadge
                    label={check.status.replace(/_/g, " ")}
                    severity={qaSeverity(check.status)}
                    className="shrink-0"
                  />
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {review ? (
          <div className="bg-surface-one/50 flex flex-col gap-3 rounded-lg border border-[color:var(--border-subtle)] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-text-primary inline-flex items-center gap-2 text-sm font-medium">
                <FileCheck2 aria-hidden className="text-text-secondary size-4" />
                Routed to review
              </span>
              <StatusBadge label="review required" severity="warning" />
            </div>
            <ul className="flex flex-col gap-2">
              {review.checks.map((check) => (
                <li key={check.checkId} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-text-secondary text-sm">{check.label}</p>
                    <p className="text-text-muted text-xs">{check.detail}</p>
                  </div>
                  <StatusBadge
                    label={check.status.replace(/_/g, " ")}
                    severity={qaSeverity(check.status)}
                    className="shrink-0"
                  />
                </li>
              ))}
            </ul>
            {review.blockers.length > 0 ? (
              <p className="text-[color:var(--warning)] text-xs">{review.blockers[0]}</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </DemoModule>
  );
}

/* ------------------------------------------------------------------ *
 * 06 — Full provenance graph
 * ------------------------------------------------------------------ */

export function DemoProvenanceModule() {
  const bundle = getMomentBundle(DEMO_MOMENT_ID);
  if (!bundle) return null;

  return (
    <DemoModule
      index={6}
      title="Provenance ties it all together"
      summary="The full graph links raw source, live transform, generation run, enhanced master,
      publish variant, and publish package — each with its B2 object key, checksum, and run IDs."
    >
      <div className="flex items-center gap-2">
        <Boxes aria-hidden className="text-text-secondary size-4" />
        <span className="text-text-muted text-xs">
          Shown at admin disclosure for this proof page — B2 keys and checksums visible.
        </span>
      </div>
      <div className="mt-4">
        <ProvenanceGraph nodes={bundle.lineage} disclosure="admin" />
      </div>
    </DemoModule>
  );
}

/* ------------------------------------------------------------------ *
 * Composed demo story
 * ------------------------------------------------------------------ */

export function DemoStory() {
  return (
    <div className="flex flex-col gap-10">
      <DemoOverview />
      <div>
        <DemoMastraModule />
        <DemoGenblazeModule />
        <DemoB2Module />
        <DemoGroundingModule />
        <DemoQaModule />
        <DemoProvenanceModule />
      </div>
    </div>
  );
}
