---
id: AOR-011
title: Discovery AI Team (staged PRD → architecture → control plane)
status: approved
intent: >
  Operators run a staged Discovery AI Team (Product Owner, Product Manager,
  Solution Architect, Implementation Planner) that produces PRD, architecture,
  then control-plane draft packs—before any coding Implementor runs. Architect
  observes PO↔PM then authors after PRD APPROVED; stages support backward
  change requests; agents may write DRAFTs freely; humans gate APPROVED;
  sessions persist/resume. Complements AOR-010 single-shot gather.
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

> PM ↔ PO (Architect **observes**, may raise tech questions) → **PRD DRAFT → human APPROVED** → Architect authors **ARCHITECTURE** → human APPROVED → Implementation Planner → **control-plane DRAFTs** → human APPROVED specs → delivery AI Team.

This is the governed form of “grill/produce PRD + docs” from the product proposition. It does **not** replace the delivery loop (AOR-004 / AOR-005 / AOR-009). It feeds that loop with better contracts.

Governing decision: [ADR-009](../../adr/ADR-009-discovery-ai-team.md) (updated 2026-09-18 for Herry review). AI Team concept: [ADR-005](../../adr/ADR-005-ai-team-first-class.md). Ongoing planner authority in delivery: [AOR-003](../AOR-003-task-planner/spec.md).

## Roles

| Role | Responsibility | Default model posture |
| --- | --- | --- |
| **Product Owner** | Answers product questions; may be the human operator **or** a seeded persona (“cosplay” of the stakeholder) that the human can override | Medium / high judgment |
| **Product Manager** | Drives discovery dialogue; writes `product/prd.md` as **DRAFT** | High judgment |
| **Solution Architect** | **Observe** during PO↔PM (raise questions with technical implications only; no architecture file yet). **Author** `ARCHITECTURE.md` (+ draft ADRs) only after PRD is human-`APPROVED`. Persona template selects deploy/integration bias | High judgment |
| **Implementation Planner** | After architecture is human-`APPROVED`, emits SurveyDesk-shaped or AOR `specs/` **DRAFT** tree + acceptance skeletons. Discovery hand-off ends here; **delivery** planning authority continues under AOR-003 | High / medium judgment |
| **Human** | Approves PRD / architecture / specs (`DRAFT → APPROVED`); may inject answers; may resume sessions. Does **not** need to approve every disk write of a DRAFT | Always final authority |

Optional later specialists (security, payments, mobile) MAY be added under ADR-005 without changing this stage order.

## Operator surface

1. CLI primary (ADR-007): `aor grill` (name MAY alias `aor discover`).
2. Inputs:
   - Natural-language product brief (arg / `--file` / stdin)
   - Optional `--persona` / `--architect-template` (see [`templates/discovery/`](../../templates/discovery/))
   - Optional `--owner human|persona` (default: human answers via prompts; persona mode seeds PO from brief)
   - Optional `--resume [session-id]` to continue from last checkpoint
3. Engine MAY own long-running grill sessions; MVP MAY be CLI-orchestrated turn loops with the same OpenAI-compatible LLM config as AOR-010 (`AOR_LLM_*`, ADR-003).
4. Desktop wizard (AOR-008) MAY offer “Grill (Discovery Team)” as an alternative to single-shot gather; it MUST NOT auto-`APPROVED` drafts.
5. Session state MUST persist under the project (e.g. `.aor/grill/<session-id>/`) including stage, pending change requests, and artifact paths so disconnect/resume works.

## Stage machine

```
BRIEF
  │
  ▼
STAGE_PRD              PM ↔ PO; Architect OBSERVE (questions only)
  │                      agents MAY write product/prd.md as DRAFT anytime
  ▼
GATE_PRD_APPROVE       human DRAFT → APPROVED on PRD  (required to author architecture)
  │
  ▼
STAGE_ARCHITECTURE     Architect authors ARCHITECTURE.md [+ draft ADRs]
  │                      MAY REQUEST_PRD_CHANGE ──► STAGE_PRD (then GATE_PRD_APPROVE again)
  ▼
GATE_ARCHITECTURE_APPROVE  human DRAFT → APPROVED on architecture
  │
  ▼
STAGE_CONTROL_PLANE    Implementation Planner writes specs pack as DRAFT
  │                      MAY REQUEST_ARCHITECTURE_CHANGE ──► STAGE_ARCHITECTURE
  ▼
GATE_SPECS_APPROVE     human DRAFT → APPROVED on governing specs (normal lifecycle)
  │
  ▼
DISCOVERY_COMPLETE     delivery AI Team may plan/run (AOR-003 / AOR-009)
```

### Stage rules

