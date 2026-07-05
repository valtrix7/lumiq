# AGENTS.md — Lumiq Coding Agent Instructions

This file is the primary operating guide for AI coding agents working in the Lumiq repository.

Lumiq is a spec-first, UI-first live-commerce media platform. Follow this file before making code changes.

---

## 1. Current implementation priority

Build in this order:

1. Repository and development-environment scaffold.
2. Frontend app UI screens first, using Lumiq tokens and contract-shaped fixtures.
3. Optional marketing/public screens only after the core app UI is usable.
4. Platform foundation: Core API, auth/dev auth, Postgres, NATS, B2/local object storage, service identities.
5. Contracts/data model: OpenAPI, AsyncAPI, JSON Schema, migrations, validation.
6. Golden-path backend/AI/media workflow.
7. Wire UI to real APIs, events, signed URLs, and stored assets.
8. Testing, observability, deployment, demo submission, and beta hardening.

The first visible milestone is a clickable Lumiq workspace using mock/seed data:

```txt
Setup → Catalog → Campaigns → Live Studio → Detected Moment → Review Queue → Moment Detail → Provenance Graph → Publish Package → Share Page
```

Do not block this milestone by overbuilding backend breadth early.

---

## 2. Read order before implementation

Start with these files when present:

1. `README.md`
2. `AGENTS.md`
3. `docs/00-spec-index.md`
4. `docs/architecture/02-project-constitution.md`
5. `docs/product/03-glossary-domain-language.md`
6. `docs/product/05-user-flows-ux-spec.md`
7. `docs/engineering/27-implementation-plan-tasks.md`
8. Lumiq design-system files under `packages/design-system` or `apps/web/design-system`
9. API/event/schema contracts under `docs/contracts`

If a referenced spec file is missing from the repo, do not invent broad behavior. Use the README and this file, make the smallest safe assumption, and leave a clear TODO or note in the final response.

---

## 3. Non-negotiable architecture rule

Preserve this responsibility split:

```txt
Mastra recommends.
Core API authorizes.
NATS dispatches.
Workers execute.
Genblaze generates media.
Backblaze B2 stores media and proof.
Neon/Postgres tracks operational truth.
```

Do not move responsibilities across boundaries unless a spec explicitly says to.

Examples:

- Agents may suggest; they must not write to B2, mutate Postgres, publish externally, delete assets, or change budgets.
- Workers execute approved jobs; they must report state through Core API or an approved state-transition path.
- NATS transports jobs/events; it is not business truth.
- B2 stores media/manifests; it is not the query database.
- Postgres stores operational state, IDs, relationships, permissions, audit metadata, and provenance links.

---

## 4. Development environment expectations

Use this repo shape:

```txt
apps/web
apps/api
apps/mastra
apps/workers
packages/ui
packages/design-system
packages/api-client
packages/test-fixtures
packages/schemas
packages/contracts
packages/db
packages/domain
packages/events
packages/storage
packages/media
packages/observability
infra/*
tests/*
scripts/*
```

Default local commands:

```bash
pnpm install
cp .env.example .env.local
pnpm dev
docker compose up --build
pnpm lint
pnpm typecheck
pnpm test
pnpm contracts:validate
pnpm schemas:validate
pnpm seed:demo
pnpm test:e2e:golden
```

If scripts are not implemented yet, add safe placeholder scripts rather than deleting the expected command names.

Local development must use mock providers by default. Real provider calls require explicit opt-in through environment variables such as:

```txt
USE_PROVIDER_MOCKS=false
ALLOW_REAL_PROVIDER_CALLS=true
```

Never commit `.env`, `.env.local`, provider keys, B2 keys, Clerk secrets, database URLs with real credentials, signed URLs, or generated private media.

---

## 5. Frontend/UI rules

The UI-first build must still reflect production truth.

Required app surfaces:

```txt
Workspace shell
Setup/onboarding
Catalog
Campaigns
Templates shell
Live Studio preflight
Live Studio control room
Signal timeline
Candidate moment cards
Moment Vault
Review Queue
Moment Detail
Raw/enhanced compare
Provenance graph
Publish package
Share page
Admin/recovery shell
Settings/budgets/providers shell
```

Rules:

- Use Lumiq design tokens only. Do not invent random colors, spacing, shadows, gradients, or typography.
- Lumiq is dark-only.
- Use the royal/cobalt accent for primary actions and live/active states.
- Use flat gradients only for rare AI/brand/provenance accents. No glow, blur, aura, neon haze, or decorative gradient blobs.
- Every important screen must include empty, loading, error, and blocked/unauthorized states where applicable.
- Hide or disable controls the user cannot perform, but remember frontend hiding is not authorization.
- Show provenance wherever relevant. Lumiq is not a generic AI clipper.
- Mock UI states must be realistic and clearly backed by contract-shaped fixture data.

---

## 6. Domain language

Use the Lumiq vocabulary consistently.

Prefer:

