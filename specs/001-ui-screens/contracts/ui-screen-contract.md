# UI Screen Contract: Lumiq Complete UI Screen System

This contract defines what the UI implementation must expose to users and to future
implementers. It is not an API contract and does not authorize backend work.

## Contract Scope

The implementation MUST:

- render all screen groups listed here;
- use seeded/mock frontend data only;
- expose all required route and state variants;
- preserve Lumiq terminology and design rules;
- avoid real service calls and durable mutations.

The implementation MUST NOT:

- call Core API, Clerk, B2, Genblaze, Mastra, NATS, Neon, provider APIs, publish adapters,
  billing systems, or upload endpoints;
- create database migrations;
- create OpenAPI/AsyncAPI/schema changes;
- store secrets or credentials;
- claim that a simulated state represents real external execution.

## Route Map

### Public Routes

| Route | Screen | Required States |
|---|---|---|
| `/` | Marketing landing | default, reduced-motion, mobile |
| `/demo` | Demo story / judge proof | default, fallback-mode disclosure |
| `/share/[shareSlug]` | Share page | public, private/access-denied, revoked, expired, unavailable |

### Workspace Routes

| Route | Screen | Required States |
|---|---|---|
| `/setup` | Setup-first onboarding | empty org, incomplete, seeded demo ready, blocked |
| `/studio` | Preflight + Live Studio | preflight, live, candidate, enhancing, blocked, failed |
| `/vault` | Moment Vault | grid, timeline, grouped, search results, empty |
| `/review` | Review Queue | global, publish-ready, needs-review, failed/remediable |
| `/review/[momentId]` | Moment Detail | preview, compare, evidence, facts, QA, provenance, versions, publish |
| `/catalog` | Product Catalog | table, card, detail, incomplete, snapshot ready |
| `/campaigns` | Campaigns | list, detail, active, expired, publish-blocked |
| `/templates` | Enhancement Templates | list, detail, step graph, versioned, unavailable provider |
| `/analytics` | Analytics | overview, operational, media performance, empty |
| `/admin` | Admin/Recovery | DLQ, stuck moments, failed runs, B2 reconciliation, audit |
| `/settings` | Settings/Billing | org, members, roles, budgets, retention, providers, restricted |

## Layout Contract

### Public Layout

- No authenticated sidebar.
- Uses dark cinematic marketing spacing.
- Shows product identity and proof path in first viewport.
- May use larger display typography and rare flat gradient accents.
- Must not use glow, aura, blurred gradients, or gradient buttons.

### Workspace Layout

- Topbar includes organization switcher mock, session context, budget indicator,
  notifications/errors, and user menu.
- Sidebar includes Studio, Vault, Review, Catalog, Campaigns, Templates, Analytics, Admin,
  Settings.
- Desktop keeps sidebar visible.
- Mobile collapses navigation and preserves active route context.
- Live Studio may use focused mode but must retain exit and status controls.

### Share Layout

- Optimized for approved media viewing.
- Shows access/visibility state clearly.
- Provenance badge or summary is visible when allowed.
- Does not expose admin technical panels unless mock permissions allow.

## Screen Group Contracts

### Marketing / Demo Contract

Required content:

- Product name: Lumiq.
- Category: Live Commerce Moment Vault.
- Core promise: every polished commerce asset can be traced to exact source moment, raw
  source, catalog snapshot, generation run, QA result, publish package, and manifest.
- Proof modules: B2 storage, Genblaze generation, Mastra recommendation, product grounding,
  QA/review, provenance graph.
- CTA into seeded demo workspace.

Required visual rules:

- First viewport must include a concrete product/workflow visual, not generic abstract art.
- No hero metric cliché as the main structure.
- No repeated identical feature-card grid.

### Setup Contract

Required checklist items:

- Organization created/selected.
- Brand name confirmed.
- Products added.
- Product media added.
- Allowed claims added.
- Campaign/offer added.
- Catalog snapshot ready.
- Budget policy set.
- Provider/storage readiness confirmed.
- Live Studio ready.

Required blocked states:

- Missing catalog.
- Missing campaign for offer claims.
- Missing allowed claims.
- Missing budget policy.
- Provider unavailable.
- Storage unavailable.

### Live Studio Contract

Required regions:

- Topbar session controls.
- Left workspace navigation.
- Main video preview.
- Right signal rail.
- Product/campaign context panel.
- Budget/policy panel.
- Bottom timeline.

Required progress chain:

```text
Signal -> Candidate -> Capture authorized -> Raw uploaded -> Genblaze enhancing -> QA -> Review ready
```

Required candidate card content:

- Moment type.
- Confidence score.
- AI explanation.
- Product match.
- Policy state.
- Budget state.
- Evidence summary.
- Current progress step.

### Review Contract

Required review card content:

- Enhanced preview.
- Moment type.
- Product/campaign.
- QA status.
- Product fact status.
- Short AI explanation.
- Lineage mini-chain.
- Primary action.
- Secondary actions.

