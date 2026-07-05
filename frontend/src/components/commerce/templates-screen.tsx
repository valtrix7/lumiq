/**
 * Templates screen (US6 — Safe enhancement templates).
 *
 * Presentational, server-component safe (no hooks / event handlers). Renders the template list and
 * per-template detail: a typed safe step graph, allowed vs blocked creative controls, version and
 * status, an appearance-lock indicator, and the provider policy summary (including the
 * provider-unavailable state). Templates only expose appearance-preserving controls — controls
 * that could change product color/material/shape render as blocked.
 *
 * UI-only — no fetch, no mutation. Dark-only, tokens only.
 */

import * as React from "react";
import {
  ArrowRight,
  Ban,
  CheckCircle2,
  Lock,
  ServerCog,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type {
  CreativeControl,
  MockTemplate,
  Readiness,
  Severity,
  TemplateStatus,
  TemplateStep,
} from "@/lib/screen-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  MonoMetadata,
  StateBanner,
  StatusBadge,
} from "@/components/common/status-primitives";

/* ------------------------------------------------------------------ *
 * Status mapping
 * ------------------------------------------------------------------ */

const TEMPLATE_SEVERITY: Record<TemplateStatus, Severity> = {
  active: "success",
  draft: "neutral",
  deprecated: "warning",
  "provider-unavailable": "danger",
};

const TEMPLATE_LABEL: Record<TemplateStatus, string> = {
  active: "Active",
  draft: "Draft",
  deprecated: "Deprecated",
  "provider-unavailable": "Provider unavailable",
};

const READINESS_SEVERITY: Record<Readiness, Severity> = {
  ready: "success",
  mocked: "info",
  missing: "danger",
  degraded: "warning",
};

/* ------------------------------------------------------------------ *
 * Step graph (typed, safe)
 * ------------------------------------------------------------------ */

export function StepGraph({ steps }: { steps: TemplateStep[] }) {
  return (
    <ol
      aria-label="Template step graph"
      className="flex flex-col gap-2"
    >
      {steps.map((step, index) => (
        <li key={step.stepId} className="flex flex-col">
          <div className="bg-surface-one/60 flex items-start gap-3 rounded-lg border border-[color:var(--border-subtle)] p-3">
            <span className="text-text-muted mt-0.5 shrink-0 text-xs font-medium tabular-nums">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-text-primary text-sm font-medium">{step.label}</span>
                <MonoMetadata label="kind" value={step.kind} muted />
                {step.safe ? (
                  <StatusBadge label="Appearance-safe" severity="success" />
                ) : (
                  <StatusBadge label="Review-gated" severity="warning" />
                )}
              </div>
              <p className="text-text-muted mt-0.5 text-xs">{step.detail}</p>
            </div>
          </div>
          {index < steps.length - 1 ? (
            <span aria-hidden className="text-text-faint flex justify-center py-0.5">
              <ArrowRight className="size-4 rotate-90" />
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

/* ------------------------------------------------------------------ *
 * Creative controls (allowed vs blocked)
 * ------------------------------------------------------------------ */

export function CreativeControlRow({ control }: { control: CreativeControl }) {
  const Icon = control.allowed ? CheckCircle2 : Ban;
  return (
    <li className="flex items-start gap-2">
      <Icon
        aria-hidden
        className={cn(
          "mt-0.5 size-3.5 shrink-0",
          control.allowed ? "text-[color:var(--success)]" : "text-[color:var(--danger)]",
        )}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-text-secondary text-sm">{control.label}</span>
          <StatusBadge
            label={control.allowed ? "Allowed" : "Blocked"}
            severity={control.allowed ? "success" : "danger"}
          />
        </div>
        <p className="text-text-muted mt-0.5 text-xs">{control.detail}</p>
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ *
 * Template card (list + detail)
 * ------------------------------------------------------------------ */

export function TemplateCard({ template }: { template: MockTemplate }) {
  const unavailable = template.status === "provider-unavailable";

  return (
    <Card className="flex flex-col">
      <CardHeader className="border-b">
        <div className="flex flex-wrap items-center gap-2">
          <Sparkles aria-hidden className="text-text-muted size-4" />
          <CardTitle className="text-base">{template.name}</CardTitle>
          <StatusBadge
            label={TEMPLATE_LABEL[template.status]}
            severity={TEMPLATE_SEVERITY[template.status]}
          />
          <StatusBadge label={template.version} severity="neutral" />
        </div>
        <div className="text-text-muted flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span>{template.category}</span>
          <MonoMetadata label="template_id" value={template.templateId} muted />
          <MonoMetadata label="step_graph" value={template.stepGraphId} muted />
        </div>
        <p className="text-text-secondary mt-1 text-sm">{template.description}</p>
        {template.appearanceLocked ? (
          <span className="text-text-muted inline-flex w-fit items-center gap-1 text-xs">
            <Lock aria-hidden className="size-3" />
            Appearance lock: product color, material, and shape are never altered.
          </span>
        ) : null}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        {unavailable ? (
          <StateBanner
            title="Provider unavailable"
            message="This template's generation provider is degraded. The template is disabled for sessions until provider readiness returns."
            severity="danger"
            icon={ServerCog}
          />
        ) : null}

        {/* Step graph */}
        <div className="flex flex-col gap-2">
          <span className="text-text-muted text-xs font-medium tracking-wide uppercase">
            Safe step graph
          </span>
          <StepGraph steps={template.steps} />
        </div>

        {/* Allowed creative controls */}
        <div className="flex flex-col gap-2">
          <span className="text-text-muted text-xs font-medium tracking-wide uppercase">
            Creative controls
          </span>
          <ul className="flex flex-col gap-1.5">
            {template.allowedControls.map((control) => (
              <CreativeControlRow key={control.controlId} control={control} />
            ))}
          </ul>
        </div>

        <Separator />

        {/* Provider policy */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-text-muted text-xs font-medium tracking-wide uppercase">
              Provider policy
            </span>
            <MonoMetadata label="provider" value={template.provider} />
            <span className="inline-flex items-center gap-1 text-xs">
              <span className="text-text-muted">readiness</span>
              <StatusBadge
                label={template.providerReadiness}
                severity={READINESS_SEVERITY[template.providerReadiness]}
              />
            </span>
          </div>
          <p className="text-text-secondary text-xs">{template.providerPolicy}</p>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ *
 * Empty state + composed screen
 * ------------------------------------------------------------------ */

export function TemplatesEmptyState() {
  return (
    <StateBanner
      title="No templates yet"
      message="Publish a safe enhancement template to define the typed step graph and allowed creative controls available to generation."
      severity="neutral"
      icon={Sparkles}
    />
  );
}

export function TemplatesScreen({ templates }: { templates: MockTemplate[] }) {
  if (templates.length === 0) {
    return <TemplatesEmptyState />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:items-start">
        {templates.map((template) => (
          <TemplateCard key={template.templateId} template={template} />
        ))}
      </div>
      <p className="text-text-muted text-xs">
        Templates only expose appearance-preserving controls. Steps that could change product color,
        material, shape, or buyer expectations are never present, and restricted controls are
        blocked or routed to human review.
      </p>
    </div>
  );
}
