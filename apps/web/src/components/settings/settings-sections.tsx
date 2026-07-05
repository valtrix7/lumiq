/**
 * Settings sections (US8 — Settings, T059).
 *
 * Renders the seeded Settings surface as an uncontrolled, server-safe tab group:
 * organization, members, roles, capabilities, budgets, automation, retention,
 * providers, and billing. Whole sections are hidden for roles whose preset lists
 * `settings.<id>` under hiddenSections (e.g. reviewer hides billing/providers/retention;
 * viewer/host hide `settings` entirely and never reach this component). Individual
 * mutating controls are gated by capability and wrapped in `DisabledReason` when the
 * active role lacks the required capability — always explaining why.
 *
 * Presentational only — no fetch, no mutation, no provider/billing/auth calls.
 * Dark-only, Lumiq tokens only, mono for all technical identifiers.
 */

import {
  Archive,
  Building2,
  CreditCard,
  KeyRound,
  ListChecks,
  ServerCog,
  Users,
  Wallet,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DisabledReason,
  MonoMetadata,
  StatusBadge,
} from "@/components/common/status-primitives";
import {
  CAPABILITIES,
  getDemoOrganization,
  getRolePreset,
  isSectionHidden,
  mockAutomationPolicy,
  mockBilling,
  mockBudgetPolicies,
  mockCapabilityGroups,
  mockMembers,
  mockProviders,
  mockRetentionPolicies,
  mockRolePresets,
  roleHasCapability,
} from "@/lib/mock-data";
import type { Capability } from "@/lib/mock-data/organization";
import type {
  BudgetPolicy,
  MemberStatus,
  ProviderConfig,
  Readiness,
  RolePreset,
  Severity,
} from "@/lib/screen-types";

/* ------------------------------------------------------------------ *
 * Deterministic UTC formatting (no Date / locale → no hydration drift)
 * ------------------------------------------------------------------ */

/** Format an ISO timestamp as a fixed "YYYY-MM-DD HH:MM:SS UTC" label. */
function formatUtc(iso: string): string {
  const [date, rest] = iso.split("T");
  const time = (rest ?? "").slice(0, 8);
  return `${date} ${time} UTC`;
}

/* ------------------------------------------------------------------ *
 * Capability gating helper
 * ------------------------------------------------------------------ */

interface Gate {
  disabled: boolean;
  reason?: string;
}

/**
 * Resolve whether the active role may perform a capability-gated action. When the
 * role lacks the capability, the preset's explicit `disabledActions` reason wins
 * (e.g. admin billing) and otherwise a generic, role-named reason is used.
 */
function gateFor(role: RolePreset, capability: Capability): Gate {
  if (roleHasCapability(role, capability)) return { disabled: false };
  const preset = getRolePreset(role);
  const match = preset.disabledActions.find((d) => d.requiredCapability === capability);
  return {
    disabled: true,
    reason: match?.reason ?? `The ${role} role lacks the ${capability} capability.`,
  };
}

/** A presentational button that disables itself (with a reason) when the role lacks a capability. */
function GatedButton({
  role,
  capability,
  children,
  variant = "outline",
}: {
  role: RolePreset;
  capability: Capability;
  children: React.ReactNode;
  variant?: "outline" | "default" | "secondary" | "destructive";
}) {
  const gate = gateFor(role, capability);
  const button = (
    <Button type="button" variant={variant} size="sm" disabled={gate.disabled}>
      {children}
    </Button>
  );
  if (gate.disabled) {
    return <DisabledReason reason={gate.reason ?? ""}>{button}</DisabledReason>;
  }
  return button;
}

/* ------------------------------------------------------------------ *
 * Severity helpers (statuses are never color-only)
 * ------------------------------------------------------------------ */

function memberStatusSeverity(status: MemberStatus): Severity {
  switch (status) {
    case "active":
      return "success";
    case "invited":
      return "processing";
    case "suspended":
      return "warning";
  }
}

