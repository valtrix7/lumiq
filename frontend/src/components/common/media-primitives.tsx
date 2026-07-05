/**
 * Reusable media placeholder and technical-proof components.
 *
 * Media renders on a pure-black canvas (no real decoding in this UI-only build).
 * Technical proof surfaces B2 keys, checksums, byte sizes, and verification status in mono —
 * provenance must be visible wherever generated/published media appears.
 * Server-component safe.
 */

import * as React from "react";
import { FileJson, FileText, ImageIcon, Play, ShieldCheck, ShieldX } from "lucide-react";
import { cn } from "@/lib/cn";
import type { AssetRef, PreviewKind } from "@/lib/screen-types";
import { MonoMetadata, StatusBadge } from "@/components/common/status-primitives";

/* ------------------------------------------------------------------ *
 * Byte formatting
 * ------------------------------------------------------------------ */

export function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, exponent);
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

/* ------------------------------------------------------------------ *
 * MediaPlaceholder — pure-black media canvas
 * ------------------------------------------------------------------ */

const PREVIEW_ICONS: Record<PreviewKind, React.ComponentType<{ className?: string }>> = {
  video: Play,
  image: ImageIcon,
  text: FileText,
  json: FileJson,
  placeholder: ImageIcon,
};

const ASPECT_CLASS: Record<string, string> = {
  "16:9": "aspect-video",
  "9:16": "aspect-[9/16]",
  "1:1": "aspect-square",
  "4:5": "aspect-[4/5]",
};

export interface MediaPlaceholderProps {
  kind?: PreviewKind;
  label?: string;
  /** Aspect ratio token. Defaults to 16:9. */
  aspect?: "16:9" | "9:16" | "1:1" | "4:5";
  /** Small caption shown under the icon (e.g. role or duration). */
  caption?: string;
  className?: string;
}

/** Pure-black media canvas placeholder. No real media is decoded in this UI build. */
export function MediaPlaceholder({
  kind = "video",
  label,
  aspect = "16:9",
  caption,
  className,
}: MediaPlaceholderProps) {
  const Icon = PREVIEW_ICONS[kind];

  return (
    <div
      role="img"
      aria-label={label ?? `${kind} preview placeholder`}
      className={cn(
        "bg-canvas-black relative flex w-full items-center justify-center overflow-hidden rounded-lg border border-[color:var(--border-subtle)]",
        ASPECT_CLASS[aspect],
        className,
      )}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="bg-surface-two/60 text-text-secondary flex size-11 items-center justify-center rounded-full">
          <Icon aria-hidden className="size-5" />
        </span>
        {caption ? <span className="text-text-muted text-xs">{caption}</span> : null}
      </div>
      <span className="text-text-faint absolute bottom-2 right-2 text-[10px] tracking-wide uppercase">
        UI placeholder
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * TechnicalProof — B2 key, checksum, size, verification
 * ------------------------------------------------------------------ */

export interface TechnicalProofProps {
  asset: AssetRef;
  /** Hide the B2 key for normal (non-admin/reviewer) disclosure. */
  hideObjectKey?: boolean;
  className?: string;
}

/** Compact technical proof block for an asset: role, key, checksum, size, verification. */
export function TechnicalProof({ asset, hideObjectKey = false, className }: TechnicalProofProps) {
  const verified = asset.verificationStatus === "verified";

  return (
    <div
      className={cn(
        "bg-surface-one/60 flex flex-col gap-1.5 rounded-lg border border-[color:var(--border-subtle)] p-3",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <MonoMetadata label="role" value={asset.role} />
        <StatusBadge
          label={asset.verificationStatus}
          severity={verified ? "success" : asset.verificationStatus === "failed" ? "danger" : "neutral"}
        />
      </div>
      {hideObjectKey ? null : (
        <MonoMetadata label="b2" value={asset.objectKey} muted truncate />
      )}
      <MonoMetadata label="sha256" value={asset.sha256} muted truncate />
      <div className="flex items-center gap-3">
        <MonoMetadata label="size" value={formatBytes(asset.bytes)} />
        <MonoMetadata label="type" value={asset.mimeType} muted />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * VerificationIcon — inline checksum-verified indicator
 * ------------------------------------------------------------------ */

export function VerificationIcon({
  status,
  className,
}: {
  status: AssetRef["verificationStatus"];
  className?: string;
}) {
  if (status === "verified") {
    return (
      <span className="text-[color:var(--success)]" title="Checksum verified">
        <ShieldCheck aria-label="Checksum verified" className={cn("size-4", className)} />
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="text-[color:var(--danger)]" title="Checksum verification failed">
        <ShieldX aria-label="Checksum verification failed" className={cn("size-4", className)} />
      </span>
    );
  }
  return (
    <span className="text-text-muted" title="Unverified">
      <ShieldCheck aria-label="Unverified" className={cn("size-4 opacity-50", className)} />
    </span>
  );
}
