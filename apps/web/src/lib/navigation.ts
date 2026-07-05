/**
 * Workspace navigation definitions with role/capability metadata.
 *
 * UI-only. Drives the sidebar, mobile navigation, and route-context labels. Capability and
 * hidden-section metadata mirror the mock role presets so the shell can hide/disable
 * unauthorized destinations — frontend hiding is presentation, not authorization.
 */

import {
  Activity,
  BarChart3,
  type LucideIcon,
  Megaphone,
  PackageSearch,
  Radio,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
  SlidersHorizontal,
  Vault,
} from "lucide-react";
import type { Capability } from "@/lib/mock-data/organization";
import { CAPABILITIES, isSectionHidden, roleHasCapability } from "@/lib/mock-data/organization";
import type { RolePreset } from "@/lib/screen-types";

export interface NavItem {
  /** Stable section id, also used for hidden-section matching. */
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  /** Capability required to act inside the section (visibility is gated by hidden sections). */
  requiredCapability?: Capability;
  description: string;
  /** Optional density hint for the screen group. */
  density: "media-control-room" | "app-shell" | "dense-table" | "detail-tabs";
}

export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

/* ------------------------------------------------------------------ *
 * Workspace navigation
 * ------------------------------------------------------------------ */

export const workspaceNav: NavGroup[] = [
  {
    id: "produce",
    label: "Produce",
    items: [
      {
        id: "studio",
        label: "Live Studio",
        href: "/studio",
        icon: Radio,
        requiredCapability: CAPABILITIES.studioRun,
        description: "Preflight and live control room for moment detection.",
        density: "media-control-room",
      },
      {
        id: "review",
        label: "Review",
        href: "/review",
        icon: Activity,
        requiredCapability: CAPABILITIES.reviewView,
        description: "Review queue, compare, provenance, and publish decisions.",
        density: "detail-tabs",
      },
      {
        id: "vault",
        label: "Vault",
        href: "/vault",
        icon: Vault,
        requiredCapability: CAPABILITIES.vaultView,
        description: "Search and manage captured, enhanced, and published moments.",
        density: "app-shell",
      },
    ],
  },
  {
    id: "commerce",
    label: "Commerce",
    items: [
      {
        id: "catalog",
        label: "Catalog",
        href: "/catalog",
        icon: ShoppingBag,
        requiredCapability: CAPABILITIES.catalogManage,
        description: "Products, allowed claims, media, and snapshot history.",
        density: "dense-table",
      },
      {
        id: "campaigns",
        label: "Campaigns",
        href: "/campaigns",
        icon: Megaphone,
        requiredCapability: CAPABILITIES.campaignManage,
        description: "Offers, validity windows, and allowed campaign claims.",
        density: "app-shell",
      },
      {
        id: "templates",
        label: "Templates",
        href: "/templates",
        icon: Sparkles,
        requiredCapability: CAPABILITIES.templateManage,
        description: "Safe typed step graphs and allowed creative controls.",
        density: "detail-tabs",
      },
    ],
  },
  {
    id: "operate",
    label: "Operate",
    items: [
      {
        id: "analytics",
        label: "Analytics",
        href: "/analytics",
        icon: BarChart3,
        requiredCapability: CAPABILITIES.analyticsView,
        description: "Operational and media performance metrics.",
        density: "app-shell",
      },
      {
        id: "admin",
        label: "Admin",
        href: "/admin",
        icon: ShieldAlert,
        requiredCapability: CAPABILITIES.adminRecovery,
        description: "DLQ, recovery, reconciliation, and audit proof.",
        density: "dense-table",
      },
      {
        id: "settings",
        label: "Settings",
        href: "/settings",
        icon: SlidersHorizontal,
        requiredCapability: CAPABILITIES.budgetManage,
        description: "Organization, roles, budgets, providers, retention, billing.",
        density: "detail-tabs",
      },
    ],
  },
];

/** Flat list of every workspace destination. */
export const workspaceNavItems: NavItem[] = workspaceNav.flatMap((group) => group.items);

/* ------------------------------------------------------------------ *
 * Public navigation
 * ------------------------------------------------------------------ */

export interface PublicNavItem {
  id: string;
  label: string;
  href: string;
}

export const publicNav: PublicNavItem[] = [
  { id: "home", label: "Overview", href: "/" },
  { id: "demo", label: "Demo story", href: "/demo" },
];

/** Icon used for media/preview placeholders where no destination icon applies. */
export const placeholderIcon: LucideIcon = PackageSearch;

/* ------------------------------------------------------------------ *
 * Role-aware filtering
 * ------------------------------------------------------------------ */

/** Whether a nav section is visible for a role (respects hidden sections). */
export function isNavItemVisible(role: RolePreset, item: NavItem): boolean {
  return !isSectionHidden(role, item.id);
}

/** Whether the section's primary action is enabled for a role. */
export function isNavItemEnabled(role: RolePreset, item: NavItem): boolean {
  if (!item.requiredCapability) return true;
  return roleHasCapability(role, item.requiredCapability);
}

/** Nav groups filtered to the sections a role can see, dropping empty groups. */
export function getNavForRole(role: RolePreset): NavGroup[] {
  return workspaceNav
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => isNavItemVisible(role, item)),
    }))
    .filter((group) => group.items.length > 0);
}

/** Resolve the active nav item for a pathname (longest-prefix match). */
export function getActiveNavItem(pathname: string): NavItem | undefined {
  return workspaceNavItems
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];
}
