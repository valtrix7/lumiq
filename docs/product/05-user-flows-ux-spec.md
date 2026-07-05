# 05 — User Flows & UX Specification

**Project:** Lumiq — Live Commerce Moment Vault  
**Document ID:** `05-user-flows-ux-spec.md`  
**Status:** Draft v1  
**Audience:** product, design, frontend engineering, backend engineering, QA, AI coding agents  
**Depends on:** `00-spec-index.md`, `01-product-requirements.md`, `02-project-constitution.md`, `03-glossary-domain-language.md`, `04-requirements-ears.md`, Lumiq design-system files.

---

## 1. Purpose

This document defines the user flows, screen-level UX behavior, interaction states, information architecture, and golden-path user experience for Lumiq.

Lumiq is a dark-only AI media operations platform for live commerce. It detects valuable live-shopping moments, captures raw source evidence, generates polished clips through Genblaze, stores outputs/manifests in Backblaze B2, and exposes provenance so users can verify exactly how a polished clip was produced.

This UX spec is **production-first**, with a clearly marked **hackathon golden path** for implementation and demo.

---

## 2. Research-informed UX Principles

Lumiq’s UX must not present AI as a magical black box that users blindly trust. The interface must support verification, explanation, and control.

Relevant research signals used to shape this UX:

1. Human-AI decision-support systems often over-focus on algorithm output while under-designing interaction patterns. Lumiq must treat human-AI collaboration as an explicit flow, not just “AI says yes/no.”
2. End-user AI explanations should be understandable, trustworthy, transparent, controllable, and focused on key decisions rather than overwhelming users with all internals.
3. Automation bias is a real risk. Explanations alone are insufficient; the UX should make users verify important outputs, especially product facts, restyling, publishing, and deletion.
4. Human-in-the-loop systems have different levels of user control. Lumiq intentionally uses a mixed pattern: automation proposes and performs safe bounded work, but humans approve sensitive actions.

UX implications:

```txt
AI recommendations must be visible.
AI confidence must be paired with evidence.
Users must be able to inspect why a moment was captured.
Users must be able to compare raw vs enhanced outputs.
Product facts must be shown before publishing.
Sensitive actions require explicit approval.
Technical provenance must be available on demand.
```

---

## 3. UX Scope

This document covers:

```txt
workspace information architecture
first-run setup
catalog/campaign setup
Live Studio preflight
Live Studio control room
moment detection UX
capture and generation progress
Review Queue
Moment Vault
moment detail view
raw/enhanced comparison
provenance graph
publish package creation
share page
admin/recovery flows
empty/loading/error states
screen-level acceptance criteria
hackathon golden path
```

This document does not define:

```txt
database schema
OpenAPI contract
NATS event contract
provider API internals
exact CSS token values
component implementation code
```

---

## 4. UX Strategy

### 4.1 Production-first with hackathon path

The UX spec describes the intended production product across setup, live session, capture, review, publish, search, and admin. The first build, however, should prioritize the golden path:

```txt
setup product/catalog/campaign
→ start prerecorded-live session
→ detect product reveal moment
→ Mastra agent recommendation
→ policy-authorized raw capture
→ B2 raw storage
→ Genblaze enhancement
→ QA pass
→ review approval
→ publish package/share page
→ provenance graph
```

### 4.2 Setup-first onboarding

The user selected **setup-first onboarding**. This means Lumiq should require real setup before entering a commerce-grounded Live Studio flow.

For hackathon/demo, Lumiq may preload seeded setup data, but the UX must still make catalog/campaign context visible so the product does not feel like a generic clipper.

```txt
Real workspace:
  setup-first

Hackathon/demo workspace:
  seeded setup allowed, but catalog/campaign/product truth must appear real in UI
```

### 4.3 Human-AI collaboration pattern

Lumiq uses a **human-supervised AI workflow**:

```txt
AI detects/proposes.
Policy authorizes safe bounded automation.
Humans verify important outputs.
System preserves provenance.
```

UX must avoid both extremes:

```txt
Too magical:
  "AI made a clip, trust us."

Too technical:
  "Here are 40 logs before you can approve."

Correct:
  "Here is the clip, why AI selected it, what facts were used, how it was generated, and what needs your approval."
```

---

## 5. Actors and UX Permissions

### 5.1 Human roles

```txt
Owner
Admin
Editor
Reviewer
Viewer
Host
```

### 5.2 Role-based UX summary

