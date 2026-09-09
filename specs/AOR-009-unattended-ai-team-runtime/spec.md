---
id: AOR-009
title: Unattended AI Team Runtime
status: approved
intent: >
  Operate the AI Team (implementor → reviewer → fix → escalate) without a human
  babysitting the terminal, with hard wall-clock/watchdog bounds so environment
  hangs (disconnected device, stuck Gradle, hung npm, dead network) fail fast,
  notify humans, stop the stuck path, continue independent work when safe, and
  finish with an explicit run report. Engine owns task/attempt state and exposes
  a shared CLI↔engine task API; HUMAN_REQUIRED is a wave-level conclusion for
  blocking environment gaps.
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
3. **Enforce** [`policies/execution-watchdog.md`](../../policies/execution-watchdog.md) on every attempt: wall-clock, command timeouts (incl. npm/package install), heartbeats, preflight, **specific-first command classification** (Gradle `test`/`build` before generic device).
4. **Preflight** tool-/device-/network-dependent tasks before spending a model attempt (Node/npm present, device connected when required).
5. On env stuck / timeout:
   - cancel the stuck step
   - notify human immediately
   - mark step `blocked_environment` (not immediate global `HUMAN_REQUIRED`)
   - **continue independent work** (other ready tasks / steps that do not depend on the blocked capability)
   - do **not** escalate `model_tier` for that failure
6. When the wave becomes idle:
   - emit the **run report**
   - if blocking acceptance remains → `HUMAN_REQUIRED`
   - else if acceptance satisfied → `FINAL_REVIEW`
7. **Never** treat a skipped env-blocked verification as a green acceptance check.
8. **Never** auto-merge; human owns `FINAL_REVIEW → DONE`.
9. Persist orchestration log + **run report** suitable for evidence (AOR-007) and GitHub.
10. Every implementor / fixer / reviewer hop **must** close with a standardized **role report** ([`policies/role-reports.md`](../../policies/role-reports.md)); the manager must not schedule the next hop on an assignment that lacks a valid report (except runtime-synthesized abort reports).

## CLI ↔ Engine task API (normative MVP)

CLI and engine **must** share one authoritative contract. With `AOR_ENGINE_URL` set, `aor run TASK-001` must not fail because task endpoints are missing.

### Bootstrap / registration

Tasks must be **registered** before (or as part of) the first run. Engine is the source of truth after registration.

```text
POST /v1/tasks                    # register / upsert task (bootstrap)
                                  # body MUST include: task_id, spec_id
                                  # body MAY include: title, deps[], repository, acceptance refs
                                  # idempotent on task_id (same spec_id → 200; conflicting spec_id → 409)
```

`aor run TASK-001` MAY call `POST /v1/tasks` then `POST /v1/tasks/{task_id}/run`, or a single CLI path that performs register-if-needed then run. Either way, the engine must end with a durable task record before orchestration starts.

### Runtime surface

```text
POST /v1/tasks/{task_id}/run      # start or resume orchestration for a registered task
                                  # 404 if task_id is unknown (do not invent state from the URL alone)
GET  /v1/tasks/{task_id}          # current authoritative task state
POST /v1/tasks/{task_id}/events   # report runtime/watchdog/role-report events
GET  /v1/tasks/{task_id}/history  # attempts, decisions, signatures
GET  /v1/tasks/{task_id}/report   # latest run report for this task’s wave scope (Phase 1)
```

Exact JSON field names may evolve in OpenAPI, but these routes (or equivalent versioned aliases) are required for Phase 1 coherence. `/v1/escalation/decide` may remain as an internal/library endpoint; it is **not** a substitute for task ownership.

## Engine-owned task state (normative)

The engine persists and owns at least:

```text
task_id
spec_id
attempt
current_role
current_model_tier
same_tier_retry_count
forever_loop_strikes
failure_signatures
reviewer findings
last decision
task state
timestamps
```

Desired flow:

```text
event arrives
   │
   ▼
engine loads task state
   │
   ▼
engine applies policy (AOR-006 / watchdog / manager)
   │
   ▼
engine persists decision + history
   │
   ▼
engine schedules next action (or idles → run report)
```

Callers **report events**; they must not reconstruct authoritative escalation counters.

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

### Run report contract (normative)

Every unattended wave must produce a durable **run report** humans can read without replaying agent logs. Schema: [`schemas/evidence.schema.json`](../../schemas/evidence.schema.json) (`run_report`) and [`policies/execution-watchdog.md`](../../policies/execution-watchdog.md).

**Schema `required` must match this list** (machine-enforceable). List fields MUST be present and MAY be empty arrays when nothing applies — omission is invalid.

