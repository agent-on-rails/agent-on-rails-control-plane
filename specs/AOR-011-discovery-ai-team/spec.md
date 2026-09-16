---
id: AOR-011
title: Discovery AI Team (staged PRD → architecture → control plane)
status: review
intent: >
  Operators run a staged Discovery AI Team (Product Owner, Product Manager,
  Solution Architect, Implementation Planner) that produces PRD, architecture,
  then control-plane draft packs with human gates between stages—before any
  coding Implementor runs. Complements AOR-010 single-shot gather.
implementation:
  repositories:
    - agent-on-rails-cli
    - agent-on-rails-engine
    - agent-on-rails-agent-runtime
verification:
  tests:
    - unit
    - integration
evidence_required:
  - implementation-pr
  - test-results
  - execution-log
  - review
---

# AOR-011 — Discovery AI Team

## Summary

Absorb Herry’s multi-bot discovery pattern into Agent On Rails:

> Product Manager interviews Product Owner → **PRD** → Solution Architect → **ARCHITECTURE** → Implementation Planner → **control-plane drafts** → human approval → delivery AI Team.

This is the governed form of “grill/produce PRD + docs” from the product proposition. It does **not** replace the delivery loop (AOR-004 / AOR-005 / AOR-009). It feeds that loop with better contracts.

Governing decision: [ADR-009](../../adr/ADR-009-discovery-ai-team.md). AI Team concept: [ADR-005](../../adr/ADR-005-ai-team-first-class.md).

## Roles

| Role | Responsibility | Default model posture |
| --- | --- | --- |
| **Product Owner** | Answers product questions; may be the human operator **or** a seeded persona (“cosplay” of the stakeholder) that the human can override | Medium / high judgment |
| **Product Manager** | Drives discovery dialogue; writes `product/prd.md` (or project-equivalent) | High judgment |
| **Solution Architect** | Joins after PRD gate; writes `ARCHITECTURE.md` and may draft ADRs; persona template selects deploy/integration bias (e.g. Cloudflare + payments) | High judgment |
| **Implementation Planner** | Joins after architecture gate; emits SurveyDesk-shaped or AOR `specs/` draft tree + acceptance skeletons | High / medium judgment |
| **Human** | Confirms stage exits; may inject answers; approves specs before READY | Always final authority |

Optional later specialists (security, payments, mobile) MAY be added under ADR-005 without changing this stage order.

## Operator surface

1. CLI primary (ADR-007): `aor grill` (name MAY alias `aor discover`).
2. Inputs:
   - Natural-language product brief (arg / `--file` / stdin)
   - Optional `--persona` / `--architect-template` (see [`templates/discovery/`](../../templates/discovery/))
   - Optional `--owner human|persona` (default: human answers via prompts; persona mode seeds PO from brief)
3. Engine MAY own long-running grill sessions later; MVP MAY be CLI-orchestrated turn loops with the same OpenAI-compatible LLM config as AOR-010 (`AOR_LLM_*`, ADR-003).
4. Desktop wizard (AOR-008) MAY offer “Grill (Discovery Team)” as an alternative to single-shot gather; it MUST NOT skip human confirm gates.

## Stage machine

```
BRIEF
  │
  ▼
STAGE_PRD          PM ↔ PO dialogue → draft PRD
  │
  ▼
GATE_PRD           human confirm / edit  (required)
  │
  ▼
STAGE_ARCHITECTURE Architect (+ optional questions to PM/PO) → ARCHITECTURE.md [+ draft ADRs]
  │
  ▼
GATE_ARCHITECTURE  human confirm / edit  (required)
  │
  ▼
STAGE_CONTROL_PLANE Implementation Planner → specs pack drafts
  │
  ▼
GATE_WRITE         human confirm before disk write (same spirit as AOR-010)
  │
  ▼
DRAFT_PACK_READY   specs remain draft until human APPROVED (not READY for coding yet)
```

### Stage rules

1. Architect MUST NOT start until `GATE_PRD` passes.
2. Implementation Planner MUST NOT start until `GATE_ARCHITECTURE` passes.
3. No stage MAY write application code (`apps/`, runtime repos) into the control plane.
4. Stub/offline mode MUST exist for tests (deterministic fixtures; no network).
5. Every agent turn that closes a stage MUST emit a **role report** ([`policies/role-reports.md`](../../policies/role-reports.md)) summarizing questions asked, decisions, and artifact paths.
6. Cost / turn bounds: discovery sessions MUST respect [`policies/cost-controls.md`](../../policies/cost-controls.md); runaway dialogue → stop + notify human (do not silently continue).

## Artifacts (minimum)

After a successful grill write:

```text
product/
  vision.md          # may be updated or stubbed from brief
  prd.md             # Product Manager output
ARCHITECTURE.md      # Solution Architect output (repo root or architecture/)
adr/                 # optional drafts proposed by Architect
specs/               # Implementation Planner output (SurveyDesk-shaped for consumer
                     # projects, or AOR-NNN packs when grilling Agent On Rails itself)
```

Consumer projects SHOULD prefer the SurveyDesk layout already defined by AOR-010 so gather and grill share one writer.

## Relationship to AOR-010

| Path | When to use |
| --- | --- |
| `aor gather` | Fast single-shot NL → outline → confirm → draft tree |
| `aor grill` | Multi-agent staged dialogue when PRD/architecture quality matters |

Both MUST share confirm-before-write and draft-not-approved semantics. Grill MAY call the same pack writer as gather after `STAGE_CONTROL_PLANE`.

## Out of scope

- Auto-approving specs or starting Implementors without human `APPROVED` / READY
- Replacing delivery Manager / Implementor / Reviewer (AOR-009)
- Hard-coding Cloudflare, Midtrans, or any single cloud as the only architect persona
- Chat UIs (WhatsApp/Telegram) as primary operator surface (roadmap non-goal)
- Generating production application code during discovery

## Reference scenario (Herry dogfood)

Online store brief → PM interviews PO → PRD → Cloudflare Solution Architect (Workers deploy + Midtrans) → `ARCHITECTURE.md` → Implementation Planner emits control-plane drafts → human reviews → coding agents implement later.

Persona templates for that scenario live under [`templates/discovery/`](../../templates/discovery/).
