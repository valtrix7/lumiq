# Tasks: Lumiq Complete UI Screen System

**Input**: Design documents from `/specs/001-ui-screens/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `quickstart.md`, `contracts/ui-screen-contract.md`, `.specify/memory/constitution.md`

**Tests**: Automated tests are not requested for this UI-only feature. Validation is manual route/state QA plus `pnpm --filter web lint` and `pnpm --filter web build` as defined in `quickstart.md`.

**Organization**: Tasks are grouped by user story so each story can be implemented and visually tested independently after the shared foundation is complete.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the web app for Lumiq UI work, shadcn composition, and design-token compliance.

- [X] T001 Create Lumiq frontend product context in `apps/web/PRODUCT.md`
- [X] T002 Initialize shadcn/ui configuration for the Next.js Tailwind v4 app in `apps/web/components.json`
- [X] T003 [P] Install required UI/icon dependencies in `apps/web/package.json`
- [X] T004 [P] Add shadcn primitive components for button, badge, tabs, dialog, sheet, tooltip, select, input, checkbox, switch, progress, skeleton, table, separator, scroll-area, alert, and card in `apps/web/src/components/ui/`
- [X] T005 Map Lumiq design tokens from `docs/design/variables.css`, `docs/design/theme.css`, and `docs/design/tokens.json` into `apps/web/src/app/globals.css`
- [X] T006 Configure root metadata, dark-only document shell, and font variables in `apps/web/src/app/layout.tsx`
- [X] T007 Add route and screen type definitions for all UI-only entities in `apps/web/src/lib/screen-types.ts`
- [X] T008 Add shared class name helper in `apps/web/src/lib/cn.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared mock data, navigation, shells, and reusable proof/status primitives required by every story.

**CRITICAL**: No user story work should begin until this phase is complete.

- [X] T009 Create seeded organizations, role presets, and capability visibility data in `apps/web/src/lib/mock-data/organization.ts`
- [X] T010 [P] Create seeded products, allowed claims, campaigns, and catalog snapshots in `apps/web/src/lib/mock-data/commerce.ts`
- [X] T011 [P] Create seeded sessions, signal events, moments, assets, generation runs, QA summaries, publish packages, share states, analytics metrics, and admin recovery items in `apps/web/src/lib/mock-data/workflow.ts`
- [X] T012 Create aggregate mock data exports and lookup helpers in `apps/web/src/lib/mock-data/index.ts`
- [X] T013 Create workspace navigation definitions with role/capability metadata in `apps/web/src/lib/navigation.ts`
- [X] T014 Create reusable status, mono metadata, disabled-reason, and state banner components in `apps/web/src/components/common/status-primitives.tsx`
- [X] T015 [P] Create reusable media placeholder and technical proof components in `apps/web/src/components/common/media-primitives.tsx`
- [X] T016 [P] Create reusable compact lineage chain and full provenance graph components in `apps/web/src/components/provenance/provenance-components.tsx`
- [X] T017 Create public, workspace, and share layout primitives in `apps/web/src/components/shell/layout-primitives.tsx`
- [X] T018 Create authenticated mock workspace shell with topbar, sidebar, role selector, mobile navigation, budget indicator, and notification states in `apps/web/src/components/shell/workspace-shell.tsx`
- [X] T019 Add workspace route group layout using the mock shell in `apps/web/src/app/(workspace)/layout.tsx`
- [X] T020 Add manual state toggle primitives for seeded UI variants in `apps/web/src/components/common/state-switcher.tsx`

**Checkpoint**: Shared tokens, data, shells, and provenance/status primitives are ready.

---

## Phase 3: User Story 1 - Public Understanding and Share Proof (Priority: P1) MVP

**Goal**: Public visitors understand Lumiq as a Live Commerce Moment Vault and can inspect demo/share proof without authentication.

**Independent Test**: Open `/`, `/demo`, and `/share/aster-crossbody-demo`; verify category, raw-to-published lineage, proof modules, UI-only disclosure, share states, product link, and provenance summary render without workspace shell.