| Field | Meaning |
| --- | --- |
| `spec_id` | Spec under orchestration |
| `terminal_status` | `final_review` \| `human_required` \| `in_progress` \| `done` |
| `completed` | Tasks that passed in this wave |
| `blocked_environment` | Env-cancelled steps with reason + notified |
| `skipped_due_to_deps` | Tasks waiting on blocked / unfinished deps |
| `coding_failures` | Tasks with coding fail history (attempts, last tier) |
| `human_actions_needed` | Explicit operator actions |
| `notifications_sent` | Channels / reasons already notified |

#### Phase 1 wave ownership

| Concern | Owner |
| --- | --- |
| Emit / persist RunReport | **Engine only** |
| Contribute events (watchdog cancel, role report, notify ack) | Runtime / CLI via `POST .../events` |
| Wave scope (Phase 1) | The orchestration opened by one `POST .../run` until that run is idle (task terminal, or blocked with nothing left to schedule for that task) |
| Multi-task aggregated wave | Phase 2+ Manager; Phase 1 may emit a **per-task** report that still includes every required field |

Runtime must not invent a wave report. CLI may display `GET .../report` but does not author it.

```yaml
run_report:
  spec_id: AOR-00N
  terminal_status: final_review | human_required | in_progress

  completed:
    - task_id: TASK-001
      result: pass

  blocked_environment:
    - task_id: TASK-002
      step: npm_test
      reason: npm_hang_timeout
      notified: true

  skipped_due_to_deps:
    - task_id: TASK-003
      waiting_on: TASK-002

  coding_failures:
    - task_id: TASK-004
      attempts: 2
      last_tier: 2

  human_actions_needed:
    - Fix Node/npm environment for TASK-002

  notifications_sent:
    - channel: github
      reason: env_stuck
```

## Manager responsibilities (minimal MVP)

| Decision | Input | Output |
| --- | --- | --- |
| Schedule next role | Task state, deps, prior **role report** | Implementor, fixer, or reviewer session |
| On pass | Reviewer role report `accepted` | Evidence finalize → maybe more tasks → `FINAL_REVIEW` |
| On coding fail | Reviewer/fixer role report + **failure signature** + history | AOR-006 verdict: `normal_progress` → continue; `forever_loop` → escalate / human (Option A ladder) |
| On env stuck / timeout | Watchdog event + role report `blocked_environment` | Cancel step, notify, continue independent work, record block — **do not** auto-set wave `HUMAN_REQUIRED` yet |
| On wave idle | Graph + blocks + role reports | Emit run report; `HUMAN_REQUIRED` if blocking gaps; else `FINAL_REVIEW` when acceptance satisfied |
| On forever-loop at max tier / strike ceiling / absolute max | Policy | `HUMAN_REQUIRED` |

## Phase 1 coherence slice (implementation-ready after APPROVED)

Control-plane + sibling repos must land this slice before treating runtime as production dogfood:

1. Fix Gradle watchdog classification (specific-first) — runtime
2. Align CLI ↔ Engine task API including bootstrap (`POST /v1/tasks`) — this section
3. Persistent engine task / attempt / history state (this section)
4. AOR-006 Option A cap semantics — already normative in AOR-006
5. Full RunReport fields + schema `required` alignment — **engine owns/emits**; Phase 1 wave = one `.../run` until idle

Phase 2+ (manager adapters, multi-repo graph, full integration suites) remains in scope of this spec’s acceptance but may ship after Phase 1 evidence for the coherence items.

## Acceptance intent

- Full fix/review loop can run without a human in the terminal
- Stuck env commands (device **or** npm/local tooling) cannot sit unsupervised past watchdog bounds
- Humans are notified on timeout/stuck, not only at the very end
- Independent work continues after a blocked env step when the task graph allows it
- Environment failures do not escalate model tier; `HUMAN_REQUIRED` is wave-level for blocking gaps
- End-of-wave **run report** always includes the normative required keys (schema-enforced; empty arrays OK)
- Engine is the sole RunReport author; CLI/runtime report events only
- Every role assignment ends with a standardized role report
- CLI and engine share the task API (register then run); engine owns history
- Forever-loops are impossible under default policy (AOR-006 Option A)

## Depends on

- AOR-003 (task graph so “continue independent” is well-defined)
- AOR-004 (execution + structured results)
- AOR-005 (review loop)
- AOR-006 (escalation / forever-loop stop — Option A)
- AOR-007 (evidence + run report attachment)
- [`policies/execution-watchdog.md`](../../policies/execution-watchdog.md)

## Out of scope

- Replacing GitHub as the collaboration surface
- Proprietary coding agent (still headless adapters)
- Fully automatic repair of the operator’s machine (install Node, plug in device)
- Auto-merge or unsupervised production deploy
