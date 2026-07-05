/**
 * Marketing content modules for the Lumiq landing page: hero, proof path (raw → published
 * lineage), system responsibility workflow, trust/differentiator bento, and closing CTA.
 *
 * Dark-only. Royal/cobalt primary actions; the flat spectral gradient appears in exactly three
 * sanctioned places — one hero word, the hero proof card's AI-active hairline, and the lineage
 * "thread" that connects the proof path. No glow, blur, aura, or gradient buttons.
 * Provenance is the visual hero because Lumiq is a Moment Vault, not a generic clipper.
 * Server-component safe; scroll motion is isolated to the client <Reveal> wrapper.
 */

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Boxes,
  Database,
  FileCheck2,
  Radio,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/shell/layout-primitives";
import { MediaPlaceholder } from "@/components/common/media-primitives";
import { LineageChain } from "@/components/provenance/provenance-components";
import { MonoMetadata, StatusBadge } from "@/components/common/status-primitives";
import { Reveal } from "@/components/marketing/reveal";
import { DEMO_MOMENT_ID, DEMO_SHARE_SLUG, getMomentBundle } from "@/lib/mock-data";

/* Vertical orientation of the sanctioned spectral gradient — same stops, rotated for the
 * mobile lineage thread. Kept inline (not a new token) so it stays a documented exception. */
const SPECTRAL_VERTICAL =
  "linear-gradient(to bottom, #f6d1ac, #f3b5d2, #c7b8f5, #a7eadc, #afcdf6)";

/* ------------------------------------------------------------------ *
 * Shared section primitives
 * ------------------------------------------------------------------ */