- [X] T021 [P] [US1] Create marketing content modules for hero, proof path, workflow, and CTA in `apps/web/src/components/marketing/marketing-sections.tsx`
- [X] T022 [US1] Replace the default starter page with Lumiq landing content in `apps/web/src/app/page.tsx`
- [X] T023 [P] [US1] Create demo proof modules for B2, Genblaze, Mastra, product grounding, QA, and provenance in `apps/web/src/components/marketing/demo-story.tsx`
- [X] T024 [US1] Add judge-facing demo story route in `apps/web/src/app/demo/page.tsx`
- [X] T025 [P] [US1] Create share page components for public, private/access-denied, revoked, expired, and unavailable states in `apps/web/src/components/share/share-page.tsx`
- [X] T026 [US1] Add dynamic share route using seeded share states in `apps/web/src/app/share/[shareSlug]/page.tsx`
- [X] T027 [US1] Verify public responsive and reduced-motion states from `specs/001-ui-screens/quickstart.md`

**Checkpoint**: US1 can be visually demoed independently as the MVP public proof path.

---

## Phase 4: User Story 2 - Setup and Seeded Session Start (Priority: P1)

**Goal**: Operators can inspect empty, incomplete, blocked, and seeded demo setup states before entering Live Studio.

**Independent Test**: Open `/setup`; verify organization, catalog, campaign, allowed claims, budget, provider/storage readiness, blocked reasons, and Start Demo Session are visible from mock state.

- [X] T028 [P] [US2] Create setup checklist, readiness summary, blocked-state, and seeded demo components in `apps/web/src/components/setup/setup-flow.tsx`
- [X] T029 [US2] Add setup route with empty organization and seeded demo variants in `apps/web/src/app/(workspace)/setup/page.tsx`
- [X] T030 [US2] Add setup navigation and Start Demo Session link behavior using route/local UI state in `apps/web/src/components/setup/setup-actions.tsx`
- [X] T031 [US2] Verify setup blocked states and mobile shell behavior from `specs/001-ui-screens/quickstart.md`

**Checkpoint**: US2 setup flow is independently reachable and blocks missing commerce context.

---

## Phase 5: User Story 3 - Live Studio and AI Moment Detection (Priority: P1)

**Goal**: Hosts can monitor preflight, live source preview, signal detection, candidate progress, product context, budget/policy, and timeline states.

**Independent Test**: Open `/studio`; verify preflight, source preview, signal feed, candidate cards, progress chain, budget blocked, duplicate suppressed, provider unavailable, failed, and review-ready states are visible without backend services.

- [X] T032 [P] [US3] Create Live Studio preflight panels for source, catalog snapshot, policy, budget, and provider/storage readiness in `apps/web/src/components/studio/studio-preflight.tsx`
- [X] T033 [P] [US3] Create Live Studio control room regions for preview, signal rail, product context, budget policy, and status controls in `apps/web/src/components/studio/studio-control-room.tsx`
- [X] T034 [P] [US3] Create candidate progress cards and bottom timeline with text equivalents in `apps/web/src/components/studio/studio-timeline.tsx`
- [X] T035 [US3] Add Live Studio route composing preflight, live, candidate, enhancing, blocked, and failed states in `apps/web/src/app/(workspace)/studio/page.tsx`
- [X] T036 [US3] Verify Live Studio responsive collapse at 375px and reduced-motion timeline behavior from `specs/001-ui-screens/quickstart.md`

**Checkpoint**: US3 primary product screen is visually complete and testable from mock session data.

---

## Phase 6: User Story 4 - Review, Compare, Provenance, and Publish (Priority: P1)

**Goal**: Reviewers can inspect queue variants, compare raw/enhanced/published media, validate evidence and claims, inspect provenance, approve UI state, and preview publish/share packages.

**Independent Test**: Open `/review` and `/review/mom_aster_reveal`; verify queue views, detail tabs, desktop/mobile compare layouts, QA review-required behavior, provenance graph, versions, publish readiness, blocked facts, and share preview.

