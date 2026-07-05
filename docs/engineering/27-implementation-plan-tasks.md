# 27 — Implementation Plan & Task Breakdown

**Project:** Lumiq — Live Commerce Moment Vault  
**Document ID:** `27-implementation-plan-tasks.md`  
**Status:** Draft v1  
**Audience:** founders, engineering leads, backend engineers, frontend engineers, AI engineers, media engineers, QA, infra/devops, designers, AI coding agents  
**Depends on:** all official spec-kit documents `00` through `26`

---

## 1. Purpose

This document turns the Lumiq specification kit into an ordered implementation plan.

It defines:

```txt
implementation phases
critical path
parallel workstreams
task IDs
dependencies
owners
requirement mappings
definition of done
test gates
handoff rules for humans and AI coding agents
```

The plan is production-minded, but the first execution target is the hackathon golden path.

Core implementation rule:

```txt
Build the product UI screens first using Lumiq design tokens, route-level screens, contract-shaped fixtures, and clear empty/loading/error/blocked states. Then wire those screens to the smallest real end-to-end vertical slice: seeded setup → prerecorded-live session → candidate detection → Mastra recommendation → policy capture → B2 raw asset → Genblaze generation → QA → review approval → publish package/share page → provenance graph.
```

---

## 2. Planning Principles

### 2.1 Specs lead, code follows

No implementation task should invent behavior that is not specified. If a behavior is missing, update the relevant spec or mark the task exploratory.

### 2.2 Frontend UI first, then backend vertical slice

Build the app experience before backend breadth.

UI-first means the product shape is visible early:

```txt
workspace shell
setup/onboarding
catalog and campaigns
Live Studio
signal timeline and candidate cards
Moment Vault
Review Queue
raw/enhanced compare
provenance graph
publish package and share page
admin/recovery shell
settings/budgets/providers shell
```

The first UI pass may use mock data, seeded fixtures, and contract-shaped JSON. It must still use real domain language, Lumiq design tokens, realistic states, and visible provenance patterns.

UI-first does **not** mean bypassing backend truth. Product claims, capture authorization, generation, B2 writes, approval, publish, deletion, and admin recovery must still be enforced by the backend once wired.

Marketing/public screens may be built right after the app UI, but they are explicitly deferable if the product workflow needs attention.

Priority order:

```txt
P0 app UI screen inventory
P0 UI fixture/demo state coverage
P0 safety/provenance visual patterns
P0 backend vertical slice wiring
P0 demo reliability
P1 production beta hardening
P2/P3 integrations and enterprise scale
```

### 2.3 Agents are not executors

Implementation must preserve:

```txt
Mastra recommends.
Core API authorizes.
NATS dispatches.
Workers execute.
Genblaze generates media.
B2 stores proof.
Postgres tracks truth.
```

### 2.4 Every expensive or sensitive side effect needs a gate

Side effects include:

```txt
B2 writes
generation/provider calls
LLM calls
state transitions
publish package creation
share page creation
delete/revoke actions
budget overrides
admin recovery
```

### 2.5 Test gates are part of task completion

A task is not done if it lacks relevant tests or manual acceptance criteria.

---

# 3. Implementation Phases

```yaml
phases:
  phase_0_spec_and_repo_alignment:
    priority: P0
    goal: make_repo_match_spec_kit_and_prepare_coding_agents
  phase_1_frontend_app_ui_first:
    priority: P0
    goal: build_all_core_app_screens_with_tokens_routes_fixtures_and_states
  phase_2_marketing_public_screens:
    priority: P0_optional
    goal: build_marketing_demo_and_public_surfaces_without_blocking_product_flow
  phase_3_platform_foundation:
    priority: P0
    goal: auth_db_events_storage_service_skeletons
  phase_4_contracts_and_data_model:
    priority: P0
    goal: migrations_schemas_api_events_and_validation
  phase_5_golden_path_backend_ai_media:
    priority: P0
    goal: session_detection_capture_generation_qa_publish_provenance
  phase_6_wire_frontend_to_real_backend:
    priority: P0
    goal: replace_fixtures_with_real_api_event_asset_and_signed_url_flows
  phase_7_testing_observability_and_recovery:
    priority: P0_P1
    goal: protect_demo_path_and_recover_failures
  phase_8_deployment_and_submission:
    priority: P0
    goal: deploy_seed_record_submit
  phase_9_production_beta_hardening:
    priority: P1
    goal: turn_hackathon_slice_into_beta
  phase_10_integrations_and_enterprise:
    priority: P2_P3
    goal: commerce_publish_adapters_enterprise_controls
```

---

# 4. Critical Path

The critical path is now UI-first: design and build the product surface first, then make the real system power it.

```txt
1. Repo + environment skeleton
2. Frontend app bootstrap and Lumiq design tokens
3. Authenticated workspace shell/sidebar/topbar with mock capability states
4. Setup/onboarding, catalog, campaign, and template screens with fixtures
5. Live Studio preflight/control room with fixture video, signal feed, and timeline
6. Moment Vault, Review Queue, moment detail, raw/enhanced compare, and provenance screens
7. Publish package, share page, admin/recovery, settings, and budget/provider shells
8. Optional marketing/demo landing screens if schedule allows
9. Core API, Clerk/dev auth, RBAC, service identities, audit skeleton
10. Neon schema migrations for P0 tables
11. B2 bucket/key/signed URL integration
12. NATS streams + event envelope
13. Seeded product/campaign/catalog snapshot
14. Session create/start/end + prerecorded source
15. Signal/candidate event generation
16. Mastra supervisor recommendation fixture or live structured output
17. Moment policy capture authorization
18. Capture Worker writes raw source/mezzanine to B2
19. Generation Service creates generation_run
20. Genblaze Worker executes template or labeled fallback
21. Enhanced asset + manifest + provenance links written
22. QA Worker writes post-enhancement QA
23. Wire UI screens to real APIs/events/assets and remove unlabeled fake states
24. Reviewer approves canonical version
25. Publish package/share page created
26. Provenance graph shows raw → Genblaze run → enhanced → publish
27. Golden path E2E smoke test passes
28. Demo video recorded
```

---

# 5. Workstream Ownership

