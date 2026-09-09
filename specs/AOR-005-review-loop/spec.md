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
4. Reject returns structured feedback and requeues implementer **under AOR-006** (same-tier retry → escalate → `HUMAN_REQUIRED`); unbounded reject→fix loops are prohibited.
5. Reject feedback should be stable enough to detect `no_progress` (identical failure signatures).
6. Implementer cannot set `DONE`.
7. Environment / watchdog failures are not reviewer rejects; they bypass this loop into AOR-006 `environment` handling.

## Out of scope

- Human code owners replacing reviewer entirely (humans may still override)
- Full security audit productization
- Unattended orchestration wrapper (AOR-009)
