# Quickstart: Validate Lumiq Complete UI Screen System

This quickstart validates the UI-only implementation after tasks are generated and built.
It intentionally does not validate backend behavior.

## Prerequisites

- Node/pnpm workspace dependencies installed.
- `apps/web` has shadcn/ui initialized.
- `apps/web/PRODUCT.md` exists.
- UI mock data exists under the implementation path chosen by tasks.
- No real service credentials are required.

## Setup

```bash
pnpm install
```

Run the web app:

```bash
pnpm --filter web dev
```

Open the local Next.js URL shown by the command, typically:

```text
http://localhost:3000
```

## Required Route Walkthrough

### 1. Public and Marketing

Open:

```text
/
/demo
/share/aster-crossbody-demo
```

Expected:

- Landing page identifies Lumiq as a Live Commerce Moment Vault.
- The first screen shows or explains raw-to-publish lineage.
- Demo page includes B2, Genblaze, Mastra, product grounding, QA, and provenance proof.
- Share page shows approved video placeholder, title, description, product link, provenance
  badge, visibility state, and revoked/private/expired alternatives.

### 2. Setup and Seeded Demo

Open:

```text
/setup
```

Expected:

- Empty organization state is present.
- Seeded demo workspace card shows organization, campaign, product count, allowed claims,
  catalog snapshot, provider readiness, storage readiness, and Start Demo Session.
- Missing catalog/budget/provider states are available.
- Setup completion checklist renders all required items.

### 3. Workspace Shell

Open any workspace route:

```text
/studio
/vault
/review
/catalog
/campaigns
/templates
/analytics
/admin
/settings
```

Expected:

- Topbar renders organization/session context, budget indicator, notifications/errors, and
  user menu.
- Sidebar renders Studio, Vault, Review, Catalog, Campaigns, Templates, Analytics, Admin,
  and Settings.
- Mock role presets hide/disable unauthorized sections or actions.
- Mobile navigation is usable at 375px.

### 4. Live Studio

Open:

```text
/studio
```

Expected:

- Preflight flow shows source choice, catalog snapshot/campaign confirmation, recording
  policy, automation policy, budget caps, and provider readiness.
- Control room shows video preview, signal feed, candidate card, product context,
  budget/policy panel, and bottom timeline.
- Progress chain includes Signal, Candidate, Capture authorized, Raw uploaded, Genblaze
  enhancing, QA, and Review ready.
- Budget blocked, duplicate suppressed, provider unavailable, and generation failed states
  are visible.

### 5. Review and Moment Detail

Open:

```text
/review
/review/mom_aster_reveal
```

Expected:

- Review Queue can show global, publish-ready, needs-review, and failed/remediable views.
- Review cards include enhanced preview, QA, product facts, AI explanation, lineage, and
  approve/rerender/reject actions.
- Detail tabs include Preview, Compare, Evidence, Product facts, QA, Provenance, Versions,
  and Publish.
- Compare is side-by-side on desktop and segmented on mobile.
- QA review-required disables or qualifies approve actions.

### 6. Vault

Open:

```text
/vault
```

Expected:

- Grid, timeline, product/campaign grouping, publish package, and search result views exist.
- Filters exist for session, product, campaign, moment type, status, QA, publish state,
  template, date, reviewer, score, and asset type.
- Empty search/filter state is helpful.
- Cards show or link to lineage.

### 7. Catalog, Campaigns, Templates

Open:

```text
/catalog
/campaigns
/templates
```

Expected:

- Catalog shows products, SKUs, price, inventory, media, URLs, allowed claims, incomplete
  states, snapshot history, and B2 manifest status.
- Campaigns show offers, products, validity windows, allowed claims, expired/blocked state,
  and Start Session entry point.
- Templates show safe typed step graph, template version, allowed creative controls, and
  provider policy summary.

### 8. Publish and Provenance

Open:

```text
/review/mom_aster_reveal
```

Use the Publish and Provenance tabs.

Expected:

- Publish tab shows package preview, title, captions, product links, variants, readiness,
  facts-changed blocked state, and share page action.
- Provenance tab shows compact lineage and full graph.
- Full graph includes raw source, optional live transformed, raw mezzanine, Genblaze run,
  enhanced master, publish variant, publish package, manifests, B2 keys, checksums, and
  trace/run IDs.

### 9. Analytics

Open:

```text
/analytics
```

Expected:

- Operational metrics include capture success, generation success, QA failures, provider
  failures, B2 upload failures, DLQ rate, and cost per clip.
- Media metrics include published clips, downloads/shares, product clicks, and template
  performance.
- Charts use semantic colors, not decorative gradients.

### 10. Admin and Settings

Open:

```text
/admin
/settings
```

Expected:

- Admin sections include DLQ, stuck moments, failed runs, B2 reconciliation, provider
  failures, budget anomalies, audit search, retention queue, and orphaned assets.
- Expanded technical rows show event IDs, schema versions, organization IDs, producers,
  trace IDs, errors, retry counts, payload previews, B2 keys, checksums, and resource links.
- Settings includes organization, members, roles, capabilities, budgets, automation,
  retention, providers, billing, and sensitive-action confirmations.
- Restricted role presets hide or disable admin/billing/retention/provider actions.

## Validation Commands

Run lint:

```bash
pnpm --filter web lint
```

Run build:

```bash
pnpm --filter web build
```

## Responsive QA Checklist

Test every screen group at:

```text
375px
768px
1024px
1440px
```

Pass criteria:

- No text overflows its container.
- No controls overlap.
- Sticky/fixed UI does not cover scroll content.
- Live Studio collapses to a usable mobile control room.
- Review compare switches from side-by-side to segmented single-player layout.
- Admin tables remain readable through horizontal scroll or responsive detail cards.
- Share page remains media-first on mobile.

## Accessibility QA Checklist

- All icon-only controls have accessible names.
- Dialogs, Sheets, and Drawers have titles.
- Focus rings are visible and royal blue.
- Keyboard order follows visual order.
- Status colors are paired with labels/icons.
- Timeline markers have text equivalents.
- Disabled controls explain why they are disabled.
- Reduced motion disables timeline pulses, processing loops, and panel slide movement.

## Design QA Checklist

- Dark mode only.
- No light-mode toggle.
- No glow gradients.
- No blurred gradient backgrounds.
- No aura effects.
- No gradient primary buttons.
- Royal blue primary actions.
- Muted semantic status chips.
- Flat spectral gradient only for AI-active hairlines, small badges, lineage highlights, or
  empty-state accents.
- Pure black media canvas.
- Near-black app panels.
- Technical IDs use mono.
- Provenance is visible on moment cards, review detail, publish package, share page, and
  admin recovery.

## Golden Demo Path Visual Acceptance

The UI implementation passes the golden path when a reviewer can visually walk:

```text
Landing
-> Demo story
-> Seeded setup workspace
-> Live Studio preflight
-> Live Studio detecting candidate
-> Capture/generation progress
-> Review Queue
-> Moment Detail compare
-> Provenance graph
-> Publish Package
-> Share Page
```

The walkthrough must show:

- raw source asset;
- B2 object key;
- checksum;
- generation run ID;
- enhanced master;
- QA status;
- publish package;
- provenance manifest;
- raw -> generated -> published lineage.