| Role | Main UX access |
|---|---|
| Owner | All workspace areas, billing, retention, deletion, admin/recovery |
| Admin | Workspace, recovery, audit, settings, most operational controls |
| Editor | Catalog, campaigns, sessions, generation, rerender, publish package creation |
| Reviewer | Review queue, approve/reject, compare, inspect evidence/provenance |
| Viewer | Read-only vault, share pages, approved outputs |
| Host | Live Studio/session operation, source selection, basic candidate view |

### 5.3 Capability-sensitive UI

The frontend must not show or must disable controls the user cannot perform.

Examples:

```txt
asset:delete missing:
  hide or disable delete button

publish:approve missing:
  show publish status but hide approval action

audit:view missing:
  hide deep audit panel

generation:rerun missing:
  hide rerender action
```

Backend authorization remains mandatory even if UI hides controls.

---

## 6. Information Architecture

### 6.1 App shell

Lumiq uses a hybrid shell:

```txt
Topbar:
  organization switcher
  session context
  budget indicator
  notifications/errors
  user menu

Left sidebar:
  Studio
  Vault
  Review
  Catalog
  Campaigns
  Templates
  Analytics
  Admin
  Settings
```

### 6.2 Primary sections

| Section | Purpose |
|---|---|
| Studio | Start/monitor live or prerecorded-live sessions |
| Vault | Browse captured/generated moments and publish packages |
| Review | Review pending clips, QA states, product facts, rerenders |
| Catalog | Manage products, SKUs, claims, product media |
| Campaigns | Manage offers, product groups, campaign context |
| Templates | Manage enhancement templates and allowed options |
| Analytics | Operational and media performance analytics |
| Admin | DLQ, failures, reconciliation, audit, recovery |
| Settings | Org, members, roles, budgets, retention, providers |

### 6.3 Navigation behavior

```txt
Sidebar remains visible on desktop.
Topbar remains visible on all authenticated app screens.
Live Studio may enter focused mode but must retain exit/status controls.
Admin views use compact density.
Media/review views use larger previews.
```

---

## 7. First-run Setup Flow

### 7.1 Goal

Ensure the user has enough product/campaign context before starting a commerce-grounded session.

### 7.2 Flow type

**Setup-first** for real app use.

Seeded demo may bypass manual work by preloading setup data.

### 7.3 Setup steps

```txt
1. Create organization / select organization
2. Confirm brand name
3. Create or import product catalog
4. Add product media
5. Add allowed product claims
6. Create campaign / offer
7. Confirm budget and automation policy
8. Confirm provider readiness
9. Enter Live Studio preflight
```

### 7.4 Required vs optional setup

| Setup item | Real commerce session | Demo/seeded session |
|---|---|---|
| Organization | Required | Preloaded or required |
| Product catalog | Required for commerce-grounded mode | Preloaded |
| Campaign/offer | Required if offer/price claims are used | Preloaded |
| Product claims | Required for claim overlays | Preloaded |
| Brand settings | Optional | Preloaded defaults |
| Provider config | Required if not using platform keys | Preloaded or platform-managed |
| Budget policy | Required | Preloaded |

### 7.5 First-run screen states

#### Empty organization state

User sees:

```txt
Welcome to Lumiq
Set up your live-commerce vault before starting a session.
```

Primary action:

```txt
Set up workspace
```

Secondary action:

```txt
View seeded demo setup
```

#### Product catalog setup screen

Must support:

```txt
manual product creation
CSV import later
product image upload/reference
SKU field
product URL
price field
claim entry
offer/campaign association
```

#### Campaign setup screen

Must support:

```txt
campaign name
active products
offer terms
offer start/end
allowed claims
publish destinations later
```

#### Setup completion screen

Shows checklist:

```txt
Organization created
Products added
Campaign/offer added
Catalog snapshot ready
Budget policy set
Live Studio ready
```

### 7.6 Acceptance criteria

```txt
Given a new user has no organization setup
When they open Lumiq
Then they are guided into setup before a commerce-grounded Live Studio session.

Given a seeded demo workspace exists
When the user chooses the demo
Then sample catalog, campaign, source video, and budget policy are already present.

Given a user attempts commerce-grounded Live Studio without product setup
When preflight runs
Then the system blocks and explains which setup item is missing.
```

---

## 8. Catalog and Campaign Setup Flow

### 8.1 Purpose

Catalog and campaign setup makes commerce-grounded generation safe. The system cannot reliably render product cards, prices, offer claims, or publish copy without structured facts.

### 8.2 Catalog flow

