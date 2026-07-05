# 00 — Spec Index

**Project:** Lumiq — Live Commerce Moment Vault  
**Document ID:** `00-spec-index.md`  
**Status:** Draft v1  
**Audience:** founders, engineers, AI coding agents, designers, QA, reviewers  
**Purpose:** Master map for the specification-driven development system.

---

## 1. Purpose

This document is the front door for the Lumiq specification kit.

Every human engineer, AI coding agent, designer, QA reviewer, or implementation assistant should start here before touching code.

Lumiq is a complex product that combines:

```txt
live media ingestion
AI agent reasoning
Mastra agent orchestration
Genblaze media generation
Backblaze B2 storage
NATS JetStream events
Neon Postgres state machines
product catalog grounding
review workflows
publish packages
provenance manifests
auditability
```

Because of that complexity, implementation must be spec-driven. The goal is to avoid architectural drift, hallucinated backend behavior, inconsistent domain terms, missing provenance, unsafe agent permissions, and ungrounded AI-generated product claims.

This index answers:

1. Which documents exist?
2. Which documents are missing?
3. Which document should be read first?
4. Which document owns which decisions?
5. What should coding agents do before implementation?
6. How should specs be updated when requirements change?

---

## 2. Current Spec-Kit Progress

The original spec kit contains **28 planned documents**.

As of this document version:

```txt
Official spec-kit docs completed before this turn:
  3 / 28

Official spec-kit docs completed after this turn:
  5 / 28
```

Completed official spec-kit documents:

```txt
00-spec-index.md
01-product-requirements.md
02-project-constitution.md
03-glossary-domain-language.md
04-requirements-ears.md
```

Important note:

The product requirements source currently lives in the repo as:

```txt
docs/product/PRD.md
```

Treat `PRD.md` as the canonical `01-product-requirements.md` document until the file is
renamed or aliased.

Auxiliary design-system files have also been created, but they are **not counted** as part of the original 28-doc spec kit:

```txt
lumiq-DESIGN.md
lumiq-theme.css
lumiq-tokens.json
lumiq-variables.css
lumiq-design-system.zip
```

Those files should live under a design-system directory or frontend package.

---

## 3. Canonical Spec Directory Structure

Recommended repo structure:

```txt
/docs
  00-spec-index.md

  /product
    01-product-requirements.md
    03-glossary-domain-language.md
    04-requirements-ears.md
    05-user-flows-ux-spec.md

  /architecture
    02-project-constitution.md
    06-system-architecture-c4.md
    07-service-decomposition.md
    08-data-model-database-schema.md
    12-agent-architecture-mastra.md
    13-genblaze-media-pipeline.md
    14-b2-storage-provenance-spec.md

  /contracts
    09-api-contract-openapi.yaml
    10-event-contract-asyncapi.yaml
    11-json-schemas.md
    /schemas
      asset.schema.json
      moment.schema.json
      generation-run.schema.json
      provenance-manifest.schema.json
      agent-tool-call.schema.json
      template-step.schema.json
      nats-events.schema.json

  /policies
    15-template-step-graph-spec.md
    16-moment-detection-ranking-spec.md
    17-catalog-product-grounding-spec.md
    18-qa-moderation-policy-spec.md
    19-security-rbac-threat-model.md
    20-ai-security-safety-spec.md
    21-privacy-retention-deletion-spec.md
    22-observability-audit-cost-spec.md

  /engineering
    23-infrastructure-deployment-spec.md
    24-testing-evaluation-spec.md
    25-admin-recovery-runbooks.md
    27-implementation-plan-tasks.md

  /demo
    26-hackathon-demo-submission-spec.md
```

Recommended design-system location:

```txt
/apps/web/design-system
  DESIGN.md
  theme.css
  variables.css
  tokens.json
```

or:

```txt
/packages/design-system
  DESIGN.md
  theme.css
  variables.css
  tokens.json
```

---

## 4. Document Status Table

