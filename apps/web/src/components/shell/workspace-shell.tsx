"use client";

/**
 * Authenticated mock workspace shell: topbar (org switcher, session context, budget,
 * notifications, user menu, role selector), desktop sidebar, and mobile navigation.
 *
 * UI-only. The active role is held in a `role` URL param so the shell can hide/disable
 * unauthorized sections — frontend hiding is presentation, not authorization. No backend.
 */

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Bell, Menu, PanelLeftClose, Wallet } from "lucide-react";
import { cn } from "@/lib/cn";
import type { RolePreset } from "@/lib/screen-types";
import {
  getActiveNavItem,
  getNavForRole,
  isNavItemEnabled,
  type NavGroup,
  type NavItem,
} from "@/lib/navigation";
import { getDemoOrganization, mockOrganizations } from "@/lib/mock-data/organization";
import { mockRolePresets } from "@/lib/mock-data/organization";
import { mockSessions } from "@/lib/mock-data/workflow";
import { LumiqWordmark } from "@/components/shell/layout-primitives";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const ROLE_VALUES = mockRolePresets.map((preset) => preset.role);

function useActiveRole(): [RolePreset, (role: RolePreset) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const raw = searchParams.get("role");
  const role: RolePreset = ROLE_VALUES.includes(raw as RolePreset) ? (raw as RolePreset) : "owner";

  const setRole = React.useCallback(
    (next: RolePreset) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next === "owner") params.delete("role");
      else params.set("role", next);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  return [role, setRole];
}

/* ------------------------------------------------------------------ *
 * Budget indicator
 * ------------------------------------------------------------------ */