- [X] T037 [P] [US4] Create review queue filters, cards, and state variants in `apps/web/src/components/review/review-queue.tsx`
- [X] T038 [US4] Add Review Queue route with global, publish-ready, needs-review, and failed/remediable views in `apps/web/src/app/(workspace)/review/page.tsx`
- [X] T039 [P] [US4] Create moment detail tab shell and preview/evidence/facts/QA panels in `apps/web/src/components/review/moment-detail.tsx`
- [X] T040 [P] [US4] Create responsive compare component with desktop side-by-side and mobile segmented modes in `apps/web/src/components/review/compare-panel.tsx`
- [X] T041 [P] [US4] Create publish package panel with readiness checks, captions, destination variants, facts-changed blocked state, and share preview in `apps/web/src/components/review/publish-panel.tsx`
- [X] T042 [US4] Add Moment Detail route using seeded moment lookup in `apps/web/src/app/(workspace)/review/[momentId]/page.tsx`
- [X] T043 [US4] Verify review detail keyboard tab order, dialog/sheet titles, and provenance visibility from `specs/001-ui-screens/quickstart.md`

**Checkpoint**: US4 completes the golden path from review decision through publish/share proof.

---

## Phase 7: User Story 5 - Moment Vault Search and Management (Priority: P2)

**Goal**: Operators browse and filter captured, enhanced, reviewed, and published moments across grid, timeline, grouped, package, and search-result views.

**Independent Test**: Open `/vault`; switch views and filters; verify matching cards, compact lineage, full provenance links, and helpful empty results.

- [X] T044 [P] [US5] Create vault filter bar for session, product, campaign, moment type, status, QA, publish state, template, date, reviewer, score, and asset type in `apps/web/src/components/vault/vault-filters.tsx`
- [X] T045 [P] [US5] Create vault grid, timeline, product/campaign grouping, publish package, and search-result views in `apps/web/src/components/vault/vault-views.tsx`
- [X] T046 [US5] Add Vault route with seeded filter state and empty-result variant in `apps/web/src/app/(workspace)/vault/page.tsx`
- [X] T047 [US5] Verify Vault responsive filters, no-match state, and lineage access from `specs/001-ui-screens/quickstart.md`

**Checkpoint**: US5 is independently usable as a searchable mock media library.

---

## Phase 8: User Story 6 - Commerce Catalog, Campaigns, Claims, and Templates (Priority: P2)

**Goal**: Commerce teams inspect product truth, campaign offers, allowed claims, snapshots, and safe enhancement templates.

**Independent Test**: Open `/catalog`, `/campaigns`, and `/templates`; verify complete, incomplete, expired, blocked, snapshot, step graph, and provider-unavailable states.

- [X] T048 [P] [US6] Create catalog table, product media cards, allowed claims, incomplete states, and snapshot history components in `apps/web/src/components/commerce/catalog-screen.tsx`
- [X] T049 [US6] Add Catalog route using seeded products and snapshots in `apps/web/src/app/(workspace)/catalog/page.tsx`
- [X] T050 [P] [US6] Create campaigns list/detail, active products, offer validity, allowed claims, expired state, and Start Session components in `apps/web/src/components/commerce/campaigns-screen.tsx`
- [X] T051 [US6] Add Campaigns route using seeded campaigns and offer states in `apps/web/src/app/(workspace)/campaigns/page.tsx`
- [X] T052 [P] [US6] Create template list/detail, typed safe step graph, allowed creative controls, version status, and provider policy components in `apps/web/src/components/commerce/templates-screen.tsx`
- [X] T053 [US6] Add Templates route using seeded template/provider states in `apps/web/src/app/(workspace)/templates/page.tsx`
- [X] T054 [US6] Verify commerce copy is grounded in allowed claims and blocked/review-required states from `specs/001-ui-screens/quickstart.md`

**Checkpoint**: US6 proves product grounding and safe generation controls without backend integration.