```yaml
workstreams:
  product_demo:
    owns:
      - demo_scenario
      - seeded_data
      - demo_video_script
      - judge_story
  marketing_public:
    owns:
      - marketing_landing_page
      - demo_story_page
      - public_waitlist_or_cta
      - screenshots_gallery
      - judge_facing_copy
    priority_note: deferable_after_app_ui_if_time_is_tight
  frontend:
    owns:
      - design_system_application
      - app_shell
      - setup_ui
      - live_studio
      - review_queue
      - provenance_ui
      - share_page
  backend_core:
    owns:
      - authz
      - state_machines
      - api_commands
      - budget_policy
      - audit
      - signed_urls
  data_contracts:
    owns:
      - migrations
      - JSON_schemas
      - OpenAPI_sync
      - AsyncAPI_sync
      - contract_tests
  ai_agents:
    owns:
      - Mastra_agents
      - tool_gateway_client
      - structured_outputs
      - LLMProviderRouter
      - prompt_injection_guardrails
  media_pipeline:
    owns:
      - capture_worker
      - template_step_graph
      - Genblaze_worker
      - renderer
      - manifest_writer
  storage_provenance:
    owns:
      - B2_buckets
      - object_keys
      - checksums
      - manifest_records
      - provenance_graph
  qa_safety:
    owns:
      - QA_checks
      - moderation_policy
      - product_claim_validation
      - AI_eval_fixtures
  infra_devops:
    owns:
      - Docker
      - NATS
      - Neon
      - Clerk_envs
      - secrets
      - CI_CD
      - deployment
  operations:
    owns:
      - admin_recovery
      - DLQ
      - reconciliation
      - runbooks
```

---

# 6. Definition of Done by Artifact Type

## 6.1 Backend command/API task

A backend command task is done when:

```txt
API or internal endpoint exists.
Auth/authz checks are implemented.
Organization scope is enforced.
Input schema is validated.
Idempotency key is accepted/enforced.
State-machine guard exists where relevant.
Audit event is written for sensitive action.
Unit and integration tests pass.
OpenAPI is updated if public/internal HTTP contract changed.
```

## 6.2 Event/worker task

A worker task is done when:

```txt
AsyncAPI event contract exists or is updated.
Consumer validates event envelope and payload.
Consumer is idempotent.
Worker reports state through Core API.
Worker ACKs only after durable state.
Retry and DLQ behavior is tested.
Duplicate event test passes.
```

## 6.3 Media pipeline task

A media task is done when:

```txt
Input asset contract is defined.
Output asset role is defined.
B2 object key convention is used.
SHA-256 is calculated.
Generation_run or asset row is linked.
Manifest is written and schema-validated.
QA gate is triggered.
Rerender does not overwrite previous output.
```

## 6.4 Agent task

An agent task is done when:

```txt
Agent role is documented.
Tools are narrow and gateway-only.
Structured output schema exists.
LLMProviderRouter is used.
Malformed output is rejected.
Prompt-injection fixture is tested.
Agent cannot call forbidden side effects.
agent_tool_call and llm_run records are written where applicable.
```

## 6.5 Frontend task

A frontend task is done when:

```txt
Uses Lumiq design tokens.
Supports empty/loading/error/blocked states.
Hides unauthorized controls.
Backend still enforces authorization.
Shows provenance where relevant.
Supports reduced-motion where animation exists.
Playwright or component test covers main interaction.
```

## 6.6 Demo task

A demo task is done when:

```txt
It works from a clean seed.
It can be rerun idempotently.
It does not require hidden manual database edits.
It has a fallback path.
It is represented in the demo script.
```

---

# 7. Phase 0 — Spec and Repo Alignment

## Goal

Make the repository safe for humans and AI coding agents to implement.

```yaml
phase_0:
  priority: P0
  exit_criteria:
    - specs_are_placed_in_expected_directories
    - README_points_to_spec_index
    - coding_agent_rules_are_visible
    - local_bootstrap_command_exists
```

## Tasks

| Task ID | Task | Owner | Depends on | Requirement refs | DoD / Test gate |
|---|---|---|---|---|---|
| TASK-SPEC-001 | Place docs `00`–`27` in canonical repo structure | Product/Architecture | none | RULE-SOT-001 | Files present under `/docs`; links in index work |
| TASK-SPEC-002 | Add `README.md` with project overview and reading order | Product/Engineering | TASK-SPEC-001 | RULE-SOT-001 | README references spec index and golden path |
| TASK-SPEC-003 | Add `AGENTS.md` for coding-agent rules | Architecture | TASK-SPEC-001 | RULE-SOT-001, RULE-AGENT-001 | File lists do/don't rules and required reading order |
| TASK-SPEC-004 | Add repo folder skeleton | Engineering | TASK-SPEC-001 | N/A | `/apps/web`, `/apps/api`, `/apps/mastra`, `/workers`, `/packages`, `/docs` exist |
| TASK-SPEC-005 | Add requirement-to-test traceability convention | QA | TASK-SPEC-001 | RULE-TEST-001 | Test naming or metadata convention documented |

---

# 8. Phase 1 — Frontend App UI Screens First

## Goal

Build the complete product UI surface before backend implementation depth. Screens should be route-level, token-compliant, and realistic enough for product review, demo rehearsal, and later API wiring.

```yaml
phase_1:
  priority: P0
  exit_criteria:
    - all_core_workspace_routes_render
    - Lumiq_design_tokens_are_applied
    - screens_use_contract_shaped_fixture_data
    - empty_loading_error_blocked_states_exist
    - unauthorized_controls_are_hidden_or_disabled_in_UI
    - provenance_visual_pattern_is_present_before_backend_wiring
```

## Screen inventory

The first frontend pass must cover:

```txt
Workspace shell
Setup / seeded demo workspace
Catalog
Campaigns
Templates
Live Studio preflight
Live Studio control room
Signal timeline and candidate/progress cards
Moment Vault
Review Queue
Moment Detail
Raw/enhanced compare
Product facts and QA panels
Provenance graph
Publish package and share page
Admin/recovery shell
Settings / budgets / providers shell
```

## Tasks

