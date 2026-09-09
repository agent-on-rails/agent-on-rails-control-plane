---
id: AOR-009
title: Unattended AI Team Runtime
status: draft
intent: >
  Operate the AI Team (implementor → reviewer → fix → escalate) without a human
  babysitting the terminal, with hard wall-clock/watchdog bounds so environment
  hangs (disconnected device, stuck Gradle, hung npm, dead network) fail fast,
  notify humans, stop the stuck path, continue independent work when safe, and
  finish with an explicit run report.
implementation:
  repositories:
    - agent-on-rails-engine
    - agent-on-rails-agent-runtime
    - agent-on-rails-cli
    - agent-on-rails-github
verification:
  tests:
    - unit
    - integration
evidence_required:
  - test-results
  - implementation-pr
  - execution-log
  - review
---

# AOR-009 — Unattended AI Team Runtime

## Summary

Today `aor run` mostly packages context and hands off to an external coding agent. Humans still babysit the loop.

This spec closes that gap: the **engine** (with CLI/GitHub as surfaces) runs the AI Team state machine until the contract is satisfied or policy stops it:

```
             AOR (manager)
              │
              ▼
         IMPLEMENTOR
              │
              ▼
           REVIEWER
           /      \
        PASS       FAIL
         │          │
         │          ▼
         │        FIX (requeue implementor)
         │          │
         │          └──────► REVIEWER
         │                    │
         │              (AOR-006 bounds)
         ▼
      EVIDENCE
         │
         ▼
    FINAL_REVIEW  ← human only
         │
         ▼
        USER
```

Unattended does **not** mean unattended forever. Watchdog + escalation + **run report** are mandatory companions.

## Problem this solves (dogfood)

Real failures are often environmental, not coding:

- `gradlew` / install waiting because the Android device is disconnected
- Local web tooling: `npm` / `npm test` / `npm run build` hangs or never starts
- Agent appears “busy” for ~1 hour until a human notices
- Escalating to a better model does nothing useful

Unattended runtime must:

1. **Detect** stuckness (timeout / no heartbeat)
2. **Notify** the human promptly
3. **STOP** the stuck command/step
4. **Continue** independent work that does not need the blocked device or npm/test surface
5. **Report** at the end what passed, what was blocked, and what humans must fix

## Behavior

1. **Orchestrate** implementor and reviewer sessions per ADR-005 / AOR-005 without requiring the operator to manually chain `aor run` / `aor review` for each hop.
2. **Apply** AOR-006 on every reviewer fail / execution fail (failure class → retry / escalate / human).
3. **Enforce** [`policies/execution-watchdog.md`](../../policies/execution-watchdog.md) on every attempt: wall-clock, command timeouts (incl. npm/package install), heartbeats, preflight.
4. **Preflight** tool-/device-/network-dependent tasks before spending a model attempt (Node/npm present, device connected when required).
5. On env stuck / timeout:
   - cancel the stuck step
   - notify human immediately
   - mark step `blocked_environment`
   - **continue independent work** (other ready tasks / steps that do not depend on the blocked capability)
   - do **not** escalate `model_tier` for that failure
6. **Never** treat a skipped env-blocked verification as a green acceptance check.
7. **Never** auto-merge; human owns `FINAL_REVIEW → DONE`.
8. Persist orchestration log + **run report** suitable for evidence (AOR-007) and GitHub.

## Continue-independent + end report (normative)

```
npm hang / device wait / gradle stuck
              │
              ▼
         STOP step + notify
              │
              ├─► schedule ready tasks that don't need that capability
              │
              └─► when wave idle:
                    emit RUN REPORT
                    if blocking gaps remain → HUMAN_REQUIRED
                    else if acceptance satisfied → FINAL_REVIEW
```

Run report must list: completed, `blocked_environment`, skipped-due-to-deps, coding failures, human actions needed, notifications sent. See watchdog policy for the YAML shape.

## Manager responsibilities (minimal MVP)

| Decision | Input | Output |
| --- | --- | --- |
| Schedule next role | Task state, deps | Implementor or reviewer session |
| On pass | Review evidence | Evidence finalize → maybe more tasks → `FINAL_REVIEW` |
| On coding fail | Feedback + **failure signature** + history | AOR-006 verdict: `normal_progress` → continue; `forever_loop` → escalate / human |
| On env stuck / timeout | Watchdog event | Cancel step, notify, continue independent work, record block |
| On wave idle | Graph + blocks | Emit run report; `HUMAN_REQUIRED` and/or `FINAL_REVIEW` |
| On forever-loop cap / absolute max | Policy | `HUMAN_REQUIRED` |

## Acceptance intent

- Full fix/review loop can run without a human in the terminal
- Stuck env commands (device **or** npm/local tooling) cannot sit unsupervised past watchdog bounds
- Humans are notified on timeout/stuck, not only at the very end
- Independent work continues after a blocked env step when the task graph allows it
- Environment failures do not escalate model tier
- End-of-wave **run report** is always produced
- Forever-loops are impossible under default policy

## Depends on

- AOR-003 (task graph so “continue independent” is well-defined)
- AOR-004 (execution + structured results)
- AOR-005 (review loop)
- AOR-006 (escalation / forever-loop stop)
- AOR-007 (evidence + run report attachment)
- [`policies/execution-watchdog.md`](../../policies/execution-watchdog.md)

## Out of scope

- Replacing GitHub as the collaboration surface
- Proprietary coding agent (still headless adapters)
- Fully automatic repair of the operator’s machine (install Node, plug in device)
- Auto-merge or unsupervised production deploy
