# Feature Specification: Lumiq Complete UI Screen System

**Feature Branch**: `001-ui-screens`

**Created**: 2026-06-27

**Status**: Draft

**Input**: User description: "Build all Lumiq UI screens only: marketing,
onboarding, app shell, Live Studio, Review, Vault, Catalog, Campaigns, Templates,
Analytics, Admin, Settings, publish, provenance, and share pages. No backend
implementation. Be very descriptive and focus on content quality and quantity."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Judge or Prospect Understands Lumiq From Public Screens (Priority: P1)

A judge, founder, or prospective buyer opens Lumiq and immediately understands that it is
a live-commerce moment vault, not a generic AI clipper. They can see the raw-to-published
lineage promise, the role of B2, Genblaze, and Mastra, and a clear path into the seeded
demo workspace.

**Why this priority**: Public comprehension is required before the demo flow can land.
The product differentiator is provenance-backed trust, so the first viewport and public
story must establish that promise.

**Independent Test**: Open the landing page and demo story page without authentication.
The user can explain the product category, the core promise, the technical proof points,
and how to start the seeded demo.

**Acceptance Scenarios**:

1. **Given** an unauthenticated visitor, **When** they open the landing page, **Then** the
   page presents Lumiq as a Live Commerce Moment Vault and shows the source-to-publish
   provenance chain.
2. **Given** a judge reviewing the project, **When** they open the demo story page,
   **Then** they can see what is real, what is simulated, and which screens prove B2,
   Genblaze, Mastra, product grounding, QA, and provenance.
3. **Given** a visitor wants to inspect an approved output, **When** they open a public
   share page, **Then** they see the approved media preview, product link, publication
   state, and a provenance badge or provenance summary.

---

### User Story 2 - Operator Completes Setup and Starts a Seeded Session (Priority: P1)

An owner, admin, editor, or demo operator enters Lumiq and can move through setup-first
onboarding or choose the seeded demo setup. They see organization, catalog, campaign,
allowed claims, catalog snapshot, budget, and provider readiness before entering Live
Studio.

**Why this priority**: Lumiq must not feel like an ungrounded clipper. Setup makes
commerce grounding visible before capture, generation, and publishing.

**Independent Test**: Open the setup route with empty mock state and with seeded demo
state. Verify the UI guides the user through the right setup steps and blocks Live Studio
when required context is absent.

**Acceptance Scenarios**:

1. **Given** an empty organization state, **When** the user opens Lumiq, **Then** they are
   guided into setup before a commerce-grounded session can begin.
2. **Given** a seeded demo workspace, **When** the user views the setup summary, **Then**
   organization name, campaign, product count, allowed claims count, catalog snapshot,
   provider readiness, storage readiness, and Start Demo Session are visible.
3. **Given** setup is incomplete, **When** the user tries to enter preflight, **Then** the
   UI shows a blocked state explaining the missing setup item.

---

### User Story 3 - Host Monitors Live Studio and Sees AI Moment Detection (Priority: P1)

A host or editor opens Live Studio, selects a source during preflight, and monitors the
creator control room. The UI shows the source preview, signal feed, candidate moments,
policy/budget status, active product context, and a bottom timeline with signal tracks and
progress states.

**Why this priority**: Live Studio is the primary product screen and the visual center of
the hackathon golden path.

**Independent Test**: Open Live Studio using mock session states and verify the user can
see preflight, source preview, signal detection, candidate proposal, capture authorization,
raw upload, Genblaze enhancement, QA, and review-ready states without backend services.

**Acceptance Scenarios**:

1. **Given** a prerecorded-live session is running, **When** a product reveal is detected,
   **Then** the timeline shows a marker and the signal feed shows the candidate reason.
2. **Given** high-confidence capture is authorized in mock data, **When** capture progress
   begins, **Then** the candidate card transitions through raw upload, Genblaze enhancing,
   QA, and review-ready states.
3. **Given** budget is exhausted in mock data, **When** a candidate would otherwise trigger
   enhancement, **Then** the UI shows a budget-blocked state and no generation progress is
   presented as active.

---

### User Story 4 - Reviewer Verifies, Compares, Approves, and Publishes a Moment (Priority: P1)

A reviewer opens the Review Queue, selects a pending moment, compares raw and enhanced
media, checks the AI explanation, validates product facts and QA, inspects provenance,
approves the canonical version, and sees a publish package/share page preview.

**Why this priority**: Human verification is central to Lumiq’s trust model. This story
shows the product’s buyer-trust controls and completes the visible golden path.