---

## Phase 9: User Story 7 - Admin Recovery and Audit Proof (Priority: P2)

**Goal**: Admins inspect operational failures, technical identifiers, B2 reconciliation, audit records, and UI-only recovery controls.

**Independent Test**: Open `/admin`; verify DLQ, stuck moments, failed runs, B2 reconciliation, provider failures, budget anomalies, audit search, retention queue, orphaned assets, expanded details, disabled actions, and viewer restrictions.

- [X] T055 [P] [US7] Create admin recovery section tabs and dense technical tables in `apps/web/src/components/admin/admin-recovery.tsx`
- [X] T056 [P] [US7] Create recovery detail drawers with event IDs, schema versions, organization IDs, producers, trace IDs, payload previews, B2 keys, checksums, and required-reason controls in `apps/web/src/components/admin/recovery-detail.tsx`
- [X] T057 [US7] Add Admin route with role-sensitive visibility and seeded recovery data in `apps/web/src/app/(workspace)/admin/page.tsx`
- [X] T058 [US7] Verify admin responsive table behavior, mono technical fields, and restricted role states from `specs/001-ui-screens/quickstart.md`

**Checkpoint**: US7 is independently testable as an operational recovery UI with no real actions.

---

## Phase 10: User Story 8 - Settings, Budgets, Providers, Roles, and Retention (Priority: P3)

**Goal**: Owners and admins inspect organization, role, budget, provider, retention, billing, automation, and sensitive confirmation UI states.

**Independent Test**: Open `/settings`; switch owner, admin, reviewer, and viewer role presets; verify restricted sections are hidden/disabled and destructive actions require an explicit reason.

- [X] T059 [P] [US8] Create settings sections for organization, members, roles, capabilities, budgets, automation, retention, providers, and billing in `apps/web/src/components/settings/settings-sections.tsx`
- [X] T060 [P] [US8] Create sensitive action confirmation and disabled-reason controls in `apps/web/src/components/settings/sensitive-actions.tsx`
- [X] T061 [US8] Add Settings route with role preset variants in `apps/web/src/app/(workspace)/settings/page.tsx`
- [X] T062 [US8] Verify settings capability-sensitive controls and confirmation states from `specs/001-ui-screens/quickstart.md`

**Checkpoint**: US8 completes the workspace shell and ownership controls.

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Final quality gates across all routes and screen groups.

- [X] T063 [P] Add analytics overview, operational metrics, media metrics, semantic charts, and empty state in `apps/web/src/app/(workspace)/analytics/page.tsx`
- [X] T064 Audit every route for no backend calls, no credentials, no durable mutations, and explicit seeded/demo-only labels in `apps/web/src/`
- [X] T065 Audit dark-only token usage, royal blue primary actions, no glow/blur/aura gradients, no gradient primary buttons, and mono technical metadata in `apps/web/src/app/globals.css`
- [X] T066 Run responsive visual QA at 375px, 768px, 1024px, and 1440px for all routes listed in `specs/001-ui-screens/quickstart.md`
- [X] T067 Run accessibility QA for icon labels, focus order, dialogs/sheets titles, non-color-only statuses, disabled reasons, timeline text equivalents, and reduced motion in `apps/web/src/`
- [X] T068 Run route walkthrough for Landing -> Demo story -> Setup -> Studio -> Review Queue -> Moment Detail -> Provenance -> Publish -> Share Page from `specs/001-ui-screens/quickstart.md`
- [X] T069 Run `pnpm --filter web lint` from repository root
- [X] T070 Run `pnpm --filter web build` from repository root

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Phase 1 and blocks all user stories.
- **US1-US4 (P1)**: Depend on Phase 2. They should be delivered first for the MVP/golden path.
- **US5-US7 (P2)**: Depend on Phase 2 and can start after the shared mock data and shell exist.
- **US8 (P3)**: Depends on Phase 2 and can be delivered after the P1/P2 operational surfaces.
- **Polish (Phase 11)**: Depends on all desired stories being complete.

