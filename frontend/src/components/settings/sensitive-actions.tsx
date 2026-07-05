/**
 * Sensitive action confirmation (US8 — Settings, T060).
 *
 * Renders the seeded sensitive-action catalog as a dense table where each row opens a
 * confirmation dialog. Roles that lack an action's required capability see a
 * `DisabledReason`-wrapped (disabled) "Preview confirmation" button instead. The
 * confirmation dialog requires an explicit reason for `requiresReason` actions, an
 * irreversible acknowledgement for destructive actions, and shows the required
 * capability. Confirming only surfaces an inline note — backend enforcement is out
 * of scope for this UI-only preview.
 *
 * Client component — opens a controlled Radix Dialog from row state.
 * Dark-only, Lumiq tokens only, mono for all capability identifiers.
 */

"use client";

import * as React from "react";
import { ShieldAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DisabledReason, MonoMetadata, StatusBadge } from "@/components/common/status-primitives";
import { getRolePreset, mockSensitiveActions, roleHasCapability } from "@/lib/mock-data";
import type { Capability } from "@/lib/mock-data/organization";
import type { RolePreset, SensitiveAction } from "@/lib/screen-types";

/* ------------------------------------------------------------------ *
 * Capability gating helper
 * ------------------------------------------------------------------ */

interface Gate {
  disabled: boolean;
  reason?: string;
}

function gateFor(role: RolePreset, capability: Capability): Gate {
  if (roleHasCapability(role, capability)) return { disabled: false };
  const preset = getRolePreset(role);
  const match = preset.disabledActions.find((d) => d.requiredCapability === capability);
  return {
    disabled: true,
    reason: match?.reason ?? `The ${role} role lacks the ${capability} capability.`,
  };
}

/* ------------------------------------------------------------------ *
 * SensitiveActionsTable
 * ------------------------------------------------------------------ */

export interface SensitiveActionsTableProps {
  role: RolePreset;
}

export function SensitiveActionsTable({ role }: SensitiveActionsTableProps) {
  const [openId, setOpenId] = React.useState<string | null>(null);
  const selected = React.useMemo(
    () => mockSensitiveActions.find((action) => action.actionId === openId) ?? null,
    [openId],
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-surface-one overflow-x-auto rounded-lg border border-[color:var(--border-subtle)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Required capability</TableHead>
              <TableHead>Destructive</TableHead>
              <TableHead>Requires reason</TableHead>
              <TableHead className="text-right">
                <span className="sr-only">Preview confirmation</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockSensitiveActions.map((action) => {
              const capability = action.requiredCapability as Capability;
              const gate = gateFor(role, capability);
              const trigger = (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={gate.disabled}
                  onClick={() => !gate.disabled && setOpenId(action.actionId)}
                >
                  Preview confirmation
                </Button>
              );
              return (
                <TableRow key={action.actionId} className="hover:bg-surface-two/60">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-text-primary text-xs font-medium">{action.label}</span>
                      <span
                        className="text-text-muted line-clamp-1 text-xs"
                        title={action.description}
                      >
                        {action.description}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge label={action.severity} severity={action.severity} />
                  </TableCell>
                  <TableCell>
                    <MonoMetadata value={action.requiredCapability} muted />
                  </TableCell>
                  <TableCell>
                    {action.destructive ? (
                      <Badge variant="destructive">yes</Badge>
                    ) : (
                      <span className="text-text-muted text-xs">no</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {action.requiresReason ? (
                      <Badge variant="outline">yes</Badge>
                    ) : (
                      <span className="text-text-muted text-xs">no</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {gate.disabled ? (
                      <DisabledReason reason={gate.reason ?? ""}>{trigger}</DisabledReason>
                    ) : (
                      trigger
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <SensitiveActionConfirm
        action={selected}
        open={Boolean(selected)}
        onOpenChange={(next) => {
          if (!next) setOpenId(null);
        }}
      />

      <p className="text-text-muted text-xs">
        Sensitive-action confirmation is presentational in this seeded preview for the{" "}
        <span className="text-text-secondary">{role}</span> role. Confirming only displays an inline
        note — no action is performed. Enactment requires Core API authorization, capability
        checks, and an audit event.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * SensitiveActionConfirm
 * ------------------------------------------------------------------ */

export interface SensitiveActionConfirmProps {
  action: SensitiveAction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Stateful confirmation body. Remounts per action (via `key`) so internal reason /
 * acknowledgement / attempted state resets cleanly whenever a new action opens — no
 * setState-in-effect required.
 */
function ConfirmBody({
  action,
  onCancel,
}: {
  action: SensitiveAction;
  onCancel: () => void;
}) {
  const [reason, setReason] = React.useState("");
  const [acknowledged, setAcknowledged] = React.useState<boolean>(false);
  const [attempted, setAttempted] = React.useState(false);

  const reasonMet = !action.requiresReason || reason.trim().length > 0;
  const ackMet = !action.destructive || acknowledged;
  const canConfirm = reasonMet && ackMet;
  const isDanger = action.severity === "danger";

  return (
    <>
      <DialogHeader>
        <DialogTitle>{action.label}</DialogTitle>
        <DialogDescription>{action.description}</DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-4">
        {/* Severity banner — never color-only */}
        <div className="flex items-start gap-2 rounded-lg border border-[color:var(--border-subtle)] bg-surface-two p-3">
          <ShieldAlert
            aria-hidden
            className={
              isDanger
                ? "text-[color:var(--danger)] mt-0.5 size-4 shrink-0"
                : "text-[color:var(--warning)] mt-0.5 size-4 shrink-0"
            }
          />
          <div className="flex min-w-0 flex-col gap-1">
            <StatusBadge label={action.severity} severity={action.severity} />
            <p className="text-text-secondary text-xs">
              {action.destructive
                ? "This action is destructive and irreversible once enacted via Core API."
                : "This action modifies configuration once enacted via Core API."}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-text-muted text-xs font-medium tracking-wide uppercase">
            Requires
          </span>
          <MonoMetadata value={action.requiredCapability} muted />
        </div>

        {action.requiresReason ? (
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="sensitive-reason"
              className="text-text-muted text-xs font-medium tracking-wide uppercase"
            >
              Reason (required)
            </label>
            <textarea
              id="sensitive-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={3}
              placeholder="State the operational reason for this action"
              className="bg-surface-one border-[color:var(--border-subtle)] text-text-primary placeholder:text-text-muted focus-visible:border-ring/50 rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2"
            />
          </div>
        ) : null}

        {action.destructive ? (
          <label className="flex items-start gap-2">
            <Checkbox
              checked={acknowledged}
              onCheckedChange={(value) => setAcknowledged(value === true)}
              aria-label="Acknowledge this action is irreversible"
            />
            <span className="text-text-secondary text-xs">
              I understand this is irreversible.
            </span>
          </label>
        ) : null}

        {attempted && !canConfirm ? (
          <p className="text-[color:var(--warning)] text-xs">
            Provide a reason and acknowledge the warning before confirming.
          </p>
        ) : null}

        {attempted && canConfirm ? (
          <p className="text-[color:var(--processing)] text-xs">
            Backend enforcement is out of scope for this UI-only preview. No action was taken.
          </p>
        ) : null}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="destructive"
          disabled={!canConfirm}
          onClick={() => setAttempted(true)}
        >
          {action.label}
        </Button>
      </DialogFooter>
    </>
  );
}

export function SensitiveActionConfirm({ action, open, onOpenChange }: SensitiveActionConfirmProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {action ? (
          <ConfirmBody key={action.actionId} action={action} onCancel={() => onOpenChange(false)} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