**Independent Test**: Open Review Queue and Moment Detail with seeded mock review data.
Verify that comparison, evidence, product facts, QA, versions, provenance, publish, and
share preview screens are reachable and render blocked/ready states correctly.

**Acceptance Scenarios**:

1. **Given** a moment is `review_pending`, **When** a reviewer opens Review Queue, **Then**
   the moment appears with enhanced preview, QA status, product fact status, lineage, and
   approve/rerender/reject actions.
2. **Given** raw and enhanced assets exist, **When** a reviewer opens Compare, **Then** the
   desktop layout shows side-by-side players and the mobile layout uses a segmented
   Raw/Enhanced/Published toggle.
3. **Given** the publish package is ready, **When** the reviewer opens Publish, **Then** the
   UI shows package preview, title, captions, product links, readiness checks, and
   provenance reference.

---

### User Story 5 - Operator Searches and Manages the Moment Vault (Priority: P2)

An editor or reviewer browses captured, enhanced, reviewed, and published moments. They
can filter by campaign, product, session, moment type, QA state, publish state, template,
date, reviewer, score, and asset type. They can open lineage or details from any card.

**Why this priority**: The vault makes Lumiq useful beyond the live demo by presenting
captured moments as a searchable reusable media library.

**Independent Test**: Open Vault with mock moment collections and switch between grid,
timeline, product/campaign grouping, publish package, and search result views.

**Acceptance Scenarios**:

1. **Given** moments exist across multiple campaigns, **When** the user filters by campaign
   and QA passed, **Then** only matching mock cards remain visible.
2. **Given** a moment has provenance, **When** the user opens its card, **Then** compact
   lineage is visible and full provenance is reachable.
3. **Given** the vault has no matches, **When** filters produce an empty result, **Then**
   the empty state explains how to revise filters without implying data loss.

---

### User Story 6 - Commerce Team Manages Catalog, Campaigns, Claims, and Templates (Priority: P2)

An editor manages the catalog, product media, SKUs, prices, allowed claims, campaign offers,
snapshot readiness, enhancement templates, step graphs, and allowed creative controls.

**Why this priority**: Commerce grounding is the difference between Lumiq and generic AI
clip generation. The UI must make product truth and safe templates visible.

**Independent Test**: Open Catalog, Campaigns, and Templates screens with complete,
incomplete, expired, and blocked mock states.

**Acceptance Scenarios**:

1. **Given** a product has no allowed claims, **When** the Catalog detail is opened, **Then**
   the UI marks claim coverage as incomplete and explains why generated claims are blocked.
2. **Given** a campaign offer has expired, **When** the Campaign detail is opened, **Then**
   the UI marks the offer expired and publish-related actions show blocked state.
3. **Given** a template step graph is viewed, **When** the user opens Template detail,
   **Then** the UI shows typed safe steps and clearly avoids arbitrary-code language.

---

### User Story 7 - Admin Recovers Operational Failures and Audits Proof (Priority: P2)

An admin opens the Admin/Recovery area and inspects DLQ events, stuck moments, failed runs,
B2 reconciliation issues, provider failures, budget anomalies, audit search, retention
queue, and orphaned assets. They can expand rows and see technical IDs, payload previews,
trace IDs, B2 keys, checksums, and recovery actions as UI-only controls.

**Why this priority**: Lumiq is an operational media system. The admin UI must prove that
failures are visible and recoverable without database surgery.

**Independent Test**: Open Admin with mock recovery data and verify each recovery section,
expanded details, disabled actions, required-reason prompts, and audit visibility.

**Acceptance Scenarios**:

1. **Given** a DLQ event exists, **When** an admin opens Admin/Recovery, **Then** the row
   shows event type, schema version, organization, producer, trace ID, error, retry count,
   and related resources.
2. **Given** the admin expands a B2 reconciliation issue, **When** details open, **Then**
   the UI shows asset row reference, B2 object key, checksum status, manifest reference,
   and anomaly class.
3. **Given** a viewer lacks `admin:recover`, **When** they open app navigation, **Then**
   Admin/Recovery is hidden or disabled according to the selected mock role preset.

---

### User Story 8 - Owner Configures Settings, Budgets, Providers, Roles, and Retention (Priority: P3)

An owner or admin opens Settings and can inspect UI-only controls for organization profile,
members, roles, capabilities, budgets, automation policies, retention, providers, billing,
and sensitive-action confirmation states.

