"use client";

/**
 * Setup actions (US2 — Setup and Seeded Session Start).
 *
 * Client component: the Start Demo Session action and setup navigation. UI-only — no fetch,
 * no mutation. Navigates to Live Studio (`/studio`), preserving the active `role` query param
 * so the previewed role carries across screens. When the organization is not ready, the action
 * renders disabled and wrapped in DisabledReason explaining why.
 */

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DisabledReason } from "@/components/common/status-primitives";

export interface SetupActionsProps {
  /** Whether a session can be started from this setup state. */
  ready: boolean;
  /** Reason shown when not ready (e.g. "Add a catalog snapshot before starting a session."). */
  blockedReason?: string;
}

/**
 * Start Demo Session action plus a secondary navigation link. The `role` query param (set by
 * the workspace shell's role selector) is preserved so the previewed role persists into Studio.
 */
export function SetupActions({ ready, blockedReason }: SetupActionsProps) {
  const searchParams = useSearchParams();

  const role = searchParams.get("role");
  const studioHref = role ? `/studio?role=${encodeURIComponent(role)}` : "/studio";
  const catalogHref = role ? `/catalog?role=${encodeURIComponent(role)}` : "/catalog";

  const reason =
    blockedReason ?? "Complete the setup checklist before starting a session.";

  return (
    <div className="flex flex-wrap items-end gap-3">
      {ready ? (
        <Button asChild>
          <Link href={studioHref}>
            <PlayCircle aria-hidden />
            Start Demo Session
          </Link>
        </Button>
      ) : (
        <DisabledReason reason={reason}>
          <Button disabled aria-disabled>
            <PlayCircle aria-hidden />
            Start Demo Session
          </Button>
        </DisabledReason>
      )}

      <Button asChild variant="outline">
        <Link href={catalogHref}>Open catalog</Link>
      </Button>
    </div>
  );
}