| Task ID | Task | Owner | Depends on | Requirement refs | DoD / Test gate |
|---|---|---|---|---|---|
| TASK-FE-FIRST-001 | Bootstrap web app, UI package, route structure, Tailwind/shadcn setup, and Lumiq token imports | Frontend | TASK-SPEC-004 | REQ-UI-001, REQ-UI-003 | Web app runs; tokens are used; no arbitrary colors |
| TASK-FE-FIRST-002 | Build authenticated workspace shell/sidebar/topbar with mock org, role, budget, and notification states | Frontend | TASK-FE-FIRST-001 | REQ-UI-001, REQ-UI-002 | Role-based nav states render from fixture capabilities |
| TASK-FE-FIRST-003 | Build setup/onboarding and seeded demo workspace screens | Frontend/Product | TASK-FE-FIRST-002 | 05-user-flows | Setup checklist, blocked states, and seeded demo CTA render |
| TASK-FE-FIRST-004 | Build Catalog screens for products, SKUs, product media, and allowed claims | Frontend | TASK-FE-FIRST-002 | REQ-CATALOG-001, REQ-CATALOG-005 | Fixture products and blocked claim examples render |
| TASK-FE-FIRST-005 | Build Campaign screens for offers, validity, active products, and campaign claims | Frontend | TASK-FE-FIRST-004 | REQ-CATALOG-005 | Offer validity and unsupported claim states render |
| TASK-FE-FIRST-006 | Build Templates screens for system templates, template versions, and safe step graph summary | Frontend | TASK-FE-FIRST-002 | 15-template-step-graph-spec | Template cards show version, status, QA requirements |
| TASK-FE-FIRST-007 | Build Live Studio preflight and control room screen with fixture source preview | Frontend | TASK-FE-FIRST-003 | REQ-SESSION-002 | Source, catalog snapshot, recording policy, budget, start controls render |
| TASK-FE-FIRST-008 | Build signal feed, candidate/progress card, and bottom timeline UI | Frontend | TASK-FE-FIRST-007 | REQ-SIGNAL-001, REQ-SIGNAL-002 | Fixture signals show detection/capture/generation status chain |
| TASK-FE-FIRST-009 | Build Moment Vault browsing screen with filters and media cards | Frontend | TASK-FE-FIRST-002 | 05-user-flows | Vault cards show state, product, QA, and lineage summary |
| TASK-FE-FIRST-010 | Build Review Queue screen and review cards | Frontend | TASK-FE-FIRST-009 | REQ-REVIEW-001 | Pending/failed/approved cards render with evidence and QA chips |
| TASK-FE-FIRST-011 | Build Moment Detail screen with raw/enhanced compare, product facts, QA, and controlled edit sections | Frontend | TASK-FE-FIRST-010 | REQ-REVIEW-003, REQ-CATALOG-005 | Desktop side-by-side and mobile toggle states render |
| TASK-FE-FIRST-012 | Build provenance graph and compact lineage chain components | Frontend | TASK-FE-FIRST-011 | REQ-PROV-002, REQ-PROV-004 | Raw → run → enhanced → publish lineage renders from fixture graph |
| TASK-FE-FIRST-013 | Build publish package and share page UI | Frontend | TASK-FE-FIRST-012 | REQ-PUBLISH-001, REQ-PUBLISH-004 | Publish package, signed/private/public states, product links render |
| TASK-FE-FIRST-014 | Build Admin/Recovery and Settings/Budget/Provider shell screens | Frontend/Ops | TASK-FE-FIRST-002 | REQ-ADMIN-001, REQ-COST-004 | DLQ, failed runs, B2 object references, budget cards render as shells |
| TASK-FE-FIRST-015 | Add component/story/Playwright smoke coverage for the UI-first route set | Frontend/QA | TASK-FE-FIRST-014 | GATE-UI | Main routes render with fixtures and no console errors |

---

# 9. Phase 2 — Marketing and Public Screens

## Goal

Build public-facing marketing/demo surfaces after the core app UI. This phase is useful for submission polish but can be deferred until after backend wiring if time is tight.

```yaml
phase_2:
  priority: P0_optional
  defer_rule: may_move_after_phase_6_without_blocking_golden_path
  exit_criteria:
    - marketing_hero_explains_lumiq
    - demo_story_mentions_B2_Genblaze_Mastra_and_provenance
    - screenshots_or_product_visuals_use_real_UI
    - no_unsupported_external_publish_or_provider_claims
```

## Tasks

| Task ID | Task | Owner | Depends on | Requirement refs | DoD / Test gate |
|---|---|---|---|---|---|
| TASK-MKT-001 | Build marketing landing page shell and hero | Frontend/Design | TASK-FE-FIRST-001 | lumiq-DESIGN | Hero uses dark cinematic system and approved gradient rules |
| TASK-MKT-002 | Build problem/solution/product sections | Product/Frontend | TASK-MKT-001 | 26-demo | Copy explains traceable live-commerce media pipeline |
| TASK-MKT-003 | Build architecture/provenance explainer section | Product/Frontend | TASK-MKT-002 | 06-system-architecture-c4, 14-b2-storage-provenance-spec | Shows Mastra/Core API/NATS/Workers/Genblaze/B2/Postgres split |
| TASK-MKT-004 | Build demo scenario page or section | Product/Demo | TASK-MKT-002 | 26-demo | Crossbody Bag Flash Offer story is visible |
| TASK-MKT-005 | Build screenshot/gallery area from real app UI | Design/Frontend | TASK-FE-FIRST-015 | 26-demo | Uses app screenshots, not fake impossible screens |
| TASK-MKT-006 | Add waitlist/contact/CTA and footer basics | Frontend/Product | TASK-MKT-001 | N/A | No unsupported pricing, compliance, or publish claims |

---

# 10. Phase 3 — Platform Foundation

## Goal

Create a runnable local foundation after the UI screen inventory exists: API, database, event backbone, B2 integration, service identities, and the frontend fixture/API boundary.

```yaml
phase_3:
  priority: P0
  exit_criteria:
    - local_stack_runs
    - web_fixture_boundary_exists
    - web_can_call_api
    - api_can_connect_db
    - api_can_publish_nats_event
    - api_can_create_signed_b2_url_or_worker_can_write_b2
    - Clerk_auth_or_dev_auth_adapter_works
```

## Tasks

