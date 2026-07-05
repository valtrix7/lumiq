# Implementation Plan: Lumiq Complete UI Screen System

**Branch**: `001-ui-screens` | **Date**: 2026-06-27 | **Spec**: `specs/001-ui-screens/spec.md`

**Input**: Feature specification from `specs/001-ui-screens/spec.md`

## Summary

Build the complete Lumiq frontend screen system in `apps/web` as a UI-only feature.
The implementation will replace the default Next starter page with a dark-only,
token-driven, shadcn-composed interface covering public marketing, onboarding/setup,
workspace shell, Live Studio, Review, Vault, Catalog, Campaigns, Templates, Analytics,
Admin/Recovery, Settings, Publish, Provenance, and Share Page screens.

The feature deliberately uses seeded/mock frontend data and does not implement backend,
auth, B2, Genblaze, Mastra, NATS, Neon, provider, billing, upload, publish, or persistence
behavior. All state changes are route or component UI state. The goal is a complete,
high-fidelity, implementation-ready UI layer that makes Lumiq’s golden path and production
screen inventory visible.

## Technical Context

**Language/Version**: TypeScript 5, React 19.2.4, Next.js 16.2.9 App Router.

**Primary Dependencies**: Next.js, React, Tailwind CSS v4, shadcn/ui to be initialized,
Radix-based shadcn primitives, local TypeScript mock data. Optional icon package selection
must follow the shadcn project config after initialization.

**Storage**: No real storage. UI-only mock data modules for seeded organizations, sessions,
moments, assets, B2 keys, manifests, QA, publish packages, analytics, and admin recovery.

**Testing**: `pnpm --filter web lint`, `pnpm --filter web build`, responsive visual QA at
375/768/1024/1440, keyboard/focus QA, reduced-motion QA, and route/state walkthroughs
defined in `quickstart.md`.

**Target Platform**: Web desktop and mobile browsers through the Next.js app in `apps/web`.

**Project Type**: Frontend web application, UI-only implementation, monorepo app package.

**Performance Goals**: Initial UI routes should render from static/server components where
possible; interactive client components should be scoped to navigation, toggles, filters,
drawers, dialogs, segmented controls, and tabs. No real-time networking or media decoding
is required for this feature.

**Constraints**: Dark-only Lumiq visual system; no backend calls; no real credentials; no
real provider execution; no invented architecture; no arbitrary colors/radii/shadows/fonts;
no glow/blur/aura gradients; no gradient primary buttons; provenance visible wherever
generated or published assets appear.

**Scale/Scope**: Full documented UI screen inventory, grouped into public screens,
onboarding/setup, app shell, Studio, Review/Detail, Vault, commerce setup, templates,
publish/provenance/share, analytics, admin/recovery, and settings.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Specs and requirement IDs**: PASS. Sources read include `README.md`,
  `docs/00-spec-index.md`, `docs/product/PRD.md`, `docs/product/03-glossary-domain-language.md`,
  `docs/product/04-requirements-ears.md`, `docs/product/05-user-flows-ux-spec.md`,
  `docs/demo/26-hackathon-demo-submission-spec.md`, `docs/design/*`,
  `docs/architecture/02-project-constitution.md`, `docs/architecture/06-system-architecture-c4.md`,
  and `.specify/memory/constitution.md`. Relevant requirement families include
  `REQ-UI-*`, `REQ-DEMO-*`, `REQ-PROV-*`, `REQ-AUTH-*`, `REQ-CATALOG-*`,
  `REQ-CAPTURE-*`, `REQ-GEN-*`, `REQ-QA-*`, `REQ-PUBLISH-*`, `REQ-AUDIT-*`,
  `REQ-ADMIN-*`, `REQ-DESIGN-*`, and `REQ-NFR-*`.
- **Architecture boundary**: PASS. This feature does not implement Mastra, Core API, NATS,
  workers, Genblaze, B2, Postgres, Clerk, provider calls, publish adapters, or state
  transitions. Those concepts appear only as UI labels, mock IDs, and visual state.
- **Agent/tool safety**: PASS. No agent tools or side-effecting gateways are implemented.
  Agent/LLM/tool-call concepts appear only in mock evidence, explanation, and provenance UI.
- **Provenance/storage**: PASS. UI mock data must preserve raw-to-publish lineage, B2 key
  conventions beginning with `tenants/{organization_id}/`, checksums, manifests, asset IDs,
  generation runs, publish packages, and disclosure levels.
- **Commerce/media integrity**: PASS. Product claims in UI must come from seeded
  catalog/campaign facts. Unsupported claims must display blocked or review-required states.
- **Events/workflows**: PASS. Events, worker states, DLQ, trace IDs, and retry counts are
  display-only mock records. No event publishing or consumption is implemented.
- **Security/privacy**: PASS. Role/capability UI states are mock-only. Sensitive controls
  must be hidden/disabled by role preset, but backend enforcement is out of scope.
- **Contracts/tests/design**: PASS. The UI contract, mock data model, quickstart, and QA
  checklist require dark-only design-token compliance, responsive checks, accessibility
  checks, and visual state coverage.

## Project Structure

### Documentation (this feature)

```text
specs/001-ui-screens/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    └── ui-screen-contract.md
```

### Source Code (repository root)

```text
apps/web/
├── PRODUCT.md                  # design tooling context required before UI work
├── src/app/
│   ├── globals.css             # Tailwind v4 + Lumiq token mapping
│   ├── layout.tsx              # root metadata, fonts, dark-only document shell
│   ├── page.tsx                # public landing page
│   ├── demo/page.tsx           # demo story / judge-facing proof page
│   ├── share/[shareSlug]/page.tsx
│   └── (workspace)/
│       ├── layout.tsx          # authenticated mock app shell
│       ├── setup/page.tsx
│       ├── studio/page.tsx
│       ├── vault/page.tsx
│       ├── review/page.tsx
│       ├── review/[momentId]/page.tsx
│       ├── catalog/page.tsx
│       ├── campaigns/page.tsx
│       ├── templates/page.tsx
│       ├── analytics/page.tsx
│       ├── admin/page.tsx
│       └── settings/page.tsx
├── src/components/
│   ├── shell/
│   ├── marketing/
│   ├── setup/
│   ├── studio/
│   ├── review/
│   ├── vault/
│   ├── commerce/
│   ├── provenance/
│   ├── admin/
│   └── ui/                     # shadcn-generated primitives
└── src/lib/
    ├── mock-data/
    ├── screen-types.ts
    ├── navigation.ts
    └── cn.ts
```

**Structure Decision**: Use Next.js App Router route groups. Public routes live outside
the workspace shell; all operational screens live inside `(workspace)` and share the
hybrid shell. Shared components are grouped by screen domain, while `src/components/ui`
contains shadcn primitives.

## Phase 0: Research

See `research.md`.

## Phase 1: Design & Contracts

See `data-model.md`, `contracts/ui-screen-contract.md`, and `quickstart.md`.

## Complexity Tracking

No constitution violations are planned. The UI inventory is large, but the scope remains
bounded because all behavior is presentational and mock-state driven.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

## Post-Design Constitution Re-check

- UI-only scope remains intact: no backend clients, provider SDKs, real auth, or persistence.
- Mock data contract preserves Lumiq terminology and provenance identifiers.
- Screen groups include required demo and production-first UX flows.
- Design rules are aligned with `docs/design/*` and `.specify/memory/constitution.md`.
- Quickstart includes explicit responsive, accessibility, reduced-motion, and design QA gates.
