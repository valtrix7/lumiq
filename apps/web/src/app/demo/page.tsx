import type { Metadata } from "next";
import { PublicShell, PageContainer } from "@/components/shell/layout-primitives";
import { DemoStory } from "@/components/marketing/demo-story";

export const metadata: Metadata = {
  title: "Demo story",
  description:
    "A judge-facing walkthrough of one Lumiq moment: Mastra recommendation, Genblaze generation, Backblaze B2 storage, grounded product claims, QA, and the full provenance graph.",
};

/**
 * Judge-facing demo story — public, no authentication, no workspace shell.
 *
 * Walks a single golden-path moment end to end with the technical proof a reviewer wants:
 * B2 keys, checksums, run IDs, grounded claims, QA, and provenance. UI-only seeded data.
 */
export default function DemoPage() {
  return (
    <PublicShell>
      <PageContainer className="py-12 lg:py-16">
        <div className="mx-auto max-w-4xl">
          <header className="flex flex-col gap-3">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[color:var(--border-subtle)] px-3 py-1">
              <span
                aria-hidden
                className="size-1.5 rounded-full"
                style={{ background: "var(--gradient-spectral-pastel)" }}
              />
              <span className="text-text-secondary text-xs font-medium tracking-wide">
                Seeded demo · no live services
              </span>
            </span>
            <h1 className="text-text-primary text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              One moment, end to end, with the proof intact
            </h1>
            <p className="text-text-secondary max-w-2xl text-sm leading-relaxed text-pretty sm:text-base">
              Follow the Aster Crossbody Spring Drop reveal from recommendation to published share
              page. Each step below is backed by contract-shaped fixture data — Mastra recommends,
              Core API authorizes, Genblaze generates, B2 stores, and provenance ties it together.
            </p>
          </header>

          <div className="mt-10">
            <DemoStory />
          </div>
        </div>
      </PageContainer>
    </PublicShell>
  );
}