```txt
Catalog Home
  → Add Product
  → Add SKU / name / URL / price
  → Add product images/media
  → Add allowed claims
  → Save product
```

### 8.3 Campaign flow

```txt
Campaigns
  → New Campaign
  → Select products
  → Add offer terms
  → Add offer validity dates
  → Confirm allowed campaign claims
  → Save campaign
```

### 8.4 Catalog snapshot moment

When a session starts, the UI should show:

```txt
catalog_snapshot_id
created_at
product count
offer count
claim count
B2 manifest status
```

### 8.5 UX rules

```txt
Claims must be explicit.
AI-suggested claims must not silently become allowed claims.
Expired offers must be visibly expired.
Unverified product data must be marked incomplete.
```

### 8.6 Acceptance criteria

```txt
Given a product has no allowed claims
When an AI caption suggests a product claim
Then the UI should show the claim as blocked or review-required.

Given a campaign offer has expired
When the user tries to publish a package using it
Then the UI blocks publish and explains the expired offer.
```

---

## 9. Live Studio Preflight Flow

### 9.1 Purpose

The preflight prevents unsafe or ungrounded live sessions.

### 9.2 Entry points

```txt
Sidebar → Studio
Campaign page → Start session
Product page → Start session with product
Seeded demo → Start demo session
```

### 9.3 Preflight steps

```txt
1. Choose source
2. Confirm catalog snapshot/campaign
3. Confirm recording policy
4. Confirm AI detection/enhancement policy
5. Confirm budget caps
6. Start Live Studio
```

### 9.4 Source options

P0:

```txt
prerecorded-live
browser camera if available
```

P1/P2:

```txt
screen share
OBS/RTMP
external livestream adapter
```

### 9.5 Recording policy options

```txt
Moment-only storage default
Full session recording optional
Live-transformed capture if audience-visible or lineage-relevant
```

### 9.6 Automation policy options

```txt
High confidence:
  auto-capture, optionally auto-enhance within budget

Medium confidence:
  capture and queue for review

Low confidence:
  store signal only
```

### 9.7 Preflight validation

Preflight must validate:

```txt
source available
catalog snapshot exists for commerce-grounded mode
campaign/offer exists if offer claims are enabled
budget cap exists
capture policy exists
provider/generation path available
user has session:create capability
```

### 9.8 Acceptance criteria

```txt
Given a user has product catalog and campaign setup
When they open preflight
Then the catalog/campaign is selectable or preselected.

Given no budget policy exists
When the user tries to start
Then the UI blocks start and asks for budget policy.

Given prerecorded-live source is selected
When preflight completes
Then Live Studio opens with the video source ready.
```

---

## 10. Live Studio Control Room

### 10.1 Purpose

Live Studio is the creator control room where the host/operator monitors a session, sees AI signals, and watches candidate moments appear.

### 10.2 Layout

Desktop layout:

```txt
Topbar:
  session title
  source status
  budget indicator
  recording policy
  end session button

Left sidebar:
  main app navigation

Main center:
  large source video preview
  optional transformed preview toggle

Right rail:
  signal feed
  candidate moments
  product/campaign context
  active policy

Bottom:
  timeline with signal tracks and moment markers
```

### 10.3 Live Studio panels

#### Video preview

Shows:

```txt
raw source preview
optional live-transformed preview
connection/source state
recording indicator
current session timer
```

#### Signal feed

Shows recent detections:

```txt
product visible
offer keyword
audio energy peak
manual marker
candidate proposed
capture authorized
generation requested
```

#### Product context panel

Shows:

```txt
active campaign
catalog snapshot ID
matched product candidates
allowed claims
active offer
```

#### Budget/policy panel

Shows:

```txt
session budget remaining
auto-captures used
auto-enhancements used
provider status
```

#### Timeline

Shows:

```txt
current playback/live position
signal tracks
candidate markers
capture windows
accepted/rejected states
processing states
```

### 10.4 Moment detection UX

When a candidate is detected:

```txt
1. timeline marker appears
2. signal feed shows candidate reason
3. right rail displays candidate card
4. policy state shows pending/authorized/denied
5. if authorized, capture progress appears
```

### 10.5 Confidence-tiered behavior

| Confidence / policy | UX behavior |
|---|---|
| High confidence + budget allowed | Auto-capture; may auto-enhance; show “Captured” and “Enhancing” |
| Medium confidence | Capture raw; queue for review before enhancement |
| Low confidence | Signal marker only; no capture by default |
| Duplicate | Show suppressed/linked candidate if useful |
| Budget blocked | Show budget warning and no enhancement |