| Task ID | Task | Owner | Depends on | Requirement refs | DoD / Test gate |
|---|---|---|---|---|---|
| TASK-FOUND-001 | Initialize monorepo package manager and lint/typecheck | Engineering | TASK-SPEC-004 | RULE-ENV-004 | `pnpm lint`, `pnpm typecheck` or equivalents pass |
| TASK-FOUND-002 | Create Docker Compose local stack | Infra | TASK-FOUND-001 | RULE-ENV-002 | Starts API, workers, NATS, local DB or Neon branch config |
| TASK-FOUND-003 | Add frontend fixture/API boundary and environment switch | Frontend | TASK-FE-FIRST-015, TASK-FOUND-001 | REQ-UI-001 | UI can run on fixtures and later switch to API data |
| TASK-FOUND-004 | Create Core API skeleton | Backend | TASK-FOUND-001 | RULE-ARCH-002 | `/healthz` works; structured logging enabled |
| TASK-FOUND-005 | Implement Clerk/dev auth adapter | Backend | TASK-FOUND-004 | REQ-AUTH-001 | Authenticated user maps to internal user in dev/staging |
| TASK-FOUND-006 | Implement internal authorization service skeleton | Backend | TASK-FOUND-005 | REQ-AUTH-002, REQ-AUTH-003 | Capability denial test passes |
| TASK-FOUND-007 | Create service identity token/auth mechanism | Backend/Security | TASK-FOUND-004 | REQ-AUTH-004 | Worker without service token denied |
| TASK-FOUND-008 | Configure NATS connection and streams | Infra/Backend | TASK-FOUND-004 | REQ-EVENT-003 | API publishes test event; consumer receives |
| TASK-FOUND-009 | Configure B2 client and environment buckets | Storage/Infra | TASK-FOUND-004 | REQ-ASSET-001 | Worker can write/read a test object in dev/staging bucket |
| TASK-FOUND-010 | Add base audit logger | Backend | TASK-FOUND-004 | REQ-AUDIT-001 | Audit write helper tested |

---

# 11. Phase 4 — Contracts and Data Model

## Goal

Implement migrations and validation contracts for the P0 golden path.

```yaml
phase_4:
  priority: P0
  exit_criteria:
    - P0_tables_migrated
    - seed_org_user_product_campaign_session_possible
    - OpenAPI_and_AsyncAPI_contract_tests_run
    - JSON_schema_validation_available_in_TS_and_Python
```

## P0 database tables

Implement at minimum:

```txt
users
organizations
memberships
role_capabilities
service_identities
service_capabilities
products
campaigns
campaign_offers
allowed_product_claims
catalog_snapshots
catalog_snapshot_products
catalog_snapshot_offers
catalog_snapshot_claims
sessions
session_sources
moments
signals
moment_evidence
moment_policy_decisions
assets
generation_runs
provenance_links
manifest_records
enhancement_templates
template_versions
step_graphs
qa_checks
review_actions
publish_packages
publish_variants
share_pages
agent_tool_calls
llm_runs
audit_events
system_events
outbox_events or direct_event_log
dead_letter_events
budgets
budget_authorizations
cost_ledger
```

## Tasks

| Task ID | Task | Owner | Depends on | Requirement refs | DoD / Test gate |
|---|---|---|---|---|---|
| TASK-DATA-001 | Implement ULID helper and timestamp conventions | Backend | TASK-FOUND-004 | glossary ID rules | Unit tests pass |
| TASK-DATA-002 | Create auth/org/membership migrations | Backend | TASK-DATA-001 | REQ-AUTH-002 | Migration applies/rolls back in dev |
| TASK-DATA-003 | Create catalog/campaign/snapshot migrations | Backend | TASK-DATA-001 | REQ-CATALOG-001, REQ-CATALOG-003 | Seed product/campaign test passes |
| TASK-DATA-004 | Create session/moment/signal migrations | Backend | TASK-DATA-001 | REQ-SESSION-001, REQ-SIGNAL-002 | State enum constraints tested |
| TASK-DATA-005 | Create asset/generation/provenance migrations | Backend/Storage | TASK-DATA-001 | REQ-ASSET-001, REQ-PROV-001 | FK/link tests pass |
| TASK-DATA-006 | Create QA/review/publish/share migrations | Backend | TASK-DATA-001 | REQ-QA-002, REQ-PUBLISH-001 | Publish package FK tests pass |
| TASK-DATA-007 | Create agent/LLM/audit/event/cost migrations | Backend/AI | TASK-DATA-001 | REQ-AGENT-004, REQ-LLM-003, REQ-AUDIT-001 | Records insert with org scope |
| TASK-DATA-008 | Add JSON Schema validation package | Backend/QA | TASK-DATA-005 | 11-json-schemas | Schema validation tests pass |
| TASK-DATA-009 | Add OpenAPI contract validation to CI | Backend/QA | TASK-FOUND-004 | 09-api-contract | OpenAPI lint passes |
| TASK-DATA-010 | Add AsyncAPI contract validation to CI | Backend/QA | TASK-FOUND-008 | 10-event-contract | AsyncAPI lint passes |

---

# 12. Phase 5 — Golden Path Backend, AI, Media, and Provenance

## Goal

Make the real backend, agent, worker, media, QA, publish, and provenance workflow power the UI-first product surface.

```yaml
phase_5:
  priority: P0
  exit_criteria:
    - seeded_session_can_detect_candidate
    - raw_capture_asset_written_to_B2
    - generation_run_creates_enhanced_asset
    - QA_passes_or_blocks
    - publish_package_created
    - provenance_graph_query_returns_lineage
```

## Tasks

### 12.1 Catalog and setup

| Task ID | Task | Owner | Depends on | Requirement refs | DoD / Test gate |
|---|---|---|---|---|---|
| TASK-BE-SETUP-001 | Implement organization setup-status API | Backend | TASK-DATA-002 | REQ-UI-001 | API returns checklist |
| TASK-BE-CATALOG-001 | Implement create/list product APIs | Backend | TASK-DATA-003 | REQ-CATALOG-001 | API tests pass |
| TASK-BE-CATALOG-002 | Implement campaign create/list APIs | Backend | TASK-DATA-003 | REQ-CATALOG-001 | API tests pass |
| TASK-BE-CATALOG-003 | Implement allowed claims validation | Backend/QA | TASK-DATA-003 | REQ-CATALOG-005 | Ungrounded claim rejected |
| TASK-BE-CATALOG-004 | Implement catalog snapshot creation and B2 manifest write | Backend/Storage | TASK-BE-CATALOG-001 | REQ-CATALOG-003, REQ-CATALOG-004 | Postgres rows + B2 manifest exist |
| TASK-BE-CATALOG-005 | Add seeded demo catalog/campaign script | Product/Backend | TASK-BE-CATALOG-004 | DEMO-AC-004 | Re-runnable seed test passes |

### 12.2 Session and detection

