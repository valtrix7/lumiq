import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";
import { WorkspaceContent, PageHeader } from "@/components/shell/layout-primitives";
import { StateBanner } from "@/components/common/status-primitives";
import { SettingsSections } from "@/components/settings/settings-sections";
import { SensitiveActionsTable } from "@/components/settings/sensitive-actions";
import { isSectionHidden } from "@/lib/mock-data";
import { resolveStateParam } from "@/lib/state-param";
import type { RolePreset } from "@/lib/screen-types";

export const metadata: Metadata = {
  title: "Settings",
  description:
    "Organization, members, roles, capabilities, budgets, automation, retention, providers, billing, and sensitive-action confirmations. Seeded UI-only settings — no live services, no mutations.",
};

interface SettingsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Settings shell (US8 — T061).
 *
 * Renders the seeded Settings surface through `SettingsSections` plus the seeded
 * sensitive-action catalog. The active `role` preset is read from `searchParams`
 * (driven by the workspace topbar role selector). Roles whose preset hides the
 * whole `settings` section (viewer, host) get a restricted banner instead of the
 * controls. UI-only — no backend, no mutation. Every mutating control is
 * presentational and communicates that changes require Core API authorization,
 * capability checks, and an audit event.
 */
export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const params = await searchParams;
  const role = resolveStateParam(params, "role", "owner") as RolePreset;
  const restricted = isSectionHidden(role, "settings");

  return (
    <WorkspaceContent>
      <PageHeader
        eyebrow="Seeded settings · no live services"
        title="Settings"
        description="Organization, members, roles, capabilities, budgets, automation, retention, providers, billing, and sensitive-action confirmation states. Seeded UI-only preview — no changes are enacted."
      />

      {restricted ? (
        <StateBanner
          severity="danger"
          icon={ShieldAlert}
          title="Restricted"
          message={`The ${role} role cannot access Settings. Switch the role preset to owner, admin, editor, or reviewer to preview.`}
        />
      ) : (
        <div className="flex flex-col gap-8">
          <SettingsSections role={role} />
          <section className="flex flex-col gap-3">
            <div>
              <h2 className="text-text-primary text-sm font-semibold tracking-tight">
                Sensitive actions
              </h2>
              <p className="text-text-muted text-xs">
                Destructive and high-impact actions require an explicit reason and audit event when
                enacted via Core API.
              </p>
            </div>
            <SensitiveActionsTable role={role} />
          </section>
        </div>
      )}
    </WorkspaceContent>
  );
}