### 10.6 AI explanation in Live Studio

Default explanation should be short:

```txt
Captured because the product was shown close-up and the host mentioned today's offer.
```

Expandable details:

```txt
signal scores
transcript excerpt
product match
policy decision
budget decision
agent recommendation
```

### 10.7 Acceptance criteria

```txt
Given a live/prerecorded-live session is running
When a product reveal is detected
Then the timeline shows a marker and the signal feed shows a candidate.

Given high-confidence capture is authorized
When capture begins
Then the candidate card shows capture progress and then raw_uploaded state.

Given budget is exhausted
When a candidate would otherwise trigger enhancement
Then the UI shows budget-blocked state and no generation begins.
```

---

## 11. Capture and Generation Progress UX

### 11.1 Purpose

Users should understand what the system is doing after a moment is detected.

### 11.2 Progress model

Progress is lineage-aware:

```txt
Detected
→ Capture authorized
→ Raw uploaded
→ Mezzanine ready
→ Genblaze enhancing
→ QA running
→ Review ready
```

### 11.3 Visual pattern

Use a compact progress chain:

```txt
Signal → Raw → Mezzanine → Genblaze → QA → Review
```

State styling:

```txt
current = royal blue
completed = muted success
blocked = muted warning/danger
not started = neutral
AI-active = optional flat spectral hairline
```

### 11.4 Progress detail drawer

Expandable drawer shows:

```txt
moment_id
generation_run_id if available
asset IDs
current worker
event status
B2 object refs when ready
errors/retries
```

### 11.5 Acceptance criteria

```txt
Given a moment is being enhanced
When the user opens the moment card
Then the progress chain shows the current artifact creation step.

Given generation fails
When the user opens details
Then the UI shows failure class and retry/review options if permitted.
```

---

## 12. Review Queue Flow

### 12.1 Purpose

Review Queue is where humans verify generated clips, product facts, QA, and publish readiness.

### 12.2 Review queue views

```txt
Global review queue
By session
By campaign
By product
Publish-ready
Needs human review
Failed/remediable
```

### 12.3 Review card default

A review card should show:

```txt
enhanced clip preview
moment type
product/campaign
QA status
product fact status
short AI explanation
lineage mini-chain
primary action
secondary actions
```

Primary actions:

```txt
Approve
Reject
Rerender
```

Secondary actions:

```txt
Compare raw/enhanced
View evidence
View provenance
Edit controlled fields
```

### 12.4 Publish-readiness card

The selected default is a publish-readiness card.

It includes:

```txt
enhanced preview
raw comparison access
QA summary
product fact confirmation
approved claims
publish package readiness
approve/rerender/reject controls
```

### 12.5 Review detail view

Tabs:

```txt
Preview
Compare
Evidence
Product facts
QA
Provenance
Versions
Publish
```

### 12.6 Human verification behavior

The UI should actively support independent verification:

```txt
show raw/enhanced compare
show product facts
show AI reason
show QA issues
show uncertain matches
show publish blockers
```

Do not hide all evidence behind admin-only views.

### 12.7 Acceptance criteria

```txt
Given a moment is review_pending
When a reviewer opens Review Queue
Then the moment appears with enhanced preview, QA status, product fact status, and actions.

Given the reviewer expands evidence
When evidence loads
Then transcript excerpts, signal reasons, product match, and policy decisions are visible.

Given QA status is review_required
When the reviewer opens the card
Then approve is disabled or requires explicit override according to capability.
```

---

## 13. Raw vs Enhanced Compare Flow

### 13.1 Desktop

Use side-by-side players:

```txt
Left: raw source / raw mezzanine
Right: enhanced master
```

Optional third tab:

```txt
published variant
```

### 13.2 Mobile/tight layout

Use a single player with segmented toggle:

```txt
Raw
Enhanced
Published
```

### 13.3 Comparison metadata

Show:

```txt
duration
source time range
final trim range
caption status
product card status
AI restyle status
```

### 13.4 Acceptance criteria

```txt
Given raw and enhanced assets exist
When a reviewer opens Compare
Then both can be played and inspected.

Given only raw exists
When Compare opens
Then the enhanced side shows generation status or empty state.
```

---

## 14. Controlled Edit and Rerender Flow

### 14.1 Editable fields

Reviewers/editors may adjust:

```txt
trim start/end
template choice
caption text
hook/title
product card visibility
product card style
destination variants
AI restyle toggle if policy allows
```

