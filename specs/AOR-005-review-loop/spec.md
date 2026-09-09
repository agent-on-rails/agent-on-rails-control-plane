---
id: AOR-005
title: Review Loop
status: draft
intent: >
  Separate implementer and reviewer so a coding agent cannot mark its own work
  complete; reviewers judge against spec, acceptance, diff, tests, and evidence.
implementation:
  repositories:
    - agent-on-rails-engine
    - agent-on-rails-agent-runtime
    - agent-on-rails-github
verification:
  tests:
    - unit
    - integration
evidence_required:
  - implementation-pr
  - test-results
  - review
  - execution-log
---

# AOR-005 — Review Loop

## Summary

```
IMPLEMENTER → implementation → REVIEWER → ACCEPT | REJECT(+feedback)
```

The reviewer receives spec, acceptance criteria, diff, tests, and evidence—not the implementer’s private chain of work—reducing confirmation bias.

## Behavior

1. On PR readiness, engine schedules a reviewer role (different agent session).
2. Reviewer cannot access implementer hidden traces by default.
3. Accept moves task to evidence finalization / verifying.
4. Reject returns **structured** feedback (finding codes / failing checks) so AOR-006 can build a **failure signature** and decide `normal_progress` vs `forever_loop`.
5. Every reviewer assignment **must end** with a valid **role report** (`outcome: accepted | rejected`, plus `findings[]` with `signature` on reject) per [`schemas/role-report.schema.json`](../../schemas/role-report.schema.json) and [`policies/role-reports.md`](../../policies/role-reports.md).
6. Reject requeues implementer/fixer under AOR-006: distinct bugs continue as normal fix↔review; same signature repeating hits the forever-loop ladder — not a blunt “N attempts = stop.”
7. Implementer cannot set `DONE`.
8. Environment / watchdog failures are not reviewer rejects; they bypass this loop into AOR-006 `environment` handling.

## Out of scope

- Human code owners replacing reviewer entirely (humans may still override)
- Full security audit productization
- Unattended orchestration wrapper (AOR-009)
