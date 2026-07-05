/**
 * Public, workspace, and share layout primitives.
 *
 * Structural wrappers shared across screen groups. Public/share surfaces sit outside the
 * authenticated workspace shell. Dark-only; no glow/blur/aura; rare flat gradient accents only.
 * Server-component safe.
 */

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { publicNav } from "@/lib/navigation";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ *
 * Brand wordmark
 * ------------------------------------------------------------------ */

export function LumiqWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        aria-hidden
        className="size-2.5 rounded-full"
        style={{ background: "var(--gradient-spectral-pastel)" }}
      />
      <span className="text-text-primary text-base font-semibold tracking-tight">Lumiq</span>
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * Generic content primitives (used inside workspace + public)
 * ------------------------------------------------------------------ */

export function PageContainer({
  children,
  className,
  width = "content",
}: {
  children: React.ReactNode;
  className?: string;
  width?: "content" | "workspace" | "narrow";
}) {
  const max =
    width === "workspace"
      ? "max-w-[var(--workspace-max-width)]"
      : width === "narrow"
        ? "max-w-3xl"
        : "max-w-[var(--content-max-width)]";
  return <div className={cn("mx-auto w-full px-4 sm:px-6", max, className)}>{children}</div>;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, eyebrow, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-text-muted text-xs font-medium tracking-wide uppercase">{eyebrow}</p>
        ) : null}
        <h1 className="text-text-primary mt-1 text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? <p className="text-text-secondary mt-1 text-sm">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export interface SectionProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Section({ title, description, actions, children, className }: SectionProps) {
  return (
    <section className={cn("flex flex-col gap-3", className)}>
      {title || actions ? (
        <div className="flex items-end justify-between gap-2">
          <div>
            {title ? (
              <h2 className="text-text-primary text-sm font-semibold tracking-tight">{title}</h2>
            ) : null}
            {description ? <p className="text-text-muted text-xs">{description}</p> : null}
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Public (marketing/demo) shell
 * ------------------------------------------------------------------ */

export function PublicShell({
  children,
  cta = { label: "Open demo workspace", href: "/setup" },
  className,
}: {
  children: React.ReactNode;
  cta?: { label: string; href: string };
  className?: string;
}) {
  return (
    <div className={cn("bg-background flex min-h-full flex-col", className)}>
      <header className="border-b border-[color:var(--border-subtle)]">
        <PageContainer className="flex h-16 items-center justify-between">
          <Link href="/" aria-label="Lumiq home">
            <LumiqWordmark />
          </Link>
          <nav className="flex items-center gap-1" aria-label="Public">
            {publicNav.map((item) => (
              <Button key={item.id} asChild variant="ghost" size="sm">
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
            <Button asChild size="sm" className="ml-1">
              <Link href={cta.href}>{cta.label}</Link>
            </Button>
          </nav>
        </PageContainer>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-[color:var(--border-subtle)]">
        <PageContainer className="text-text-muted flex h-14 items-center justify-between text-xs">
          <span>Lumiq — Live Commerce Moment Vault</span>
          <span data-mono className="font-mono">UI demo · seeded data · no live services</span>
        </PageContainer>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Share shell (media-first, no workspace nav)
 * ------------------------------------------------------------------ */

export function ShareShell({
  children,
  visibilitySlot,
  className,
}: {
  children: React.ReactNode;
  visibilitySlot?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("bg-background flex min-h-full flex-col", className)}>
      <header className="border-b border-[color:var(--border-subtle)]">
        <PageContainer width="narrow" className="flex h-14 items-center justify-between">
          <Link href="/" aria-label="Lumiq home">
            <LumiqWordmark />
          </Link>
          {visibilitySlot}
        </PageContainer>
      </header>
      <main className="flex-1">
        <PageContainer width="narrow" className="py-6">
          {children}
        </PageContainer>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Workspace content wrapper (rendered inside the workspace shell)
 * ------------------------------------------------------------------ */

export function WorkspaceContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <PageContainer width="workspace" className={cn("flex flex-col gap-6 py-6", className)}>
      {children}
    </PageContainer>
  );
}
