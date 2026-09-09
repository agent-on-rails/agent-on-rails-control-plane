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

## Behavior

1. Read approved/ready spec, acceptance, ADRs, and implementation repos.
2. Emit a task graph with stable task IDs.
3. Encode dependencies (e.g. policy → router + state machine → telemetry → tests).
4. Tag (or infer) **capability requirements** per task/step when known — e.g. `needs: [node_npm]`, `needs: [android_device]` — so AOR-009 can continue independent work after an env block.
5. Persist graph for scheduling and GitHub Issue representation.
6. Re-planning is versioned; do not silently rewrite in-flight task identities without audit.

## Out of scope

- Fully autonomous speculative task invention beyond the spec
- Cross-organization multi-product planning
- Automatically repairing the operator’s local toolchain