| # | Document | Status | Purpose | Owner |
|---:|---|---|---|---|
| 00 | `00-spec-index.md` | Created | Master map, reading order, status, governance | Product/Architecture |
| 01 | `PRD.md` (`01-product-requirements.md`) | Created | Product scope, goals, architecture-level product decisions | Product |
| 02 | `02-project-constitution.md` | Created | Non-negotiable architecture, safety, design, and implementation rules | Architecture |
| 03 | `03-glossary-domain-language.md` | Created | Shared vocabulary and domain language | Product/Architecture |
| 04 | `04-requirements-ears.md` | Created | Structured requirements and acceptance criteria | Product/QA |
| 05 | `05-user-flows-ux-spec.md` | Pending | User journeys, app screens, UX states, review flows | Product/Design |
| 06 | `06-system-architecture-c4.md` | Pending | C4 context/container/component/deployment architecture | Architecture |
| 07 | `07-service-decomposition.md` | Pending | Core API, Mastra service, workers, boundaries | Architecture |
| 08 | `08-data-model-database-schema.md` | Pending | Postgres schema, enums, indexes, partitions | Backend |
| 09 | `09-api-contract-openapi.yaml` | Pending | HTTP/RPC API contract | Backend |
| 10 | `10-event-contract-asyncapi.yaml` | Pending | NATS subjects/messages/contracts | Backend |
| 11 | `11-json-schemas.md` + `/schemas` | Pending | JSON schemas for events, manifests, tool calls | Backend/QA |
| 12 | `12-agent-architecture-mastra.md` | Pending | Mastra agents, tools, memory, structured outputs | AI/Backend |
| 13 | `13-genblaze-media-pipeline.md` | Pending | Genblaze usage, runs, providers, step execution | Media/AI |
| 14 | `14-b2-storage-provenance-spec.md` | Pending | B2 buckets, keys, manifests, retention, lineage | Storage |
| 15 | `15-template-step-graph-spec.md` | Pending | Templates, step registry, safe execution | Media/Backend |
| 16 | `16-moment-detection-ranking-spec.md` | Pending | Signals, scoring, thresholds, policy gates | AI/Product |
| 17 | `17-catalog-product-grounding-spec.md` | Pending | Products, campaigns, claims, snapshots, validation | Commerce |
| 18 | `18-qa-moderation-policy-spec.md` | Pending | QA gates, failure classes, moderation | Safety/QA |
| 19 | `19-security-rbac-threat-model.md` | Pending | RBAC, service identities, threat model | Security |
| 20 | `20-ai-security-safety-spec.md` | Pending | Prompt injection, tool misuse, model safety | AI/Security |
| 21 | `21-privacy-retention-deletion-spec.md` | Pending | Retention, deletion, export, transcript policy | Privacy |
| 22 | `22-observability-audit-cost-spec.md` | Pending | Logs, metrics, traces, audit, cost ledger | Platform |
| 23 | `23-infrastructure-deployment-spec.md` | Pending | Environments, containers, secrets, CI/CD | DevOps |
| 24 | `24-testing-evaluation-spec.md` | Pending | Unit/integration/contract/E2E/AI evals | QA |
| 25 | `25-admin-recovery-runbooks.md` | Pending | DLQ, replay, stuck runs, reconciliation | Operations |
| 26 | `26-hackathon-demo-submission-spec.md` | Pending | Demo scenario, judge story, must-be-real pieces | Product/Demo |
| 27 | `27-implementation-plan-tasks.md` | Pending | Ordered implementation plan and task graph | Engineering |

---

## 5. Reading Order for Humans

### 5.1 Product / Founder Reading Order

```txt
00-spec-index.md
PRD.md
03-glossary-domain-language.md
04-requirements-ears.md
05-user-flows-ux-spec.md
26-hackathon-demo-submission-spec.md
27-implementation-plan-tasks.md
```

### 5.2 Backend Engineer Reading Order

```txt
00-spec-index.md
02-project-constitution.md
03-glossary-domain-language.md
PRD.md
04-requirements-ears.md
06-system-architecture-c4.md
07-service-decomposition.md
08-data-model-database-schema.md
09-api-contract-openapi.yaml
10-event-contract-asyncapi.yaml
11-json-schemas.md
```

### 5.3 AI/Agent Engineer Reading Order

```txt
00-spec-index.md
02-project-constitution.md
03-glossary-domain-language.md
04-requirements-ears.md
12-agent-architecture-mastra.md
16-moment-detection-ranking-spec.md
17-catalog-product-grounding-spec.md
18-qa-moderation-policy-spec.md
20-ai-security-safety-spec.md
```

### 5.4 Media Pipeline Engineer Reading Order

```txt
00-spec-index.md
02-project-constitution.md
03-glossary-domain-language.md
13-genblaze-media-pipeline.md
14-b2-storage-provenance-spec.md
15-template-step-graph-spec.md
18-qa-moderation-policy-spec.md
22-observability-audit-cost-spec.md
```

### 5.5 Frontend / Design Engineer Reading Order

```txt
00-spec-index.md
01-product-requirements.md
03-glossary-domain-language.md
05-user-flows-ux-spec.md
lumiq-DESIGN.md
lumiq-theme.css
lumiq-variables.css
lumiq-tokens.json
09-api-contract-openapi.yaml
```

### 5.6 QA Reading Order

```txt
00-spec-index.md
03-glossary-domain-language.md
04-requirements-ears.md
09-api-contract-openapi.yaml
10-event-contract-asyncapi.yaml
11-json-schemas.md
24-testing-evaluation-spec.md
25-admin-recovery-runbooks.md
```