**Why this priority**: Settings complete the product shell and make authorization,
budgets, provider readiness, and retention policies visible.

**Independent Test**: Open Settings with owner, admin, reviewer, and viewer mock role
presets and verify capability-sensitive controls render correctly.

**Acceptance Scenarios**:

1. **Given** an owner opens Settings, **When** they view Members and Roles, **Then** role
   presets and capability groups are visible.
2. **Given** a reviewer opens Settings, **When** restricted sections render, **Then**
   billing, provider, retention, and role mutation controls are hidden or disabled.
3. **Given** a destructive action is selected, **When** the confirmation UI opens, **Then**
   it requires an explicit reason and communicates that backend enforcement is out of
   scope for this UI-only feature.

### Edge Cases

- Empty organization: onboarding must guide setup and avoid dead ends.
- Seeded demo workspace: setup can be preloaded but must still show catalog/campaign truth.
- Missing catalog snapshot: Live Studio preflight and publish readiness must show blocked
  state.
- Expired campaign offer: publish package must show blocked/review-required state.
- No allowed claims: generated commerce copy must be marked blocked or review-required.
- Budget exhausted: enhancement actions must be disabled or warning-styled.
- Provider unavailable: preflight and generation progress must show unavailable state.
- B2 upload failure: progress chain and admin recovery must show failed/recoverable state.
- QA `review_required`: approve action must be disabled or marked as requiring override.
- Private share page opened unauthenticated: show access denied UI, not a broken page.
- Revoked share page: show revoked/unavailable state.
- Viewer role: hide or disable admin, recovery, delete, publish-approve, and billing controls.
- Reduced motion: timeline pulses, loops, and panel slides must become static/fade-only.
- Mobile Live Studio: collapse to a focused single-column experience with preserved status
  and exit controls.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The UI MUST include public marketing and demo story screens that explain
  Lumiq’s product category, golden path, and proof model.
- **FR-002**: The UI MUST include public/private share page states for approved,
  private/access-denied, revoked, expired, and unavailable packages.
- **FR-003**: The UI MUST include setup-first onboarding for empty organization, product
  catalog, campaign/offer, allowed claims, budget/policy, provider/storage readiness, and
  setup completion.
- **FR-004**: The UI MUST include a seeded demo workspace summary with organization,
  campaign, product count, allowed claims count, catalog snapshot status, provider/storage
  readiness, and Start Demo Session.
- **FR-005**: The UI MUST include a hybrid authenticated shell with topbar, left sidebar,
  responsive mobile navigation, and sections for Studio, Vault, Review, Catalog, Campaigns,
  Templates, Analytics, Admin, and Settings.
- **FR-006**: The UI MUST include role/capability-sensitive visual states using mock role
  presets for owner, admin, editor, reviewer, viewer, and host.
- **FR-007**: The UI MUST include Live Studio preflight for source choice, catalog snapshot,
  recording policy, automation policy, budget caps, provider readiness, and validation
  blockers.
- **FR-008**: The UI MUST include Live Studio control room with source preview, session
  status, signal feed, candidate cards, product/campaign context, budget/policy panel, and
  bottom timeline.
- **FR-009**: The UI MUST include candidate progress states for Signal, Candidate, Capture
  authorized, Raw uploaded, Mezzanine ready, Genblaze enhancing, QA running, Review ready,
  Budget blocked, Duplicate suppressed, and Failed.
- **FR-010**: The UI MUST include Review Queue list variants for global, by session, by
  campaign, by product, publish-ready, needs human review, and failed/remediable.
- **FR-011**: The UI MUST include Moment Detail tabs for Preview, Compare, Evidence,
  Product facts, QA, Provenance, Versions, and Publish.
- **FR-012**: The UI MUST include raw/enhanced comparison with desktop side-by-side and
  mobile/tight segmented Raw/Enhanced/Published control.
- **FR-013**: The UI MUST include controlled edit and rerender screens for trim,
  template, captions, hook/title, product card visibility/style, destination variants, and
  AI restyle policy states.
- **FR-014**: The UI MUST include Moment Vault views for grid, session timeline,
  product/campaign grouping, publish packages, and search results.
- **FR-015**: The UI MUST include Catalog screens for product table/cards, SKU, price,
  inventory, URL, product media, allowed claims, incomplete states, and snapshot history.
- **FR-016**: The UI MUST include Campaign screens for campaign list/detail, active
  products, offers, validity windows, allowed claims, expired offers, and Start Session.