| Task ID | Task | Owner | Depends on | Requirement refs | DoD / Test gate |
|---|---|---|---|---|---|
| TASK-BE-SESSION-001 | Implement session create/start/end APIs | Backend | TASK-DATA-004 | REQ-SESSION-001, REQ-SESSION-004, REQ-SESSION-005 | State transition tests pass |
| TASK-BE-SESSION-002 | Implement prerecorded-live source refs | Backend/Frontend | TASK-BE-SESSION-001 | REQ-SESSION-002 | Source can be attached to session |
| TASK-BE-SIGNAL-001 | Implement seeded signal emitter for demo source | Backend/Worker | TASK-BE-SESSION-002 | REQ-SIGNAL-001 | Signal events inserted/emitted by timecode |
| TASK-BE-SIGNAL-002 | Implement candidate proposal logic | Backend/Worker | TASK-BE-SIGNAL-001 | REQ-SIGNAL-002 | Candidate emitted for product reveal |
| TASK-BE-SIGNAL-003 | Implement duplicate window suppression | Backend | TASK-BE-SIGNAL-002 | REQ-SIGNAL-005 | Duplicate candidate test passes |

### 12.3 Mastra agent path

| Task ID | Task | Owner | Depends on | Requirement refs | DoD / Test gate |
|---|---|---|---|---|---|
| TASK-AI-001 | Create Mastra app skeleton | AI | TASK-FOUND-001 | REQ-AGENT-001 | Agent service starts |
| TASK-AI-002 | Implement LLMProviderRouter minimal OpenAI route | AI | TASK-AI-001 | REQ-LLM-001, REQ-LLM-002 | Router unit test passes |
| TASK-AI-003 | Implement supervisor-agent-v1 structured output | AI | TASK-AI-002 | REQ-AGENT-001, REQ-SIGNAL-003 | Schema-valid recommendation returned |
| TASK-AI-004 | Implement agent tool gateway client | AI/Backend | TASK-AI-003, TASK-DATA-007 | REQ-AGENT-003, REQ-AGENT-004 | Tool call record written |
| TASK-AI-005 | Add deterministic fixture mode for demo | AI/QA | TASK-AI-003 | REQ-AGENT-005 | Fixture output clearly marked in config |
| TASK-AI-006 | Add prompt injection eval fixtures | AI/Security | TASK-AI-004 | 20-ai-security-safety-spec | Unsafe tool request denied |

### 12.4 Capture

| Task ID | Task | Owner | Depends on | Requirement refs | DoD / Test gate |
|---|---|---|---|---|---|
| TASK-BE-MOMENT-001 | Implement capture policy service | Backend | TASK-BE-SIGNAL-002 | REQ-CAPTURE-001, REQ-CAPTURE-002 | Budget/duplicate/session checks tested |
| TASK-BE-MOMENT-002 | Emit `moment.capture.authorized` | Backend | TASK-BE-MOMENT-001, TASK-FOUND-008 | REQ-EVENT-001, REQ-CAPTURE-001 | AsyncAPI schema validates |
| TASK-WORKER-CAPTURE-001 | Implement Capture Worker consumer | Media/Worker | TASK-BE-MOMENT-002 | REQ-CAPTURE-004 | Consumes event idempotently |
| TASK-WORKER-CAPTURE-002 | Implement raw source extraction from demo source | Media/Worker | TASK-WORKER-CAPTURE-001 | REQ-CAPTURE-003 | Raw capture window file created |
| TASK-WORKER-CAPTURE-003 | Upload raw source to B2 and create asset record | Media/Storage | TASK-WORKER-CAPTURE-002, TASK-FOUND-009 | REQ-ASSET-001, REQ-ASSET-004 | B2 object + sha256 + asset row exist |
| TASK-WORKER-CAPTURE-004 | Create raw mezzanine asset | Media/Worker | TASK-WORKER-CAPTURE-003 | REQ-CAPTURE-005 | Mezzanine exists or failure recorded |

### 12.5 Generation and Genblaze

| Task ID | Task | Owner | Depends on | Requirement refs | DoD / Test gate |
|---|---|---|---|---|---|
| TASK-TEMPLATE-001 | Seed `clean_product_reveal` template v1 | Media/Backend | TASK-DATA-005 | REQ-TEMPLATE-001 | Template validates against step registry |
| TASK-TEMPLATE-002 | Implement safe step registry minimal P0 | Media/Backend | TASK-TEMPLATE-001 | REQ-TEMPLATE-002, REQ-TEMPLATE-003 | Unknown step rejected |
| TASK-BE-GEN-001 | Implement generation request service | Backend | TASK-WORKER-CAPTURE-003, TASK-TEMPLATE-001 | REQ-GEN-001, REQ-COST-001 | generation_run queued + event emitted |
| TASK-WORKER-GEN-001 | Implement Genblaze Worker consumer | Media/Worker | TASK-BE-GEN-001 | REQ-GEN-001 | Duplicate event does not duplicate output |
| TASK-WORKER-GEN-002 | Implement minimal Genblaze/template execution path | Media/Worker | TASK-WORKER-GEN-001 | REQ-GEN-002 | Enhanced asset generated or labeled fallback used |
| TASK-WORKER-GEN-003 | Write Genblaze/app provenance manifests to B2 | Media/Storage | TASK-WORKER-GEN-002 | REQ-PROV-001, REQ-PROV-003 | Manifest schema validates |
| TASK-WORKER-GEN-004 | Report generation completed/failed to Core API | Media/Backend | TASK-WORKER-GEN-003 | REQ-GEN-003, REQ-GEN-004 | State transition tests pass |
| TASK-WORKER-GEN-005 | Implement rerender new-version behavior | Backend/Media | TASK-WORKER-GEN-004 | REQ-GEN-005 | Rerender creates new asset key |

### 12.6 QA, review, publish, provenance

| Task ID | Task | Owner | Depends on | Requirement refs | DoD / Test gate |
|---|---|---|---|---|---|
| TASK-QA-001 | Implement post-enhancement QA minimal checks | QA/Backend | TASK-WORKER-GEN-004 | REQ-QA-002, REQ-QA-004 | QA passed/review_required states work |
| TASK-QA-002 | Implement product fact QA | QA/Commerce | TASK-BE-CATALOG-003, TASK-QA-001 | REQ-QA-005, REQ-CATALOG-005 | Ungrounded claim blocks publish |
| TASK-REVIEW-001 | Implement review queue query | Backend | TASK-QA-001 | REQ-REVIEW-001 | Review pending item returned |
| TASK-REVIEW-002 | Implement approve/reject/promote canonical APIs | Backend | TASK-REVIEW-001 | REQ-REVIEW-005 | Audit + state transition tests pass |
| TASK-PUBLISH-001 | Implement publish package creation | Backend/Worker | TASK-REVIEW-002 | REQ-PUBLISH-001 | Package contains media/thumb/captions/provenance ref |
| TASK-PUBLISH-002 | Implement share page creation | Backend/Frontend | TASK-PUBLISH-001 | REQ-PUBLISH-004 | Share slug resolves |
| TASK-PROV-001 | Implement provenance graph query | Backend/Storage | TASK-WORKER-GEN-003, TASK-PUBLISH-001 | REQ-PROV-002, REQ-PROV-004 | Graph includes raw, run, enhanced, publish nodes |

