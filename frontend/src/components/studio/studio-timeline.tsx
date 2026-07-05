/**
 * Live Studio candidate progress cards + bottom timeline (US3).
 *
 * Server-component safe: pure presentation, no hooks or handlers. The progress chain and
 * timeline markers always carry a text equivalent (label + status word), never color or motion
 * alone. Any pulse/processing animation uses `motion-safe:` so reduced-motion disables it.
 *
 * Provenance-aware: candidate cards trace to seeded moments, signals, and generation runs.
 * Dark-only, tokens only, no glow/blur/aura.
 */

import * as React from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import type {
  GenerationRunRef,
  MockMoment,
  ProductFactStatus,
  Severity,
} from "@/lib/screen-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonoMetadata, StatusBadge } from "@/components/common/status-primitives";

/* ------------------------------------------------------------------ *
 * Progress chain — Signal → Review ready
 * ------------------------------------------------------------------ */

export interface StudioStep {
  id: string;
  label: string;
  /** Short text equivalent shown under the marker. */
  short: string;
}

/** The canonical capture → review progress chain. */
export const STUDIO_STEPS: StudioStep[] = [
  { id: "signal", label: "Signal detected", short: "Signal" },
  { id: "candidate", label: "Candidate proposed", short: "Candidate" },
  { id: "capture_authorized", label: "Capture authorized", short: "Capture" },
  { id: "raw_uploaded", label: "Raw uploaded", short: "Raw" },
  { id: "enhancing", label: "Genblaze enhancing", short: "Enhance" },
  { id: "qa", label: "QA", short: "QA" },
  { id: "review_ready", label: "Review ready", short: "Review" },
];

type StepStatus = "done" | "active" | "pending" | "failed";

const STEP_STATUS_LABEL: Record<StepStatus, string> = {
  done: "Done",
  active: "In progress",
  pending: "Pending",
  failed: "Failed",
};

const STEP_STATUS_SEVERITY: Record<StepStatus, Severity> = {
  done: "success",
  active: "processing",
  pending: "neutral",
  failed: "danger",
};

function resolveStepStatus(
  index: number,
  activeIndex: number,
  failed: boolean,
): StepStatus {
  if (index < activeIndex) return "done";
  if (index === activeIndex) return failed ? "failed" : "active";
  return "pending";
}

export interface ProgressChainProps {
  /** The active step id (the step currently in progress / where it stopped). */
  activeStepId: string;
  /** Whether the active step is in a failed state. */
  failed?: boolean;
  className?: string;
}

/**
 * Horizontal capture→review progress chain. Each marker has a visible label and a status word
 * (text equivalent), so progress never relies on color or animation alone.
 */