### 14.2 Non-editable fields

Users may not directly edit:

```txt
verified product facts beyond allowed override flow
raw source asset
B2 object keys
checksums
generation run records
audit logs
retention policy unless authorized
```

### 14.3 Rerender flow

```txt
1. User edits allowed fields
2. UI validates claims/product facts
3. User clicks Rerender
4. Core API creates new generation_run
5. NATS emits generation.requested
6. Genblaze Worker creates new output
7. QA runs
8. Review Queue shows new version
```

### 14.4 Acceptance criteria

```txt
Given reviewer changes caption text
When caption contains ungrounded product claim
Then rerender is blocked or requires correction.

Given rerender succeeds
When versions are viewed
Then old and new versions remain visible and only approved version is canonical.
```

---

## 15. Moment Vault Flow

### 15.1 Purpose

The Moment Vault is the searchable library of captured, enhanced, reviewed, and published moments.

### 15.2 Vault views

```txt
Grid view
Session timeline view
Product/campaign view
Published packages view
Search results view
```

### 15.3 Filters

```txt
session
product
campaign
moment type
status
QA state
publish state
template
date
reviewer
score
asset type
```

### 15.4 Search

Search supports:

```txt
structured filters P0
semantic search P1
```

Examples:

```txt
"discount moments from the jacket campaign"
"published clips for SKU-123"
"moments with product reveal and QA passed"
```

### 15.5 Acceptance criteria

```txt
Given moments exist
When user filters by campaign and QA passed
Then matching moments are listed.

Given a moment has provenance
When user opens its card
Then lineage is visible or expandable.
```

---

## 16. Provenance UX

### 16.1 Purpose

Provenance is a core differentiator and must be visible.

### 16.2 Compact lineage chain

Used in cards:

```txt
Raw → Transform → Enhance → Publish
```

### 16.3 Full provenance graph

Used in details:

```txt
raw_source_asset
  ↓
live_transformed_asset optional
  ↓
raw_mezzanine_asset
  ↓
generation_run / Genblaze
  ↓
enhanced_master_asset
  ↓
publish_variant_asset
  ↓
publish_package
```

### 16.4 Provenance node details

Each node should show:

```txt
name/role
status
short ID
created time
provider/model if relevant
checksum status
B2 object key
manifest link
```

### 16.5 Technical disclosure levels

Normal user:

```txt
human-readable lineage summary
```

Reviewer:

```txt
asset IDs, QA, product facts, versions
```

Admin/audit:

```txt
B2 keys, checksums, manifests, event IDs, run IDs, trace IDs
```

### 16.6 Acceptance criteria

```txt
Given a publish package exists
When provenance is opened
Then raw source, generation run, enhanced master, and publish package are visible.

Given user lacks audit:view
When provenance opens
Then deep technical audit details are hidden or unavailable.
```

---

## 17. Publish Package Flow

### 17.1 Creation

Publish package can be created after:

```txt
canonical enhanced master exists
QA passed or review override exists
product facts are valid
required approval exists
```

### 17.2 Publish package contents

```txt
video asset
thumbnail
captions
title
description
hashtags
product links
provenance manifest reference
destination metadata
```

### 17.3 Publish package states

```txt
draft
ready
review_pending
approved
published
failed
revoked
deleted
```

### 17.4 UX flow

```txt
1. Reviewer approves canonical clip
2. User opens Publish tab
3. UI shows package preview
4. User confirms title/caption/product links
5. System creates package
6. User creates share page or exports
```

### 17.5 Acceptance criteria

```txt
Given a canonical clip is approved
When user creates a publish package
Then package includes media, thumbnail, captions, product links, and provenance reference.

Given product facts changed before publish
When package is validated
Then package is blocked or flagged for review.
```

---

## 18. Share Page Flow

### 18.1 Purpose

Share pages allow viewing/exporting approved publish packages.

### 18.2 Visibility modes

```txt
private default
unlisted/public only when explicitly enabled
revoked
expired
```

### 18.3 Share page contents

```txt
video player
title
description
product links
download button if allowed
provenance badge if allowed
expiration/access state
```

### 18.4 Acceptance criteria

```txt
Given a private share page
When unauthenticated user opens it
Then access is denied.

Given a public share page is revoked
When user opens old URL
Then the page shows revoked/unavailable state.
```

---

## 19. Admin and Recovery UX

### 19.1 Purpose

Admin/Recovery allows operational recovery without database surgery.

### 19.2 Admin sections