---

# 13. Phase 6 — Wire Frontend Screens to Real Backend

## Goal

Replace UI-first fixtures with real Core API, event, asset, signed URL, QA, publish, and provenance flows without changing the screen architecture.

```yaml
phase_6:
  priority: P0
  exit_criteria:
    - seeded_setup_visible_from_real_API
    - Live_Studio_shows_real_or_seeded_detection_progress
    - Review_Queue_supports_compare_and_approve_with_signed_URLs
    - Provenance_UI_shows_real_lineage
    - Share_Page_renders_real_publish_package
    - fixture_only_states_are_removed_or_clearly_labeled
```

## Tasks

| Task ID | Task | Owner | Depends on | Requirement refs | DoD / Test gate |
|---|---|---|---|---|---|
| TASK-FE-WIRE-001 | Wire workspace shell/sidebar/topbar to auth, organization, role, and budget APIs | Frontend | TASK-FE-FIRST-002, TASK-FOUND-005, TASK-FOUND-006 | REQ-UI-001, REQ-UI-002 | Real capability state controls nav visibility |
| TASK-FE-WIRE-002 | Wire setup/demo workspace screen to setup-status and seed APIs | Frontend | TASK-FE-FIRST-003, TASK-BE-SETUP-001, TASK-BE-CATALOG-005 | 05-user-flows | Seeded setup visible from real API |
| TASK-FE-WIRE-003 | Wire catalog/campaign screens to product, campaign, offer, and claim APIs | Frontend | TASK-FE-FIRST-004, TASK-FE-FIRST-005, TASK-BE-CATALOG-001, TASK-BE-CATALOG-002 | REQ-CATALOG-001, REQ-CATALOG-005 | Products/offers/claims load and invalid claims are shown as blocked |
| TASK-FE-WIRE-004 | Wire Live Studio preflight to session and catalog snapshot APIs | Frontend | TASK-FE-FIRST-007, TASK-BE-SESSION-001, TASK-BE-CATALOG-004 | REQ-SESSION-002, REQ-CATALOG-003 | Start demo session works from UI |
| TASK-FE-WIRE-005 | Wire Live Studio control room timeline and signal feed to session/candidate data | Frontend | TASK-FE-FIRST-008, TASK-BE-SIGNAL-001, TASK-BE-SIGNAL-002 | REQ-SIGNAL-001, REQ-SIGNAL-002 | Candidate appears during prerecorded-live flow |
| TASK-FE-WIRE-006 | Wire candidate/progress card to capture, generation, QA, and publish states | Frontend | TASK-FE-FIRST-008, TASK-WORKER-CAPTURE-003, TASK-WORKER-GEN-004, TASK-QA-001 | REQ-CAPTURE-004, REQ-GEN-003, REQ-QA-002 | Status chain reflects real backend state |
| TASK-FE-WIRE-007 | Wire Review Queue cards to review queue query | Frontend | TASK-FE-FIRST-010, TASK-REVIEW-001 | REQ-REVIEW-001 | Review pending item appears with QA status |
| TASK-FE-WIRE-008 | Wire raw/enhanced compare view to signed asset URLs | Frontend | TASK-FE-FIRST-011, TASK-WORKER-GEN-004 | REQ-REVIEW-003, REQ-ASSET-001 | Raw/enhanced assets load without exposing B2 credentials |
| TASK-FE-WIRE-009 | Wire product facts and QA panels to catalog snapshot and QA records | Frontend | TASK-FE-FIRST-011, TASK-QA-002 | REQ-QA-002, REQ-CATALOG-005 | Claims and blocked states use real QA/catalog data |
| TASK-FE-WIRE-010 | Wire provenance graph panel to real provenance graph query | Frontend | TASK-FE-FIRST-012, TASK-PROV-001 | REQ-PROV-004 | Graph shows raw, run, enhanced, publish nodes |
| TASK-FE-WIRE-011 | Wire approve/reject/promote canonical UI actions | Frontend | TASK-FE-FIRST-010, TASK-REVIEW-002 | REQ-REVIEW-005 | Approve button calls API, writes audit, and updates state |
| TASK-FE-WIRE-012 | Wire publish package and share page UI | Frontend | TASK-FE-FIRST-013, TASK-PUBLISH-002 | REQ-PUBLISH-004 | Share page renders public/private states from real package |
| TASK-FE-WIRE-013 | Wire admin mini panel for B2/manifests/DLQ read-only demo proof | Frontend/Ops | TASK-FE-FIRST-014, TASK-PROV-001, TASK-OPS-001 | DEMO-AC-002, REQ-ADMIN-001 | B2 keys/checksums visible without raw secrets |
| TASK-FE-WIRE-014 | Remove or label all fixture-only states before demo recording | Frontend/QA/Product | TASK-FE-WIRE-013 | 26-demo | Simulated pieces are clearly labeled; no fake external publish claim |

---

# 14. Phase 7 — Testing, Observability, and Recovery

## Goal

Make the demo reliable and protect core safety properties.

```yaml
phase_7:
  priority: P0_P1
  exit_criteria:
    - golden_path_smoke_test_passes
    - contract_tests_pass
    - trace_id_links_API_events_workers_assets
    - minimal_admin_recovery_visible
```

## Tasks