- **FR-017**: The UI MUST include Templates screens for template list/detail, safe step
  graph preview, version status, allowed options, and provider policy summary.
- **FR-018**: The UI MUST include Publish Package screens for package preview, title,
  captions, product links, destination variants, readiness checklist, share page creation,
  and changed-facts blocked state.
- **FR-019**: The UI MUST include compact lineage chains and full provenance graph views
  showing raw source, optional live transformed asset, raw mezzanine, Genblaze run,
  enhanced master, publish variant, publish package, manifest links, B2 keys, SHA-256
  checksums, and trace/run IDs.
- **FR-020**: The UI MUST include Analytics screens for capture success, generation
  success, QA failures, provider failures, B2 upload failures, DLQ rate, cost per clip,
  and published content metrics.
- **FR-021**: The UI MUST include Admin/Recovery screens for DLQ, stuck moments, failed
  runs, B2 reconciliation, provider failures, budget anomalies, audit search, retention
  queue, and orphaned assets.
- **FR-022**: The UI MUST include Settings screens for organization, members, roles,
  capabilities, budgets, retention, providers, automation policies, billing, and sensitive
  confirmation UI states.
- **FR-023**: The UI MUST use only mock/seeded frontend data and MUST NOT call real Core
  API, Clerk, B2, Genblaze, Mastra, NATS, Neon, provider, billing, or publish services.
- **FR-024**: The UI MUST clearly label any simulated/demo-only workflow state as UI-only
  or seeded/demo state where it could otherwise be mistaken for real external execution.
- **FR-025**: The UI MUST expose empty, loading, error, blocked, disabled, ready,
  processing, review-required, and success states for each major screen group.
- **FR-026**: The UI MUST be responsive at 375px, 768px, 1024px, and 1440px viewports.
- **FR-027**: The UI MUST provide accessible names for icon-only controls, maintain
  keyboard focus order, avoid color-only status indicators, and support reduced motion.
- **FR-028**: The UI MUST keep technical IDs, B2 keys, checksums, timestamps, manifests,
  event IDs, trace IDs, and JSON snippets in mono typography.
- **FR-029**: The UI MUST use shadcn/ui composition for standard controls where
  components are available instead of ad hoc custom controls.
- **FR-030**: The UI MUST include a root product context document for design tooling
  (`apps/web/PRODUCT.md`) before implementation begins.

### Constitutional Requirements

- **CR-001**: The feature MUST reference the relevant Lumiq requirement IDs from
  `docs/product/04-requirements-ears.md`: `REQ-UI-*`, `REQ-DEMO-*`, `REQ-PROV-*`,
  `REQ-AUTH-*`, `REQ-CATALOG-*`, `REQ-CAPTURE-*`, `REQ-GEN-*`, `REQ-QA-*`,
  `REQ-PUBLISH-*`, `REQ-AUDIT-*`, `REQ-ADMIN-*`, `REQ-DESIGN-*`, and `REQ-NFR-*`.
- **CR-002**: The feature MUST remain UI-only. Any displayed state change must be backed
  by mock data or local component state and must not imply actual Core API mutation.
- **CR-003**: Any media, publish, or provenance UI MUST define raw source, asset records,
  B2 object keys, checksums, manifests, and lineage using mock data that respects Lumiq
  naming and tenant key conventions.
- **CR-004**: Any product claim or commerce copy displayed by the UI MUST be grounded in
  mock catalog/campaign facts and must show blocked/review-required state for unsupported
  claims.
- **CR-005**: Any agent, LLM, worker, event, provider, or publish behavior displayed by the
  UI MUST be represented as visual state only and must include schema/trace/ID details
  where relevant.
- **CR-006**: All UI must follow `docs/design/DESIGN.md`, `docs/design/variables.css`,
  `docs/design/theme.css`, and `docs/design/tokens.json`: dark-only, flat gradients only,
  no glow, no blur aura, royal blue primary actions, semantic status colors, and visible
  provenance.

### Key Entities *(include if feature involves data)*

- **Screen Route**: A user-reachable page or nested view, including its route, screen group,
  required mock state, layout shell, and responsive behavior.
- **Screen State**: A named state variant for a route or component, such as empty, loading,
  blocked, processing, review-required, failed, ready, approved, revoked, or disabled.
- **Mock Organization**: Seeded tenant summary used by shell, setup, catalog, settings, and
  capability-sensitive UI.
- **Mock Role Preset**: UI-only role/capability bundle used to show or disable controls.
- **Mock Product**: Catalog item with SKU, price, URL, media references, allowed claims,
  inventory, and completeness state.