/** Numbered editorial eyebrow — gives every section a consistent, operational rhythm. */
function SectionLabel({ index, children }: { index: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span data-mono className="text-text-faint font-mono text-xs">
        {index}
      </span>
      <span aria-hidden className="h-px w-8 bg-[color:var(--border-medium)]" />
      <span className="text-text-muted text-xs font-medium tracking-[0.12em] uppercase">
        {children}
      </span>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  index,
  title,
  lead,
  className,
}: {
  eyebrow?: string;
  index?: string;
  title: string;
  lead?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      {eyebrow && index ? <SectionLabel index={index}>{eyebrow}</SectionLabel> : null}
      <h2 className="text-text-primary mt-5 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
        {title}
      </h2>
      {lead ? (
        <p className="text-text-secondary mt-3 max-w-2xl text-sm leading-relaxed text-pretty sm:text-base">
          {lead}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Faint hairline grid that fades toward the edges — premium "live-media infrastructure"
 * texture. Built from 1px lines (not a fill), masked for falloff. No glow, no blur.
 */
function HeroBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(ellipse 75% 60% at 50% 0%, #000 25%, transparent 78%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 75% 60% at 50% 0%, #000 25%, transparent 78%)",
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Hero — editorial split: claim on the left, live proof artifact on the right
 * ------------------------------------------------------------------ */

const HERO_PROOFS: { value: string; mono?: boolean; detail: string }[] = [
  { value: "Manifest", detail: "signed on every published output" },
  { value: "SHA-256", mono: true, detail: "checksum on every raw source" },
  { value: "Role-aware", detail: "from owner down to viewer" },
];

export function MarketingHero() {
  const bundle = getMomentBundle(DEMO_MOMENT_ID);
  const pkg = bundle?.publishPackage;

  return (
    <section className="relative overflow-hidden">
      {/* Flat spectral brand hairline at the very top — allowed accent, no glow. */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: "var(--gradient-spectral-pastel)" }}
      />
      <HeroBackdrop />

      <PageContainer className="relative grid items-center gap-12 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-28">
        <div className="flex flex-col items-start">
          <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--color-shell-black)]/60 px-3 py-1">
            <span
              aria-hidden
              className="size-1.5 rounded-full"
              style={{ background: "var(--gradient-spectral-pastel)" }}
            />
            <span className="text-text-secondary text-xs font-medium tracking-wide">
              Live Commerce Moment Vault
            </span>
          </span>

          <h1 className="text-text-primary mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Every published moment,{" "}
            {/* Sole gradient word — sanctioned rare marketing accent (DESIGN §4.2). */}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-spectral-pastel)" }}
            >
              traceable
            </span>{" "}
            to its exact source.
          </h1>

          <p className="text-text-secondary mt-5 max-w-xl text-base leading-relaxed text-pretty">
            Lumiq detects the moments that matter in a live commerce session, captures the raw
            source, generates polished media, runs QA, and publishes — with provenance intact.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/setup">
                Open demo workspace
                <ArrowRight aria-hidden />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/demo">See the demo story</Link>
            </Button>
          </div>

          {/* Proof strip — three differentiators, hairline-divided, operational not braggy. */}
          <dl className="mt-10 grid w-full max-w-xl grid-cols-3 gap-px overflow-hidden rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--border-subtle)]">
            {HERO_PROOFS.map((proof) => (
              <div key={proof.value} className="bg-[color:var(--color-shell-black)] p-4">
                <dt
                  data-mono={proof.mono ? "" : undefined}
                  className={
                    proof.mono
                      ? "text-text-primary font-mono text-sm font-medium"
                      : "text-text-primary text-sm font-semibold"
                  }
                >
                  {proof.value}
                </dt>
                <dd className="text-text-muted mt-1 text-xs leading-snug">{proof.detail}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Live proof artifact — a real published moment with its provenance, not a mockup.
            AI-active gradient hairline (DESIGN §7.2) marks it as a generated/published asset. */}
        <Reveal y={28} className="lg:justify-self-end">
          <figure
            className="w-full max-w-sm rounded-2xl p-3"
            style={{
              border: "1px solid transparent",
              background:
                "linear-gradient(var(--color-panel-black), var(--color-panel-black)) padding-box, var(--gradient-spectral-pastel) border-box",
            }}
          >
            <div className="relative">
              <MediaPlaceholder
                kind="video"
                aspect="9:16"
                label="Published vertical variant — Aster Crossbody"
                caption="Aster Crossbody — Spring Drop reveal"
                className="rounded-xl"
              />
              <span className="absolute top-3 left-3">
                <StatusBadge label="Provenance verified" severity="success" />
              </span>
              <span className="absolute top-3 right-3">
                <StatusBadge label="Published" severity="info" />
              </span>
            </div>
            <figcaption className="mt-3 flex flex-col gap-3 px-1 pb-1">
              <p className="text-text-primary text-sm font-medium">
                {pkg?.title ?? "Aster Crossbody — Spring Drop reveal"}
              </p>
              <LineageChain nodes={bundle?.lineage ?? []} />
              <div className="flex items-center justify-between border-t border-[color:var(--border-subtle)] pt-3">
                <MonoMetadata label="moment" value={DEMO_MOMENT_ID} muted truncate />
                <Link
                  href={`/share/${DEMO_SHARE_SLUG}`}
                  className="text-royal-blue inline-flex items-center gap-1 text-xs font-medium hover:underline"
                >
                  View share page
                  <ArrowUpRight aria-hidden className="size-3" />
                </Link>
              </div>
            </figcaption>
          </figure>
        </Reveal>
      </PageContainer>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Proof path — the canonical raw → published asset lineage, rendered as a connected chain
 * ------------------------------------------------------------------ */

interface ProofStep {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  detail: string;
  tag: string;
}

const PROOF_STEPS: ProofStep[] = [
  {
    icon: Radio,
    title: "Raw source captured",
    detail: "The exact source moment is recorded and checksummed before anything is generated.",
    tag: "raw_source",
  },
  {
    icon: ScanSearch,
    title: "Live transform",
    detail: "A mezzanine asset preserves the live-to-master lineage for the detected window.",
    tag: "raw_mezzanine",
  },
  {
    icon: Wand2,
    title: "Genblaze enhance",
    detail: "A typed generation run produces a polished master — never overwriting the source.",
    tag: "generation_run",
  },
  {
    icon: FileCheck2,
    title: "QA grounded in facts",
    detail: "Claims, captions, and appearance are checked against the catalog snapshot.",
    tag: "qa_check",
  },
  {
    icon: Sparkles,
    title: "Publish variant",
    detail: "Approved masters become publish variants sized for each destination.",
    tag: "publish_variant",
  },
  {
    icon: ShieldCheck,
    title: "Provenance manifest",
    detail: "A manifest links every output to its source, run, checksum, and B2 object key.",
    tag: "provenance_manifest",
  },
];

/** Circular node marker that sits on the lineage thread; black fill hides the line behind it. */
function StepMarker({
  icon: Icon,
  index,
}: {
  icon: ProofStep["icon"];
  index: number;
}) {
  return (
    <span className="relative flex size-10 shrink-0 items-center justify-center rounded-full border border-[color:var(--border-medium)] bg-[color:var(--color-canvas-black)]">
      <Icon aria-hidden className="text-text-secondary size-4" />
      <span
        data-mono
        className="bg-[color:var(--color-canvas-black)] text-text-faint absolute -top-1.5 -right-1.5 rounded-full px-1 font-mono text-[10px] leading-tight"
      >
        {String(index + 1).padStart(2, "0")}
      </span>
    </span>
  );
}

export function ProofPathSection() {
  return (
    <section className="border-t border-[color:var(--border-subtle)]">
      <PageContainer className="py-20 lg:py-24">
        <Reveal>
          <SectionHeading
            index="01"
            eyebrow="Proof path"
            title="One unbroken chain from raw capture to published proof"
            lead="Lumiq is not a generic AI clipper. Every polished asset can be traced back to the
            exact source moment, generation run, QA result, and signed provenance manifest."
          />
        </Reveal>

        {/* Desktop: horizontal connected rail with a spectral lineage thread. */}
        <div className="relative mt-14 hidden lg:block">
          <span
            aria-hidden
            className="absolute top-5 h-px"
            style={{
              left: "8.333%",
              right: "8.333%",
              background: "var(--gradient-spectral-pastel)",
            }}
          />
          <ol className="relative grid grid-cols-6">
            {PROOF_STEPS.map((step, index) => (
              <Reveal key={step.tag} delay={index * 0.06} y={16}>
                <li className="flex flex-col items-center px-3 text-center">
                  <StepMarker icon={step.icon} index={index} />
                  <h3 className="text-text-primary mt-5 text-sm font-semibold text-balance">
                    {step.title}
                  </h3>
                  <p className="text-text-muted mt-2 text-xs leading-relaxed text-pretty">
                    {step.detail}
                  </p>
                  <MonoMetadata value={step.tag} muted className="mt-3" />
                </li>
              </Reveal>
            ))}
          </ol>
        </div>

        {/* Mobile / tablet: vertical connected timeline with the same thread, rotated. */}
        <ol className="relative mt-12 flex flex-col gap-6 lg:hidden">
          <span
            aria-hidden
            className="absolute top-2 bottom-2 left-5 w-px -translate-x-1/2"
            style={{ background: SPECTRAL_VERTICAL }}
          />
          {PROOF_STEPS.map((step, index) => (
            <Reveal key={step.tag} delay={index * 0.05} y={14}>
              <li className="relative flex items-start gap-4">
                <StepMarker icon={step.icon} index={index} />
                <div className="pt-1">
                  <h3 className="text-text-primary text-sm font-semibold">{step.title}</h3>
                  <p className="text-text-muted mt-1.5 text-sm leading-relaxed">{step.detail}</p>
                  <MonoMetadata value={step.tag} muted className="mt-2" />
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </PageContainer>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Workflow — the production responsibility split (architecture truth as UI labels)
 * ------------------------------------------------------------------ */

interface ResponsibilityRow {
  icon: React.ComponentType<{ className?: string }>;
  actor: string;
  responsibility: string;
}

const RESPONSIBILITIES: ResponsibilityRow[] = [
  { icon: Sparkles, actor: "Mastra", responsibility: "recommends candidate moments — it never publishes or mutates state." },
  { icon: ShieldCheck, actor: "Core API", responsibility: "authorizes every capture, generation, and publish against policy." },
  { icon: Radio, actor: "Workers", responsibility: "execute only approved jobs and report state back through Core API." },
  { icon: Wand2, actor: "Genblaze", responsibility: "generates polished media inside a typed, safe step graph." },
  { icon: Boxes, actor: "Backblaze B2", responsibility: "stores media and provenance manifests with tenant-scoped keys." },
  { icon: Database, actor: "Postgres", responsibility: "tracks operational truth: IDs, relationships, permissions, provenance." },
];

export function WorkflowSection() {
  return (
    <section className="border-t border-[color:var(--border-subtle)]">
      <PageContainer className="grid gap-12 py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:py-24">
        <Reveal className="lg:sticky lg:top-24 lg:self-start">
          <SectionHeading
            index="02"
            eyebrow="Responsibility split"
            title="Clear boundaries make the proof trustworthy"
            lead="Recommendation, authorization, execution, and storage stay separate. Nothing can
            quietly publish itself, and every action leaves an audit trail."
          />
        </Reveal>

        <ul className="flex flex-col">
          {RESPONSIBILITIES.map((row, index) => {
            const Icon = row.icon;
            return (
              <Reveal key={row.actor} delay={index * 0.04} y={12}>
                <li className="group/row flex items-start gap-4 border-b border-[color:var(--border-subtle)] py-4 transition-colors duration-200 first:border-t hover:bg-[color:var(--color-surface-one)]/40">
                  <span className="bg-surface-one text-text-secondary mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md transition-colors duration-200 group-hover/row:text-text-primary">
                    <Icon aria-hidden className="size-4" />
                  </span>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    <span className="text-text-primary font-semibold">{row.actor}</span>{" "}
                    {row.responsibility}
                  </p>
                  <span
                    data-mono
                    className="text-text-faint ml-auto pt-0.5 font-mono text-xs"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </li>
              </Reveal>
            );
          })}
        </ul>
      </PageContainer>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Trust — differentiator bento (provenance, product truth, budget, roles)
 * ------------------------------------------------------------------ */

export function TrustSection() {
  return (
    <section className="border-t border-[color:var(--border-subtle)]">
      <PageContainer className="py-20 lg:py-24">
        <Reveal>
          <SectionHeading
            index="03"
            eyebrow="Why teams trust it"
            title="Built for commerce trust, not just clips"
          />
        </Reveal>

        <div className="mt-12 grid gap-3 md:grid-cols-3">
          {/* Lead cell spans two columns */}
          <Reveal y={16} className="md:col-span-2">
            <article className="bg-surface-one/50 flex h-full flex-col justify-between gap-6 rounded-lg border border-[color:var(--border-subtle)] p-6 transition-colors duration-200 hover:border-[color:var(--border-medium)] sm:p-8">
              <span className="text-royal-blue flex size-10 items-center justify-center rounded-md bg-[color:var(--royal-blue-soft)]">
                <ShieldCheck aria-hidden className="size-5" />
              </span>
              <div>
                <h3 className="text-text-primary text-lg font-semibold">
                  Provenance everywhere a moment appears
                </h3>
                <p className="text-text-muted mt-2 max-w-xl text-sm leading-relaxed">
                  Moment cards, review detail, publish packages, share pages, and admin recovery all
                  surface the lineage — compact on the surface, full graph on demand with B2 keys and
                  checksums for reviewers and admins.
                </p>
              </div>
            </article>
          </Reveal>

          <Reveal y={16} delay={0.05}>
            <article className="bg-surface-one/50 flex h-full flex-col gap-4 rounded-lg border border-[color:var(--border-subtle)] p-6 transition-colors duration-200 hover:border-[color:var(--border-medium)]">
              <span className="text-text-secondary bg-surface-two flex size-10 items-center justify-center rounded-md">
                <FileCheck2 aria-hidden className="size-5" />
              </span>
              <div>
                <h3 className="text-text-primary text-base font-semibold">Grounded product claims</h3>
                <p className="text-text-muted mt-2 text-sm leading-relaxed">
                  Captions and overlays draw only from allowed catalog and campaign claims.
                  Unsupported claims render blocked or review-required.
                </p>
              </div>
            </article>
          </Reveal>

          <Reveal y={16} delay={0.05}>
            <article className="bg-surface-one/50 flex h-full flex-col gap-4 rounded-lg border border-[color:var(--border-subtle)] p-6 transition-colors duration-200 hover:border-[color:var(--border-medium)]">
              <span className="text-text-secondary bg-surface-two flex size-10 items-center justify-center rounded-md">
                <Database aria-hidden className="size-5" />
              </span>
              <div>
                <h3 className="text-text-primary text-base font-semibold">Budget and policy in view</h3>
                <p className="text-text-muted mt-2 text-sm leading-relaxed">
                  Per-session budget caps, automation policy, and provider readiness are visible
                  before a single generation runs.
                </p>
              </div>
            </article>
          </Reveal>

          <Reveal y={16} delay={0.1} className="md:col-span-2">
            <article className="bg-surface-one/50 flex h-full flex-col justify-between gap-6 rounded-lg border border-[color:var(--border-subtle)] p-6 transition-colors duration-200 hover:border-[color:var(--border-medium)] sm:p-8">
              <span className="text-text-secondary bg-surface-two flex size-10 items-center justify-center rounded-md">
                <Boxes aria-hidden className="size-5" />
              </span>
              <div>
                <h3 className="text-text-primary text-lg font-semibold">
                  Role-aware from owner to viewer
                </h3>
                <p className="text-text-muted mt-2 max-w-xl text-sm leading-relaxed">
                  Owners, admins, hosts, reviewers, and viewers each see only what they can act on.
                  Controls a role cannot perform are hidden or disabled with an explicit reason.
                </p>
              </div>
            </article>
          </Reveal>
        </div>
      </PageContainer>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Closing CTA
 * ------------------------------------------------------------------ */

export function ClosingCta() {
  return (
    <section className="relative border-t border-[color:var(--border-subtle)]">
      {/* Spectral hairline bookend — echoes the hero, closes the page on a brand note. */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: "var(--gradient-spectral-pastel)" }}
      />
      <PageContainer width="narrow" className="flex flex-col items-center py-20 text-center lg:py-28">
        <Reveal>
          <h2 className="text-text-primary text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Walk the golden path on seeded data
          </h2>
          <p className="text-text-secondary mx-auto mt-4 max-w-xl text-sm leading-relaxed sm:text-base">
            From setup to a published share page, every screen runs on realistic mock data — no live
            services, no credentials, just the proof.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/setup">
                Open demo workspace
                <ArrowRight aria-hidden />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/demo">See the demo story</Link>
            </Button>
          </div>
        </Reveal>
      </PageContainer>
    </section>
  );
}