| Task ID | Task | Owner | Depends on | Requirement refs | DoD / Test gate |
|---|---|---|---|---|---|
| TASK-TEST-001 | Add unit tests for state machines | QA/Backend | TASK-DATA-004 | REQ-GEN-003, REQ-REVIEW-005 | Invalid transitions rejected |
| TASK-TEST-002 | Add event envelope/idempotency tests | QA/Backend | TASK-FOUND-008 | REQ-EVENT-001, REQ-EVENT-004 | Duplicate event test passes |
| TASK-TEST-003 | Add B2 upload/checksum tests | QA/Storage | TASK-WORKER-CAPTURE-003 | REQ-ASSET-004 | Checksum mismatch fails |
| TASK-TEST-004 | Add product claim grounding tests | QA/Commerce | TASK-QA-002 | REQ-CATALOG-005 | Unsupported claim blocked |
| TASK-TEST-005 | Add agent structured output tests | QA/AI | TASK-AI-003 | REQ-AGENT-005 | Malformed output rejected |
| TASK-TEST-006 | Add Genblaze worker mock integration test | QA/Media | TASK-WORKER-GEN-002 | REQ-GEN-002 | Output asset + manifest created |
| TASK-TEST-007 | Add Playwright golden path E2E | QA/Frontend | TASK-FE-WIRE-012 | RULE-TEST-004 | Seed → share page passes |
| TASK-OBS-001 | Implement trace/correlation ID propagation | Backend/Infra | TASK-FOUND-004 | REQ-AUDIT-002 | API/event/worker logs share trace_id |
| TASK-OBS-002 | Add structured redacted logs | Backend/Infra | TASK-FOUND-004 | REQ-AUDIT-003 | No raw prompts/transcripts in logs test |
| TASK-OBS-003 | Add minimal metrics counters | Infra/Backend | TASK-WORKER-GEN-004 | REQ-AUDIT-004 | Capture/gen/QA counters visible |
| TASK-OPS-001 | Implement minimal DLQ table/query UI | Backend/Frontend | TASK-FOUND-008, TASK-FE-WIRE-001 | REQ-EVENT-005 | Failed test event appears in Admin |
| TASK-OPS-002 | Implement manual retry generation action | Backend/Ops | TASK-WORKER-GEN-004 | 25-admin-recovery-runbooks | Audit + idempotency test passes |
| TASK-OPS-003 | Implement B2 reconciliation dry-run script | Storage/Ops | TASK-WORKER-GEN-003 | 25-admin-recovery-runbooks | Reports missing/orphan objects |

---

# 15. Phase 8 — Deployment and Submission

## Goal

Deploy, seed, test, record, and submit.

```yaml
phase_8:
  priority: P0
  exit_criteria:
    - app_url_live
    - demo_seeded
    - smoke_test_green
    - demo_video_recorded
    - submission_materials_ready
```

## Tasks

| Task ID | Task | Owner | Depends on | Requirement refs | DoD / Test gate |
|---|---|---|---|---|---|
| TASK-DEPLOY-001 | Create staging/prod environment variables | Infra | TASK-FOUND-009 | 23-infrastructure | Secrets present; no secrets in repo |
| TASK-DEPLOY-002 | Deploy Web App | Infra/Frontend | TASK-FE-WIRE-012 | 23-infrastructure | App URL loads |
| TASK-DEPLOY-003 | Deploy Core API | Infra/Backend | TASK-BE-GEN-001 | 23-infrastructure | `/healthz` public/internal checks pass |
| TASK-DEPLOY-004 | Deploy Mastra Agent Service | Infra/AI | TASK-AI-004 | 23-infrastructure | Agent endpoint reachable from API |
| TASK-DEPLOY-005 | Deploy workers | Infra/Media | TASK-WORKER-GEN-004 | 23-infrastructure | Workers connect to NATS/B2/API |
| TASK-DEPLOY-006 | Run migrations and seed demo data | Backend/Infra | TASK-DEPLOY-003 | 26-demo | Seed idempotency confirmed |
| TASK-DEPLOY-007 | Run golden path smoke test in deployed env | QA | TASK-DEPLOY-006 | RULE-TEST-004 | E2E green |
| TASK-DEMO-001 | Record demo video | Product/Demo | TASK-DEPLOY-007 | 26-demo | Video follows 26 script |
| TASK-DEMO-002 | Capture screenshots/gallery | Product/Design | TASK-DEPLOY-007 | 26-demo | 5 screenshots prepared |
| TASK-DEMO-003 | Write final project story/submission copy | Product | TASK-DEMO-001 | 26-demo | Story mentions B2/Genblaze/provenance clearly |
| TASK-DEMO-004 | Final submission proofread and rule check | Product | TASK-DEMO-003 | 26-demo | Links work; no unsupported claims |

---

# 16. Phase 9 — Production Beta Hardening

## Goal

Turn the hackathon slice into a production beta.

```yaml
phase_9:
  priority: P1
  exit_criteria:
    - controlled_rerender_stable
    - CSV_import_works
    - advanced_QA_and_cost_controls_work
    - admin_recovery_usable
    - search_and_embeddings_basic
```

## P1 task groups

```yaml
p1_task_groups:
  catalog:
    - CSV_import
    - catalog_snapshot_diff
    - pre_publish_live_refresh
  detection:
    - real_transcript_chunks
    - scene_change_detection
    - product_visibility_detection
    - score_calibration
  media:
    - controlled_rerender_UI
    - caption_timing_repair
    - thumbnail_selection
    - provider_fallback_policy
  QA:
    - pre_enhancement_QA
    - pre_publish_QA
    - product_appearance_integrity_eval
    - moderation_provider_integration
  search:
    - structured_filters
    - transcript_full_text
    - pgvector_embeddings_for_accepted_moments
  operations:
    - advanced_DLQ_replay
    - B2_manifest_integrity_sweep
    - retention_sweeps
    - cost_reconciliation_worker
  security:
    - RLS_defense_in_depth
    - service_key_rotation
    - expanded_threat_model_tests
```

---

# 17. Phase 10 — Integrations and Enterprise

## Goal

Expand beyond the demo/beta into real live-commerce operations.

```yaml
phase_10:
  priority: P2_P3
  task_groups:
    commerce_integrations:
      - Shopify_catalog_adapter
      - WooCommerce_adapter
      - custom_catalog_API_adapter
    ingest_integrations:
      - OBS_RTMP_adapter
      - WHIP_or_external_livestream_adapter
    publish_integrations:
      - YouTube_Shorts_adapter
      - TikTok_draft_adapter
      - Instagram_Reels_adapter
      - Shopify_media_adapter
    enterprise:
      - SSO_SAML
      - dedicated_buckets
      - Object_Lock_legal_hold_workflows
      - audit_export
      - custom_roles
      - dedicated_worker_pools
```

---

# 18. Dependency Map