function readinessSeverity(readiness: Readiness): Severity {
  switch (readiness) {
    case "ready":
      return "success";
    case "mocked":
      return "info";
    case "degraded":
      return "warning";
    case "missing":
      return "danger";
  }
}

/* ------------------------------------------------------------------ *
 * Section: organization
 * ------------------------------------------------------------------ */

function OrganizationSection() {
  const org = getDemoOrganization();
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Organization profile</CardTitle>
        <CardDescription>
          Read-only identity and readiness for the active workspace. Editing requires Core API.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Name" value={org.name} />
        <Field label="Workspace slug" value={org.workspaceSlug} mono />
        <div className="flex flex-col gap-1">
          <span className="text-text-muted text-xs font-medium tracking-wide uppercase">Plan</span>
          <Badge variant="secondary" className="w-fit capitalize">{org.plan}</Badge>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-text-muted text-xs font-medium tracking-wide uppercase">Setup status</span>
          <Badge variant="outline" className="w-fit">{org.setupStatus}</Badge>
        </div>
        <MonoMetadata label="organization_id" value={org.organizationId} muted />
        <div className="flex flex-col gap-1">
          <span className="text-text-muted text-xs font-medium tracking-wide uppercase">Readiness</span>
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge
              label={`provider · ${org.providerReadiness}`}
              severity={readinessSeverity(org.providerReadiness)}
            />
            <StatusBadge
              label={`storage · ${org.storageReadiness}`}
              severity={readinessSeverity(org.storageReadiness)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ *
 * Section: members
 * ------------------------------------------------------------------ */

function MembersSection({ role }: { role: RolePreset }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-text-muted text-xs">
          {mockMembers.length} members · one invited, one suspended
        </p>
        <GatedButton role={role} capability={CAPABILITIES.membersManage}>
          <Users aria-hidden className="size-3.5" />
          Invite member
        </GatedButton>
      </div>
      <div className="bg-surface-one overflow-x-auto rounded-lg border border-[color:var(--border-subtle)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Added</TableHead>
              <TableHead>Last active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockMembers.map((member) => (
              <TableRow key={member.memberId} className="hover:bg-surface-two/60">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-text-primary text-xs font-medium">
                      {member.displayName}
                    </span>
                    <span data-mono className="text-text-muted font-mono text-xs">
                      {member.memberId}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-text-secondary text-xs">{member.email}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">{member.role}</Badge>
                </TableCell>
                <TableCell>
                  <StatusBadge
                    label={member.status}
                    severity={memberStatusSeverity(member.status)}
                  />
                </TableCell>
                <TableCell>
                  <span data-mono className="text-text-muted font-mono text-xs">
                    {formatUtc(member.addedAt)}
                  </span>
                </TableCell>
                <TableCell>
                  {member.lastActiveAt ? (
                    <span data-mono className="text-text-muted font-mono text-xs">
                      {formatUtc(member.lastActiveAt)}
                    </span>
                  ) : (
                    <span className="text-text-muted text-xs">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Section: roles
 * ------------------------------------------------------------------ */

function RolesSection() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {mockRolePresets.map((preset) => (
        <Card key={preset.role} size="sm">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle>{preset.label}</CardTitle>
              <Badge variant="outline" className="capitalize">{preset.role}</Badge>
            </div>
            <CardDescription>
              {preset.capabilities.length} capabilities
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <MonoMetadata label="role_id" value={preset.role} muted />
            <div className="flex flex-col gap-1">
              <span className="text-text-muted text-xs font-medium tracking-wide uppercase">
                Hidden sections
              </span>
              {preset.hiddenSections.length === 0 ? (
                <span className="text-text-muted text-xs">none — full visibility</span>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {preset.hiddenSections.map((section) => (
                    <span
                      key={section}
                      data-mono
                      className="bg-surface-two text-text-muted rounded border border-[color:var(--border-subtle)] px-1.5 py-0.5 font-mono text-xs"
                    >
                      {section}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Section: capabilities
 * ------------------------------------------------------------------ */

function CapabilitiesSection() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {mockCapabilityGroups.map((group) => (
        <Card key={group.groupId} size="sm">
          <CardHeader>
            <CardTitle>{group.label}</CardTitle>
            <CardDescription>{group.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-1">
            {group.capabilities.map((capability) => (
              <span
                key={capability}
                data-mono
                className="bg-surface-two text-text-secondary rounded border border-[color:var(--border-subtle)] px-1.5 py-0.5 font-mono text-xs"
              >
                {capability}
              </span>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Section: budgets
 * ------------------------------------------------------------------ */

function BudgetCard({ policy, role }: { policy: BudgetPolicy; role: RolePreset }) {
  const pct = Math.min(100, Math.round((policy.spentUsd / policy.limitUsd) * 100));
  return (
    <Card size="sm">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="capitalize">
            {policy.scope} · {policy.period}
          </CardTitle>
          <StatusBadge
            label={`${pct}% spent`}
            severity={policy.status}
          />
        </div>
        <CardDescription>{policy.detail}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-text-secondary text-sm">
            <span data-mono className="text-text-primary font-mono">
              ${policy.spentUsd.toFixed(2)}
            </span>
            <span className="text-text-muted"> / </span>
            <span data-mono className="font-mono">${policy.limitUsd.toFixed(2)}</span>
          </span>
          <span className="text-text-muted text-xs capitalize">enforce · {policy.enforce}</span>
        </div>
        <div className="relative">
          <Progress value={pct} />
          <span
            aria-hidden
            title={`soft cap ${policy.softCapPct}%`}
            className="bg-[color:var(--border-strong)] absolute top-1/2 h-2 w-px -translate-y-1/2"
            style={{ left: `${policy.softCapPct}%` }}
          />
          <span
            aria-hidden
            title={`hard cap ${policy.hardCapPct}%`}
            className="bg-[color:var(--neutral)] absolute top-1/2 h-2 w-px -translate-y-1/2"
            style={{ left: `${policy.hardCapPct}%` }}
          />
        </div>
        <div className="text-text-muted flex flex-wrap gap-3 text-xs">
          <span>
            soft cap <span data-mono className="font-mono">{policy.softCapPct}%</span>
          </span>
          <span>
            hard cap <span data-mono className="font-mono">{policy.hardCapPct}%</span>
          </span>
        </div>
        <GatedButton role={role} capability={CAPABILITIES.budgetManage}>
          Edit hard cap
        </GatedButton>
      </CardContent>
    </Card>
  );
}

function BudgetsSection({ role }: { role: RolePreset }) {
  return (
    <div className="flex flex-col gap-3">
      {mockBudgetPolicies.map((policy) => (
        <BudgetCard key={policy.budgetId} policy={policy} role={role} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Section: automation
 * ------------------------------------------------------------------ */

function AutomationSection() {
  const policy = mockAutomationPolicy;
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{policy.label}</CardTitle>
        <CardDescription>{policy.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field
            label="Auto-capture confidence threshold"
            value={policy.confidenceThreshold.toFixed(2)}
            mono
          />
          <div className="flex flex-col gap-1">
            <span className="text-text-muted text-xs font-medium tracking-wide uppercase">
              Auto-approve high confidence
            </span>
            <div className="flex items-center gap-2">
              <Switch checked={policy.autoApproveHighConfidence} disabled aria-label="Auto-approve high confidence" />
              <span className="text-text-secondary text-xs">
                {policy.autoApproveHighConfidence ? "enabled" : "disabled"} (read-only)
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-text-muted text-xs font-medium tracking-wide uppercase">
              Appearance restyle routing
            </span>
            <StatusBadge label={policy.routeAppearanceRestyleTo} severity="warning" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-text-muted text-xs font-medium tracking-wide uppercase">
              Commerce claim risk routing
            </span>
            <StatusBadge label={policy.routeClaimRiskTo} severity="danger" />
          </div>
        </div>
        <p className="text-text-muted text-xs">{policy.detail}</p>
        <p className="text-text-muted text-xs">
          Automation changes route through Core API and emit an audit event. This preview does not
          enact policy changes.
        </p>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ *
 * Section: retention
 * ------------------------------------------------------------------ */

function RetentionSection({ role }: { role: RolePreset }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="bg-surface-one overflow-x-auto rounded-lg border border-[color:var(--border-subtle)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset role</TableHead>
              <TableHead>Retention</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Legal hold</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">
                <span className="sr-only">Change policy</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockRetentionPolicies.map((policy) => (
              <TableRow key={policy.policyId} className="hover:bg-surface-two/60">
                <TableCell>
                  <div className="flex flex-col">
                    <span data-mono className="text-text-primary font-mono text-xs">
                      {policy.assetRole}
                    </span>
                    <span className="text-text-muted text-xs">{policy.detail}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span data-mono className="text-text-secondary font-mono text-xs tabular-nums">
                    {policy.retentionDays}d
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">{policy.action}</Badge>
                </TableCell>
                <TableCell>
                  {policy.legalHold ? (
                    <StatusBadge label="legal hold" severity="warning" />
                  ) : (
                    <span className="text-text-muted text-xs">none</span>
                  )}
                </TableCell>
                <TableCell>
                  <StatusBadge label={policy.status} severity={policy.status} />
                </TableCell>
                <TableCell className="text-right">
                  <GatedButton role={role} capability={CAPABILITIES.retentionManage}>
                    Change policy
                  </GatedButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Section: providers
 * ------------------------------------------------------------------ */

function ProviderCard({ provider, role }: { provider: ProviderConfig; role: RolePreset }) {
  return (
    <Card size="sm">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>{provider.name}</CardTitle>
          <Badge variant="outline" className="capitalize">{provider.category}</Badge>
        </div>
        <CardDescription>{provider.capabilitiesSummary}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusBadge label={provider.status} severity={readinessSeverity(provider.status)} />
          <StatusBadge
            label={provider.connected ? "connected" : "disconnected"}
            severity={provider.connected ? "success" : "neutral"}
          />
        </div>
        <MonoMetadata label="last_health_check" value={formatUtc(provider.lastHealthCheck)} muted />
        <MonoMetadata label="api_key_ref" value={provider.apiKeyRef} muted />
        <p className="text-text-muted text-xs">{provider.detail}</p>
        <GatedButton role={role} capability={CAPABILITIES.providerManage}>
          <KeyRound aria-hidden className="size-3.5" />
          Rotate key
        </GatedButton>
      </CardContent>
    </Card>
  );
}

function ProvidersSection({ role }: { role: RolePreset }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {mockProviders.map((provider) => (
        <ProviderCard key={provider.providerId} provider={provider} role={role} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Section: billing
 * ------------------------------------------------------------------ */

function BillingSection({ role }: { role: RolePreset }) {
  const billing = mockBilling;
  const pct = Math.min(100, Math.round((billing.spendUsd / billing.limitUsd) * 100));
  return (
    <Card size="sm">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="capitalize">{billing.plan} plan</CardTitle>
          <StatusBadge label={`${pct}% of limit`} severity={billing.status} />
        </div>
        <CardDescription>{billing.paymentMethodLabel}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-text-secondary text-sm">
            <span data-mono className="text-text-primary font-mono">
              ${billing.spendUsd.toFixed(2)}
            </span>
            <span className="text-text-muted"> / </span>
            <span data-mono className="font-mono">${billing.limitUsd.toFixed(2)}</span>
          </span>
          <MonoMetadata
            label="period"
            value={`${formatUtc(billing.currentPeriodStart)} → ${formatUtc(billing.currentPeriodEnd)}`}
            muted
          />
        </div>
        <Progress value={pct} />
        <div className="flex flex-col gap-1">
          <span className="text-text-muted text-xs font-medium tracking-wide uppercase">
            Invoices
          </span>
          <div className="flex flex-wrap gap-1">
            {billing.invoiceRefs.map((ref) => (
              <span
                key={ref}
                data-mono
                className="bg-surface-two text-text-muted rounded border border-[color:var(--border-subtle)] px-1.5 py-0.5 font-mono text-xs"
              >
                {ref}
              </span>
            ))}
          </div>
        </div>
        <GatedButton role={role} capability={CAPABILITIES.billingManage}>
          <CreditCard aria-hidden className="size-3.5" />
          Manage billing
        </GatedButton>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ *
 * Shared field primitive
 * ------------------------------------------------------------------ */

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-text-muted text-xs font-medium tracking-wide uppercase">{label}</span>
      {mono ? (
        <span data-mono className="text-text-primary font-mono text-sm">
          {value}
        </span>
      ) : (
        <span className="text-text-primary text-sm">{value}</span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Section registry
 * ------------------------------------------------------------------ */

interface SectionDef {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Whether the whole section is hidden for the active role. */
  hidden: boolean;
  content: React.ReactNode;
}

function buildSections(role: RolePreset): SectionDef[] {
  return [
    {
      id: "organization",
      label: "Organization",
      icon: Building2,
      hidden: isSectionHidden(role, "settings.organization"),
      content: <OrganizationSection />,
    },
    {
      id: "members",
      label: "Members",
      icon: Users,
      hidden: isSectionHidden(role, "settings.members"),
      content: <MembersSection role={role} />,
    },
    {
      id: "roles",
      label: "Roles",
      icon: KeyRound,
      hidden: isSectionHidden(role, "settings.roles"),
      content: <RolesSection />,
    },
    {
      id: "capabilities",
      label: "Capabilities",
      icon: ListChecks,
      hidden: isSectionHidden(role, "settings.capabilities"),
      content: <CapabilitiesSection />,
    },
    {
      id: "budgets",
      label: "Budgets",
      icon: Wallet,
      hidden: isSectionHidden(role, "settings.budgets"),
      content: <BudgetsSection role={role} />,
    },
    {
      id: "automation",
      label: "Automation",
      icon: Workflow,
      hidden: isSectionHidden(role, "settings.automation"),
      content: <AutomationSection />,
    },
    {
      id: "retention",
      label: "Retention",
      icon: Archive,
      hidden: isSectionHidden(role, "settings.retention"),
      content: <RetentionSection role={role} />,
    },
    {
      id: "providers",
      label: "Providers",
      icon: ServerCog,
      hidden: isSectionHidden(role, "settings.providers"),
      content: <ProvidersSection role={role} />,
    },
    {
      id: "billing",
      label: "Billing",
      icon: CreditCard,
      hidden: isSectionHidden(role, "settings.billing"),
      content: <BillingSection role={role} />,
    },
  ];
}

/* ------------------------------------------------------------------ *
 * SettingsSections
 * ------------------------------------------------------------------ */

export interface SettingsSectionsProps {
  role: RolePreset;
}

export function SettingsSections({ role }: SettingsSectionsProps) {
  const sections = buildSections(role).filter((section) => !section.hidden);
  const defaultTab = sections[0]?.id ?? "organization";

  return (
    <div className="flex flex-col gap-4">
      <Tabs defaultValue={defaultTab}>
        <TabsList className="flex h-auto flex-wrap">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <TabsTrigger key={section.id} value={section.id} className="gap-1.5">
                <Icon aria-hidden className="size-3.5" />
                {section.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <TabsContent
              key={section.id}
              value={section.id}
              className="mt-4 flex flex-col gap-3"
            >
              <div className="flex items-center gap-2">
                <Icon aria-hidden className="text-text-muted size-4" />
                <h3 className="text-text-primary text-sm font-medium">{section.label}</h3>
              </div>
              {section.content}
            </TabsContent>
          );
        })}
      </Tabs>

      <p className="text-text-muted text-xs">
        Settings controls are presentational in this seeded preview for the{" "}
        <span className="text-text-secondary">{role}</span> role — no changes are enacted. Mutations
        require Core API authorization, capability checks, and an audit event.
      </p>
    </div>
  );
}