function BudgetIndicator() {
  const session = mockSessions[0];
  const { remainingUsd, limitUsd, status } = session.budgetSummary;
  const usedPct = Math.round(((limitUsd - remainingUsd) / limitUsd) * 100);
  const color =
    status === "danger"
      ? "var(--danger)"
      : status === "warning"
        ? "var(--warning)"
        : "var(--success)";

  return (
    <div
      className="hidden items-center gap-2 sm:flex"
      title={`Session budget: $${remainingUsd.toFixed(2)} of $${limitUsd.toFixed(2)} remaining`}
    >
      <Wallet aria-hidden className="text-text-muted size-4" />
      <div className="flex flex-col">
        <span className="text-text-secondary text-xs leading-none">
          ${remainingUsd.toFixed(2)} left
        </span>
        <span
          aria-hidden
          className="mt-1 h-1 w-20 overflow-hidden rounded-full bg-[color:var(--neutral-bg)]"
        >
          <span className="block h-full rounded-full" style={{ width: `${usedPct}%`, background: color }} />
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Sidebar navigation
 * ------------------------------------------------------------------ */

function NavLink({
  item,
  role,
  active,
  onNavigate,
}: {
  item: NavItem;
  role: RolePreset;
  active: boolean;
  onNavigate?: () => void;
}) {
  const enabled = isNavItemEnabled(role, item);
  const Icon = item.icon;

  if (!enabled) {
    return (
      <span
        aria-disabled
        title={`Unavailable for the ${role} role`}
        className="text-text-faint flex cursor-not-allowed items-center gap-2.5 rounded-md px-2.5 py-2 text-sm"
      >
        <Icon aria-hidden className="size-4" />
        <span className="flex-1">{item.label}</span>
        <span className="sr-only">Unavailable for the {role} role</span>
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
        "focus-visible:ring-ring/50 outline-none focus-visible:ring-2",
        active
          ? "bg-sidebar-accent text-text-primary"
          : "text-text-secondary hover:bg-sidebar-accent/60 hover:text-text-primary",
      )}
    >
      <Icon aria-hidden className={cn("size-4", active && "text-[color:var(--royal-blue)]")} />
      <span className="flex-1">{item.label}</span>
    </Link>
  );
}

function SidebarNav({
  groups,
  role,
  pathname,
  onNavigate,
}: {
  groups: NavGroup[];
  role: RolePreset;
  pathname: string;
  onNavigate?: () => void;
}) {
  const active = getActiveNavItem(pathname);
  return (
    <nav className="flex flex-col gap-4" aria-label="Workspace">
      {groups.map((group) => (
        <div key={group.id} className="flex flex-col gap-1">
          <p className="text-text-faint px-2.5 text-[10px] font-semibold tracking-wide uppercase">
            {group.label}
          </p>
          {group.items.map((item) => (
            <NavLink
              key={item.id}
              item={item}
              role={role}
              active={active?.id === item.id}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ))}
    </nav>
  );
}

/* ------------------------------------------------------------------ *
 * Topbar controls
 * ------------------------------------------------------------------ */

function OrgSwitcher() {
  const demo = getDemoOrganization();
  return (
    <Select defaultValue={demo.organizationId}>
      <SelectTrigger size="sm" className="w-[180px]" aria-label="Organization">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {mockOrganizations.map((org) => (
          <SelectItem key={org.organizationId} value={org.organizationId}>
            {org.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function RoleSelector({ role, onChange }: { role: RolePreset; onChange: (role: RolePreset) => void }) {
  return (
    <Select value={role} onValueChange={(value) => onChange(value as RolePreset)}>
      <SelectTrigger size="sm" className="w-[140px]" aria-label="Preview role">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {mockRolePresets.map((preset) => (
          <SelectItem key={preset.role} value={preset.role}>
            {preset.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/* ------------------------------------------------------------------ *
 * Workspace shell
 * ------------------------------------------------------------------ */

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [role, setRole] = useActiveRole();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const groups = getNavForRole(role);
  const session = mockSessions[0];

  return (
    <div className="bg-shell-black flex min-h-full flex-col">
      {/* Topbar */}
      <header className="bg-shell-black sticky top-0 z-30 border-b border-[color:var(--border-subtle)]">
        <div className="flex h-16 items-center gap-3 px-3 sm:px-4">
          {/* Mobile nav trigger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="lg:hidden" aria-label="Open navigation">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[270px] p-0">
              <SheetHeader className="border-b border-[color:var(--border-subtle)]">
                <SheetTitle>
                  <LumiqWordmark />
                </SheetTitle>
              </SheetHeader>
              <div className="overflow-y-auto p-3">
                <SidebarNav
                  groups={groups}
                  role={role}
                  pathname={pathname}
                  onNavigate={() => setMobileOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/studio" aria-label="Lumiq workspace" className="hidden sm:block">
            <LumiqWordmark />
          </Link>

          <Separator orientation="vertical" className="hidden h-6 sm:block" />

          <OrgSwitcher />

          <div className="text-text-muted hidden min-w-0 items-center gap-1.5 text-xs md:flex">
            <span className="truncate" title={session.title}>
              {session.title}
            </span>
            <Badge variant="outline" className="shrink-0">
              {session.status}
            </Badge>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <BudgetIndicator />
            <Button variant="ghost" size="icon-sm" aria-label="Notifications (2 unread)" className="relative">
              <Bell />
              <span
                aria-hidden
                className="absolute -top-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full bg-[color:var(--danger)] text-[8px] font-semibold text-[color:var(--danger-foreground,#140407)]"
              >
                2
              </span>
            </Button>
            <RoleSelector role={role} onChange={setRole} />
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="User menu"
              className="bg-surface-two text-text-secondary rounded-full"
            >
              <span className="text-xs font-medium">AA</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Body: sidebar + content */}
      <div className="flex flex-1">
        <aside className="bg-sidebar hidden w-[var(--sidebar-width)] shrink-0 border-r border-[color:var(--border-subtle)] lg:block">
          <div className="sticky top-16 flex max-h-[calc(100vh-4rem)] flex-col gap-4 overflow-y-auto p-3">
            <SidebarNav groups={groups} role={role} pathname={pathname} />
            <Separator />
            <p className="text-text-faint flex items-center gap-1.5 px-2.5 text-[10px]">
              <PanelLeftClose aria-hidden className="size-3" />
              Seeded demo workspace · no live services
            </p>
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