```mermaid
flowchart TB
  Specs[Docs 00-27]
  Repo[Repo Skeleton]
  UI[Frontend App UI Screens First]
  Marketing[Marketing/Public Screens Optional]
  Foundation[Platform Foundation]
  Data[DB + Contracts]
  B2[B2 Integration]
  NATS[NATS Events]
  Auth[Clerk + RBAC]
  Catalog[Catalog + Snapshot]
  Session[Session + Source]
  Signals[Signals + Candidate]
  Mastra[Mastra Recommendation]
  Capture[Capture Worker]
  Gen[Genblaze Worker]
  QA[QA]
  ReviewAPI[Review API]
  Publish[Publish Package + Share]
  Prov[Provenance Graph]
  Wire[Wire UI to Real Backend]
  E2E[Golden Path E2E]
  Deploy[Deploy + Submit]

  Specs --> Repo
  Repo --> UI
  UI -. deferable .-> Marketing
  UI --> Foundation
  Foundation --> Auth
  Foundation --> NATS
  Foundation --> B2
  Foundation --> Data
  Data --> Catalog
  Data --> Session
  Catalog --> Session
  Session --> Signals
  Signals --> Mastra
  Mastra --> Capture
  B2 --> Capture
  NATS --> Capture
  Capture --> Gen
  Gen --> QA
  QA --> ReviewAPI
  ReviewAPI --> Publish
  Publish --> Prov
  Gen --> Prov
  Prov --> Wire
  ReviewAPI --> Wire
  Auth --> Wire
  Wire --> E2E
  Marketing -. supports submission polish .-> Deploy
  E2E --> Deploy
```

---

# 19. AI Coding Agent Work Protocol

Every coding agent must follow this protocol.

```txt
1. Read 00, 02, 03, 04, and the relevant domain spec.
2. Identify the exact task ID.
3. Identify required API/event/schema/data changes.
4. Implement only the task scope.
5. Add tests mapped to requirement IDs.
6. Do not invent provider models, storage keys, roles, claims, or UI tokens.
7. Do not bypass Core API state transitions.
8. Do not give agents direct B2/provider/database credentials.
9. Do not overwrite canonical B2 objects.
10. Update docs/contracts if behavior changes.
```

## 19.1 Required task prompt format for coding agents

```txt
Task ID:
Relevant specs:
Requirement IDs:
Files likely touched:
Expected output:
Tests required:
Do not change:
```

## 19.2 Stop conditions

Coding agents must stop or request a spec update when:

```txt
required field is missing from schema
new permission/capability is needed
state transition is undefined
B2 key pattern is unclear
product claim behavior is ambiguous
external publish behavior is requested without policy
secrets or credentials are requested in code
```

---

# 20. Test Gate Matrix

| Gate | Required before | Includes |
|---|---|---|
| GATE-STATIC | every PR | lint, typecheck, format, secret scan |
| GATE-SCHEMA | API/event/manifest changes | OpenAPI, AsyncAPI, JSON Schema validation |
| GATE-DB | migration PRs | migration apply/rollback, FK/index checks |
| GATE-AUTH | auth/RBAC PRs | capability denial tests, tenant isolation tests |
| GATE-WORKER | worker PRs | duplicate event, retry, DLQ, idempotency |
| GATE-MEDIA | media PRs | checksum, manifest validation, no overwrite |
| GATE-AI | agent PRs | structured output, tool denial, prompt injection fixtures |
| GATE-UI | frontend PRs | component/playwright tests, tokens, empty/loading/error states |
| GATE-GOLDEN | deploy/submission | full seeded demo path |

---

# 21. Release Gates

## 21.1 Hackathon release gate

```txt
[ ] App URL loads.
[ ] Demo seed runs idempotently.
[ ] Golden path E2E passes.
[ ] B2 raw/enhanced/manifest objects exist.
[ ] Genblaze run or clearly labeled cached run exists.
[ ] Provenance graph renders.
[ ] Review approval works.
[ ] Share page works.
[ ] Demo video recorded.
[ ] Submission story proofread.
```

## 21.2 Production beta gate

```txt
[ ] No P0 security gaps open.
[ ] RLS or equivalent tenant isolation defense exists for app-facing queries.
[ ] Retention/deletion jobs work.
[ ] Admin recovery covers DLQ, stuck runs, B2 reconciliation.
[ ] Cost ledger and budget caps work.
[ ] QA blocks unsafe product claims.
[ ] Provider failures do not create duplicate charges or orphan assets.
[ ] Observability dashboard covers golden path.
```

---

# 22. Known Open Questions

These are not blockers for the hackathon golden path unless they affect selected implementation choices.

```txt
1. Exact production hosting provider.
2. Exact managed NATS provider.
3. Exact secrets manager.
4. Exact observability backend.
5. Exact STT provider.
6. Exact first real vision/product detection model.
7. Exact Genblaze provider/model choices.
8. Exact B2 Object Lock policy.
9. Exact retention defaults by plan.
10. Exact pricing model.
11. Exact external publish adapter priorities.
12. Exact enterprise isolation design.
```

---

# 23. Backlog Summary by Priority

```yaml
P0_ui_first:
  - frontend_app_bootstrap
  - design_tokens_applied
  - workspace_shell
  - setup_onboarding_screen
  - catalog_campaign_template_screens
  - Live_Studio_preflight_and_control_room
  - signal_timeline_and_candidate_cards
  - Moment_Vault
  - Review_Queue
  - raw_vs_enhanced_compare
  - provenance_graph
  - publish_package_share_page
  - admin_recovery_settings_shells
  - fixture_route_smoke_tests
P0_marketing_optional:
  - marketing_landing_page
  - demo_story_page
  - architecture_provenance_explainer
  - screenshots_gallery
P0_backend_and_wiring:
  - Clerk_or_dev_auth
  - internal_RBAC
  - P0_database_schema
  - B2_raw_and_derived_storage
  - NATS_events
  - seeded_catalog_campaign_snapshot
  - prerecorded_live_session
  - signal_candidate_detection
  - Mastra_recommendation
  - capture_policy
  - capture_worker
  - Genblaze_worker
  - provenance_manifest
  - QA_minimal
  - review_queue_API
  - publish_package_share_page_API
  - frontend_real_API_wiring
  - golden_E2E
  - deployment_demo_submission
P1_beta:
  - CSV_import
  - controlled_rerender
  - advanced_QA
  - cost_reconciliation
  - admin_recovery
  - search_pgvector
  - retention_deletion_jobs
  - provider_fallback
  - operational_dashboards
P2_integrations:
  - Shopify
  - OBS_RTMP
  - social_publish_adapters
  - analytics
P3_enterprise:
  - SSO_SAML
  - dedicated_buckets
  - legal_hold
  - advanced_audit_export
```

---

# 24. Change Log

| Version | Change |
|---|---|
| v1 | Created ordered implementation plan with phases, task IDs, dependencies, definitions of done, test gates, coding-agent protocol, and release gates. |
| v2 | Reordered plan to build all core frontend app UI screens first, add optional marketing/public screens after app UI, then proceed through platform foundation, contracts/data, backend/media workflows, real API wiring, testing, deployment, beta hardening, and integrations. |
