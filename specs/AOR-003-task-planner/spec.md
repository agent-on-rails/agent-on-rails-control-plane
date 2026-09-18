---
id: AOR-003
title: Task Planner
status: draft
intent: >
  Turn READY specs into explicit dependency-aware task graphs rather than a
  single unbounded prompt.
implementation:
  repositories:
    - agent-on-rails-engine
verification:
  tests:
    - unit
    - integration
evidence_required:
  - implementation-pr
  - test-results
  - execution-log
---

# AOR-003 — Task Planner

## Summary

Once a spec is `READY`, the planner creates tasks with explicit dependencies so agents can work in parallel without losing the architectural contract.

The **Implementation Planner** role introduced in discovery ([AOR-011](../AOR-011-discovery-ai-team/spec.md) / [ADR-009](../../adr/ADR-009-discovery-ai-team.md)) does **not** end after emitting the control-plane pack. In delivery it remains the **planning authority**: it verifies what has merged, checks dependencies, and authorizes only the next eligible slice(s).

## Behavior

1. Read approved/ready spec, acceptance, ADRs, and implementation repos.
2. Emit a task graph with stable task IDs.
3. Encode dependencies (e.g. policy → router + state machine → telemetry → tests).
4. Tag (or infer) **capability requirements** per task/step when known — e.g. `needs: [node_npm]`, `needs: [android_device]` — so AOR-009 can continue independent work after an env block.
5. Persist graph for scheduling and GitHub Issue representation.
6. Re-planning is versioned; do not silently rewrite in-flight task identities without audit.

## Continuous Implementation Planner (delivery)

After discovery hand-off, the same planning role (human-operated or agent-assisted under policy):

1. **Verify merged slices** against acceptance / evidence for completed tasks.
2. **Re-check dependencies** when the graph or repo state changes (merge, reject, blocked env).
3. **Authorize only next eligible slices** — do not release the whole remaining graph as one unbounded wave when policy requires incremental authorization.
4. **Request architecture / spec change** when a gap is found that the current APPROVED contract cannot absorb — escalate per human-approval / ADR rules rather than silently expanding scope.
5. Emit role reports for planning decisions that change eligibility (see [`policies/role-reports.md`](../../policies/role-reports.md)).

Discovery-only pack emission stays in AOR-011; this section owns the **ongoing** planner lifecycle during delivery.

## Out of scope

- Fully autonomous speculative task invention beyond the spec
- Cross-organization multi-product planning
- Automatically repairing the operator’s local toolchain
- Replacing Implementor / Reviewer roles (AOR-004 / AOR-005)