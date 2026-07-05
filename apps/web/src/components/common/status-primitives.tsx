/**
 * Reusable status, mono-metadata, disabled-reason, and state-banner primitives.
 *
 * Design rules: statuses are never color-only (always paired with an icon + label),
 * technical metadata renders in mono, and disabled controls always explain why.
 * Server-component safe (no hooks / event handlers).
 */

import * as React from "react";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  CircleDashed,
  Clock,
  Info,
  Loader2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { Severity } from "@/lib/screen-types";

/* ------------------------------------------------------------------ *
 * Severity styling
 * ------------------------------------------------------------------ */

type SeverityStyle = {
  text: string;
  bg: string;
  border: string;
  icon: React.ComponentType<{ className?: string }>;
};

const SEVERITY_STYLES: Record<Severity, SeverityStyle> = {
  neutral: {
    text: "text-[color:var(--neutral)]",
    bg: "bg-[color:var(--neutral-bg)]",
    border: "border-[color:var(--neutral-border)]",
    icon: CircleDashed,
  },
  info: {
    text: "text-[color:var(--processing)]",
    bg: "bg-[color:var(--processing-bg)]",
    border: "border-[color:var(--processing-border)]",
    icon: Info,
  },
  processing: {
    text: "text-[color:var(--processing)]",
    bg: "bg-[color:var(--processing-bg)]",
    border: "border-[color:var(--processing-border)]",
    icon: Loader2,
  },
  success: {
    text: "text-[color:var(--success)]",
    bg: "bg-[color:var(--success-bg)]",
    border: "border-[color:var(--success-border)]",
    icon: CheckCircle2,
  },
  warning: {
    text: "text-[color:var(--warning)]",
    bg: "bg-[color:var(--warning-bg)]",
    border: "border-[color:var(--warning-border)]",
    icon: AlertTriangle,
  },
  danger: {
    text: "text-[color:var(--danger)]",
    bg: "bg-[color:var(--danger-bg)]",
    border: "border-[color:var(--danger-border)]",
    icon: XCircle,
  },
};

/* ------------------------------------------------------------------ *
 * StatusBadge
 * ------------------------------------------------------------------ */

export interface StatusBadgeProps {
  label: string;
  severity?: Severity;
  /** Animate the processing spinner (respect reduced-motion at the call site). */
  spin?: boolean;
  className?: string;
}

/** Muted semantic status chip — color is always paired with an icon and a text label. */
export function StatusBadge({
  label,
  severity = "neutral",
  spin = false,
  className,
}: StatusBadgeProps) {
  const style = SEVERITY_STYLES[severity];
  const Icon = style.icon;

  return (
    <span
      className={cn(
        "inline-flex h-5 w-fit items-center gap-1 rounded-full border px-2 text-xs font-medium whitespace-nowrap",
        style.text,
        style.bg,
        style.border,
        className,
      )}
    >
      <Icon
        aria-hidden
        className={cn("size-3", spin && severity === "processing" && "motion-safe:animate-spin")}
      />
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * MonoMetadata — technical identifiers in mono
 * ------------------------------------------------------------------ */

export interface MonoMetadataProps {
  label?: string;
  value: string;
  /** Visually de-emphasize (e.g. long B2 keys / checksums). */
  muted?: boolean;
  /** Truncate long values to a single line. */
  truncate?: boolean;
  className?: string;
}

/** Label + mono value row for IDs, B2 keys, checksums, trace IDs. */
export function MonoMetadata({
  label,
  value,
  muted = false,
  truncate = false,
  className,
}: MonoMetadataProps) {
  return (
    <span className={cn("inline-flex min-w-0 items-baseline gap-1.5 text-xs", className)}>
      {label ? (
        <span className="text-text-muted shrink-0 font-sans">{label}</span>
      ) : null}
      <span
        data-mono
        title={value}
        className={cn(
          "font-mono",
          muted ? "text-text-muted" : "text-text-secondary",
          truncate && "truncate",
        )}
      >
        {value}
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * DisabledReason — wraps a disabled control and explains why
 * ------------------------------------------------------------------ */

export interface DisabledReasonProps {
  reason: string;
  children: React.ReactNode;
  /** Render the reason inline as text (default) in addition to the title attribute. */
  showText?: boolean;
  className?: string;
}

/**
 * Wraps a disabled control with an accessible, visible reason. The reason is exposed as
 * both visible text and a `title`, so it never relies on hover alone.
 */
export function DisabledReason({
  reason,
  children,
  showText = true,
  className,
}: DisabledReasonProps) {
  return (
    <span className={cn("inline-flex flex-col gap-1", className)} title={reason}>
      <span aria-hidden={false}>{children}</span>
      {showText ? (
        <span className="text-text-muted inline-flex items-center gap-1 text-xs">
          <Ban aria-hidden className="size-3" />
          <span>{reason}</span>
        </span>
      ) : (
        <span className="sr-only">{reason}</span>
      )}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * StateBanner — empty / blocked / failed / review-required messaging
 * ------------------------------------------------------------------ */

export interface StateBannerProps {
  title: string;
  message?: string;
  severity?: Severity;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
  className?: string;
}

/** Prominent inline banner for empty/blocked/failed/review-required screen states. */
export function StateBanner({
  title,
  message,
  severity = "neutral",
  icon,
  action,
  className,
}: StateBannerProps) {
  const style = SEVERITY_STYLES[severity];
  const Icon = icon ?? style.icon;

  return (
    <div
      role={severity === "danger" || severity === "warning" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-lg border p-4",
        style.bg,
        style.border,
        className,
      )}
    >
      <Icon aria-hidden className={cn("mt-0.5 size-4 shrink-0", style.text)} />
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm font-medium", style.text)}>{title}</p>
        {message ? <p className="text-text-secondary mt-1 text-sm">{message}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Convenience: pending / clock indicator
 * ------------------------------------------------------------------ */

export function PendingIndicator({ label, className }: { label: string; className?: string }) {
  return (
    <span className={cn("text-text-muted inline-flex items-center gap-1 text-xs", className)}>
      <Clock aria-hidden className="size-3" />
      {label}
    </span>
  );
}
