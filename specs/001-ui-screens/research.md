# Research: Lumiq Complete UI Screen System

## Decision: Build UI-only screens in `apps/web` with Next.js App Router

**Rationale**: The repository already contains a Next.js 16.2.9 app at `apps/web` using
React 19, TypeScript, and Tailwind v4. Context7 confirms App Router pages and layouts are
Server Components by default, while interactive components require `"use client"` at the
top of their file. A UI-only build can therefore keep route pages mostly server-rendered
and isolate client state to shell navigation, tabs, filters, drawers, segmented controls,
and local mock interactions.

**Alternatives considered**:

- Separate prototype app: rejected because it would drift from the real app path.
- Static HTML prototype: rejected because Lumiq already has a Next target and needs route
  structure, component reuse, and responsive app-shell behavior.
- Backend-integrated UI: rejected because the user explicitly requested UI only.

## Decision: Initialize shadcn/ui before implementation

**Rationale**: shadcn CLI inspection reports that `apps/web` is a Next.js project with
Tailwind v4, RSC, TypeScript, import alias `@`, and no current shadcn config/components.
The shadcn skill requires composing standard UI controls from existing primitives rather
than inventing custom controls. This is appropriate for product UI screens: Tabs, Table,
Dialog, Sheet, Drawer, Tooltip, HoverCard, Select, Input, Switch, Checkbox, Progress,
Skeleton, Empty, Alert, Badge, Separator, ScrollArea, and Chart are all needed.

**Alternatives considered**:

- Hand-rolled all controls: rejected because it would produce inconsistent accessibility
  and component vocabulary.
- Third-party block registry: rejected for first pass because registry choice must be
  explicit and this plan can be implemented with core components.
- Install every shadcn component: rejected because it increases surface area. Add only
  primitives required by screen groups.

## Decision: Use `docs/design/*` as authoritative visual source

**Rationale**: Lumiq has a complete design system in `docs/design/DESIGN.md`,
`variables.css`, `theme.css`, and `tokens.json`. It locks dark-only UI, pure black media
canvas, near-black panels, royal/cobalt blue primary action/live signal, muted semantic
statuses, flat gradients only, no glow, no blur, no aura, Inter for UI, mono for technical
data, and visible provenance. These project rules override generic high-end visual advice
where they conflict.

**Alternatives considered**:

- Follow generic premium UI rules with glass, large radius, glow, or alternate fonts:
  rejected because Lumiq explicitly forbids glow/blur/aura and locks Inter.
- Generate a new palette from design tooling: rejected because committed tokens exist.
- Use light/dark theming: rejected because Lumiq core app is dark-only.

## Decision: Create `apps/web/PRODUCT.md` before UI implementation

**Rationale**: The `impeccable` skill reports `NO_PRODUCT_MD` for `apps/web` and requires
PRODUCT.md as a strategic context file before design work. Since the repo already contains
product docs, the implementation should synthesize PRODUCT.md from PRD, UX spec, and
design docs rather than asking fresh questions.

**Alternatives considered**:

- Skip PRODUCT.md: rejected because the required UI design skill treats it as a blocker.
- Put PRODUCT.md only at repo root: acceptable in some projects, but `impeccable` target
  resolution identified `apps/web` as the project root for frontend work.

## Decision: Model screens with seeded/mock frontend data

**Rationale**: The user requested UI only. To show the complete workflow without backend
integration, routes must use deterministic mock data that mirrors Lumiq domain terms:
organization, role/capabilities, product, campaign, catalog snapshot, session, signals,
moments, assets, generation runs, QA, publish packages, lineage nodes, share states,
analytics, and admin recovery rows.

**Alternatives considered**:

- Real API contracts: rejected for implementation because APIs are out of scope, though
  route screens should visually align with existing OpenAPI/AsyncAPI/schema docs.
- Local browser persistence: rejected for first pass because it can imply app behavior
  beyond UI; local component state is enough for toggles and tabs.
- Random generated mock data: rejected because realistic demo proof requires stable IDs,
  B2 keys, checksums, and seeded scenario copy.

## Decision: Group screens by user workflow and density

**Rationale**: The UX spec defines different density needs: marketing/empty states are
spacious and cinematic, Live Studio/Review are media-first and decision-aware, Admin is
compact and technical, Catalog balances tables and product cards. The plan groups screens
accordingly so the implementation does not flatten every surface into identical cards.

**Alternatives considered**:

- One dashboard page containing all modules: rejected because it would not represent the
  documented navigation model or route-level QA.
- Only hackathon screens: rejected because user asked for all UI screens.
- Full production interaction logic: rejected because UI-only scope must avoid backend
  behavior.

## Decision: Use route groups for public versus workspace surfaces

**Rationale**: Public marketing and share pages do not use the authenticated workspace
shell. Studio, Review, Vault, Catalog, Campaigns, Templates, Analytics, Admin, and Settings
share topbar/sidebar navigation. App Router route groups make this distinction explicit.

**Alternatives considered**:

- Single root layout for all screens: rejected because public pages and workspace screens
  have different IA and navigation.
- Separate Next apps: rejected because the UI belongs in one coherent web package.

## Decision: Make provenance a reusable visual primitive

**Rationale**: Provenance is Lumiq’s differentiator and must appear repeatedly: moment
cards, review detail, publish package, share page, admin detail, and technical panels.
A reusable `LineageChain` and `ProvenanceGraph` contract prevents proof from becoming
buried in one detail page.

**Alternatives considered**:

- Provenance only in Admin: rejected because normal reviewers need human-readable lineage.
- Provenance only in share page: rejected because review and publish decisions require it.
- Pure graph visualization dependency: rejected for first pass; a composed SVG/CSS graph or
  structured list can satisfy UI proof without new visualization dependencies.

## Decision: Treat accessibility and reduced motion as first-class UI states

**Rationale**: Lumiq uses timelines, pulses, status colors, dense tables, icon controls, and
drawers. The design docs require reduced motion, text equivalents for timeline markers,
visible focus, and status labels/icons. The UI plan must include this at the spec level
instead of relying on final polish.

**Alternatives considered**:

- Accessibility-only final pass: rejected because component choices affect architecture.
- Color-only status encoding: rejected by design and accessibility requirements.
- Animated-first timeline: rejected unless reduced-motion static states are also present.

## Decision: Keep charts semantic and operational

**Rationale**: Analytics and Admin screens need operational charts for capture success,
generation success, QA failures, provider failures, B2 upload failures, DLQ rate, cost per
clip, and published content metrics. Design docs require semantic colors for operations
and reserve spectral gradients for provenance/AI lineage, not cost/error charts.

**Alternatives considered**:

- Decorative gradient charts: rejected by the design system.
- No analytics screen: rejected because PRD and UX spec include Analytics as a workspace
  section.
- Real chart data fetching: rejected because UI-only.

## Decision: Avoid codegen and backend schema changes during UI implementation

**Rationale**: This feature should not modify database schemas, OpenAPI, AsyncAPI, or JSON
schemas. Existing contracts can inform mock data shape, but the deliverable is frontend UI
and Spec Kit planning artifacts.

**Alternatives considered**:

- Add OpenAPI endpoints for screens: rejected as backend scope.
- Add DB migrations for mock data: rejected as persistence scope.
- Add NATS event schemas for UI progress: rejected because existing event specs already
  cover domain events and this UI only displays mock state.