---

## 6. Reading Order for AI Coding Agents

Every AI coding agent must follow this sequence before editing code.

```txt
1. Read 00-spec-index.md.
2. Read 02-project-constitution.md.
3. Read 03-glossary-domain-language.md.
4. Read PRD.md.
5. Read 04-requirements-ears.md.
6. Read the specific spec related to the task.
7. Read relevant contracts/schemas.
8. Implement only the requested scope.
9. Add or update tests mapped to requirement IDs.
10. If behavior is unspecified, stop and request clarification or update the spec first.
```

For frontend tasks, the agent must also read:

```txt
lumiq-DESIGN.md
lumiq-theme.css
lumiq-variables.css
lumiq-tokens.json
```

For API/event tasks, the agent must also read:

```txt
09-api-contract-openapi.yaml
10-event-contract-asyncapi.yaml
11-json-schemas.md
```

For Genblaze/media tasks, the agent must also read:

```txt
13-genblaze-media-pipeline.md
14-b2-storage-provenance-spec.md
15-template-step-graph-spec.md
```

For Mastra/agent tasks, the agent must also read:

```txt
12-agent-architecture-mastra.md
20-ai-security-safety-spec.md
```

---

## 7. Source-of-Truth Hierarchy

When documents conflict, use this precedence order:

```txt
1. 02-project-constitution.md
2. PRD.md
3. 04-requirements-ears.md
4. Domain-specific spec
5. Machine-readable contracts/schemas
6. Implementation tasks
7. Existing code
```

Important:

> Existing code does not override the specs. If code conflicts with the specs, either update the code or explicitly revise the specs.

Design-specific precedence:

```txt
1. Lumiq DESIGN.md
2. variables.css semantic variables
3. theme.css Tailwind variables
4. tokens.json
5. existing frontend code
```

---

## 8. Current Canonical Product Decisions

The following decisions are already locked and should not be re-decided during implementation.

### 8.1 Product

```txt
Product name:
  Lumiq

Category:
  Live Commerce Moment Vault

Core promise:
  Detect valuable live-commerce moments, generate polished clips, and prove lineage through B2-backed provenance.
```

### 8.2 Cloud and Storage

```txt
Backblaze B2:
  canonical media/provenance vault

Neon Postgres:
  operational source of truth

NATS JetStream:
  event/job backbone

Clerk:
  authentication

Containerized services:
  deployment model
```

### 8.3 Agents and LLMs

```txt
Mastra:
  agent orchestration framework

OpenAI:
  primary LLM provider

Anthropic Claude:
  secondary/fallback LLM

Gemini Flash-style:
  cheap validation later

LLMProviderRouter:
  required abstraction
```

### 8.4 Media

```txt
Genblaze:
  generative media orchestration layer

Provider APIs:
  Decart / GMI / Runway / OpenAI media models through adapters

Enhanced output:
  canonical enhanced master + publish variants
```

### 8.5 Safety and Provenance

```txt
Agents:
  may recommend, never directly mutate storage/provider/database state

Product facts:
  must be grounded in catalog/campaign snapshots

Raw capture:
  canonical evidence with tiered retention

Manifests:
  stored in B2 and indexed in Postgres

Publishing:
  human approval by default
```

### 8.6 Design

```txt
Core app:
  dark mode only

Primary accent:
  deep royal/cobalt blue

Gradients:
  flat linear gradients only, no glow/blur/aura

Typography:
  Inter + mono for technical data

UI style:
  cinematic AI studio + operational provenance system
```

---

## 9. Implementation Gating Rules

No implementation work should begin unless the related spec is created or the task is explicitly scoped as exploratory.

### 9.1 Backend Feature Gate

Before implementing backend features, the following must exist:

```txt
requirements reference
data model reference
API contract or internal service contract
event contract if async
test plan
```

### 9.2 Frontend Feature Gate

Before implementing frontend screens, the following must exist:

```txt
user flow
screen state definitions
component/design token reference
API/query contract
empty/loading/error states
```

### 9.3 Agent Feature Gate

Before implementing agent behavior, the following must exist:

```txt
agent role
input context schema
tool schema
structured output schema
permission boundaries
failure behavior
evaluation criteria
```

### 9.4 Media Pipeline Gate

Before implementing Genblaze/media steps, the following must exist:

```txt
template step graph
input asset contract
output asset contract
B2 key convention
manifest schema
QA gates
cost policy
```

---

## 10. Requirement ID Conventions

Requirement IDs are defined in `04-requirements-ears.md`.

Format:

```txt
REQ-{DOMAIN}-{NUMBER}
```

Examples:

```txt
REQ-AUTH-001
REQ-SESSION-004
REQ-CAPTURE-002
REQ-GEN-001
REQ-PROV-003
REQ-DEMO-006
```

All implementation tasks should reference at least one requirement ID.

---

## 11. Domain Naming Conventions

Use glossary terms exactly.

Examples:

```txt
session
moment
candidate_moment
asset
generation_run
llm_run
agent_tool_call
catalog_snapshot
publish_package
provenance_manifest
lineage_chain
```

Avoid ambiguous terms:

```txt
clip
AI job
metadata
stream
file
```

If these are used, qualify them:

```txt
raw_source_clip
enhanced_master_clip
publish_variant_clip
```

---

## 12. Coding Agent Rules

AI coding agents must obey these rules:

1. Do not invent architecture.
2. Do not bypass Core API state transitions.
3. Do not give agents raw B2/provider/database credentials.
4. Do not hardcode provider models where routing belongs to provider routers.
5. Do not create media outputs outside Genblaze/media worker boundaries.
6. Do not overwrite canonical B2 assets.
7. Do not generate ungrounded product claims.
8. Do not auto-publish externally without policy/human approval.
9. Do not create arbitrary colors or design tokens.
10. Do not skip audit events for state transitions.
11. Do not handle duplicate events without idempotency.
12. Do not add new domain terms without updating the glossary.
13. Do not add new behaviors without updating requirements.

---

## 13. Spec Update Protocol

When requirements change:

```txt
1. Update the relevant spec first.
2. Update glossary if new terms are introduced.
3. Update requirements if behavior changes.
4. Update API/event/schema contracts if payloads change.
5. Update implementation tasks.
6. Update tests.
7. Then update code.
```

For architecture changes:

```txt
1. Update 02-project-constitution.md if the change affects a non-negotiable rule.
2. Add or update an ADR if ADRs are introduced.
3. Update system architecture/service decomposition.
4. Update affected contracts.
5. Update tasks.
```

For design changes:

```txt
1. Update DESIGN.md.
2. Update tokens.json.
3. Update variables.css.
4. Update theme.css.
5. Then update components.
```

---

## 14. Machine-readable Contract Policy

The following specs should eventually have machine-readable artifacts:

```txt
09-api-contract-openapi.yaml
10-event-contract-asyncapi.yaml
11-json-schemas.md
/schemas/*.json
```

Until these are created, implementation should derive behavior from:

```txt
04-requirements-ears.md
03-glossary-domain-language.md
01-product-requirements.md
02-project-constitution.md
```

But once machine-readable contracts exist, code should validate against them.

---

## 15. Next Recommended Documents

After this index and the constitution, the next two high-value documents should be:

```txt
05-user-flows-ux-spec.md
06-system-architecture-c4.md
```

Rationale:

- `05-user-flows-ux-spec.md` gives frontend/design/coding agents exact screen flows.
- `06-system-architecture-c4.md` gives backend/infra agents the architecture map before service decomposition and contracts.

After those, create:

```txt
07-service-decomposition.md
08-data-model-database-schema.md
09-api-contract-openapi.yaml
10-event-contract-asyncapi.yaml
```

---

## 16. Completion Criteria for the Spec Kit

The spec kit is considered implementation-ready when these docs exist:

```txt
00-spec-index.md
01-product-requirements.md
02-project-constitution.md
03-glossary-domain-language.md
04-requirements-ears.md
05-user-flows-ux-spec.md
06-system-architecture-c4.md
07-service-decomposition.md
08-data-model-database-schema.md
09-api-contract-openapi.yaml
10-event-contract-asyncapi.yaml
11-json-schemas.md
12-agent-architecture-mastra.md
13-genblaze-media-pipeline.md
14-b2-storage-provenance-spec.md
15-template-step-graph-spec.md
16-moment-detection-ranking-spec.md
17-catalog-product-grounding-spec.md
18-qa-moderation-policy-spec.md
19-security-rbac-threat-model.md
20-ai-security-safety-spec.md
21-privacy-retention-deletion-spec.md
22-observability-audit-cost-spec.md
23-infrastructure-deployment-spec.md
24-testing-evaluation-spec.md
25-admin-recovery-runbooks.md
26-hackathon-demo-submission-spec.md
27-implementation-plan-tasks.md
```

A hackathon build can start earlier, but coding agents must be limited to the scope covered by existing specs.

---

## 17. Current Recommended Next Action

Current official spec progress after creating this document set:

```txt
5 / 28 official spec-kit docs complete
23 / 28 remaining
```

Next recommended action:

```txt
Create 05-user-flows-ux-spec.md
Create 06-system-architecture-c4.md
```

These can be created from existing PRD, glossary, requirements, and design-system decisions without further user questions.