```txt
organization
user
membership
role
capability
session
moment
candidate_moment
signal
asset
generation_run
catalog_snapshot
allowed_claim
qa_check
publish_package
provenance_manifest
agent_tool_call
llm_run
audit_event
```

Avoid ambiguous terms unless qualified:

```txt
clip
file
AI job
metadata
stream
export
```

For example, use `raw_source_asset`, `enhanced_master_asset`, and `publish_variant_asset` instead of plain `clip`.

---

## 7. Product truth and safety boundaries

Commerce trust is a product requirement.

Do not implement flows that allow:

- Ungrounded product claims in captions, overlays, titles, thumbnails, or publish copy.
- AI-generated discounts, prices, availability, limited-stock claims, shipping promises, warranties, or superlatives without catalog/campaign support.
- AI restyling that changes product color, size, material, packaging, features, or buyer expectations without QA/human review.
- External publish without explicit approval/policy.
- Raw asset download/delete controls without capability checks.
- Canonical B2 object overwrite.
- Arbitrary shell, arbitrary SQL, arbitrary FFmpeg strings, or arbitrary provider calls from user/model/template input.
- Raw prompts, full raw transcripts, secrets, signed URLs, or provider outputs in normal logs.

When in doubt, fail closed and route to review.

---

## 8. Backend and event rules

Core API tasks must include, where relevant:

- Authentication or dev-auth adapter.
- Organization scope enforcement.
- Exact capability check for sensitive actions.
- Input schema validation.
- Idempotency key handling for mutating commands.
- State-machine guard.
- Audit event for sensitive actions.
- OpenAPI update if the public/internal HTTP contract changes.

Worker/event tasks must include, where relevant:

- AsyncAPI/event contract alignment.
- Envelope validation.
- Idempotent consumer behavior.
- ACK only after durable state or safe failure recording.
- Retry/DLQ behavior.
- Duplicate event test.

---

## 9. Media, storage, and provenance rules

Every important media/provenance output must have:

- A Postgres row or planned row contract.
- A B2/local-object-storage object or mock equivalent.
- Tenant-scoped object key beginning with `tenants/{organization_id}/`.
- SHA-256 checksum where canonical.
- Asset role.
- Generation run or manifest link where applicable.
- Provenance link for source → derived output.

Rerenders create new versions. Never overwrite canonical raw source, enhanced master, publish variant, or provenance manifest objects.

---

## 10. Agent implementation rules

For Mastra and LLM-related code:

- Use supervisor + specialist agent boundaries.
- Tools must be narrow, typed, gateway-only, scoped, audited, and schema-validated.
- LLM outputs that influence behavior must be structured and schema-validated.
- Treat transcripts, user prompts, product descriptions, chat/comments, provider errors, OCR/frame descriptions, and prior model outputs as untrusted data.
- Use `LLMProviderRouter` or a placeholder with the same boundary. Do not hardcode model/provider choices deep in business logic.
- Record `agent_tool_call` and `llm_run` metadata where applicable.

---

## 11. Testing and definition of done

A task is not done just because a screen renders or a function exists.

For frontend tasks, include:

- Token-compliant UI.
- Empty/loading/error/blocked states.
- Role/capability-aware controls.
- Fixture data shaped like contracts.
- Component or Playwright coverage for the main interaction when practical.

For backend/worker tasks, include:

- Unit tests for policy/state/idempotency logic.
- Integration or contract tests for API/event/schema boundaries.
- Failure-path tests for unsafe behavior where relevant.

For demo/golden-path tasks, include:

```txt
seed setup
start prerecorded-live session
detect candidate
Mastra recommendation or labeled fixture
capture authorization
raw source B2/local object write
Genblaze/mock generation
enhanced asset + manifest/provenance
QA pass
review approval
publish package/share page
provenance graph
```

---

## 12. Change discipline

Before editing:

1. Inspect existing files and package scripts.
2. Keep changes scoped to the task.
3. Prefer adding small, clear files over large speculative rewrites.
4. Do not delete specs, contracts, or design tokens.
5. Do not rename domain objects casually.
6. Do not make broad dependency/framework swaps without explicit user approval.
7. Do not push/deploy or make external provider calls unless explicitly instructed.

After editing, report:

- What changed.
- Which files changed.
- Which commands/tests passed or failed.
- Any assumptions or TODOs.

---

## 13. First task recommendation

For a fresh agent session, begin with:

```txt
Create the repo/dev scaffold and UI-first foundation without real provider calls.
```

Deliver:

- Root `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `.gitignore`, `.env.example`, and `docker-compose.yml` if missing.
- `apps/web` Next.js app shell.
- `packages/design-system` and/or copied Lumiq token files if available.
- `packages/test-fixtures` with contract-shaped demo data.
- Placeholder `apps/api` and `apps/mastra` services if missing.
- Local Postgres, NATS, and B2-compatible mock service configuration.
- Passing `pnpm install`, `pnpm typecheck`, and `pnpm lint` or a clear report explaining what still needs implementation.

Keep real AI/media/B2 provider calls disabled by default.