1. Architect MUST NOT author `ARCHITECTURE.md` until `GATE_PRD_APPROVE` passes. Observe-mode questions during `STAGE_PRD` are allowed and SHOULD be recorded in the role report / session log.
2. Implementation Planner MUST NOT start pack emission until `GATE_ARCHITECTURE_APPROVE` passes.
3. **Backward transitions** are first-class:
   - `REQUEST_PRD_CHANGE` (from Architect, or human) → return to `STAGE_PRD` → require `GATE_PRD_APPROVE` again before architecture authorship resumes.
   - `REQUEST_ARCHITECTURE_CHANGE` (from Planner, or human) → return to `STAGE_ARCHITECTURE` → require `GATE_ARCHITECTURE_APPROVE` again before control-plane emission resumes.
   - Change requests MUST include a reason; they MUST NOT silently overwrite prior APPROVED artifacts (supersede via new DRAFT + re-approve).
4. **Draft autonomy** — agents MAY write/update DRAFT files on disk without a human “confirm write” prompt. Human gates are approval transitions only.
5. No stage MAY write application code (`apps/`, runtime repos) into the control plane.
6. Stub/offline mode MUST exist for tests (deterministic fixtures; no network).
7. Every agent turn that closes a stage or issues a change request MUST emit a **role report** ([`policies/role-reports.md`](../../policies/role-reports.md)).
8. Cost / turn bounds: discovery sessions MUST respect [`policies/cost-controls.md`](../../policies/cost-controls.md); runaway dialogue or unbounded change-request loops → stop + notify human.
9. **Persist / resume** — interrupting the CLI MUST NOT lose stage progress; `aor grill --resume` continues from the last durable checkpoint (stage + open change request if any).

## Artifacts (minimum)

During / after grill (as DRAFTs until approved):

```text
product/
  vision.md          # may be updated or stubbed from brief
  prd.md             # Product Manager DRAFT → APPROVED
ARCHITECTURE.md      # Solution Architect DRAFT → APPROVED (repo root or architecture/)
adr/                 # optional drafts proposed by Architect
specs/               # Implementation Planner DRAFT pack (SurveyDesk-shaped for consumer
                     # projects, or AOR-NNN packs when grilling Agent On Rails itself)
.aor/grill/<id>/     # session checkpoint (stage, reports, resume metadata)
```

Consumer projects SHOULD prefer the SurveyDesk layout already defined by AOR-010 so gather and grill share one writer.

## Relationship to AOR-010

| Path | When to use |
| --- | --- |
| `aor gather` | Fast single-shot NL → outline → write draft tree |
| `aor grill` | Multi-agent staged dialogue when PRD/architecture quality matters |

Both MUST leave artifacts as **draft / not auto-APPROVED**. Gather MAY retain an outline preview UX; grill MUST prioritize draft write autonomy + explicit approval gates (ADR-009). Grill MAY call the same pack writer as gather after `STAGE_CONTROL_PLANE`.

## Relationship to AOR-003 (delivery planning)

AOR-011 ends when the control-plane pack exists as drafts (and humans approve governing specs). The Implementation Planner role **continues in delivery** as planning authority: verify merged slices, check dependencies, authorize only the next eligible slice. That lifecycle is specified in [AOR-003](../AOR-003-task-planner/spec.md), not duplicated here.

## Out of scope

- Auto-approving PRD, architecture, or specs
- Starting Implementors without human `APPROVED` / READY on governing specs
- Replacing delivery Manager / Implementor / Reviewer (AOR-009)
- Fully specifying continuous delivery planner behavior (see AOR-003)
- Hard-coding Cloudflare, Midtrans, or any single cloud as the only architect persona
- Chat UIs (WhatsApp/Telegram) as primary operator surface (roadmap non-goal)
- Generating production application code during discovery

## Reference scenario (Herry dogfood)

Online store brief → PM interviews PO while Cloudflare Architect observes and raises Midtrans/Workers questions → PRD APPROVED → Architect authors `ARCHITECTURE.md` → APPROVED → Implementation Planner emits control-plane drafts → (if gap) Planner requests architecture change → re-approve → human approves specs → coding agents implement; Planner remains slice authority under AOR-003.

Persona templates for that scenario live under [`templates/discovery/`](../../templates/discovery/).

## Review notes (2026-09-18)

Accepted before APPROVED (Herry):

1. Architect observe-during-PRD, author-after-PRD-APPROVED  
2. Backward transitions (`REQUEST_PRD_CHANGE`, `REQUEST_ARCHITECTURE_CHANGE`)  
3. Continuous Implementation Planner → AOR-003 (not all of AOR-011)  
4. Agents write DRAFT freely; humans gate APPROVED  
5. Grill session persist / resume  
