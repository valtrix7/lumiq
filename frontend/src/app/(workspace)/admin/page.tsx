import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";
import { WorkspaceContent, PageHeader } from "@/components/shell/layout-primitives";
import { StateBanner } from "@/components/common/status-primitives";
import { StateSwitcher } from "@/components/common/state-switcher";
import { resolveStateParam } from "@/lib/state-param";
import { AdminRecovery } from "@/components/admin/admin-recovery";
import { CAPABILITIES, roleHasCapability, mockAdminRecoveryItems } from "@/lib/mock-data";
import type { RolePreset } from "@/lib/screen-types";

export const metadata: Metadata = {
  title: "Admin",
  description:
    "Operational recovery: DLQ, stuck moments, failed runs, B2 reconciliation, provider failures, budget anomalies, audit search, retention queue, and orphaned assets — with trace IDs, B2 keys, and checksums visible. Seeded UI-only recovery states; no actions are performed.",
};

const STATE_VARIANTS = [
  { value: "seeded", label: "Seeded recovery items" },
  { value: "empty", label: "No recovery items" },
] as const;

interface AdminPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Admin / Recovery shell (US7 / T057).
 *
 * Renders the seeded operational-recovery surface through `AdminRecovery`, plus an empty
 * variant via the `?state=` switcher. Role-sensitive visibility: the page reads the active
 * `role` preset from `searchParams` and renders a restricted banner for any role without the
 * `admin.recovery` capability instead of the recovery controls. UI-only — no backend, no
 * mutation. Recovery actions require an operator reason and audit event when enacted via
 * Core API; nothing is executed from this preview.
 */
export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const role = resolveStateParam(params, "role", "owner") as RolePreset;
  const variant = resolveStateParam(params, "state", "seeded");

  const items = variant === "empty" ? [] : mockAdminRecoveryItems;
  const canRecover = roleHasCapability(role, CAPABILITIES.adminRecovery);

  return (
    <WorkspaceContent>
      <PageHeader
        eyebrow="Seeded admin · no live services"
        title="Admin"
        description="DLQ, stuck moments, failed runs, B2 reconciliation, provider failures, budget anomalies, audit search, retention queue, and orphaned assets. Seeded UI-only recovery — no actions are performed."
        actions={
          <StateSwitcher options={[...STATE_VARIANTS]} defaultValue="seeded" label="Preview state" />
        }
      />

      {canRecover ? (
        <AdminRecovery items={items} role={role} />
      ) : (
        <StateBanner
          severity="danger"
          icon={ShieldAlert}
          title="Restricted"
          message={`The ${role} role cannot access operational recovery controls. Switch the role preset to owner or admin to preview.`}
        />
      )}
    </WorkspaceContent>
  );
}