### User Story Dependencies

- **US1**: Can start after Phase 2; no dependency on workspace stories.
- **US2**: Can start after Phase 2; feeds the golden path into US3 but remains independently testable.
- **US3**: Can start after Phase 2; uses mock session, commerce, and provenance data.
- **US4**: Can start after Phase 2; uses mock moments, QA, assets, provenance, and publish packages.
- **US5**: Can start after Phase 2; reuses moment and provenance primitives.
- **US6**: Can start after Phase 2; reuses commerce mock data and status primitives.
- **US7**: Can start after Phase 2; reuses admin recovery mock data and role capability states.
- **US8**: Can start after Phase 2; reuses organization and role preset data.

### Parallel Opportunities

- T003 and T004 can run while token/root layout work proceeds.
- T010 and T011 can run in parallel after type definitions exist.
- T014, T015, and T016 can run in parallel because they create separate shared component files.
- US1 component tasks T021, T023, and T025 can run in parallel before route assembly.
- US3 component tasks T032, T033, and T034 can run in parallel before the Studio route.
- US4 component tasks T037, T039, T040, and T041 can run in parallel before route assembly.
- US6 Catalog, Campaigns, and Templates component tasks can run in parallel.
- US7 admin section and detail drawer tasks can run in parallel.
- US8 settings sections and sensitive action tasks can run in parallel.

## Parallel Examples

### User Story 1

```bash
Task: "T021 [P] [US1] Create marketing content modules for hero, proof path, workflow, and CTA in apps/web/src/components/marketing/marketing-sections.tsx"
Task: "T023 [P] [US1] Create demo proof modules for B2, Genblaze, Mastra, product grounding, QA, and provenance in apps/web/src/components/marketing/demo-story.tsx"
Task: "T025 [P] [US1] Create share page components for public, private/access-denied, revoked, expired, and unavailable states in apps/web/src/components/share/share-page.tsx"
```

### User Story 3

```bash
Task: "T032 [P] [US3] Create Live Studio preflight panels for source, catalog snapshot, policy, budget, and provider/storage readiness in apps/web/src/components/studio/studio-preflight.tsx"
Task: "T033 [P] [US3] Create Live Studio control room regions for preview, signal rail, product context, budget policy, and status controls in apps/web/src/components/studio/studio-control-room.tsx"
Task: "T034 [P] [US3] Create candidate progress cards and bottom timeline with text equivalents in apps/web/src/components/studio/studio-timeline.tsx"
```

### User Story 4

```bash
Task: "T037 [P] [US4] Create review queue filters, cards, and state variants in apps/web/src/components/review/review-queue.tsx"
Task: "T039 [P] [US4] Create moment detail tab shell and preview/evidence/facts/QA panels in apps/web/src/components/review/moment-detail.tsx"
Task: "T040 [P] [US4] Create responsive compare component with desktop side-by-side and mobile segmented modes in apps/web/src/components/review/compare-panel.tsx"
Task: "T041 [P] [US4] Create publish package panel with readiness checks, captions, destination variants, facts-changed blocked state, and share preview in apps/web/src/components/review/publish-panel.tsx"
```

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete US1 public proof screens.
3. Complete US2 setup, US3 Live Studio, and US4 Review/Publish.
4. Stop and validate the golden path from landing to share page.

### Incremental Delivery

1. Public understanding and share proof.
2. Setup and Live Studio.
3. Review, provenance, and publish.
4. Vault and commerce management.
5. Admin recovery and Settings.
6. Cross-route QA, lint, and build.

### Notes

- All tasks are UI-only and must avoid real Core API, Clerk, B2, Genblaze, Mastra, NATS, Neon, provider, billing, upload, and publish calls.
- Every generated or published asset surface must show provenance or a link to provenance.
- Product claims must come from seeded catalog/campaign facts and show blocked or review-required state when unsupported.
- All route and QA validation criteria live in `specs/001-ui-screens/quickstart.md`.
