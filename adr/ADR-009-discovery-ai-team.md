# ADR-009: Discovery AI Team (pre-coding staged agents)

- **Status:** Proposed
- **Date:** 2026-09-17
- **Source:** Product discussion (Iman / Herry Suryo Nugroho), WhatsApp 2026-09-16
- **Related:** [ADR-005](./ADR-005-ai-team-first-class.md), [AOR-010](../specs/AOR-010-natural-spec-gathering/spec.md), [AOR-011](../specs/AOR-011-discovery-ai-team/spec.md)

## Context

ADR-005 defines the **delivery** AI Team (Manager / Implementor / Reviewer / specialists) that operates *after* a governing contract exists. AOR-010 (`aor gather`) is a useful **single-shot** shortcut from natural language to a SurveyDesk-shaped draft pack.

Herry’s dogfood pattern showed a richer pre-coding loop that produces better contracts:

1. **Product Owner** — persona of the real stakeholder (or a cosplay bot seeded from their brief); answers clarifying questions.
2. **Product Manager** — interviews the Product Owner and produces a **PRD**.
3. **Solution Architect** — joins only after the PRD exists; produces **ARCHITECTURE.md** (stack, deploy target, integrations). Persona is pluggable (e.g. Cloudflare + Midtrans, AWS, etc.).
4. **Implementation Planner** — joins only after architecture exists; emits the **control-plane pack** (specs / ADRs / acceptance skeleton) that coding agents will execute.

This staged “grill” is closer to how strong human product teams work than a one-pass extract. It also matches the authority cascade already in AGENTS.md: intent → proposition → PRD → architecture → ADRs → specs → acceptance → plan → tasks → agents.

## Decision

**Discovery AI Team** is a first-class Agent On Rails phase that runs **before** the delivery AI Team.

| Role | Joins when | Primary artifact |
| --- | --- | --- |
| Product Owner (PO) | Start | Answers / constraints (human or seeded persona) |
| Product Manager (PM) | Start | `PRD.md` (or `product/prd.md`) |
| Solution Architect | After PRD accepted (human or policy gate) | `ARCHITECTURE.md` (+ draft ADRs as needed) |
| Implementation Planner | After architecture accepted | Control-plane drafts (SurveyDesk-shaped or AOR `specs/` pack) |

Rules:

1. **Stage gates** — later roles MUST NOT rewrite earlier artifacts silently. They may propose questions or deltas that require human (or prior-stage) confirmation.
2. **Human authority** — discovery outputs are **drafts**. Specs are not `APPROVED` until normal human approval (`policies/human-approval.md`). Auto-approve is forbidden.
3. **Personas are templates** — architect/PM/PO prompts are selectable templates (Cloudflare SA, AWS SA, generic web, etc.), not hard-coded vendor lock-in (ADR-003).
4. **Relationship to AOR-010** — `aor gather` remains the fast path. Discovery Team (`aor grill` / equivalent) is the richer multi-agent path; both may share the same writer / SurveyDesk layout.
5. **Model posture** — prefer stronger models for PM / Architect / Planner judgment; prefer fast/cheap models for later coding Implementors, with smarter Reviewers (aligns with cost controls + AOR-006). Discovery does not escalate forever; cost and turn bounds apply.
6. **Hand-off** — when the Implementation Planner finishes, the project has a control-plane pack ready for human review → `APPROVED` → delivery AI Team (ADR-005 / AOR-009).

## Consequences

- Team templates include at least: **Discovery Team** and **Feature Delivery Team**.
- CLI / engine gain a discovery orchestration surface distinct from unattended implement→review (AOR-009).
- Product journey step “grill/produce PRD + docs” becomes an explicit contract (AOR-011), not only marketing copy.
- Operators can still skip discovery and paste NL into `aor gather` when speed matters.