```txt
DLQ
Stuck Moments
Failed Runs
B2 Reconciliation
Provider Failures
Budget Anomalies
Audit Search
Retention Queue
Orphaned Assets
```

### 19.3 DLQ item view

Shows:

```txt
event_id
event_type
schema_version
organization_id
producer
trace_id
error
retry count
payload preview
related resource links
actions
```

Actions:

```txt
retry
mark terminal
skip
open trace
open resource
```

### 19.4 Recovery action rules

All recovery actions require:

```txt
admin capability
reason
audit event
idempotency
state transition
```

### 19.5 Acceptance criteria

```txt
Given an event is in DLQ
When admin opens recovery console
Then they can inspect error, event, trace, and retry options.

Given admin replays an event
When replay succeeds
Then audit event records actor, reason, and result.
```

---

## 20. Error, Empty, Loading, and Blocked States

### 20.1 Empty states

Empty states should:

```txt
explain what the screen is for
show next best action
avoid fake data unless demo mode
use dark Lumiq visual style
use rare flat gradient only if appropriate
```

### 20.2 Loading states

Loading states should show real process stage where possible.

Bad:

```txt
generic spinner for 60 seconds
```

Good:

```txt
Raw uploaded → Genblaze enhancing → QA running
```

### 20.3 Blocked states

Blocked states must explain:

```txt
what is blocked
why it is blocked
what capability/policy/data is missing
what the user can do next
```

Examples:

```txt
Catalog snapshot required
Budget exhausted
Human review required
Product claim ungrounded
Provider failure
B2 verification failed
```

### 20.4 Acceptance criteria

```txt
Given a generation run is pending
When user opens the moment
Then loading state shows current pipeline step.

Given publish is blocked by ungrounded claim
When user opens Publish tab
Then UI identifies the claim and required correction.
```

---

## 21. Design System Application

### 21.1 Mandatory design rules

The UI must follow Lumiq design-system files.

```txt
Dark mode only
Deep royal/cobalt primary
Flat gradients only
No glow
Inter + mono
Precision dark cards
Lineage visible
Muted semantic chips
```

### 21.2 UX-to-design mapping

| UX element | Design rule |
|---|---|
| Primary actions | Royal blue button |
| AI-active card | Flat spectral gradient hairline |
| Status | Muted semantic chip |
| Technical IDs | Mono |
| Media preview | Borderless or minimal frame |
| Provenance chain | Nodes/chips, current step royal blue |
| Admin tables | Compact density |
| Marketing/empty state | Two-tone heading allowed |

---

## 22. Hackathon Golden Path UX

### 22.1 Required demo flow

```txt
1. User opens seeded workspace with catalog/campaign ready
2. User opens Studio
3. User completes lightweight preflight
4. User starts prerecorded-live session
5. Product reveal occurs
6. Candidate moment appears
7. Mastra recommendation appears
8. Capture is authorized
9. Raw asset is stored in B2
10. Genblaze enhancement begins
11. Enhanced master is created
12. QA passes
13. Moment appears in Review Queue
14. Reviewer approves
15. Publish package/share page is created
16. Provenance graph is shown
```

### 22.2 Demo must make visible

```txt
Mastra recommendation
B2 object reference
Genblaze run/output
raw vs enhanced comparison
provenance chain
share page
```

### 22.3 Demo may simplify

```txt
external publish adapters
Shopify sync
OBS/RTMP
multi-provider fallback
advanced analytics
enterprise admin
```

---

## 23. UX Acceptance Checklist

Before implementing a screen, verify:

```txt
[ ] User role/capability behavior is defined
[ ] Empty/loading/error states are defined
[ ] Primary action is clear
[ ] Blocked state explains next step
[ ] Provenance is visible or accessible where relevant
[ ] AI recommendation includes reason/confidence
[ ] Product facts are shown before publish
[ ] Sensitive actions require approval
[ ] Technical IDs are progressively disclosed
[ ] Design tokens are followed
[ ] Reduced-motion behavior exists for animated elements
```

---

## 24. Open UX Questions for Later

These are intentionally not blocking current implementation:

```txt
Exact logo/mark direction
Exact external publish destination UI
Exact mobile Live Studio behavior
Exact analytics dashboard depth
Exact full-session archive UI
Exact enterprise audit export UI
Exact Shopify sync UX
Exact OBS/RTMP setup UX
```

---

## 25. UX Change Log

| Version | Change |
|---|---|
| v1 | Created production-first UX spec with setup-first onboarding and hackathon golden path |