- **Mock Campaign**: Campaign or offer container with active products, offer terms,
  validity, allowed claims, and expired/active state.
- **Catalog Snapshot**: UI representation of frozen product/campaign facts, including
  snapshot ID, product count, claim count, B2 manifest status, and created time.
- **Session**: UI representation of live/prerecorded session state, source type, status,
  recording policy, automation policy, budget, and timeline.
- **Signal Event**: UI feed item representing detection signals, candidate proposals,
  policy decisions, worker progress, or failures.
- **Moment**: UI representation of a candidate/captured/generated commerce interval, with
  type, score, state, evidence, product match, QA, versions, assets, and publish state.
- **Asset Reference**: UI-only asset node with role, bucket, object key, checksum,
  verification status, manifest link, and media preview placeholder.
- **Generation Run Reference**: UI-only Genblaze/provider run summary with run ID, template,
  provider, model, status, cost, timing, and manifest.
- **QA Summary**: UI representation of QA stage, status, failure class, issues, blockers,
  and remediation/review state.
- **Review Item**: Review queue row/card combining moment, media preview, QA, facts,
  lineage, and available actions.
- **Lineage Node**: Provenance graph node with role, status, ID, timestamp, B2 key,
  checksum, provider/model if applicable, and disclosure level.
- **Publish Package**: UI representation of publish package state, media, thumbnail,
  captions, title, description, hashtags, product links, destination variants, and
  provenance reference.
- **Share Page State**: Public/private/revoked/expired/access-denied state for package
  viewing.
- **Admin Recovery Item**: DLQ/stuck/failed/reconciliation/audit row with trace, error,
  retry, resource links, payload preview, and action eligibility.
- **Analytics Metric**: UI-only metric/chart datum with semantic status and timeframe.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can navigate from landing page to seeded demo setup, Live Studio,
  Review Queue, Provenance Panel, Publish Package, and Share Page without hitting a blank
  or unimplemented route.
- **SC-002**: All primary workspace sections from the PRD render a route or screen:
  Studio, Vault, Review, Catalog, Campaigns, Templates, Analytics, Admin, and Settings.
- **SC-003**: The required demo screens from `docs/demo/26-hackathon-demo-submission-spec.md`
  are all present: Setup/Demo workspace, Live Studio, Review Queue/Moment Detail,
  Provenance Panel, and Share Page.
- **SC-004**: Every major screen group includes at least five state variants across empty,
  loading, ready, processing, blocked, failed, review-required, disabled, or revoked states.
- **SC-005**: At least one visible provenance chain appears in Moment Card, Review Detail,
  Publish Package, Share Page, and Admin/Recovery screens.
- **SC-006**: At least one screen visibly shows B2 object key, SHA-256 checksum,
  generation run ID, manifest reference, catalog snapshot ID, and trace ID using mono
  typography.
- **SC-007**: Visual QA at 375px, 768px, 1024px, and 1440px finds no unreadable overflow,
  incoherent overlap, clipped controls, or hidden fixed-position content.
- **SC-008**: Design QA confirms dark-only UI, no light-mode toggle, no glow/blur/aura
  gradients, no gradient primary buttons, royal blue primary actions, muted semantic
  statuses, and token-driven colors/radii/spacing.
- **SC-009**: Accessibility QA confirms all icon-only controls have labels, status colors
  are paired with text/icons, keyboard focus is visible, dialogs/sheets have titles, and
  reduced-motion mode disables pulses/loops.
- **SC-010**: `pnpm --filter web lint` and `pnpm --filter web build` complete after the
  implementation phase.

## Assumptions

- This feature creates UI screens and UI planning artifacts only; backend integration is
  explicitly out of scope.
- The first implementation may use static mock data, route-level mock state, or component
  local state. It must not introduce real service clients.
- The app target is `apps/web`, which currently uses Next.js 16.2.9, React 19.2.4,
  Tailwind CSS v4, and TypeScript.
- shadcn/ui is not initialized yet; implementation should initialize it before composing
  standard UI controls.
- `docs/design/*` is authoritative for Lumiq visual direction even when generic design
  skills recommend conflicting choices.
- `apps/web/PRODUCT.md` should be created as a design-context prerequisite before
  implementation because `impeccable` requires it.
- Existing default Next starter UI should be replaced by Lumiq routes and screen system.
- UI copy can use seeded demo scenario content from `docs/demo/26-hackathon-demo-submission-spec.md`.