export function ProgressChain({ activeStepId, failed = false, className }: ProgressChainProps) {
  const activeIndex = Math.max(
    0,
    STUDIO_STEPS.findIndex((step) => step.id === activeStepId),
  );

  return (
    <ol
      className={cn(
        "flex w-full gap-2 overflow-x-auto",
        "scrollbar-none",
        className,
      )}
      aria-label="Capture to review progress"
    >
      {STUDIO_STEPS.map((step, index) => {
        const status = resolveStepStatus(index, activeIndex, failed);
        const sev = STEP_STATUS_SEVERITY[status];
        return (
          <li key={step.id} className="flex min-w-[88px] flex-1 flex-col gap-1.5">
            <span
              aria-hidden
              className={cn(
                "h-1 rounded-full",
                status === "done" && "bg-[color:var(--success)]",
                status === "active" && "bg-primary motion-safe:animate-pulse",
                status === "failed" && "bg-[color:var(--danger)]",
                status === "pending" && "bg-[color:var(--neutral-bg)]",
              )}
            />
            <div className="flex flex-col gap-0.5">
              <span className="text-text-secondary text-xs font-medium">{step.short}</span>
              <StatusBadge
                label={STEP_STATUS_LABEL[status]}
                severity={sev}
                spin={status === "active"}
              />
            </div>
            <span className="sr-only">
              {step.label}: {STEP_STATUS_LABEL[status]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------------------------------------------ *
 * Candidate progress card
 * ------------------------------------------------------------------ */

const FACT_STATUS_SEVERITY: Record<ProductFactStatus, Severity> = {
  valid: "success",
  changed: "warning",
  "review-required": "warning",
  blocked: "danger",
};

export interface CandidateCardProps {
  moment: MockMoment;
  /** The step the moment is currently at, for the inline progress chain. */
  activeStepId: string;
  failed?: boolean;
  /** Failed generation run (provider error), surfaced when the moment failed. */
  failedRun?: GenerationRunRef;
  className?: string;
}

/** A single candidate/in-flight moment with its progress chain, evidence, and AI explanation. */
export function CandidateCard({
  moment,
  activeStepId,
  failed = false,
  failedRun,
  className,
}: CandidateCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            aria-hidden
            className="size-1.5 rounded-full"
            style={{ background: "var(--gradient-spectral-pastel)" }}
          />
          <CardTitle className="text-sm">{moment.momentType.replace(/_/g, " ")}</CardTitle>
          <StatusBadge label={moment.state.replace(/_/g, " ")} severity={failed ? "danger" : "info"} />
          <span className="text-text-muted text-xs tabular-nums">
            score {moment.score.toFixed(2)}
          </span>
        </div>
        <MonoMetadata label="moment_id" value={moment.momentId} muted truncate />
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <ProgressChain activeStepId={activeStepId} failed={failed} />

        <div className="flex flex-col gap-1">
          <span className="text-text-muted text-xs font-medium tracking-wide uppercase">
            Why this moment
          </span>
          <p className="text-text-secondary text-sm">{moment.aiExplanation}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-text-muted text-xs">{moment.evidenceSummary}</span>
          <StatusBadge
            label={`facts: ${moment.productFactStatus}`}
            severity={FACT_STATUS_SEVERITY[moment.productFactStatus]}
          />
        </div>

        {failed && failedRun ? (
          <div className="bg-[color:var(--danger-bg)] flex flex-col gap-1 rounded-lg border border-[color:var(--danger-border)] p-3">
            <span className="text-[color:var(--danger)] inline-flex items-center gap-1.5 text-sm font-medium">
              <Sparkles aria-hidden className="size-3.5" />
              Generation failed
            </span>
            <p className="text-text-secondary text-xs">{failedRun.errorMessage}</p>
            <MonoMetadata label="error_code" value={failedRun.errorCode ?? "UNKNOWN"} muted />
            <MonoMetadata label="generation_run_id" value={failedRun.generationRunId} muted truncate />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ *
 * Bottom timeline (signal markers along the session)
 * ------------------------------------------------------------------ */

const SIGNAL_TICK_SEVERITY: Record<Severity, string> = {
  neutral: "bg-[color:var(--neutral)]",
  info: "bg-[color:var(--processing)]",
  processing: "bg-primary",
  success: "bg-[color:var(--success)]",
  warning: "bg-[color:var(--warning)]",
  danger: "bg-[color:var(--danger)]",
};

export interface TimelineMarker {
  id: string;
  label: string;
  timelineMs: number;
  severity: Severity;
}

function formatTimecode(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export interface StudioTimelineProps {
  markers: TimelineMarker[];
  /** Total session duration for marker positioning. */
  durationMs: number;
  className?: string;
}

/**
 * Bottom session timeline. Each signal marker has a visible label + timecode (text equivalent)
 * in the legend below, so markers never depend on position/color alone.
 */
export function StudioTimeline({ markers, durationMs, className }: StudioTimelineProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Session timeline</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div
          className="bg-surface-one relative h-8 w-full rounded-md border border-[color:var(--border-subtle)]"
          role="img"
          aria-label="Signal markers along the session timeline"
        >
          {markers.map((marker) => {
            const left = durationMs === 0 ? 0 : Math.min(98, (marker.timelineMs / durationMs) * 100);
            return (
              <span
                key={marker.id}
                aria-hidden
                title={`${marker.label} · ${formatTimecode(marker.timelineMs)}`}
                className={cn(
                  "absolute top-1 bottom-1 w-0.5 rounded-full",
                  SIGNAL_TICK_SEVERITY[marker.severity],
                )}
                style={{ left: `${left}%` }}
              />
            );
          })}
        </div>

        {/* Text-equivalent legend */}
        <ul className="flex flex-col gap-1.5">
          {markers.map((marker) => (
            <li key={marker.id} className="flex items-center gap-2 text-xs">
              <span
                aria-hidden
                className={cn("size-2 shrink-0 rounded-full", SIGNAL_TICK_SEVERITY[marker.severity])}
              />
              <span className="text-text-muted font-mono tabular-nums">
                {formatTimecode(marker.timelineMs)}
              </span>
              <span className="text-text-secondary">{marker.label}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
