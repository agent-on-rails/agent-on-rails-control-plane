# Sample Lakuyo spec shape (illustrative)

This file shows how a **consumer** control plane (Lakuyo) would author a spec that Agent On Rails executes. It is an example only; authoritative Lakuyo specs live in `lakuyo-control-plane`.

```yaml
id: LKY-001
title: Record cash sale
status: approved
intent: >
  Allow a cashier to record a simple cash sale and persist it to the backend.
acceptance:
  - cashier can create a cash sale with line items
  - backend persists sale with totals
  - failure modes return actionable errors
  - unit and integration tests pass
implementation:
  repositories:
    - lakuyo-backend
    - lakuyo-android
verification:
  tests:
    - unit
    - integration
evidence_required:
  - implementation-pr
  - test-results
  - review
  - execution-log
```

## Flow under Agent On Rails

1. Spec reaches `APPROVED` / `READY` in `lakuyo-control-plane`.
2. Engine builds a task graph (API + Android client + tests).
3. Agents implement behind PRs with cheap-first model routing.
4. Reviewer verifies against acceptance without implementer traces.
5. Evidence attaches; spec becomes `DONE`.