Required detail tabs:

- Preview.
- Compare.
- Evidence.
- Product facts.
- QA.
- Provenance.
- Versions.
- Publish.

### Compare Contract

Desktop:

- Raw source/mezzanine player on left.
- Enhanced master player on right.
- Shared metadata row: duration, source range, final trim, captions, product card, restyle.

Mobile/tight:

- Single player.
- Segmented control: Raw, Enhanced, Published.
- Metadata below.

### Vault Contract

Required views:

- Grid.
- Session timeline.
- Product/campaign grouping.
- Published packages.
- Search results.

Required filters:

- Session, product, campaign, moment type, status, QA state, publish state, template, date,
  reviewer, score, asset type.

### Catalog and Campaign Contract

Catalog must show:

- Product table.
- Product media cards.
- SKU, price, inventory, URL.
- Allowed claims.
- Incomplete data states.
- Snapshot history.
- B2 manifest status.

Campaigns must show:

- Campaign list/detail.
- Active products.
- Offer terms.
- Validity window.
- Allowed campaign claims.
- Expired/blocked state.
- Start Session entry point.

### Templates Contract

Templates must show:

- Template list.
- Template detail.
- Template version.
- Typed safe step graph.
- Allowed creative controls.
- Provider policy summary.
- Template unavailable/provider unavailable states.

The UI must state or imply that templates compile into safe typed step graphs and do not
expose arbitrary shell commands, arbitrary FFmpeg strings, arbitrary provider calls, or
user-defined executable code.

### Publish Contract

Required package contents:

- Video asset.
- Thumbnail.
- Captions.
- Title.
- Description.
- Hashtags.
- Product links.
- Provenance manifest reference.
- Destination variants.

Required states:

- Draft.
- Ready.
- Review pending.
- Approved.
- Published.
- Failed.
- Revoked.
- Deleted.
- Facts changed before publish.

### Provenance Contract

Compact lineage chain:

```text
Raw -> Transform -> Enhance -> Publish
```

Full graph:

```text
raw_source_asset
  -> live_transformed_asset optional
  -> raw_mezzanine_asset
  -> generation_run / Genblaze
  -> enhanced_master_asset
  -> publish_variant_asset
  -> publish_package
```

Each node must show:

- Role/name.
- Status.
- Short ID.
- Created time.
- Provider/model if relevant.
- Checksum status.
- B2 object key when disclosure allows.
- Manifest link when available.

### Analytics Contract

Required operational metrics:

- Capture success.
- Generation success.
- QA failure rate.
- Provider failure rate.
- B2 upload failure rate.
- DLQ rate.
- Cost per clip.

Required media metrics:

- Published clips.
- Downloads/shares.
- Product clicks.
- Template performance.

Charts must use semantic colors for operational states. Spectral gradients are only for
AI/provenance path visualization.

### Admin/Recovery Contract

Required sections:

- DLQ.
- Stuck Moments.
- Failed Runs.
- B2 Reconciliation.
- Provider Failures.
- Budget Anomalies.
- Audit Search.
- Retention Queue.
- Orphaned Assets.

DLQ item detail must show:

- Event ID.
- Event type.
- Schema version.
- Organization ID.
- Producer.
- Trace ID.
- Error.
- Retry count.
- Payload preview.
- Related resource links.
- Actions: retry, mark terminal, skip, open trace, open resource.

### Settings Contract

Required sections:

- Organization.
- Members.
- Roles.
- Capabilities.
- Budgets.
- Automation policies.
- Retention.
- Providers.
- Billing.
- Sensitive action confirmations.

Restricted states must be visible under reviewer/viewer mock role presets.

## Component State Contract

Every major component must support these state categories where relevant:

- default;
- hover/focus/active;
- disabled with reason;
- loading/skeleton;
- empty;
- blocked;
- warning;
- failed;
- review-required;
- success/ready;
- reduced-motion.

## Design Contract

The UI must comply with:

- dark mode only;
- primary actions royal/cobalt blue;
- pure black media canvas;
- near-black panels;
- muted semantic status colors;
- flat spectral gradients only for AI-active hairlines, small badges, empty states, and
  lineage highlights;
- no glow, no blur aura, no page-wide gradient backgrounds;
- no gradient primary buttons;
- Inter for UI;
- Geist Mono or equivalent mono for technical data;
- token/radius/spacing values from `docs/design/*`;
- visible provenance on generated/published media.

## Acceptance Contract

The implementation is acceptable when:

- all routes in this contract render;
- all required states can be reached through route mocks, UI controls, or documented state
  toggles;
- no route requires a backend service;
- build and lint pass;
- responsive QA passes at 375/768/1024/1440;
- reduced-motion mode remains understandable;
- keyboard and screen reader basics are preserved;
- the seeded demo path can be walked visually from landing to share page.
