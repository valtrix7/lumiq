# PRODUCT.md — Lumiq Web (apps/web)

Strategic context for UI/design work in the Lumiq frontend. Synthesized from
`docs/product/PRD.md`, `docs/product/05-user-flows-ux-spec.md`, `docs/design/*`,
and `apps/web/CLAUDE.md`. This file is the design entry point for `apps/web` and must
be read before building or restyling screens.

## What Lumiq is

**Lumiq is a Live Commerce Moment Vault.** During live or prerecorded commerce sessions,
Lumiq detects the moments that matter, captures the raw source, generates polished media,
runs QA, and publishes — while keeping every output traceable back to its exact origin.

**Category:** Live Commerce Moment Vault — not a generic AI clipper.

**Core promise / differentiator:** every polished, published commerce asset can be traced to
its exact source moment, raw source asset, catalog snapshot, generation run, QA result,
publish package, and provenance manifest. Provenance is visible wherever generated or
published media appears.

## Who uses it

- **Owner / Admin** — organization, budgets, providers, roles, retention, billing, recovery.
- **Host** — runs Live Studio, monitors signals, source, budget, and candidate moments.
- **Editor / Reviewer** — reviews candidates, compares raw vs enhanced, validates product
  facts and claims, inspects provenance, approves, and previews publish/share packages.
- **Viewer** — read-only; must never see admin recovery, delete, publish-approve, retention,
  or billing actions.
- **Public visitor / judge** — landing, demo story, and share pages, no authentication.

## Golden path (the build north star)

```text
Setup → Catalog → Campaigns → Live Studio → Detected Moment → Review Queue
  → Moment Detail → Provenance Graph → Publish Package → Share Page
```

The first visible milestone is a clickable workspace walking this path on seeded/mock data.

## Scope of this feature (001-ui-screens)

UI-only. **No** Core API, Clerk, B2, Genblaze, Mastra, NATS, Neon, provider, billing, upload,
or publish calls; no migrations; no real credentials; no durable mutations. All state changes
are route or local component UI state, driven by seeded mock data shaped like the real
contracts. Simulated states must never claim to represent real external execution.

## Non-negotiable architecture framing (for accurate UI labels)

```text
Mastra recommends · Core API authorizes · NATS dispatches · Workers execute
Genblaze generates media · Backblaze B2 stores media & proof · Neon/Postgres tracks truth
```

These appear only as UI labels, mock IDs, and visual state — never implemented here.

## Domain vocabulary (use consistently)

organization, user, membership, role, capability, session, signal, candidate_moment, moment,
asset (raw_source / raw_mezzanine / live_transformed / enhanced_master / publish_variant),
generation_run, catalog_snapshot, allowed_claim, qa_check, publish_package,
provenance_manifest, agent_tool_call, llm_run, audit_event. Avoid bare `clip`, `file`,
`AI job`, `metadata`, `stream`, `export`.

## Product-truth safety (commerce trust is a requirement)

- Product claims in captions/overlays/titles/copy must come from seeded catalog/campaign
  `allowed_claims`. Unsupported or changed claims render **blocked** or **review-required**.
- Restricted claims (discounts, prices, limited stock, free shipping, warranty, authenticity,
  waterproofing, expiry) require explicit support or show a blocked state.
- Controls a role cannot perform are hidden or disabled with an explicit reason. Frontend
  hiding is presentation, not authorization.
- Sensitive/destructive actions require an explicit reason in their confirmation UI.

## Design system (dark-only — see docs/design/*)

- **Dark mode only.** Pure black media canvas (`#000`), near-black shell/panels.
- **Primary actions & live/active state:** royal/cobalt blue `#365CFF`.
- **Semantic statuses muted:** success `#7BE7A1`, warning `#FFD27A`, danger `#FF7A8A`,
  processing `#8FA4FF`, neutral `#B7B7C2` — always paired with text/icon, never color-only.
- **Flat spectral gradients only**, reserved for AI-active hairlines, small badges, empty
  states, and lineage highlights. **No glow, no blur aura, no page-wide gradient backgrounds,
  no gradient primary buttons.**
- **Typography:** Inter for UI; Geist Mono (mono) for technical/provenance data (IDs, B2 keys,
  checksums, trace IDs).
- **Tokens only:** colors, radius, spacing, shadows, and type scale come from `docs/design/*`,
  mapped into `src/app/globals.css`. Do not invent values.

## Every important screen needs its states

empty · loading/skeleton · ready · processing · blocked/unauthorized · warning · failed ·
review-required · success · disabled-with-reason · reduced-motion. Provenance is surfaced
(or linked) wherever generated/published media is shown.

## Implementation notes

- Next.js App Router with route groups: public routes (landing, demo, share) sit outside the
  authenticated workspace shell; operational screens live under `(workspace)`.
- shadcn/ui primitives (Radix + Tailwind v4) in `src/components/ui`; domain components grouped
  by screen in `src/components/*`. Mock data and types live in `src/lib`.
- Keep route pages server-rendered where possible; scope `"use client"` to navigation, tabs,
  filters, drawers, dialogs, segmented controls, and local toggles.
- Validate with `pnpm --filter web lint` and `pnpm --filter web build`, plus responsive QA at
  375/768/1024/1440, keyboard/focus, and reduced-motion checks (`specs/001-ui-screens/quickstart.md`).
