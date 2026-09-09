# Phase 1 — Backend coherence (AOR-006 / AOR-009)

**Status:** Specs in `REVIEW` — awaiting human `APPROVED` before treating sibling-repo work as production-compliant.

**Source:** Backend review handoff (2026-09-09) against CLI / engine / runtime / control-plane `main`.

**Goal:** Make the existing escalation + watchdog spine coherent enough that `aor run` talks to a stateful engine and reports match the contract — without claiming full unattended AI Team readiness yet.

## Governing contracts (this change set)

| Artifact | Change |
| --- | --- |
| [AOR-006](../specs/AOR-006-model-escalation/spec.md) | Forever-loop **Option A** (ladder primary; strike max = ceiling); `status: review` |
| [AOR-009](../specs/AOR-009-unattended-ai-team-runtime/spec.md) | Task API MVP, engine-owned state, full RunReport, wave-level `HUMAN_REQUIRED` for env; `status: review` |
| [`policies/escalation.md`](../policies/escalation.md) | Aligned to Option A + env semantics |
| [`policies/execution-watchdog.md`](../policies/execution-watchdog.md) | Specific-first Gradle classification + RunReport fields |
| [`schemas/evidence.schema.json`](../schemas/evidence.schema.json) | `run_report` gains `spec_id`, `coding_failures`, `notifications_sent` |

## Phase 1 checklist (sibling repos after APPROVED)

1. [ ] **Runtime:** Fix Gradle watchdog classification (specific-first); regression tests for `test` / `build` / `install*` / `connected*Test` / `adb`.
2. [ ] **Engine + CLI:** Implement shared task API — `POST/GET /v1/tasks/{id}`, `POST .../events`, `GET .../history` — so `aor run TASK-001` with `AOR_ENGINE_URL` no longer 404s.
3. [ ] **Engine:** Persist authoritative task / attempt / tier / strike / signature history; callers report events only.
4. [ ] **Engine:** AOR-006 Option A ladder + ceiling tests match control-plane wording.
5. [ ] **Runtime + Engine:** Emit RunReport with all normative fields; attach via AOR-007 evidence shape.

## Explicitly deferred to Phase 2+

- Full Manager state machine (implementor ↔ reviewer ↔ fixer scheduling end-to-end)
- Provider-neutral agent adapter contracts + mandatory role-report enforcement in every hop
- Multi-repository task graph / continue-independent across repos
- Full AOR-006 / AOR-009 integration suites beyond Phase 1 fixtures

## Human approval gate

Per [`policies/human-approval.md`](../policies/human-approval.md):

1. Review AOR-006 + AOR-009 + this plan.
2. Record durable approval (GitHub review / structured comment / audit event) referencing artifact SHAs.
3. Only then move specs `REVIEW → APPROVED` and schedule Phase 1 implementation tasks.

Until approved, sibling work remains **experimental spike / prototype** relative to dogfood governance — do not mark specs `DONE` against unapproved contracts.

## Definition of done (Phase 1 only)

```text
aor run TASK-001  (AOR_ENGINE_URL set)
  → engine creates/loads state
  → escalation decisions use Option A
  → watchdog classifies Gradle correctly
  → status/history visible via CLI
  → wave end can emit full RunReport
```

Full unattended dogfood DoD remains AOR-009 acceptance (Phase 2+).
